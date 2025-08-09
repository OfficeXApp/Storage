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
import { FileFEO } from "../../redux-offline/directory/directory.reducer";

// Add missing CanisterAdapter configuration type
interface CanisterAdapterConfig {
  diskID: DiskID;
  canisterId: string;
  maxChunkSize?: number;
  host?: string;
  apiKey: string;
}

interface MultiUploaderContextType {
  uploadTargetDiskID: DiskID | null;
  uploadTargetDiskType: DiskTypeEnum | null;
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
  uploadTargetDiskID: null,
  uploadTargetDiskType: null,
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
  const { currentOrg, currentProfile, currentAPIKey, generateSignature } =
    useIdentitySystem();
  const [isInitialized, setIsInitialized] = useState(false);
  const uploadManagerRef = useRef<UploadManager>();
  const { "*": encodedPath } = useParams<{ "*": string }>();
  const [progress, setProgress] = useState<AggregateUploadProgress>(
    defaultContextValue.progress
  );
  const [currentUploads, setCurrentUploads] = useState<QueuedUploadItem[]>([]);
  const dispatch = useDispatch();
  const { disks, defaultDisk, folderMap, fileMap } = useSelector(
    (state: ReduxAppState) => ({
      defaultDisk: state.disks.defaultDisk,
      disks: state.disks.disks,
      folderMap: state.directory.folderMap,
      fileMap: state.directory.fileMap,
    })
  );
  const [uploadTargetDiskID, setUploadTargetDiskID] = useState<DiskID>(
    defaultBrowserCacheDiskID
  );
  const [uploadTargetDiskType, setUploadTargetDiskType] =
    useState<DiskTypeEnum>(DiskTypeEnum.BrowserCache);
  const [uploadTargetFolderID, setUploadTargetFolderID] = useState<FolderID>(
    defaultBrowserCacheRootFolderID
  );
  const [currentFileID, setCurrentFileID] = useState<FileID | null>(
    defaultBrowserCacheRootFolderID
  );
  const [registeredDefaultAdapters, setRegisteredDefaultAdapters] =
    useState(false);
  const uploadTargetDisk =
    disks.find((d) => d.id === uploadTargetDiskID) || defaultDisk;

