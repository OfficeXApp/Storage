// src/framework/uploader/adapters/indexdb.adapter.ts
import { Observable, Subject, from, of } from "rxjs";
import { map, catchError, tap, finalize } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";
import {
  UploadID,
  UploadProgressInfo,
  UploadConfig,
  UploadState,
  AdapterFeatures,
  IndexDBAdapterConfig,
  ResumableUploadMetadata,
} from "../types";
import { IUploadAdapter } from "./IUploadAdapter";
import { DiskTypeEnum } from "@officexapp/types";

/**
 * Adapter for uploading files to IndexedDB
 */
export class IndexedDBAdapter implements IUploadAdapter {
  private db: IDBDatabase | null = null;
  private DB_NAME: string;
  private FILES_STORE_NAME: string;
  private readonly CHUNKS_STORE_NAME: string;
  private readonly METADATA_STORE_NAME: string;

  // Store active uploads for pause/resume/cancel
  private activeUploads: Map<
    UploadID,
    {
      controller: AbortController;
      progress: Subject<UploadProgressInfo>;
    }
  > = new Map();

  constructor(config?: IndexDBAdapterConfig) {
    this.DB_NAME = config?.databaseName || "officex-storage";
    this.FILES_STORE_NAME = config?.objectStoreName || "files";
    this.CHUNKS_STORE_NAME = "file_chunks";
    this.METADATA_STORE_NAME = "file_metadata";
  }

  /**
   * Initialize the IndexedDB adapter
   */
  public async initialize(config?: IndexDBAdapterConfig): Promise<void> {
    if (this.db) {
      console.log("IndexedDBAdapter already initialized");
      return;
    }

    if (config) {
      this.DB_NAME = config.databaseName || this.DB_NAME;
      this.FILES_STORE_NAME = config.objectStoreName || this.FILES_STORE_NAME;
    }

    console.log(`Initializing IndexedDB adapter with:
      - Database: ${this.DB_NAME}
      - Files store: ${this.FILES_STORE_NAME}
      - Chunks store: ${this.CHUNKS_STORE_NAME}
      - Metadata store: ${this.METADATA_STORE_NAME}
    `);

    return new Promise((resolve, reject) => {
      try {
        // Open database with specific version (1) to ensure onupgradeneeded is called
        // if the database doesn't exist
        const request = indexedDB.open(this.DB_NAME, 1);

        request.onerror = (event) => {
          const error = (event.target as IDBOpenDBRequest).error;
          console.error("Error opening IndexedDB:", error);

          if (error?.name === "QuotaExceededError") {
            reject(new Error("STORAGE_QUOTA_EXCEEDED"));
          } else if (/^Access is denied/.test(error?.message || "")) {
            reject(new Error("PRIVATE_MODE_NOT_SUPPORTED"));
          } else {
            reject(
              new Error(
                `INDEXEDDB_INITIALIZATION_FAILED: ${error?.message || "Unknown error"}`
              )
            );
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          console.log("IndexedDB opened successfully");

          // Log existing stores for debugging
          console.log(
            "Available object stores:",
            Array.from(this.db.objectStoreNames)
          );

          // Check if all required stores exist
          const requiredStores = [
            this.FILES_STORE_NAME,
            this.CHUNKS_STORE_NAME,
            this.METADATA_STORE_NAME,
          ];

          const missingStores = requiredStores.filter(
            (store) => !this.db!.objectStoreNames.contains(store)
          );

          if (missingStores.length > 0) {
            console.error(
              `Missing required object stores: ${missingStores.join(", ")}`
            );
            this.db.close();

            // Need to create missing stores - increment version and reopen
            const reopenRequest = indexedDB.open(
              this.DB_NAME,
              this.db.version + 1
            );

            reopenRequest.onupgradeneeded = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              console.log("Creating missing object stores");

              // Create missing stores
              for (const storeName of missingStores) {
                if (!db.objectStoreNames.contains(storeName)) {
                  console.log(`Creating object store: ${storeName}`);
                  db.createObjectStore(storeName, { keyPath: "id" });
                }
              }
            };

            reopenRequest.onsuccess = (event) => {
              this.db = (event.target as IDBOpenDBRequest).result;
              console.log("IndexedDB reopened with all required stores");
              console.log(
                "Available object stores:",
                Array.from(this.db.objectStoreNames)
              );
              resolve();
            };

            reopenRequest.onerror = (event) => {
              const error = (event.target as IDBOpenDBRequest).error;
              console.error("Error reopening IndexedDB:", error);
              reject(
                new Error(
                  `Failed to create object stores: ${error?.message || "Unknown error"}`
                )
              );
            };
          } else {
            // All required stores exist
            console.log("All required object stores found");
            resolve();
          }
        };

        request.onupgradeneeded = (event) => {
          console.log("Upgrading IndexedDB database structure");
          const db = (event.target as IDBOpenDBRequest).result;

          // Create stores if they don't exist
          if (!db.objectStoreNames.contains(this.FILES_STORE_NAME)) {
            console.log(`Creating object store: ${this.FILES_STORE_NAME}`);
            db.createObjectStore(this.FILES_STORE_NAME, { keyPath: "id" });
          }

          if (!db.objectStoreNames.contains(this.CHUNKS_STORE_NAME)) {
            console.log(`Creating object store: ${this.CHUNKS_STORE_NAME}`);
            db.createObjectStore(this.CHUNKS_STORE_NAME, { keyPath: "id" });
          }

          if (!db.objectStoreNames.contains(this.METADATA_STORE_NAME)) {
            console.log(`Creating object store: ${this.METADATA_STORE_NAME}`);
            db.createObjectStore(this.METADATA_STORE_NAME, { keyPath: "id" });
          }
        };
      } catch (error) {
        console.error(
          "Unexpected error during IndexedDB initialization:",
          error
        );
        reject(error);
      }
    });
  }

