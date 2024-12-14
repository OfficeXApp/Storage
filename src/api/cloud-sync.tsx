import {
  DriveFullFilePath,
  FileUUID,
  FolderUUID,
  getUploadFolderPath,
  Identity,
  useDrive,
} from "@officexapp/framework";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import {
  idlFactory as idlFactory_Drive,
  _SERVICE as DriveSERVICE,
  StorageLocationEnum,
} from "../declarations/officex-canisters-backend/officex-canisters-backend.did.js";

const { useIdentity } = Identity;

export enum FileSyncStrategy {
  keepNewer = "keepNewer",
  keepLocal = "keepLocal",
  keepCloud = "keepCloud",
  keepBoth = "keepBoth",
}

function timestampToBigInt(date: string | Date): bigint {
  const timestamp =
    typeof date === "string" ? new Date(date).getTime() : date.getTime();
  return BigInt(timestamp);
}

const useCloudSync = () => {
  const {
    fetchFilesAtFolderPath,
    surgicallySyncFileUUID,
    upsertLocalFileWithCloudSync,
  } = useDrive();
  const { icpCanisterId, icpActor, icpAgent, icpAccount } = useIdentity();

  const syncFolderPath = async (
    fullPathString: string,
    _syncStrategy?: FileSyncStrategy
  ) => {
    const syncStrategy = _syncStrategy || FileSyncStrategy.keepNewer;
    console.log("syncing...", icpAccount?.principal.toString());
    if (!icpAccount?.principal) return;
    console.log("canister principal", icpAccount.principal.toText());
    console.log(`Syncing folder path: ${fullPathString}`);
    const localDriveContents = await fetchFilesAtFolderPath(
      fullPathString as DriveFullFilePath,
      100,
      0
    );

    console.log("localDriveContents:", localDriveContents);
    const actor = icpActor as ActorSubclass<DriveSERVICE>;

    const res = await actor.ping();
    console.log(`Ping response: ${res}`);

    const cloudDriveContents = await actor.fetch_files_at_folder_path({
      full_folder_path: fullPathString,
      limit: 100,
      after: 0,
    });
    console.log("cloudDriveContents:", cloudDriveContents);

    // loop through local files first
    for (const localFile of localDriveContents.files) {
      console.log("localFile:", localFile);
      const cloudFile = cloudDriveContents.files.find(
        (f) => f.full_file_path === localFile.fullFilePath
      );

      // case 2: local file new, cloud file none --> upload local file to cloud
      if (!cloudFile) {
        console.log(
          "Cloud file does not exist, upload local file",
          localFile.id
        );
        const storageLocationVariant = {
          [`${localFile.storageLocation}`]: null,
        } as StorageLocationEnum;
        console.log(`storageLocationVariant`, storageLocationVariant);
        const cloud_file_uuid = (await actor.upsert_file_to_hash_tables(
          localFile.fullFilePath,
          storageLocationVariant
        )) as FileUUID;

        const fileUUID = await surgicallySyncFileUUID(
          localFile.id,
          cloud_file_uuid
        );
        if (!fileUUID) continue;
        const cloudFileMetadata = {
          id: cloud_file_uuid,
          original_file_name: localFile.originalFileName,
          folder_uuid: localFile.folderUUID,
          file_version: localFile.fileVersion,
          prior_version: localFile.priorVersion || [],
          next_version: [], // empty syntax for candid files
          extension: localFile.extension,
          full_file_path: localFile.fullFilePath,
          tags: localFile.tags,
          owner: icpAccount.principal,
          created_date: timestampToBigInt(localFile.createdDate),
          modified_date: timestampToBigInt(localFile.modifiedDate),
          storage_location: { [localFile.storageLocation]: null },
          file_size: localFile.fileSize,
          raw_url: localFile.rawURL,
          last_changed_unix_ms: BigInt(localFile.lastChangedUnixMs),
          deleted: localFile.deleted === undefined ? false : localFile.deleted,
        };
        try {
          const savedCloudFileUUIDRes =
            await actor.upsert_cloud_file_with_local_sync(
              cloud_file_uuid,
              // @ts-ignore
              cloudFileMetadata
            );
          console.log(`savedCloudFileUUIDRes`, savedCloudFileUUIDRes);
          if ("Ok" in savedCloudFileUUIDRes) {
            const finalFileUUID = await surgicallySyncFileUUID(
              cloud_file_uuid,
              savedCloudFileUUIDRes.Ok as FileUUID
            );
          }
        } catch (e: any) {
          console.log(`Error uploading file to cloud`, e);
        }
        continue;
      }
      // case 3: local file new, cloud file old --> ask user which they want to keep & show timestamps (local, cloud, newer, both)
      if (
        Number(localFile.lastChangedUnixMs) >
        Number(cloudFile.last_changed_unix_ms)
      ) {
        console.log(
          "Local file is newer than cloud file, overwrite cloud file metadata",
          localFile.id
        );
        const cloudFileMetadata = {
          id: cloudFile.id,
          original_file_name: localFile.originalFileName,
          folder_uuid: localFile.folderUUID,
          file_version: localFile.fileVersion,
          prior_version: localFile.priorVersion || [],
          next_version: [], // empty syntax for candid files
          extension: localFile.extension,
          full_file_path: localFile.fullFilePath,
          tags: localFile.tags,
          owner: icpAccount.principal,
          created_date: timestampToBigInt(localFile.createdDate),
          modified_date: timestampToBigInt(localFile.modifiedDate),
          storage_location: { [localFile.storageLocation]: null },
          file_size: localFile.fileSize,
          raw_url: localFile.rawURL,
          last_changed_unix_ms: BigInt(localFile.lastChangedUnixMs),
          deleted: localFile.deleted === undefined ? false : localFile.deleted,
        };
        console.log(`newer local to be saved in cloud`, cloudFileMetadata);
        try {
          const savedCloudMetadata =
            await actor.upsert_cloud_file_with_local_sync(
              cloudFile.id,
              // @ts-ignore
              cloudFileMetadata
            );
          console.log(`savedCloudMetadata`, savedCloudMetadata);
        } catch (e: any) {
          console.log(`Error uploading file to cloud`, e);
        }
        continue;
      }
      // case 4: local file old, cloud file new --> ask user which they want to keep & show timestamps (local, cloud, newer, both)
      else if (
        Number(localFile.lastChangedUnixMs) <
        Number(cloudFile.last_changed_unix_ms)
      ) {
        console.log(
          "Cloud file is newer than local file, overwrite local file metadata",
          cloudFile
        );
        const localFileMetadata = {
          id: cloudFile.id as FileUUID,
          originalFileName: cloudFile.original_file_name,
          folderUUID: cloudFile.folder_uuid as FolderUUID,
          fileVersion: cloudFile.file_version,
          priorVersion:
            cloudFile.prior_version && cloudFile.prior_version[0]
              ? (cloudFile.prior_version[0] as FileUUID)
              : undefined,
          nextVersion:
            cloudFile.next_version && cloudFile.next_version[0]
              ? (cloudFile.next_version[0] as FileUUID)
              : undefined,
          extension: cloudFile.extension,
          fullFilePath: cloudFile.full_file_path as DriveFullFilePath,
          tags: cloudFile.tags,
          owner: cloudFile.owner,
          createdDate: new Date(Number(cloudFile.created_date)),
          modifiedDate: new Date(Number(cloudFile.modified_date)),
          storageLocation: Object.keys(cloudFile.storage_location)[0],
          fileSize: cloudFile.file_size,
          rawURL: cloudFile.raw_url,
          lastChangedUnixMs: cloudFile.last_changed_unix_ms,
          deleted: cloudFile.deleted,
        };
        const newLocalFileSaved = await upsertLocalFileWithCloudSync(
          localFile.id,
          // @ts-ignore
          localFileMetadata
        );
        console.log(`newLocalFileSaved`, newLocalFileSaved);
        continue;
      } else if (
        Number(localFile.lastChangedUnixMs) ===
        Number(cloudFile.last_changed_unix_ms)
      ) {
        console.log("Both files are the same, no action needed", localFile.id);
        continue;
      }
    }

    // loop through local folders next

    // loop through cloud files next

    // loop through cloud folders last

    return;
  };

  // called anytime manually to sync offline changes with cloud
  // will upload any new files/folder to cloud
  // will download any new files/folder from cloud
  // needs to handle per file conflict resolution (which should be newer version, offline or cloud?)
  const syncOfflineWithCloud = async ({
    fullFolderPath,
    syncDepth = 10,
  }: {
    fullFolderPath?: string;
    // syncDepth determines how many levels of subfolders to sync. -1 means all levels, 0 means only the current folder, 1 means current folder and its immediate children, etc.
    syncDepth?: number;
  }) => {
    console.log("Syncing offline changes with cloud...");
    const { uploadFolderPath: currentUploadFolderPath, storageLocation } =
      getUploadFolderPath();
    let targetFolderPath = `${storageLocation}::${currentUploadFolderPath}`;
    console.log("targetFolderPath", targetFolderPath);
    if (fullFolderPath) {
      targetFolderPath = fullFolderPath;
    }
    await syncFolderPath(targetFolderPath);
    // Cases
    /**
     *  case 1: local file none, cloud file exists --> download cloud file to local
     *  case 2: local file new, cloud file none --> upload local file to cloud
     *  case 3: local file new, cloud file old --> ask user which they want to keep & show timestamps (local, cloud, newer, both)
     *  case 4: local file old, cloud file new --> ask user which they want to keep & show timestamps (local, cloud, newer, both)
     *  case 5: local file old, cloud file old --> last modified timestamp should be same, so no action needed
     *
     *  these should also naturally handle deletions on either side. however deletion is also dangerous so we should ask user for confirmation before deleting anything, or implement a trashbin
     */
    // Process
    /**
     * step 1: scan both local & cloud at current path. receive both lists for comparison
     * step 2: traverse breadth first search until syncDepth is reached
     * step 3: check file by file, folder by folder, for each case & handle
     * step 4: proceed to next folderfile, until all are done and syncDepth is reached
     * step 5: note any conflicts and ask user for resolution
     */
    return;
  };

  return {
    syncOfflineWithCloud,
  };
};

export default useCloudSync;