  const DEFAULT_ADAPTER_CONFIGS = {
    // IndexedDB adapter config
    [defaultBrowserCacheDiskID]: {
      databaseName: `OFFICEX-browser-cache-storage-${currentOrg?.driveID}-${currentProfile?.userID}`,
      objectStoreName: "files",
    },
    // S3 adapter config for Storj
    [defaultTempCloudSharingDiskID]: {
      diskID: defaultTempCloudSharingDiskID,
      endpoint: "https://gateway.storjshare.io",
      region: "us-east-1",
      accessKeyId: "jvaedsy46q4p5brxisvnrj7r2qpq",
      secretAccessKey: "j2tw7vymrpfihfoyucb3se2litma4r72aa4rb6cfqhc25lvy2bpoi",
      bucket: "officex",
      useMultipartUpload: true,
      partSize: 5 * 1024 * 1024, // 5MB parts
    },
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    if (pathParts.includes("drive")) {
      if (pathParts.length >= 5) {
        // We're at /drive/diskType/diskID or deeper
        const diskType = pathParts[3];
        const diskID = pathParts[4];
        setUploadTargetDiskType(diskType as DiskTypeEnum);
        setUploadTargetDiskID(diskID);

        // Check if we have a folder or file ID in the path
        if (pathParts.length >= 6) {
          const resourceId = pathParts[5];

          if (resourceId && resourceId.startsWith("FolderID_")) {
            // console.log(`setting the parent folder`, resourceId);
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
        setUploadTargetDiskType(DiskTypeEnum.BrowserCache);
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
      return;
    }

    try {
      // Get currently registered adapters
      const registeredAdapters =
        uploadManagerRef.current.getRegisteredAdapters();

      const registeredDiskIds = new Set(
        registeredAdapters.map((adapter) => adapter.diskID)
      );

      const allDisks = disks.map((d) => d.id).includes(uploadTargetDiskID || "")
        ? disks
        : [
            ...disks,
            {
              id: uploadTargetDiskID,
              disk_type: uploadTargetDiskType,
            } as DiskFEO,
          ].filter((d) => d.id && d.disk_type);

      // Process all disks from the Redux store
      for (const disk of allDisks) {
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
            continue;
          } else if (diskType === DiskTypeEnum.IcpCanister) {
            const auth_token =
              currentAPIKey?.value || (await generateSignature());
            const canisterAdapter = new CanisterAdapter();
            const canisterConfig = {
              diskID: diskId,
              endpoint: `${currentOrg.host}/v1/drive/${currentOrg.driveID}`,
              apiKey: auth_token,
              maxChunkSize: (1 * 1024 * 1024) / 2, // 0.5MB
            };
            if (currentProfile.icpAccount) {
              // @ts-ignore
              canisterConfig.generateSignature = generateSignature;
            }
            await registerAdapter(
              canisterAdapter,
              DiskTypeEnum.IcpCanister,
              diskId,
              canisterConfig,
              1 // Concurrency
            );
            continue;
          } else if (diskType === DiskTypeEnum.StorjWeb3) {
            const auth_token =
              currentAPIKey?.value || (await generateSignature());
            const cloudS3Adapter = new CloudS3Adapter();
            const cloudS3Config = {
              endpoint: `${currentOrg.host}/v1/drive/${currentOrg.driveID}`,
              maxChunkSize: 5 * 1024 * 1024,
              rawUrlProxyPath: `/v1/drive/${currentOrg.driveID}/directory/asset/`,
              apiKey: auth_token,
            };
            if (currentProfile.icpAccount) {
              // @ts-ignore
              cloudS3Config.generateSignature = generateSignature;
            }
            // Register the adapter
            await registerAdapter(
              cloudS3Adapter,
              DiskTypeEnum.StorjWeb3,
              diskId,
              cloudS3Config,
              3 // Concurrency
            );
            continue;
          } else if (diskType === DiskTypeEnum.AwsBucket) {
            const auth_token =
              currentAPIKey?.value || (await generateSignature());
            const cloudS3Adapter = new CloudS3Adapter();
            const cloudS3Config = {
              endpoint: `${currentOrg.host}/v1/drive/${currentOrg.driveID}`,
              maxChunkSize: 5 * 1024 * 1024,
              rawUrlProxyPath: `/v1/drive/${currentOrg.driveID}/directory/asset/`,
              apiKey: auth_token,
            };
            if (currentProfile.icpAccount) {
              // @ts-ignore
              cloudS3Config.generateSignature = generateSignature;
            }
            // Register the adapter
            await registerAdapter(
              cloudS3Adapter,
              DiskTypeEnum.StorjWeb3,
              diskId,
              cloudS3Config,
              3 // Concurrency
            );
            continue;
          } else if (diskType === DiskTypeEnum.LocalSSD) {
            continue;
          }
        } catch (error) {
          console.error(`Error registering adapter for disk ${diskId}:`, error);
        }
      }
      if (disks.length > 2) {
        setRegisteredDefaultAdapters(true);
      }
    } catch (error) {
      console.error("Error during default adapter registration:", error);
    }
  };

  useEffect(() => {
    if (currentProfile && currentOrg && isInitialized && disks.length > 0) {
      registerDefaultAdapters();
    }
  }, [currentProfile, currentOrg, isInitialized, disks]);

  const generateAuthToken = async () => {
    if (currentAPIKey?.value) {
      return currentAPIKey.value;
    } else {
      return generateSignature();
    }
  };

  // Initialize the upload manager
  const initializeUploadManager = async () => {
    try {
      // Create new upload manager if it doesn't exist
      if (!uploadManagerRef.current) {
        uploadManagerRef.current = new UploadManager(
          currentOrg?.host
            ? `${currentOrg?.host}/v1/drive/${currentOrg?.driveID}`
            : "",
          generateAuthToken
        );
      }

      const manager = uploadManagerRef.current;
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
    if (autoInit && currentOrg && currentProfile) {
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
  }, [autoInit, currentOrg, currentProfile]);

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
    uploadTargetDiskID,
    uploadTargetDiskType,
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

    uploadFiles: (files, parentFolderID, diskType, diskID, options) => {
      if (!uploadManagerRef.current) {
        throw new Error("Upload manager not initialized");
      }
      return uploadManagerRef.current.uploadFiles(
        files,
        parentFolderID,
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
