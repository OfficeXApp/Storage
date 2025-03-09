// drive/types.ts

import { UserID } from "@officexapp/types";

export type FolderUUID = string & { readonly __folderUUID: unique symbol };
export type FileUUID = string & { readonly __fileUUID: unique symbol };
export type Tag = string & { readonly __tag: unique symbol };
export type DriveSnapshotID = string & { readonly __snapshotID: unique symbol };

export enum StorageLocationEnum {
  BrowserCache = "BrowserCache",
  HardDrive = "HardDrive",
  Web3Storj = "Web3Storj",
}
export type UploadFolderPath = string;
export type DriveFilePath = string;
export type DriveFullFilePath = `${StorageLocationEnum}::${DriveFilePath}`;
export type DriveFileRawDestinationIndexDBFileID = string;
export type DriveFileRawDestination =
  | DriveFileRawDestinationIndexDBFileID
  | string;

export type Hashtable_FolderUUIDToMetadata = Record<FolderUUID, FolderMetadata>;
export type Hashtable_FileUUIDToMetadata = Record<FileUUID, FileMetadata>;

// Type for Folder Metadata
export interface FolderMetadata {
  id: FolderUUID;
  originalFolderName: string;
  parentFolderUUID: FolderUUID | null;
  subfolderUUIDs: FolderUUID[];
  fileUUIDs: FileUUID[];
  fullFolderPath: DriveFullFilePath;
  tags: Tag[];
  owner: UserID;
  createdDate: Date; // ISO 8601 format
  storageLocation: StorageLocationEnum;
  lastChangedUnixMs: number; // unix time ms
  deleted?: boolean;
}

// Type for File Metadata
export interface FileMetadata {
  id: FileUUID;
  originalFileName: string;
  folderUUID: FolderUUID;
  fileVersion: number;
  priorVersion: FileUUID | null;
  nextVersion: FileUUID | null;
  extension: string;
  fullFilePath: DriveFullFilePath;
  tags: Tag[];
  owner: UserID;
  createdDate: Date; // ISO 8601 format
  storageLocation: StorageLocationEnum;
  fileSize: number; // in bytes
  rawURL: DriveFileRawDestination; // the real location of the file
  lastChangedUnixMs: number; // unix time ms
  deleted?: boolean;
}

// Type for Full Folder Path to UUID Hashtable
export type Hashtable_FullFolderPathToUUID = Record<
  DriveFullFilePath,
  FolderUUID
>;

// Type for Full File Path to UUID Hashtable (Optional)
export type Hashtable_FullFilePathToUUID = Record<DriveFullFilePath, FileUUID>;

// Type for Tags to UUIDs Mapping (Optional)
export interface Hashtable_TagsToUUIDsMap {
  [tag: string]: {
    folderUUIDs: FolderUUID[];
    fileUUIDs: FileUUID[];
  };
}

// Snapshot of the Drive Database
export interface DriveDBSnapshot {
  id: DriveSnapshotID;
  createdAt: Date;
  snapshotName: string;
  fullFolderPathToUUID: Hashtable_FullFolderPathToUUID;
  fullFilePathToUUID: Hashtable_FullFilePathToUUID;
  folderUUIDToMetadata: Hashtable_FolderUUIDToMetadata;
  fileUUIDToMetadata: Hashtable_FileUUIDToMetadata;
}

// Fetch files & folders at a given path
export interface FetchFilesAtFolderPathConfig {
  fullFolderPath: DriveFullFilePath;
  limit: number;
  after: number;
}
export interface SearchFilesQueryConfig {
  searchString: string;
  limit: number;
  after: number;
}

export type FuseRecordID = `file:::${FileUUID}` | `folder:::${FolderUUID}`;
export type FuseRecordText = string;
export interface FuseRecord {
  id: FuseRecordID;
  text: FuseRecordText;
}

export enum DRIVE_ERRORS {
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  FOLDER_NOT_FOUND = "FOLDER_NOT_FOUND",
  INVALID_NAME = "INVALID_NAME",
  NAME_CONFLICT = "NAME_CONFLICT",
}

export interface FileMetadataFragment {
  id: FileUUID;
  name: string;
  mimeType: string;
  fileSize: number;
  rawURL: DriveFileRawDestination;
}

export enum FileUploadStatusEnum {
  Queued = "queued",
  Uploading = "uploading",
  Completed = "completed",
  Failed = "failed",
  Cancelled = "cancelled",
}

export interface UploadItem {
  id: FileUUID;
  file: File;
  name: string;
  path: DriveFilePath;
  progress: number;
  status: FileUploadStatusEnum;
  storageLocation: StorageLocationEnum;
}

export interface UploadProgress {
  totalFiles: number;
  completedFiles: number;
  inProgress: UploadItem[];
  percentage: number;
}

export enum HashtableTypeEnum {
  FullFolderPathToUUID = "fullFolderPathToUUID",
  FullFilePathToUUID = "fullFilePathToUUID",
  FolderUUIDToMetadata = "folderUUIDToMetadata",
  FileUUIDToMetadata = "fileUUIDToMetadata",
}
