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
} from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlS3 } from "@aws-sdk/s3-request-presigner"; // For signed URLs
import { Observable, Observer } from "rxjs";
import { getMimeType } from "../helpers";
import { FileMetadataFragment, FileUUID } from "../types";

// Constants for localStorage keys
export const LOCAL_STORAGE_STORJ_ACCESS_KEY = "STORJ_ACCESS_KEY";
export const LOCAL_STORAGE_STORJ_SECRET_KEY = "STORJ_SECRET_KEY";
export const LOCAL_STORAGE_STORJ_ENDPOINT = "STORJ_ENDPOINT";

export interface S3ClientAuth {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  defaultBucketName?: string;
}

export type UploadableFile = File;

export class StorjClient {
  private static instance: StorjClient | null = null;
  private static s3: S3 | null = null;
  private static DEFAULT_BUCKET: string = "officex";

  private constructor() {}

  // Initialize the S3 client instance
  public static async initialize(auth: S3ClientAuth): Promise<void> {
    if (!StorjClient.instance || !StorjClient.s3) {
      StorjClient.instance = new StorjClient();
      StorjClient.s3 = new S3({
        credentials: {
          accessKeyId: auth.accessKeyId,
          secretAccessKey: auth.secretAccessKey,
        },
        endpoint: auth.endpoint,
        region: "us-east-1", // Add a dummy region since it's required
        forcePathStyle: true,
      });
      if (auth.defaultBucketName) {
        StorjClient.DEFAULT_BUCKET = auth.defaultBucketName;
      }

      // const command = new ListBucketsCommand({});
      // await StorjClient.s3.send(command);
      // console.log("Successfully connected to Storj");

      // await StorjClient.ensureDefaultBucket();
    } else {
      console.warn(
        "StorjClient.instance & StorjClient.s3 is already initialized."
      );
    }
  }

