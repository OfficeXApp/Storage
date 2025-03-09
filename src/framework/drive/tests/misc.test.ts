// npx vitest run src/framework/drive/tests/misc.test.ts > ./test-logs/misc.test.log

import { describe, it, expect, beforeEach, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";

import {
  StorageLocationEnum,
  DriveFullFilePath,
  FolderUUID,
  FileUUID,
  DRIVE_ERRORS,
} from "../types";
import DriveDB from "../core";
import IndexedDBStorage from "../storage/indexdb";
import { UserID } from "@officexapp/types";

describe("Rename files and folders", () => {
  let driveDB: DriveDB;
  const mockUserID = "user123" as UserID;
  const mockDate = new Date("2023-01-01T00:00:00Z");

  beforeEach(() => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);

    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // Create a deeply nested structure
    const mockInputFiles = [
      {
        storageLocation: StorageLocationEnum.BrowserCache,
        filePath: "folder1/sub2/sub3/sub4/file.png",
      },
      {
        storageLocation: StorageLocationEnum.BrowserCache,
        filePath: "folder1/sub2/sub3/sub4/another_file.jpg",
      },
      {
        storageLocation: StorageLocationEnum.BrowserCache,
        filePath: "folder1/top_level_file.pdf",
      },
      {
        storageLocation: StorageLocationEnum.BrowserCache,
        filePath: "folder2/misc.pdf",
      },
      {
        storageLocation: StorageLocationEnum.BrowserCache,
        filePath: "base_file.pdf",
      },
    ];

    mockInputFiles.forEach(({ storageLocation, filePath }) => {
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);
    });
  });

  describe("renameFilePath", () => {
    it("should rename a file in a deeply nested structure", async () => {
      const filePath =
        "BrowserCache::folder1/sub2/sub3/sub4/file.png" as DriveFullFilePath;
      const fileUUID = (await driveDB.getFileByFullPath(filePath))
        ?.id as FileUUID;

      driveDB.renameFilePath(fileUUID, "new_image.jpeg");
      const renamedFile = await driveDB.getFileByFullPath(
        "BrowserCache::folder1/sub2/sub3/sub4/new_image.jpeg" as DriveFullFilePath
      );

      // Check that the old path is removed and the new path is added
      expect(await driveDB.getFileByFullPath(filePath)).toBeUndefined();
      expect(renamedFile).toBeDefined();

      expect(renamedFile?.originalFileName).toBe("new_image.jpeg");
      expect(renamedFile?.fullFilePath).toBe(
        "BrowserCache::folder1/sub2/sub3/sub4/new_image.jpeg"
      );
      expect(renamedFile?.extension).toBe("jpeg");

      // Check that the file is still in the same folder
      const parentFolder = driveDB.getFolderByFullPath(
        "BrowserCache::folder1/sub2/sub3/sub4/" as DriveFullFilePath
      );
      expect(parentFolder?.fileUUIDs).toContain(fileUUID);
    });

    it("should rename a file at the root level", async () => {
      const filePath = "BrowserCache::base_file.pdf" as DriveFullFilePath;
      const fileUUID = (await driveDB.getFileByFullPath(filePath))
        ?.id as FileUUID;

      driveDB.renameFilePath(fileUUID, "renamed_base_file.pdf");
      const renamedFile = await driveDB.getFileByFullPath(
        "BrowserCache::renamed_base_file.pdf" as DriveFullFilePath
      );

      expect(renamedFile?.originalFileName).toBe("renamed_base_file.pdf");
      expect(renamedFile?.fullFilePath).toBe(
        "BrowserCache::renamed_base_file.pdf"
      );
      expect(renamedFile?.extension).toBe("pdf");

      // Check that the old path is removed and the new path is added
      expect(await driveDB.getFileByFullPath(filePath)).toBeUndefined();
      expect(renamedFile).toBeDefined();

      // Check that the file is still at the root level
      const rootFolder = driveDB.getFolderByFullPath(
        "BrowserCache::" as DriveFullFilePath
      );
      expect(rootFolder?.fileUUIDs).toContain(fileUUID);
    });

    it("should throw an error when trying to rename to an existing file name", async () => {
      const filePath =
        "BrowserCache::folder1/sub2/sub3/sub4/file.png" as DriveFullFilePath;
      const fileUUID = (await driveDB.getFileByFullPath(filePath))
        ?.id as FileUUID;

      expect(() => {
        driveDB.renameFilePath(fileUUID, "another_file.jpg");
      }).toThrow(DRIVE_ERRORS.NAME_CONFLICT);
    });

    it("should throw an error when trying to rename a non-existent file", () => {
      const nonExistentUUID = uuidv4() as FileUUID;

      expect(() => {
        driveDB.renameFilePath(nonExistentUUID, "new_name.txt");
      }).toThrow("FILE_NOT_FOUND");
    });

    it("should throw an error when trying to rename with an invalid name", async () => {
      const filePath =
        "BrowserCache::folder1/sub2/sub3/sub4/file.png" as DriveFullFilePath;
      const fileUUID = (await driveDB.getFileByFullPath(filePath))
        ?.id as FileUUID;

      expect(() => {
        driveDB.renameFilePath(fileUUID, "invalid/name.txt");
      }).toThrow("INVALID_NAME");

      expect(() => {
        driveDB.renameFilePath(fileUUID, "");
      }).toThrow("INVALID_NAME");
    });
  });

  describe("renameFolderPath", () => {
    it("should rename a folder containing nested content", async () => {
      const folderPath = "BrowserCache::folder1/" as DriveFullFilePath;
      const folderUUID = driveDB.getFolderByFullPath(folderPath)
        ?.id as FolderUUID;

      const renamedFolder = driveDB.renameFolderPath(folderUUID, "new_folder1");

      expect(renamedFolder.originalFolderName).toBe("new_folder1");
      expect(renamedFolder.fullFolderPath).toBe("BrowserCache::new_folder1/");

      // Check that the old path is removed and the new path is added
      expect(driveDB.getFolderByFullPath(folderPath)).toBeUndefined();
      expect(
        driveDB.getFolderByFullPath(
          "BrowserCache::new_folder1/" as DriveFullFilePath
        )
      ).toBeDefined();

      // Check that the files and subfolders in the renamed folder have their paths updated
      expect(
        await driveDB.getFileByFullPath(
          "BrowserCache::new_folder1/sub2/sub3/sub4/file.png" as DriveFullFilePath
        )
      ).toBeDefined();
      expect(
        driveDB.getFolderByFullPath(
          "BrowserCache::new_folder1/sub2/" as DriveFullFilePath
        )
      ).toBeDefined();
      expect(
        await driveDB.getFileByFullPath(
          "BrowserCache::new_folder1/sub2/sub3/sub4/another_file.jpg" as DriveFullFilePath
        )
      ).toBeDefined();
      expect(
        driveDB.getFolderByFullPath(
          "BrowserCache::new_folder1/sub2/sub3/" as DriveFullFilePath
        )
      ).toBeDefined();
      expect(
        driveDB.getFolderByFullPath(
          "BrowserCache::new_folder1/sub2/sub3/sub4/" as DriveFullFilePath
        )
      ).toBeDefined();
      expect(
        await driveDB.getFileByFullPath(
          "BrowserCache::new_folder1/top_level_file.pdf" as DriveFullFilePath
        )
      ).toBeDefined();
      expect(
        driveDB.getFolderByFullPath(
          "BrowserCache::folder1/" as DriveFullFilePath
        )
      ).toBeUndefined();
      expect(
        driveDB.getFolderByFullPath(
          "BrowserCache::folder1/sub2/" as DriveFullFilePath
        )
      ).toBeUndefined();
      expect(
        driveDB.getFolderByFullPath(
          "BrowserCache::folder1/sub2/sub3/" as DriveFullFilePath
        )
      ).toBeUndefined();

      // Check that the root folder still contains this folder
      const rootFolder = driveDB.getFolderByFullPath(
        "BrowserCache::" as DriveFullFilePath
      );
      expect(rootFolder?.subfolderUUIDs).toContain(folderUUID);
    });

    it("should throw an error when trying to rename to an existing folder name", () => {
      const folderPath = "BrowserCache::folder2/" as DriveFullFilePath;
      const folderUUID = driveDB.getFolderByFullPath(folderPath)
        ?.id as FolderUUID;

      expect(() => {
        driveDB.renameFolderPath(folderUUID, "folder1");
      }).toThrow("NAME_CONFLICT");
    });

    it("should throw an error when trying to rename a non-existent folder", () => {
      const nonExistentUUID = uuidv4() as FolderUUID;

      expect(() => {
        driveDB.renameFolderPath(nonExistentUUID, "new_name");
      }).toThrow("FOLDER_NOT_FOUND");
    });

    it("should throw an error when trying to rename with an invalid name", () => {
      const folderPath =
        "BrowserCache::folder1/sub2/sub3/" as DriveFullFilePath;
      const folderUUID = driveDB.getFolderByFullPath(folderPath)
        ?.id as FolderUUID;

      expect(() => {
        driveDB.renameFolderPath(folderUUID, "invalid/name");
      }).toThrow("INVALID_NAME");

      expect(() => {
        driveDB.renameFolderPath(folderUUID, "");
      }).toThrow("INVALID_NAME");
    });
  });
});

