// hook.tsx

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import {
  UploadProgress,
  UploadFolderPath,
  StorageLocationEnum,
  FileUUID,
  UploadItem,
  DriveFullFilePath,
  FolderMetadata,
  FileMetadata,
  FolderUUID,
  DirectoryExtraData,
} from "./types";
import DriveDB from "./core";
import IndexedDBStorage from "./storage/indexdb";
import { UserID } from "../identity/types";
import {
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
  S3ClientAuth,
} from "./storage/storj-web3";
import { getMimeTypeFromExtension } from "./helpers";
import { useIdentity } from "../identity/identity.provider";

interface DriveContextType {
  isInitialized: boolean;
  uploadFilesFolders: (
    files: File[],
    uploadFolderPath: UploadFolderPath,
    storageLocation: StorageLocationEnum,
    userID: UserID,
    concurrency?: number,
    onUploadComplete?: (fileUUID: FileUUID) => void
  ) => void;
  getFileByFullPath: (
    fullFilePath: DriveFullFilePath
  ) => Promise<FileMetadata | undefined>;
  getFolderByFullPath: (
    fullFolderPath: DriveFullFilePath
  ) => FolderMetadata | undefined;
  cancelUpload: (id: string) => void;
  cancelAllUploads: () => void;
  getUploadQueue: () => UploadItem[];
  uploadProgress: UploadProgress;
  clearQueue: () => void;
  fetchFilesAtFolderPath: (
    fullFolderPath: DriveFullFilePath,
    limit: number,
    after: number
  ) => Promise<{
    folders: FolderMetadata[];
    files: FileMetadata[];
    total: number;
    hasMore: boolean;
  }>;
  exportSnapshot: () => any;
  renameFilePath: (fileID: FileUUID, newName: string) => Promise<FileMetadata>;
  renameFolderPath: (
    folderID: FolderUUID,
    newName: string
  ) => Promise<FolderMetadata>;
  searchFilesQuery: (
    searchString: string,
    limit: number,
    after: number
  ) => Promise<{
    files: FileMetadata[];
    folders: FolderMetadata[];
    total: number;
    hasMore: boolean;
  }>;
  deleteFolder: (folderUUID: FolderUUID) => Promise<void>;
  deleteFile: (fileUUID: FileUUID) => Promise<void>;
  reindexFuzzySearch: () => void;
  createFolder: (
    fullFolderPath: DriveFullFilePath,
    storageLocation: StorageLocationEnum,
    userId: UserID
  ) => Promise<FolderMetadata>;
  initStorj: (auth: S3ClientAuth) => Promise<void>;
  indexdbGetFileUrl: (fileUUID: FileUUID) => Promise<string>;
  indexdbGetVideoStream: (
    fileUUID: FileUUID
  ) => Promise<ReadableStream<Uint8Array>>;
  indexdbDownloadFile: (fileUUID: FileUUID) => Promise<void>;
  surgicallySyncFileUUID: (
    oldFileId: FileUUID,
    newFileId: FileUUID
  ) => Promise<FileUUID | undefined>;
  surgicallySyncFolderUUID: (
    oldFolderId: FolderUUID,
    newFolderId: FolderUUID
  ) => Promise<FolderUUID | undefined>;
  upsertLocalFileWithCloudSync: (
    fileID: FileUUID,
    fileMetadata: Partial<FileMetadata>
  ) => Promise<FileMetadata>;
  upsertLocalFolderWithCloudSync: (
    folderID: FolderUUID,
    folderMetadata: Partial<FolderMetadata>
  ) => Promise<FolderMetadata>;
}

const DriveContext = createContext<DriveContextType | null>(null);

interface DriveProviderProps {
  children: ReactNode;
  onUploadComplete?: (fileUUID: FileUUID) => void;
}

