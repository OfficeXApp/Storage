// npx vitest run src/framework/drive/tests/detailed.test.ts > ./test-logs/detailed.test.log

import { describe, it, expect, vi, beforeEach } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { UserID } from "../../identity/types";
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

/**
 * -------- COMPREPHENSIVE TEST CASES --------
 */

export const mockInputFiles = [
  // typical files
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "readme.docx",
  },
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Work Report/Report_draft.docx",
  },
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Work Report/2023/Report.docx",
  },
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Work Report/2023/Report.docx",
  }, // file conflict
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Work Report/2023/Q3-2023/Quarterly Report.docx",
  },
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Work Report/2023/Q3-2023/Analytics.docx",
  }, // folder conflict
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "Vacation Memories/scenery.png",
  },
  {
    storageLocation: StorageLocationEnum.HardDrive,
    filePath: "Work Report/Report_draft.docx",
  }, // drive conflict
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image.wtf",
  }, // unknown file type
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image.png",
  }, // typical file
  // weird name edge cases
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image.png/",
  }, // trailing slash
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image.preview.png",
  }, // using dots (wasn't intended to be a file extension)
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image/picture.png",
  }, // using slash (wasn't intended to be a folder)
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image:italy.png",
  }, // using colon (wasn't intended to be a drive)
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image::france.png",
  }, // using double colon (wasn't intended to be a drive)
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image~ireland-dublin+=-;'<>()[]{}`,|.png",
  }, // using many special characters
  { storageLocation: StorageLocationEnum.BrowserCache, filePath: "epic_image" }, // no file extension
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image.",
  }, // no file extension
  { storageLocation: StorageLocationEnum.BrowserCache, filePath: ".npmrc" }, // no file name
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image.png.png",
  }, // double file extension
  {
    storageLocation: StorageLocationEnum.BrowserCache,
    filePath: "epic_image.png.png.png",
  }, // triple file extension
  {
    storageLocation: "MiscStorageXYZ" as StorageLocationEnum,
    filePath: "the fuck?",
  }, // unknown misc storage location
  // nesting
  {
    storageLocation: StorageLocationEnum.HardDrive,
    filePath: "a/b/c/d/z.png",
  },
];

export const mockUserID = "user123" as UserID;
export const mockDate = new Date();

export const FullFolderPathToUUID: Hashtable_FullFolderPathToUUID = {
  ["BrowserCache::" as DriveFullFilePath]: "mock-uuid-2" as FolderUUID,
  ["BrowserCache::Work Report/" as DriveFullFilePath]:
    "mock-uuid-4" as FolderUUID,
  ["BrowserCache::Work Report/2023/" as DriveFullFilePath]:
    "mock-uuid-6" as FolderUUID,
  ["BrowserCache::Work Report/2023/Q3-2023/" as DriveFullFilePath]:
    "mock-uuid-9" as FolderUUID,
  ["BrowserCache::Vacation Memories/" as DriveFullFilePath]:
    "mock-uuid-12" as FolderUUID,
  ["HardDrive::" as DriveFullFilePath]: "mock-uuid-14" as FolderUUID,
  ["HardDrive::Work Report/" as DriveFullFilePath]:
    "mock-uuid-15" as FolderUUID,
  ["BrowserCache::epic_image/" as DriveFullFilePath]:
    "mock-uuid-21" as FolderUUID,
  ["MiscStorageXYZ::" as DriveFullFilePath]: "mock-uuid-31" as FolderUUID,
  ["HardDrive::a/" as DriveFullFilePath]: "mock-uuid-33" as FolderUUID,
  ["HardDrive::a/b/" as DriveFullFilePath]: "mock-uuid-34" as FolderUUID,
  ["HardDrive::a/b/c/" as DriveFullFilePath]: "mock-uuid-35" as FolderUUID,
  ["HardDrive::a/b/c/d/" as DriveFullFilePath]: "mock-uuid-36" as FolderUUID,
};

