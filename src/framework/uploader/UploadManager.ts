// src/framework/uploader/UploadManager.ts - Core class for managing uploads across different adapters

import { v4 as uuidv4 } from "uuid";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  from,
  of,
  timer,
} from "rxjs";
import {
  finalize,
  switchMap,
  takeUntil,
  tap,
  retryWhen,
  delay,
  take,
  mergeMap,
  filter,
  map,
} from "rxjs/operators";
import {
  UploadID,
  UploadState,
  UploadConfig,
  UploadProgressInfo,
  AggregateUploadProgress,
  BatchUploadConfig,
  AdapterRegistration,
  QueuedUploadItem,
  PauseReason,
  ResumableUploadMetadata,
  UploadResponse,
} from "./types";
import { IUploadAdapter } from "./adapters/IUploadAdapter";
import { DiskTypeEnum } from "@officexapp/types";

/**
 * Manager for coordinating uploads across different adapters
 */
export class UploadManager {
  private adapters: Map<DiskTypeEnum, AdapterRegistration> = new Map();
  private uploadQueue: Map<UploadID, QueuedUploadItem> = new Map();
  private activeUploads: Map<UploadID, Subscription> = new Map();
  private uploadProgress$ = new BehaviorSubject<AggregateUploadProgress>(
    this.getEmptyProgressState()
  );
  private networkStatus$ = new BehaviorSubject<boolean>(navigator.onLine);
  private cancelUpload$ = new Subject<UploadID>();
  private pauseAllUploads$ = new Subject<PauseReason>();
  private resumeAllUploads$ = new Subject<void>();

  // Storage for resumable uploads
  private uploadStorage: Storage;
  private readonly STORAGE_KEY_PREFIX = "uploadmanager_";

  // Queue processing control
  private isProcessingQueue = false;
  private queueProcessingInterval: any = null;

