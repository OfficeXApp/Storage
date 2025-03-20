import { Observable, Subject, from, of } from "rxjs";
import { map, catchError, tap, finalize } from "rxjs/operators";
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
import { DiskTypeEnum } from "@officexapp/types";

/**
 * Adapter for uploading files to Internet Computer Protocol (ICP) Canisters
 */
export class CanisterAdapter implements IUploadAdapter {
  private apiKey: string;
  private endpoint: string;
  private maxChunkSize: number;

  // Store active uploads for pause/resume/cancel
  private activeUploads: Map<
    UploadID,
    {
      controller: AbortController;
      progress: Subject<UploadProgressInfo>;
    }
  > = new Map();

  // Store metadata for resumable uploads
  private resumableMetadata: Map<UploadID, ResumableUploadMetadata> = new Map();

  constructor(config?: CanisterAdapterConfig) {
    this.endpoint = config?.endpoint || "";
    this.maxChunkSize = config?.maxChunkSize || 0.5 * 1024 * 1024; // Default to 0.5MB chunks
    this.apiKey = ""; // Will be set during initialization
  }

  /**
   * Initialize the Canister adapter
   */
  public async initialize(config: CanisterAdapterConfig): Promise<void> {
    this.endpoint = config.endpoint || this.endpoint;
    this.maxChunkSize = config.maxChunkSize || this.maxChunkSize;

    // API key would typically be provided in the config or fetched from a secure source
    this.apiKey = config.apiKey || this.apiKey;

    console.log(`Initialized Canister adapter with config:
      - Max chunk size: ${this.maxChunkSize} bytes
      - Endpoint URL: ${this.endpoint}
    `);
  }

