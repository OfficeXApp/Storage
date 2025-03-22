// src/framework/uploader/context/MultiUploaderContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UploadManager } from "./UploadManager";
import { LocalS3Adapter } from "./adapters/locals3.adapter";
import { IndexedDBAdapter } from "./adapters/indexdb.adapter";
import { DiskID, DiskTypeEnum, FileID, FolderID } from "@officexapp/types";
import {
  AggregateUploadProgress,
  UploadConfig,
  UploadID,
  UploadProgressInfo,
  BatchUploadConfig,
  LocalS3AdapterConfig,
  IndexDBAdapterConfig,
  QueuedUploadItem,
  PauseReason,
} from "./types";
import { Observable } from "rxjs";
import {
  defaultBrowserCacheDiskID,
  defaultBrowserCacheRootFolderID,
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingRootFolderID,
} from "../../api/dexie-database";
import { IUploadAdapter } from "./adapters/IUploadAdapter";
import { DiskFEO } from "../../redux-offline/disks/disks.reducer";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useParams } from "react-router-dom";
import { set } from "lodash";
import { useIdentitySystem } from "../identity";
import { listDisksAction } from "../../redux-offline/disks/disks.actions";
import { CloudS3Adapter } from "./adapters/clouds3.adapter";
import { CanisterAdapter } from "./adapters/canister.adapter";

// Add missing CanisterAdapter configuration type
interface CanisterAdapterConfig {
  diskID: DiskID;
  canisterId: string;
  maxChunkSize?: number;
  host?: string;
  apiKey: string;
}

interface MultiUploaderContextType {
  uploadTargetDisk: DiskFEO | null;
  uploadTargetFolderID: FolderID | null;
  currentFileID: FileID | null;
  uploadManager: UploadManager | null;
  isInitialized: boolean;
  progress: AggregateUploadProgress;
  currentUploads: QueuedUploadItem[];
  uploadFile: (
    fileID: FileID,
    file: File,
    uploadPath: string,
    diskType: DiskTypeEnum,
    diskID: DiskID,
    options?: Partial<UploadConfig>
  ) => UploadID;
  uploadFiles: (
    files: { file: File; fileID: FileID }[],
    uploadPath: string,
    diskType: DiskTypeEnum,
    diskID: DiskID,
    options?: Partial<BatchUploadConfig>
  ) => UploadID[];
  registerDefaultAdapters: () => Promise<void>;
  pauseUpload: (id: UploadID) => Promise<boolean>;
  resumeUpload: (id: UploadID, fileID: FileID, file: File) => Promise<boolean>;
  cancelUpload: (id: UploadID) => Promise<boolean>;
  pauseAllUploads: () => void;
  resumeAllUploads: () => void;
  clearFinishedUploads: () => void;
  getUploadProgress: (id: UploadID) => Observable<UploadProgressInfo | null>;
  getFileUrl: (id: UploadID) => Promise<string | null>;
  // New method for dynamically registering adapters
  registerAdapter: (
    adapter: IUploadAdapter,
    diskType: DiskTypeEnum,
    diskID: DiskID,
    config: any,
    concurrency?: number,
    priority?: number
  ) => Promise<void>;
}

// Default context values
const defaultContextValue: MultiUploaderContextType = {
  uploadTargetDisk: null,
  uploadTargetFolderID: null,
  currentFileID: null,
  uploadManager: null,
  isInitialized: false,
  progress: {
    totalFiles: 0,
    activeFiles: 0,
    completedFiles: 0,
    pausedFiles: 0,
    failedFiles: 0,
    cancelledFiles: 0,
    queuedFiles: 0,
    overallProgress: 0,
    currentlyUploading: [],
  },
  currentUploads: [],
  uploadFile: () => {
    throw new Error("MultiUploaderProvider not initialized");
  },
  uploadFiles: () => {
    throw new Error("MultiUploaderProvider not initialized");
  },
  registerDefaultAdapters: () => Promise.resolve(),
  pauseUpload: () => Promise.resolve(false),
  resumeUpload: () => Promise.resolve(false),
  cancelUpload: () => Promise.resolve(false),
  pauseAllUploads: () => {},
  resumeAllUploads: () => {},
  clearFinishedUploads: () => {},
  getUploadProgress: () => new Observable(),
  getFileUrl: () => Promise.resolve(null),
  registerAdapter: () => Promise.resolve(),
};

// Create context
const MultiUploaderContext =
  createContext<MultiUploaderContextType>(defaultContextValue);

