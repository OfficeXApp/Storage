import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CanisterSettings {
  'freezing_threshold' : [] | [bigint],
  'controllers' : [] | [Array<Principal>],
  'memory_allocation' : [] | [bigint],
  'compute_allocation' : [] | [bigint],
}
export type DriveFullFilePath = string;
export interface FetchFilesAtFolderPathConfig {
  'after' : number,
  'full_folder_path' : DriveFullFilePath,
  'limit' : number,
}
export interface FetchFilesResult {
  'files' : Array<FileMetadata>,
  'total' : number,
  'folders' : Array<FolderMetadata>,
  'has_more' : boolean,
}
export interface FileMetadata {
  'id' : FileUUID,
  'folder_uuid' : FolderUUID,
  'raw_url' : string,
  'file_version' : number,
  'owner' : UserID,
  'storage_location' : StorageLocationEnum,
  'modified_date' : bigint,
  'tags' : Array<Tag>,
  'full_file_path' : DriveFullFilePath,
  'file_size' : bigint,
  'next_version' : [] | [FileUUID],
  'prior_version' : [] | [FileUUID],
  'original_file_name' : string,
  'created_date' : bigint,
  'extension' : string,
}
export type FileUUID = string;
export interface FolderMetadata {
  'id' : FolderUUID,
  'original_folder_name' : string,
  'owner' : UserID,
  'storage_location' : StorageLocationEnum,
  'tags' : Array<Tag>,
  'file_uuids' : Array<FileUUID>,
  'full_folder_path' : DriveFullFilePath,
  'parent_folder_uuid' : [] | [FolderUUID],
  'created_date' : bigint,
  'subfolder_uuids' : Array<FolderUUID>,
}
export type FolderUUID = string;
export type Result = { 'Ok' : Principal } |
  { 'Err' : string };
export type ResultText = { 'Ok' : string } |
  { 'Err' : string };
export type Result_FolderMetadata = { 'Ok' : FolderMetadata } |
  { 'Err' : string };
export interface StateSnapshot {
  'full_folder_path_to_uuid' : Array<[string, string]>,
  'folder_uuid_to_metadata' : Array<[string, FolderMetadata]>,
  'full_file_path_to_uuid' : Array<[string, string]>,
  'file_uuid_to_metadata' : Array<[string, FileMetadata]>,
}
export type StorageLocationEnum = { 'BrowserCache' : null } |
  { 'Web3Storj' : null } |
  { 'HardDrive' : null };
export type Tag = string;
export type UpdateResult = { 'Ok' : null } |
  { 'Err' : string };
export type UserID = Principal;
export interface _SERVICE {
  'create_folder' : ActorMethod<
    [DriveFullFilePath, StorageLocationEnum],
    Result_FolderMetadata
  >,
  'delete_file' : ActorMethod<[FileUUID], UpdateResult>,
  'delete_folder' : ActorMethod<[FolderUUID], UpdateResult>,
  'fetch_files_at_folder_path' : ActorMethod<
    [FetchFilesAtFolderPathConfig],
    FetchFilesResult
  >,
  'get_canister_balance' : ActorMethod<[], bigint>,
  'get_file_by_id' : ActorMethod<[FileUUID], [] | [FileMetadata]>,
  'get_file_by_path' : ActorMethod<[DriveFullFilePath], [] | [FileMetadata]>,
  'get_folder_by_id' : ActorMethod<[FolderUUID], [] | [FolderMetadata]>,
  'get_folder_by_path' : ActorMethod<
    [DriveFullFilePath],
    [] | [FolderMetadata]
  >,
  'get_owner' : ActorMethod<[], Principal>,
  'get_username' : ActorMethod<[], string>,
  'ping' : ActorMethod<[], string>,
  'rename_file' : ActorMethod<[FileUUID, string], UpdateResult>,
  'rename_folder' : ActorMethod<[FolderUUID, string], UpdateResult>,
  'snapshot_hashtables' : ActorMethod<[], StateSnapshot>,
  'update_username' : ActorMethod<[string], UpdateResult>,
  'upsert_file_to_hash_tables' : ActorMethod<
    [string, StorageLocationEnum],
    string
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
