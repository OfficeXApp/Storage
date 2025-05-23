import { Observable, Subject, of } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";
import {
  UploadID,
  UploadProgressInfo,
  UploadConfig,
  UploadState,
  AdapterFeatures,
  ResumableUploadMetadata,
  CloudS3AdapterConfig,
} from "../types";
import { IUploadAdapter } from "./IUploadAdapter";
import {
  DiskID,
  DiskTypeEnum,
  FileConflictResolutionEnum,
  FileID,
  GenerateID,
  UploadStatus,
} from "@officexapp/types";
import {
  CREATE_FILE,
  CREATE_FILE_COMMIT,
  UPDATE_FILE,
  UPDATE_FILE_COMMIT,
} from "../../../redux-offline/directory/directory.actions";
import { wrapAuthStringOrHeader } from "../../../api/helpers";

/**
 * Adapter for uploading files to Cloud S3 using presigned URLs
 */
export class CloudS3Adapter implements IUploadAdapter {
  private apiEndpoint: string = "";
  private apiKey: string = "";
  private uploadedFileUrls: Record<UploadID, string> = {};
  private generateSignature?: () => Promise<string>;

  // Store active uploads for pause/resume/cancel
  private activeUploads: Map<
    UploadID,
    {
      controller: AbortController;
      progress: Subject<UploadProgressInfo>;
    }
  > = new Map();

  // Store metadata for resume capability (limited for non-multipart uploads)
  private resumableUploads: Map<UploadID, ResumableUploadMetadata> = new Map();

  /**
   * Initialize the Cloud S3 adapter
   */
  public async initialize(config: CloudS3AdapterConfig): Promise<void> {
    if (!config.endpoint) {
      throw new Error("API endpoint is required");
    }

    this.apiEndpoint = config.endpoint;
    this.apiKey = config.apiKey || "";
    this.generateSignature = config.generateSignature;

    // console.log(
    //   `Initialized Cloud S3 adapter with endpoint: ${this.apiEndpoint}`
    // );
  }

  /**
   * Upload a file to S3 using presigned URL
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
    //   `CloudS3Adapter: Starting upload with ID: ${uploadId} for file: ${file.name}`
    // );

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Save to active uploads
    this.activeUploads.set(uploadId, { controller, progress });

    // Start upload process asynchronously
    this.processUpload(uploadId, file, config, progress, controller.signal);

    // Return observable
    return progress.pipe(
      finalize(() => {
        // Clean up when observable completes or errors
        this.activeUploads.delete(uploadId);
      })
    );
  }

  /**
   * Process the upload using a form-based POST request with presigned URL
   */
  private async processUpload(
    uploadId: UploadID,
    file: File,
    config: UploadConfig,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal
  ): Promise<void> {
    const startTime = Date.now();
    console.log(
      `[CloudS3Adapter ${uploadId}] processUpload started for ${file.name}`
    );

    try {
      // First create a file record in the system
      console.log(`[CloudS3Adapter ${uploadId}] Calling createFileRecord...`);
      const { fileID, presignedData } = await this.createFileRecord(
        file,
        config,
        uploadId
      );
      console.log(
        `[CloudS3Adapter ${uploadId}] createFileRecord SUCCEEDED. FileID: ${fileID}, Presigned URL: ${presignedData?.url}`
      );

      if (!presignedData || !presignedData.url) {
        throw new Error("No presigned URL data in response");
      }

      // Send initial progress
      progressSubject.next({
        id: uploadId,
        fileID: config.fileID,
        fileName: file.name,
        state: UploadState.ACTIVE,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime,
        diskType: config.diskType,
        parentFolderID: config.parentFolderID,
      });

      // Store metadata for limited resume capability
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
        totalChunks: 1, // Single chunk for non-multipart upload
        chunkSize: file.size,
        parentFolderID: config.parentFolderID,
        customMetadata: {
          ...config.metadata,
          fileID,
        },
      };

      this.resumableUploads.set(uploadId, metadata);

      // Create a FormData object for the upload
      const formData = new FormData();

      // Add all the fields from the presigned URL
      for (const [key, value] of Object.entries(presignedData.fields || {})) {
        formData.append(key, value as string);
      }

      // Add the file as the last field (important for S3)
      formData.append("file", file);

      // Upload using fetch with progress tracking
      console.log(
        `[CloudS3Adapter ${uploadId}] Calling uploadWithProgress to URL: ${presignedData.url}`
      );
      await this.uploadWithProgress(
        presignedData.url,
        formData,
        file.size,
        (progress) => {
          // Update progress information
          progressSubject.next({
            id: uploadId,
            fileID: config.fileID,
            fileName: file.name,
            state: UploadState.ACTIVE,
            progress: Math.floor(progress * 100),
            bytesUploaded: Math.floor(progress * file.size),
            bytesTotal: file.size,
            startTime,
            diskType: config.diskType,
            parentFolderID: config.parentFolderID,
          });
        },
        signal
      );
      console.log(`[CloudS3Adapter ${uploadId}] uploadWithProgress SUCCEEDED.`);

      // Update file status to completed
      console.log(`[CloudS3Adapter ${uploadId}] Calling updateFileStatus...`);
      await this.updateFileStatus(fileID, UploadStatus.COMPLETED, config);
      console.log(`[CloudS3Adapter ${uploadId}] updateFileStatus SUCCEEDED.`);

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
        parentFolderID: config.parentFolderID,
      };

