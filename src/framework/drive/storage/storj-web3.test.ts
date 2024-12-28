// npx vitest run src/framework/drive/storage/storj-web3.test.ts > ./test-logs/storj-web3.test.log

import dotenv from "dotenv";
dotenv.config();

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { StorjClient, S3ClientAuth } from "./storj-web3";
import { lastValueFrom } from "rxjs";
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  DeleteBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import mockfs from "mock-fs";
import { v4 as uuidv4 } from "uuid";
import { FileUUID } from "../types";

function createMockFile(
  name: string = "test.txt",
  type: string = "text/plain",
  content: string = ""
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe("StorjClient", () => {
  const testBucketName = "officex-storj-web3-test";
  const auth: S3ClientAuth = {
    accessKeyId: process.env.STORJ_ACCESS_KEY as string,
    secretAccessKey: process.env.STORJ_SECRET_KEY as string,
    endpoint: process.env.STORJ_ENDPOINT as string,
    defaultBucketName: testBucketName,
  };

  beforeAll(async () => {
    await StorjClient.initialize(auth);
  });

  beforeEach(() => {
    // Set up the mock file system before each test
    mockfs({
      "/test-file.txt": "Hello, Storj!",
      "/large-file.bin": Buffer.alloc(10 * 1024 * 1024, "A"),
    });
  });

  afterEach(() => {
    // Restore the real file system after each test
    mockfs.restore();
  });

  it("should initialize StorjClient", () => {
    expect(StorjClient.getInstance()).toBeDefined();
  });

  it("should create default bucket if it doesn't exist", async () => {
    const s3 = StorjClient.getS3Client();

    // First, ensure the test bucket doesn't exist
    try {
      const deleteBucketCommand = new DeleteBucketCommand({
        Bucket: auth.defaultBucketName!,
      });
      await s3.send(deleteBucketCommand);
    } catch (error) {
      // Ignore errors if the bucket doesn't exist
    }

    // Now ensure the default bucket
    await StorjClient.ensureDefaultBucket();

    // wait a few seconds for the upload to complete with eventual consistency
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check if the bucket was created
    const headBucketCommand = new HeadBucketCommand({
      Bucket: auth.defaultBucketName!,
    });
    const bucketExists = await s3
      .send(headBucketCommand)
      .then(() => true)
      .catch(() => false);

    expect(bucketExists).toBe(true);
  }, 30000);

  it("should get a signed URL for an object", async () => {
    const id = uuidv4() as FileUUID;
    const key = `${id}.txt`;
    const filename = "test-file.txt";
    const file = createMockFile(filename, "text/plain", "Hello, Storj!");

    // Upload an object first
    await lastValueFrom(StorjClient.uploadObject(id, key, file));

    // wait a few seconds for the upload to complete with eventual consistency
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get the signed URL
    const signedUrl = await StorjClient.getSignedUrl({
      key,
      customFilename: filename,
    });

    expect(signedUrl).toContain(`${auth.endpoint}`);
    expect(signedUrl).toContain(`/${testBucketName}/${key}`);

    // Optionally, check if the URL is accessible
    // This would require using something like axios or fetch to confirm.
  }, 30000);

  it("should upload and list a large file", async () => {
    const id = uuidv4() as FileUUID;
    const key = "large-file.bin";
    const body = Buffer.alloc(10 * 1024 * 1024, "A"); // 10MB file of 'A' characters
    const file = createMockFile(
      key,
      "application/octet-stream",
      body.toString()
    );

    // Upload the large file
    const uploadResult = await lastValueFrom(
      StorjClient.uploadObject(id, key, file)
    );

    // wait a few seconds for the upload to complete with eventual consistency
    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(uploadResult).toBeDefined();
    expect(uploadResult.metadataFragment.name).toBe(key);

    // List the objects in the bucket and verify the large file exists
    const result = await StorjClient.listObjects();

    const uploadedFile = result.Contents?.find((item) => item.Key === key);
    expect(uploadedFile).toBeDefined();
    expect(uploadedFile?.Size).toEqual(body.length);
  }, 60000);

  // After all tests, clean up the bucket and objects
  afterAll(async () => {
    const s3 = StorjClient.getS3Client();

    // List all objects in the bucket
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: auth.defaultBucketName!,
    });
    const listedObjects = await s3.send(listObjectsCommand);

    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      // Delete all objects in the bucket
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: auth.defaultBucketName!,
        Delete: {
          Objects: listedObjects.Contents.map((obj) => ({
            Key: obj.Key!,
          })),
        },
      });
      await s3.send(deleteObjectsCommand);
    }

    // Finally, delete the bucket
    const deleteBucketCommand = new DeleteBucketCommand({
      Bucket: auth.defaultBucketName!,
    });
    await s3.send(deleteBucketCommand);
  });
});