// Configuration props for the provider
interface MultiUploaderProviderProps {
  children: React.ReactNode;
  autoInit?: boolean;
}

// Create provider component
export const MultiUploaderProvider: React.FC<MultiUploaderProviderProps> = ({
  children,
  autoInit = true,
}) => {
  const { currentOrg, currentProfile, currentAPIKey } = useIdentitySystem();
  const [isInitialized, setIsInitialized] = useState(false);
  const uploadManagerRef = useRef<UploadManager>();
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const [progress, setProgress] = useState<AggregateUploadProgress>(
    defaultContextValue.progress
  );
  const [currentUploads, setCurrentUploads] = useState<QueuedUploadItem[]>([]);
  const dispatch = useDispatch();
  const { disks, defaultDisk } = useSelector((state: ReduxAppState) => ({
    defaultDisk: state.disks.defaultDisk,
    disks: state.disks.disks,
  }));
  const [uploadTargetDiskID, setUploadTargetDiskID] = useState<DiskID | null>(
    null
  );
  const [uploadTargetFolderID, setUploadTargetFolderID] =
    useState<FolderID | null>(null);
  const [currentFileID, setCurrentFileID] = useState<FileID | null>(null);
  const [registeredDefaultAdapters, setRegisteredDefaultAdapters] =
    useState(false);
  const uploadTargetDisk =
    disks.find((d) => d.id === uploadTargetDiskID) || defaultDisk;

  const DEFAULT_ADAPTER_CONFIGS = {
    // IndexedDB adapter config
    [defaultBrowserCacheDiskID]: {
      databaseName: `officex-browser-cache-storage-${currentOrg?.driveID}-${currentProfile?.userID}`,
      objectStoreName: "files",
    },
    // S3 adapter config for Storj
    [defaultTempCloudSharingDiskID]: {
      diskID: defaultTempCloudSharingDiskID,
      endpoint: "https://gateway.storjshare.io",
      region: "us-east-1",
      accessKeyId: "jwu43kry2lja5z27c5mwfwxxkvea",
      secretAccessKey: "j37zrkuw7e2rvxywqmidx6gcmqf64brxygvbqhgiaotcfv47telme",
      bucket: "officex",
      useMultipartUpload: true,
      partSize: 5 * 1024 * 1024, // 5MB parts
    },
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (pathParts.includes("drive")) {
      if (pathParts.length >= 2) {
        // We're at /drive/diskID or deeper
        const diskID = pathParts[1];
        setUploadTargetDiskID(diskID);

        // Check if we have a folder or file ID in the path
        if (pathParts.length >= 3) {
          const resourceId = pathParts[2];

          if (resourceId && resourceId.startsWith("FolderID_")) {
            setUploadTargetFolderID(resourceId);
            setCurrentFileID(null);
          } else if (resourceId && resourceId.startsWith("FileID_")) {
            // We're viewing a file, so set folder to parent (if available) and set file ID
            setCurrentFileID(resourceId);
            // You might need to fetch the parent folder ID here if necessary
          }
        } else {
          // At disk root, try to set to the disk's root folder
          const targetDisk = disks.find((d) => d.id === diskID);
          if (targetDisk && targetDisk.root_folder) {
            setUploadTargetFolderID(targetDisk.root_folder as FolderID);
          }
          setCurrentFileID(null);
        }
      } else {
        // At /drive root
        setUploadTargetDiskID(defaultBrowserCacheDiskID);
        setUploadTargetFolderID(defaultBrowserCacheRootFolderID);
        setCurrentFileID(null);
      }
    }
  }, [window.location.pathname, disks]);

  const registerDefaultAdapters = async () => {
    if (
      !uploadManagerRef.current ||
      !isInitialized ||
      !currentOrg ||
      !currentProfile ||
      registeredDefaultAdapters
    ) {
      console.log(`did not qualify! 
        
        uploadManagerRef.current: ${uploadManagerRef.current?.getRegisteredAdapters()}
        isInitialized: ${isInitialized}
        currentOrg: ${currentOrg}
        currentProfile: ${currentProfile}
        registeredDefaultAdapters: ${registeredDefaultAdapters}
        
        `);
      return;
    }

    console.log("Trying to Registering default adapters for disks");

    try {
      // Get currently registered adapters
      const registeredAdapters =
        uploadManagerRef.current.getRegisteredAdapters();

      const registeredDiskIds = new Set(
        registeredAdapters.map((adapter) => adapter.diskID)
      );

      // Process all disks from the Redux store
      for (const disk of disks) {
        const diskId = disk.id;
        const diskType = disk.disk_type as DiskTypeEnum;

        // Skip if this disk already has a registered adapter
        if (registeredDiskIds.has(diskId)) {
          // console.log(`Adapter already registered for disk: ${diskId}`);
          continue;
        }

        try {
          if (disk.id === defaultBrowserCacheDiskID) {
            const indexedDBAdapter = new IndexedDBAdapter();
            await uploadManagerRef.current.registerAdapter(
              indexedDBAdapter,
              DiskTypeEnum.BrowserCache,
              defaultBrowserCacheDiskID,
              DEFAULT_ADAPTER_CONFIGS[defaultBrowserCacheDiskID],
              2, // Concurrency
              2 // Priority
            );
            // console.log(
            //   `Registered default IndexedDB adapter for ${defaultBrowserCacheDiskID}`
            // );
            continue;
          } else if (disk.id === defaultTempCloudSharingDiskID) {
            const localS3Adapter = new LocalS3Adapter();
            await uploadManagerRef.current.registerAdapter(
              localS3Adapter,
              DiskTypeEnum.StorjWeb3,
              defaultTempCloudSharingDiskID,
              DEFAULT_ADAPTER_CONFIGS[defaultTempCloudSharingDiskID],
              3, // Concurrency
              1 // Priority
            );

            // console.log(
            //   `Registered default LocalS3 adapter for ${defaultTempCloudSharingDiskID}`
            // );
            continue;
          } else if (diskType === DiskTypeEnum.IcpCanister) {
            const canisterAdapter = new CanisterAdapter();
            const canisterConfig = {
              diskID: diskId,
              endpoint: currentOrg.endpoint,
              apiKey: currentAPIKey?.value,
              maxChunkSize: (1 * 1024 * 1024) / 2, // 0.5MB
            };
            await registerAdapter(
              canisterAdapter,
              DiskTypeEnum.IcpCanister,
              diskId,
              canisterConfig,
              3 // Concurrency
            );
            // console.log(`Registered ICP adapter for disk: ${diskId}`);
            continue;
          } else if (diskType === DiskTypeEnum.StorjWeb3) {
            const cloudS3Adapter = new CloudS3Adapter();
            const cloudS3Config = {
              endpoint: `${currentOrg.endpoint}/v1/default`,
              maxChunkSize: 5 * 1024 * 1024,
              rawUrlProxyPath: `/v1/${currentOrg.driveID}/directory/asset/`,
              apiKey: currentAPIKey?.value,
            };
            // Register the adapter
            await registerAdapter(
              cloudS3Adapter,
              DiskTypeEnum.StorjWeb3,
              diskId,
              cloudS3Config,
              3 // Concurrency
            );
            // console.log(`Registered StorjWeb3 adapter for disk: ${diskId}`);
            continue;
          } else if (diskType === DiskTypeEnum.AwsBucket) {
            const cloudS3Adapter = new CloudS3Adapter();
            const cloudS3Config = {
              endpoint: `${currentOrg.endpoint}/v1/default`,
              maxChunkSize: 5 * 1024 * 1024,
              rawUrlProxyPath: `/v1/${currentOrg.driveID}/directory/asset/`,
              apiKey: currentAPIKey?.value,
            };
            // Register the adapter
            await registerAdapter(
              cloudS3Adapter,
              DiskTypeEnum.StorjWeb3,
              diskId,
              cloudS3Config,
              3 // Concurrency
            );
            // console.log(`Registered AWS Bucket adapter for disk: ${diskId}`);
            continue;
          } else if (diskType === DiskTypeEnum.LocalSSD) {
            console.log(`Registered LocalSSD adapter for disk: ${diskId}`);
            continue;
          }
        } catch (error) {
          console.error(`Error registering adapter for disk ${diskId}:`, error);
        }
      }
      setRegisteredDefaultAdapters(true);
      console.log("Default adapters registration complete");
    } catch (error) {
      console.error("Error during default adapter registration:", error);
    }
  };

  useEffect(() => {
    if (currentProfile && currentOrg && isInitialized && disks.length > 0) {
      registerDefaultAdapters();
    }
  }, [currentProfile, currentOrg, isInitialized, disks]);

  // Initialize the upload manager
  const initializeUploadManager = async () => {
    console.log(`Initializing upload manager`);
    try {
      // Create new upload manager if it doesn't exist
      if (!uploadManagerRef.current) {
        console.log(`Creating new upload manager`);
        uploadManagerRef.current = new UploadManager();
      }

      const manager = uploadManagerRef.current;
      console.log(`Upload manager used`, manager);
      // Subscribe to progress updates
      const subscription = manager.getProgress().subscribe((progress) => {
        setProgress(progress);
        // Update current uploads list
        setCurrentUploads(manager.getUploads());
      });

      // Check for any previous uploads
      const resumableUploads = await manager.checkForPreviousUploads();
      if (resumableUploads.length > 0) {
        console.log(`Found ${resumableUploads.length} resumable uploads`);
      }

      // Clean up expired uploads
      await manager.cleanupExpiredUploads();

      // Set initialized flag
      setIsInitialized(true);

      // Cleanup subscription when component unmounts
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error initializing upload manager:", error);
    }
  };

  // Auto-initialize if enabled
  useEffect(() => {
    if (autoInit) {
      initializeUploadManager().then((cleanup) => {
        // Return cleanup function for useEffect
        return () => {
          if (cleanup) cleanup();
          // Dispose upload manager on unmount
          if (uploadManagerRef.current) {
            uploadManagerRef.current.dispose();
            uploadManagerRef.current = undefined;
          }
        };
      });
    }
  }, [autoInit]);

  // Method to register adapter dynamically
  const registerAdapter = async (
    adapter: IUploadAdapter,
    diskType: DiskTypeEnum,
    diskID: DiskID,
    config: any,
    concurrency: number = 3,
    priority: number = 0
  ): Promise<void> => {
    if (!uploadManagerRef.current) {
      throw new Error("Upload manager not initialized");
    }

    return uploadManagerRef.current.registerAdapter(
      adapter,
      diskType,
      diskID,
      config,
      concurrency,
      priority
    );
  };

  // Create context value
  const contextValue: MultiUploaderContextType = {
    uploadTargetDisk,
    uploadTargetFolderID,
    currentFileID,
    uploadManager: uploadManagerRef.current || null,
    isInitialized,
    progress,
    currentUploads,
    registerAdapter,
    registerDefaultAdapters,
    // Upload methods
    uploadFile: (fileID, file, uploadPath, diskType, diskID, options) => {
      if (!uploadManagerRef.current)
        throw new Error("Upload manager not initialized");
      return uploadManagerRef.current.uploadFile(
        fileID,
        file,
        uploadPath,
        diskType,
        diskID,
        options
      );
    },

    uploadFiles: (files, uploadPath, diskType, diskID, options) => {
      if (!uploadManagerRef.current)
        throw new Error("Upload manager not initialized");
      return uploadManagerRef.current.uploadFiles(
        files,
        uploadPath,
        diskType,
        diskID,
        options
      );
    },

    pauseUpload: async (id) => {
      if (!uploadManagerRef.current) return false;
      return uploadManagerRef.current.pauseUpload(id);
    },

    resumeUpload: async (id, fileID, file) => {
      if (!uploadManagerRef.current) return false;
      return uploadManagerRef.current.resumeUpload(id, fileID, file);
    },

    cancelUpload: async (id) => {
      if (!uploadManagerRef.current) return false;
      return uploadManagerRef.current.cancelUpload(id);
    },

    pauseAllUploads: () => {
      if (!uploadManagerRef.current) return;
      uploadManagerRef.current.pauseAllUploads(PauseReason.USER_REQUESTED);
    },

    resumeAllUploads: () => {
      if (!uploadManagerRef.current) return;
      uploadManagerRef.current.resumeAllUploads();
    },

    clearFinishedUploads: () => {
      if (!uploadManagerRef.current) return;
      uploadManagerRef.current.clearFinishedUploads();
    },

    getUploadProgress: (id) => {
      if (!uploadManagerRef.current) return new Observable();
      return uploadManagerRef.current.getUploadProgress(id);
    },

    getFileUrl: async (id) => {
      console.log(`uploadManagerRef.current`, uploadManagerRef.current);
      if (!uploadManagerRef.current) return null;
      return uploadManagerRef.current.getFileUrl(id);
    },
  };

  return (
    <MultiUploaderContext.Provider value={contextValue}>
      {children}
    </MultiUploaderContext.Provider>
  );
};

// Custom hook to use the uploader context
export const useMultiUploader = () => {
  const context = useContext(MultiUploaderContext);

  if (context === undefined) {
    throw new Error(
      "useMultiUploader must be used within a MultiUploaderProvider"
    );
  }

  return context;
};