  /**
   * Create a new UploadManager
   */
  constructor() {
    // Use localStorage for small metadata, actual chunks would be in IndexedDB
    this.uploadStorage = localStorage;

    // Setup network status monitoring
    window.addEventListener("online", () => {
      this.networkStatus$.next(true);
      this.handleNetworkReconnection();
    });

    window.addEventListener("offline", () => {
      this.networkStatus$.next(false);
      this.pauseAllUploads(PauseReason.NETWORK_DISCONNECTED);
    });

    // Setup visibility change monitoring
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        // Tab became visible again
        this.checkAndResumeUploads();
      } else {
        // Tab hidden - might be system sleep
        this.pauseAllUploads(PauseReason.TAB_HIDDEN);
      }
    });

    // Start queue processing
    this.startQueueProcessing();
  }

  /**
   * Register an upload adapter with the manager
   * @param adapter The adapter to register
   * @param diskType Storage type this adapter handles
   * @param config Configuration for the adapter
   * @param concurrency Maximum concurrent uploads for this adapter
   * @param priority Priority of this adapter (lower number = higher priority)
   * @returns Promise that resolves when adapter is initialized
   */
  public async registerAdapter(
    adapter: IUploadAdapter,
    diskType: DiskTypeEnum,
    config: any,
    concurrency: number = 3,
    priority: number = 0
  ): Promise<void> {
    // Initialize the adapter
    await adapter.initialize(config);

    // Register the adapter
    this.adapters.set(diskType, {
      adapter,
      diskType: diskType,
      concurrency,
      priority,
      enabled: true,
      config,
    });

    console.log(`Registered upload adapter for ${diskType}`);
  }

  /**
   * Upload a single file
   * @param file File to upload
   * @param uploadPath Path where the file should be stored
   * @param diskType Type of storage to use
   * @param options Additional upload options
   * @returns ID of the upload
   */
  public uploadFile(
    file: File,
    uploadPath: string,
    diskType: DiskTypeEnum,
    options: Partial<UploadConfig> = {}
  ): UploadID {
    // Generate a unique ID for this upload
    const id = (options.metadata?.id as UploadID) || (uuidv4() as UploadID);

    console.log(`Creating upload with ID: ${id} for file: ${file.name}`);

    const config: UploadConfig = {
      file,
      uploadPath,
      diskType: diskType,
      chunkSize: options.chunkSize,
      priority: options.priority || 0,
      // Make sure the ID is passed through the metadata
      metadata: {
        ...options.metadata,
        id: id,
      },
      onComplete: options.onComplete,
      retryLimit: options.retryLimit || 3,
      retryDelay: options.retryDelay || 1000,
      skipDuplicates: options.skipDuplicates,
    };

    // Create upload item and add to queue
    const uploadItem: QueuedUploadItem = {
      id,
      file,
      config,
      state: UploadState.QUEUED,
      addedAt: Date.now(),
      priority: config.priority || 0,
    };

    this.uploadQueue.set(id, uploadItem);

    // Update progress tracking
    this.updateProgressTracking();

    // Trigger queue processing
    this.processQueue();

    return id;
  }

  /**
   * Upload multiple files in a batch
   * @param files Array of files to upload
   * @param uploadPath Base path for uploads
   * @param diskType Storage type to use
   * @param options Batch upload options
   * @returns Array of upload IDs
   */
  public uploadFiles(
    files: File[],
    uploadPath: string,
    diskType: DiskTypeEnum,
    options: Partial<BatchUploadConfig> = {}
  ): UploadID[] {
    const ids: UploadID[] = [];

    for (const file of files) {
      const id = this.uploadFile(file, uploadPath, diskType, {
        ...options,
        onComplete: (uploadId) => {
          if (options.onFileComplete) {
            options.onFileComplete(uploadId);
          }

          // Check if all uploads are complete
          const allComplete = ids.every((id) => {
            const item = this.uploadQueue.get(id);
            return item && item.state === UploadState.COMPLETED;
          });

          if (allComplete && options.onAllComplete) {
            options.onAllComplete();
          }
        },
      });

      ids.push(id);
    }

    return ids;
  }

  /**
   * Pause an active upload
   * @param id ID of the upload to pause
   * @returns Promise that resolves to true if paused successfully
   */
  public async pauseUpload(id: UploadID): Promise<boolean> {
    const uploadItem = this.uploadQueue.get(id);
    if (!uploadItem) {
      console.warn(`Cannot pause upload ${id}: not found`);
      return false;
    }

    // If upload is active, pause it
    if (uploadItem.state === UploadState.ACTIVE) {
      // Cancel the current subscription
      const subscription = this.activeUploads.get(id);
      if (subscription) {
        subscription.unsubscribe();
        this.activeUploads.delete(id);
      }

      // Get the adapter for this upload
      const adapterReg = this.adapters.get(uploadItem.config.diskType);
      if (!adapterReg) {
        console.error(`No adapter found for ${uploadItem.config.diskType}`);
        return false;
      }

      try {
        // Call adapter's pause method
        const success = await adapterReg.adapter.pauseUpload(id);

        if (success) {
          // Update state
          uploadItem.state = UploadState.PAUSED;
          this.uploadQueue.set(id, uploadItem);

          // Save resumable state
          await this.saveResumableState(id);

          // Update progress tracking
          this.updateProgressTracking();

          return true;
        }

        return false;
      } catch (error) {
        console.error(`Error pausing upload ${id}:`, error);
        return false;
      }
    } else if (uploadItem.state === UploadState.QUEUED) {
      // If upload is queued, just mark it as paused
      uploadItem.state = UploadState.PAUSED;
      this.uploadQueue.set(id, uploadItem);
      this.updateProgressTracking();
      return true;
    }

    return false;
  }

  /**
   * Resume a paused upload
   * @param id ID of the upload to resume
   * @param file File reference (required for cross-session resume)
   * @returns Promise that resolves to true if resumed successfully
   */
  public async resumeUpload(id: UploadID, file?: File): Promise<boolean> {
    const uploadItem = this.uploadQueue.get(id);
    let uploadFile = file;

    if (!uploadItem) {
      // Check if this is a previously saved upload from another session
      const savedData = await this.getResumableState(id);
      if (!savedData) {
        console.warn(`Cannot resume upload ${id}: not found`);
        return false;
      }

      if (!file) {
        console.warn(
          `File reference required to resume upload ${id} from a previous session`
        );
        return false;
      }

      // Recreate the upload item from saved state
      const config: UploadConfig = {
        file,
        uploadPath: savedData.uploadPath,
        diskType: savedData.diskType,
        chunkSize: savedData.chunkSize,
        metadata: savedData.customMetadata,
      };

      const newUploadItem: QueuedUploadItem = {
        id,
        file,
        config,
        state: UploadState.PAUSED,
        addedAt: savedData.uploadStartTime,
        priority: 0,
        resumeData: savedData,
      };

      this.uploadQueue.set(id, newUploadItem);
    } else if (uploadItem.state !== UploadState.PAUSED) {
      console.warn(`Cannot resume upload ${id}: not paused`);
      return false;
    } else {
      uploadFile = uploadItem.file;
    }

    // Get the item (either existing or newly created)
    const item = this.uploadQueue.get(id)!;

    // Set state to queued to allow the queue processor to pick it up
    item.state = UploadState.QUEUED;
    this.uploadQueue.set(id, item);

    // Update progress tracking
    this.updateProgressTracking();

    // Trigger queue processing
    this.processQueue();

    return true;
  }

  /**
   * Cancel an upload
   * @param id ID of the upload to cancel
   * @returns Promise that resolves to true if cancelled successfully
   */
  public async cancelUpload(id: UploadID): Promise<boolean> {
    const uploadItem = this.uploadQueue.get(id);
    if (!uploadItem) {
      console.warn(`Cannot cancel upload ${id}: not found`);
      return false;
    }

    // If upload is active, cancel it
    if (uploadItem.state === UploadState.ACTIVE) {
      // Emit to the cancel subject
      this.cancelUpload$.next(id);

      // Get the adapter for this upload
      const adapterReg = this.adapters.get(uploadItem.config.diskType);
      if (!adapterReg) {
        console.error(`No adapter found for ${uploadItem.config.diskType}`);
        return false;
      }

      try {
        // Call adapter's cancel method
        const success = await adapterReg.adapter.cancelUpload(id);

        if (success) {
          // Update state
          uploadItem.state = UploadState.CANCELLED;
          this.uploadQueue.set(id, uploadItem);

          // Remove from active uploads
          this.activeUploads.delete(id);

          // Remove resumable state
          this.removeResumableState(id);

          // Update progress tracking
          this.updateProgressTracking();

          return true;
        }

        return false;
      } catch (error) {
        console.error(`Error cancelling upload ${id}:`, error);
        return false;
      }
    } else {
      // If upload is not active, just mark it as cancelled
      uploadItem.state = UploadState.CANCELLED;
      this.uploadQueue.set(id, uploadItem);

      // Remove resumable state
      this.removeResumableState(id);

      // Update progress tracking
      this.updateProgressTracking();

      return true;
    }
  }

  /**
   * Pause all active uploads
   * @param reason Reason for pausing
   */
  public pauseAllUploads(reason: PauseReason): void {
    // Emit to pauseAllUploads$ subject
    this.pauseAllUploads$.next(reason);

    // Pause each active upload
    for (const [id, item] of this.uploadQueue.entries()) {
      if (item.state === UploadState.ACTIVE) {
        this.pauseUpload(id);
      }
    }
  }

  /**
   * Resume all paused uploads
   */
  public resumeAllUploads(): void {
    // Emit to resumeAllUploads$ subject
    this.resumeAllUploads$.next();

    // Resume each paused upload
    for (const [id, item] of this.uploadQueue.entries()) {
      if (item.state === UploadState.PAUSED) {
        this.resumeUpload(id, item.file);
      }
    }
  }

  /**
   * Get progress for all uploads
   * @returns Observable that emits progress updates
   */
  public getProgress(): Observable<AggregateUploadProgress> {
    return this.uploadProgress$.asObservable();
  }

  /**
   * Get progress for a specific upload
   * @param id Upload ID
   * @returns Observable that emits progress updates for the specified upload
   */
  public getUploadProgress(
    id: UploadID
  ): Observable<UploadProgressInfo | null> {
    return this.uploadProgress$.pipe(
      map((progress) => {
        // First check active uploads
        const active = progress.currentlyUploading.find((u) => u.id === id);
        if (active) return active;

        // Then check the queue for non-active uploads
        const queued = this.uploadQueue.get(id);
        if (!queued) return null;

        // Convert QueuedUploadItem to UploadProgressInfo
        return {
          id: queued.id,
          fileName: queued.file.name,
          state: queued.state,
          progress: queued.state === UploadState.COMPLETED ? 100 : 0,
          bytesUploaded:
            queued.state === UploadState.COMPLETED ? queued.file.size : 0,
          bytesTotal: queued.file.size,
          startTime: queued.startedAt || queued.addedAt,
          diskType: queued.config.diskType,
          uploadPath: queued.config.uploadPath,
        };
      })
    );
  }

  /**
   * Clear completed, cancelled, and failed uploads from the queue
   */
  public clearFinishedUploads(): void {
    for (const [id, item] of this.uploadQueue.entries()) {
      if (
        item.state === UploadState.COMPLETED ||
        item.state === UploadState.CANCELLED ||
        item.state === UploadState.FAILED
      ) {
        this.uploadQueue.delete(id);
      }
    }

    // Update progress tracking
    this.updateProgressTracking();
  }

  /**
   * Check if any uploads are in progress
   * @returns True if any uploads are active
   */
  public hasActiveUploads(): boolean {
    for (const item of this.uploadQueue.values()) {
      if (item.state === UploadState.ACTIVE) {
        return true;
      }
    }
    return false;
  }

  /**
   * Cleanup and dispose of the UploadManager
   */
  public dispose(): void {
    // Cancel all active uploads
    for (const [id, subscription] of this.activeUploads.entries()) {
      subscription.unsubscribe();
      this.cancelUpload(id);
    }

    // Clear the queue
    this.uploadQueue.clear();

    // Stop queue processing
    if (this.queueProcessingInterval) {
      clearInterval(this.queueProcessingInterval);
    }

    // Complete all subjects
    this.uploadProgress$.complete();
    this.networkStatus$.complete();
    this.cancelUpload$.complete();
    this.pauseAllUploads$.complete();
    this.resumeAllUploads$.complete();
  }

  /**
   * Retrieve a list of all uploads and their current status
   */
  public getUploads(): QueuedUploadItem[] {
    return Array.from(this.uploadQueue.values());
  }

  /**
   * Get information about available upload adapters
   */
  public getRegisteredAdapters(): AdapterRegistration[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Process the upload queue
   */
  private processQueue(): void {
    if (this.isProcessingQueue) return;

    this.isProcessingQueue = true;

    try {
      // Group uploads by adapter/storage type
      const uploadsByType = this.groupQueuedUploadsByType();

      // For each adapter
      for (const [diskType, uploads] of uploadsByType.entries()) {
        const adapterReg = this.adapters.get(diskType);
        if (!adapterReg || !adapterReg.enabled) continue;

        // Count existing active uploads for this adapter
        const activeCount = Array.from(this.activeUploads.entries()).filter(
          ([id, _]) => {
            const upload = this.uploadQueue.get(id);
            return upload && upload.config.diskType === diskType;
          }
        ).length;

        // Calculate how many more uploads can be started
        const availableSlots = Math.max(
          0,
          adapterReg.concurrency - activeCount
        );

        // Start uploads if slots are available
        if (availableSlots > 0) {
          // Sort uploads by priority (higher first) and then by added time (older first)
          uploads.sort((a, b) => {
            if (a.priority !== b.priority) {
              return b.priority - a.priority; // Higher priority first
            }
            return a.addedAt - b.addedAt; // Older first
          });

          // Start uploads up to available slots
          for (let i = 0; i < Math.min(availableSlots, uploads.length); i++) {
            const upload = uploads[i];
            this.startUpload(upload.id);
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Start queue processing on an interval
   */
  private startQueueProcessing(): void {
    // Process queue every 500ms
    this.queueProcessingInterval = setInterval(() => {
      this.processQueue();
    }, 500);
  }

  /**
   * Start a specific upload
   */
  private startUpload(id: UploadID): void {
    const uploadItem = this.uploadQueue.get(id);
    if (!uploadItem || uploadItem.state !== UploadState.QUEUED) {
      return;
    }

    // Get the adapter for this upload
    const adapterReg = this.adapters.get(uploadItem.config.diskType);
    if (!adapterReg) {
      console.error(`No adapter found for ${uploadItem.config.diskType}`);
      uploadItem.state = UploadState.FAILED;
      uploadItem.error = new Error(
        `No adapter found for ${uploadItem.config.diskType}`
      );
      this.uploadQueue.set(id, uploadItem);
      this.updateProgressTracking();
      return;
    }

    // Update state
    uploadItem.state = UploadState.ACTIVE;
    uploadItem.startedAt = Date.now();
    this.uploadQueue.set(id, uploadItem);

    // Define cancellation signal
    const cancelSignal$ = this.cancelUpload$.pipe(
      filter((cancelId) => cancelId === id)
    );

    // Define pause signal
    const pauseSignal$ = this.pauseAllUploads$.pipe(
      tap((reason) => {
        console.log(`Pausing upload ${id} due to ${reason}`);
      })
    );

    // Observable to handle upload
    let uploadObservable: Observable<UploadProgressInfo>;

    // Check if this is a resume operation
    if (uploadItem.resumeData) {
      // Resume the upload
      uploadObservable = adapterReg.adapter.resumeUpload(id, uploadItem.file);
    } else {
      // Start a new upload
      uploadObservable = adapterReg.adapter.uploadFile(
        uploadItem.file,
        uploadItem.config
      );
    }

    // Setup retry logic
    const retryObservable = uploadObservable.pipe(
      retryWhen((errors) =>
        errors.pipe(
          // Log the error
          tap((error) => {
            console.warn(`Upload ${id} error, will retry:`, error);
            // Update retry count
            const item = this.uploadQueue.get(id);
            if (item) {
              item.retryCount = (item.retryCount || 0) + 1;
              this.uploadQueue.set(id, item);
            }
          }),
          // Limit retries
          take(uploadItem.config.retryLimit || 3),
          // Add delay between retries
          delay(uploadItem.config.retryDelay || 1000),
          // Check network connectivity before retry
          switchMap(() => {
            if (this.networkStatus$.value) {
              return of(null); // Network is online, proceed with retry
            } else {
              // Network is offline, wait for it to come back
              return this.networkStatus$.pipe(
                filter((online) => online),
                take(1)
              );
            }
          })
        )
      )
    );

    // Subscribe to the upload observable
    const subscription = retryObservable
      .pipe(
        // Stop on cancellation or global pause
        takeUntil(cancelSignal$),
        takeUntil(pauseSignal$),
        // Finalize to handle completion or errors
        finalize(() => {
          // Check if upload was cancelled or paused
          const finalItem = this.uploadQueue.get(id);
          if (finalItem && finalItem.state === UploadState.ACTIVE) {
            // Upload completed naturally or failed without retry
            this.handleUploadCompletion(id);
          }

          // Remove from active uploads
          this.activeUploads.delete(id);

          // Process queue to start next upload
          this.processQueue();
        })
      )
      .subscribe({
        next: (progress) => {
          // Update progress tracking
          this.updateItemProgress(id, progress);
        },
        error: (error) => {
          console.error(`Upload ${id} failed:`, error);

          // Update state
          const item = this.uploadQueue.get(id);
          if (item) {
            item.state = UploadState.FAILED;
            item.error = error;
            this.uploadQueue.set(id, item);
            this.updateProgressTracking();
          }
        },
      });

    // Store the subscription
    this.activeUploads.set(id, subscription);

    // Update progress tracking
    this.updateProgressTracking();
  }

  /**
   * Handle upload completion
   */
  private handleUploadCompletion(id: UploadID): void {
    const item = this.uploadQueue.get(id);
    if (!item) return;

    // Update state
    item.state = UploadState.COMPLETED;
    item.completedAt = Date.now();
    this.uploadQueue.set(id, item);

    // Clean up resumable state
    this.removeResumableState(id);

    // Update progress tracking
    this.updateProgressTracking();

    // Trigger onComplete callback if provided
    if (item.config.onComplete) {
      item.config.onComplete(id);
    }
  }

  /**
   * Update progress tracking for an item
   */
  private updateItemProgress(id: UploadID, progress: UploadProgressInfo): void {
    const item = this.uploadQueue.get(id);
    if (!item) return;

    // Store latest progress in the queue item
    item.lastProgress = progress;
    this.uploadQueue.set(id, item);

    // Update overall progress tracking
    this.updateProgressTracking();
  }

  /**
   * Update overall progress tracking
   */
  private updateProgressTracking(): void {
    const progress = this.calculateOverallProgress();
    this.uploadProgress$.next(progress);
  }

  /**
   * Calculate overall progress
   */
  private calculateOverallProgress(): AggregateUploadProgress {
    const result: AggregateUploadProgress = this.getEmptyProgressState();

    let totalBytes = 0;
    let uploadedBytes = 0;
    const currentlyUploading: UploadProgressInfo[] = [];

    // Count uploads by state
    for (const item of this.uploadQueue.values()) {
      // Total file count
      result.totalFiles++;

      // Count by state
      switch (item.state) {
        case UploadState.ACTIVE:
          result.activeFiles++;
          break;
        case UploadState.COMPLETED:
          result.completedFiles++;
          break;
        case UploadState.PAUSED:
          result.pausedFiles++;
          break;
        case UploadState.FAILED:
          result.failedFiles++;
          break;
        case UploadState.CANCELLED:
          result.cancelledFiles++;
          break;
        case UploadState.QUEUED:
          result.queuedFiles++;
          break;
      }

      // Calculate bytes
      totalBytes += item.file.size;

      if (item.state === UploadState.COMPLETED) {
        uploadedBytes += item.file.size;
      } else if (item.state === UploadState.ACTIVE && item.lastProgress) {
        uploadedBytes += item.lastProgress.bytesUploaded;

        // Add to currently uploading list
        currentlyUploading.push(item.lastProgress);
      }
    }

    // Calculate overall progress
    if (totalBytes > 0) {
      result.overallProgress = Math.round((uploadedBytes / totalBytes) * 100);
    }

    result.currentlyUploading = currentlyUploading;

    return result;
  }

  /**
   * Get empty progress state
   */
  private getEmptyProgressState(): AggregateUploadProgress {
    return {
      totalFiles: 0,
      activeFiles: 0,
      completedFiles: 0,
      pausedFiles: 0,
      failedFiles: 0,
      cancelledFiles: 0,
      queuedFiles: 0,
      overallProgress: 0,
      currentlyUploading: [],
    };
  }

  /**
   * Group queued uploads by storage type
   */
  private groupQueuedUploadsByType(): Map<DiskTypeEnum, QueuedUploadItem[]> {
    const result = new Map<DiskTypeEnum, QueuedUploadItem[]>();

    for (const item of this.uploadQueue.values()) {
      if (item.state !== UploadState.QUEUED) continue;

      const diskType = item.config.diskType;
      if (!result.has(diskType)) {
        result.set(diskType, []);
      }

      result.get(diskType)!.push(item);
    }

    return result;
  }

  /**
   * Save resumable state for an upload
   */
  private async saveResumableState(id: UploadID): Promise<void> {
    try {
      const item = this.uploadQueue.get(id);
      if (!item) return;

      // Get adapter to retrieve resumable metadata
      const adapterReg = this.adapters.get(item.config.diskType);
      if (!adapterReg) return;

      // Get resumable metadata from adapter
      const metadata = await adapterReg.adapter.getResumableUploadMetadata(id);
      if (!metadata) return;

      // Store in localStorage (with expiration handling)
      const storageKey = `${this.STORAGE_KEY_PREFIX}${id}`;
      this.uploadStorage.setItem(
        storageKey,
        JSON.stringify({
          ...metadata,
          savedAt: Date.now(),
          // Add expiration (7 days)
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        })
      );
    } catch (error) {
      console.error(`Error saving resumable state for upload ${id}:`, error);
    }
  }

  /**
   * Get resumable state for an upload
   */
  private async getResumableState(
    id: UploadID
  ): Promise<ResumableUploadMetadata | null> {
    try {
      const storageKey = `${this.STORAGE_KEY_PREFIX}${id}`;
      const savedState = this.uploadStorage.getItem(storageKey);

      if (!savedState) return null;

      const data = JSON.parse(savedState);

      // Check if expired
      if (data.expiresAt && data.expiresAt < Date.now()) {
        // Expired, remove it
        this.uploadStorage.removeItem(storageKey);
        return null;
      }

      return data as ResumableUploadMetadata;
    } catch (error) {
      console.error(`Error getting resumable state for upload ${id}:`, error);
      return null;
    }
  }

  /**
   * Remove resumable state for an upload
   */
  private removeResumableState(id: UploadID): void {
    try {
      const storageKey = `${this.STORAGE_KEY_PREFIX}${id}`;
      this.uploadStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error removing resumable state for upload ${id}:`, error);
    }
  }

  /**
   * Handle network reconnection
   */
  private handleNetworkReconnection(): void {
    // Check if we should resume uploads
    this.checkAndResumeUploads();
  }

  /**
   * Check and resume uploads if conditions are right
   */
  private checkAndResumeUploads(): void {
    // Only resume if we're online and the tab is visible
    if (!this.networkStatus$.value || document.visibilityState !== "visible") {
      return;
    }

    // Resume uploads that were paused due to network or visibility
    for (const [id, item] of this.uploadQueue.entries()) {
      if (item.state === UploadState.PAUSED && item.pauseReason) {
        if (
          item.pauseReason === PauseReason.NETWORK_DISCONNECTED ||
          item.pauseReason === PauseReason.TAB_HIDDEN
        ) {
          // Resume this upload
          this.resumeUpload(id, item.file);
        }
      }
    }
  }

  /**
   * Check for cross-session resumable uploads
   * Called during initialization to restore uploads from previous sessions
   */
  public async checkForPreviousUploads(): Promise<ResumableUploadMetadata[]> {
    const resumableUploads: ResumableUploadMetadata[] = [];

    try {
      // Scan localStorage for upload entries
      for (let i = 0; i < this.uploadStorage.length; i++) {
        const key = this.uploadStorage.key(i);

        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const id = key.substring(this.STORAGE_KEY_PREFIX.length);
          const savedState = await this.getResumableState(id);

          if (savedState) {
            resumableUploads.push(savedState);
          }
        }
      }
    } catch (error) {
      console.error("Error checking for previous uploads:", error);
    }

    return resumableUploads;
  }

  /**
   * Clean up expired upload states
   */
  public async cleanupExpiredUploads(): Promise<void> {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      // Scan localStorage for expired upload entries
      for (let i = 0; i < this.uploadStorage.length; i++) {
        const key = this.uploadStorage.key(i);

        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const savedState = this.uploadStorage.getItem(key);

          if (savedState) {
            try {
              const data = JSON.parse(savedState);
              if (data.expiresAt && data.expiresAt < now) {
                keysToRemove.push(key);
              }
            } catch (e) {
              // Invalid JSON, remove it
              keysToRemove.push(key);
            }
          }
        }
      }

      // Remove expired entries
      for (const key of keysToRemove) {
        this.uploadStorage.removeItem(key);
      }

      console.log(`Cleaned up ${keysToRemove.length} expired upload states`);
    } catch (error) {
      console.error("Error cleaning up expired uploads:", error);
    }
  }

  /**
   * Get URL for an uploaded file
   * @param id Upload ID
   * @returns Promise that resolves to URL string or null
   */
  public async getFileUrl(id: UploadID): Promise<string | null> {
    const uploadItem = this.uploadQueue.get(id);
    if (!uploadItem) {
      // Check if this was a previous upload
      const savedState = await this.getResumableState(id);
      if (!savedState) {
        return null;
      }

      // Get the adapter for this storage type
      const adapterReg = this.adapters.get(savedState.diskType);
      if (!adapterReg) {
        return null;
      }

      return adapterReg.adapter.getFileUrl(id);
    }

    // Get the adapter for this upload
    const adapterReg = this.adapters.get(uploadItem.config.diskType);
    if (!adapterReg) {
      return null;
    }

    return adapterReg.adapter.getFileUrl(id);
  }

  /**
   * Import completed uploads for tracking
   * Used to register uploads that were completed outside this manager
   * @param response Response metadata from a completed upload
   */
  public importCompletedUpload(response: UploadResponse): UploadID {
    const id = response.id;

    // Create a placeholder file object
    const file = new File([], response.fileName, {
      type: "application/octet-stream",
      lastModified: response.uploadEndTime,
    });

    // Create an upload item
    const uploadItem: QueuedUploadItem = {
      id,
      file,
      config: {
        file,
        uploadPath: response.uploadPath,
        diskType: response.diskType,
      },
      state: UploadState.COMPLETED,
      addedAt: response.uploadStartTime,
      priority: 0,
      startedAt: response.uploadStartTime,
      completedAt: response.uploadEndTime,
    };

    // Add to queue
    this.uploadQueue.set(id, uploadItem);

    // Update progress tracking
    this.updateProgressTracking();

    return id;
  }
}
