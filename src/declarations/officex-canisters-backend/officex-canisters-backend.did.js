export const idlFactory = ({ IDL }) => {
  const DriveFullFilePath = IDL.Text;
  const StorageLocationEnum = IDL.Variant({
    'BrowserCache' : IDL.Null,
    'Web3Storj' : IDL.Null,
    'HardDrive' : IDL.Null,
  });
  const FolderUUID = IDL.Text;
  const UserID = IDL.Principal;
  const Tag = IDL.Text;
  const FileUUID = IDL.Text;
  const FolderMetadata = IDL.Record({
    'id' : FolderUUID,
    'deleted' : IDL.Bool,
    'last_changed_unix_ms' : IDL.Nat64,
    'original_folder_name' : IDL.Text,
    'owner' : UserID,
    'storage_location' : StorageLocationEnum,
    'tags' : IDL.Vec(Tag),
    'canister_id' : IDL.Principal,
    'file_uuids' : IDL.Vec(FileUUID),
    'full_folder_path' : DriveFullFilePath,
    'parent_folder_uuid' : IDL.Opt(FolderUUID),
    'expires_at' : IDL.Int64,
    'created_date' : IDL.Nat64,
    'subfolder_uuids' : IDL.Vec(FolderUUID),
  });
  const Result_FolderMetadata = IDL.Variant({
    'Ok' : FolderMetadata,
    'Err' : IDL.Text,
  });
  const UpdateResult = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const FetchFilesAtFolderPathConfig = IDL.Record({
    'after' : IDL.Nat32,
    'full_folder_path' : DriveFullFilePath,
    'limit' : IDL.Nat32,
  });
  const FileMetadata = IDL.Record({
    'id' : FileUUID,
    'folder_uuid' : FolderUUID,
    'raw_url' : IDL.Text,
    'deleted' : IDL.Bool,
    'last_changed_unix_ms' : IDL.Nat64,
    'file_version' : IDL.Nat32,
    'owner' : UserID,
    'storage_location' : StorageLocationEnum,
    'tags' : IDL.Vec(Tag),
    'canister_id' : IDL.Principal,
    'full_file_path' : DriveFullFilePath,
    'file_size' : IDL.Nat64,
    'next_version' : IDL.Opt(FileUUID),
    'prior_version' : IDL.Opt(FileUUID),
    'original_file_name' : IDL.Text,
    'expires_at' : IDL.Int64,
    'created_date' : IDL.Nat64,
    'extension' : IDL.Text,
  });
  const FetchFilesResult = IDL.Record({
    'files' : IDL.Vec(FileMetadata),
    'total' : IDL.Nat32,
    'folders' : IDL.Vec(FolderMetadata),
    'has_more' : IDL.Bool,
  });
  const StateSnapshot = IDL.Record({
    'full_folder_path_to_uuid' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'folder_uuid_to_metadata' : IDL.Vec(IDL.Tuple(IDL.Text, FolderMetadata)),
    'full_file_path_to_uuid' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'file_uuid_to_metadata' : IDL.Vec(IDL.Tuple(IDL.Text, FileMetadata)),
  });
  const Result_FileUUID = IDL.Variant({ 'Ok' : FileUUID, 'Err' : IDL.Text });
  const Result_FolderUUID = IDL.Variant({
    'Ok' : FolderUUID,
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'create_folder' : IDL.Func(
        [DriveFullFilePath, StorageLocationEnum, IDL.Int64],
        [Result_FolderMetadata],
        [],
      ),
    'delete_file' : IDL.Func([FileUUID], [UpdateResult], []),
    'delete_folder' : IDL.Func([FolderUUID], [UpdateResult], []),
    'fetch_files_at_folder_path' : IDL.Func(
        [FetchFilesAtFolderPathConfig],
        [FetchFilesResult],
        ['query'],
      ),
    'get_canister_balance' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_file_by_id' : IDL.Func([FileUUID], [IDL.Opt(FileMetadata)], ['query']),
    'get_file_by_path' : IDL.Func(
        [DriveFullFilePath],
        [IDL.Opt(FileMetadata)],
        ['query'],
      ),
    'get_folder_by_id' : IDL.Func(
        [FolderUUID],
        [IDL.Opt(FolderMetadata)],
        ['query'],
      ),
    'get_folder_by_path' : IDL.Func(
        [DriveFullFilePath],
        [IDL.Opt(FolderMetadata)],
        ['query'],
      ),
    'get_owner' : IDL.Func([], [IDL.Principal], ['query']),
    'get_username' : IDL.Func([], [IDL.Text], ['query']),
    'ping' : IDL.Func([], [IDL.Text], ['query']),
    'rename_file' : IDL.Func([FileUUID, IDL.Text], [UpdateResult], []),
    'rename_folder' : IDL.Func([FolderUUID, IDL.Text], [UpdateResult], []),
    'snapshot_hashtables' : IDL.Func([], [StateSnapshot], ['query']),
    'update_username' : IDL.Func([IDL.Text], [UpdateResult], []),
    'upsert_cloud_file_with_local_sync' : IDL.Func(
        [FileUUID, FileMetadata],
        [Result_FileUUID],
        [],
      ),
    'upsert_cloud_folder_with_local_sync' : IDL.Func(
        [FolderUUID, FolderMetadata],
        [Result_FolderUUID],
        [],
      ),
    'upsert_file_to_hash_tables' : IDL.Func(
        [IDL.Text, StorageLocationEnum, IDL.Int64],
        [FileUUID],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
