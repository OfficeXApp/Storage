import Identity from "./identity_deprecated";
import {
  DriveDB,
  IndexedDBStorage,
  DriveProvider,
  useDrive,
  getUploadFolderPath,
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
} from "./drive";

export {
  DriveDB,
  IndexedDBStorage,
  DriveProvider,
  useDrive,
  getUploadFolderPath,
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
};
export { Identity };
export type {
  DriveFileRawDestination,
  FileMetadataFragment,
  FileMetadata,
  FolderMetadata,
  DriveFullFilePath,
  FileUUID,
  UploadProgress,
  UploadItem,
  FolderUUID,
} from "./drive/types";
export {
  DRIVE_ERRORS,
  StorageLocationEnum,
  FileUploadStatusEnum,
} from "./drive/types";

export type { UserID } from "./identity/types";
