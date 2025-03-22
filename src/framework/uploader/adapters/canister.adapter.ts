import { Observable, Subject, of } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";
import {
  UploadID,
  UploadProgressInfo,
  UploadConfig,
  UploadState,
  AdapterFeatures,
  CanisterAdapterConfig,
  ResumableUploadMetadata,
} from "../types";
import { IUploadAdapter } from "./IUploadAdapter";
import { DiskTypeEnum, FileID, GenerateID } from "@officexapp/types";
import {
  CREATE_FILE,
  createFileAction,
} from "../../../redux-offline/directory/directory.actions";

/**
 * Adapter for uploading files to Canister storage
 */
export class CanisterAdapter implements IUploadAdapter {
  private baseUrl: string = "";
  private apiKey: string = "";
  private maxChunkSize: number = 0.5 * 1024 * 1024; // 0.5MB chunks by default
  private diskID: string = "";

  // Store active uploads for pause/resume/cancel
  private activeUploads: Map<
    UploadID,
    {
      controller: AbortController;
      progress: Subject<UploadProgressInfo>;
    }
  > = new Map();

  // Store metadata for resume capability
  private resumableUploads: Map<UploadID, ResumableUploadMetadata> = new Map();

  // Store blob URLs for downloaded files
  private blobUrls: Map<UploadID, string> = new Map();

  /**
   * Initialize the Canister adapter
   */
  public async initialize(config: CanisterAdapterConfig): Promise<void> {
    if (!config.endpoint) {
      throw new Error("Canister endpoint is required");
    }

    if (!config.apiKey) {
      throw new Error("Canister API key is required");
    }

    this.baseUrl = config.endpoint;
    this.apiKey = config.apiKey;
    this.diskID = config.diskID;

    if (config.maxChunkSize) {
      this.maxChunkSize = config.maxChunkSize;
    }

    // console.log(`Initialized Canister adapter with endpoint: ${this.baseUrl}`);
  }

  /**
   * Upload a file to Canister with chunking
   */
  public uploadFile(
    fileID: FileID,
    file: File,
    config: UploadConfig
  ): Observable<UploadProgressInfo> {
    // Use the ID from metadata if provided, otherwise generate a new one
    const uploadId =
      (config.metadata?.id as UploadID) || (uuidv4() as UploadID);

    // console.log(
    //   `CanisterAdapter: Starting upload with ID: ${uploadId} for file: ${file.name}`
    // );

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Save to active uploads
    this.activeUploads.set(uploadId, { controller, progress });

    // Define chunk size - default to maxChunkSize or use config value
    const chunkSize = config.chunkSize || this.maxChunkSize;

    // Start upload process asynchronously
    this.processUpload(
      uploadId,
      file,
      config,
      progress,
      controller.signal,
      chunkSize
    );

    // Return observable
    return progress.pipe(
      finalize(() => {
        // Clean up when observable completes or errors
        this.activeUploads.delete(uploadId);
      })
    );
  }

