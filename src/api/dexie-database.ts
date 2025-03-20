// db/dexie-manager.ts
import Dexie from "dexie";
import {
  DirectoryPermissionType,
  DiskTypeEnum,
  DriveID,
  UserID,
} from "@officexapp/types";
import {
  DiskFEO,
  DISKS_DEXIE_TABLE,
} from "../redux-offline/disks/disks.reducer";
import { CONTACTS_DEXIE_TABLE } from "../redux-offline/contacts/contacts.reducer";
import { APIKEYS_DEXIE_TABLE } from "../redux-offline/api-keys/api-keys.reducer";
import { LABELS_DEXIE_TABLE } from "../redux-offline/labels/labels.reducer";
import { DRIVES_DEXIE_TABLE } from "../redux-offline/drives/drives.reducer";
import { GROUPS_DEXIE_TABLE } from "../redux-offline/groups/groups.reducer";
import { GROUP_INVITES_DEXIE_TABLE } from "../redux-offline/group-invites/group-invites.reducer";
import { WEBHOOKS_DEXIE_TABLE } from "../redux-offline/webhooks/webhooks.reducer";
import {
  DIRECTORY_PERMISSIONS_DEXIE_TABLE,
  SYSTEM_PERMISSIONS_DEXIE_TABLE,
} from "../redux-offline/permissions/permissions.reducer";
import {
  DIRECTORY_LIST_QUERY_RESULTS_TABLE,
  FILES_DEXIE_TABLE,
  FolderFEO,
  FOLDERS_DEXIE_TABLE,
} from "../redux-offline/directory/directory.reducer";

/**
 * Singleton class to manage Dexie database connections
 * Only keeps one connection open at a time for the current org+profile pair
 */
class DexieManager {
  private static instance: DexieManager;
  private currentDb: Dexie | null = null;
  private currentStoreKey: string | null = null;

  // Private constructor for singleton pattern
  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): DexieManager {
    if (!DexieManager.instance) {
      DexieManager.instance = new DexieManager();
    }
    return DexieManager.instance;
  }

  /**
   * Generate a unique store key for the org+profile pair
   */
  private getStoreKey(userID: UserID, orgID: DriveID): string {
    return `${userID}@${orgID}`;
  }

  /**
   * Get database name for a store key
   */
  private getDbName(storeKey: string): string {
    return `OFFICEX-Offline-Database-${storeKey}`;
  }

  /**
   * Get the database for the specified org+profile pair
   * Only one database will be open at a time
   */
  public getDb(userID: UserID, orgID: DriveID): Dexie {
    const storeKey = this.getStoreKey(userID, orgID);

    // Return current db if it's already the one we want
    if (this.currentStoreKey === storeKey && this.currentDb) {
      return this.currentDb;
    }

    // Close current connection if it exists and is different
    this.closeCurrentDb();

    // Create new database connection
    const dbName = this.getDbName(storeKey);
    const db = new Dexie(dbName);

    // Define schema
    db.version(1).stores({
      // [TABLE_NAME]: "id, fieldAForEfficientQuery, fieldBForEfficientQuery",
      dummy_init: "id",
      // Core Tables
      [DISKS_DEXIE_TABLE]: "id, _syncConflict",
      [DRIVES_DEXIE_TABLE]: "id, _syncConflict",
      [CONTACTS_DEXIE_TABLE]: "id, _syncConflict",
      [GROUPS_DEXIE_TABLE]: "id, _syncConflict",
      [GROUP_INVITES_DEXIE_TABLE]: "id, _syncConflict",
      [LABELS_DEXIE_TABLE]: "id, _syncConflict",
      [WEBHOOKS_DEXIE_TABLE]: "id, _syncConflict",
      [APIKEYS_DEXIE_TABLE]: "id, _syncConflict",
      [DIRECTORY_PERMISSIONS_DEXIE_TABLE]: "id, _syncConflict",
      [SYSTEM_PERMISSIONS_DEXIE_TABLE]: "id, _syncConflict",
      [FILES_DEXIE_TABLE]: "id, folder_uuid, _syncConflict",
      [FOLDERS_DEXIE_TABLE]: "id, parent_folder_uuid, _syncConflict",
      [DIRECTORY_LIST_QUERY_RESULTS_TABLE]:
        "listDirectoryKey, last_updated_date_ms",
    });

    // Set as current and return
    this.currentDb = db;
    this.currentStoreKey = storeKey;
    return db;
  }

  /**
   * Close the current database connection if one exists
   */
  public closeCurrentDb(): void {
    if (this.currentDb) {
      this.currentDb.close();
      this.currentDb = null;
      this.currentStoreKey = null;
    }
  }

  /**
   * Delete a database for a specific org+profile pair
   */
  public async deleteDb(userID: UserID, orgID: DriveID): Promise<void> {
    const storeKey = this.getStoreKey(userID, orgID);
    const dbName = this.getDbName(storeKey);

    // If this is the current database, close it first
    if (this.currentStoreKey === storeKey) {
      this.closeCurrentDb();
    }

    try {
      // Delete the database
      await Dexie.delete(dbName);
    } catch (error) {
      console.error(`Error deleting IndexedDB database ${dbName}:`, error);
      throw error;
    }
  }
}