  // Ensure the default bucket exists
  public static async ensureDefaultBucket(): Promise<void> {
    if (!StorjClient.s3) {
      throw new Error(
        "S3Client is not initialized. Please call initialize() first."
      );
    }

    const maxRetries = 5;
    const retryDelay = 4000; // 2 seconds

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const command = new HeadBucketCommand({
          Bucket: StorjClient.DEFAULT_BUCKET,
        });
        await StorjClient.s3.send(command);
        console.log(
          `Default bucket ${StorjClient.DEFAULT_BUCKET} already exists.`
        );
        return;
      } catch (error) {
        if ((error as any).name === "NotFound") {
          try {
            const createCommand = new CreateBucketCommand({
              Bucket: StorjClient.DEFAULT_BUCKET,
            });
            await StorjClient.s3.send(createCommand);
            console.log(
              `Created default bucket: ${StorjClient.DEFAULT_BUCKET}`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          } catch (createError) {
            console.error(`Error creating bucket: ${createError}`);
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
    throw new Error(
      `Failed to ensure default bucket after ${maxRetries} attempts`
    );
  }

  // Retrieve the S3 client instance
  public static getInstance() {
    if (!StorjClient.instance) {
      throw new Error(
        "StorjClient is not initialized. Please call initialize() first."
      );
    }
    return StorjClient.instance;
  }

  public static getS3Client() {
    if (!StorjClient.s3) {
      throw new Error("S3 is not initialized. Please call initialize() first.");
    }
    return StorjClient.s3;
  }

  // List objects in a bucket
  public static async listObjects() {
    if (!StorjClient.s3) {
      throw new Error("S3 is not initialized. Please call initialize() first.");
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: StorjClient.DEFAULT_BUCKET,
      });
      const response = await StorjClient.s3.send(command);
      return response; // This should return the response, including `Contents` array
    } catch (error) {
      console.error("Error listing objects: ", error);
      throw error;
    }
  }

  public static uploadObject(
    id: FileUUID,
    key: string,
    file: UploadableFile
  ): Observable<{ progress: number; metadataFragment: FileMetadataFragment }> {
    return new Observable(
      (
        observer: Observer<{
          progress: number;
          metadataFragment: FileMetadataFragment;
        }>
      ) => {
        let uploadId: string;
        const partSize = 5 * 1024 * 1024; // 1MB part size
        const totalSize = file.size;
        let uploadedSize = 0;
        const parts: CompletedPart[] = [];
        let currentPartNumber = 1;
        let isCancelled = false;

        const initializeMultipartUpload = async () => {
          const params = {
            Bucket: StorjClient.DEFAULT_BUCKET,
            Key: key,
          };
          const result = await StorjClient.s3!.createMultipartUpload(params);
          uploadId = result.UploadId!;
        };

        const uploadPart = async (partNumber: number, chunk: Uint8Array) => {
          const params = {
            Bucket: StorjClient.DEFAULT_BUCKET,
            Key: key,
            PartNumber: partNumber,
            UploadId: uploadId,
            Body: chunk,
          };
          const result = await StorjClient.s3!.uploadPart(params);
          return { PartNumber: partNumber, ELabel: result.ETag };
        };

        const completeMultipartUpload = async () => {
          const params = {
            Bucket: StorjClient.DEFAULT_BUCKET,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: parts },
          };
          await StorjClient.s3!.completeMultipartUpload(params);
        };

        const abortMultipartUpload = async () => {
          if (!uploadId) {
            console.warn("No uploadId available, skipping abort");
            return;
          }
          const params = {
            Bucket: StorjClient.DEFAULT_BUCKET,
            Key: key,
            UploadId: uploadId,
          };
          try {
            await StorjClient.s3!.abortMultipartUpload(params);
          } catch (error) {
            console.error(`Error aborting multipart upload: ${error}`);
          }
        };

        const updateProgress = async (chunkSize: number) => {
          uploadedSize += chunkSize;
          const progress = Math.round((uploadedSize / totalSize) * 100);
          let rawURL = "";
          if (progress === 100) {
            rawURL = await StorjClient.getSignedUrl({
              key,
              customFilename: file.name,
            });
          }
          const metadataFragment: FileMetadataFragment = {
            id,
            name: file.name,
            mimeType: file.type || getMimeType(file),
            fileSize: uploadedSize,
            rawURL, // We'll update this at the end
          };
          observer.next({ progress, metadataFragment });
        };

        const upload = async () => {
          try {
            if (!StorjClient.s3) {
              throw new Error(
                "S3 is not initialized. Please call initialize() first."
              );
            }

            await initializeMultipartUpload();

            const reader = new FileReader();
            let start = 0;

            const readNextChunk = () => {
              if (start < file.size) {
                const end = Math.min(start + partSize, file.size);
                const chunk = file.slice(start, end);
                reader.readAsArrayBuffer(chunk);
              } else {
                completeUpload();
              }
            };

            reader.onload = async (e) => {
              if (isCancelled) {
                await abortMultipartUpload();
                observer.complete();
                return;
              }

              const chunk = new Uint8Array(e.target!.result as ArrayBuffer);
              const part = await uploadPart(currentPartNumber, chunk);
              parts.push(part);
              currentPartNumber++;

              await updateProgress(chunk.length); // Update progress after each part upload

              start += partSize;
              readNextChunk();
            };

            reader.onerror = (error) => {
              observer.error(error);
            };

            readNextChunk();

            const completeUpload = async () => {
              await completeMultipartUpload();
              const signedUrl = await StorjClient.getSignedUrl({
                key,
                customFilename: file.name,
              });
              const finalMetadataFragment: FileMetadataFragment = {
                id,
                name: file.name,
                mimeType: file.type || getMimeType(file),
                fileSize: totalSize,
                rawURL: signedUrl,
              };
              observer.next({
                progress: 100,
                metadataFragment: finalMetadataFragment,
              });
              const input = {
                ACL: ObjectCannedACL.public_read, // keep it public for now
                Bucket: StorjClient.DEFAULT_BUCKET,
                Key: key,
              };
              const command = new PutObjectAclCommand(input);
              await StorjClient.s3!.send(command);
              observer.complete();
            };
          } catch (error) {
            console.error(`Error uploading object: ${error}`);
            await abortMultipartUpload();
            observer.error(error);
          }
        };

        upload();

        return () => {
          isCancelled = true;
        };
      }
    );
  }

  // Update getSignedUrl to be async and return a Promise
  public static async getSignedUrl({
    key,
    expires = 3600 * 24 * 7, // Default to 7 days for now
    customFilename,
  }: {
    key: string;
    expires?: number;
    customFilename?: string;
  }): Promise<string> {
    if (!StorjClient.s3) {
      throw new Error("S3 is not initialized. Please call initialize() first.");
    }

    const isPDF =
      key.toLowerCase().endsWith(".pdf") ||
      customFilename?.toLowerCase().endsWith(".pdf");

    const command = new GetObjectCommand({
      Bucket: StorjClient.DEFAULT_BUCKET,
      Key: key,
      ...(isPDF && { ResponseContentType: "application/pdf" }),
      ...(customFilename && {
        ResponseContentDisposition: `inline; filename="${customFilename}"`,
      }),
    });

    try {
      const url = await getSignedUrlS3(StorjClient.s3!, command, {
        expiresIn: expires,
      });
      return url;
    } catch (error) {
      console.error(`Error generating signed URL: ${error}`);
      throw error;
    }
  }
}
