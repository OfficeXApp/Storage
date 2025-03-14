// drive/tests-contants/simple.test.ts
// npx vitest run src/framework/drive/tests/simple.test.ts > ./test-logs/simple.test.log

import dotenv from "dotenv";
dotenv.config();

import { describe, it, expect, vi, beforeEach } from "vitest";
import { v4 as uuidv4 } from "uuid";
import {
  Hashtable_FileUUIDToMetadata,
  Hashtable_FolderUUIDToMetadata,
  Hashtable_FullFolderPathToUUID,
  Hashtable_FullFilePathToUUID,
  DriveFullFilePath,
  FolderUUID,
  FileUUID,
  StorageLocationEnum,
} from "../types";
import DriveDB from "../core";
import IndexedDBStorage from "../storage/indexdb";

import "fake-indexeddb/auto";
import { UserID } from "@officexapp/types";

/**
 * -------- SIMPLE TEST CASES --------
 */
export const mockUserID = "user123" as UserID;
export const mockDate = new Date();
export const mockInputFiles = [
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Work Report/2023/Report.docx",
  },
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Work Report/2023/Report.docx",
  },
];

export const FullFolderPathToUUID: Hashtable_FullFolderPathToUUID = {
  ["BrowserCache::" as DriveFullFilePath]: "mock-uuid-2" as FolderUUID,
  ["BrowserCache::Work Report/" as DriveFullFilePath]:
    "mock-uuid-3" as FolderUUID,
  ["BrowserCache::Work Report/2023/" as DriveFullFilePath]:
    "mock-uuid-4" as FolderUUID,
};
export const FullFilePathToUUID: Hashtable_FullFilePathToUUID = {
  ["BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath]:
    "mock-uuid-5" as FileUUID,
};
export const FolderUUIDToMetadata: Hashtable_FolderUUIDToMetadata = {
  ["mock-uuid-2" as FolderUUID]: {
    id: "mock-uuid-2" as FolderUUID,
    originalFolderName: "",
    parentFolderUUID: null,
    subfolderUUIDs: ["mock-uuid-3" as FolderUUID],
    fileUUIDs: [],
    fullFolderPath: "BrowserCache::" as DriveFullFilePath,
    labels: [],
    owner: mockUserID,
    createdDate: mockDate,
    storageLocation: StorageLocationEnum.BrowserCache,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-3" as FolderUUID]: {
    id: "mock-uuid-3" as FolderUUID,
    originalFolderName: "Work Report",
    parentFolderUUID: "mock-uuid-2" as FolderUUID,
    subfolderUUIDs: ["mock-uuid-4" as FolderUUID],
    fileUUIDs: [],
    fullFolderPath: "BrowserCache::Work Report/" as DriveFullFilePath,
    labels: [],
    owner: mockUserID,
    createdDate: mockDate,
    storageLocation: StorageLocationEnum.BrowserCache,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-4" as FolderUUID]: {
    id: "mock-uuid-4" as FolderUUID,
    originalFolderName: "2023",
    parentFolderUUID: "mock-uuid-3" as FolderUUID,
    subfolderUUIDs: [],
    fileUUIDs: ["mock-uuid-5" as FileUUID],
    fullFolderPath: "BrowserCache::Work Report/2023/" as DriveFullFilePath,
    labels: [],
    owner: mockUserID,
    createdDate: mockDate,
    storageLocation: StorageLocationEnum.BrowserCache,
    lastChangedUnixMs: 0,
  },
};
export const FileUUIDToMetadata: Hashtable_FileUUIDToMetadata = {
  ["mock-uuid-1" as FileUUID]: {
    id: "mock-uuid-1" as FileUUID,
    originalFileName: "Report.docx",
    folderUUID: "mock-uuid-4" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: "mock-uuid-5" as FileUUID,
    extension: "docx",
    fullFilePath:
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath,
    labels: [],
    owner: mockUserID,
    createdDate: mockDate,
    storageLocation: StorageLocationEnum.BrowserCache,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-5" as FileUUID]: {
    id: "mock-uuid-5" as FileUUID,
    originalFileName: "Report.docx",
    folderUUID: "mock-uuid-4" as FolderUUID,
    fileVersion: 2,
    priorVersion: "mock-uuid-1" as FileUUID,
    nextVersion: null,
    extension: "docx",
    fullFilePath:
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath,
    labels: [],
    owner: mockUserID,
    createdDate: mockDate,
    storageLocation: StorageLocationEnum.BrowserCache,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
};

// Mock uuid
vi.mock("uuid", () => {
  return {
    v4: vi.fn(),
  };
});

describe("Hashtable Transformations", () => {
  let driveDB: DriveDB;
  let uuidCounter: number;

  beforeEach(async () => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);
    // await driveDB.initialize();

    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // Reset UUID mock to return predictable values
    uuidCounter = 0;
    vi.mocked(uuidv4).mockImplementation(() => `mock-uuid-${++uuidCounter}`);
  }, 20000);

  describe("upsertFileToHashTables", () => {
    it("should create a new file entry when the file does not exist", async () => {
      const { storageLocation, filePath } = mockInputFiles[0];
      const result = driveDB.upsertFileToHashTables(
        filePath,
        storageLocation,
        mockUserID
      );

      expect(result).toBe("mock-uuid-1" as FileUUID);

      // Check file metadata
      const fileMetadata = await driveDB.getFileByID("mock-uuid-1" as FileUUID);
      expect(fileMetadata).toBeDefined();
      expect(fileMetadata?.originalFileName).toBe("Report.docx");
      expect(fileMetadata?.folderUUID).toBe("mock-uuid-4" as FolderUUID);
      expect(fileMetadata?.fileVersion).toBe(1);
      expect(fileMetadata?.fullFilePath).toBe(
        "BrowserCache::Work Report/2023/Report.docx"
      );

      // Check folder structure
      const rootFolder = driveDB.getFolderByID("mock-uuid-2" as FolderUUID);
      expect(rootFolder?.subfolderUUIDs).toContain("mock-uuid-3");

      const workReportFolder = driveDB.getFolderByID(
        "mock-uuid-3" as FolderUUID
      );
      expect(workReportFolder?.subfolderUUIDs).toContain("mock-uuid-4");

      const year2023Folder = driveDB.getFolderByID("mock-uuid-4" as FolderUUID);
      expect(year2023Folder?.fileUUIDs).toContain("mock-uuid-1");
    });

    it("should update an existing file entry when the file already exists", async () => {
      const { storageLocation, filePath } = mockInputFiles[0];

      // First insertion
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);

      // Second insertion (update)
      const result = driveDB.upsertFileToHashTables(
        filePath,
        storageLocation,
        mockUserID
      );

      expect(result).toBe("mock-uuid-5" as FileUUID);

      // Check updated file metadata
      const updatedFile = await driveDB.getFileByID("mock-uuid-5" as FileUUID);
      expect(updatedFile).toBeDefined();
      expect(updatedFile?.fileVersion).toBe(2);
      expect(updatedFile?.priorVersion).toBe("mock-uuid-1" as FileUUID);

      // Check previous version
      const previousFile = await driveDB.getFileByID("mock-uuid-1" as FileUUID);
      expect(previousFile?.nextVersion).toBe("mock-uuid-5" as FileUUID);

      // Check folder structure
      const year2023Folder = driveDB.getFolderByID("mock-uuid-3" as FolderUUID);
      expect(year2023Folder?.fileUUIDs).toEqual([]);

      const quarterFolder = driveDB.getFolderByID("mock-uuid-4" as FolderUUID);
      expect(quarterFolder?.fileUUIDs).toEqual(["mock-uuid-5"]);
    });

    it("should handle multiple insertions of the same file", async () => {
      const results = mockInputFiles.map(({ storageLocation, filePath }) =>
        driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID)
      );

      expect(results).toEqual([
        "mock-uuid-1" as FileUUID,
        "mock-uuid-5" as FileUUID,
      ]);

      const latestFile = await driveDB.getFileByID("mock-uuid-5" as FileUUID);
      expect(latestFile?.fileVersion).toBe(2);

      const year2023Folder = driveDB.getFolderByID("mock-uuid-4" as FolderUUID);
      expect(year2023Folder?.fileUUIDs).toEqual(["mock-uuid-5" as FileUUID]);
    });

    it("should create the correct folder structure", async () => {
      const { storageLocation, filePath } = mockInputFiles[0];
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);

      const rootFolder = driveDB.getFolderByFullPath("BrowserCache::" as any);
      expect(rootFolder).toBeDefined();
      expect(rootFolder?.subfolderUUIDs).toContain("mock-uuid-3");

      const workReportFolder = driveDB.getFolderByFullPath(
        "BrowserCache::Work Report/" as any
      );
      expect(workReportFolder).toBeDefined();
      expect(workReportFolder?.subfolderUUIDs).toEqual(["mock-uuid-4"]);

      const year2023Folder = driveDB.getFolderByFullPath(
        "BrowserCache::Work Report/2023/" as any
      );
      expect(year2023Folder).toBeDefined();
      expect(year2023Folder?.fileUUIDs).toEqual(["mock-uuid-1"]);
      expect(year2023Folder?.subfolderUUIDs).toEqual([]);
    });

    it("snapshot should look as expected", async () => {
      mockInputFiles.map(({ storageLocation, filePath }) =>
        driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID)
      );
      const snapshot = driveDB.exportSnapshot(mockUserID);
      expect(snapshot.id).toEqual("mock-uuid-6");
      expect(snapshot.snapshotName).toEqual(
        `snapshot_officex_drive.id_${"mock-uuid-6"}.userID_${mockUserID}.timestamp_${Math.floor(Date.now() / 1000)}.json`
      );
      expect(snapshot.fullFilePathToUUID).toEqual(FullFilePathToUUID);
      expect(snapshot.fullFolderPathToUUID).toEqual(FullFolderPathToUUID);
      expect(snapshot.fileUUIDToMetadata).toEqual(FileUUIDToMetadata);
      expect(snapshot.folderUUIDToMetadata).toEqual(FolderUUIDToMetadata);
    });
  });
});

