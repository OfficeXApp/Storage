// src/framework/uploader/types.ts - Shared types for the upload system

import { DiskID, DiskTypeEnum, FileID, FolderID } from "@officexapp/types";
import { Observable } from "rxjs";
import { IUploadAdapter } from "./adapters/IUploadAdapter";
import { ObjectCannedACL } from "@aws-sdk/client-s3";

/**
 * Enum defining possible upload states
 */
export enum UploadState {
  QUEUED = "queued",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Reason for pausing an upload
 */
export enum PauseReason {
  USER_REQUESTED = "user_requested",
  NETWORK_DISCONNECTED = "network_disconnected",
  TAB_HIDDEN = "tab_hidden",
  ERROR_WILL_RETRY = "error_will_retry",
}

/**
 * Type to represent a unique upload ID
 */
export type UploadID = string;

/**
 * Structure to store resumable upload metadata
 */
export interface ResumableUploadMetadata {
  id: UploadID;
  fileID: FileID;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileLastModified: number;
  uploadStartTime: number;
  lastUpdateTime: number;
  diskType: DiskTypeEnum;
  diskID: DiskID;
  uploadedChunks: number[];
  totalChunks: number;
  chunkSize: number;
  parentFolderID: FolderID;
  customMetadata?: Record<string, any>;
}

/**
 * Progress information for an individual upload
 */
export interface UploadProgressInfo {
  id: UploadID;
  fileID: FileID;
  fileName: string;
  state: UploadState;
  progress: number; // 0-100
  bytesUploaded: number;
  bytesTotal: number;
  uploadSpeed?: number; // bytes per second
  estimatedTimeRemaining?: number; // seconds
  startTime: number;
  diskType: DiskTypeEnum;
  errorMessage?: string;
  retryCount?: number;
  parentFolderID: FolderID;
}

/**
 * Aggregate progress information for all uploads
 */
export interface AggregateUploadProgress {
  totalFiles: number;
  activeFiles: number;
  completedFiles: number;
  pausedFiles: number;
  failedFiles: number;
  cancelledFiles: number;
  queuedFiles: number;
  overallProgress: number; // 0-100
  currentlyUploading: UploadProgressInfo[];
}

/**
 * Configuration for initializing an upload
 */
export interface UploadConfig {
  file: File;
  fileID: FileID;
  parentFolderID: FolderID;
  diskID: DiskID;
  diskType: DiskTypeEnum;
  chunkSize?: number;
  priority?: number; // Higher number = higher priority
  metadata?: Record<string, any>;
  onComplete?: (id: UploadID) => void;
  retryLimit?: number;
  retryDelay?: number;
  skipDuplicates?: boolean;
  listDirectoryKey?: string;
}

/**
 * Batch upload configuration
 */
export interface BatchUploadConfig {
  files: File[];
  parentFolderID: FolderID;
  diskType: DiskTypeEnum;
  concurrency?: number;
  chunkSize?: number;
  metadata?: Record<string, any>;
  onFileComplete?: (id: UploadID) => void;
  onAllComplete?: () => void;
  retryLimit?: number;
  retryDelay?: number;
  skipDuplicates?: boolean;
  listDirectoryKey?: string;
}

/**
 * Storage-specific configuration for adapters
 */

// IndexDB specific config
export interface IndexDBAdapterConfig {
  databaseName?: string;
  objectStoreName?: string;
}

// S3 specific config
export interface LocalS3AdapterConfig {
  diskID: DiskID;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  acl?: ObjectCannedACL;
  useMultipartUpload?: boolean;
  partSize?: number;
}

// Canister specific config
export interface CanisterAdapterConfig {
  diskID: DiskID;
  endpoint: string;
  maxChunkSize?: number;
  apiKey: string;
}

/**
 * Interface for CloudS3 adapter configuration
 */
export interface CloudS3AdapterConfig {
  diskID: DiskID;
  endpoint: string;
  apiKey: string;
  maxChunkSize?: number;
}

/**
 * Upload adapter registry entry
 */
export interface AdapterRegistration {
  adapter: IUploadAdapter;
  diskType: DiskTypeEnum;
  diskID: DiskID;
  priority: number; // Lower number = higher priority
  concurrency: number;
  enabled: boolean;
  config: any;
}

/**
 * Upload item in the queue
 */
export interface QueuedUploadItem {
  id: UploadID;
  fileID: FileID;
  file: File;
  config: UploadConfig;
  state: UploadState;
  addedAt: number;
  priority: number;
  startedAt?: number;
  completedAt?: number;
  error?: Error;
  resumeData?: ResumableUploadMetadata;
  retryCount?: number;
  lastProgress?: UploadProgressInfo;
  pauseReason?: PauseReason;
}

/**
 * Upload response from a completed upload
 */
export interface UploadResponse {
  id: UploadID;
  fileID: FileID;
  fileName: string;
  fileSize: number;
  parentFolderID: FolderID;
  diskType: DiskTypeEnum;
  diskID: DiskID;
  uploadStartTime: number;
  uploadEndTime: number;
  duration: number;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Features supported by an adapter
 */
export interface AdapterFeatures {
  canPause: boolean;
  canResume: boolean;
  supportsChunking: boolean;
  supportsConcurrentUploads: boolean;
  supportsProgress: boolean;
  requiresAuthentication: boolean;
  maxConcurrentUploads: number;
  recommendedChunkSize: number;
}
