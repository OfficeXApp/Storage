// drive/types.ts

import type {
  ApiKeyID,
  APIKeyMetadata,
  ApiKeyValue,
  CanisterID,
  Team,
  TeamID,
  User,
  UserID,
} from "../identity/types";

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
export type CosmicPath = `${CanisterID}>>${DriveFullFilePath}`;
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
  deleted: boolean;
  expiresAt: number; // unix time ms
  canisterID: CanisterID;
  // const cosmicPath = `${canisterID}>>${StorageLocationEnum}::${DriveFilePath}` eg. `adf424123d4e>>BrowserCache::test.txt`
  // or if deleted const cosmicPath = `${canisterID}_trash>>${StorageLocationEnum}::${DriveFilePath}`
  cosmicPath: CosmicPath;
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
  deleted: boolean;
  expiresAt: number; // unix time ms
  canisterID: CanisterID;
  // const cosmicPath = `${canisterID}>>${StorageLocationEnum}::${DriveFilePath}` eg. `adf424123d4e>>BrowserCache::test.txt`
  // or if deleted const cosmicPath = `${canisterID}_trash>>${StorageLocationEnum}::${DriveFilePath}`
  cosmicPath: CosmicPath;
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
  rolodexUsers: RolodexUsers;
  rolodexApiKeys: RolodexApiKeys;
  rolodexTeams: RolodexTeams;
  rolodexCanisters: RolodexCanisters;
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

export interface DirectoryExtraData {
  canisterID: CanisterID;
  expiresAt?: number;
}

export interface UploadItem {
  id: FileUUID;
  file: File;
  name: string;
  path: DriveFilePath;
  progress: number;
  status: FileUploadStatusEnum;
  storageLocation: StorageLocationEnum;
  directoryExtraData: DirectoryExtraData;
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

// Everything in OfficeX lives in folders and share same auth roles
// Even metadata about your organization is in a folder .officex/metadata
// Member permissions are also in your folder .officex/teams (whereas file permissions are in hashtables)
// Torrent records are in your folder .officex/torrents
export enum ResourcePermissionEnum {
  READ = "read", // Can view the resource
  WRITE = "write", // Can edit the resource
  DELETE = "delete", // Can delete the resource
  INVITE = "invite", // Can invite others to the resource at same scope or lower
  SYNC = "sync", // Can sync the resource to a local folder
}
const mockSystemDirectory = {
  ".officex": {
    organization: [], //
    teams: [], // team_id.json holds info about remote (cosmic) teams
    torrents: [], // torrent_id.json holds info about torrents
  },
};

export type UserOrTeamID = UserID | TeamID;
export interface ResourceACL {
  fullPath: DriveFullFilePath;
  scopes: Record<UserOrTeamID, ResourcePermissionEnum[]>;
}

export interface RolodexUsers {
  [userID: UserID]: User;
}

export interface RolodexApiKeys {
  [apiKeyValue: ApiKeyValue]: APIKeyMetadata;
}

export interface RolodexTeams {
  [teamID: TeamID]: Team;
}

export interface RolodexCanisters {
  [canisterID: CanisterID]: DriveCanister;
}

export interface DriveCanister {
  canisterID: CanisterID;
  nickname: string;
  createdAt: number;
}