  /**
   * Process the upload with chunking
   */
  private async processUpload(
    uploadId: UploadID,
    file: File,
    config: UploadConfig,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal,
    chunkSize: number
  ): Promise<void> {
    // Calculate total chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let chunksUploaded = 0;
    let bytesUploaded = 0;
    const startTime = Date.now();

    try {
      // First create a file record in the system
      const fileId = await this.createFileRecord(file, config, uploadId);

      // Store metadata for resume capability
      const metadata: ResumableUploadMetadata = {
        id: uploadId,
        fileID: config.fileID,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileLastModified: file.lastModified,
        uploadStartTime: startTime,
        lastUpdateTime: startTime,
        diskType: config.diskType,
        diskID: config.diskID,
        uploadedChunks: [],
        totalChunks,
        chunkSize,
        uploadPath: config.uploadPath,
        customMetadata: { ...config.metadata, fileId },
      };

      this.resumableUploads.set(uploadId, metadata);

      // Process all chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (signal.aborted) {
          throw new Error("Upload cancelled");
        }

        // Calculate chunk boundaries
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Convert chunk to Uint8Array
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const chunkData = new Uint8Array(chunkArrayBuffer);

        // Upload the chunk
        const success = await this.uploadChunk(
          fileId,
          chunkIndex,
          chunkData,
          totalChunks,
          signal
        );

        if (!success) {
          throw new Error("Chunk upload failed");
        }

        // Update progress
        chunksUploaded++;
        bytesUploaded += end - start;

        // Update metadata for resume capability
        metadata.uploadedChunks.push(chunkIndex);
        metadata.lastUpdateTime = Date.now();
        this.resumableUploads.set(uploadId, metadata);

        // Emit progress
        const progress: UploadProgressInfo = {
          id: uploadId,
          fileID: config.fileID,
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
      }

      // Complete the upload
      await this.completeUpload(fileId, file.name, signal);

      // If we got here, upload is complete
      const finalProgress: UploadProgressInfo = {
        id: uploadId,
        fileID: config.fileID,
        fileName: file.name,
        state: UploadState.COMPLETED,
        progress: 100,
        bytesUploaded: file.size,
        bytesTotal: file.size,
        startTime,
        diskType: config.diskType,
        uploadPath: config.uploadPath,
      };

      progressSubject.next(finalProgress);
      progressSubject.complete();
    } catch (error) {
      if (
        (error as Error).name === "AbortError" ||
        (error as Error).message === "Upload cancelled"
      ) {
        progressSubject.error(new Error("Upload cancelled"));
      } else {
        console.error("Error uploading file:", error);
        progressSubject.error(error);
      }
    }
  }

  /**
   * Create a file record in the system using Redux action
   */
  private async createFileRecord(
    file: File,
    config: UploadConfig,
    uploadId: UploadID
  ): Promise<string> {
    try {
      // Generate a file ID or use the one from metadata
      const fileID = config.fileID || GenerateID.File();

      // Need dispatch function to be in metadata for Redux integration
      if (!config.metadata?.dispatch) {
        throw new Error("Redux dispatch function is required in the metadata");
      }

      const dispatch = config.metadata.dispatch;

      // Prepare the create file action
      const createAction = {
        action: CREATE_FILE as "CREATE_FILE",
        payload: {
          id: fileID,
          name: file.name,
          parent_folder_uuid: config.uploadPath,
          extension: file.name.split(".").pop() || "",
          labels: [],
          file_size: file.size,
          disk_id: config.diskID,
        },
      };

      // console.log("Creating file record with action:", createAction);

      // Dispatch action to create file record
      dispatch(createFileAction(createAction, undefined, false));

      // Wait for the record to be created
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return fileID;
    } catch (error) {
      console.error("Error creating file record:", error);
      throw error;
    }
  }

  /**
   * Upload a single chunk
   */
  private async uploadChunk(
    fileId: string,
    chunkIndex: number,
    chunkData: Uint8Array,
    totalChunks: number,
    signal: AbortSignal
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/directory/raw_upload/chunk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            file_id: fileId,
            chunk_index: chunkIndex,
            chunk_data: Array.from(chunkData),
            total_chunks: totalChunks,
          }),
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // console.log(
        //   `Upload of chunk ${chunkIndex} for file ${fileId} was cancelled`
        // );
        return false;
      }
      throw error;
    }
  }

  /**
   * Complete the upload
   */
  private async completeUpload(
    fileId: string,
    filename: string,
    signal: AbortSignal
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/directory/raw_upload/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            file_id: fileId,
            filename,
          }),
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Complete upload failed: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // console.log(`Complete upload for file ${fileId} was cancelled`);
        return false;
      }
      throw error;
    }
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

    // Ensure we have the metadata saved for resuming later
    if (!this.resumableUploads.has(id)) {
      console.warn(`No resumable metadata found for ${id}`);
      return false;
    }

    // Return success
    return true;
  }

  /**
   * Resume a paused upload
   */
  public resumeUpload(
    id: UploadID,
    fileID: FileID,
    file: File
  ): Observable<UploadProgressInfo> {
    // Get existing metadata
    const metadata = this.resumableUploads.get(id);

    if (!metadata) {
      return of({
        id,
        fileID,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime: Date.now(),
        diskType: DiskTypeEnum.IcpCanister,
        errorMessage: "No resumable upload metadata found",
        uploadPath: "",
      });
    }

    // Validate file
    if (!this.validateFileForResume(metadata, file)) {
      return of({
        id,
        fileID: metadata.fileID,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime: Date.now(),
        diskType: metadata.diskType,
        errorMessage: "File does not match the paused upload",
        uploadPath: metadata.uploadPath,
      });
    }

    // Create new progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create new abort controller
    const controller = new AbortController();

    // Save to active uploads
    this.activeUploads.set(id, { controller, progress });

    // Continue from where we left off
    this.resumeUploadProcess(id, file, metadata, progress, controller.signal);

    // Return observable
    return progress.pipe(
      finalize(() => {
        // Clean up when observable completes or errors
        this.activeUploads.delete(id);
      })
    );
  }

  /**
   * Process a resumed upload
   */
  private async resumeUploadProcess(
    uploadId: UploadID,
    file: File,
    metadata: ResumableUploadMetadata,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal
  ): Promise<void> {
    // Get the file ID from metadata
    const fileId = metadata.customMetadata?.fileId as string;

    if (!fileId) {
      progressSubject.error(new Error("Missing file ID in resumable metadata"));
      return;
    }

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

    let bytesUploaded = 0;
    // Calculate already uploaded bytes
    for (const chunkIndex of metadata.uploadedChunks) {
      const start = chunkIndex * metadata.chunkSize;
      const end = Math.min(start + metadata.chunkSize, file.size);
      bytesUploaded += end - start;
    }

    try {
      // Initial progress update
      progressSubject.next({
        id: uploadId,
        fileID: metadata.fileID,
        fileName: file.name,
        state: UploadState.ACTIVE,
        progress: Math.floor((bytesUploaded / file.size) * 100),
        bytesUploaded,
        bytesTotal: file.size,
        startTime: metadata.uploadStartTime,
        diskType: metadata.diskType,
        uploadPath: metadata.uploadPath,
      });

      // Process each remaining chunk
      for (const chunkIndex of remainingChunks) {
        if (signal.aborted) {
          throw new Error("Upload cancelled");
        }

        // Calculate chunk boundaries
        const start = chunkIndex * metadata.chunkSize;
        const end = Math.min(start + metadata.chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Convert chunk to Uint8Array
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const chunkData = new Uint8Array(chunkArrayBuffer);

        // Upload the chunk
        const success = await this.uploadChunk(
          fileId,
          chunkIndex,
          chunkData,
          totalChunks,
          signal
        );

        if (!success) {
          throw new Error("Chunk upload failed");
        }

        // Update progress
        uploadedChunks.add(chunkIndex);
        bytesUploaded += end - start;

        // Update metadata for resume capability
        metadata.uploadedChunks.push(chunkIndex);
        metadata.lastUpdateTime = Date.now();
        this.resumableUploads.set(uploadId, metadata);

        // Emit progress
        const progress: UploadProgressInfo = {
          id: uploadId,
          fileID: metadata.fileID,
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
      }

      // If all chunks uploaded, complete the upload
      if (uploadedChunks.size === totalChunks) {
        await this.completeUpload(fileId, file.name, signal);

        const finalProgress: UploadProgressInfo = {
          id: uploadId,
          fileID: metadata.fileID,
          fileName: file.name,
          state: UploadState.COMPLETED,
          progress: 100,
          bytesUploaded: file.size,
          bytesTotal: file.size,
          startTime: metadata.uploadStartTime,
          diskType: metadata.diskType,
          uploadPath: metadata.uploadPath,
        };

        progressSubject.next(finalProgress);
        progressSubject.complete();
      }
    } catch (error) {
      if (
        (error as Error).name === "AbortError" ||
        (error as Error).message === "Upload cancelled"
      ) {
        progressSubject.error(new Error("Upload cancelled"));
      } else {
        console.error("Error resuming upload:", error);
        progressSubject.error(error);
      }
    }
  }

  /**
   * Cancel an active upload
   */
  public async cancelUpload(id: UploadID): Promise<boolean> {
    // First pause the upload
    const paused = await this.pauseUpload(id);

    if (!paused) {
      return false;
    }

    // Get the metadata to find the file ID
    const metadata = this.resumableUploads.get(id);
    if (!metadata || !metadata.customMetadata?.fileId) {
      console.warn(`No metadata or file ID found for upload ${id}`);
      // Clean up the metadata
      this.resumableUploads.delete(id);
      return true;
    }

    // Call the API to cancel the upload
    try {
      const fileId = metadata.customMetadata.fileId as string;

      const response = await fetch(
        `${this.baseUrl}/directory/raw_upload/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            file_id: fileId,
          }),
        }
      );

      // Even if the API call fails, we still want to clean up locally
      this.resumableUploads.delete(id);

      // Revoke blob URL if it exists
      this.revokeBlobUrl(id);

      if (!response.ok) {
        console.warn(
          `API failed to cancel upload for ${fileId}: ${response.statusText}`
        );
        return true; // Still return true because we cleaned up locally
      }

      return true;
    } catch (error) {
      console.error("Error cancelling upload on server:", error);
      // Still clean up locally
      this.resumableUploads.delete(id);
      return true;
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
    const metadata = this.resumableUploads.get(id);

    if (!metadata) {
      // We don't know about this upload
      return null;
    }

    // Calculate progress from metadata
    const bytesUploaded = metadata.uploadedChunks.length * metadata.chunkSize;
    const progress = Math.floor((bytesUploaded / metadata.fileSize) * 100);

    return {
      id,
      fileID: metadata.fileID,
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
   * Get the features supported by this adapter
   */
  public getSupportedFeatures(): AdapterFeatures {
    return {
      canPause: true,
      canResume: true,
      supportsChunking: true,
      supportsConcurrentUploads: true,
      supportsProgress: true,
      requiresAuthentication: true,
      maxConcurrentUploads: 3,
      recommendedChunkSize: this.maxChunkSize,
    };
  }

  /**
   * Get metadata for resuming an upload
   */
  public async getResumableUploadMetadata(
    id: UploadID
  ): Promise<ResumableUploadMetadata | null> {
    return this.resumableUploads.get(id) || null;
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
  public async cleanup(): Promise<void> {
    // Revoke all created blob URLs
    for (const [id, url] of this.blobUrls.entries()) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls.clear();

    return Promise.resolve();
  }

  /**
   * Download file content
   */
  public async downloadFile(fileId: string): Promise<Blob> {
    try {
      // 1. Fetch metadata
      const metaRes = await fetch(
        `${this.baseUrl}/directory/raw_download/meta?file_id=${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!metaRes.ok) {
        throw new Error(`Metadata request failed: ${metaRes.statusText}`);
      }

      const metadata = await metaRes.json();
      const { total_size, total_chunks } = metadata;

      // 2. Fetch all chunks
      let allBytes = new Uint8Array(total_size);
      let offset = 0;

      for (let i = 0; i < total_chunks; i++) {
        const chunkRes = await fetch(
          `${this.baseUrl}/directory/raw_download/chunk?file_id=${fileId}&chunk_index=${i}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
          }
        );

        if (!chunkRes.ok) {
          throw new Error(`Chunk request #${i} failed: ${chunkRes.statusText}`);
        }

        const chunkBuf = await chunkRes.arrayBuffer();
        allBytes.set(new Uint8Array(chunkBuf), offset);
        offset += chunkBuf.byteLength;
      }

      // 3. Create and return blob
      return new Blob([allBytes]);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Helper method to get a blob URL for a file
   * @param id Upload ID
   * @returns Promise that resolves to URL string or null
   */
  private async fetchFileContent(id: UploadID): Promise<string | null> {
    // Check if we already have a blob URL for this file
    if (this.blobUrls.has(id)) {
      return this.blobUrls.get(id) || null;
    }

    // Get metadata to find the file ID
    const metadata = this.resumableUploads.get(id);
    if (!metadata || !metadata.customMetadata?.fileId) {
      console.error(`No metadata or file ID found for upload ${id}`);
      return null;
    }

    const fileId = metadata.customMetadata.fileId as string;

    try {
      // 1. Fetch metadata
      const metaRes = await fetch(
        `${this.baseUrl}/directory/raw_download/meta?file_id=${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!metaRes.ok) {
        throw new Error(`Metadata request failed: ${metaRes.statusText}`);
      }

      const fileMetadata = await metaRes.json();
      const { total_size, total_chunks } = fileMetadata;

      // 2. Fetch all chunks
      let allBytes = new Uint8Array(total_size);
      let offset = 0;

      for (let i = 0; i < total_chunks; i++) {
        const chunkRes = await fetch(
          `${this.baseUrl}/directory/raw_download/chunk?file_id=${fileId}&chunk_index=${i}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
          }
        );

        if (!chunkRes.ok) {
          throw new Error(`Chunk request #${i} failed: ${chunkRes.statusText}`);
        }

        const chunkBuf = await chunkRes.arrayBuffer();
        allBytes.set(new Uint8Array(chunkBuf), offset);
        offset += chunkBuf.byteLength;
      }

      // 3. Create blob and URL
      const blob = new Blob([allBytes], { type: metadata.fileType });
      const blobUrl = URL.createObjectURL(blob);

      // Store URL for future use
      this.blobUrls.set(id, blobUrl);

      return blobUrl;
    } catch (error) {
      console.error(`Error fetching content for ${id}:`, error);
      return null;
    }
  }

  /**
   * Get a URL for a file
   */
  public async getFileUrl(id: UploadID): Promise<string | null> {
    try {
      // If there's an existing blob URL, return it
      if (this.blobUrls.has(id)) {
        return this.blobUrls.get(id) || null;
      }

      // Get metadata to find the file ID
      const metadata = this.resumableUploads.get(id);
      if (!metadata || !metadata.customMetadata?.fileId) {
        console.error(`No metadata or file ID found for upload ${id}`);
        return null;
      }

      const fileId = metadata.customMetadata.fileId as string;

      // Download the file content and create blob URL
      return await this.fetchFileContent(id);
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  }

  /**
   * Revoke a blob URL to free up memory
   */
  private revokeBlobUrl(id: UploadID): void {
    const blobUrl = this.blobUrls.get(id);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      this.blobUrls.delete(id);
    }
  }

  /**
   * Generate a pre-signed URL for direct uploads
   * Not supported for Canister adapter
   */
  public async generatePresignedUrl(): Promise<{
    url: string;
    fields?: Record<string, string>;
    headers?: Record<string, string>;
    method?: string;
  } | null> {
    // Not supported for Canister
    return null;
  }
}
