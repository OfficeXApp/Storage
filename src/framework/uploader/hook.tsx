// src/framework/uploader/context/MultiUploaderContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UploadManager } from "./UploadManager";
import { S3Adapter } from "./adapters/s3bucket.adapter";
import { IndexedDBAdapter } from "./adapters/indexdb.adapter";
import { DiskID, DiskTypeEnum } from "@officexapp/types";
import {
  AggregateUploadProgress,
  UploadConfig,
  UploadID,
  UploadProgressInfo,
  BatchUploadConfig,
  S3AdapterConfig,
  IndexDBAdapterConfig,
  QueuedUploadItem,
  PauseReason,
} from "./types";
import { Observable } from "rxjs";
import { defaultBrowserCacheDiskID } from "../../api/dexie-database";
import { IUploadAdapter } from "./adapters/IUploadAdapter";

// Add missing CanisterAdapter configuration type
interface CanisterAdapterConfig {
  diskID: DiskID;
  canisterId: string;
  maxChunkSize?: number;
  host?: string;
  apiKey: string;
}

interface MultiUploaderContextType {
  uploadManager: UploadManager | undefined;
  isInitialized: boolean;
  progress: AggregateUploadProgress;
  currentUploads: QueuedUploadItem[];
  uploadFile: (
    file: File,
    uploadPath: string,
    diskType: DiskTypeEnum,
    diskID: DiskID,
    options?: Partial<UploadConfig>
  ) => UploadID;
  uploadFiles: (
    files: File[],
    uploadPath: string,
    diskType: DiskTypeEnum,
    diskID: DiskID,
    options?: Partial<BatchUploadConfig>
  ) => UploadID[];
  pauseUpload: (id: UploadID) => Promise<boolean>;
  resumeUpload: (id: UploadID, file: File) => Promise<boolean>;
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
  uploadManager: undefined,
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
  const [isInitialized, setIsInitialized] = useState(false);
  const uploadManagerRef = useRef<UploadManager>();
  const [progress, setProgress] = useState<AggregateUploadProgress>(
    defaultContextValue.progress
  );
  const [currentUploads, setCurrentUploads] = useState<QueuedUploadItem[]>([]);

  // Initialize the upload manager
  const initializeUploadManager = async () => {
    try {
      // Create new upload manager if it doesn't exist
      if (!uploadManagerRef.current) {
        uploadManagerRef.current = new UploadManager();
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
    uploadManager: uploadManagerRef.current,
    isInitialized,
    progress,
    currentUploads,
    registerAdapter,

    // Upload methods
    uploadFile: (file, uploadPath, diskType, diskID, options) => {
      if (!uploadManagerRef.current)
        throw new Error("Upload manager not initialized");
      return uploadManagerRef.current.uploadFile(
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

    resumeUpload: async (id, file) => {
      if (!uploadManagerRef.current) return false;
      return uploadManagerRef.current.resumeUpload(id, file);
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
