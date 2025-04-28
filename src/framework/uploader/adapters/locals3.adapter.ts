// src/framework/uploader/adapters/s3bucket.adapter.ts

import { Observable, Subject, from } from "rxjs";
import { map, catchError, tap, finalize } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";
import {
  S3,
  HeadBucketCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  CompletedPart,
  ListBucketsCommand,
  ObjectCannedACL,
  PutObjectAclCommand,
  HeadObjectCommand,
  AbortMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  UploadID,
  UploadProgressInfo,
  UploadConfig,
  UploadState,
  AdapterFeatures,
  LocalS3AdapterConfig,
  ResumableUploadMetadata,
} from "../types";
import { IUploadAdapter } from "./IUploadAdapter";
import { DiskTypeEnum, FileID, GenerateID } from "@officexapp/types";
import { getMimeType } from "../helpers";
import {
  CREATE_FILE,
  createFileAction,
  UPDATE_FILE,
  updateFileAction,
} from "../../../redux-offline/directory/directory.actions";
import { getNextUtcMidnight } from "../../../api/helpers";

/**
 * Adapter for uploading files to AWS S3 or S3-compatible storage (like Storj)
 */
export class LocalS3Adapter implements IUploadAdapter {
  private s3Client: S3 | null = null;
  private config: LocalS3AdapterConfig | null = null;

  // Store active uploads for pause/resume/cancel
  private activeUploads: Map<
    UploadID,
    {
      uploadId?: string;
      controller: AbortController;
      progress: Subject<UploadProgressInfo>;
    }
  > = new Map();

  /**
   * Initialize the S3 adapter
   */
  public async initialize(config: LocalS3AdapterConfig): Promise<void> {
    if (this.s3Client) {
      // console.log("LocalS3Adapter already initialized");
      return;
    }

    this.config = config;

    // Initialize S3 client
    this.s3Client = new S3({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      region: config.region || "us-east-1",
      forcePathStyle: true, // Use path-style, especially for Storj or MinIO
    });

    // Verify connectivity by listing buckets
    try {
      const command = new ListBucketsCommand({});
      await this.s3Client.send(command);
      // console.log("Successfully connected to S3");

      // Ensure bucket exists
      await this.ensureBucketExists(config.bucket);
    } catch (error) {
      console.error("Error connecting to S3:", error);
      throw new Error("Failed to connect to S3");
    }
  }