describe("searchFilesQuery", () => {
  let driveDB: DriveDB;

  beforeEach(async () => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);
    // await driveDB.initialize();

    // Insert existing mock data
    mockInputFiles.forEach(({ storageLocation, filePath }) => {
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);
    });
  });

  it("should return paginated search results", () => {
    const result1a = driveDB.searchFilesQuery({
      searchString: "Report",
      limit: 1,
      after: 0,
    });

    expect(result1a.files.length).toBe(1);
    expect(result1a.folders.length).toBe(0);
    expect(result1a.total).toBe(1);
    expect(result1a.hasMore).toBe(true);
    expect(result1a.files[0].originalFileName).toBe("Report.docx");

    const result1b = driveDB.searchFilesQuery({
      searchString: "Report",
      limit: 1,
      after: 1,
    });
    expect(result1b.files.length).toBe(0);
    expect(result1b.folders.length).toBe(1);
    expect(result1b.total).toBe(1);
    expect(result1b.hasMore).toBe(false);
    expect(result1b.folders[0].originalFolderName).toBe("Work Report");

    const result2 = driveDB.searchFilesQuery({
      searchString: "Work",
      limit: 2,
      after: 0,
    });

    expect(result2.files.length).toBe(0);
    expect(result2.folders.length).toBe(1);
    expect(result1b.folders[0].originalFolderName).toBe("Work Report");
    expect(result2.total).toBe(1);
    expect(result2.hasMore).toBe(false);
  });

  it("should search for both files and folders", () => {
    const result = driveDB.searchFilesQuery({
      searchString: "Report",
      limit: 10,
      after: 0,
    });

    expect(result.files.length).toBe(1);
    expect(result.folders.length).toBe(1);
    expect(result.total).toBe(2);
    expect(result.folders[0].originalFolderName).toBe("Work Report");
    expect(result.files[0].originalFileName).toBe("Report.docx");
  });
});

