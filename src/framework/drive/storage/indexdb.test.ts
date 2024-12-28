// npx vitest run src/drive/storage/indexdb.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import IndexedDBStorage from "./indexdb";
import { FileMetadataFragment } from "../types";
import { Observable } from "rxjs";

describe("IndexedDBStorage", () => {
  let indexedDBStorage: IndexedDBStorage;

  beforeEach(async () => {
    new IDBFactory();
    indexedDBStorage = IndexedDBStorage.getInstance();
    await indexedDBStorage.initialize();
  });

  afterEach(async () => {
    await indexedDBStorage.clearStorage();
  });

  it("should upload a file and report progress correctly", async () => {
    const file = new File(["a".repeat(5 * 1024 * 1024)], "test.txt", {
      type: "text/plain",
    });
    const uploadObservable: Observable<{
      progress: number;
      metadataFragment: FileMetadataFragment;
    }> = indexedDBStorage.uploadRawFile(file);

    return new Promise<void>((resolve, reject) => {
      let finalMetadata: FileMetadataFragment | null = null;
      let progressReports: number[] = [];

      uploadObservable.subscribe({
        next: ({ progress, metadataFragment }) => {
          progressReports.push(progress);
          finalMetadata = metadataFragment;
        },
        error: (err) => reject(err),
        complete: () => {
          try {
            expect(progressReports.length).toBeGreaterThan(1);
            expect(progressReports[progressReports.length - 1]).toBe(100);
            expect(finalMetadata).toBeDefined();
            if (finalMetadata) {
              expect(finalMetadata.fileSize).toBe(5 * 1024 * 1024);
              expect(finalMetadata.name).toBe("test.txt");
              expect(finalMetadata.mimeType).toBe("text/plain");
              expect(finalMetadata.rawURL).toBeDefined();
            } else {
              throw new Error("Final metadata is null");
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        },
      });
    });
  });

  it("should upload and download a large file correctly", async () => {
    const fileSize = 10 * 1024 * 1024; // 10MB file
    const file = new File(["a".repeat(fileSize)], "large_test.txt", {
      type: "text/plain",
    });
    let fileMetadata: FileMetadataFragment | null = null;

    await new Promise<void>((resolve, reject) => {
      indexedDBStorage.uploadRawFile(file).subscribe({
        next: ({ metadataFragment }) => {
          fileMetadata = metadataFragment;
        },
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });

    if (!fileMetadata) {
      throw new Error("File upload failed");
    }

    const downloadedBlob = await indexedDBStorage.getRawFile(
      (fileMetadata as FileMetadataFragment).rawURL
    );

    expect(downloadedBlob).toBeInstanceOf(Blob);
    expect(downloadedBlob.size).toBe(fileSize);
    expect(downloadedBlob.type).toBe("text/plain");
  });

  it("should delete a file", async () => {
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    let fileMetadata: FileMetadataFragment | null = null;

    await new Promise<void>((resolve, reject) => {
      indexedDBStorage.uploadRawFile(file).subscribe({
        next: ({ metadataFragment }) => {
          fileMetadata = metadataFragment;
        },
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });

    if (!fileMetadata) {
      throw new Error("File upload failed");
    }

    const deleteResult = await indexedDBStorage.deleteFile(
      (fileMetadata as FileMetadataFragment).rawURL
    );
    expect(deleteResult).toBe(true);

    await expect(
      indexedDBStorage.getRawFile((fileMetadata as FileMetadataFragment).rawURL)
    ).rejects.toThrow("INDEXEDDB_FILE_NOT_FOUND");
  });

  it("should generate and retrieve a thumbnail", async () => {
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    let fileMetadata: FileMetadataFragment | null = null;

    await new Promise<void>((resolve, reject) => {
      indexedDBStorage.uploadRawFile(file).subscribe({
        next: ({ metadataFragment }) => {
          if (metadataFragment) {
            fileMetadata = metadataFragment;
          }
        },
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });

    if (!fileMetadata) {
      throw new Error("File upload failed");
    }

    const thumbnail = await indexedDBStorage.getThumbnail(
      (fileMetadata as FileMetadataFragment).rawURL
    );
    expect(thumbnail).toBeInstanceOf(Blob);
    expect((thumbnail as Blob).type).toBe("image/png");
  }, 30000);

  // Add more tests as needed...
});
