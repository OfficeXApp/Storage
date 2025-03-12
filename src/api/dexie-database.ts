// db/dexie-manager.ts
import Dexie from "dexie";
import { DriveID, UserID } from "@officexapp/types";
import { DISKS_DEXIE_TABLE } from "../redux-offline/disks/disks.reducer";
import { CONTACTS_DEXIE_TABLE } from "../redux-offline/contacts/contacts.reducer";
import { APIKEYS_DEXIE_TABLE } from "../redux-offline/api-keys/api-keys.reducer";
import { TAGS_DEXIE_TABLE } from "../redux-offline/tags/tags.reducer";
import { DRIVES_DEXIE_TABLE } from "../redux-offline/drives/drives.reducer";
import { TEAMS_DEXIE_TABLE } from "../redux-offline/teams/teams.reducer";
import { TEAM_INVITES_DEXIE_TABLE } from "../redux-offline/team-invites/team-invites.reducer";
import { WEBHOOKS_DEXIE_TABLE } from "../redux-offline/webhooks/webhooks.reducer";

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
      [TEAMS_DEXIE_TABLE]: "id, _syncConflict",
      [TEAM_INVITES_DEXIE_TABLE]: "id, _syncConflict",
      [TAGS_DEXIE_TABLE]: "id, _syncConflict",
      [WEBHOOKS_DEXIE_TABLE]: "id, _syncConflict",
      [APIKEYS_DEXIE_TABLE]: "id, _syncConflict",
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
  } catch (error) {
    console.error("Error initializing Dexie database:", error);
    throw error;
  }
};