describe("reindexFuzzySearch", () => {
  let driveDB: DriveDB;

  beforeEach(async () => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);
    // await driveDB.initialize();

    // Insert existing mock data
    mockInputFiles.forEach(({ storageLocation, filePath }) => {
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);
    });
  });

  it("should reindex all files and folders", () => {
    const result = driveDB.reindexFuzzySearch();

    expect(result.fileCount).toBe(1);
    expect(result.folderCount).toBe(3);

    // Verify that the search works after reindexing
    const searchResult = driveDB.searchFilesQuery({
      searchString: "Report",
      limit: 10,
      after: 0,
    });

    expect(searchResult.files.length).toBe(1);
    expect(searchResult.folders.length).toBe(1);
    expect(searchResult.files[0].originalFileName).toBe("Report.docx");
    expect(searchResult.folders[0].originalFolderName).toBe("Work Report");
  });
});

describe("fetchFilesAtFolderPath", () => {
  let driveDB: DriveDB;
  const mockUserID = "user123" as UserID;

  beforeEach(() => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);

    driveDB.upsertFileToHashTables(
      "Work Report/2023/Report1.docx",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );
    driveDB.upsertFileToHashTables(
      "Work Report/2024/Report2.docx",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );
    driveDB.upsertFileToHashTables(
      "Work Report/Report3.docx",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );
    driveDB.upsertFileToHashTables(
      "Work Report/Presentation.pptx",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );
    driveDB.upsertFileToHashTables(
      "Budget.xlsx",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );
  });

  it("should return an empty result for a non-existent folder", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::NonExistentFolder/" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders).toEqual([]);
    expect(result.files).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it("should return folders before files", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::Work Report/" as DriveFullFilePath,
      limit: 2,
      after: 0,
    });

    expect(result.folders.length).toBe(2);
    expect(result.files.length).toBe(0);
    expect(result.folders[0].originalFolderName).toBe("2023");
    expect(result.folders[1].originalFolderName).toBe("2024");
  });

  it("should handle pagination correctly", () => {
    const result1 = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::Work Report/" as DriveFullFilePath,
      limit: 2,
      after: 0,
    });

    expect(result1.folders.length).toBe(2);
    expect(result1.files.length).toBe(0);
    expect(result1.total).toBe(2);
    expect(result1.hasMore).toBe(true);

    const result2 = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::Work Report/" as DriveFullFilePath,
      limit: 2,
      after: 2,
    });

    expect(result2.folders.length).toBe(0);
    expect(result2.files.length).toBe(2);
    expect(result2.total).toBe(2);
    expect(result2.hasMore).toBe(false);
  });

  it("should return only items at the current path depth", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::Work Report/" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders.length).toBe(2);
    expect(result.files.length).toBe(2);
    expect(result.total).toBe(4);
    expect(result.hasMore).toBe(false);
  });

  it("should handle a folder with only files", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::Work Report/2023/" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders.length).toBe(0);
    expect(result.files.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(result.files[0].originalFileName).toBe("Report1.docx");
  });

  it("should handle the root folder", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders.length).toBe(1); // "Work Report"
    expect(result.files.length).toBe(1); // "Budget.xlsx"
    expect(result.total).toBe(2);
    expect(result.hasMore).toBe(false);
    expect(result.folders[0].originalFolderName).toBe("Work Report");
    expect(result.files[0].originalFileName).toBe("Budget.xlsx");
  });
});