      progressSubject.next(finalProgress);
      progressSubject.complete();
      console.log(
        `[CloudS3Adapter ${uploadId}] processUpload COMPLETED for ${file.name}.`
      );
    } catch (error) {
      console.error(
        `[CloudS3Adapter ${uploadId}] processUpload FAILED for ${file.name}:`,
        error
      );
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
   * Upload with progress tracking using XMLHttpRequest
   * (fetch API doesn't support upload progress yet)
   */
  private uploadWithProgress(
    url: string,
    formData: FormData,
    totalSize: number,
    onProgress: (progress: number) => void,
    signal: AbortSignal
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Add abort listener
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Upload cancelled"));
      });

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total;
          onProgress(progress);
        }
      });

      // Set up completion handler
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}`
            )
          );
        }
      });

      // Set up error handler
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"));
      });

      // Set up timeout handler
      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timed out"));
      });

      // Initialize the request
      xhr.open("POST", url);
      xhr.send(formData);
    });
  }

  /**
   * Create a file record in the system using direct API call
   */
  private async createFileRecord(
    file: File,
    config: UploadConfig,
    uploadId: UploadID
  ): Promise<{ fileID: FileID; presignedData: any }> {
    try {
      console.log(`CREATE_FILE`, file);

      // Generate a file ID or use the one from metadata
      const fileID = config.fileID || GenerateID.File();

      // Prepare create file action
      const createAction = {
        action: CREATE_FILE as "CREATE_FILE",
        payload: {
          id: fileID,
          name: file.name,
          parent_folder_uuid: config.parentFolderID,
          extension: file.name.split(".").pop() || "",
          labels: [],
          file_size: file.size,
          disk_id: config.diskID,
          disk_type: config.diskType,
          file_conflict_resolution:
            config.fileConflictResolution ||
            FileConflictResolutionEnum.KEEP_BOTH,
        },
      };

      // console.log("Creating file record with action:", createAction);

      // Make direct API call following the /directory/action pattern
      const auth_token = this.generateSignature
        ? await this.generateSignature()
        : this.apiKey;
      const { url, headers } = wrapAuthStringOrHeader(
        `${this.apiEndpoint}/directory/action`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          actions: [createAction],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create file record: ${response.statusText}`);
      }

      const result = await response.json();

      console.log(`File record creation result:`, result);

      // Extract presigned URL data from the API response
      let presignedData = null;

      if (result[0]?.response?.result) {
        presignedData = result[0].response.result.upload;
        this.uploadedFileUrls[uploadId] =
          result[0].response.result.file.raw_url;
      }

      if (!presignedData) {
        throw new Error("No presigned URL data in response");
      }

      // If dispatch is provided, update Redux store with a COMMIT action
      if (config.metadata?.dispatch) {
        const dispatch = config.metadata.dispatch;

        // Use CREATE_FILE_COMMIT action directly with the API response
        dispatch({
          type: CREATE_FILE_COMMIT as "CREATE_FILE_COMMIT",
          payload: {
            ok: {
              data: {
                result: {
                  file: {
                    ...createAction.payload,
                    upload: presignedData,
                    upload_status: UploadStatus.QUEUED,
                  },
                },
              },
            },
          },
          meta: { optimisticID: fileID },
        });
      }

      return { fileID, presignedData };
    } catch (error) {
      console.error("Error creating file record:", error);
      throw error;
    }
  }

  /**
   * Update file record status after upload is complete
   */
  private async updateFileStatus(
    fileID: FileID,
    uploadStatus: UploadStatus,
    config: UploadConfig
  ): Promise<void> {
    try {
      // Prepare update file action
      const updateAction = {
        action: UPDATE_FILE as "UPDATE_FILE",
        payload: {
          id: fileID,
          upload_status: uploadStatus,
        },
      };

      // console.log("Updating file status with action:", updateAction);

      // Make direct API call following the /directory/action pattern

      const auth_token = this.generateSignature
        ? await this.generateSignature()
        : this.apiKey;
      const { url, headers } = wrapAuthStringOrHeader(
        `${this.apiEndpoint}/directory/action`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          actions: [updateAction],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update file status: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`Upload status`, data);

      const updatedFile = data[0]?.response?.result;

      // If dispatch is provided, update Redux store with a COMMIT action
      if (config.metadata?.dispatch) {
        const dispatch = config.metadata.dispatch;

        // Use UPDATE_FILE_COMMIT action directly with the API response
        dispatch({
          type: UPDATE_FILE_COMMIT as "UPDATE_FILE_COMMIT",
          payload: {
            ok: {
              data: {
                result: {
                  ...updatedFile,
                  id: fileID,
                  upload_status: uploadStatus,
                },
              },
            },
          },
          meta: { optimisticID: fileID },
        });
      }

      // Call onFileComplete callback if provided
      if (
        config.metadata?.onFileComplete &&
        uploadStatus === UploadStatus.COMPLETED
      ) {
        config.metadata.onFileComplete(fileID);
      }
    } catch (error) {
      console.error("Error updating file status:", error);
      throw error;
    }
  }

  /**
   * Pause an active upload
   * Note: With form-based uploads, pausing is limited
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
   * Note: With form-based uploads, true resuming is not possible
   * This will restart the upload from the beginning
   */
  public resumeUpload(
    id: UploadID,
    fileID: FileID,
    file: File
  ): Observable<UploadProgressInfo> {
    // Get existing metadata
    const metadata = this.resumableUploads.get(id);

    if (!metadata) {
      // Create a failed progress observable
      const progress = new Subject<UploadProgressInfo>();
      progress.next({
        id,
        fileID,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime: Date.now(),
        diskType: DiskTypeEnum.StorjWeb3,
        errorMessage: "No resumable upload metadata found",
        parentFolderID: "",
      });
      progress.complete();
      return progress;
    }

    // Validate file
    if (!this.validateFileForResume(metadata, file)) {
      // Create a failed progress observable
      const progress = new Subject<UploadProgressInfo>();
      progress.next({
        id,
        fileID,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime: Date.now(),
        diskType: metadata.diskType,
        errorMessage: "File does not match the paused upload",
        parentFolderID: metadata.parentFolderID,
      });
      progress.complete();
      return progress;
    }

    // Create new progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create new abort controller
    const controller = new AbortController();

    // Save to active uploads
    this.activeUploads.set(id, { controller, progress });

    // For simple form-based uploads, we need to start over
    // So we'll just call uploadFile again
    // console.log(`Restarting upload for ${id} from the beginning`);

    // Prepare config for restart
    const config: UploadConfig = {
      file,
      fileID,
      parentFolderID: metadata.parentFolderID,
      diskType: metadata.diskType,
      diskID: metadata.diskID,
      metadata: metadata.customMetadata,
    };

    // Process the upload from the beginning
    this.processUpload(id, file, config, progress, controller.signal);

    // Return observable
    return progress.pipe(
      finalize(() => {
        // Clean up when observable completes or errors
        this.activeUploads.delete(id);
      })
    );
  }

  /**
   * Cancel an active upload
   */
  public async cancelUpload(id: UploadID): Promise<boolean> {
    // Abort any active upload
    const activeUpload = this.activeUploads.get(id);
    if (activeUpload) {
      activeUpload.controller.abort();
      this.activeUploads.delete(id);
    }

    // Clean up metadata
    this.resumableUploads.delete(id);

    return true;
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

    return {
      id,
      fileID: metadata.fileID,
      fileName: metadata.fileName,
      state: UploadState.PAUSED,
      progress: 0, // For form-based uploads, we don't track partial progress
      bytesUploaded: 0,
      bytesTotal: metadata.fileSize,
      startTime: metadata.uploadStartTime,
      diskType: metadata.diskType,
      parentFolderID: metadata.parentFolderID,
    };
  }

  /**
   * Get the features supported by this adapter
   */
  public getSupportedFeatures(): AdapterFeatures {
    return {
      canPause: true, // We can "pause" (abort) uploads
      canResume: false, // But we can't truly resume them - will restart
      supportsChunking: false,
      supportsConcurrentUploads: true,
      supportsProgress: true,
      requiresAuthentication: true,
      maxConcurrentUploads: 3,
      recommendedChunkSize: 0, // Chunking not supported
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
    // Clean up any resources if needed
    return Promise.resolve();
  }
}