describe("Create folders", () => {
  let driveDB: DriveDB;
  const mockUserID = "user123" as UserID;
  const mockDate = new Date("2023-01-01T00:00:00Z");

  beforeEach(() => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    driveDB = new DriveDB(indexDBStorage);

    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  it("should create a folder at the root level", () => {
    const newFolderPath = "BrowserCache::newFolder/" as DriveFullFilePath;
    const newFolder = driveDB.createFolder(
      newFolderPath,
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    expect(newFolder).toBeDefined();
    expect(newFolder.originalFolderName).toBe("newFolder");
    expect(newFolder.fullFolderPath).toBe(newFolderPath);
    expect(newFolder.parentFolderUUID).not.toBeNull();

    const rootFolder = driveDB.getFolderByFullPath(
      "BrowserCache::" as DriveFullFilePath
    );
    expect(rootFolder?.subfolderUUIDs).toContain(newFolder.id);
  });

  it("should create a deeply nested folder and all its parent folders", () => {
    const deepFolderPath =
      "BrowserCache::folder1/folder2/folder3/deepFolder/" as DriveFullFilePath;
    const deepFolder = driveDB.createFolder(
      deepFolderPath,
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    expect(deepFolder).toBeDefined();
    expect(deepFolder.originalFolderName).toBe("deepFolder");
    expect(deepFolder.fullFolderPath).toBe(deepFolderPath);

    // Check if all parent folders were created
    const parentFolders = [
      "BrowserCache::folder1/",
      "BrowserCache::folder1/folder2/",
      "BrowserCache::folder1/folder2/folder3/",
    ];

    parentFolders.forEach((folderPath) => {
      const folder = driveDB.getFolderByFullPath(
        folderPath as DriveFullFilePath
      );
      expect(folder).toBeDefined();
      expect(folder?.fullFolderPath).toBe(folderPath);
    });

    // Check the folder hierarchy
    const folder1 = driveDB.getFolderByFullPath(
      "BrowserCache::folder1/" as DriveFullFilePath
    );
    const folder2 = driveDB.getFolderByFullPath(
      "BrowserCache::folder1/folder2/" as DriveFullFilePath
    );
    const folder3 = driveDB.getFolderByFullPath(
      "BrowserCache::folder1/folder2/folder3/" as DriveFullFilePath
    );

    expect(folder1?.subfolderUUIDs).toContain(folder2?.id);
    expect(folder2?.subfolderUUIDs).toContain(folder3?.id);
    expect(folder3?.subfolderUUIDs).toContain(deepFolder.id);

    // Check parent-child relationships
    expect(folder2?.parentFolderUUID).toBe(folder1?.id);
    expect(folder3?.parentFolderUUID).toBe(folder2?.id);
    expect(deepFolder.parentFolderUUID).toBe(folder3?.id);
  });

  it("should throw an error when trying to create an existing folder", () => {
    const folderPath = "BrowserCache::existingFolder/" as DriveFullFilePath;
    driveDB.createFolder(
      folderPath,
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    expect(() => {
      driveDB.createFolder(
        folderPath,
        StorageLocationEnum.BrowserCache,
        mockUserID
      );
    }).toThrow(DRIVE_ERRORS.NAME_CONFLICT);
  });

  it("should sanitize and create a folder with an invalid name", () => {
    const invalidFolderPath =
      "BrowserCache::invalid:/name" as DriveFullFilePath;

    const createdFolder = driveDB.createFolder(
      invalidFolderPath,
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    // Check that the folder was created
    expect(createdFolder).toBeDefined();

    // Check that the folder name was sanitized
    expect(createdFolder.originalFolderName).toBe("name");

    // Check that the full path was sanitized
    expect(createdFolder.fullFolderPath).toBe("BrowserCache::invalid;/name/");

    // Verify that the folder exists in the DriveDB
    const retrievedFolder = driveDB.getFolderByFullPath(
      "BrowserCache::invalid;/name/" as DriveFullFilePath
    );
    expect(retrievedFolder).toBeDefined();
    expect(retrievedFolder?.id).toBe(createdFolder.id);
  });

  // it("should throw an error when trying to create a folder with an empty name", () => {
  //   const invalidFolderPath = "BrowserCache::/" as DriveFullFilePath;

  //   expect(() => {
  //     driveDB.createFolder(
  //       invalidFolderPath,
  //       StorageLocationEnum.BrowserCache,
  //       mockUserID
  //     );
  //   }).toThrow(DRIVE_ERRORS.INVALID_NAME);
  // });

  it("should throw an error when trying to create a folder with a name that conflicts with an existing subfolder", () => {
    driveDB.createFolder(
      "BrowserCache::parent/existing/" as DriveFullFilePath,
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    expect(() => {
      driveDB.createFolder(
        "BrowserCache::parent/existing" as DriveFullFilePath,
        StorageLocationEnum.BrowserCache,
        mockUserID
      );
    }).toThrow(DRIVE_ERRORS.NAME_CONFLICT);
  });
});