  /**
   * Upload a file to the canister
   */
  public uploadFile(
    file: File,
    config: UploadConfig
  ): Observable<UploadProgressInfo> {
    // Generate a unique ID if not provided in config
    const uploadId =
      (config.metadata?.id as UploadID) || (uuidv4() as UploadID);

    console.log(
      `CanisterAdapter: Starting upload with ID: ${uploadId} for file: ${config.file.name}`
    );

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Save to active uploads
    this.activeUploads.set(uploadId, { controller, progress });

    // Calculate total chunks
    const chunkSize = config.chunkSize || this.maxChunkSize;
    const totalChunks = Math.ceil(file.size / chunkSize);

    // Create initial metadata for resumable uploads
    const metadata: ResumableUploadMetadata = {
      id: uploadId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileLastModified: file.lastModified,
      uploadStartTime: Date.now(),
      lastUpdateTime: Date.now(),
      diskType: config.diskType,
      uploadedChunks: [],
      totalChunks,
      chunkSize,
      uploadPath: config.uploadPath,
      customMetadata: config.metadata,
    };

    // Store metadata for resume capability
    this.resumableMetadata.set(uploadId, metadata);

    // Start the upload process
    this.processUpload(
      uploadId,
      file,
      config,
      progress,
      controller.signal,
      chunkSize,
      totalChunks
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
  private async processUpload(
    uploadId: UploadID,
    file: File,
    config: UploadConfig,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal,
    chunkSize: number,
    totalChunks: number
  ): Promise<void> {
    let chunksUploaded = 0;
    let bytesUploaded = 0;
    const startTime = Date.now();

    // First, create a file record in the system
    try {
      // Emit initial progress
      const initialProgress: UploadProgressInfo = {
        id: uploadId,
        fileName: file.name,
        state: UploadState.ACTIVE,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime,
        diskType: config.diskType,
        uploadPath: config.uploadPath,
      };

      progressSubject.next(initialProgress);

      // Create the file record on the canister
      await this.createFileRecord(uploadId, file, config.uploadPath);

      // Process each chunk
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (signal.aborted) {
          progressSubject.error(new Error("Upload cancelled"));
          return;
        }

        // Calculate chunk boundaries
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Read the chunk as ArrayBuffer
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const chunkData = new Uint8Array(chunkArrayBuffer);

        // Upload the chunk
        const success = await this.uploadChunk(
          uploadId,
          chunkIndex,
          chunkData,
          totalChunks,
          signal
        );

        if (!success) {
          // Chunk upload failed or was cancelled
          return;
        }

        // Update progress
        chunksUploaded++;
        bytesUploaded += end - start;

        // Update resumable metadata
        const metadata = this.resumableMetadata.get(uploadId);
        if (metadata) {
          metadata.uploadedChunks.push(chunkIndex);
          metadata.lastUpdateTime = Date.now();
          this.resumableMetadata.set(uploadId, metadata);
        }

        // Emit progress update
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
      }

      // All chunks uploaded, finalize the upload
      if (chunksUploaded === totalChunks) {
        const completed = await this.completeUpload(
          uploadId,
          file.name,
          signal
        );

        if (!completed) {
          progressSubject.error(new Error("Failed to complete upload"));
          return;
        }

        // Final progress update
        const finalProgress: UploadProgressInfo = {
          id: uploadId,
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
      }
    } catch (error) {
      console.error("Error during upload process:", error);

      // Emit error progress
      const errorProgress: UploadProgressInfo = {
        id: uploadId,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: Math.floor((bytesUploaded / file.size) * 100),
        bytesUploaded,
        bytesTotal: file.size,
        startTime,
        diskType: config.diskType,
        errorMessage: (error as Error).message,
        uploadPath: config.uploadPath,
      };

      progressSubject.next(errorProgress);
      progressSubject.error(error);
    }
  }

  /**
   * Create a file record in the canister system
   */
  private async createFileRecord(
    fileId: UploadID,
    file: File,
    uploadPath: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/directory/create_file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          id: fileId,
          name: file.name,
          path: uploadPath,
          file_size: file.size,
          extension: file.name.split(".").pop() || "",
          disk_type: "IcpCanister",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create file record: ${response.statusText}`);
      }

      console.log(`Created file record for ${fileId}`);
    } catch (error) {
      console.error("Error creating file record:", error);
      throw error;
    }
  }

  /**
   * Upload a single chunk to the canister
   */
  private async uploadChunk(
    fileId: UploadID,
    chunkIndex: number,
    chunkData: Uint8Array,
    totalChunks: number,
    signal: AbortSignal
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.endpoint}/directory/raw_upload/chunk`,
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
        throw new Error(
          `Failed to upload chunk ${chunkIndex}: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log(`Upload of chunk ${chunkIndex} was cancelled`);
        return false;
      }

      console.error(`Error uploading chunk ${chunkIndex}:`, error);
      throw error;
    }
  }

  /**
   * Complete the upload on the canister
   */
  private async completeUpload(
    fileId: UploadID,
    filename: string,
    signal: AbortSignal
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.endpoint}/directory/raw_upload/complete`,
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
        throw new Error(`Failed to complete upload: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log(`Complete upload was cancelled`);
        return false;
      }

      console.error("Error completing upload:", error);
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

    return true;
  }

  /**
   * Resume a paused upload
   */
  public resumeUpload(
    id: UploadID,
    file: File
  ): Observable<UploadProgressInfo> {
    const metadata = this.resumableMetadata.get(id);

    if (!metadata) {
      return of({
        id,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime: Date.now(),
        diskType: DiskTypeEnum.IcpCanister,
        errorMessage: "No resumable metadata found",
        uploadPath: "",
      });
    }

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Save to active uploads
    this.activeUploads.set(id, { controller, progress });

    // Resume upload process
    this.resumeUploadProcess(id, file, metadata, progress, controller.signal);

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
  private async resumeUploadProcess(
    uploadId: UploadID,
    file: File,
    metadata: ResumableUploadMetadata,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal
  ): Promise<void> {
    const totalChunks = metadata.totalChunks;
    const chunkSize = metadata.chunkSize;
    const uploadedChunks = new Set(metadata.uploadedChunks);
    const remainingChunks: number[] = [];

    // Determine remaining chunks
    for (let i = 0; i < totalChunks; i++) {
      if (!uploadedChunks.has(i)) {
        remainingChunks.push(i);
      }
    }

    let bytesUploaded = uploadedChunks.size * chunkSize;
    // Adjust for last chunk which may be smaller
    if (uploadedChunks.has(totalChunks - 1)) {
      bytesUploaded = bytesUploaded - chunkSize + (file.size % chunkSize);
    }

    try {
      // Emit initial progress
      const initialProgress: UploadProgressInfo = {
        id: uploadId,
        fileName: file.name,
        state: UploadState.ACTIVE,
        progress: Math.floor((bytesUploaded / file.size) * 100),
        bytesUploaded,
        bytesTotal: file.size,
        startTime: metadata.uploadStartTime,
        diskType: metadata.diskType,
        uploadPath: metadata.uploadPath,
      };

      progressSubject.next(initialProgress);

      // Process remaining chunks
      for (const chunkIndex of remainingChunks) {
        if (signal.aborted) {
          progressSubject.error(new Error("Upload cancelled"));
          return;
        }

        // Calculate chunk boundaries
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Read the chunk as ArrayBuffer
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const chunkData = new Uint8Array(chunkArrayBuffer);

        // Upload the chunk
        const success = await this.uploadChunk(
          uploadId,
          chunkIndex,
          chunkData,
          totalChunks,
          signal
        );

        if (!success) {
          // Chunk upload failed or was cancelled
          return;
        }

        // Update progress
        bytesUploaded += end - start;
        uploadedChunks.add(chunkIndex);

        // Update resumable metadata
        metadata.uploadedChunks.push(chunkIndex);
        metadata.lastUpdateTime = Date.now();
        this.resumableMetadata.set(uploadId, metadata);

        // Emit progress update
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
      }

      // All chunks uploaded, finalize the upload if needed
      if (uploadedChunks.size === totalChunks) {
        const completed = await this.completeUpload(
          uploadId,
          file.name,
          signal
        );

        if (!completed) {
          progressSubject.error(new Error("Failed to complete upload"));
          return;
        }

        // Final progress update
        const finalProgress: UploadProgressInfo = {
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

        progressSubject.next(finalProgress);
        progressSubject.complete();
      }
    } catch (error) {
      console.error("Error during resumeUploadProcess:", error);

      // Emit error progress
      const errorProgress: UploadProgressInfo = {
        id: uploadId,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: Math.floor((bytesUploaded / file.size) * 100),
        bytesUploaded,
        bytesTotal: file.size,
        startTime: metadata.uploadStartTime,
        diskType: metadata.diskType,
        errorMessage: (error as Error).message,
        uploadPath: metadata.uploadPath,
      };

      progressSubject.next(errorProgress);
      progressSubject.error(error);
    }
  }

  /**
   * Cancel an active upload
   */
  public async cancelUpload(id: UploadID): Promise<boolean> {
    const upload = this.activeUploads.get(id);
    if (!upload) {
      console.warn(`Cannot cancel upload ${id}: not found or not active`);
      return false;
    }

    // Abort the current upload process
    upload.controller.abort();
    this.activeUploads.delete(id);

    // Remove from resumable metadata
    this.resumableMetadata.delete(id);

    // Try to cancel on the server
    try {
      const response = await fetch(
        `${this.endpoint}/directory/raw_upload/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            file_id: id,
          }),
        }
      );

      // Even if the server-side cancel fails, we still consider the cancel successful
      // since we've aborted the client-side operation
      if (!response.ok) {
        console.warn(
          `Server-side cancel for ${id} failed: ${response.statusText}`
        );
      }
    } catch (error) {
      console.warn(`Error during server-side cancel for ${id}:`, error);
    }