  /**
   * Upload a file to IndexedDB
   */
  public uploadFile(
    file: File,
    config: UploadConfig
  ): Observable<UploadProgressInfo> {
    if (!this.db) {
      return of({
        id: config.file.name as UploadID,
        fileName: config.file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: config.file.size,
        startTime: Date.now(),
        diskType: config.diskType,
        errorMessage: "IndexedDB not initialized",
        uploadPath: config.uploadPath,
      }).pipe(
        tap(() => {
          console.error("IndexedDB not initialized");
        })
      );
    }

    // Generate upload ID if not provided
    const uploadId =
      (config.metadata?.id as UploadID) || (uuidv4() as UploadID);

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Save to active uploads
    this.activeUploads.set(uploadId, { controller, progress });

    // Define chunk size - default to 1MB or use config value
    const chunkSize = config.chunkSize || 1024 * 1024;

    // Start upload process
    this.processUpload(
      uploadId,
      file,
      config,
      progress,
      controller.signal,
      chunkSize
    );

    // Return observable
    return progress.asObservable().pipe(
      finalize(() => {
        // Clean up when observable completes or errors
        this.activeUploads.delete(uploadId);
      })
    );
  }

  /**
   * Process the upload with chunking
   */
  private processUpload(
    uploadId: UploadID,
    file: File,
    config: UploadConfig,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal,
    chunkSize: number
  ): void {
    // Calculate total chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let chunksUploaded = 0;
    let bytesUploaded = 0;
    const startTime = Date.now();

    // Store metadata for resume capability
    const metadata: ResumableUploadMetadata = {
      id: uploadId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileLastModified: file.lastModified,
      uploadStartTime: startTime,
      lastUpdateTime: startTime,
      diskType: config.diskType,
      uploadedChunks: [],
      totalChunks,
      chunkSize,
      uploadPath: config.uploadPath,
      customMetadata: config.metadata,
    };

    // Save initial metadata
    this.saveMetadata(metadata);

    // Function to read and store a chunk
    const processChunk = async (chunkIndex: number) => {
      if (signal.aborted) {
        progressSubject.error(new Error("Upload cancelled"));
        return;
      }

      // Calculate chunk boundaries
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      try {
        // Store the chunk
        await this.storeChunk(uploadId, chunkIndex, chunk);

        // Update progress
        chunksUploaded++;
        bytesUploaded += end - start;
        metadata.uploadedChunks.push(chunkIndex);
        metadata.lastUpdateTime = Date.now();

        // Update metadata for resume capability
        await this.saveMetadata(metadata);

        // Emit progress
        const progress: UploadProgressInfo = {
          id: uploadId,
          fileName: file.name,
          state:
            chunksUploaded === totalChunks
              ? UploadState.COMPLETED
              : UploadState.ACTIVE,
          progress: Math.floor((bytesUploaded / file.size) * 100),
          bytesUploaded,
          bytesTotal: file.size,
          startTime,
          diskType: config.diskType,
          uploadPath: config.uploadPath,
        };

        progressSubject.next(progress);

        // If all chunks uploaded, finalize
        if (chunksUploaded === totalChunks) {
          await this.finalizeUpload(uploadId, file, config);
          progressSubject.complete();
        } else {
          // Process next chunk
          processChunk(chunkIndex + 1);
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        progressSubject.error(error);
      }
    };

    // Start with first chunk
    processChunk(0);
  }

  /**
   * Store a chunk in IndexedDB
   */
  private storeChunk(
    uploadId: UploadID,
    chunkIndex: number,
    chunkBlob: Blob
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        [this.CHUNKS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.CHUNKS_STORE_NAME);

      // Convert blob to array buffer
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const chunkData = e.target?.result as ArrayBuffer;
          const request = store.put({
            id: `${uploadId}_chunk_${chunkIndex}`,
            uploadId,
            chunkIndex,
            data: new Uint8Array(chunkData),
            timestamp: Date.now(),
          });

          request.onsuccess = () => resolve();
          request.onerror = () => reject(new Error("Failed to store chunk"));
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read chunk"));
      reader.readAsArrayBuffer(chunkBlob);
    });
  }

  /**
   * Save upload metadata
   */
  private saveMetadata(metadata: ResumableUploadMetadata): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        [this.METADATA_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.METADATA_STORE_NAME);

      const request = store.put({
        ...metadata,
        id: metadata.id,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save metadata"));
    });
  }

  /**
   * Finalize the upload by saving file metadata
   */
  private finalizeUpload(
    uploadId: UploadID,
    file: File,
    config: UploadConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        [this.FILES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.FILES_STORE_NAME);

      const fileData = {
        id: uploadId,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        uploadPath: config.uploadPath,
        uploadComplete: true,
        uploadCompletedAt: Date.now(),
        metadata: config.metadata || {},
      };

      const request = store.put(fileData);

      request.onsuccess = () => {
        // Generate thumbnail if it's an image
        if (file.type.startsWith("image/")) {
          this.generateThumbnail(uploadId, file)
            .catch((err) => console.warn("Failed to generate thumbnail:", err))
            .finally(() => resolve());
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error("Failed to save file metadata"));
    });
  }

  /**
   * Generate a thumbnail for image files
   */
  private async generateThumbnail(
    uploadId: UploadID,
    file: File
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 256;
      canvas.height = 256;

      img.onload = () => {
        try {
          // Calculate aspect ratio
          const aspectRatio = img.width / img.height;
          let drawWidth, drawHeight, startX, startY;

          if (aspectRatio > 1) {
            // Landscape
            drawHeight = 256;
            drawWidth = drawHeight * aspectRatio;
            startX = (drawWidth - 256) / 2;
            startY = 0;
          } else {
            // Portrait
            drawWidth = 256;
            drawHeight = drawWidth / aspectRatio;
            startX = 0;
            startY = (drawHeight - 256) / 2;
          }

          // Draw image
          ctx?.drawImage(img, -startX, -startY, drawWidth, drawHeight);

          // Get thumbnail data
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Failed to create thumbnail blob"));
              return;
            }

            // Save thumbnail
            const transaction = this.db!.transaction(
              [this.FILES_STORE_NAME],
              "readwrite"
            );
            const store = transaction.objectStore(this.FILES_STORE_NAME);

            const request = store.put({
              id: `${uploadId}_thumbnail`,
              uploadId,
              thumbnail: blob,
              timestamp: Date.now(),
            });

            request.onsuccess = () => resolve();
            request.onerror = () =>
              reject(new Error("Failed to save thumbnail"));
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Pause an active upload
   */
  public async pauseUpload(id: UploadID): Promise<boolean> {
    const upload = this.activeUploads.get(id);
    if (!upload) {
      console.warn(`Cannot pause upload ${id}: not found or not active`);
      return false;
    }

    // Abort the current upload process
    upload.controller.abort();
    this.activeUploads.delete(id);

    // Return success
    return true;
  }

  /**
   * Resume a paused upload
   */
  public resumeUpload(
    id: UploadID,
    file: File
  ): Observable<UploadProgressInfo> {
    if (!this.db) {
      return of({
        id: id,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime: Date.now(),
        diskType: DiskTypeEnum.BrowserCache,
        errorMessage: "IndexedDB not initialized",
        uploadPath: "",
      }).pipe(
        tap(() => {
          console.error("IndexedDB not initialized");
        })
      );
    }

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Get existing metadata
    this.getResumableUploadMetadata(id)
      .then((metadata) => {
        if (!metadata) {
          progress.error(new Error("No resumable upload metadata found"));
          return;
        }

        // Validate file
        if (!this.validateFileForResume(metadata, file)) {
          progress.error(new Error("File does not match the paused upload"));
          return;
        }

        // Save to active uploads
        this.activeUploads.set(id, { controller, progress });

        // Continue from where we left off
        this.resumeUploadProcess(
          id,
          file,
          metadata,
          progress,
          controller.signal
        );
      })
      .catch((error) => {
        progress.error(error);
      });

    // Return observable
    return progress.asObservable().pipe(
      finalize(() => {
        // Clean up when observable completes or errors
        this.activeUploads.delete(id);
      })
    );
  }

  /**
   * Process a resumed upload
   */
  private resumeUploadProcess(
    uploadId: UploadID,
    file: File,
    metadata: ResumableUploadMetadata,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal
  ): void {
    // Calculate what's left to upload
    const totalChunks = metadata.totalChunks;
    const uploadedChunks = new Set(metadata.uploadedChunks);
    const remainingChunks: number[] = [];

    // Determine remaining chunks
    for (let i = 0; i < totalChunks; i++) {
      if (!uploadedChunks.has(i)) {
        remainingChunks.push(i);
      }
    }

    let bytesUploaded = uploadedChunks.size * metadata.chunkSize;
    // Adjust for last chunk which may be smaller
    if (uploadedChunks.has(totalChunks - 1)) {
      bytesUploaded =
        bytesUploaded - metadata.chunkSize + (file.size % metadata.chunkSize);
    }

    const processChunk = async (index: number) => {
      if (signal.aborted) {
        progressSubject.error(new Error("Upload cancelled"));
        return;
      }

      const chunkIndex = remainingChunks[index];

      // Calculate chunk boundaries
      const start = chunkIndex * metadata.chunkSize;
      const end = Math.min(start + metadata.chunkSize, file.size);
      const chunk = file.slice(start, end);

      try {
        // Store the chunk
        await this.storeChunk(uploadId, chunkIndex, chunk);

        // Update progress
        uploadedChunks.add(chunkIndex);
        bytesUploaded += end - start;
        metadata.uploadedChunks.push(chunkIndex);
        metadata.lastUpdateTime = Date.now();

        // Update metadata for resume capability
        await this.saveMetadata(metadata);

        // Emit progress
        const progress: UploadProgressInfo = {
          id: uploadId,
          fileName: file.name,
          state:
            uploadedChunks.size === totalChunks
              ? UploadState.COMPLETED
              : UploadState.ACTIVE,
          progress: Math.floor((bytesUploaded / file.size) * 100),
          bytesUploaded,
          bytesTotal: file.size,
          startTime: metadata.uploadStartTime,
          diskType: metadata.diskType,
          uploadPath: metadata.uploadPath,
        };

        progressSubject.next(progress);

        // If all chunks uploaded, finalize
        if (uploadedChunks.size === totalChunks) {
          const config: UploadConfig = {
            file,
            uploadPath: metadata.uploadPath,
            diskType: metadata.diskType,
            metadata: metadata.customMetadata,
            chunkSize: metadata.chunkSize,
          };

          await this.finalizeUpload(uploadId, file, config);
          progressSubject.complete();
        } else if (index < remainingChunks.length - 1) {
          // Process next chunk
          processChunk(index + 1);
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        progressSubject.error(error);
      }
    };

    // If there are remaining chunks, process them
    if (remainingChunks.length > 0) {
      processChunk(0);
    } else {
      // No chunks left, finalize
      const config: UploadConfig = {
        file,
        uploadPath: metadata.uploadPath,
        diskType: metadata.diskType,
        metadata: metadata.customMetadata,
        chunkSize: metadata.chunkSize,
      };

      this.finalizeUpload(uploadId, file, config)
        .then(() => {
          // Emit final progress
          const progress: UploadProgressInfo = {
            id: uploadId,
            fileName: file.name,
            state: UploadState.COMPLETED,
            progress: 100,
            bytesUploaded: file.size,
            bytesTotal: file.size,
            startTime: metadata.uploadStartTime,
            diskType: metadata.diskType,
            uploadPath: metadata.uploadPath,
          };

          progressSubject.next(progress);
          progressSubject.complete();
        })
        .catch((error) => {
          progressSubject.error(error);
        });
    }
  }

  /**
   * Cancel an active upload
   */
  public async cancelUpload(id: UploadID): Promise<boolean> {
    // Pause the upload first
    const paused = await this.pauseUpload(id);

    if (!paused) {
      return false;
    }

    // Then clean up any stored chunks
    try {
      await this.cleanup(id);
      return true;
    } catch (error) {
      console.error("Error cleaning up cancelled upload:", error);
      return false;
    }
  }

  /**
   * Get the status of an upload
   */
  public async getUploadStatus(
    id: UploadID
  ): Promise<UploadProgressInfo | null> {
    // Check if upload is active
    const active = this.activeUploads.has(id);

    if (active) {
      // Status will be provided through the observable
      return null;
    }

    // Check if we have metadata
    const metadata = await this.getResumableUploadMetadata(id);

    if (!metadata) {
      // Check if it's a completed upload
      const fileInfo = await this.getFileInfo(id);

      if (fileInfo && fileInfo.uploadComplete) {
        return {
          id,
          fileName: fileInfo.name,
          state: UploadState.COMPLETED,
          progress: 100,
          bytesUploaded: fileInfo.size,
          bytesTotal: fileInfo.size,
          startTime: fileInfo.uploadCompletedAt - 1000, // Approximate
          diskType: DiskTypeEnum.BrowserCache,
          uploadPath: fileInfo.uploadPath,
        };
      }

      return null;
    }

    // Calculate progress from metadata
    const bytesUploaded = metadata.uploadedChunks.length * metadata.chunkSize;
    const progress = Math.floor((bytesUploaded / metadata.fileSize) * 100);

    return {
      id,
      fileName: metadata.fileName,
      state: UploadState.PAUSED,
      progress,
      bytesUploaded,
      bytesTotal: metadata.fileSize,
      startTime: metadata.uploadStartTime,
      diskType: metadata.diskType,
      uploadPath: metadata.uploadPath,
    };
  }

  /**
   * Get file information
   */
  private getFileInfo(id: UploadID): Promise<any | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        [this.FILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.FILES_STORE_NAME);

      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error("Failed to get file info"));
    });
  }

  /**
   * Get the features supported by this adapter
   */
  public getSupportedFeatures(): AdapterFeatures {
    return {
      canPause: true,
      canResume: true,
      supportsChunking: true,
      supportsConcurrentUploads: true,
      supportsProgress: true,
      requiresAuthentication: false,
      maxConcurrentUploads: 1, // Conservative for IndexedDB
      recommendedChunkSize: 1024 * 1024, // 1MB
    };
  }

  /**
   * Get metadata for resuming an upload
   */
  public async getResumableUploadMetadata(
    id: UploadID
  ): Promise<ResumableUploadMetadata | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        [this.METADATA_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.METADATA_STORE_NAME);

      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result as ResumableUploadMetadata);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error("Failed to get metadata"));
    });
  }

  /**
   * Validate that a file matches the metadata for resuming
   */
  public validateFileForResume(
    metadata: ResumableUploadMetadata,
    file: File
  ): boolean {
    return (
      metadata.fileSize === file.size &&
      metadata.fileLastModified === file.lastModified
    );
  }

  /**
   * Clean up upload resources
   */
  public async cleanup(id?: UploadID): Promise<void> {
    if (!this.db) {
      throw new Error("IndexedDB not initialized");
    }

    if (id) {
      // Clean up specific upload
      try {
        // Delete chunks
        const chunksTransaction = this.db.transaction(
          [this.CHUNKS_STORE_NAME],
          "readwrite"
        );
        const chunksStore = chunksTransaction.objectStore(
          this.CHUNKS_STORE_NAME
        );

        // Get all chunks for this upload
        const metadata = await this.getResumableUploadMetadata(id);

        if (metadata) {
          // Delete each chunk
          for (let i = 0; i < metadata.totalChunks; i++) {
            chunksStore.delete(`${id}_chunk_${i}`);
          }
        }

        // Delete metadata
        const metadataTransaction = this.db.transaction(
          [this.METADATA_STORE_NAME],
          "readwrite"
        );
        const metadataStore = metadataTransaction.objectStore(
          this.METADATA_STORE_NAME
        );
        metadataStore.delete(id);

        // Don't delete the final file entry if it exists
      } catch (error) {
        console.error("Error cleaning up upload:", error);
        throw error;
      }
    } else {
      // Clean up all incomplete uploads older than 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      try {
        // Get all metadata entries
        const metadataTransaction = this.db.transaction(
          [this.METADATA_STORE_NAME],
          "readonly"
        );
        const metadataStore = metadataTransaction.objectStore(
          this.METADATA_STORE_NAME
        );
        const metadataRequest = metadataStore.getAll();

        metadataRequest.onsuccess = () => {
          const entries = metadataRequest.result as ResumableUploadMetadata[];

          // Filter old entries
          const oldEntries = entries.filter(
            (entry) => entry.lastUpdateTime < sevenDaysAgo
          );

          // Delete old entries and their chunks
          oldEntries.forEach((entry) => {
            this.cleanup(entry.id);
          });
        };
      } catch (error) {
        console.error("Error cleaning up old uploads:", error);
        throw error;
      }
    }
  }

  /**
   * Check if a file already exists
   */
  public async checkIfExists(
    fileName: string,
    uploadPath: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        [this.FILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.FILES_STORE_NAME);

      // Get all files (inefficient but IndexedDB doesn't support querying by properties)
      const request = store.getAll();

      request.onsuccess = () => {
        const files = request.result;
        const exists = files.some(
          (file) => file.name === fileName && file.uploadPath === uploadPath
        );

        resolve(exists);
      };

      request.onerror = () =>
        reject(new Error("Failed to check if file exists"));
    });
  }

  /**
   * Get a URL for a file
   */
  public async getFileUrl(id: UploadID): Promise<string | null> {
    // For IndexedDB, we create an object URL from the chunks
    try {
      const metadata = await this.getResumableUploadMetadata(id);

      if (!metadata) {
        // Check if it's a completed upload
        const fileInfo = await this.getFileInfo(id);

        if (!fileInfo || !fileInfo.uploadComplete) {
          return null;
        }
      }

      // Reconstruct the file from chunks
      const blob = await this.reconstructFile(id);

      if (!blob) {
        return null;
      }

      // Create and return object URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  }

  /**
   * Reconstruct a file from chunks
   */
  private async reconstructFile(id: UploadID): Promise<Blob | null> {
    if (!this.db) {
      throw new Error("IndexedDB not initialized");
    }

    try {
      // Get metadata
      const metadata = await this.getResumableUploadMetadata(id);
      let fileInfo = await this.getFileInfo(id);

      if (!metadata && !fileInfo) {
        return null;
      }

      const totalChunks =
        metadata?.totalChunks ||
        Math.ceil(fileInfo.size / (metadata?.chunkSize || 1024 * 1024));

      const chunks: Uint8Array[] = [];

      // Get all chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkData = await this.getChunk(id, i);
        if (chunkData) {
          chunks.push(chunkData);
        } else {
          console.warn(`Missing chunk ${i} for file ${id}`);
          return null; // Can't reconstruct if missing chunks
        }
      }

      // Create blob from chunks
      return new Blob(chunks, {
        type:
          fileInfo?.type || metadata?.fileType || "application/octet-stream",
      });
    } catch (error) {
      console.error("Error reconstructing file:", error);
      return null;
    }
  }

  /**
   * Get a chunk from storage
   */
  private getChunk(
    uploadId: UploadID,
    chunkIndex: number
  ): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        [this.CHUNKS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.CHUNKS_STORE_NAME);

      const request = store.get(`${uploadId}_chunk_${chunkIndex}`);

      request.onsuccess = () => {
        if (request.result && request.result.data) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error(`Error getting chunk ${chunkIndex} for ${uploadId}`);
        resolve(null);
      };
    });
  }

  /**
   * Generate a pre-signed URL for direct uploads
   * Not applicable for IndexedDB
   */
  public async generatePresignedUrl(config: UploadConfig): Promise<{
    url: string;
    fields?: Record<string, string>;
    headers?: Record<string, string>;
    method?: string;
  } | null> {
    // Not applicable for IndexedDB
    return null;
  }

  /**
   * Get file as a stream
   * Helper method for DriveDB integration
   */
  public getFileStream(id: UploadID): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start: async (controller) => {
        if (!this.db) {
          throw new Error("IndexedDB not initialized");
        }

        try {
          // Get metadata
          const metadata = await this.getResumableUploadMetadata(id);
          const fileInfo = await this.getFileInfo(id);

          if (!metadata && !fileInfo) {
            throw new Error("File not found");
          }

          const totalChunks =
            metadata?.totalChunks ||
            Math.ceil(fileInfo.size / (metadata?.chunkSize || 1024 * 1024));

          // Stream each chunk
          for (let i = 0; i < totalChunks; i++) {
            const chunkData = await this.getChunk(id, i);

            if (chunkData) {
              controller.enqueue(chunkData);
            } else {
              throw new Error(`Missing chunk ${i}`);
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }
}