// Export convenient functions that use the singleton

/**
 * Get database for current org+profile pair
 */
export const getDexieDb = (userID: UserID, orgID: DriveID): Dexie => {
  const db = DexieManager.getInstance().getDb(userID, orgID);
  return db;
};

/**
 * Delete database for specified org+profile pair
 */
export const deleteDexieDb = async (
  userID: UserID,
  orgID: DriveID
): Promise<void> => {
  return DexieManager.getInstance().deleteDb(userID, orgID);
};

/**
 * Close the current database connection
 */
export const closeDexieDb = (): void => {
  DexieManager.getInstance().closeCurrentDb();
};

// mark a record as having a sync conflict
export const markSyncConflict = async (
  table: Dexie.Table<any, any>,
  optimisticID: string,
  message: string
): Promise<void> => {
  try {
    // Retrieve the record with the given optimistic ID
    const record = await table.get(optimisticID);

    if (record) {
      // Update the record with sync conflict information
      record._syncWarning = message;
      record._syncConflict = true;

      // Save the updated record back to the table
      await table.put(record);
      //   console.log(
      //     `Record ${optimisticID} marked as sync conflict with message: ${message}`
      //   );
    } else {
      console.warn(
        `Record with optimisticID ${optimisticID} not found for marking sync conflict`
      );
    }
  } catch (error) {
    console.error(
      `Error marking sync conflict for record ${optimisticID}:`,
      error
    );
    throw error;
  }
};