export const FullFilePathToUUID: Hashtable_FullFilePathToUUID = {
  ["BrowserCache::readme.docx" as DriveFullFilePath]: "mock-uuid-1" as FileUUID,
  ["BrowserCache::Work Report/Report_draft.docx" as DriveFullFilePath]:
    "mock-uuid-3" as FileUUID,
  ["BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath]:
    "mock-uuid-7" as FileUUID,
  ["BrowserCache::Work Report/2023/Q3-2023/Quarterly Report.docx" as DriveFullFilePath]:
    "mock-uuid-8" as FileUUID,
  ["BrowserCache::Work Report/2023/Q3-2023/Analytics.docx" as DriveFullFilePath]:
    "mock-uuid-10" as FileUUID,
  ["BrowserCache::Vacation Memories/scenery.png" as DriveFullFilePath]:
    "mock-uuid-11" as FileUUID,
  ["HardDrive::Work Report/Report_draft.docx" as DriveFullFilePath]:
    "mock-uuid-13" as FileUUID,
  ["BrowserCache::epic_image.wtf" as DriveFullFilePath]:
    "mock-uuid-16" as FileUUID,
  ["BrowserCache::epic_image.png" as DriveFullFilePath]:
    "mock-uuid-18" as FileUUID,
  ["BrowserCache::epic_image.preview.png" as DriveFullFilePath]:
    "mock-uuid-19" as FileUUID,
  ["BrowserCache::epic_image/picture.png" as DriveFullFilePath]:
    "mock-uuid-20" as FileUUID,
  ["BrowserCache::epic_image;italy.png" as DriveFullFilePath]:
    "mock-uuid-22" as FileUUID,
  ["BrowserCache::epic_image;;france.png" as DriveFullFilePath]:
    "mock-uuid-23" as FileUUID,
  ["BrowserCache::epic_image~ireland-dublin+=-;'<>()[]{}`,|.png" as DriveFullFilePath]:
    "mock-uuid-24" as FileUUID,
  ["BrowserCache::epic_image" as DriveFullFilePath]: "mock-uuid-25" as FileUUID,
  ["BrowserCache::epic_image." as DriveFullFilePath]:
    "mock-uuid-26" as FileUUID,
  ["BrowserCache::.npmrc" as DriveFullFilePath]: "mock-uuid-27" as FileUUID,
  ["BrowserCache::epic_image.png.png" as DriveFullFilePath]:
    "mock-uuid-28" as FileUUID,
  ["BrowserCache::epic_image.png.png.png" as DriveFullFilePath]:
    "mock-uuid-29" as FileUUID,
  ["MiscStorageXYZ::the fuck?" as DriveFullFilePath]:
    "mock-uuid-30" as FileUUID,
  ["HardDrive::a/b/c/d/z.png" as DriveFullFilePath]: "mock-uuid-32" as FileUUID,
};

export const FolderUUIDToMetadata: Hashtable_FolderUUIDToMetadata = {
  ["mock-uuid-2" as FolderUUID]: {
    id: "mock-uuid-2" as FolderUUID,
    originalFolderName: "",
    parentFolderUUID: null,
    subfolderUUIDs: [
      "mock-uuid-4",
      "mock-uuid-12",
      "mock-uuid-21",
    ] as FolderUUID[],
    fileUUIDs: [
      "mock-uuid-1",
      "mock-uuid-16",
      "mock-uuid-18",
      "mock-uuid-19",
      "mock-uuid-22",
      "mock-uuid-23",
      "mock-uuid-24",
      "mock-uuid-25",
      "mock-uuid-26",
      "mock-uuid-27",
      "mock-uuid-28",
      "mock-uuid-29",
    ] as FileUUID[],
    fullFolderPath: "BrowserCache::" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-4" as FolderUUID]: {
    id: "mock-uuid-4" as FolderUUID,
    originalFolderName: "Work Report",
    parentFolderUUID: "mock-uuid-2" as FolderUUID,
    subfolderUUIDs: ["mock-uuid-6"] as FolderUUID[],
    fileUUIDs: ["mock-uuid-3"] as FileUUID[],
    fullFolderPath: "BrowserCache::Work Report/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-6" as FolderUUID]: {
    id: "mock-uuid-6" as FolderUUID,
    originalFolderName: "2023",
    parentFolderUUID: "mock-uuid-4" as FolderUUID,
    subfolderUUIDs: ["mock-uuid-9"] as FolderUUID[],
    fileUUIDs: ["mock-uuid-7"] as FileUUID[],
    fullFolderPath: "BrowserCache::Work Report/2023/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-9" as FolderUUID]: {
    id: "mock-uuid-9" as FolderUUID,
    originalFolderName: "Q3-2023",
    parentFolderUUID: "mock-uuid-6" as FolderUUID,
    subfolderUUIDs: [] as FolderUUID[],
    fileUUIDs: ["mock-uuid-8", "mock-uuid-10"] as FileUUID[],
    fullFolderPath:
      "BrowserCache::Work Report/2023/Q3-2023/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-12" as FolderUUID]: {
    id: "mock-uuid-12" as FolderUUID,
    originalFolderName: "Vacation Memories",
    parentFolderUUID: "mock-uuid-2" as FolderUUID,
    subfolderUUIDs: [] as FolderUUID[],
    fileUUIDs: ["mock-uuid-11"] as FileUUID[],
    fullFolderPath: "BrowserCache::Vacation Memories/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-14" as FolderUUID]: {
    id: "mock-uuid-14" as FolderUUID,
    originalFolderName: "",
    parentFolderUUID: null,
    subfolderUUIDs: ["mock-uuid-15", "mock-uuid-33"] as FolderUUID[],
    fileUUIDs: [] as FileUUID[],
    fullFolderPath: "HardDrive::" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-15" as FolderUUID]: {
    id: "mock-uuid-15" as FolderUUID,
    originalFolderName: "Work Report",
    parentFolderUUID: "mock-uuid-14" as FolderUUID,
    subfolderUUIDs: [] as FolderUUID[],
    fileUUIDs: ["mock-uuid-13"] as FileUUID[],
    fullFolderPath: "HardDrive::Work Report/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-21" as FolderUUID]: {
    id: "mock-uuid-21" as FolderUUID,
    originalFolderName: "epic_image",
    parentFolderUUID: "mock-uuid-2" as FolderUUID,
    subfolderUUIDs: [] as FolderUUID[],
    fileUUIDs: ["mock-uuid-20"] as FileUUID[],
    fullFolderPath: "BrowserCache::epic_image/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-31" as FolderUUID]: {
    id: "mock-uuid-31" as FolderUUID,
    originalFolderName: "",
    parentFolderUUID: null,
    subfolderUUIDs: [] as FolderUUID[],
    fileUUIDs: ["mock-uuid-30"] as FileUUID[],
    fullFolderPath: "MiscStorageXYZ::" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "MiscStorageXYZ" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-33" as FolderUUID]: {
    id: "mock-uuid-33" as FolderUUID,
    originalFolderName: "a",
    parentFolderUUID: "mock-uuid-14" as FolderUUID,
    subfolderUUIDs: ["mock-uuid-34"] as FolderUUID[],
    fileUUIDs: [] as FileUUID[],
    fullFolderPath: "HardDrive::a/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-34" as FolderUUID]: {
    id: "mock-uuid-34" as FolderUUID,
    originalFolderName: "b",
    parentFolderUUID: "mock-uuid-33" as FolderUUID,
    subfolderUUIDs: ["mock-uuid-35"] as FolderUUID[],
    fileUUIDs: [] as FileUUID[],
    fullFolderPath: "HardDrive::a/b/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-35" as FolderUUID]: {
    id: "mock-uuid-35" as FolderUUID,
    originalFolderName: "c",
    parentFolderUUID: "mock-uuid-34" as FolderUUID,
    subfolderUUIDs: ["mock-uuid-36"] as FolderUUID[],
    fileUUIDs: [] as FileUUID[],
    fullFolderPath: "HardDrive::a/b/c/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-36" as FolderUUID]: {
    id: "mock-uuid-36" as FolderUUID,
    originalFolderName: "d",
    parentFolderUUID: "mock-uuid-35" as FolderUUID,
    subfolderUUIDs: [] as FolderUUID[],
    fileUUIDs: ["mock-uuid-32"] as FileUUID[],
    fullFolderPath: "HardDrive::a/b/c/d/" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
    lastChangedUnixMs: 0,
  },
};

export const FileUUIDToMetadata: Hashtable_FileUUIDToMetadata = {
  ["mock-uuid-1" as FileUUID]: {
    id: "mock-uuid-1" as FileUUID,
    originalFileName: "readme.docx",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "docx",
    fullFilePath: "BrowserCache::readme.docx" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-3" as FileUUID]: {
    id: "mock-uuid-3" as FileUUID,
    originalFileName: "Report_draft.docx",
    folderUUID: "mock-uuid-4" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "docx",
    fullFilePath:
      "BrowserCache::Work Report/Report_draft.docx" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-5" as FileUUID]: {
    id: "mock-uuid-5" as FileUUID,
    originalFileName: "Report.docx",
    folderUUID: "mock-uuid-6" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: "mock-uuid-7" as FileUUID,
    extension: "docx",
    fullFilePath:
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-7" as FileUUID]: {
    id: "mock-uuid-7" as FileUUID,
    originalFileName: "Report.docx",
    folderUUID: "mock-uuid-6" as FolderUUID,
    fileVersion: 2,
    priorVersion: "mock-uuid-5" as FileUUID,
    nextVersion: null,
    extension: "docx",
    fullFilePath:
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-8" as FileUUID]: {
    id: "mock-uuid-8" as FileUUID,
    originalFileName: "Quarterly Report.docx",
    folderUUID: "mock-uuid-9" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "docx",
    fullFilePath:
      "BrowserCache::Work Report/2023/Q3-2023/Quarterly Report.docx" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-10" as FileUUID]: {
    id: "mock-uuid-10" as FileUUID,
    originalFileName: "Analytics.docx",
    folderUUID: "mock-uuid-9" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "docx",
    fullFilePath:
      "BrowserCache::Work Report/2023/Q3-2023/Analytics.docx" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-11" as FileUUID]: {
    id: "mock-uuid-11" as FileUUID,
    originalFileName: "scenery.png",
    folderUUID: "mock-uuid-12" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath:
      "BrowserCache::Vacation Memories/scenery.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-13" as FileUUID]: {
    id: "mock-uuid-13" as FileUUID,
    originalFileName: "Report_draft.docx",
    folderUUID: "mock-uuid-15" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "docx",
    fullFilePath:
      "HardDrive::Work Report/Report_draft.docx" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-16" as FileUUID]: {
    id: "mock-uuid-16" as FileUUID,
    originalFileName: "epic_image.wtf",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "wtf",
    fullFilePath: "BrowserCache::epic_image.wtf" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-17" as FileUUID]: {
    id: "mock-uuid-17" as FileUUID,
    originalFileName: "epic_image.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: "mock-uuid-18" as FileUUID,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-18" as FileUUID]: {
    id: "mock-uuid-18" as FileUUID,
    originalFileName: "epic_image.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 2,
    priorVersion: "mock-uuid-17" as FileUUID,
    nextVersion: null,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-19" as FileUUID]: {
    id: "mock-uuid-19" as FileUUID,
    originalFileName: "epic_image.preview.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image.preview.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-20" as FileUUID]: {
    id: "mock-uuid-20" as FileUUID,
    originalFileName: "picture.png",
    folderUUID: "mock-uuid-21" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image/picture.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-22" as FileUUID]: {
    id: "mock-uuid-22" as FileUUID,
    originalFileName: "epic_image;italy.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image;italy.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-23" as FileUUID]: {
    id: "mock-uuid-23" as FileUUID,
    originalFileName: "epic_image;;france.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image;;france.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-24" as FileUUID]: {
    id: "mock-uuid-24" as FileUUID,
    originalFileName: "epic_image~ireland-dublin+=-;'<>()[]{}`,|.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath:
      "BrowserCache::epic_image~ireland-dublin+=-;'<>()[]{}`,|.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-25" as FileUUID]: {
    id: "mock-uuid-25" as FileUUID,
    originalFileName: "epic_image",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "",
    fullFilePath: "BrowserCache::epic_image" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-26" as FileUUID]: {
    id: "mock-uuid-26" as FileUUID,
    originalFileName: "epic_image.",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "",
    fullFilePath: "BrowserCache::epic_image." as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-27" as FileUUID]: {
    id: "mock-uuid-27" as FileUUID,
    originalFileName: ".npmrc",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "npmrc",
    fullFilePath: "BrowserCache::.npmrc" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-28" as FileUUID]: {
    id: "mock-uuid-28" as FileUUID,
    originalFileName: "epic_image.png.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image.png.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-29" as FileUUID]: {
    id: "mock-uuid-29" as FileUUID,
    originalFileName: "epic_image.png.png.png",
    folderUUID: "mock-uuid-2" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath: "BrowserCache::epic_image.png.png.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "BrowserCache" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-30" as FileUUID]: {
    id: "mock-uuid-30" as FileUUID,
    originalFileName: "the fuck?",
    folderUUID: "mock-uuid-31" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "",
    fullFilePath: "MiscStorageXYZ::the fuck?" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "MiscStorageXYZ" as StorageLocationEnum,
    fileSize: 0,
    rawURL: "",
    lastChangedUnixMs: 0,
  },
  ["mock-uuid-32" as FileUUID]: {
    id: "mock-uuid-32" as FileUUID,
    originalFileName: "z.png",
    folderUUID: "mock-uuid-36" as FolderUUID,
    fileVersion: 1,
    priorVersion: null,
    nextVersion: null,
    extension: "png",
    fullFilePath: "HardDrive::a/b/c/d/z.png" as DriveFullFilePath,
    tags: [],
    owner: "user123" as UserID,
    createdDate: mockDate,
    storageLocation: "HardDrive" as StorageLocationEnum,
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

  beforeEach(() => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);

    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // Reset UUID mock to return predictable values
    uuidCounter = 0;
    vi.mocked(uuidv4).mockImplementation(() => `mock-uuid-${++uuidCounter}`);
  });

  describe("upsertFileToHashTables", () => {
    it("snapshot should look as expected", () => {
      mockInputFiles.map(({ storageLocation, filePath }) =>
        driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID)
      );
      const snapshot = driveDB.exportSnapshot(mockUserID);

      // const snapshotSerialized = JSON.stringify(snapshot, null, 2);
      // fs.writeFile(
      //   `scripts/output/${snapshot.snapshotName}`,
      //   snapshotSerialized,
      //   (err) => {
      //     if (err) {
      //       console.error("Error writing file:", err);
      //     } else {
      //       console.log("File written successfully");
      //     }
      //   }
      // );

      expect(snapshot.id).toEqual("mock-uuid-37");
      expect(snapshot.snapshotName).toEqual(
        `snapshot_officex_drive.id_${"mock-uuid-37"}.userID_${mockUserID}.timestamp_${Math.floor(Date.now() / 1000)}.json`
      );
      expect(snapshot.fullFilePathToUUID).toEqual(FullFilePathToUUID);
      expect(snapshot.fullFolderPathToUUID).toEqual(FullFolderPathToUUID);
      expect(snapshot.fileUUIDToMetadata).toEqual(FileUUIDToMetadata);
      expect(snapshot.folderUUIDToMetadata).toEqual(FolderUUIDToMetadata);
    });
  });
});