  /**
   * Ensure the bucket exists
   */
  private async ensureBucketExists(bucketName: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    try {
      // Check if bucket exists
      const command = new HeadBucketCommand({ Bucket: bucketName });
      await this.s3Client.send(command);
      // console.log(`Bucket ${bucketName} already exists.`);
    } catch (error) {
      if ((error as any).name === "NotFound") {
        try {
          // Create bucket if it doesn't exist
          const createCommand = new CreateBucketCommand({ Bucket: bucketName });
          await this.s3Client.send(createCommand);
          // console.log(`Created bucket: ${bucketName}`);

          // Wait a moment for bucket creation to propagate
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (createError) {
          console.error(`Error creating bucket: ${createError}`);
          throw createError;
        }
      } else {
        console.error(`Error checking bucket: ${error}`);
        throw error;
      }
    }
  }

  /**
   * Upload a file to S3
   */
  public uploadFile(
    fileID: FileID,
    file: File,
    config: UploadConfig
  ): Observable<UploadProgressInfo> {
    if (!this.s3Client || !this.config) {
      throw new Error("S3 adapter not initialized");
    }

    // Generate upload ID if not provided
    const uploadId =
      (config.metadata?.id as UploadID) || (uuidv4() as UploadID);

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Save to active uploadsLocal callback
    this.activeUploads.set(uploadId, { controller, progress });

    // Determine key (S3 object path)
    const extension = file.name.split(".").pop();
    const key = `${fileID}.${extension}`;

    console.log(`getObjectKey`, key);

    // Check if we should use multipart upload
    const useMultipartUpload =
      this.config.useMultipartUpload !== false && file.size > 5 * 1024 * 1024; // Default to multipart for files > 5MB

    if (useMultipartUpload) {
      // Start multipart upload
      this.startMultipartUpload(
        uploadId,
        file,
        config,
        key,
        progress,
        controller.signal
      );
    } else {
      // Start simple upload
      this.startSimpleUpload(
        uploadId,
        file,
        config,
        key,
        progress,
        controller.signal
      );
    }

    // Return observable
    return progress.asObservable().pipe(
      finalize(() => {
        // Remove from active uploads when complete or error
        this.activeUploads.delete(uploadId);
      })
    );
  }

  /**
   * Start a simple (single-part) upload for smaller files
   */
  private async startSimpleUpload(
    uploadId: UploadID,
    file: File,
    config: UploadConfig,
    key: string,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal
  ): Promise<void> {
    if (!this.s3Client || !this.config) {
      progressSubject.error(new Error("S3 adapter not initialized"));
      return;
    }

    const startTime = Date.now();

    try {
      // Create file record first
      const fileID = await this.createFileRecord(file, config, uploadId);

      // Send initial progress
      progressSubject.next({
        id: uploadId,
        fileID: fileID || config.fileID,
        fileName: file.name,
        state: UploadState.ACTIVE,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime,
        diskType: config.diskType,
        parentFolderID: config.parentFolderID,
      });

      // Read the file
      const fileBuffer = await this.readFileAsArrayBuffer(file);

      if (signal.aborted) {
        progressSubject.error(new Error("Upload cancelled"));
        return;
      }
      console.log(`to this key`, key);
      // Upload to S3
      await this.s3Client.putObject({
        Bucket: this.config.bucket,
        Key: key,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type || getMimeType(file),
        ACL: ObjectCannedACL.public_read,
      });

      // Get signed URL for the file
      const raw_url = await this.getSignedUrl(key, file.name);

      const updateAction = {
        action: UPDATE_FILE as "UPDATE_FILE",
        payload: {
          id: fileID,
          raw_url,
        },
      };

      // Dispatch action to create file record
      config.metadata?.dispatch(
        updateFileAction(updateAction, config.listDirectoryKey, true)
      );

      // Save resumable metadata (not strictly necessary for simple uploads, but good for consistency)
      await this.saveResumableMetadata(
        uploadId,
        file,
        config,
        key,
        startTime,
        true
      );

      // Send completion progress
      progressSubject.next({
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
      });

      progressSubject.complete();
    } catch (error) {
      console.error("Error in simple upload:", error);
      progressSubject.error(error);
    }
  }

  private async getSignedUrl(key: string, fileName?: string): Promise<string> {
    if (!this.s3Client || !this.config) {
      throw new Error("S3 adapter not initialized");
    }

    // 1 week in seconds (7 days * 24 hours * 60 minutes * 60 seconds)
    const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ...(fileName && {
        ResponseContentDisposition: `inline; filename="${fileName}"`,
      }),
    });

    try {
      // Using AWS SDK v3 signature
      return await getSignedUrl(this.s3Client, command, {
        expiresIn: ONE_WEEK_IN_SECONDS,
      });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }

  /**
   * Start a multipart upload for larger files
   */
  private async startMultipartUpload(
    uploadId: UploadID,
    file: File,
    config: UploadConfig,
    key: string,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal
  ): Promise<void> {
    if (!this.s3Client || !this.config) {
      progressSubject.error(new Error("S3 adapter not initialized"));
      return;
    }

    const startTime = Date.now();
    const partSize = this.config.partSize || 5 * 1024 * 1024; // Default to 5MB parts
    const totalParts = Math.ceil(file.size / partSize);
    const parts: CompletedPart[] = [];
    let s3UploadId: string;
    let uploadedBytes = 0;

    try {
      const fileID = await this.createFileRecord(file, config, uploadId);
      // Create multipart upload
      const createResponse = await this.s3Client.send(
        new CreateMultipartUploadCommand({
          Bucket: this.config.bucket,
          Key: key,
          ContentType: file.type || getMimeType(file),
          ACL: this.config.acl || "public-read",
          ...(config.metadata && {
            Metadata: this.flattenMetadata(config.metadata),
          }),
        })
      );

      s3UploadId = createResponse.UploadId!;

      // Update active upload with S3 upload ID
      const activeUpload = this.activeUploads.get(uploadId);
      if (activeUpload) {
        activeUpload.uploadId = s3UploadId;
      }

      // Save initial metadata for resume capability
      const metadata: ResumableUploadMetadata = {
        id: uploadId,
        fileID: config.fileID,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || getMimeType(file),
        fileLastModified: file.lastModified,
        uploadStartTime: startTime,
        lastUpdateTime: startTime,
        diskType: config.diskType,
        diskID: config.diskID,
        uploadedChunks: [],
        totalChunks: totalParts,
        chunkSize: partSize,
        parentFolderID: config.parentFolderID,
        customMetadata: {
          ...config.metadata,
          s3Key: key,
          s3UploadId: s3UploadId,
          s3Bucket: this.config.bucket,
        },
      };

      // Save metadata
      await this.saveResumableMetadata(
        uploadId,
        file,
        config,
        key,
        startTime,
        false,
        metadata
      );

      // Upload parts sequentially
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        if (signal.aborted) {
          // Abort the multipart upload in S3
          await this.s3Client.send(
            new AbortMultipartUploadCommand({
              Bucket: this.config.bucket,
              Key: key,
              UploadId: s3UploadId,
            })
          );
          progressSubject.error(new Error("Upload cancelled"));
          return;
        }

        // Calculate chunk boundaries
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        const chunkSize = end - start;

        // Slice the file
        const chunk = file.slice(start, end);

        // Read the chunk
        const chunkBuffer = await this.readFileAsArrayBuffer(chunk);

        // Upload the part
        const uploadPartResponse = await this.s3Client.send(
          new UploadPartCommand({
            Bucket: this.config.bucket,
            Key: key,
            PartNumber: partNumber,
            UploadId: s3UploadId,
            Body: new Uint8Array(chunkBuffer),
          })
        );

        // Add to completed parts
        parts.push({
          PartNumber: partNumber,
          ETag: uploadPartResponse.ETag!,
        });

        // Update progress
        uploadedBytes += chunkSize;
        const progress = Math.floor((uploadedBytes / file.size) * 100);

        // Update metadata
        metadata.uploadedChunks.push(partNumber - 1); // 0-based index for consistency with IndexedDB
        metadata.lastUpdateTime = Date.now();
        await this.saveResumableMetadata(
          uploadId,
          file,
          config,
          key,
          startTime,
          false,
          metadata
        );

        // Send progress update
        progressSubject.next({
          id: uploadId,
          fileID: config.fileID,
          fileName: file.name,
          state: UploadState.ACTIVE,
          progress,
          bytesUploaded: uploadedBytes,
          bytesTotal: file.size,
          startTime,
          diskType: config.diskType,
          parentFolderID: config.parentFolderID,
        });
      }

      // Complete multipart upload
      await this.s3Client.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.config.bucket,
          Key: key,
          UploadId: s3UploadId,
          MultipartUpload: { Parts: parts },
        })
      );

      // Set ACL if specified
      if (this.config.acl) {
        await this.s3Client.send(
          new PutObjectAclCommand({
            Bucket: this.config.bucket,
            Key: key,
            ACL: this.config.acl as ObjectCannedACL,
          })
        );
      }

      // Mark as complete
      await this.saveResumableMetadata(
        uploadId,
        file,
        config,
        key,
        startTime,
        true
      );

      // Send completion progress
      progressSubject.next({
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
      });

      progressSubject.complete();

      const raw_url = await this.getSignedUrl(key, file.name);

      const updateAction = {
        action: UPDATE_FILE as "UPDATE_FILE",
        payload: {
          id: fileID || config.fileID,
          raw_url,
        },
      };

      // Dispatch action to update file record with URL
      config.metadata?.dispatch(
        updateFileAction(updateAction, config.listDirectoryKey, true)
      );
    } catch (error) {
      console.error("Error in multipart upload:", error);
      progressSubject.error(error);
    }
  }

  private async createFileRecord(
    file: File,
    config: UploadConfig,
    uploadId: UploadID
  ): Promise<FileID> {
    try {
      // Generate a file ID or use the one from metadata
      const fileID = config.fileID || GenerateID.File();

      // Need dispatch function to be in metadata for Redux integration
      if (!config.metadata?.dispatch) {
        throw new Error("Redux dispatch function is required in the metadata");
      }
      const extension = file.name.split(".").pop();
      const key = `${fileID}.${extension}`;

      const dispatch = config.metadata.dispatch;

      // Prepare the create file action
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
          expires_at: getNextUtcMidnight(),
        },
      };

      // Dispatch action to create file record
      dispatch(createFileAction(createAction, config.listDirectoryKey, true));

      // Wait for the record to be created
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return fileID;
    } catch (error) {
      console.error("Error creating file record:", error);
      throw error;
    }
  }

  /**
   * Read a file or blob as ArrayBuffer
   */
  private readFileAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Save resumable metadata
   */
  private async saveResumableMetadata(
    uploadId: UploadID,
    file: File,
    config: UploadConfig,
    key: string,
    startTime: number,
    isComplete: boolean,
    existingMetadata?: ResumableUploadMetadata
  ): Promise<void> {
    // This could be stored in localStorage or IndexedDB
    // For simplicity, we'll use localStorage
    try {
      const metadata: ResumableUploadMetadata = existingMetadata || {
        id: uploadId,
        fileID: config.fileID,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || getMimeType(file),
        fileLastModified: file.lastModified,
        uploadStartTime: startTime,
        lastUpdateTime: Date.now(),
        diskType: config.diskType,
        diskID: config.diskID,
        uploadedChunks: [],
        totalChunks: 1,
        chunkSize: file.size,
        parentFolderID: config.parentFolderID,
        customMetadata: {
          ...config.metadata,
          s3Key: key,
          s3Bucket: this.config?.bucket,
          isComplete,
        },
      };

      // If complete, mark it
      if (isComplete) {
        metadata.customMetadata = {
          ...metadata.customMetadata,
          isComplete: true,
        };
      }

      // Save to localStorage
      localStorage.setItem(`s3adapter_${uploadId}`, JSON.stringify(metadata));
    } catch (error) {
      console.error("Error saving resumable metadata:", error);
    }
  }

  /**
   * Pause an active upload
   */
  public async pauseUpload(id: UploadID): Promise<boolean> {
    const activeUpload = this.activeUploads.get(id);
    if (!activeUpload) {
      console.warn(`Cannot pause upload ${id}: not found or not active`);
      return false;
    }

    // Abort the current upload process
    activeUpload.controller.abort();

    // Keep the S3 multipart upload intact so it can be resumed

    // Remove from active uploads
    this.activeUploads.delete(id);

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
    if (!this.s3Client || !this.config) {
      throw new Error("S3 adapter not initialized");
    }

    // Create progress subject
    const progress = new Subject<UploadProgressInfo>();

    // Create abort controller
    const controller = new AbortController();

    // Get resumable metadata
    this.getResumableUploadMetadata(id)
      .then(async (metadata) => {
        if (!metadata) {
          progress.error(new Error("No resumable metadata found"));
          return;
        }

        // Validate file
        if (!this.validateFileForResume(metadata, file)) {
          progress.error(new Error("File does not match the paused upload"));
          return;
        }

        // Add to active uploads
        this.activeUploads.set(id, { controller, progress });

        // Get S3 key and uploadId from metadata
        const key = metadata.customMetadata?.s3Key as string;
        const s3UploadId = metadata.customMetadata?.s3UploadId as string;

        console.log(`s3 key`, key);

        if (!key) {
          progress.error(new Error("S3 key not found in metadata"));
          return;
        }

        // If it was a simple upload or is already complete, can't resume
        if (metadata.customMetadata?.isComplete) {
          // Already complete - just return 100%
          progress.next({
            id,
            fileID,
            fileName: file.name,
            state: UploadState.COMPLETED,
            progress: 100,
            bytesUploaded: file.size,
            bytesTotal: file.size,
            startTime: metadata.uploadStartTime,
            diskType: metadata.diskType,
            parentFolderID: metadata.parentFolderID,
          });
          progress.complete();
          return;
        }

        // If no S3 upload ID, it was a simple upload that failed
        if (!s3UploadId) {
          // Start a new simple upload
          this.startSimpleUpload(
            id,
            file,
            {
              file,
              fileID,
              parentFolderID: metadata.parentFolderID,
              diskType: metadata.diskType,
              diskID: metadata.diskID,
              metadata: metadata.customMetadata,
            },
            key,
            progress,
            controller.signal
          );
          return;
        }

        // Resume multipart upload
        await this.resumeMultipartUpload(
          id,
          file,
          metadata,
          key,
          s3UploadId,
          progress,
          controller.signal
        );
      })
      .catch((error) => {
        console.error("Error resuming upload:", error);
        progress.error(error);
      });

    // Return observable
    return progress.asObservable().pipe(
      finalize(() => {
        // Remove from active uploads when complete or error
        this.activeUploads.delete(id);
      })
    );
  }

  /**
   * Resume a multipart upload
   */
  private async resumeMultipartUpload(
    uploadId: UploadID,
    file: File,
    metadata: ResumableUploadMetadata,
    key: string,
    s3UploadId: string,
    progressSubject: Subject<UploadProgressInfo>,
    signal: AbortSignal
  ): Promise<void> {
    if (!this.s3Client || !this.config) {
      progressSubject.error(new Error("S3 adapter not initialized"));
      return;
    }

    const parts: CompletedPart[] = [];
    const uploadedChunks = new Set(metadata.uploadedChunks);
    let uploadedBytes = 0;

    try {
      // First, list the parts that were already uploaded to S3
      // Calculate uploaded bytes based on uploaded chunks
      for (const chunkIndex of uploadedChunks) {
        const partNumber = chunkIndex + 1; // Convert to 1-based for S3
        const chunkSize =
          partNumber < metadata.totalChunks
            ? metadata.chunkSize
            : file.size % metadata.chunkSize || metadata.chunkSize;

        uploadedBytes += chunkSize;

        // We don't have the ETags for already uploaded parts, so we need to re-upload them
        // This is a limitation of the AWS SDK - in a production environment, you would
        // implement proper part listing to get ETags
      }

      // Send initial progress
      progressSubject.next({
        id: uploadId,
        fileID: metadata.fileID,
        fileName: file.name,
        state: UploadState.ACTIVE,
        progress: Math.floor((uploadedBytes / file.size) * 100),
        bytesUploaded: uploadedBytes,
        bytesTotal: file.size,
        startTime: metadata.uploadStartTime,
        diskType: metadata.diskType,
        parentFolderID: metadata.parentFolderID,
      });

      // Start from the beginning, skipping already uploaded parts
      // This is a workaround for the ETags issue mentioned above
      for (
        let partNumber = 1;
        partNumber <= metadata.totalChunks;
        partNumber++
      ) {
        if (signal.aborted) {
          // Don't abort the S3 multipart upload - we may want to resume later
          progressSubject.error(new Error("Upload cancelled"));
          return;
        }

        // Calculate chunk boundaries
        const chunkIndex = partNumber - 1;
        const start = chunkIndex * metadata.chunkSize;
        const end = Math.min(start + metadata.chunkSize, file.size);
        const chunkSize = end - start;

        // Skip already uploaded chunks
        if (uploadedChunks.has(chunkIndex)) {
          // Add placeholder for part
          parts.push({
            PartNumber: partNumber,
            ETag: "placeholder", // Will be replaced in the loop below
          });
          continue;
        }

        // Slice the file
        const chunk = file.slice(start, end);

        // Read the chunk
        const chunkBuffer = await this.readFileAsArrayBuffer(chunk);

        // Upload the part
        const uploadPartResponse = await this.s3Client.send(
          new UploadPartCommand({
            Bucket: this.config.bucket,
            Key: key,
            PartNumber: partNumber,
            UploadId: s3UploadId,
            Body: new Uint8Array(chunkBuffer),
          })
        );

        // Add to completed parts
        parts[partNumber - 1] = {
          PartNumber: partNumber,
          ETag: uploadPartResponse.ETag!,
        };

        // Update progress
        uploadedBytes += chunkSize;
        const progress = Math.floor((uploadedBytes / file.size) * 100);

        // Update metadata
        uploadedChunks.add(chunkIndex);
        metadata.uploadedChunks = Array.from(uploadedChunks);
        metadata.lastUpdateTime = Date.now();
        await this.saveResumableMetadata(
          uploadId,
          file,
          {
            file,
            fileID: metadata.fileID,
            parentFolderID: metadata.parentFolderID,
            diskType: metadata.diskType,
            diskID: metadata.diskID,
            metadata: metadata.customMetadata,
          },
          key,
          metadata.uploadStartTime,
          false,
          metadata
        );

        // Send progress update
        progressSubject.next({
          id: uploadId,
          fileID: metadata.fileID,
          fileName: file.name,
          state: UploadState.ACTIVE,
          progress,
          bytesUploaded: uploadedBytes,
          bytesTotal: file.size,
          startTime: metadata.uploadStartTime,
          diskType: metadata.diskType,
          parentFolderID: metadata.parentFolderID,
        });
      }

      // Verify all parts have valid ETags
      // Since we used placeholders for already uploaded parts, we need to re-upload them
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].ETag === "placeholder") {
          const partNumber = i + 1;
          const start = i * metadata.chunkSize;
          const end = Math.min(start + metadata.chunkSize, file.size);

          // Slice the file
          const chunk = file.slice(start, end);

          // Read the chunk
          const chunkBuffer = await this.readFileAsArrayBuffer(chunk);

          // Upload the part
          const uploadPartResponse = await this.s3Client.send(
            new UploadPartCommand({
              Bucket: this.config.bucket,
              Key: key,
              PartNumber: partNumber,
              UploadId: s3UploadId,
              Body: new Uint8Array(chunkBuffer),
            })
          );

          // Replace placeholder
          parts[i] = {
            PartNumber: partNumber,
            ETag: uploadPartResponse.ETag!,
          };
        }
      }

      // Complete multipart upload
      await this.s3Client.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.config.bucket,
          Key: key,
          UploadId: s3UploadId,
          MultipartUpload: { Parts: parts },
        })
      );

      // Set ACL if specified
      if (this.config.acl) {
        await this.s3Client.send(
          new PutObjectAclCommand({
            Bucket: this.config.bucket,
            Key: key,
            ACL: this.config.acl as ObjectCannedACL,
          })
        );
      }

      // Mark as complete
      await this.saveResumableMetadata(
        uploadId,
        file,
        {
          file,
          fileID: metadata.fileID,
          parentFolderID: metadata.parentFolderID,
          diskType: metadata.diskType,
          diskID: metadata.diskID,
          metadata: metadata.customMetadata,
        },
        key,
        metadata.uploadStartTime,
        true
      );

      // Send completion progress
      progressSubject.next({
        id: uploadId,
        fileID: metadata.fileID,
        fileName: file.name,
        state: UploadState.COMPLETED,
        progress: 100,
        bytesUploaded: file.size,
        bytesTotal: file.size,
        startTime: metadata.uploadStartTime,
        diskType: metadata.diskType,
        parentFolderID: metadata.parentFolderID,
      });

      progressSubject.complete();
    } catch (error) {
      console.error("Error resuming multipart upload:", error);
      progressSubject.error(error);
    }
  }

  /**
   * Cancel an active upload
   */
  public async cancelUpload(id: UploadID): Promise<boolean> {
    if (!this.s3Client || !this.config) {
      return false;
    }

    const activeUpload = this.activeUploads.get(id);

    // Abort the current upload process if active
    if (activeUpload) {
      activeUpload.controller.abort();
      this.activeUploads.delete(id);
    }

    // Get the metadata to find the S3 upload ID
    try {
      const metadata = await this.getResumableUploadMetadata(id);

      if (metadata && metadata.customMetadata) {
        const s3UploadId = metadata.customMetadata.s3UploadId as string;
        const key = metadata.customMetadata.s3Key as string;

        if (s3UploadId && key) {
          // Abort the multipart upload in S3
          await this.s3Client.send(
            new AbortMultipartUploadCommand({
              Bucket: this.config.bucket,
              Key: key,
              UploadId: s3UploadId,
            })
          );
        }
      }

      // Remove metadata
      localStorage.removeItem(`s3adapter_${id}`);

      return true;
    } catch (error) {
      console.error("Error cancelling upload:", error);
      return false;
    }
  }

  /**
   * Get the upload status
   */
  public async getUploadStatus(
    id: UploadID
  ): Promise<UploadProgressInfo | null> {
    try {
      // Check if upload is active
      const active = this.activeUploads.has(id);

      if (active) {
        // Status will be provided through the observable
        return null;
      }

      // Get metadata
      const metadata = await this.getResumableUploadMetadata(id);

      if (!metadata) {
        return null;
      }

      // Calculate progress
      const uploadedChunks = metadata.uploadedChunks.length;
      const totalChunks = metadata.totalChunks;
      const progress = Math.floor((uploadedChunks / totalChunks) * 100);

      // Calculate bytes uploaded
      let bytesUploaded = 0;
      for (let i = 0; i < uploadedChunks; i++) {
        const chunkIndex = metadata.uploadedChunks[i];
        const isLastChunk = chunkIndex === totalChunks - 1;
        const chunkSize = isLastChunk
          ? metadata.fileSize % metadata.chunkSize || metadata.chunkSize
          : metadata.chunkSize;

        bytesUploaded += chunkSize;
      }

      const state = metadata.customMetadata?.isComplete
        ? UploadState.COMPLETED
        : UploadState.PAUSED;

      return {
        id,
        fileID: metadata.fileID,
        fileName: metadata.fileName,
        state,
        progress: state === UploadState.COMPLETED ? 100 : progress,
        bytesUploaded:
          state === UploadState.COMPLETED ? metadata.fileSize : bytesUploaded,
        bytesTotal: metadata.fileSize,
        startTime: metadata.uploadStartTime,
        diskType: metadata.diskType,
        parentFolderID: metadata.parentFolderID,
      };
    } catch (error) {
      console.error("Error getting upload status:", error);
      return null;
    }
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
      maxConcurrentUploads: 5,
      recommendedChunkSize: 5 * 1024 * 1024, // 5MB
    };
  }

  /**
   * Get resumable upload metadata
   */
  public async getResumableUploadMetadata(
    id: UploadID
  ): Promise<ResumableUploadMetadata | null> {
    try {
      const metadataStr = localStorage.getItem(`s3adapter_${id}`);
      if (!metadataStr) {
        return null;
      }

      return JSON.parse(metadataStr) as ResumableUploadMetadata;
    } catch (error) {
      console.error("Error getting resumable metadata:", error);
      return null;
    }
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
   * Cleanup upload resources
   */
  public async cleanup(): Promise<void> {
    // Cleanup storage keys older than 7 days
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith("s3adapter_")) {
          const metadataStr = localStorage.getItem(key);
          if (metadataStr) {
            try {
              const metadata = JSON.parse(metadataStr);
              if (metadata.lastUpdateTime < sevenDaysAgo) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              // Invalid JSON, remove it
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up S3 adapter:", error);
    }
  }

  /**
   * Flatten metadata to comply with S3 metadata requirements
   * S3 metadata keys must be strings and values must be strings
   */
  private flattenMetadata(
    metadata: Record<string, any>
  ): Record<string, string> {
    console.log(`flatten metadata`, metadata);
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === "object") {
        result[key] = JSON.stringify(value);
      } else {
        result[key] = String(value);
      }
    }
    delete result.dispatch;

    return result;
  }
}