describe("deleteFilesFolders", () => {
  let driveDB: DriveDB;
  let uuidCounter: number;

  beforeEach(() => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);

    uuidCounter = 0;
    vi.mocked(uuidv4).mockImplementation(() => `mock-uuid-${++uuidCounter}`);

    // Insert existing mock data
    mockInputFiles.forEach(({ storageLocation, filePath }) => {
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);
    });
    // Add an extra file for testing
    driveDB.upsertFileToHashTables(
      "Work Report/ExtraFile.txt",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );
  });

  it("should delete a single file", async () => {
    driveDB.deleteFilesFolders([
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath,
    ]);

    const deletedFile = await driveDB.getFileByFullPath(
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath
    );
    expect(deletedFile).toBeUndefined();

    const parentFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/2023/" as DriveFullFilePath
    );
    expect(parentFolder?.fileUUIDs).toHaveLength(0);
  });

  it("should delete a folder and its contents", async () => {
    driveDB.deleteFilesFolders([
      "BrowserCache::Work Report/2023/" as DriveFullFilePath,
    ]);

    const deletedFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/2023/" as DriveFullFilePath
    );
    expect(deletedFolder).toBeUndefined();

    const deletedFile = await driveDB.getFileByFullPath(
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath
    );
    expect(deletedFile).toBeUndefined();

    const parentFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/" as DriveFullFilePath
    );
    expect(parentFolder).toBeDefined();
    expect(parentFolder?.subfolderUUIDs).not.toContain("mock-uuid-4");
  });

  it("should delete multiple files and folders", async () => {
    driveDB.deleteFilesFolders([
      "BrowserCache::Work Report/2023/" as DriveFullFilePath,
      "BrowserCache::Work Report/ExtraFile.txt" as DriveFullFilePath,
    ]);

    const deletedFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/2023/" as DriveFullFilePath
    );
    expect(deletedFolder).toBeUndefined();

    const deletedFile1 = await driveDB.getFileByFullPath(
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath
    );
    expect(deletedFile1).toBeUndefined();

    const deletedFile2 = await driveDB.getFileByFullPath(
      "BrowserCache::Work Report/ExtraFile.txt" as DriveFullFilePath
    );
    expect(deletedFile2).toBeUndefined();

    const parentFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/" as DriveFullFilePath
    );
    expect(parentFolder?.subfolderUUIDs).not.toContain("mock-uuid-4");
    expect(parentFolder?.fileUUIDs).toHaveLength(0);
  });

  it("should handle non-existent paths gracefully", () => {
    expect(() => {
      driveDB.deleteFilesFolders([
        "BrowserCache::NonExistent/Path/" as DriveFullFilePath,
      ]);
    }).not.toThrow();
  });

  it("should delete all versions of a file", async () => {
    // Create a new version of an existing file
    driveDB.upsertFileToHashTables(
      "Work Report/2023/Report.docx",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );
    const mostRecentFile = await driveDB.getFileByID("mock-uuid-7" as FileUUID);
    expect(mostRecentFile).toBeDefined();

    driveDB.deleteFilesFolders([
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath,
    ]);

    const deletedFileV1 = await driveDB.getFileByID("mock-uuid-1" as FileUUID);
    const deletedFileV2 = await driveDB.getFileByID("mock-uuid-5" as FileUUID);
    const deletedFileV3 = await driveDB.getFileByID("mock-uuid-7" as FileUUID);

    expect(deletedFileV1).toBeUndefined();
    expect(deletedFileV2).toBeUndefined();
    expect(deletedFileV3).toBeUndefined();

    const parentFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/2023/" as DriveFullFilePath
    );
    expect(parentFolder?.fileUUIDs).toHaveLength(0);
  });

  it("should not delete any root folders", async () => {
    // insert a sample.png into root
    driveDB.upsertFileToHashTables(
      "sample.png",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    const initialBrowserCacheFolder = driveDB.getFolderByFullPath(
      "BrowserCache::" as DriveFullFilePath
    );
    const initialHardDriveFolder = driveDB.getFolderByFullPath(
      "HardDrive::" as DriveFullFilePath
    );

    driveDB.deleteFilesFolders([
      "BrowserCache::" as DriveFullFilePath,
      "HardDrive::" as DriveFullFilePath,
    ]);

    const afterBrowserCacheFolder = driveDB.getFolderByFullPath(
      "BrowserCache::" as DriveFullFilePath
    );
    const afterHardDriveFolder = driveDB.getFolderByFullPath(
      "HardDrive::" as DriveFullFilePath
    );

    expect(afterBrowserCacheFolder).toEqual(initialBrowserCacheFolder);
    expect(afterHardDriveFolder).toEqual(initialHardDriveFolder);

    // Verify that files in root storage are still intact
    const customFile = await driveDB.getFileByFullPath(
      "BrowserCache::sample.png" as DriveFullFilePath
    );
    expect(customFile).toBeDefined();
  });
});
