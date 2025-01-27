import {
  DriveFullFilePath,
  FileUUID,
  FolderMetadata,
  FolderUUID,
  getUploadFolderPath,
  Identity,
  useDrive,
  UserID,
  StorageLocationEnum as StorageLocationEnumFE,
} from "../framework";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import {
  idlFactory as idlFactory_Drive,
  _SERVICE as DriveSERVICE,
  StorageLocationEnum,
  Tag,
} from "../declarations/officex-canisters-backend/officex-canisters-backend.did.js";
import { useState } from "react";
import { message, notification, Spin } from "antd";

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
  if (isNaN(timestamp)) {
    return BigInt(0);
  }
  return BigInt(timestamp);
}

const useCloudSync = () => {
  const {
    exportSnapshot,
    createFolder,
    getFolderByFullPath,
    fetchFilesAtFolderPath,
    surgicallySyncFileUUID,
    surgicallySyncFolderUUID,
    upsertLocalFileWithCloudSync,
    upsertLocalFolderWithCloudSync,
  } = useDrive();
  const { icpCanisterId, icpActor, icpAgent, icpAccount } = useIdentity();
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiNotifs, contextHolder] = notification.useNotification();

  const syncFolderPath = async (
    current: { folderPath: string; depth: number },
    queue: { folderPath: string; depth: number }[],
    syncConfig: { syncDepth: number; _syncStrategy?: FileSyncStrategy }
  ) => {
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
    const fullPathString = current.folderPath;
    const syncStrategy = syncConfig._syncStrategy || FileSyncStrategy.keepNewer;

    if (!icpAccount?.principal) return;

    const actor = icpActor as ActorSubclass<DriveSERVICE>;

    // first update the folder itself, always syncing with the cloud folder id (surgical sync)
    const localFolderLayer0 = await getFolderByFullPath(
      // @ts-ignore
      fullPathString
    );
    const cloudFolderLayer0 = await actor.get_folder_by_path(fullPathString);

    // if mismatch, sync the folderUUIDs
    // if (
    //   localFolderLayer0 &&
    //   cloudFolderLayer0[0]?.id &&
    //   localFolderLayer0?.id !== cloudFolderLayer0[0]?.id
    // ) {
    //   await surgicallySyncFolderUUID(
    //     localFolderLayer0.id,
    //     cloudFolderLayer0[0]?.id as FolderUUID
    //   );
    // }

    if (cloudFolderLayer0[0]) {
      // Extract storage location and path parts correctly
      const [storageLocation, ...pathParts] =
        cloudFolderLayer0[0].full_folder_path.split("::");
      // const folderPath = pathParts.join("/");
      // const properPath =
      //   `${storageLocation}::${folderPath}` as DriveFullFilePath;
      const properPath = cloudFolderLayer0[0]
        .full_folder_path as DriveFullFilePath;

      // if mismatch, sync the folderUUIDs
      if (
        localFolderLayer0 &&
        cloudFolderLayer0[0]?.id &&
        localFolderLayer0?.id !== cloudFolderLayer0[0]?.id
      ) {
        await surgicallySyncFolderUUID(
          localFolderLayer0.id,
          cloudFolderLayer0[0]?.id as FolderUUID
        );
      }

      // cloud exists, local doesnt, create local folder
      if (!localFolderLayer0 && cloudFolderLayer0[0]) {
        const newFolderMetadata = await createFolder(
          cloudFolderLayer0[0].full_folder_path as DriveFullFilePath,
          // properPath,
          // @ts-ignore
          storageLocation as StorageLocationEnumFE,
          icpAccount.principal.toString() as UserID
        );
        // download cloud folder to local
        const cloudFolderMetadata: Partial<FolderMetadata> = {
          id: cloudFolderLayer0[0].id as FolderUUID,
          originalFolderName: cloudFolderLayer0[0].original_folder_name,
          parentFolderUUID: cloudFolderLayer0[0]
            .parent_folder_uuid[0] as FolderUUID,
          subfolderUUIDs: cloudFolderLayer0[0].subfolder_uuids as FolderUUID[],
          fileUUIDs: cloudFolderLayer0[0].file_uuids as FileUUID[],
          fullFolderPath: cloudFolderLayer0[0]
            .full_folder_path as DriveFullFilePath,
          // @ts-ignore
          tags: cloudFolderLayer0[0].tags as Tag[],
          owner: cloudFolderLayer0[0].owner.toString() as UserID,
          createdDate: new Date(Number(cloudFolderLayer0[0].created_date)),
          storageLocation: storageLocation as StorageLocationEnumFE,
          lastChangedUnixMs: Number(cloudFolderLayer0[0].last_changed_unix_ms),
          deleted: cloudFolderLayer0[0].deleted || false,
        };

        await upsertLocalFolderWithCloudSync(
          newFolderMetadata.id as FolderUUID,
          cloudFolderMetadata
        );

        await surgicallySyncFolderUUID(
          newFolderMetadata.id as FolderUUID,
          cloudFolderMetadata.id as FolderUUID
        );
      }
    }
    // local exists, cloud doesnt, create cloud folder
    if (localFolderLayer0 && !cloudFolderLayer0[0]) {
      const cloudFolderResult = await actor.create_folder(
        fullPathString,
        // @ts-ignore
        { [localFolderLayer0.storageLocation]: null }
      );

      if ("Ok" in cloudFolderResult) {
        const metadata = cloudFolderResult.Ok;
        const updatedFolderUUID = await surgicallySyncFolderUUID(
          localFolderLayer0.id,
          metadata.id as FolderUUID
        );
        if (updatedFolderUUID) {
          const upsertFolderData = {
            id: metadata.id as FolderUUID,
            originalFolderName: localFolderLayer0.originalFolderName,
            parentFolderUUID: localFolderLayer0.parentFolderUUID,
            subfolderUUIDs: localFolderLayer0.subfolderUUIDs,
            fileUUIDs: localFolderLayer0.fileUUIDs,
            fullFolderPath: localFolderLayer0.fullFolderPath,
            tags: localFolderLayer0.tags,
            owner: icpAccount.principal.toString() as UserID,
            createdDate: localFolderLayer0.createdDate,
            storageLocation: localFolderLayer0.storageLocation,
            lastChangedUnixMs: localFolderLayer0.lastChangedUnixMs,
            deleted: localFolderLayer0.deleted || false,
          };
          const upsertedFolderMetadata = await upsertLocalFolderWithCloudSync(
            updatedFolderUUID,
            upsertFolderData
          );
          await surgicallySyncFolderUUID(
            updatedFolderUUID,
            upsertedFolderMetadata.id as FolderUUID
          );
        }
      }
    }

    const localDriveContents = await fetchFilesAtFolderPath(
      fullPathString as DriveFullFilePath,
      100,
      0
    );

    const res = await actor.ping();
    console.log(`Ping response: ${res}`);

    const cloudDriveContents = await actor.fetch_files_at_folder_path({
      full_folder_path: fullPathString,
      limit: 100,
      after: 0,
    });

    // loop through local folders first
    for (const localFolder of localDriveContents.folders) {
      const cloudFolder = cloudDriveContents.folders.find(
        (f) => f.full_folder_path === localFolder.fullFolderPath
      );
      // cloud folder does not exist, local folder exists
      // create cloud folder, then surgical sync folderUUID
      if (!cloudFolder) {
        const cloudFolderResult = await actor.create_folder(
          localFolder.fullFolderPath,
          // @ts-ignore
          { [localFolder.storageLocation]: null }
        );
        if ("Ok" in cloudFolderResult) {
          const metadata = cloudFolderResult.Ok;
          const updatedFolderUUID = await surgicallySyncFolderUUID(
            localFolder.id,
            metadata.id as FolderUUID
          );
          if (!updatedFolderUUID) continue;
          const upsertFolderData = {
            id: metadata.id as FolderUUID,
            originalFolderName: localFolder.originalFolderName,
            parentFolderUUID: localFolder.parentFolderUUID,
            subfolderUUIDs: localFolder.subfolderUUIDs,
            fileUUIDs: localFolder.fileUUIDs,
            fullFolderPath: localFolder.fullFolderPath,
            tags: localFolder.tags,
            owner: icpAccount.principal.toString() as UserID,
            createdDate: localFolder.createdDate,
            storageLocation: localFolder.storageLocation,
            lastChangedUnixMs: localFolder.lastChangedUnixMs,
            deleted: localFolder.deleted || false,
          };
          const upsertedFolderMetadata = await upsertLocalFolderWithCloudSync(
            updatedFolderUUID as FolderUUID,
            upsertFolderData
          );
          await surgicallySyncFolderUUID(
            updatedFolderUUID as FolderUUID,
            upsertedFolderMetadata.id as FolderUUID
          );
        }
        continue;
      }

      // cloud folder new, local old
      if (
        Number(localFolder.lastChangedUnixMs) <
        Number(cloudFolder.last_changed_unix_ms)
      ) {
        const localFolderMetadata = {
          id: cloudFolder.id as FolderUUID,
          originalFolderName: cloudFolder.original_folder_name,
          parentFolderUUID: cloudFolder.parent_folder_uuid[0] as FolderUUID,
          subfolderUUIDs: cloudFolder.subfolder_uuids as FolderUUID[],
          fileUUIDs: cloudFolder.file_uuids as FileUUID[],
          fullFolderPath: cloudFolder.full_folder_path as DriveFullFilePath,
          // @ts-ignore
          tags: cloudFolder.tags as Tag[],
          owner: cloudFolder.owner.toString() as UserID,
          createdDate: new Date(Number(cloudFolder.created_date)),
          storageLocation:
            `${Object.keys(cloudFolder.storage_location)[0]}` as StorageLocationEnumFE,
          lastChangedUnixMs: Number(cloudFolder.last_changed_unix_ms),
          deleted: cloudFolder.deleted || false,
        };
        const newLocalFolderSaved = await upsertLocalFolderWithCloudSync(
          cloudFolder.id as FolderUUID,
          // @ts-ignore
          localFolderMetadata
        );

        continue;
      }
      // cloud old, local new
      if (
        Number(localFolder.lastChangedUnixMs) >
        Number(cloudFolder.last_changed_unix_ms)
      ) {
        const cloudFolderMetadata = {
          id: cloudFolder.id as FolderUUID,
          original_folder_name: localFolder.originalFolderName,
          parent_folder_uuid: localFolder.parentFolderUUID
            ? [localFolder.parentFolderUUID]
            : [],
          subfolder_uuids: localFolder.subfolderUUIDs,
          file_uuids: localFolder.fileUUIDs,
          full_folder_path: localFolder.fullFolderPath,
          tags: localFolder.tags,
          owner: icpAccount.principal,
          created_date: timestampToBigInt(localFolder.createdDate),
          storage_location: { [`${localFolder.storageLocation}`]: null },
          last_changed_unix_ms: BigInt(localFolder.lastChangedUnixMs),
          deleted: localFolder.deleted,
        };
        const savedCloudFolderUUIDRes =
          await actor.upsert_cloud_folder_with_local_sync(
            cloudFolder.id,
            // @ts-ignore
            cloudFolderMetadata
          );

        if ("Ok" in savedCloudFolderUUIDRes) {
          const finalFolderUUID = await surgicallySyncFolderUUID(
            localFolder.id as FolderUUID,
            savedCloudFolderUUIDRes.Ok as FolderUUID
          );
        }

        continue;
      }
    }

    // loop through cloud folders next
    for (const cloudFolder of cloudDriveContents.folders) {
      // Extract storage location and path parts correctly
      const [storageLocation, ...pathParts] =
        cloudFolder.full_folder_path.split("::");
      const folderPath = pathParts.join("/");
      const properPath =
        `${storageLocation}::${folderPath}` as DriveFullFilePath;

      const localFolder = localDriveContents.folders.find(
        (f) => f.fullFolderPath === properPath
      );
      // local folder does not exist, cloud folder exists
      if (!localFolder) {
        const newFolderMetadata = await createFolder(
          // cloudFolder.full_folder_path as DriveFullFilePath,
          properPath,
          // @ts-ignore
          // Object.keys(cloudFolder.storage_location)[0],
          storageLocation as StorageLocationEnumFE,
          icpAccount.principal.toString() as UserID
        );
        // download cloud folder to local
        const cloudFolderMetadata: Partial<FolderMetadata> = {
          id: cloudFolder.id as FolderUUID,
          originalFolderName: cloudFolder.original_folder_name,
          parentFolderUUID: cloudFolder.parent_folder_uuid[0] as FolderUUID,
          subfolderUUIDs: cloudFolder.subfolder_uuids as FolderUUID[],
          fileUUIDs: cloudFolder.file_uuids as FileUUID[],
          fullFolderPath: properPath,
          // @ts-ignore
          tags: cloudFolder.tags as Tag[],
          owner: cloudFolder.owner.toString() as UserID,
          createdDate: new Date(Number(cloudFolder.created_date)),
          storageLocation: storageLocation as StorageLocationEnumFE,
          lastChangedUnixMs: Number(cloudFolder.last_changed_unix_ms),
          deleted: cloudFolder.deleted || false,
        };
        const upsertedLocalMetadata = await upsertLocalFolderWithCloudSync(
          newFolderMetadata.id as FolderUUID,
          cloudFolderMetadata
        );

        await surgicallySyncFolderUUID(
          newFolderMetadata.id as FolderUUID,
          cloudFolder.id as FolderUUID
        );

        continue;
      }
    }

    // loop through local files next
    for (const localFile of localDriveContents.files) {
      const cloudFile = cloudDriveContents.files.find(
        (f) => f.full_file_path === localFile.fullFilePath
      );

      // case 2: local file new, cloud file none --> upload local file to cloud
      if (!cloudFile) {
        const storageLocationVariant = {
          [`${localFile.storageLocation}`]: null,
        } as StorageLocationEnum;
        const cloud_file_uuid = (await actor.upsert_file_to_hash_tables(
          localFile.fullFilePath,
          storageLocationVariant
        )) as FileUUID;
        const [cloud_file] = await actor.get_file_by_id(cloud_file_uuid);

        if (!cloud_file) continue;
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
          prior_version: localFile.priorVersion ? [localFile.priorVersion] : [],
          next_version: localFile.nextVersion ? [localFile.nextVersion] : [],
          extension: localFile.extension,
          full_file_path: localFile.fullFilePath,
          tags: localFile.tags,
          owner: icpAccount.principal,
          created_date: timestampToBigInt(localFile.createdDate),
          storage_location: { [localFile.storageLocation]: null },
          file_size: localFile.fileSize,
          raw_url: localFile.rawURL,
          last_changed_unix_ms: cloud_file.last_changed_unix_ms,
          deleted: localFile.deleted === undefined ? false : localFile.deleted,
        };
        try {
          const savedCloudFileUUIDRes =
            await actor.upsert_cloud_file_with_local_sync(
              cloud_file_uuid,
              // @ts-ignore
              cloudFileMetadata
            );

          if ("Ok" in savedCloudFileUUIDRes) {
            const finalFileUUID = await surgicallySyncFileUUID(
              fileUUID,
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
        const cloudFileMetadata = {
          id: cloudFile.id,
          original_file_name: localFile.originalFileName,
          folder_uuid: localFile.folderUUID,
          file_version: localFile.fileVersion,
          prior_version: localFile.priorVersion ? [localFile.priorVersion] : [],
          next_version: localFile.nextVersion ? [localFile.nextVersion] : [],
          extension: localFile.extension,
          full_file_path: localFile.fullFilePath,
          tags: localFile.tags,
          owner: icpAccount.principal,
          created_date: timestampToBigInt(localFile.createdDate),
          storage_location: { [localFile.storageLocation]: null },
          file_size: localFile.fileSize,
          raw_url: localFile.rawURL,
          last_changed_unix_ms: BigInt(localFile.lastChangedUnixMs),
          deleted: localFile.deleted === undefined ? false : localFile.deleted,
        };

        try {
          const savedCloudFileUUIDRes =
            await actor.upsert_cloud_file_with_local_sync(
              cloudFile.id,
              // @ts-ignore
              cloudFileMetadata
            );
          if ("Ok" in savedCloudFileUUIDRes) {
            // Here we get back just the new FileUUID from the cloud
            const newCloudFileUUID = savedCloudFileUUIDRes.Ok as FileUUID;
            // First sync the local file UUID to match the cloud
            const finalFileUUID = await surgicallySyncFileUUID(
              localFile.id,
              newCloudFileUUID
            );
            if (finalFileUUID) {
              // Then ensure our local version chain is updated to match
              await upsertLocalFileWithCloudSync(finalFileUUID, {
                ...localFile,
                id: finalFileUUID,
                priorVersion: cloudFile.id as FileUUID, // Set prior version to the old cloud file ID
                nextVersion: null, // This is the newest version so no next version
                lastChangedUnixMs: Number(cloudFile.last_changed_unix_ms), // Use cloud timestamp
              });
            }
          }
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
          storageLocation: `${Object.keys(cloudFile.storage_location)[0]}`,
          fileSize: Number(cloudFile.file_size),
          rawURL: cloudFile.raw_url,
          lastChangedUnixMs: Number(cloudFile.last_changed_unix_ms),
          deleted: cloudFile.deleted,
        };
        const newLocalFileSaved = await upsertLocalFileWithCloudSync(
          cloudFile.id as FileUUID,
          // @ts-ignore
          localFileMetadata
        );

        continue;
      } else if (
        Number(localFile.lastChangedUnixMs) ===
        Number(cloudFile.last_changed_unix_ms)
      ) {
        console.log("Both files are the same, no action needed", localFile.id);
        continue;
      }
    }

    // loop through cloud files next
    for (const cloudFile of cloudDriveContents.files) {
      const localFile = localDriveContents.files.find(
        (f) => f.fullFilePath === cloudFile.full_file_path
      );

      // case 2: local file none, cloud file new --> download cloud file to local
      if (!localFile) {
        const [cloud_file] = await actor.get_file_by_id(cloudFile.id);

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
          storageLocation: `${Object.keys(cloudFile.storage_location)[0]}`,
          fileSize: Number(cloudFile.file_size),
          rawURL: cloudFile.raw_url,
          lastChangedUnixMs: Number(cloudFile.last_changed_unix_ms),
          deleted: cloudFile.deleted,
        };

        const newLocalFileSaved = await upsertLocalFileWithCloudSync(
          cloudFile.id as FileUUID,
          // @ts-ignore
          localFileMetadata
        );
        continue;
      }
    }

    // add subfolders to queue
    if (current.depth === syncConfig.syncDepth) return;
    for (const subfolder of localDriveContents.folders) {
      queue.push({
        folderPath: subfolder.fullFolderPath,
        depth: current.depth + 1,
      });
    }
    for (const subfolder of cloudDriveContents.folders) {
      queue.push({
        folderPath: subfolder.full_folder_path,
        depth: current.depth + 1,
      });
    }

    return;
  };

  // called anytime manually to sync offline changes with cloud
  // will upload any new files/folder to cloud
  // will download any new files/folder from cloud
  // needs to handle per file conflict resolution (which should be newer version, offline or cloud?)
  const syncOfflineWithCloud = async ({
    fullFolderPath,
    syncDepth = 5,
  }: {
    fullFolderPath?: string;
    // syncDepth determines how many levels of subfolders to sync. -1 means all levels, 0 means only the current folder, 1 means current folder and its immediate children, etc.
    syncDepth?: number;
  }) => {
    setIsSyncing(true);
    const { uploadFolderPath: currentUploadFolderPath, storageLocation } =
      getUploadFolderPath();
    let targetFolderPath = `${storageLocation}::${currentUploadFolderPath}`;
    if (fullFolderPath) {
      targetFolderPath = fullFolderPath;
    }

    let queue: { folderPath: string; depth: number }[] = [];
    queue.push({ folderPath: targetFolderPath, depth: 1 });

    for (const current of queue) {
      await syncFolderPath(current, queue, { syncDepth });
    }

    setIsSyncing(false);
    message.success("Sync with cloud success");
    return;
  };

  const exportSnapshots = async () => {
    const actor = icpActor as ActorSubclass<DriveSERVICE>;
    if (!actor) return;
    const cloudSnapshot = await actor.snapshot_hashtables();
    const localSnapshot = await exportSnapshot();
    console.log(`snapshots`, cloudSnapshot, localSnapshot);
    return;
  };

  return {
    isSyncing,
    syncOfflineWithCloud,
    exportSnapshots,
  };
};

export default useCloudSync;
