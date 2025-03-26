// src/framework/uploader/adapters/IUploadAdapter.ts
// Interface for different upload adapters (IndexDB, S3, Canister)

import { Observable } from "rxjs";
import {
  UploadID,
  UploadProgressInfo,
  UploadConfig,
  AdapterFeatures,
  ResumableUploadMetadata,
  UploadResponse,
} from "../types";
import { FileID } from "@officexapp/types";

export interface IUploadAdapter {
  initialize(config: any): Promise<void>;
  uploadFile(
    fileID: FileID,
    file: File,
    config: UploadConfig
  ): Observable<UploadProgressInfo>;
  pauseUpload(id: UploadID): Promise<boolean>;
  resumeUpload(
    id: UploadID,
    fileID: FileID,
    file: File
  ): Observable<UploadProgressInfo>;
  cancelUpload(id: UploadID): Promise<boolean>;
  getUploadStatus(id: UploadID): Promise<UploadProgressInfo | null>;
  getSupportedFeatures(): AdapterFeatures;
  getResumableUploadMetadata(
    id: UploadID
  ): Promise<ResumableUploadMetadata | null>;
  validateFileForResume(metadata: ResumableUploadMetadata, file: File): boolean;
  cleanup(): Promise<void>;
}