describe("Fuzzy Search", () => {
  let driveDB: DriveDB;

  beforeEach(() => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);

    // Populate the DriveDB with mock data
    mockInputFiles.forEach(({ storageLocation, filePath }) => {
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);
    });
  });

  describe("searchFilesQuery", () => {
    it("should return paginated search results", () => {
      const result1 = driveDB.searchFilesQuery({
        searchString: "Report",
        limit: 3,
        after: 0,
      });

      expect(result1.files.length).toBe(3);
      expect(result1.folders.length).toBe(0);
      expect(result1.total).toEqual(3);
      expect(result1.hasMore).toBe(true);

      const result2 = driveDB.searchFilesQuery({
        searchString: "Report",
        limit: 3,
        after: 3,
      });

      expect(result2.files.length).toBe(1);
      expect(result2.folders.length).toBe(2);
      expect(result2.total).toEqual(3);
      expect(result2.hasMore).toBe(false);

      expect(result1.files.length + result2.files.length).toEqual(4);
      expect(result1.folders.length + result2.folders.length).toEqual(2);
      expect(result1.total + result2.total).toBe(6);
    });

    it("should search for both files and folders", () => {
      const result = driveDB.searchFilesQuery({
        searchString: "Work",
        limit: 10,
        after: 0,
      });

      expect(result.files.length).toEqual(0);
      expect(result.folders.length).toBe(2);
      expect(
        result.folders.some(
          (folder) => folder.originalFolderName === "Work Report"
        )
      ).toBe(true);
      expect(
        result.files.some((file) => file.originalFileName.includes("Report"))
      ).toBe(false);
    });

    it("should handle searches with no results", () => {
      const result = driveDB.searchFilesQuery({
        searchString: "NonexistentFile",
        limit: 10,
        after: 0,
      });

      expect(result.files.length).toBe(0);
      expect(result.folders.length).toBe(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it("should handle searches with special characters", () => {
      const result = driveDB.searchFilesQuery({
        searchString: "epic_image~ireland",
        limit: 10,
        after: 0,
      });

      expect(result.files.length).toBe(1);
      expect(result.files[0].originalFileName).toBe(
        "epic_image~ireland-dublin+=-;'<>()[]{}`,|.png"
      );
    });
  });

  describe("reindexFuzzySearch", () => {
    it("should reindex all files and folders", () => {
      const result = driveDB.reindexFuzzySearch();

      expect(result.fileCount).toBe(21);
      expect(result.folderCount).toBe(13);

      // Verify that the search works after reindexing
      const searchResult = driveDB.searchFilesQuery({
        searchString: "Report",
        limit: 10,
        after: 0,
      });

      expect(searchResult.files.length + searchResult.folders.length).toEqual(
        6
      );
      expect(
        searchResult.files.some((file) =>
          file.originalFileName.includes("Report")
        )
      ).toBe(true);
      expect(
        searchResult.folders.some((folder) =>
          folder.originalFolderName.includes("Report")
        )
      ).toBe(true);
    });

    it("should handle reindexing with empty database", async () => {
      // Create a new empty DriveDB instance
      const indexDBStorage = IndexedDBStorage.getInstance();
      // await indexDBStorage.initialize();
      const emptyDriveDB = new DriveDB(indexDBStorage);

      const result = emptyDriveDB.reindexFuzzySearch();

      expect(result.fileCount).toBe(0);
      expect(result.folderCount).toBe(0);

      // Verify that search returns no results
      const searchResult = emptyDriveDB.searchFilesQuery({
        searchString: "anything",
        limit: 10,
        after: 0,
      });

      expect(searchResult.files.length).toBe(0);
      expect(searchResult.folders.length).toBe(0);
      expect(searchResult.total).toBe(0);
      expect(searchResult.hasMore).toBe(false);
    });
  });
});

describe("fetchFilesAtFolderPath", () => {
  let driveDB: DriveDB;

  beforeEach(() => {
    const indexDBStorage = IndexedDBStorage.getInstance();
    // await indexDBStorage.initialize();
    driveDB = new DriveDB(indexDBStorage);

    // Populate the DriveDB with mock data
    mockInputFiles.forEach(({ storageLocation, filePath }) => {
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);
    });
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
      limit: 3,
      after: 0,
    });

    expect(result.folders.length).toBe(1);
    expect(result.files.length).toBe(1);
    expect(result.folders[0].originalFolderName).toBe("2023");
    expect(result.files[0].originalFileName).toBe("Report_draft.docx");
  });

  it("should handle pagination correctly", () => {
    const result1 = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::" as DriveFullFilePath,
      limit: 3,
      after: 0,
    });

    expect(result1.folders.length).toBe(3);
    expect(result1.files.length).toBe(0);
    expect(result1.total).toBe(3);
    expect(result1.hasMore).toBe(true);

    const result2 = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::" as DriveFullFilePath,
      limit: 3,
      after: 3,
    });

    expect(result2.folders.length).toBe(0);
    expect(result2.files.length).toBe(3);
    expect(result2.total).toBe(3);
    expect(result2.hasMore).toBe(true);
  });

  it("should return only items at the current path depth", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::Work Report/2023/" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders.length).toBe(1);
    expect(result.files.length).toBe(1);
    expect(result.total).toBe(2);
    expect(result.hasMore).toBe(false);
    expect(result.folders[0].originalFolderName).toBe("Q3-2023");
    expect(result.files[0].originalFileName).toBe("Report.docx");
  });

  it("should handle a folder with only files", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath:
        "BrowserCache::Work Report/2023/Q3-2023/" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders.length).toBe(0);
    expect(result.files.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.hasMore).toBe(false);
    expect(result.files.map((file) => file.originalFileName).sort()).toEqual([
      "Analytics.docx",
      "Quarterly Report.docx",
    ]);
  });

  it("should handle the root folder", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "BrowserCache::" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders.length).toBe(3);
    expect(result.files.length).toBe(7);
    expect(result.total).toBe(10);
    expect(result.hasMore).toBe(true);
    expect(
      result.folders.map((folder) => folder.originalFolderName).sort()
    ).toEqual(["Vacation Memories", "Work Report", "epic_image"]);
    expect(result.files.map((file) => file.originalFileName)).toContain(
      "readme.docx"
    );
  });

  it("should handle different storage locations", () => {
    const result = driveDB.fetchFilesAtFolderPath({
      fullFolderPath: "HardDrive::" as DriveFullFilePath,
      limit: 10,
      after: 0,
    });

    expect(result.folders.length).toBe(2);
    expect(result.files.length).toBe(0);
    expect(result.total).toBe(2);
    expect(result.hasMore).toBe(false);
    expect(
      result.folders.map((folder) => folder.originalFolderName).sort()
    ).toEqual(["Work Report", "a"]);
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

    // Populate the DriveDB with mock data
    mockInputFiles.forEach(({ storageLocation, filePath }) => {
      driveDB.upsertFileToHashTables(filePath, storageLocation, mockUserID);
    });
  });

  it("should delete a single file", async () => {
    const filePath =
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath;
    const file = await driveDB.getFileByFullPath(filePath);
    expect(file).toBeDefined();
    driveDB.deleteFilesFolders([filePath]);

    const deletedFile = await driveDB.getFileByFullPath(filePath);
    expect(deletedFile).toBeUndefined();

    const parentFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/2023/" as DriveFullFilePath
    );
    expect(parentFolder?.fileUUIDs).not.toContain(file?.id);
  });

  it("should delete a folder and its contents", async () => {
    const folderPath = "BrowserCache::Work Report/2023/" as DriveFullFilePath;
    const existingFolder = driveDB.getFolderByFullPath(folderPath);
    driveDB.deleteFilesFolders([folderPath]);

    const deletedFolder = driveDB.getFolderByFullPath(folderPath);
    expect(deletedFolder).toBeUndefined();

    const deletedFile = await driveDB.getFileByFullPath(
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath
    );
    expect(deletedFile).toBeUndefined();

    const parentFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/" as DriveFullFilePath
    );
    expect(parentFolder?.subfolderUUIDs).not.toContain(existingFolder?.id);
  });

  it("should delete multiple files and folders", async () => {
    const paths = [
      "BrowserCache::Work Report/2023/" as DriveFullFilePath,
      "BrowserCache::Vacation Memories/scenery.png" as DriveFullFilePath,
    ];
    driveDB.deleteFilesFolders(paths);

    const deletedFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/2023/" as DriveFullFilePath
    );
    expect(deletedFolder).toBeUndefined();

    const deletedFile = await driveDB.getFileByFullPath(
      "BrowserCache::Vacation Memories/scenery.png" as DriveFullFilePath
    );
    expect(deletedFile).toBeUndefined();

    const workReportFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/" as DriveFullFilePath
    );
    expect(workReportFolder?.subfolderUUIDs).not.toContain("mock-uuid-6");

    const vacationMemoriesFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Vacation Memories/" as DriveFullFilePath
    );
    expect(vacationMemoriesFolder?.fileUUIDs).toHaveLength(0);
  });

  it("should handle non-existent paths gracefully", () => {
    const nonExistentPath =
      "BrowserCache::NonExistent/Path/" as DriveFullFilePath;
    expect(() => {
      driveDB.deleteFilesFolders([nonExistentPath]);
    }).not.toThrow();
  });

  it("should delete all versions of a file", async () => {
    // Create a new version of an existing file
    driveDB.upsertFileToHashTables(
      "Work Report/2023/Report.docx",
      StorageLocationEnum.BrowserCache,
      mockUserID
    );

    const filePath =
      "BrowserCache::Work Report/2023/Report.docx" as DriveFullFilePath;
    driveDB.deleteFilesFolders([filePath]);

    const deletedFileV1 = await driveDB.getFileByID("mock-uuid-5" as FileUUID);
    const deletedFileV2 = await driveDB.getFileByID("mock-uuid-7" as FileUUID);
    const deletedFileV3 = await driveDB.getFileByID("mock-uuid-38" as FileUUID);

    expect(deletedFileV1).toBeUndefined();
    expect(deletedFileV2).toBeUndefined();
    expect(deletedFileV3).toBeUndefined();

    const parentFolder = driveDB.getFolderByFullPath(
      "BrowserCache::Work Report/2023/" as DriveFullFilePath
    );
    expect(parentFolder?.fileUUIDs).toHaveLength(0);
  });

  it("should delete a deeply nested folder structure", async () => {
    const deepFolderPath = "HardDrive::a/" as DriveFullFilePath;
    const deepFolder = driveDB.getFolderByFullPath(deepFolderPath);
    driveDB.deleteFilesFolders([deepFolderPath]);

    const deletedFolder = driveDB.getFolderByFullPath(deepFolderPath);
    expect(deletedFolder).toBeUndefined();

    const deletedSubFolders = [
      "HardDrive::a/b/" as DriveFullFilePath,
      "HardDrive::a/b/c/" as DriveFullFilePath,
      "HardDrive::a/b/c/d/" as DriveFullFilePath,
    ];

    deletedSubFolders.forEach((folderPath) => {
      const folder = driveDB.getFolderByFullPath(folderPath);
      expect(folder).toBeUndefined();
    });

    const deletedFile = await driveDB.getFileByFullPath(
      "HardDrive::a/b/c/d/z.png" as DriveFullFilePath
    );
    expect(deletedFile).toBeUndefined();

    const hardDriveRoot = driveDB.getFolderByFullPath(
      "HardDrive::" as DriveFullFilePath
    );
    expect(hardDriveRoot?.fileUUIDs).toEqual([]);
    expect(hardDriveRoot?.subfolderUUIDs).not.toContain(deepFolder);
    expect(hardDriveRoot?.subfolderUUIDs).toContain("mock-uuid-15");
  });

  it("should handle deletion of files with special characters in their names", async () => {
    const specialCharFilePath =
      "BrowserCache::epic_image~ireland-dublin+=-;'<>()[]{}`,|.png" as DriveFullFilePath;
    driveDB.deleteFilesFolders([specialCharFilePath]);

    const deletedFile = await driveDB.getFileByFullPath(specialCharFilePath);
    expect(deletedFile).toBeUndefined();

    const rootFolder = driveDB.getFolderByFullPath(
      "BrowserCache::" as DriveFullFilePath
    );
    expect(rootFolder?.fileUUIDs).not.toContain("mock-uuid-24" as FileUUID);
  });

  it("should delete files from different storage locations", async () => {
    const paths = [
      "BrowserCache::readme.docx" as DriveFullFilePath,
      "HardDrive::Work Report/Report_draft.docx" as DriveFullFilePath,
    ];
    driveDB.deleteFilesFolders(paths);

    const deletedFile1 = await driveDB.getFileByFullPath(
      "BrowserCache::readme.docx" as DriveFullFilePath
    );
    const deletedFile2 = await driveDB.getFileByFullPath(
      "HardDrive::Work Report/Report_draft.docx" as DriveFullFilePath
    );

    expect(deletedFile1).toBeUndefined();
    expect(deletedFile2).toBeUndefined();

    const browserCacheRoot = driveDB.getFolderByFullPath(
      "BrowserCache::" as DriveFullFilePath
    );
    expect(browserCacheRoot?.fileUUIDs).not.toContain(
      "mock-uuid-1" as FileUUID
    );

    const hardDriveWorkReportFolder = driveDB.getFolderByFullPath(
      "HardDrive::Work Report/" as DriveFullFilePath
    );
    expect(hardDriveWorkReportFolder?.fileUUIDs).toHaveLength(0);
  });
});
