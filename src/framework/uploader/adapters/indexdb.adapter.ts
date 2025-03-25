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
import { DiskTypeEnum, FileID, GenerateID } from "@officexapp/types";
import { defaultBrowserCacheDiskID } from "../../../api/dexie-database";
import {
  CREATE_FILE,
  createFileAction,
} from "../../../redux-offline/directory/directory.actions";

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
      // console.log("IndexedDBAdapter already initialized");
      return;
    }

    if (config) {
      this.DB_NAME = config.databaseName || this.DB_NAME;
      this.FILES_STORE_NAME = config.objectStoreName || this.FILES_STORE_NAME;
    }

    // console.log(`Initializing IndexedDB adapter with:
    //     - Database: ${this.DB_NAME}
    //     - Files store: ${this.FILES_STORE_NAME}
    //     - Chunks store: ${this.CHUNKS_STORE_NAME}
    //     - Metadata store: ${this.METADATA_STORE_NAME}
    //   `);

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
          // console.log("IndexedDB opened successfully");

          // Log existing stores for debugging
          // console.log(
          //   "Available object stores:",
          //   Array.from(this.db.objectStoreNames)
          // );

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
              // console.log("Creating missing object stores");

              // Create missing stores
              for (const storeName of missingStores) {
                if (!db.objectStoreNames.contains(storeName)) {
                  // console.log(`Creating object store: ${storeName}`);
                  db.createObjectStore(storeName, { keyPath: "id" });
                }
              }
            };

            reopenRequest.onsuccess = (event) => {
              this.db = (event.target as IDBOpenDBRequest).result;
              // console.log("IndexedDB reopened with all required stores");
              // console.log(
              //   "Available object stores:",
              //   Array.from(this.db.objectStoreNames)
              // );
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
            // console.log("All required object stores found");
            resolve();
          }
        };

        request.onupgradeneeded = (event) => {
          // console.log("Upgrading IndexedDB database structure");
          const db = (event.target as IDBOpenDBRequest).result;

          // Create all required stores if they don't exist
          const requiredStores = [
            this.FILES_STORE_NAME,
            this.CHUNKS_STORE_NAME,
            this.METADATA_STORE_NAME,
          ];

          // Check and create each required store
          requiredStores.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              // console.log(`Creating object store: ${storeName}`);
              db.createObjectStore(storeName, { keyPath: "id" });
            }
          });
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
    fileID: FileID,
    file: File,
    config: UploadConfig
  ): Observable<UploadProgressInfo> {
    console.log(`..uploadFile config`, config);
    if (!this.db) {
      return of({
        id: config.file.name as UploadID,
        fileID,
        fileName: config.file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: config.file.size,
        startTime: Date.now(),
        diskType: config.diskType,
        errorMessage: "IndexedDB not initialized",
        parentFolderID: config.parentFolderID,
      }).pipe(
        tap(() => {
          console.error("IndexedDB not initialized");
        })
      );
    }

    // Use the ID from metadata if provided, otherwise generate a new one
    // This is critical to ensure consistency
    const uploadId =
      (config.metadata?.id as UploadID) || (uuidv4() as UploadID);

    // console.log(
    //   `IndexedDBAdapter: Starting upload with ID: ${uploadId} for file: ${config.file.name}`
    // );

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

  private async createFileRecord(
    file: File,
    config: UploadConfig,
    uploadId: UploadID
  ): Promise<FileID> {
    try {
      console.log(`createFileRecord, config`, config);
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
          parent_folder_uuid: config.parentFolderID,
          extension: file.name.split(".").pop() || "",
          labels: [],
          file_size: file.size,
          disk_id: config.diskID,
          disk_type: config.diskType,
        },
      };

      // console.log("Creating file record with action:", createAction);

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

    const fileId = await this.createFileRecord(file, config, uploadId);

    console.log(`>> fileId`, fileId);

    // Store metadata for resume capability
    const metadata: ResumableUploadMetadata = {
      id: uploadId,
      fileID: fileId || config.fileID,
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
      parentFolderID: config.parentFolderID,
      customMetadata: config.metadata,
    };

    // Save initial metadata
    this.saveMetadata(metadata)
      .then(() => {
        // Start processing chunks only after metadata is saved
        processNextChunk(0);
      })
      .catch((error) => {
        console.error("Error saving metadata:", error);
        progressSubject.error(error);
      });

    // Function to read and store a chunk
    const processNextChunk = async (chunkIndex: number) => {
      if (signal.aborted) {
        progressSubject.error(new Error("Upload cancelled"));
        return;
      }

      // Calculate chunk boundaries
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      try {
        // Store the chunk - wait for it to complete
        await this.storeChunk(uploadId, config.fileID, chunkIndex, chunk);

        // Update progress
        chunksUploaded++;
        bytesUploaded += end - start;

        // Update metadata for resume capability
        metadata.uploadedChunks.push(chunkIndex);
        metadata.lastUpdateTime = Date.now();
        await this.saveMetadata(metadata);

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
          parentFolderID: config.parentFolderID,
        };

        progressSubject.next(progress);

        // If all chunks uploaded, finalize
        if (chunksUploaded === totalChunks) {
          await this.finalizeUpload(uploadId, config.fileID, file, config);
          progressSubject.complete();
        } else {
          // Process next chunk
          processNextChunk(chunkIndex + 1);
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        progressSubject.error(error);
      }
    };
  }

  /**
   * Store a chunk in IndexedDB
   */
  private storeChunk(
    uploadId: UploadID,
    fileID: FileID,
    chunkIndex: number,
    chunkBlob: Blob
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      // First, read the blob into an array buffer
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const chunkData = e.target?.result as ArrayBuffer;

          // Create a new transaction AFTER the file is read
          const transaction = this.db!.transaction(
            [this.CHUNKS_STORE_NAME],
            "readwrite"
          );

          const store = transaction.objectStore(this.CHUNKS_STORE_NAME);

          const request = store.put({
            id: `${fileID}_chunk_${chunkIndex}`,
            fileID,
            chunkIndex,
            data: new Uint8Array(chunkData),
            timestamp: Date.now(),
          });

          request.onsuccess = () => resolve();

          request.onerror = (event) => {
            console.error(
              "Error storing chunk:",
              (event.target as IDBRequest).error
            );
            reject(new Error("Failed to store chunk"));
          };

          // Listen for transaction completion or abort
          transaction.oncomplete = () => {
            resolve();
          };

          transaction.onerror = (event) => {
            console.error(
              "Transaction error:",
              (event.target as IDBTransaction).error
            );
            reject((event.target as IDBTransaction).error);
          };
        } catch (error) {
          console.error("Error in handling file data:", error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error("Failed to read chunk data:", reader.error);
        reject(new Error("Failed to read chunk"));
      };

      // Start reading the blob
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

      const safeMetadata = { ...metadata };
      // @ts-ignore
      delete safeMetadata.customMetadata.dispatch;
      console.log(`metadata`, metadata);
      console.log(`safeMetadata`, safeMetadata);

      const transaction = this.db.transaction(
        [this.METADATA_STORE_NAME],
        "readwrite"
      );

      const store = transaction.objectStore(this.METADATA_STORE_NAME);

      const request = store.put({
        ...safeMetadata,
        id: safeMetadata.fileID,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();

      request.onerror = (event) => {
        console.error(
          "Failed to save metadata:",
          (event.target as IDBRequest).error
        );
        reject(new Error("Failed to save metadata"));
      };

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = (event) => {
        console.error(
          "Transaction error saving metadata:",
          (event.target as IDBTransaction).error
        );
        reject((event.target as IDBTransaction).error);
      };
    });
  }

  /**
   * Finalize the upload by saving file metadata
   */
  private finalizeUpload(
    uploadId: UploadID,
    fileID: FileID,
    file: File,
    config: UploadConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      console.log(
        `Finalizing upload for ${uploadId} with file ${file.name} and id ${fileID}`
      );

      const transaction = this.db.transaction(
        [this.FILES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.FILES_STORE_NAME);

      const fileData = {
        id: fileID, // Make sure we're using the same ID as used elsewhere
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        parentFolderID: config.parentFolderID,
        uploadComplete: true,
        uploadCompletedAt: Date.now(),
        metadata: config.metadata || {},
      };

      // console.log("Storing file metadata:", fileData);
      const request = store.put(fileData);
      console.log(`WE GOT IT`);

      request.onsuccess = () => {
        // console.log(`File metadata stored successfully for ${uploadId}`);
        resolve(); // Resolve immediately, thumbnail generation should not block completion

        // Generate thumbnail if it's an image (after resolving)
        if (file.type.startsWith("image/")) {
          this.generateThumbnail(fileID, file).catch((err) =>
            console.warn("Failed to generate thumbnail:", err)
          );
        }
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error(`Failed to save file metadata for ${fileID}:`, error);
        reject(
          new Error(
            `Failed to save file metadata: ${error?.message || "Unknown error"}`
          )
        );
      };

      transaction.onerror = (event) => {
        const error = (event.target as IDBTransaction).error;
        console.error(`Transaction error finalizing upload ${fileID}:`, error);
        reject(error);
      };
    });
  }

  /**
   * Generate a thumbnail for image files
   */
  private async generateThumbnail(fileID: FileID, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

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
          ctx.drawImage(img, -startX, -startY, drawWidth, drawHeight);

          // Get thumbnail data
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create thumbnail blob"));
                return;
              }

              // Create a new transaction for thumbnail
              const transaction = this.db!.transaction(
                [this.FILES_STORE_NAME],
                "readwrite"
              );

              const store = transaction.objectStore(this.FILES_STORE_NAME);

              const request = store.put({
                id: `${fileID}_thumbnail`,
                fileID,
                thumbnail: blob,
                timestamp: Date.now(),
              });

              request.onsuccess = () => resolve();

              request.onerror = (event) => {
                console.error(
                  "Failed to save thumbnail:",
                  (event.target as IDBRequest).error
                );
                reject(new Error("Failed to save thumbnail"));
              };

              transaction.oncomplete = () => {
                resolve();
              };

              transaction.onerror = (event) => {
                console.error(
                  "Transaction error saving thumbnail:",
                  (event.target as IDBTransaction).error
                );
                reject((event.target as IDBTransaction).error);
              };
            },
            "image/jpeg",
            0.8
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image"));
      };

      // Create and use object URL
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      // Cleanup function to revoke object URL when done
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
          ctx.drawImage(img, -startX, -startY, drawWidth, drawHeight);

          // Get thumbnail data and cleanup object URL
          canvas.toBlob(
            (blob) => {
              // Clean up object URL
              URL.revokeObjectURL(objectUrl);

              if (!blob) {
                reject(new Error("Failed to create thumbnail blob"));
                return;
              }

              // Create a new transaction for thumbnail
              const transaction = this.db!.transaction(
                [this.FILES_STORE_NAME],
                "readwrite"
              );

              const store = transaction.objectStore(this.FILES_STORE_NAME);

              const request = store.put({
                id: `${fileID}_thumbnail`,
                fileID,
                thumbnail: blob,
                timestamp: Date.now(),
              });

              request.onsuccess = () => resolve();

              request.onerror = (event) => {
                console.error(
                  "Failed to save thumbnail:",
                  (event.target as IDBRequest).error
                );
                reject(new Error("Failed to save thumbnail"));
              };
            },
            "image/jpeg",
            0.8
          );
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };
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
    fileID: FileID,
    file: File
  ): Observable<UploadProgressInfo> {
    if (!this.db) {
      return of({
        id: id,
        fileID,
        fileName: file.name,
        state: UploadState.FAILED,
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        startTime: Date.now(),
        diskType: DiskTypeEnum.BrowserCache,
        errorMessage: "IndexedDB not initialized",
        parentFolderID: "",
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
        await this.storeChunk(uploadId, metadata.fileID, chunkIndex, chunk);

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
          parentFolderID: metadata.parentFolderID,
        };

        progressSubject.next(progress);

        // If all chunks uploaded, finalize
        if (uploadedChunks.size === totalChunks) {
          const config: UploadConfig = {
            file,
            fileID: metadata.fileID,
            parentFolderID: metadata.parentFolderID,
            diskType: metadata.diskType,
            diskID: defaultBrowserCacheDiskID,
            metadata: metadata.customMetadata,
            chunkSize: metadata.chunkSize,
          };

          await this.finalizeUpload(uploadId, metadata.fileID, file, config);
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
        fileID: metadata.fileID,
        parentFolderID: metadata.parentFolderID,
        diskType: metadata.diskType,
        diskID: defaultBrowserCacheDiskID,
        metadata: metadata.customMetadata,
        chunkSize: metadata.chunkSize,
      };

      this.finalizeUpload(uploadId, metadata.fileID, file, config)
        .then(() => {
          // Emit final progress
          const progress: UploadProgressInfo = {
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
          fileID: fileInfo.id,
          fileName: fileInfo.name,
          state: UploadState.COMPLETED,
          progress: 100,
          bytesUploaded: fileInfo.size,
          bytesTotal: fileInfo.size,
          startTime: fileInfo.uploadCompletedAt - 1000, // Approximate
          diskType: DiskTypeEnum.BrowserCache,
          parentFolderID: fileInfo.parentFolderID,
        };
      }

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
      parentFolderID: metadata.parentFolderID,
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
    id: FileID
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
  public async cleanup(id?: FileID): Promise<void> {
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
   * Get a URL for a file
   */
  public async getFileUrl(id: UploadID): Promise<string | null> {
    try {
      // console.log(`Getting URL for file ${id}`);

      // Check if it's a completed upload
      const fileInfo = await this.getFileInfo(id);
      if (!fileInfo) {
        console.warn(`No file info found for ${id}`);
        return null;
      }

      // console.log(`Found file info for ${id}:`, fileInfo);

      // Reconstruct the file from chunks
      const blob = await this.reconstructFile(id);
      if (!blob) {
        console.error(`Failed to reconstruct file ${id}`);
        return null;
      }

      // console.log(
      //   `Successfully reconstructed file ${id}, blob size: ${blob.size}`
      // );

      // Create and return object URL
      const url = URL.createObjectURL(blob);
      // console.log(`Created URL for ${id}: ${url}`);
      return url;
    } catch (error) {
      console.error(`Error getting file URL for ${id}:`, error);
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
      // Get metadata first
      const metadata = await this.getResumableUploadMetadata(id);

      // Then get file info
      const fileInfo = await this.getFileInfo(id);

      if (!metadata && !fileInfo) {
        console.error(`No metadata or file info found for ${id}`);
        return null;
      }

      // Determine total chunks and chunk size
      const chunkSize = metadata?.chunkSize || 1024 * 1024;
      const totalChunks =
        metadata?.totalChunks ||
        (fileInfo && Math.ceil(fileInfo.size / chunkSize)) ||
        0;

      if (totalChunks === 0) {
        console.error(`Unable to determine total chunks for ${id}`);
        return null;
      }
      if (!metadata) {
        console.warn(`No metadata found for ${id}`);
        return null;
      }

      // console.log(`Reconstructing file ${id} with ${totalChunks} chunks`);
      const chunks: Uint8Array[] = [];

      // Get all chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkData = await this.getChunk(id, metadata.fileID, i);
        if (chunkData) {
          chunks.push(chunkData);
        } else {
          console.warn(`Missing chunk ${i} for file ${id}`);
          // Instead of returning null immediately, we'll log the issue but continue
          // This helps in cases where some chunks might be missing but the file is still usable
        }
      }

      if (chunks.length === 0) {
        console.error(`No chunks found for file ${id}`);
        return null;
      }

      // Create blob from chunks
      const fileType =
        fileInfo?.type || metadata?.fileType || "application/octet-stream";
      // console.log(
      //   `Creating blob with type: ${fileType}, chunks length: ${chunks.length}`
      // );

      return new Blob(chunks, { type: fileType });
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
    fileID: FileID,
    chunkIndex: number
  ): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error("IndexedDB not initialized");
        resolve(null);
        return;
      }

      const chunkId = `${fileID}_chunk_${chunkIndex}`;
      // console.log(`Attempting to retrieve chunk ${chunkId}`);

      const transaction = this.db.transaction(
        [this.CHUNKS_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.CHUNKS_STORE_NAME);

      // Log all keys in the store to see what's available
      const keysRequest = store.getAllKeys();
      keysRequest.onsuccess = () => {
        // console.log(`Available chunk keys:`, keysRequest.result);
        // console.log(`Looking for key: ${chunkId}`);
      };

      const request = store.get(chunkId);

      request.onsuccess = () => {
        if (request.result) {
          // console.log(
          //   `Found chunk ${chunkId}, data size: ${request.result.data?.byteLength || "unknown"}`
          // );
          resolve(request.result.data);
        } else {
          console.warn(`Chunk ${chunkId} not found in store`);
          resolve(null);
        }
      };

      // Other error handling
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

          if (!fileInfo) {
            throw new Error("File not found");
          }
          if (!metadata) {
            throw new Error("Metadata not found");
          }

          const totalChunks =
            metadata?.totalChunks ||
            Math.ceil(fileInfo.size / (metadata?.chunkSize || 1024 * 1024));

          // Stream each chunk
          for (let i = 0; i < totalChunks; i++) {
            const chunkData = await this.getChunk(id, metadata.fileID, i);

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