export const DriveProvider: React.FC<DriveProviderProps> = ({
  children,
  onUploadComplete,
}) => {
  const driveDB = useRef<DriveDB | null>(null);
  const { evmSlug, evmAccount, icpAccount, userID } = useIdentity();
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    totalFiles: 0,
    completedFiles: 0,
    inProgress: [],
    percentage: 0,
  });

  useEffect(() => {
    const run = async () => {
      const indexDBStorage = IndexedDBStorage.getInstance();
      const db = new DriveDB(indexDBStorage, userID);
      await db.initialize();
      setIsInitialized(true);
      driveDB.current = db;
      if (
        localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) &&
        localStorage.getItem(LOCAL_STORAGE_STORJ_SECRET_KEY) &&
        localStorage.getItem(LOCAL_STORAGE_STORJ_ENDPOINT)
      ) {
        const auth: S3ClientAuth = {
          accessKeyId: localStorage.getItem(
            LOCAL_STORAGE_STORJ_ACCESS_KEY
          ) as string,
          secretAccessKey: localStorage.getItem(
            LOCAL_STORAGE_STORJ_SECRET_KEY
          ) as string,
          endpoint: localStorage.getItem(
            LOCAL_STORAGE_STORJ_ENDPOINT
          ) as string,
        };
        await db.initStorj(auth);
      }
      await db.reindexFuzzySearch();
    };
    run();
  }, []);

  const uploadFilesFolders = useCallback(
    (
      files: File[],
      uploadFolderPath: UploadFolderPath,
      storageLocation: StorageLocationEnum,
      userID: UserID,
      concurrency: number = 5,
      localOnUploadComplete?: (fileUUID: FileUUID) => void,
      expiresAt?: number
    ) => {
      if (driveDB.current) {
        const directoryExtraData = {
          canisterID: driveDB.current.canisterID,
          expiresAt,
        };
        const {
          progress$,
          // cancelUpload,
          // cancelAll,
          uploadComplete$,
          // getUploadQueue,
        } = driveDB.current.uploadFilesFolders(
          files,
          uploadFolderPath,
          storageLocation,
          userID,
          concurrency,
          directoryExtraData
        );

        progress$.subscribe(setUploadProgress);
        uploadComplete$.subscribe((fileUUID: FileUUID) => {
          if (localOnUploadComplete) {
            localOnUploadComplete(fileUUID);
          } else if (onUploadComplete) {
            onUploadComplete(fileUUID);
          }
        });
      }
    },
    [onUploadComplete]
  );

  const cancelUpload = useCallback((id: string) => {
    if (driveDB.current) {
      driveDB.current.cancelUpload(id);
    }
  }, []);

  const cancelAllUploads = useCallback(() => {
    if (driveDB.current) {
      driveDB.current.cancelAllUploads();
    }
  }, []);

  const getUploadQueue = useCallback((): UploadItem[] => {
    if (driveDB.current) {
      return driveDB.current.getUploadQueue();
    }
    return [];
  }, []);

  const clearQueue = useCallback(() => {
    if (driveDB.current) {
      driveDB.current.clearQueue();
      setUploadProgress({
        totalFiles: 0,
        completedFiles: 0,
        inProgress: [],
        percentage: 0,
      });
    }
  }, []);

  const fetchFilesAtFolderPath = useCallback(
    async (fullFolderPath: DriveFullFilePath, limit: number, after: number) => {
      if (driveDB.current) {
        return driveDB.current.fetchFilesAtFolderPath({
          fullFolderPath,
          limit,
          after,
        });
      }
      return {
        folders: [],
        files: [],
        total: 0,
        hasMore: false,
      };
    },
    []
  );

  const getFileByFullPath = useCallback(
    async (
      fullFilePath: DriveFullFilePath
    ): Promise<FileMetadata | undefined> => {
      if (driveDB.current) {
        return driveDB.current.getFileByFullPath(fullFilePath);
      }
      throw new Error("DriveDB is not initialized");
    },
    []
  );

  const exportSnapshot = useCallback(() => {
    if (driveDB.current) {
      return driveDB.current.exportSnapshot("user123" as UserID);
    }
    return null;
  }, []);

  const renameFilePath = useCallback(
    async (fileID: FileUUID, newName: string): Promise<FileMetadata> => {
      if (driveDB.current) {
        return driveDB.current.renameFilePath(fileID, newName);
      }
      throw new Error("DriveDB is not initialized");
    },
    []
  );

  const renameFolderPath = useCallback(
    async (folderID: FolderUUID, newName: string): Promise<FolderMetadata> => {
      if (driveDB.current) {
        return driveDB.current.renameFolderPath(folderID, newName);
      }
      throw new Error("DriveDB is not initialized");
    },
    []
  );

  const searchFilesQuery = useCallback(
    async (searchString: string, limit: number, after: number) => {
      if (driveDB.current) {
        return driveDB.current.searchFilesQuery({ searchString, limit, after });
      }
      return {
        files: [],
        folders: [],
        total: 0,
        hasMore: false,
      };
    },
    []
  );

  const deleteFolder = useCallback(
    async (folderUUID: FolderUUID): Promise<void> => {
      if (driveDB.current) {
        driveDB.current.deleteFilesFolders([
          driveDB.current.getFolderByID(folderUUID)
            ?.fullFolderPath as DriveFullFilePath,
        ]);
      }
    },
    []
  );

  const deleteFile = useCallback(async (fileUUID: FileUUID): Promise<void> => {
    if (driveDB.current) {
      driveDB.current.deleteFilesFolders([
        (await driveDB.current.getFileByID(fileUUID))
          ?.fullFilePath as DriveFullFilePath,
      ]);
    }
  }, []);

  const reindexFuzzySearch = useCallback(() => {
    if (driveDB.current) {
      driveDB.current.reindexFuzzySearch();
    }
  }, []);

  const createFolder = useCallback(
    async (
      fullFolderPath: DriveFullFilePath,
      storageLocation: StorageLocationEnum,
      userId: UserID,
      expiresAt?: number
    ): Promise<FolderMetadata> => {
      if (!driveDB.current) {
        throw new Error("DriveDB is not initialized");
      }
      const directoryExtraData = {
        canisterID: driveDB.current.canisterID,
        expiresAt,
      };
      return driveDB.current.createFolder(
        fullFolderPath,
        storageLocation,
        userId,
        directoryExtraData
      );
    },
    []
  );

  const initStorj = useCallback(async (auth: S3ClientAuth): Promise<void> => {
    if (driveDB.current) {
      await driveDB.current.initStorj(auth);
    } else {
      throw new Error("DriveDB is not initialized");
    }
  }, []);

  const indexdbGetFileUrl = useCallback(
    async (fileUUID: FileUUID): Promise<string> => {
      if (!driveDB.current) {
        throw new Error("DriveDB is not initialized");
      }

      const file = await driveDB.current.getFileByID(fileUUID);
      if (!file) {
        throw new Error("File not found");
      }

      const stream = await driveDB.current.indexdbGetFileStream(fileUUID);
      const mimeType = getMimeTypeFromExtension(file.extension);

      // Convert ReadableStream to ArrayBuffer
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const arrayBuffer = await new Blob(chunks).arrayBuffer();

      // Create Blob from ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: mimeType });
      return URL.createObjectURL(blob);
    },
    []
  );

  const indexdbGetVideoStream = useCallback(
    async (fileUUID: FileUUID): Promise<ReadableStream<Uint8Array>> => {
      if (!driveDB.current) {
        throw new Error("DriveDB is not initialized");
      }

      const stream = await driveDB.current.indexdbGetFileStream(fileUUID);
      return stream;
    },
    []
  );

  const indexdbDownloadFile = useCallback(
    async (fileUUID: FileUUID): Promise<void> => {
      if (!driveDB.current) {
        throw new Error("DriveDB is not initialized");
      }

      const file = await driveDB.current.getFileByID(fileUUID);
      if (!file) {
        throw new Error("File not found");
      }

      const stream = await driveDB.current.indexdbGetFileStream(fileUUID);
      const mimeType = getMimeTypeFromExtension(file.extension);

      const response = new Response(stream, {
        headers: { "Content-Type": mimeType },
      });
      const reader = response.body!.getReader();
      const contentLength =
        Number(response.headers.get("Content-Length")) || file.fileSize;

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // Report progress
        console.log(`Received ${receivedLength} of ${contentLength} bytes`);
      }

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalFileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    []
  );

  const surgicallySyncFileUUID = async (
    oldFileId: FileUUID,
    newFileId: FileUUID
  ) => {
    if (driveDB.current) {
      return await driveDB.current.surgicallySyncFileUUID(oldFileId, newFileId);
    } else {
      throw new Error("DriveDB is not initialized");
    }
  };
  const surgicallySyncFolderUUID = async (
    oldFolderId: FolderUUID,
    newFolderId: FolderUUID
  ) => {
    if (driveDB.current) {
      return await driveDB.current.surgicallySyncFolderUUID(
        oldFolderId,
        newFolderId
      );
    } else {
      throw new Error("DriveDB is not initialized");
    }
  };

  const upsertLocalFileWithCloudSync = async (
    fileID: FileUUID,
    fileMetadata: Partial<FileMetadata>
  ) => {
    if (driveDB.current) {
      return await driveDB.current.upsertLocalFileWithCloudSync(
        fileID,
        fileMetadata
      );
    } else {
      throw new Error("DriveDB is not initialized");
    }
  };
  const upsertLocalFolderWithCloudSync = async (
    folderID: FolderUUID,
    folderMetadata: Partial<FolderMetadata>
  ) => {
    if (driveDB.current) {
      return await driveDB.current.upsertLocalFolderWithCloudSync(
        folderID,
        folderMetadata
      );
    } else {
      throw new Error("DriveDB is not initialized");
    }
  };

  const getFolderByFullPath = (fullFolderPath: DriveFullFilePath) => {
    if (driveDB.current) {
      return driveDB.current.getFolderByFullPath(fullFolderPath);
    }
    return undefined;
  };

  const value: DriveContextType = {
    isInitialized,
    initStorj,
    uploadFilesFolders,
    getFileByFullPath,
    cancelUpload,
    cancelAllUploads,
    getUploadQueue,
    uploadProgress,
    clearQueue,
    fetchFilesAtFolderPath,
    exportSnapshot,
    renameFilePath,
    renameFolderPath,
    searchFilesQuery,
    deleteFolder,
    deleteFile,
    reindexFuzzySearch,
    createFolder,
    indexdbGetFileUrl,
    indexdbGetVideoStream,
    indexdbDownloadFile,
    surgicallySyncFileUUID,
    surgicallySyncFolderUUID,
    upsertLocalFileWithCloudSync,
    upsertLocalFolderWithCloudSync,
    getFolderByFullPath,
  };

  return (
    <DriveContext.Provider value={value}>{children}</DriveContext.Provider>
  );
};

export const useDrive = (): DriveContextType => {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error("useDrive must be used within a DriveProvider");
  }
  return context;
};