    return true;
  }

  /**
   * Get the status of an upload
   */
  public async getUploadStatus(
    id: UploadID
  ): Promise<UploadProgressInfo | null> {
    // Check if this is an active upload
    const isActive = this.activeUploads.has(id);

    if (isActive) {
      // Status will be emitted through the observable
      return null;
    }

    // Check if we have resumable metadata
    const metadata = this.resumableMetadata.get(id);

    if (!metadata) {
      // Try to fetch status from server
      try {
        const response = await fetch(
          `${this.endpoint}/directory/raw_upload/status?file_id=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
          }
        );

        if (!response.ok) {
          return null;
        }

        const status = await response.json();

        return {
          id,
          fileName: status.filename,
          state: status.state as UploadState,
          progress: status.progress,
          bytesUploaded: status.bytes_uploaded,
          bytesTotal: status.bytes_total,
          startTime: status.start_time,
          diskType: DiskTypeEnum.IcpCanister,
          uploadPath: status.upload_path,
        };
      } catch (error) {
        console.error(`Error fetching upload status for ${id}:`, error);
        return null;
      }
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
      maxConcurrentUploads: 3, // Reasonable default for canisters
      recommendedChunkSize: this.maxChunkSize,
    };
  }

  /**
   * Get metadata for resuming an upload
   */
  public async getResumableUploadMetadata(
    id: UploadID
  ): Promise<ResumableUploadMetadata | null> {
    return this.resumableMetadata.get(id) || null;
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
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    // Nothing to clean up on the client side for canisters
    // The canister's garbage collection would handle server-side cleanup
  }

  /**
   * Check if a file already exists
   */
  public async checkIfExists(
    fileName: string,
    uploadPath: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.endpoint}/directory/check_file_exists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            filename: fileName,
            path: uploadPath,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to check if file exists: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.exists === true;
    } catch (error) {
      console.error("Error checking if file exists:", error);
      return false;
    }
  }

  /**
   * Get a URL for a file
   */
  public async getFileUrl(id: UploadID): Promise<string | null> {
    try {
      // For canister files, we can construct the download URL directly
      return `${this.endpoint}/directory/raw_download?file_id=${id}`;
    } catch (error) {
      console.error(`Error getting file URL for ${id}:`, error);
      return null;
    }
  }

  /**
   * Download file content
   */
  public async getFileContent(id: UploadID): Promise<Blob | null> {
    try {
      // Fetch metadata to get chunk information
      const metaRes = await fetch(
        `${this.endpoint}/directory/raw_download/meta?file_id=${id}`,
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
      const { total_size, total_chunks, content_type } = metadata;

      // Fetch all chunks
      let allBytes = new Uint8Array(total_size);
      let offset = 0;

      for (let i = 0; i < total_chunks; i++) {
        const chunkRes = await fetch(
          `${this.endpoint}/directory/raw_download/chunk?file_id=${id}&chunk_index=${i}`,
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

      // Create and return blob
      return new Blob([allBytes], {
        type: content_type || "application/octet-stream",
      });
    } catch (error) {
      console.error(`Error downloading file content for ${id}:`, error);
      return null;
    }
  }
}
