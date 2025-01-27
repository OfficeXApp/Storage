// npx vitest run src/framework/drive/tests/drivedb.test.ts > ./test-logs/drivedb.test.log

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import dotenv from "dotenv";
import DriveDB from "../core";
import { StorageLocationEnum, FileUploadStatusEnum } from "../types";
import { lastValueFrom } from "rxjs";
import {
  HeadObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { UserID } from "../../identity/types";
import { S3ClientAuth } from "../storage/storj-web3";
import IndexedDBStorage from "../storage/indexdb";

dotenv.config();

const testBucketName = "officex-drivedb-test";
const mockUserID = "testuser123" as UserID;

describe("DriveDB Upload Tests", () => {
  let driveDB: DriveDB;
  let s3: S3Client;

  beforeAll(async () => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    driveDB = new DriveDB(indexDBStorage);
    await driveDB.initialize();

    const s3Config: S3ClientConfig = {
      credentials: {
        accessKeyId: process.env.STORJ_ACCESS_KEY as string,
        secretAccessKey: process.env.STORJ_SECRET_KEY as string,
      },
      endpoint: process.env.STORJ_ENDPOINT as string,
      forcePathStyle: true,
      region: "us-east-1", // Set a dummy region as it's required
    };
    s3 = new S3Client(s3Config);

    const auth: S3ClientAuth = {
      accessKeyId: process.env.STORJ_ACCESS_KEY as string,
      secretAccessKey: process.env.STORJ_SECRET_KEY as string,
      endpoint: process.env.STORJ_ENDPOINT as string,
      defaultBucketName: testBucketName,
    };

    // Ensure the test bucket exists
    try {
      await s3.send(new CreateBucketCommand({ Bucket: testBucketName }));
    } catch (error: any) {
      if (error.name !== "BucketAlreadyExists") {
        console.error(`Failed to create bucket: ${error.message}`);
        throw error;
      }
    }

    await driveDB.initStorj(auth);

    console.log("DriveDB and StorjClient initialized successfully");
  });

  beforeEach(async () => {
    // Clean the bucket before each test
    await emptyBucket(s3, testBucketName);
  });

  afterAll(async () => {
    console.log("---- finish afterAll ----");
    // Clean up and delete the test bucket after all tests
    try {
      await emptyBucket(s3, testBucketName);
      await s3.send(new DeleteBucketCommand({ Bucket: testBucketName }));
    } catch (error: any) {
      console.error(`Failed to delete bucket: ${error.message}`);
    }
  });

  it("should upload a single file to IndexedDB", async () => {
    const file = new File(["Hello, World!"], "test.txt", {
      type: "text/plain",
    });
    const uploadResult = driveDB.uploadFilesFolders(
      [file],
      "TestFolder",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    const finalProgress = await lastValueFrom(uploadResult.progress$);

    expect(finalProgress.completedFiles).toBe(1);
    expect(finalProgress.totalFiles).toBe(1);
    expect(finalProgress.percentage).toBe(100);

    const uploadedFile = await driveDB.getFileByFullPath(
      "BrowserCache::TestFolder/test.txt"
    );
    expect(uploadedFile).toBeDefined();
    expect(uploadedFile?.originalFileName).toBe("test.txt");

    driveDB.clearQueue();
  }, 60000);

  it("should upload a single file to Storj", async () => {
    const file = new File(["Hello, Storj!"], "storj-test.txt", {
      type: "text/plain",
    });
    const uploadResult = driveDB.uploadFilesFolders(
      [file],
      "StorjTestFolder",
      StorageLocationEnum.Web3Storj,
      mockUserID
    );

    const finalProgress = await lastValueFrom(uploadResult.progress$);
    expect(finalProgress.completedFiles).toBe(1);
    expect(finalProgress.totalFiles).toBe(1);
    expect(finalProgress.percentage).toBe(100);

    const uploadedFile = await driveDB.getFileByFullPath(
      "Web3Storj::StorjTestFolder/storj-test.txt"
    );
    expect(uploadedFile).toBeDefined();
    expect(uploadedFile?.originalFileName).toBe("storj-test.txt");
    expect(uploadedFile?.storageLocation).toBe(StorageLocationEnum.Web3Storj);

    // sleep wait 5 seconds for the upload to complete with eventual consistency
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Verify the file exists in Storj
    const objectExists = await checkObjectExists(
      s3,
      testBucketName,
      `${uploadedFile?.id}.${uploadedFile?.extension}`
    );
    expect(objectExists).toBe(true);

    driveDB.clearQueue();
  }, 30000);

  it("should upload a batch of files and folders to Storj", async () => {
    const files = [
      new File(["File 1"], "file1.txt", { type: "text/plain" }),
      new File(["File 2"], "file2.txt", { type: "text/plain" }),
      new File(["Subfolder File"], "subfolder/file3.txt", {
        type: "text/plain",
      }),
    ];

    const uploadResult = driveDB.uploadFilesFolders(
      files,
      "BatchTestFolder",
      StorageLocationEnum.Web3Storj,
      mockUserID
    );

    const finalProgress = await lastValueFrom(uploadResult.progress$);
    expect(finalProgress.completedFiles).toBe(3);
    expect(finalProgress.totalFiles).toBe(3);
    expect(finalProgress.percentage).toBe(100);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const fileMetadatas = await Promise.all(
      files.map((file) =>
        driveDB.getFileByFullPath(
          `Web3Storj::BatchTestFolder/${file.webkitRelativePath || file.name}`
        )
      )
    );

    for (const file of fileMetadatas) {
      const objectExists = await checkObjectExists(
        s3,
        testBucketName,
        `${file?.id}.${file?.extension}`
      );
      expect(objectExists).toBe(true);
    }

    driveDB.clearQueue();
  }, 30000);

  it("should cancel an ongoing upload", async () => {
    const largeFile = new File(
      [new ArrayBuffer(10 * 1024 * 1024)],
      "large-file.bin"
    );
    const uploadResult = driveDB.uploadFilesFolders(
      [largeFile],
      "CancelTestFolder",
      StorageLocationEnum.Web3Storj,
      mockUserID
    );

    const cancelAfterMs = 100;

    setTimeout(() => {
      const queue = uploadResult.getUploadQueue();
      if (queue.length > 0) {
        uploadResult.cancelUpload(queue[0].id);
      }
    }, cancelAfterMs);

    const finalProgress = await lastValueFrom(uploadResult.progress$);
    expect(finalProgress.completedFiles).toBe(0);
    expect(finalProgress.totalFiles).toBe(1);
    expect(finalProgress.percentage).toBeLessThan(100);

    const queue = uploadResult.getUploadQueue();
    expect(queue[0].status).toBe(FileUploadStatusEnum.Cancelled);

    driveDB.clearQueue();
  }, 30000);

  it("should cancel all ongoing uploads", async () => {
    const files = [
      new File([new ArrayBuffer(5 * 1024 * 1024)], "file1.bin"),
      new File([new ArrayBuffer(5 * 1024 * 1024)], "file2.bin"),
      new File([new ArrayBuffer(5 * 1024 * 1024)], "file3.bin"),
    ];

    const uploadResult = driveDB.uploadFilesFolders(
      files,
      "CancelAllTestFolder",
      StorageLocationEnum.Web3Storj,
      mockUserID
    );

    const cancelAfterMs = 100;

    setTimeout(() => {
      uploadResult.cancelAll();
    }, cancelAfterMs);

    const finalProgress = await lastValueFrom(uploadResult.progress$);
    expect(finalProgress.completedFiles).toBe(0);
    expect(finalProgress.totalFiles).toBe(3);
    expect(finalProgress.percentage).toBeLessThan(100);

    const queue = uploadResult.getUploadQueue();
    queue.forEach((item) => {
      expect(item.status).toBe(FileUploadStatusEnum.Cancelled);
    });

    driveDB.clearQueue();
  }, 30000);
});

async function emptyBucket(s3: S3Client, bucketName: string) {
  console.log(`Attempting to empty bucket: ${bucketName}`);
  let isTruncated = true;
  let continuationToken: string | undefined;

  while (isTruncated) {
    try {
      const listParams = {
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      };
      const listResult = await s3.send(new ListObjectsV2Command(listParams));
      console.log(
        `Found ${listResult.Contents?.length || 0} objects in bucket`
      );

      if (listResult.Contents && listResult.Contents.length > 0) {
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listResult.Contents.map(({ Key }) => ({ Key })),
            Quiet: false, // Set to false to get detailed errors
          },
        };
        const deleteResult = await s3.send(
          new DeleteObjectsCommand(deleteParams)
        );
        console.log(`Deleted ${deleteResult.Deleted?.length || 0} objects`);
        if (deleteResult.Errors && deleteResult.Errors.length > 0) {
          console.error("Errors during deletion:", deleteResult.Errors);
        }
      }

      isTruncated = listResult.IsTruncated === true;
      continuationToken = listResult.NextContinuationToken;
    } catch (error) {
      console.error(`Error during bucket emptying: ${error}`);
      throw error;
    }
  }

  console.log(`Finished emptying bucket: ${bucketName}`);
}
async function checkObjectExists(
  s3: S3Client,
  bucketName: string,
  key: string
): Promise<boolean> {
  console.log(`Checking if bucket ${bucketName} has object exists: ${key}`);
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}
