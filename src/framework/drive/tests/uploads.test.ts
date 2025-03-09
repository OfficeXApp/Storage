// npx vitest run src/framework/drive/tests/uploads.test.ts > ./test-logs/uploads.test.log

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { v4 as uuidv4 } from "uuid";
import {
  StorageLocationEnum,
  UploadFolderPath,
  FileUUID,
  FileUploadStatusEnum,
  FileMetadataFragment,
} from "../types";
import DriveDB from "../core";
import IndexedDBStorage from "../storage/indexdb";
import { firstValueFrom, Observable } from "rxjs";
import { UserID } from "@officexapp/types";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn(),
}));

// Mock IndexedDBStorage
vi.mock("../storage/indexdb", () => ({
  default: {
    getInstance: vi.fn(() => ({
      uploadRawFile: vi.fn(),
    })),
  },
}));

describe("DriveDB - uploadFilesFolders", () => {
  let driveDB: DriveDB;
  let mockIndexedDBStorage: IndexedDBStorage;
  const mockUserId = "user123" as UserID;
  let uuidCounter: number;

  beforeEach(() => {
    mockIndexedDBStorage = IndexedDBStorage.getInstance();
    // await mockIndexedDBStorage.initialize();
    driveDB = new DriveDB(mockIndexedDBStorage);

    // Reset UUID mock to return predictable values
    uuidCounter = 0;
    vi.mocked(uuidv4).mockImplementation(() => `mock-uuid-${++uuidCounter}`);

    // Mock Date.now() to return a fixed timestamp
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-01-01"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should handle single file upload correctly", async () => {
    const file = new File(["file content"], "test.txt", { type: "text/plain" });
    const uploadFolderPath = "documents" as UploadFolderPath;

    vi.mocked(mockIndexedDBStorage.uploadRawFile).mockReturnValue(
      new Observable((observer) => {
        setTimeout(() => {
          observer.next({
            progress: 100,
            metadataFragment: {
              id: "mock-uuid-1" as FileUUID,
              name: "test.txt",
              mimeType: "text/plain",
              fileSize: 12,
              rawURL: "test-url",
            },
          });
          observer.complete();
        }, 100);
      })
    );

    const { progress$, uploadComplete$, getUploadQueue } =
      driveDB.uploadFilesFolders(
        [file],
        uploadFolderPath,
        StorageLocationEnum.BrowserCache,
        mockUserId
      );

    return new Promise<void>((resolve) => {
      progress$.subscribe({
        next: (progress) => {
          if (progress.completedFiles === 1) {
            expect(progress.totalFiles).toBe(1);
            expect(progress.completedFiles).toBe(1);

            const queue = getUploadQueue();
            expect(queue.length).toBe(1);
            expect(queue[0].status).toBe(FileUploadStatusEnum.Completed);
            expect(queue[0].progress).toBe(100);

            resolve();
          }
        },
      });

      uploadComplete$.subscribe({
        next: (fileUUID) => {
          expect(fileUUID).toBe("mock-uuid-1");
        },
      });

      vi.runAllTimers();
    });
  }, 10000);

  it("should handle uploading multiple folders and files correctly", async () => {
    const file1 = new File(["file1 content"], "file1.txt", {
      type: "text/plain",
    });
    const file2 = new File(["file2 content"], "folder1/file2.txt", {
      type: "text/plain",
    });
    const file3 = new File(["file3 content"], "folder1/subfolder/file3.txt", {
      type: "text/plain",
    });
    const file4 = new File(["file4 content"], "folder2/file4.txt", {
      type: "text/plain",
    });

    Object.defineProperty(file2, "webkitRelativePath", {
      value: "folder1/file2.txt",
    });
    Object.defineProperty(file3, "webkitRelativePath", {
      value: "folder1/subfolder/file3.txt",
    });
    Object.defineProperty(file4, "webkitRelativePath", {
      value: "folder2/file4.txt",
    });

    const uploadFolderPath = "documents" as UploadFolderPath;

    let callCount = 0;
    vi.mocked(mockIndexedDBStorage.uploadRawFile).mockImplementation(() => {
      callCount++;
      return new Observable((observer) => {
        setTimeout(() => {
          observer.next({
            progress: 100,
            metadataFragment: {
              id: `mock-uuid-${callCount + 4}` as FileUUID,
              name: `file${callCount}.txt`,
              mimeType: "text/plain",
              fileSize: 13,
              rawURL: `test-url-${callCount}`,
            },
          });
          observer.complete();
        }, 100);
      });
    });

    const { progress$, uploadComplete$, getUploadQueue } =
      driveDB.uploadFilesFolders(
        [file1, file2, file3, file4],
        uploadFolderPath,
        StorageLocationEnum.BrowserCache,
        mockUserId
      );

    return new Promise<void>((resolve) => {
      progress$.subscribe({
        next: (progress) => {
          if (progress.completedFiles === 4) {
            expect(progress.totalFiles).toBe(4);
            expect(progress.completedFiles).toBe(4);

            const queue = getUploadQueue();
            expect(queue.length).toBe(4);
            expect(
              queue.every(
                (item) => item.status === FileUploadStatusEnum.Completed
              )
            ).toBe(true);
            expect(queue.every((item) => item.progress === 100)).toBe(true);

            resolve();
          }
        },
      });

      const completedUUIDs: string[] = [];
      uploadComplete$.subscribe({
        next: (fileUUID) => {
          completedUUIDs.push(fileUUID);
          if (completedUUIDs.length === 4) {
            expect(completedUUIDs).toEqual([
              "mock-uuid-5",
              "mock-uuid-6",
              "mock-uuid-7",
              "mock-uuid-8",
            ]);
          }
        },
      });

      vi.runAllTimers();
    });
  }, 10000);

  it("should handle cancelling a specific folder upload", async () => {
    const file1 = new File(["file1 content"], "file1.txt", {
      type: "text/plain",
    });
    const file2 = new File(["file2 content"], "folder1/file2.txt", {
      type: "text/plain",
    });
    const file3 = new File(["file3 content"], "folder1/file3.txt", {
      type: "text/plain",
    });

    Object.defineProperty(file2, "webkitRelativePath", {
      value: "folder1/file2.txt",
    });
    Object.defineProperty(file3, "webkitRelativePath", {
      value: "folder1/file3.txt",
    });

    const uploadFolderPath = "documents" as UploadFolderPath;

    vi.mocked(mockIndexedDBStorage.uploadRawFile).mockImplementation((file) => {
      return new Observable((observer) => {
        console.log("Starting upload");
        const metadataFragment: FileMetadataFragment = {
          id: uuidv4() as FileUUID,
          name: file.name,
          mimeType: file.type,
          fileSize: file.size,
          rawURL: "test-url",
        };
        setTimeout(() => {
          console.log("Progress 50% emitted");
          observer.next({ progress: 50, metadataFragment });
        }, 100);
        setTimeout(() => {
          console.log("Progress 100% emitted");
          observer.next({ progress: 100, metadataFragment });
          observer.complete();
          console.log("Upload complete");
        }, 200);
      });
    });

    const { progress$, cancelUpload, getUploadQueue } =
      driveDB.uploadFilesFolders(
        [file1, file2, file3],
        uploadFolderPath,
        StorageLocationEnum.BrowserCache,
        mockUserId
      );

    let folderFileId: string | null = null;

    // Wait for the first progress update
    await firstValueFrom(progress$);

    // Find and cancel the folder upload
    const initialQueue = getUploadQueue();
    folderFileId =
      initialQueue.find((item) => item.path.includes("folder1"))?.id || null;
    if (folderFileId) {
      cancelUpload(folderFileId);
    } else {
      throw new Error("Folder file was not found for cancellation");
    }

    // Wait for cancellations to propagate
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check the final state
    const finalQueue = getUploadQueue();
    console.log("Final queue state:", finalQueue);

    expect(finalQueue.length).toBe(3);
    expect(
      finalQueue.filter(
        (item) => item.status === FileUploadStatusEnum.Cancelled
      ).length
    ).toBe(2);
    expect(
      finalQueue.filter(
        (item) => item.status !== FileUploadStatusEnum.Cancelled
      ).length
    ).toBe(1);

    // Additional check: Ensure the canceled items are the ones in the folder
    const cancelledItems = finalQueue.filter(
      (item) => item.status === FileUploadStatusEnum.Cancelled
    );
    expect(cancelledItems.every((item) => item.path.includes("folder1"))).toBe(
      true
    );

    // Ensure the non-cancelled item is the one not in the folder
    const activeitems = finalQueue.filter(
      (item) => item.status !== FileUploadStatusEnum.Cancelled
    );
    expect(activeitems[0].path).toBe("documents/file1.txt");
  }, 60000);
});