export const initDexieDb = async (
  userID: UserID,
  orgID: DriveID
): Promise<void> => {
  try {
    // Get the database instance
    const db = getDexieDb(userID, orgID);

    // Check if the dummy_init table exists
    if (db.tables.some((table) => table.name === "dummy_init")) {
      // Insert a dummy record if the table is empty
      const count = await db.table("dummy_init").count();

      if (count === 0) {
        // Insert an initialization record
        await db.table("dummy_init").add({
          id: "init_record",
          timestamp: new Date().toISOString(),
          userID: userID,
          orgID: orgID,
          status: "initialized",
        });

        console.log(`Initialized dummy_init table for ${userID}@${orgID}`);
      } else {
        console.log(`dummy_init table already has data for ${userID}@${orgID}`);
      }
    } else {
      console.warn("dummy_init table not found in database schema");
    }

    // Initialize default disks
    if (db.tables.some((table) => table.name === DISKS_DEXIE_TABLE)) {
      // 1. Check and initialize Browser Cache disk
      const existingBrowserCacheDisk = await db
        .table(DISKS_DEXIE_TABLE)
        .get(defaultBrowserCacheDiskID);

      if (!existingBrowserCacheDisk) {
        // Create the default Browser Cache disk
        const browserCacheDisk: DiskFEO = {
          id: defaultBrowserCacheDiskID,
          name: "Browser Cache",
          public_note:
            "Local browser cache for offline access. Files get deleted if you clear browser history for this site.",
          disk_type: DiskTypeEnum.BrowserCache,
          labels: [],
          created_at: Date.now(),
          permission_previews: [],
          root_folder: defaultBrowserCacheRootFolderID,
          trash_folder: defaultBrowserCacheTrashFolderID,
          _isOptimistic: false,
          _syncConflict: false,
          _syncWarning: "",
          _syncSuccess: true,
        };

        await db.table(DISKS_DEXIE_TABLE).add(browserCacheDisk);
        console.log(
          `Initialized default Browser Cache disk for ${userID}@${orgID}`
        );
      } else {
        console.log(
          `Default Browser Cache disk already exists for ${userID}@${orgID}`
        );
      }

      // 2. Check and initialize Free Cloud Sharing disk
      const existingCloudSharingDisk = await db
        .table(DISKS_DEXIE_TABLE)
        .get(defaultTempCloudSharingDiskID);

      if (!existingCloudSharingDisk) {
        // Create the Free Cloud Sharing disk
        const cloudSharingDisk: DiskFEO = {
          id: defaultTempCloudSharingDiskID,
          name: "Free Cloud Sharing",
          disk_type: DiskTypeEnum.StorjWeb3,
          public_note:
            "Free public filesharing. Files expire within 24 hours, UTC midnight daily.",
          labels: [],
          created_at: Date.now(),
          permission_previews: [],
          root_folder: defaultTempCloudSharingRootFolderID,
          trash_folder: defaultTempCloudSharingTrashFolderID,
          _isOptimistic: false,
          _syncConflict: false,
          _syncWarning: "",
          _syncSuccess: true,
        };

        await db.table(DISKS_DEXIE_TABLE).add(cloudSharingDisk);
        console.log(
          `Initialized default Free Cloud Sharing disk for ${userID}@${orgID}`
        );
      } else {
        console.log(
          `Default Free Cloud Sharing disk already exists for ${userID}@${orgID}`
        );
      }
    } else {
      console.warn(`${DISKS_DEXIE_TABLE} table not found in database schema`);
    }

    // Initialize default root folders
    if (db.tables.some((table) => table.name === FOLDERS_DEXIE_TABLE)) {
      // 1. Check and initialize Browser Cache root folder
      const existingBrowserCacheRootFolder = await db
        .table(FOLDERS_DEXIE_TABLE)
        .get(defaultBrowserCacheRootFolderID);

      if (!existingBrowserCacheRootFolder) {
        // Create the root folder for Browser Cache disk
        const browserCacheRootFolder: FolderFEO = {
          id: defaultBrowserCacheRootFolderID,
          name: "Root",
          subfolder_uuids: [],
          file_uuids: [],
          full_directory_path: `${defaultBrowserCacheDiskID}::/`,
          labels: [],
          created_by: userID,
          created_at: Date.now(),
          last_updated_date_ms: Date.now(),
          last_updated_by: userID,
          disk_id: defaultBrowserCacheDiskID,
          disk_type: DiskTypeEnum.BrowserCache,
          deleted: false,
          expires_at: 0,
          drive_id: orgID,
          has_sovereign_permissions: true,
          clipped_directory_path: `${defaultBrowserCacheDiskID}::/`,
          permission_previews: [
            DirectoryPermissionType.UPLOAD,
            DirectoryPermissionType.DELETE,
            DirectoryPermissionType.EDIT,
            DirectoryPermissionType.INVITE,
            DirectoryPermissionType.MANAGE,
            DirectoryPermissionType.VIEW,
          ],
          _isOptimistic: false,
          _syncConflict: false,
          _syncWarning: "",
          _syncSuccess: true,
        };

        await db.table(FOLDERS_DEXIE_TABLE).add(browserCacheRootFolder);

        const browserCacheTrashFolder: FolderFEO = {
          id: defaultBrowserCacheTrashFolderID,
          name: "Trash",
          subfolder_uuids: [],
          file_uuids: [],
          full_directory_path: `${defaultBrowserCacheDiskID}::/.trash/`,
          labels: [],
          created_by: userID,
          created_at: Date.now(),
          last_updated_date_ms: Date.now(),
          last_updated_by: userID,
          disk_id: defaultBrowserCacheDiskID,
          disk_type: DiskTypeEnum.BrowserCache,
          deleted: false,
          expires_at: 0,
          drive_id: orgID,
          has_sovereign_permissions: true,
          clipped_directory_path: `${defaultBrowserCacheDiskID}::/.trash/`,
          permission_previews: [
            DirectoryPermissionType.UPLOAD,
            DirectoryPermissionType.DELETE,
            DirectoryPermissionType.EDIT,
            DirectoryPermissionType.INVITE,
            DirectoryPermissionType.MANAGE,
            DirectoryPermissionType.VIEW,
          ],
          _isOptimistic: false,
          _syncConflict: false,
          _syncWarning: "",
          _syncSuccess: true,
        };

        await db.table(FOLDERS_DEXIE_TABLE).add(browserCacheTrashFolder);
        console.log(
          `Initialized root folder for Browser Cache disk for ${userID}@${orgID}`
        );
      } else {
        console.log(
          `Root folder for Browser Cache disk already exists for ${userID}@${orgID}`
        );
      }

      // 2. Check and initialize Free Cloud Sharing root folder
      const existingCloudSharingRootFolder = await db
        .table(FOLDERS_DEXIE_TABLE)
        .get(defaultTempCloudSharingRootFolderID);

      if (!existingCloudSharingRootFolder) {
        // Create the root folder for Free Cloud Sharing disk
        const cloudSharingRootFolder: FolderFEO = {
          id: defaultTempCloudSharingRootFolderID,
          name: "Root",
          subfolder_uuids: [],
          file_uuids: [],
          full_directory_path: `${defaultTempCloudSharingDiskID}::/`,
          labels: [],
          created_by: userID,
          created_at: Date.now(),
          last_updated_date_ms: Date.now(),
          last_updated_by: userID,
          disk_id: defaultTempCloudSharingDiskID,
          disk_type: DiskTypeEnum.StorjWeb3,
          deleted: false,
          expires_at: 0,
          drive_id: orgID,
          has_sovereign_permissions: true,
          clipped_directory_path: `${defaultTempCloudSharingDiskID}::/`,
          permission_previews: [
            DirectoryPermissionType.UPLOAD,
            DirectoryPermissionType.DELETE,
            DirectoryPermissionType.EDIT,
            DirectoryPermissionType.INVITE,
            DirectoryPermissionType.MANAGE,
            DirectoryPermissionType.VIEW,
          ],
          _isOptimistic: false,
          _syncConflict: false,
          _syncWarning: "",
          _syncSuccess: true,
        };

        await db.table(FOLDERS_DEXIE_TABLE).add(cloudSharingRootFolder);

        const cloudSharingTrashFolder: FolderFEO = {
          id: defaultTempCloudSharingTrashFolderID,
          name: "Trash",
          subfolder_uuids: [],
          file_uuids: [],
          full_directory_path: `${defaultTempCloudSharingDiskID}::/.trash/`,
          labels: [],
          created_by: userID,
          created_at: Date.now(),
          last_updated_date_ms: Date.now(),
          last_updated_by: userID,
          disk_id: defaultTempCloudSharingDiskID,
          disk_type: DiskTypeEnum.StorjWeb3,
          deleted: false,
          expires_at: 0,
          drive_id: orgID,
          has_sovereign_permissions: true,
          clipped_directory_path: `${defaultTempCloudSharingDiskID}::/.trash/`,
          permission_previews: [
            DirectoryPermissionType.UPLOAD,
            DirectoryPermissionType.DELETE,
            DirectoryPermissionType.EDIT,
            DirectoryPermissionType.INVITE,
            DirectoryPermissionType.MANAGE,
            DirectoryPermissionType.VIEW,
          ],
          _isOptimistic: false,
          _syncConflict: false,
          _syncWarning: "",
          _syncSuccess: true,
        };

        await db.table(FOLDERS_DEXIE_TABLE).add(cloudSharingTrashFolder);
        console.log(
          `Initialized root folder for Free Cloud Sharing disk for ${userID}@${orgID}`
        );
      } else {
        console.log(
          `Root folder for Free Cloud Sharing disk already exists for ${userID}@${orgID}`
        );
      }
    } else {
      console.warn(`${FOLDERS_DEXIE_TABLE} table not found in database schema`);
    }
  } catch (error) {
    console.error("Error initializing Dexie database:", error);
    throw error;
  }
};

const disk_browser_slug = "offline-local-browser-cache";
const disk_free_cloud_slug = "free-temp-cloud-sharing";

export const defaultBrowserCacheDiskID = `DiskID_${disk_browser_slug}`;
export const defaultTempCloudSharingDiskID = `DiskID_${disk_free_cloud_slug}`;

// Default root folder IDs
export const defaultBrowserCacheRootFolderID = `FolderID_root-folder-${disk_browser_slug}`;
export const defaultTempCloudSharingRootFolderID = `FolderID_root-folder-${disk_free_cloud_slug}`;

export const defaultBrowserCacheTrashFolderID = `FolderID_trash-folder-${disk_browser_slug}`;
export const defaultTempCloudSharingTrashFolderID = `FolderID_trash-folder-${disk_free_cloud_slug}`;

export type DirectoryListQueryString = string;
