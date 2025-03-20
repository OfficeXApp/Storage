// src/framework/uploader/types.ts - Shared types for the upload system

import { DiskTypeEnum } from "@officexapp/types";
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
  fileName: string;
  fileSize: number;
  fileType: string;
  fileLastModified: number;
  uploadStartTime: number;
  lastUpdateTime: number;
  diskType: DiskTypeEnum;
  uploadedChunks: number[];
  totalChunks: number;
  chunkSize: number;
  uploadPath: string;
  customMetadata?: Record<string, any>;
}

/**
 * Progress information for an individual upload
 */
export interface UploadProgressInfo {
  id: UploadID;
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
  uploadPath: string;
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
  uploadPath: string;
  diskType: DiskTypeEnum;
  chunkSize?: number;
  priority?: number; // Higher number = higher priority
  metadata?: Record<string, any>;
  onComplete?: (id: UploadID) => void;
  retryLimit?: number;
  retryDelay?: number;
  skipDuplicates?: boolean;
}

/**
 * Batch upload configuration
 */
export interface BatchUploadConfig {
  files: File[];
  uploadPath: string;
  diskType: DiskTypeEnum;
  concurrency?: number;
  chunkSize?: number;
  metadata?: Record<string, any>;
  onFileComplete?: (id: UploadID) => void;
  onAllComplete?: () => void;
  retryLimit?: number;
  retryDelay?: number;
  skipDuplicates?: boolean;
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
export interface S3AdapterConfig {
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
  endpoint: string;
  maxChunkSize?: number;
  apiKey: string;
}

/**
 * Upload adapter registry entry
 */
export interface AdapterRegistration {
  adapter: IUploadAdapter;
  diskType: DiskTypeEnum;
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
  fileName: string;
  fileSize: number;
  uploadPath: string;
  diskType: DiskTypeEnum;
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
