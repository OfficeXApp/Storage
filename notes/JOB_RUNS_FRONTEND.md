# Job Runs Front

Please help me write the equivalent of the "Disks" code, for my new "Job Runs" resource. Assume the imports exists. focus on the react components and the redux-offline code.

## Typescript Types

// import these from `@officexapp/types`

// src/types/permissions.ts

/\*\*

- OfficeX API Type Definitions
- Derived from OpenAPI v3.0.3 specification
  \*/

import {
DirectoryPermissionID,
DirectoryPermissionType,
DirectoryResourceID,
DriveID,
ExternalID,
ExternalPayload,
GranteeID,
JobRunID,
SystemPermissionID,
SystemPermissionType,
SystemRecordIDEnum,
UserID,
} from "./primitives";

// =========================================================================
// System Resource Types
// =========================================================================

/\*_ System table resources _/
export enum SystemTableValueEnum {
DRIVES = "DRIVES",
DISKS = "DISKS",
CONTACTS = "CONTACTS",
GROUPS = "GROUPS",
API_KEYS = "API_KEYS",
PERMISSIONS = "PERMISSIONS",
WEBHOOKS = "WEBHOOKS",
LABELS = "LABELS",
INBOX = "INBOX",
JOB_RUNS = "JOB_RUNS",
}

/\*_ Unique identifier for a system table resource _/
export type SystemTableResource = `TABLE_${SystemTableValueEnum}`;

/\*_ Unique identifier for a system record resource _/
export type SystemRecordResource = SystemRecordIDEnum;

/\*_ Unique identifier for a system resource (table or record) _/
export type SystemResourceID = SystemTableResource | SystemRecordResource;

/\*_ Directory permission _/
export interface DirectoryPermission {
id: DirectoryPermissionID;
resource_id: DirectoryResourceID;
resource_path: string;
granted_to: GranteeID;
granted_by: UserID;
permission_types: DirectoryPermissionType[];
begin_date_ms: number;
expiry_date_ms: number;
inheritable: boolean;
note: string;
created_at: number;
last_modified_at: number;
from_placeholder_grantee?: string;
labels: string[];
redeem_code?: string;
external_id?: ExternalID;
external_payload?: ExternalPayload;
metadata?: PermissionMetadata;
}

// Type alias for the wrapped string type from Rust
export type LabelStringValuePrefix = string;

/\*\*

- Enum for the type of metadata content.
- Corresponds to the Rust enum `PermissionMetadataTypeEnum`.
- @enum {string}
  \*/
  export enum PermissionMetadataTypeEnum {
  LABELS = "LABELS",
  DIRECTORY_PASSWORD = "DIRECTORY_PASSWORD",
  }

/\*\*

- A discriminated union representing the content of the permission metadata.
- This corresponds to the Rust enum `PermissionMetadataContent`.
- The structure `{ VariantName: value }` mimics the default serialization of Rust enums with data.
  \*/
  export type PermissionMetadataContent =
  | { Labels: LabelStringValuePrefix }
  | { DirectoryPassword: string };

/\*\*

- The primary container for permission metadata.
- This directly corresponds to the Rust struct `PermissionMetadata`.
- It contains a discriminator field (`metadata_type`) and the `content` union.
  \*/
  export interface PermissionMetadata {
  metadata_type: PermissionMetadataTypeEnum;
  content: PermissionMetadataContent;
  }

// --- Optional: Type Guards for Ergonomics ---

/\*\*

- Type guard to check if the metadata is for Labels.
- This allows for type-safe access to the `content` property.
-
- @example
- if (isLabelMetadata(metadata)) {
- console.log(metadata.content.Labels); // TypeScript knows this is a string
- }
  \*/
  export function isLabelMetadata(metadata: PermissionMetadata): metadata is {
  metadata_type: PermissionMetadataTypeEnum.LABELS;
  content: { Labels: LabelStringValuePrefix };
  } {
  return metadata.metadata_type === PermissionMetadataTypeEnum.LABELS;
  }

/\*\*

- Type guard to check if the metadata is for a Directory Password.
- This allows for type-safe access to the `content` property.
-
- @example
- if (isDirectoryPasswordMetadata(metadata)) {
- console.log(metadata.content.DirectoryPassword); // TypeScript knows this is a string
- }
  \*/
  export function isDirectoryPasswordMetadata(
  metadata: PermissionMetadata
  ): metadata is {
  metadata_type: PermissionMetadataTypeEnum.DIRECTORY_PASSWORD;
  content: { DirectoryPassword: string };
  } {
  return (
  metadata.metadata_type === PermissionMetadataTypeEnum.DIRECTORY_PASSWORD
  );
  }

export interface DirectoryPermissionFE {
id: DirectoryPermissionID;
resource_id: DirectoryResourceID;
resource_path: string;
granted_to: string;
granted_by: string;
permission_types: DirectoryPermissionType[];
begin_date_ms: number;
expiry_date_ms: number;
inheritable: boolean;
note: string;
created_at: number;
last_modified_at: number;
from_placeholder_grantee?: string;
labels: string[];
redeem_code?: string;
external_id?: string;
external_payload?: string;
resource_name?: string;
grantee_name?: string;
grantee_avatar?: string;
granter_name?: string;
permission_previews: SystemPermissionType[];
metadata?: PermissionMetadata;
}

/\*_ System permission _/
export interface SystemPermission {
id: SystemPermissionID;
resource_id: SystemResourceID;
granted_to: GranteeID;
granted_by: UserID;
permission_types: SystemPermissionType[];
begin_date_ms: number;
expiry_date_ms: number;
note: string;
created_at: number;
last_modified_at: number;
from_placeholder_grantee?: string;
labels: string[];
redeem_code?: string;
external_id?: ExternalID;
external_payload?: ExternalPayload;
metadata?: PermissionMetadata;
}

export interface SystemPermissionFE {
id: string;
resource_id: string;
granted_to: string;
granted_by: string;
permission_types: SystemPermissionType[];
begin_date_ms: number;
expiry_date_ms: number;
note: string;
created_at: number;
last_modified_at: number;
from_placeholder_grantee?: string;
labels: string[];
metadata?: PermissionMetadata;
external_id?: string;
external_payload?: string;
redeem_code?: string;
resource_name?: string;
grantee_name?: string;
grantee_avatar?: string;
granter_name?: string;
permission_previews: SystemPermissionType[];
}

/\*_ CheckPermissionResult type _/
export interface CheckPermissionResult {
resource_id: string;
grantee_id: string;
permissions: DirectoryPermissionType[];
}

/\*_ CheckSystemPermissionResult type _/
export interface CheckSystemPermissionResult {
resource_id: string;
grantee_id: string;
permissions: SystemPermissionType[];
}

export interface JobRun {
id: JobRunID;
template_id?: string; // no guarnatees on this, only set on create
vendor_name: string; // cannot be updated, only set on create
vendor_id: UserID; // cannot be updated, only set on create
status: JobRunStatus; // can be updated by vendor
description: string; // cannot be updated, only set on create
about_url: string; // can be updated by vendor
run_url: string; // can be updated by vendor
billing_url: string; // can be updated by vendor
support_url: string; // can be updated by vendor
delivery_url: string; // can be updated by vendor
verification_url: string; // can be updated by vendor
auth_installation_url: string; // the script to run to install the job
title: string; // cannot be updated, only set on create
subtitle: string; // can be updated
pricing: string; // can be updated
vendor_notes: string; // can be updated by vendor
notes: string; // cannot be viewed or updated by vendor
created_at: number;
updated_at: number;
last_updated_at: number;
labels: string[]; // can be updated by vendor
related_resources: string[]; // list of ID strings, can be updated
tracer?: string; // can be updated by vendor
external_id?: string; // can be updated by vendor
external_payload?: string; // can be updated by vendor
}
export enum JobRunStatus {
REQUESTED = "REQUESTED",
AWAITING = "AWAITING",
RUNNING = "RUNNING",
BLOCKED = "BLOCKED",
COMPLETED = "COMPLETED",
FAILED = "FAILED",
CANCELED = "CANCELED",
REFUNDED = "REFUNDED",
ARCHIVED = "ARCHIVED",
UNKNOWN = "UNKNOWN",
}

export interface InitJobRunRequestBody {
job_id: JobRunID;
customer_notes: string;
payload?: string; // json string encoded object
template_id?: string;
drive_id: DriveID;
drive_endpoint: string;
init_password?: string;
temp_auth_token: string;
callback_url?: string;
tracer?: string;
metadata?: string; // json string encoded object
}

// Example Install Scripts
/\*\*

Example #1
JobRun: Buy Storage Giftcard from Amazon

1. Receive install request body with temp auth
2. Create contact for vendor
3. Create job run record
4. Create disk
5. Grant vendor permission to disk root & trash
6. Update the job run record
7. End the job run

Example #2
JobRun: YouTube Downloader

Example #3
JobRun: Delegate Reddit Farming

\*/

// src/types/primitives.ts

import { v4 as uuidv4 } from "uuid";

/\*\*

- OfficeX API Type Definitions
- Derived from OpenAPI v3.0.3 specification
  \*/

// =========================================================================
// ID Type Definitions
// =========================================================================

// enum for id prefix IDPrefixEnum
export enum IDPrefixEnum {
File = "FileID*",
Folder = "FolderID*",
Drive = "DriveID*",
ApiKey = "ApiKeyID*",
Disk = "DiskID*",
Group = "GroupID*",
GroupInvite = "GroupInviteID*",
SystemPermission = "SystemPermissionID*",
DirectoryPermission = "DirectoryPermissionID*",
PlaceholderPermissionGrantee = "PlaceholderPermissionGranteeID*",
Webhook = "WebhookID*",
User = "UserID*",
DirectoryActionOutcome = "DirectoryActionOutcomeID*",
PlaceholderGroupInviteeID = "PlaceholderGroupInviteeID*",
ShareTrackID = "ShareTrackID*",
DriveStateDiffID = "DriveStateDiffID*",
LabelID = "LabelID*",
RedeemCode = "RedeemTokenID*",
FactoryApiKey = "FactoryApiKeyID*",
GiftcardSpawnOrg = "GiftcardSpawnOrgID*",
GiftcardRefuel = "GiftcardRefuelID*",
InboxNotifID = "InboxNotifID*",
FileVersionID = "FileVersionID*",
RedeemTokenID = "RedeemTokenID*",
JobRunID = "JobRunID\_",
}

export const GenerateID = {
File: () => `${IDPrefixEnum.File}${uuidv4()}` as FileID,
Folder: () => `${IDPrefixEnum.Folder}${uuidv4()}` as FolderID,
Drive: (icp_principal: string) =>
`${IDPrefixEnum.Drive}${icp_principal}` as DriveID,
ApiKey: () => `${IDPrefixEnum.ApiKey}${uuidv4()}` as ApiKeyID,
FactoryApiKey: () =>
`${IDPrefixEnum.FactoryApiKey}${uuidv4()}` as FactoryApiKeyID,
Disk: () => `${IDPrefixEnum.Disk}${uuidv4()}` as DiskID,
Group: () => `${IDPrefixEnum.Group}${uuidv4()}` as GroupID,
GroupInvite: () => `${IDPrefixEnum.GroupInvite}${uuidv4()}` as GroupInviteID,
SystemPermission: () =>
`${IDPrefixEnum.SystemPermission}${uuidv4()}` as SystemPermissionID,
DirectoryPermission: () =>
`${IDPrefixEnum.DirectoryPermission}${uuidv4()}` as DirectoryPermissionID,
PlaceholderPermissionGrantee: () =>
`${IDPrefixEnum.PlaceholderPermissionGrantee}${uuidv4()}`,
Webhook: () => `${IDPrefixEnum.Webhook}${uuidv4()}` as WebhookID,
User: (icp_principal: string) =>
`${IDPrefixEnum.User}${icp_principal}` as UserID,
DirectoryActionOutcome: () =>
`${IDPrefixEnum.DirectoryActionOutcome}${uuidv4()}`,
PlaceholderGroupInviteeID: () =>
`${IDPrefixEnum.PlaceholderGroupInviteeID}${uuidv4()}`,
ShareTrackID: () => `${IDPrefixEnum.ShareTrackID}${uuidv4()}`,
DriveStateDiffID: () => `${IDPrefixEnum.DriveStateDiffID}${uuidv4()}`,
Label: () => `${IDPrefixEnum.LabelID}${uuidv4()}` as LabelID,
RedeemCode: () => `${IDPrefixEnum.RedeemCode}${uuidv4()}`,
InboxNotifID: () => `${IDPrefixEnum.InboxNotifID}${uuidv4()}`,
FileVersionID: () => `${IDPrefixEnum.FileVersionID}${uuidv4()}`,
JobRunID: () => `${IDPrefixEnum.JobRunID}${uuidv4()}`,
};

/\*_ Unique identifier for a file _/
export type FileID = string;

/\*_ Unique identifier for a folder _/
export type FolderID = string;

/\*_ Unique identifier for an API key _/
export type ApiKeyID = string;

/\*_ Unique identifier for a factory API key _/
export type FactoryApiKeyID = string;

/\*_ Unique identifier for a user _/
export type UserID = string;

export type DriveStateDiffID = string;

export type GiftcardSpawnOrgID = string;
export type GiftcardRefuelID = string;

/\*_ Unique identifier for a group _/
export type GroupID = string;

/\*_ Unique identifier for a group invite _/
export type GroupInviteID = string;

/\*_ Either a UserID or GroupID _/
export type GranteeID =
| UserID
| GroupID
| `PlaceholderPermissionGranteeID_${string}`
| "PUBLIC";

/\*_ Unique identifier for a disk _/
export type DiskID = string;

/\*_ Search result resource ID _/
export type SearchResultResourceID = string;

/\*_ Unique identifier for a drive _/
export type DriveID = string;

export type InboxNotifID = string;

/\*_ Unique identifier for a label _/
export type LabelID = string;

/\*_ Unique identifier for a webhook _/
export type WebhookID = string;

/\*_ Unique identifier for a state diff record _/
export type StateDiffRecordID = string;

/\*_ Unique identifier for a directory resource (file or folder) _/
export type DirectoryResourceID = `FileID_${string}` | `FolderID_${string}`;

/\*_ Unique identifier for a directory permission _/
export type DirectoryPermissionID = string;

/\*_ Unique identifier for a system permission _/
export type SystemPermissionID = string;

/\*_ ICP principal identifier _/
export type ICPPrincipalString = string;

export type JobRunID = string;

/\*_ EVM public address _/
export type EvmPublicAddress = string;

/\*_ URL endpoint _/
export type URLEndpoint = string;

/\*_ External identifier for integration purposes _/
export type ExternalID = string;

export type FileVersionID = string;

/\*_ Additional data for external integrations _/
export type ExternalPayload = string;

/\*_ Value for a label _/
export type LabelValue = string;

/\*_ API key value _/
export type ApiKeyValue = string;

/\*_ Full path to a file or folder in the drive _/
export type DriveFullFilePath = string;
export type DriveClippedFilePath = string;

// =========================================================================
// Enum Definitions
// =========================================================================

/\*_ Type of disk storage _/
export enum DiskTypeEnum {
BrowserCache = "BROWSER_CACHE",
LocalSSD = "LOCAL_SSD",
AwsBucket = "AWS_BUCKET",
StorjWeb3 = "STORJ_WEB3",
IcpCanister = "ICP_CANISTER",
}

/\*_ Type of directory action to perform _/
export enum DirectoryActionEnum {
GET_FILE = "GET_FILE",
GET_FOLDER = "GET_FOLDER",
CREATE_FILE = "CREATE_FILE",
CREATE_FOLDER = "CREATE_FOLDER",
UPDATE_FILE = "UPDATE_FILE",
UPDATE_FOLDER = "UPDATE_FOLDER",
DELETE_FILE = "DELETE_FILE",
DELETE_FOLDER = "DELETE_FOLDER",
COPY_FILE = "COPY_FILE",
COPY_FOLDER = "COPY_FOLDER",
MOVE_FILE = "MOVE_FILE",
MOVE_FOLDER = "MOVE_FOLDER",
RESTORE_TRASH = "RESTORE_TRASH",
}

/\*_ How to handle file name conflicts during copy, move, or restore operations _/
export enum FileConflictResolutionEnum {
REPLACE = "REPLACE",
KEEP_BOTH = "KEEP_BOTH",
KEEP_ORIGINAL = "KEEP_ORIGINAL",
KEEP_NEWER = "KEEP_NEWER",
}

/\*_ Types of permissions for directory resources _/
export enum DirectoryPermissionType {
VIEW = "VIEW",
UPLOAD = "UPLOAD",
EDIT = "EDIT",
DELETE = "DELETE",
INVITE = "INVITE",
MANAGE = "MANAGE",
}

/\*_ Types of permissions for system resources _/
export enum SystemPermissionType {
CREATE = "CREATE",
EDIT = "EDIT",
DELETE = "DELETE",
VIEW = "VIEW",
INVITE = "INVITE",
}

/\*_ Roles for group members _/
export enum GroupRole {
ADMIN = "ADMIN",
MEMBER = "MEMBER",
}

/\*_ Sort direction for pagination _/
export enum SortDirection {
ASC = "ASC",
DESC = "DESC",
}

/\*_ Type of event that triggers a webhook _/
export enum WebhookEventLabel {
FILE_VIEWED = "file.viewed",
FILE_CREATED = "file.created",
FILE_UPDATED = "file.updated",
FILE_DELETED = "file.deleted",
FILE_SHARED = "file.shared",
FOLDER_VIEWED = "folder.viewed",
FOLDER_CREATED = "folder.created",
FOLDER_UPDATED = "folder.updated",
FOLDER_DELETED = "folder.deleted",
FOLDER_SHARED = "folder.shared",
SUBFILE_VIEWED = "subfile.viewed",
SUBFILE_CREATED = "subfile.created",
SUBFILE_UPDATED = "subfile.updated",
SUBFILE_DELETED = "subfile.deleted",
SUBFILE_SHARED = "subfile.shared",
SUBFOLDER_VIEWED = "subfolder.viewed",
SUBFOLDER_CREATED = "subfolder.created",
SUBFOLDER_UPDATED = "subfolder.updated",
SUBFOLDER_DELETED = "subfolder.deleted",
SUBFOLDER_SHARED = "subfolder.shared",
GROUP_INVITE_CREATED = "group.invite.created",
GROUP_INVITE_UPDATED = "group.invite.updated",
DRIVE_RESTORE_TRASH = "drive.restore_trash",
DRIVE_STATE_DIFFS = "drive.state_diffs",
LABEL_ADDED = "label.added",
LABEL_REMOVED = "label.removed",
ORG_SUPERSWAP_USER = "org.superswap_user",
ORG_INBOX_NEW_MAIL = "org.inbox.new_mail",
}

export enum UploadStatus {
QUEUED = "QUEUED",
PENDING = "PENDING",
COMPLETED = "COMPLETED",
}

export type SystemRecordIDEnum =
| DriveID
| DiskID
| UserID
| GroupID
| ApiKeyID
| SystemPermissionID
| DirectoryPermissionID
| WebhookID
| LabelID
| `Unknown_${string}`;

export enum GroupInviteeTypeEnum {
USER = "USER",
PLACEHOLDER_GROUP_INVITEE = "PLACEHOLDER_GROUP_INVITEE",
PUBLIC = "PUBLIC",
}

export type GroupInviteeID =
| UserID
| `PlaceholderGroupInviteeID_${string}`
| "PUBLIC";

// src/types/routes.ts

import { DirectoryAction } from "./actions";
import {
ApiKey,
ContactFE,
Disk,
Drive,
Label,
Group,
GroupInvite,
Webhook,
FolderRecordFE,
FileRecordFE,
FilePathBreadcrumb,
SearchResult,
SearchCategoryEnum,
SearchSortByEnum,
FactoryApiKey,
GiftcardSpawnOrg,
GiftcardRefuel,
ExternalIDsDriveResponseData,
JobRunFE,
} from "./core";
import {
DirectoryPermissionFE,
JobRunStatus,
PermissionMetadata,
SystemPermissionFE,
} from "./permissions";
import {
ApiKeyID,
DirectoryPermissionID,
DirectoryResourceID,
DiskID,
DiskTypeEnum,
DriveID,
ExternalID,
ExternalPayload,
GiftcardSpawnOrgID,
GranteeID,
ICPPrincipalString,
SortDirection,
SystemPermissionID,
LabelID,
GroupID,
GroupInviteID,
GroupRole,
URLEndpoint,
UserID,
WebhookEventLabel,
WebhookID,
InboxNotifID,
ApiKeyValue,
GiftcardRefuelID,
SystemPermissionType,
DirectoryPermissionType,
JobRunID,
} from "./primitives";

/\*\*

- OfficeX API Route Types
- Generated from OpenAPI v3.0.3 specification
  \*/

// =========================================================================
// Base Interfaces
// =========================================================================

/\*_ Common structure for successful API responses _/
export interface ISuccessResponse<T> {
ok: {
data: T;
};
}

/\*_ Common structure for error API responses _/
export interface IErrorResponse {
err: {
code: number;
message: string;
};
}

/** Common pagination parameters \*/
export interface IPaginationParams {
/** Filter string _/
filters?: string;
/\*\* Number of items per page _/
page_size?: number;
/** Sort direction \*/
direction?: SortDirection;
/** Cursor for previous page \*/
cursor?: string;
}

/\*_ Common paginated response _/
export interface IPaginatedResponse<T> {
items: T[];
page_size: number;
total: number;
cursor?: string;
direction?: SortDirection;
}

// =========================================================================
// JobRuns Routes
// =========================================================================

/\*_ Request body for listing JobRuns. _/
export interface IRequestListJobRuns extends IPaginationParams {}

/\*_ Response data for listing JobRuns. _/
export interface IResponseListJobRuns
extends ISuccessResponse<IPaginatedResponse<JobRunFE>> {}

/\*_ Request body for getting a JobRun. _/
export interface IRequestGetJobRun {
id: JobRunID;
}

/\*_ Response data for getting a JobRun. _/
export type IResponseGetJobRun = ISuccessResponse<JobRunFE>;

/\*_ Request body for creating a new JobRun. _/
export interface IRequestCreateJobRun {
id?: JobRunID;
template_id?: string;
title: string;
vendor_name: string;
vendor_id: UserID;
about_url: string;
status?: JobRunStatus;
description?: string;
billing_url?: string;
support_url?: string;
delivery_url?: string;
verification_url?: string;
auth_installation_url?: string;
subtitle?: string;
pricing?: string;
vendor_notes?: string;
notes?: string;
related_resources?: string[];
tracer?: string;
labels?: string[];
external_id?: string;
external_payload?: string;
}

/\*_ Response data for creating a JobRun. _/
export type IResponseCreateJobRun = ISuccessResponse<JobRunFE>;

/\*_ Request body for updating an existing JobRun. _/
export interface IRequestUpdateJobRun {
id: JobRunID;
status?: JobRunStatus;
billing_url?: string;
support_url?: string;
delivery_url?: string;
verification_url?: string;
auth_installation_url?: string;
subtitle?: string;
pricing?: string;
vendor_notes?: string;
related_resources?: string[];
tracer?: string;
labels?: string[];
external_id?: string;
external_payload?: string;
}

/\*_ Response data for updating a JobRun. _/
export type IResponseUpdateJobRun = ISuccessResponse<JobRunFE>;

/\*_ Request body for deleting a JobRun. _/
export interface IRequestDeleteJobRun {
id: JobRunID;
}

/\*_ Response data after deleting a JobRun. _/
export type IResponseDeleteJobRun = ISuccessResponse<{
id: JobRunID;
deleted: boolean;
}>;

// =========================================================================
// Directory Routes
// =========================================================================

/** List Directory Request \*/
export interface IRequestListDirectory {
/** ID of the folder to list contents from _/
folder_id?: string;
/\*\* Path to the folder to list contents from _/
path?: string;
/** disk id if just getting shortcuts \*/
disk_id?: string;
/** Filter string for directory contents _/
filters?: string;
/\*\* Number of items per page _/
page_size?: number;
/** Sort direction \*/
direction?: SortDirection;
/** Cursor for pagination \*/
cursor?: string;
}

/\*_ List Directory Response _/
export interface IResponseListDirectory
extends ISuccessResponse<{
folders: FolderRecordFE[];
files: FileRecordFE[];
total_files: number;
total_folders: number;
cursor?: string;
breadcrumbs: FilePathBreadcrumb[];
}> {}

/\*_ Directory Action Request _/
export interface IRequestDirectoryAction {
actions: DirectoryAction[];
}

/** Get File Asset (uses 302 redirect) \*/
export interface IRequestGetFileAsset {
/** File ID with file extension \*/
file_id_with_extension: string;
}

// =========================================================================
// API Keys Routes
// =========================================================================

/** Get API Key Request \*/
export interface IRequestGetApiKey {
/** ID of the API key to retrieve \*/
api_key_id: ApiKeyID;
}

/\*_ Get API Key Response _/
export interface IResponseGetApiKey extends ISuccessResponse<ApiKey> {}

/** List API Keys Request \*/
export interface IRequestListApiKeys {
/** ID of the user whose API keys to list \*/
user_id: UserID;
}

/\*_ List API Keys Response _/
export interface IResponseListApiKeys extends ISuccessResponse<ApiKey[]> {}

/** Create API Key Request \*/
export interface IRequestCreateApiKey {
id?: ApiKeyID;
/** Name for the API key _/
name: string;
/\*\* ID of the user to create the API key for _/
user*id?: UserID;
begins_at?: number;
/** Timestamp when the key expires, -1 for never expires \*/
expires_at?: number;
/** External identifier */
external*id?: string;
/\*\* Additional data for external systems */
external_payload?: string;
}

/\*_ Create API Key Response _/
export interface IResponseCreateApiKey extends ISuccessResponse<ApiKey> {}

/** Update API Key Request \*/
export interface IRequestUpdateApiKey {
/** ID of the API key to update _/
id: ApiKeyID;
/\*\* New name for the API key _/
name?: string;
/** New expiration timestamp, -1 for never expires \*/
begins_at?: number;
expires_at?: number;
/** Whether to revoke the API key _/
is_revoked?: boolean;
/\*\* External identifier _/
external\*id?: string;
/\*\* Additional data for external systems \_/
external_payload?: string;
}

/\*_ Update API Key Response _/
export interface IResponseUpdateApiKey extends ISuccessResponse<ApiKey> {}

/** Delete API Key Request \*/
export interface IRequestDeleteApiKey {
/** ID of the API key to delete \*/
id: ApiKeyID;
}

/** Delete API Key Response \*/
export interface IResponseDeleteApiKey
extends ISuccessResponse<{
/** ID of the deleted API key _/
id: ApiKeyID;
/\*\* Whether the API key was successfully deleted _/
deleted: boolean;
}> {}

// =========================================================================
// Contacts Routes
// =========================================================================

/** Get Contact Request \*/
export interface IRequestGetContact {
/** ID of the contact to retrieve \*/
contact_id: UserID;
}

/\*_ Get Contact Response _/
export interface IResponseGetContact extends ISuccessResponse<ContactFE> {}

/\*_ List Contacts Request _/
export interface IRequestListContacts extends IPaginationParams {}

/\*_ List Contacts Response _/
export interface IResponseListContacts
extends ISuccessResponse<IPaginatedResponse<ContactFE>> {}

/** Create Contact Request \*/
export interface IRequestCreateContact {
id?: UserID;
/** ICP principal associated with the contact _/
icp_principal: string;
/\*\* Nickname for the contact _/
name: string;
/** Avatar URL for the contact \*/
avatar?: string;
/** Notifications URL for the contact _/
notifications_url?: string;
/\*\* Email address for the contact _/
email?: string;
/** Seed phrase for the contact \*/
seed_phrase?: string;
/** Determines if a placeholder user id _/
from_placeholder_user_id?: UserID;
/\*\* EVM public address _/
evm*public_address?: string;
/** Public note about the contact \*/
public_note?: string;
/** Private note about the contact */
private*note?: string;
/\*\* Determines if placeholder */
is_placeholder?: boolean;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
}

/\*_ Create Contact Response _/
export interface IResponseCreateContact extends ISuccessResponse<ContactFE> {}

/** Update Contact Request \*/
export interface IRequestUpdateContact {
/** ID of the contact to update _/
id: UserID;
/\*\* New nickname for the contact _/
name?: string;
avatar?: string;
/** New nickname for the contact \*/
email?: string;
/** New nickname for the contact _/
notifications_url?: string;
/\*\* Public note about the contact _/
public*note?: string;
/** Private note about the contact \*/
private_note?: string;
/** EVM public address */
evm*public_address?: string;
/\*\* External identifier */
external\*id?: string;
/\*\* Additional data for external systems \_/
external_payload?: string;
}

/\*_ Update Contact Response _/
export interface IResponseUpdateContact extends ISuccessResponse<ContactFE> {}

/** Delete Contact Request \*/
export interface IRequestDeleteContact {
/** ID of the contact to delete \*/
id: UserID;
}

/** Delete Contact Response \*/
export interface IResponseDeleteContact
extends ISuccessResponse<{
/** ID of the deleted contact _/
id: UserID;
/\*\* Whether the contact was successfully deleted _/
deleted: boolean;
}> {}

/** Redeem Contact Request \*/
export interface IRequestRedeemContact {
current_user_id: UserID;
new_user_id: UserID;
redeem_code: string;
note?: string;
}
/** Redeem Contact Response \*/
export interface IResponseRedeemContact
extends ISuccessResponse<{
contact: ContactFE;
api_key: ApiKeyValue;
}> {}

// =========================================================================
// Disks Routes
// =========================================================================

/** Get Disk Request \*/
export interface IRequestGetDisk {
/** ID of the disk to retrieve \*/
disk_id: DiskID;
}

/\*_ Get Disk Response _/
export interface IResponseGetDisk extends ISuccessResponse<Disk> {}

/\*_ List Disks Request _/
export interface IRequestListDisks extends IPaginationParams {}

/\*_ List Disks Response _/
export interface IResponseListDisks
extends ISuccessResponse<IPaginatedResponse<Disk>> {}

/** Create Disk Request \*/
export interface IRequestCreateDisk {
id?: DiskID;
/** Name for the disk _/
name: string;
/\*\* Type of disk _/
disk*type: DiskTypeEnum;
/** Public note about the disk \*/
public_note?: string;
/** Private note about the disk */
private*note?: string;
/\*\* Authentication JSON for the disk */
auth_json?: string;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
endpoint?: string;
}

/\*_ Create Disk Response _/
export interface IResponseCreateDisk extends ISuccessResponse<Disk> {}

/** Update Disk Request \*/
export interface IRequestUpdateDisk {
/** ID of the disk to update _/
id: DiskID;
/\*\* New name for the disk _/
name?: string;
/** Public note about the disk \*/
public_note?: string;
/** Private note about the disk _/
private_note?: string;
/\*\* Authentication JSON for the disk _/
auth_json?: string;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
endpoint?: string;
}

/\*_ Update Disk Response _/
export interface IResponseUpdateDisk extends ISuccessResponse<Disk> {}

/** Delete Disk Request \*/
export interface IRequestDeleteDisk {
/** ID of the disk to delete \*/
id: DiskID;
}

/** Delete Disk Response \*/
export interface IResponseDeleteDisk
extends ISuccessResponse<{
/** ID of the deleted disk _/
id: DiskID;
/\*\* Whether the disk was successfully deleted _/
deleted: boolean;
}> {}

// =========================================================================
// Drives Routes
// =========================================================================

/** Get Drive Request \*/
export interface IRequestGetDrive {
/** ID of the drive to retrieve \*/
external_drive_id: DriveID;
}

/\*_ Get Drive Response _/
export interface IResponseGetDrive extends ISuccessResponse<Drive> {}

/\*_ List Drives Request _/
export interface IRequestListDrives extends IPaginationParams {}

/\*_ List Drives Response _/
export interface IResponseListDrives
extends ISuccessResponse<IPaginatedResponse<Drive>> {}

/** Create Drive Request \*/
export interface IRequestCreateDrive {
id?: DriveID;
/** Name for the drive _/
name: string;
/\*\* ICP principal _/
icp*principal: string;
/** Public note about the drive \*/
public_note?: string;
/** Private note about the drive */
private*note?: string;
/\*\* URL endpoint for the drive */
endpoint_url?: URLEndpoint;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
}

/\*_ Create Drive Response _/
export interface IResponseCreateDrive extends ISuccessResponse<Drive> {}

/** Update Drive Request \*/
export interface IRequestUpdateDrive {
/** ID of the drive to update _/
id: DriveID;
/\*\* New name for the drive _/
name?: string;
/** Public note about the drive \*/
public_note?: string;
/** Private note about the drive _/
private_note?: string;
/\*\* URL endpoint for the drive _/
endpoint_url?: URLEndpoint;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
}

/\*_ Update Drive Response _/
export interface IResponseUpdateDrive extends ISuccessResponse<Drive> {}

/** Delete Drive Request \*/
export interface IRequestDeleteDrive {
/** ID of the drive to delete \*/
id: DriveID;
}

/** Delete Drive Response \*/
export interface IResponseDeleteDrive
extends ISuccessResponse<{
/** ID of the deleted drive _/
id: DriveID;
/\*\* Whether the drive was successfully deleted _/
deleted: boolean;
}> {}

// =========================================================================
// Self Canister Routes
// =========================================================================

/** Replay Drive Request \*/
export interface IRequestReplayDrive {
/** List of state diffs to replay _/
diffs: any[];
/\*\* Notes about the replay _/
notes?: string;
}

/** Replay Drive Response \*/
export interface IResponseReplayDrive
extends ISuccessResponse<{
/** Timestamp in nanoseconds when replay completed _/
timestamp_ns: number;
/\*\* Number of diffs that were applied _/
diffs_applied: number;
/** ID of the checkpoint diff \*/
checkpoint_diff_id?: string;
/** Final state checksum after replay \*/
final_checksum: string;
}> {}

/** Search Drive Response \*/
export interface IResponseSearchDrive
extends ISuccessResponse<{
/** Search result items _/
items: SearchResult[];
/\*\* Number of items per page _/
page*size: number;
/** Total number of items \*/
total: number;
/** Current sort direction */
direction: SortDirection;
/\*\* Cursor for pagination \_/
cursor?: string;
}> {}

/** Search Drive Request Body \*/
export interface SearchDriveRequestBody {
/** Search query string _/
query: string;
/\*\* Categories to search in _/
categories?: SearchCategoryEnum[];
/** Number of items per page (1-1000) \*/
page_size?: number;
/** Pagination cursor _/
cursor?: string;
/\*\* Field to sort results by _/
sort\*by?: SearchSortByEnum;
/\*\* Sort direction \_/
direction?: SortDirection;
}

/** Reindex Drive Request \*/
export interface IRequestReindexDrive {
/** Force reindexing even if the rate limit would be exceeded \*/
force?: boolean;
}

/** Reindex Drive Response \*/
export interface IResponseReindexDrive
extends ISuccessResponse<{
/** Whether reindexing was successful _/
success: boolean;
/\*\* Timestamp when reindexing completed _/
timestamp\*ms: number;
/\*\* Number of items indexed \_/
indexed_count: number;
}> {}

export interface ExternalIDsDriveRequestBody {
/\*\*

- A list of external IDs to resolve.
- Note: The backend validation requires each external ID to be 256 characters or less.
  \*/
  external_ids: ExternalID[];
  }

/\*_ API response for resolving external IDs. _/
export type ExternalIDsDriveResponse =
ISuccessResponse<ExternalIDsDriveResponseData>;

/** Transfer Drive Ownership Request \*/
export interface IRequestTransferDriveOwnership {
/** ID of the user to transfer ownership to \*/
next_owner_id: UserID;
}

/** Transfer Drive Ownership Response \*/
export interface IResponseTransferDriveOwnership
extends ISuccessResponse<{
/** Status of the transfer request _/
status: "REQUESTED" | "COMPLETED";
/\*\* Timestamp when the transfer will be ready to complete _/
ready_ms: number;
}> {}

// =========================================================================
// Permissions by Directory Routes
// =========================================================================

/** Get Directory Permission Request \*/
export interface IRequestGetDirectoryPermission {
/** ID of the directory permission to retrieve \*/
directory_permission_id: DirectoryPermissionID;
}

/\*_ Get Directory Permission Response _/
export interface IResponseGetDirectoryPermission
extends ISuccessResponse<DirectoryPermissionFE> {}

/** List Directory Permissions Request \*/
export interface IRequestListDirectoryPermissions {
/** Filters for system permissions _/
filters: {
/\*\* Filter by resource IDs _/
resource*id: DirectoryResourceID;
};
/** Number of items per page \*/
page_size?: number;
/** Sort direction */
direction?: SortDirection;
/\*\* Cursor for pagination \_/
cursor?: string;
}

/** List Directory Permissions Response \*/
export interface IResponseListDirectoryPermissions
extends ISuccessResponse<{
/** Directory permissions matching the request _/
items: DirectoryPermissionFE[];
/\*\* Number of items per page _/
page_size: number;
/** Total number of matching permissions \*/
total: number;
/** Cursor for pagination \*/
cursor?: string;
}> {}

/** Create Directory Permission Request \*/
export interface IRequestCreateDirectoryPermission {
id?: DirectoryPermissionID;
/** ID of the resource to grant permission for _/
resource_id: DirectoryResourceID;
/\*\* ID of the user/group to grant permission to _/
granted*to?: GranteeID;
/** Types of permissions to grant \*/
permission_types: DirectoryPermissionType[];
/** When the permission becomes active */
begin*date_ms?: number;
/\*\* When the permission expires */
expiry*date_ms?: number;
/** Whether permission applies to sub-resources \*/
inheritable: boolean;
/** Note about the permission */
note?: string;
/\*\* Additional metadata for the permission \_/
metadata?: PermissionMetadata;

/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
}

/\*_ Create Directory Permission Response _/
export interface IResponseCreateDirectoryPermission
extends ISuccessResponse<{ permission: DirectoryPermissionFE }> {}

/** Update Directory Permission Request \*/
export interface IRequestUpdateDirectoryPermission {
/** ID of the permission to update _/
id: DirectoryPermissionID;
/\*\* Types of permissions to grant _/
permission*types: DirectoryPermissionType[];
/** When the permission becomes active \*/
begin_date_ms?: number;
/** When the permission expires */
expiry*date_ms?: number;
/\*\* Whether permission applies to sub-resources */
inheritable?: boolean;
/** Note about the permission \*/
note?: string;
/** Additional metadata for the permission _/
metadata?: PermissionMetadata;
/\*\* External identifier _/
external\*id?: string;
/\*\* Additional data for external systems \_/
external_payload?: string;
}

/\*_ Update Directory Permission Response _/
export interface IResponseUpdateDirectoryPermission
extends ISuccessResponse<{ permission: DirectoryPermissionFE }> {}

/** Delete Directory Permission Request \*/
export interface IRequestDeleteDirectoryPermission {
/** ID of the directory permission to delete \*/
permission_id: DirectoryPermissionID;
}

/** Delete Directory Permission Response \*/
export interface IResponseDeleteDirectoryPermission
extends ISuccessResponse<{
/** ID of the deleted directory permission \*/
deleted_id: DirectoryPermissionID;
}> {}

/** Check Directory Permissions Request \*/
export interface IRequestCheckDirectoryPermissions {
/** ID of the resource to check permissions for _/
resource_id: DirectoryResourceID;
/\*\* ID of the user/group to check permissions for _/
grantee_id: GranteeID;
}

/** Check Directory Permissions Response \*/
export interface IResponseCheckDirectoryPermissions
extends ISuccessResponse<{
/** ID of the resource checked (as string) _/
resource_id: string;
/\*\* ID of the grantee checked (as string) _/
grantee\*id: string;
/\*\* Permissions the grantee has for the resource \_/
permissions: DirectoryPermissionType[];
}> {}

/** Redeem Directory Permission Request \*/
export interface IRequestRedeemDirectoryPermission {
/** ID of the placeholder permission to redeem _/
permission_id: DirectoryPermissionID;
/\*\* ID of the user to redeem the permission for _/
user_id: UserID;
redeem_code: string;
note?: string;
}

/** Redeem Directory Permission Response \*/
export interface IResponseRedeemDirectoryPermission
extends ISuccessResponse<{
/** The redeemed permission \*/
permission: DirectoryPermissionFE;
}> {}

// =========================================================================
// Permissions by System Routes
// =========================================================================

/** Get System Permission Request \*/
export interface IRequestGetSystemPermission {
/** ID of the system permission to retrieve \*/
system_permission_id: SystemPermissionID;
}

/\*_ Get System Permission Response _/
export interface IResponseGetSystemPermission
extends ISuccessResponse<SystemPermissionFE> {}

/** List System Permissions Request \*/
export interface IRequestListSystemPermissions {
/** Filters for system permissions _/
filters?: {
/\*\* Filter by resource IDs _/
resource*ids?: string[];
/** Filter by grantee IDs \*/
grantee_ids?: GranteeID[];
/** Filter by labels */
labels?: string[];
};
/\*\* Number of items per page \_/
page_size?: number;
/** Sort direction \*/
direction?: SortDirection;
/** Cursor for pagination \*/
cursor?: string;
}

/** List System Permissions Response \*/
export interface IResponseListSystemPermissions
extends ISuccessResponse<{
/** System permissions matching the request _/
items: SystemPermissionFE[];
/\*\* Number of items per page _/
page_size: number;
/** Total number of matching permissions \*/
total: number;
/** Cursor for pagination \*/
cursor?: string;
}> {}

/** Create System Permission Request \*/
export interface IRequestCreateSystemPermission {
id?: SystemPermissionID;
/** ID of the resource to grant permission for _/
resource_id: string;
/\*\* ID of the user/group to grant permission to _/
granted*to?: string;
/** Types of permissions to grant \*/
permission_types: SystemPermissionType[];
/** When the permission becomes active */
begin*date_ms?: number;
/\*\* When the permission expires */
expiry*date_ms?: number;
/** Note about the permission \*/
note?: string;
/** Additional metadata for the permission */
metadata?: PermissionMetadata;
/\*\* External identifier _/
external_id?: string;
/\*_ Additional data for external systems \_/
external_payload?: string;
}

/\*_ Create System Permission Response _/
export interface IResponseCreateSystemPermission
extends ISuccessResponse<{ permission: SystemPermissionFE }> {}

/** Update System Permission Request \*/
export interface IRequestUpdateSystemPermission {
/** ID of the permission to update _/
id: SystemPermissionID;
/\*\* ID of the resource to grant permission for _/
resource*id?: string;
/** ID of the user/group to grant permission to \*/
granted_to?: string;
/** Types of permissions to grant */
permission*types?: SystemPermissionType[];
/\*\* When the permission becomes active */
begin*date_ms?: number;
/** When the permission expires \*/
expiry_date_ms?: number;
/** Note about the permission */
note?: string;
/\*\* Additional metadata for the permission \_/
metadata?: PermissionMetadata;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
}

/\*_ Update System Permission Response _/
export interface IResponseUpdateSystemPermission
extends ISuccessResponse<{ permission: SystemPermissionFE }> {}

/** Delete System Permission Request \*/
export interface IRequestDeleteSystemPermission {
/** ID of the system permission to delete \*/
permission_id: SystemPermissionID;
}

/** Delete System Permission Response \*/
export interface IResponseDeleteSystemPermission
extends ISuccessResponse<{
/** ID of the deleted system permission \*/
deleted_id: SystemPermissionID;
}> {}

/** Check System Permissions Request \*/
export interface IRequestCheckSystemPermissions {
/** ID of the resource to check permissions for _/
resource_id: string;
/\*\* ID of the user/group to check permissions for _/
grantee_id: string;
}

/** Check System Permissions Response \*/
export interface IResponseCheckSystemPermissions
extends ISuccessResponse<{
/** ID of the resource checked (as string) _/
resource_id: string;
/\*\* ID of the grantee checked (as string) _/
grantee\*id: string;
/\*\* Permissions the grantee has for the resource \_/
permissions: SystemPermissionType[];
}> {}

/** Redeem System Permission Request \*/
export interface IRequestRedeemSystemPermission {
/** ID of the placeholder permission to redeem _/
permission_id: SystemPermissionID;
/\*\* ID of the user to redeem the permission for _/
user_id: UserID;
redeem_code: string;
note?: string;
}

/** Redeem System Permission Response \*/
export interface IResponseRedeemSystemPermission
extends ISuccessResponse<{
/** The redeemed permission \*/
permission: SystemPermissionFE;
}> {}

// =========================================================================
// Groups Routes
// =========================================================================

/** Get Group Request \*/
export interface IRequestGetGroup {
/** ID of the group to retrieve \*/
group_id: GroupID;
}

/\*_ Get Group Response _/
export interface IResponseGetGroup extends ISuccessResponse<Group> {}

/\*_ List Groups Request _/
export interface IRequestListGroups extends IPaginationParams {}

/\*_ List Groups Response _/
export interface IResponseListGroups
extends ISuccessResponse<IPaginatedResponse<Group>> {}

/** Create Group Request \*/
export interface IRequestCreateGroup {
id?: GroupID;
/** Name for the group _/
name: string;
/\*\* Avatar for the group _/
avatar?: string;
/** Public note about the group \*/
public_note?: string;
/** Private note about the group _/
private_note?: string;
/\*\* URL endpoint for the group _/
endpoint_url?: URLEndpoint;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
}

/\*_ Create Group Response _/
export interface IResponseCreateGroup extends ISuccessResponse<Group> {}

/** Update Group Request \*/
export interface IRequestUpdateGroup {
/** ID of the group to update _/
id: GroupID;
/\*\* New name for the group _/
name?: string;
/** New avatar for the group \*/
avatar?: string;
/** Public note about the group _/
public_note?: string;
/\*\* Private note about the group _/
private*note?: string;
/** URL endpoint for the group \*/
endpoint_url?: URLEndpoint;
/** External identifier */
external*id?: string;
/\*\* Additional data for external systems */
external_payload?: string;
}

/\*_ Update Group Response _/
export interface IResponseUpdateGroup extends ISuccessResponse<Group> {}

/** Delete Group Request \*/
export interface IRequestDeleteGroup {
/** ID of the group to delete \*/
id: GroupID;
}

/** Delete Group Response \*/
export interface IResponseDeleteGroup
extends ISuccessResponse<{
/** ID of the deleted group _/
id: GroupID;
/\*\* Whether the group was successfully deleted _/
deleted: boolean;
}> {}

/** Validate Group Member Request \*/
export interface IRequestValidateGroupMember {
/** ID of the user to check _/
user_id: UserID;
/\*\* ID of the group to check _/
group_id: GroupID;
}

/** Validate Group Member Response \*/
export interface IResponseValidateGroupMember
extends ISuccessResponse<{
/** Whether the user is a member of the group _/
is_member: boolean;
/\*\* ID of the group that was checked _/
group\*id: GroupID;
/\*\* ID of the user that was checked \_/
user_id: UserID;
}> {}

// =========================================================================
// Group Invites Routes
// =========================================================================

/** Get Group Invite Request \*/
export interface IRequestGetGroupInvite {
/** ID of the group invite to retrieve \*/
invite_id: GroupInviteID;
}

/\*_ Get Group Invite Response _/
export interface IResponseGetGroupInvite
extends ISuccessResponse<GroupInvite> {}

/** List Group Invites Request \*/
export interface IRequestListGroupInvites extends IPaginationParams {
/** ID of the group to list invites for \*/
group_id: GroupID;
}

/\*_ List Group Invites Response _/
export interface IResponseListGroupInvites
extends ISuccessResponse<IPaginatedResponse<GroupInvite>> {}

/** Create Group Invite Request \*/
export interface IRequestCreateGroupInvite {
id?: GroupInviteID;
/** ID of the group for the invite _/
group_id: GroupID;
/\*\* ID of the user to invite _/
invitee*id?: UserID;
/** Role to assign to the invited user \*/
role?: GroupRole;
/** Timestamp when the invite becomes active */
active*from?: number;
/\*\* Timestamp when the invite expires */
expires*at?: number;
/** Note about the invite \*/
note?: string;
/** External identifier */
external*id?: string;
/\*\* Additional data for external systems */
external_payload?: string;
}

/\*_ Create Group Invite Response _/
export interface IResponseCreateGroupInvite
extends ISuccessResponse<GroupInvite> {}

/** Update Group Invite Request \*/
export interface IRequestUpdateGroupInvite {
/** ID of the invite to update _/
id: GroupInviteID;
/\*\* New role to assign _/
role?: GroupRole;
/** New timestamp when the invite becomes active \*/
active_from?: number;
/** New timestamp when the invite expires _/
expires_at?: number;
/\*\* New note about the invite _/
note?: string;
/** External identifier \*/
external_id?: string;
/** Additional data for external systems \*/
external_payload?: string;
}

/\*_ Update Group Invite Response _/
export interface IResponseUpdateGroupInvite
extends ISuccessResponse<GroupInvite> {}

/** Delete Group Invite Request \*/
export interface IRequestDeleteGroupInvite {
/** ID of the group invite to delete \*/
id: GroupInviteID;
}

/** Delete Group Invite Response \*/
export interface IResponseDeleteGroupInvite
extends ISuccessResponse<{
/** ID of the deleted group invite _/
id: GroupInviteID;
/\*\* Whether the group invite was successfully deleted _/
deleted: boolean;
}> {}

/** Redeem Group Invite Request \*/
export interface IRequestRedeemGroupInvite {
/** ID of the group invite to redeem _/
invite_id: GroupInviteID;
redeem_code: String;
/\*\* ID of the user to redeem the invite for _/
user_id: UserID;
note?: string;
}

/** Redeem Group Invite Response \*/
export interface IResponseRedeemGroupInvite {
/** The redeemed invite \*/
invite: GroupInvite;
}

// =========================================================================
// Labels Routes
// =========================================================================

/** Get Label Request \*/
export interface IRequestGetLabel {
/** ID or value of the label to retrieve \*/
id: LabelID | string;
}

/\*_ Get Label Response _/
export interface IResponseGetLabel extends ISuccessResponse<Label> {}

/** List Labels Request \*/
export interface IRequestListLabels {
/** Filters for labels _/
filters?: {
/\*\* Filter labels by prefix _/
prefix?: string;
};
/** Number of items per page \*/
page_size?: number;
/** Sort direction _/
direction?: SortDirection;
/\*\* Cursor for previous page _/
cursor?: string;
}

/\*_ List Labels Response _/
export interface IResponseListLabels
extends ISuccessResponse<IPaginatedResponse<Label>> {}

/** Create Label Request \*/
export interface IRequestCreateLabel {
id?: LabelID;
/** The label value (e.g., "Project-Alpha") _/
value: string;
/\*\* Description of the label _/
description?: string;
/** Color in hex format (e.g., #RRGGBB) \*/
color?: string;
/** External identifier _/
external_id?: string;
/\*\* Additional data for external systems _/
external_payload?: string;
public_note?: string;
private_note?: string;
}

/\*_ Create Label Response _/
export interface IResponseCreateLabel extends ISuccessResponse<Label> {}

/** Update Label Request \*/
export interface IRequestUpdateLabel {
/** ID of the label to update _/
id: LabelID;
/\*\* New value for the label _/
value?: string;
/** New description for the label \*/
description?: string;
/** New color in hex format (e.g., #RRGGBB) _/
color?: string;
/\*\* External identifier _/
external\*id?: string;
/\*\* Additional data for external systems \_/
external_payload?: string;
public_note?: string;
private_note?: string;
}

/\*_ Update Label Response _/
export interface IResponseUpdateLabel extends ISuccessResponse<Label> {}

/** Delete Label Request \*/
export interface IRequestDeleteLabel {
/** ID of the label to delete \*/
id: LabelID;
}

/** Delete Label Response \*/
export interface IResponseDeleteLabel
extends ISuccessResponse<{
/** ID of the deleted label _/
id: LabelID;
/\*\* Whether the label was successfully deleted _/
deleted: boolean;
}> {}

/** Label Resource Request \*/
export interface IRequestLabelResource {
/** ID of the label _/
label_id: LabelID;
/\*\* ID of the resource to label or unlabel _/
resource\*id: string;
/\*\* True to add the label, false to remove it \_/
add: boolean;
}

/** Label Resource Response \*/
export interface IResponseLabelResource
extends ISuccessResponse<{
/** Whether the operation was successful _/
success: boolean;
/\*\* Additional information about the operation _/
message?: string;
/\*_ The updated label _/
label?: Label;
}> {}

// =========================================================================
// Webhooks Routes
// =========================================================================

/** Get Webhook Request \*/
export interface IRequestGetWebhook {
/** ID of the webhook to retrieve \*/
webhook_id: WebhookID;
}

/\*_ Get Webhook Response _/
export interface IResponseGetWebhook extends ISuccessResponse<Webhook> {}

/\*_ List Webhooks Request _/
export interface IRequestListWebhooks extends IPaginationParams {}

/\*_ List Webhooks Response _/
export interface IResponseListWebhooks
extends ISuccessResponse<IPaginatedResponse<Webhook>> {}

/** Create Webhook Request \*/
export interface IRequestCreateWebhook {
id?: WebhookID;
/** Alternative index for the webhook _/
alt_index: string;
/\*\* URL to send webhook events to _/
url: string;
/** Event type to trigger the webhook \*/
event: WebhookEventLabel;
/** Name for the webhook _/
name?: string;
/\*\* Note for the webhook _/
note?: string;
/** Webhook active \*/
active?: boolean;
/** Signature for webhook verification _/
signature?: string;
/\*\* Description of the webhook _/
description?: string;
/** Filter string for events \*/
filters?: string;
/** External identifier _/
external_id?: ExternalID;
/\*\* Additional data for external integrations _/
external_payload?: ExternalPayload;
}

/\*_ Create Webhook Response _/
export interface IResponseCreateWebhook extends ISuccessResponse<Webhook> {}

/** Update Webhook Request \*/
export interface IRequestUpdateWebhook {
/** ID of the webhook to update _/
id: WebhookID;
/\*\* New URL for the webhook _/
url?: string;
/** Name for the webhook \*/
name?: string;
/** Note for the webhook _/
note?: string;
/\*\* New signature for webhook verification _/
signature?: string;
/** New description for the webhook \*/
description?: string;
/** Whether the webhook is active _/
active?: boolean;
/\*\* New filter string for events _/
filters?: string;
/** External identifier \*/
external_id?: ExternalID;
/** Additional data for external integrations \*/
external_payload?: ExternalPayload;
}

/\*_ Update Webhook Response _/
export interface IResponseUpdateWebhook extends ISuccessResponse<Webhook> {}

/** Delete Webhook Request \*/
export interface IRequestDeleteWebhook {
/** ID of the webhook to delete \*/
id: WebhookID;
}

/** Delete Webhook Response \*/
export interface IResponseDeleteWebhook
extends ISuccessResponse<{
/** ID of the deleted webhook _/
id: WebhookID;
/\*\* Whether the webhook was successfully deleted _/
deleted: boolean;
}> {}

/\*_ Superswap User Request _/
export interface IRequestSuperswapUser {
current_user_id: string;
new_user_id: string;
}

/\*_ Superswap User Response _/
export interface IResponseSuperswapUser
extends ISuccessResponse<{
success: boolean;
message: string;
}> {}

/\*_ Redeem Gift Card Request _/
export interface IRequestRedeemGiftcardSpawnOrg {
giftcard_id: GiftcardSpawnOrgID;
owner_icp_principal: ICPPrincipalString;
owner_name?: string;
organization_name?: string;
}

/\*_ Redeem Gift Card Response _/
export interface IResponseRedeemGiftcardSpawnOrg
extends ISuccessResponse<{
owner_id: UserID;
drive_id: DriveID;
endpoint_url: URLEndpoint;
redeem_code: string;
disk_auth_json?: string;
}> {}

/\*_ Redeem Org Request _/
export interface IRequestRedeemOrg {
redeem_code: string;
}

/\*_ Redeem Org Response _/
export interface IResponseRedeemOrg
extends ISuccessResponse<{
drive_id: DriveID; // spawned drive id
endpoint_url: URLEndpoint; // spawned drive url endpoint
api_key: string; // admin api key for the spawned drive
note: string; // note about the spawned drive, particularly info about the factory
admin_login_password: string; // admin login password for the spawned drive
}> {}

/\*_ Redeem Gift Card Request _/
export interface IRequestRedeemGiftcardRefuel {
giftcard_id: string;
icp_principal: string;
}

/\*_ Redeem Gift Card Response _/
export interface IResponseRedeemGiftcardRefuel
extends ISuccessResponse<{
giftcard_id: GiftcardRefuelID;
icp_principal: string;
redeem_code: string;
timestamp_ms: number;
}> {}

/\*_ Inbox Org Request _/
export interface IRequestInboxOrg {
drive_id: DriveID;
topic: string;
payload: any;
}

/\*_ Redeem Org Response _/
export interface IResponseInboxOrg
extends ISuccessResponse<{
inbox_notif_id: InboxNotifID;
drive_id: DriveID;
timestamp_ms: number;
note: string;
}> {}

export interface IResponseWhoAmI {
driveID: DriveID;
drive_nickname: string;
evm_public_address: string;
icp_principal: ICPPrincipalString;
is_owner: boolean;
nickname: string;
userID: UserID;
}

// factory routes
// Additional types to add to your existing types.ts

export interface FactoryCreateApiKeyRequestBody {
action: "CREATE";
name: string;
user_id?: string;
expires_at?: number;
external_id?: string;
external_payload?: string;
}

export interface FactoryUpdateApiKeyRequestBody {
action: "UPDATE";
id: string;
name?: string;
expires_at?: number;
is_revoked?: boolean;
external_id?: string;
external_payload?: string;
}

export type FactoryUpsertApiKeyRequestBody =
| FactoryCreateApiKeyRequestBody
| FactoryUpdateApiKeyRequestBody;

export interface FactoryDeleteApiKeyRequestBody {
id: string;
}

export interface FactoryDeletedApiKeyData {
id: string;
deleted: boolean;
}

export interface ApiResponse<T> {
ok: {
data: T;
};
}

export interface ApiError {
err: {
code: number;
message: string;
};
}

export interface FactoryStateSnapshot {
// System info
canister_id: string;
version: string;
owner_id: UserID;
endpoint_url: string;

// API keys state
apikeys_by_value: Record<string, string>;
apikeys_by_id: Record<string, FactoryApiKey>;
users_apikeys: Record<string, string[]>;
apikeys_history: string[];

// GiftcardSpawnOrg state
deployments_by_giftcard_id: Record<string, FactorySpawnHistoryRecord>;
historical_giftcards: string[];
drive_to_giftcard_hashtable: Record<string, string>;
user_to_giftcards_hashtable: Record<string, string[]>;
giftcard_by_id: Record<string, GiftcardSpawnOrg>;

// Timestamp
timestamp_ns: number;
}

export interface FactorySnapshotResponse {
status: string;
data: FactoryStateSnapshot;
timestamp: number;
}

export interface ListGiftcardRefuelsRequestBody {
filters?: string;
page_size?: number;
direction?: SortDirection;
cursor?: string;
}

export interface CreateGiftcardRefuelRequestBody {
action: "CREATE";
usd_revenue_cents: number;
note: string;
gas_cycles_included: number;
external_id: string;
}

export interface UpdateGiftcardRefuelRequestBody {
action: "UPDATE";
id: GiftcardRefuelID;
note?: string;
usd_revenue_cents?: number;
gas_cycles_included?: number;
external_id?: string;
}

export type UpsertGiftcardRefuelRequestBody =
| CreateGiftcardRefuelRequestBody
| UpdateGiftcardRefuelRequestBody;

export interface DeleteGiftcardRefuelRequestBody {
id: string;
}

export interface DeletedGiftcardRefuelData {
id: string;
deleted: boolean;
}

export interface RedeemGiftcardRefuelData {
giftcard_id: GiftcardRefuelID;
icp_principal: string;
}

export interface RedeemGiftcardRefuelResult {
giftcard_id: GiftcardRefuelID;
icp_principal: string;
redeem_code: string;
timestamp_ms: number;
}

export interface FactoryRefuelHistoryRecord {
id: string;
note: string;
giftcard_id: GiftcardRefuelID;
gas_cycles_included: number;
timestamp_ms: number;
icp_principal: string; // Corresponds to ICPPrincipalString(PublicKeyICP)
}

// Responses
export interface ListGiftcardRefuelsResponseData {
items: GiftcardRefuel[];
page_size: number;
total: number;
direction: SortDirection;
cursor: string | null;
}

export type CreateGiftcardRefuelResponse = ApiResponse<GiftcardRefuel>;
export type UpdateGiftcardRefuelResponse = ApiResponse<GiftcardRefuel>;
export type DeleteGiftcardRefuelResponse =
ApiResponse<DeletedGiftcardRefuelData>;
export type GetGiftcardRefuelResponse = ApiResponse<GiftcardRefuel>;
export type ListGiftcardRefuelsResponse =
ApiResponse<ListGiftcardRefuelsResponseData>;
export type RedeemGiftcardRefuelResponse =
ApiResponse<RedeemGiftcardRefuelResult>;

// --- GiftcardSpawnOrg Types ---
export interface ListGiftcardSpawnOrgsRequestBody {
filters?: string;
page_size?: number;
direction?: SortDirection;
cursor?: string;
}

export interface ListGiftcardSpawnOrgsResponseData {
items: GiftcardSpawnOrg[];
page_size: number;
total: number;
direction: SortDirection;
cursor: string | null;
}

export interface CreateGiftcardSpawnOrgRequestBody {
action: "CREATE";
usd_revenue_cents: number;
note: string;
gas_cycles_included: number;
external_id: string;
disk_auth_json?: string;
}

export interface UpdateGiftcardSpawnOrgRequestBody {
action: "UPDATE";
id: GiftcardSpawnOrgID;
note?: string;
usd_revenue_cents?: number;
gas_cycles_included?: number;
external_id?: string;
disk_auth_json?: string;
}

export type UpsertGiftcardSpawnOrgRequestBody =
| CreateGiftcardSpawnOrgRequestBody
| UpdateGiftcardSpawnOrgRequestBody;

export interface DeleteGiftcardSpawnOrgRequestBody {
id: GiftcardSpawnOrgID;
}

export interface DeletedGiftcardSpawnOrgData {
id: GiftcardSpawnOrgID;
deleted: boolean;
}

export interface RedeemGiftcardSpawnOrgData {
giftcard_id: GiftcardSpawnOrgID;
owner_icp_principal: string;
owner_name?: string;
organization_name?: string;
}

export interface RedeemGiftcardSpawnOrgResult {
owner_id: UserID;
drive_id: DriveID;
endpoint: string;
redeem_code: string;
disk_auth_json?: string;
}

export interface FactorySpawnHistoryRecord {
id: string;
owner_id: UserID;
drive_id: DriveID;
endpoint: string;
version: string;
note: string;
giftcard_id: GiftcardSpawnOrgID;
gas_cycles_included: number;
timestamp_ms: number;
}

export interface SpawnInitArgs {
owner: string;
title?: string;
owner_name?: string;
note?: string;
spawn_redeem_code?: string;
}

// Responses
export type CreateGiftcardSpawnOrgResponse = ApiResponse<GiftcardSpawnOrg>;
export type UpdateGiftcardSpawnOrgResponse = ApiResponse<GiftcardSpawnOrg>;
export type DeleteGiftcardSpawnOrgResponse =
ApiResponse<DeletedGiftcardSpawnOrgData>;
export type GetGiftcardSpawnOrgResponse = ApiResponse<GiftcardSpawnOrg>;
export type ListGiftcardSpawnOrgsResponse =
ApiResponse<ListGiftcardSpawnOrgsResponseData>;
export type RedeemGiftcardSpawnOrgResponse =
ApiResponse<RedeemGiftcardSpawnOrgResult>;

export interface AboutDriveResponseData {
gas_cycles: string;
organization_name: string;
organization_id: DriveID;
owner: UserID;
endpoint: string;
canister_id: string;
daily_idle_cycle_burn_rate: string;
controllers: string[];
version: string;
}

export type AboutDriveResponse = ISuccessResponse<AboutDriveResponseData>;

// src/types/core.ts

/\*\*

- OfficeX API Type Definitions
- Derived from OpenAPI v3.0.3 specification
  \*/

import { JobRun } from "../main";
import {
ApiKeyID,
ApiKeyValue,
DiskID,
DiskTypeEnum,
DriveFullFilePath,
DriveID,
EvmPublicAddress,
ExternalID,
ExternalPayload,
FileID,
FolderID,
ICPPrincipalString,
StateDiffRecordID,
SystemPermissionType,
LabelID,
LabelValue,
GroupID,
GroupInviteID,
GroupRole,
URLEndpoint,
UserID,
WebhookEventLabel,
WebhookID,
DirectoryPermissionType,
DriveClippedFilePath,
UploadStatus,
SearchResultResourceID,
FactoryApiKeyID,
GiftcardSpawnOrgID,
GiftcardRefuelID,
FileVersionID,
GroupInviteeID,
} from "./primitives";

// =========================================================================
// Auth Models
// =========================================================================

export enum AuthTypeEnum {
Signature = "SIGNATURE",
ApiKey = "API_KEY",
}

export interface Challenge {
timestamp_ms: number;
self_auth_principal: number[]; // Raw public key bytes
canonical_principal: string;
// Add other fields from your Rust Challenge if any
}

export interface SignatureProof {
auth_type: AuthTypeEnum.Signature;
challenge: Challenge;
signature: number[]; // Signature bytes
}

export interface ApiKeyProof {
auth_type: AuthTypeEnum.ApiKey;
value: string;
}

export type AuthJsonDecoded = SignatureProof | ApiKeyProof;

// =========================================================================
// Core Data Models
// =========================================================================

/\*_ File record _/
export interface FileRecord {
id: FileID;
name: string;
parent_folder_uuid: FolderID;
file_version: number;
prior_version?: FileID;
next_version?: FileID;
extension: string;
full_directory_path: DriveFullFilePath;
labels: LabelValue[];
created_by: UserID;
created_at: number;
disk_id: DiskID;
disk_type: DiskTypeEnum;
file_size: number;
raw_url: string;
last_updated_date_ms: number;
last_updated_by: UserID;
deleted: boolean;
drive_id: ICPPrincipalString;
expires_at: number;
restore_trash_prior_folder_uuid?: FolderID;
has_sovereign_permissions: boolean;
shortcut_to?: FileID;
upload_status: UploadStatus;
external_id?: ExternalID;
external_payload?: ExternalPayload;
version_id: FileVersionID;
notes?: string;
}

export interface FileRecordFE extends FileRecord {
clipped_directory_path: DriveClippedFilePath;
permission_previews: DirectoryPermissionType[];
}

/\*_ Folder record _/
export interface FolderRecord {
id: FolderID;
name: string;
parent_folder_uuid?: FolderID;
subfolder_uuids: FolderID[];
file_uuids: FileID[];
full_directory_path: DriveFullFilePath;
labels: LabelValue[];
created_by: UserID;
created_at: number;
last_updated_date_ms: number;
last_updated_by: UserID;
disk_id: DiskID;
disk_type: DiskTypeEnum;
deleted: boolean;
expires_at: number;
drive_id: DriveID;
restore_trash_prior_folder_uuid?: FolderID;
has_sovereign_permissions: boolean;
shortcut_to?: FolderID;
external_id?: ExternalID;
external_payload?: ExternalPayload;
notes?: string;
}
export interface FolderRecordFE extends FolderRecord {
clipped_directory_path: DriveClippedFilePath;
permission_previews: DirectoryPermissionType[];
}

/\*_ API key _/
export interface ApiKey {
id: ApiKeyID;
value: ApiKeyValue;
user_id: UserID;
name: string;
private_note?: string;
created_at: number;
begins_at: number;
expires_at: number;
is_revoked: boolean;
labels: LabelValue[];
external_id?: ExternalID;
external_payload?: ExternalPayload;
}

export interface ApiKeyFE extends ApiKey {
user_name?: string;
permission_previews: SystemPermissionType[];
}

/\*_ Contact _/
export interface Contact {
id: UserID;
name: string;
avatar: string;
email: string;
notifications_url: string;
public_note: string;
private_note?: string;
evm_public_address: EvmPublicAddress;
icp_principal: ICPPrincipalString;
labels: LabelValue[];
seed_phrase?: string;
from_placeholder_user_id?: UserID;
redeem_code?: string;
last_online_ms: number;
created_at: number;
external_id?: ExternalID;
external_payload?: ExternalPayload;
}

export interface ContactFE extends Contact {
group_previews: ContactGroupPreview[];
permission_previews: SystemPermissionType[];
}

export interface ContactGroupPreview {
group_id: GroupID;
invite_id: GroupInviteID;
is_admin: boolean;
group_name: string;
group_avatar?: string;
}

/\*_ Disk _/
export interface Disk {
id: DiskID;
name: string;
disk_type: DiskTypeEnum;
public_note?: string;
private_note?: string;
auth_json?: string;
labels: LabelValue[];
root_folder: FolderID;
trash_folder: FolderID;
external_id?: ExternalID;
external_payload?: ExternalPayload;
created_at: number;
endpoint?: string;
}

export interface DiskFE extends Disk {
permission_previews: SystemPermissionType[];
}

/\*_ Drive _/
export interface Drive {
id: DriveID;
name: string;
icp_principal: ICPPrincipalString;
public_note?: string;
private_note?: string;
endpoint_url: URLEndpoint;
last_indexed_ms?: number;
labels: string[];
external_id?: ExternalID;
external_payload?: ExternalPayload;
created_at: number;
}

export interface DriveFE extends Drive {
permission_previews: SystemPermissionType[];
}

/\*_ Label _/
export interface Label {
id: LabelID;
value: string;
description?: string;
color: string;
created_by: string;
created_at: number;
last_updated_at: number;
resources: any[];
labels: string[];
external_id?: ExternalID;
external_payload?: ExternalPayload;
public_note?: string;
private_note?: string;
}

export interface LabelFE extends Label {
permission_previews: SystemPermissionType[];
}

/\*_ Group _/
export interface Group {
id: GroupID;
name: string;
owner: string;
avatar: string;
public_note?: string;
private_note?: string;
admin_invites: string[];
member_invites: string[];
created_at: number;
last_modified_at: number;
drive_id: DriveID;
endpoint_url: URLEndpoint;
labels: string[];
external_id?: ExternalID;
external_payload?: ExternalPayload;
}

export interface GroupFE extends Group {
member_previews: GroupMemberPreview[];
permission_previews: SystemPermissionType[];
}

export interface GroupMemberPreview {
user_id: UserID;
name: String;
note?: String;
avatar?: String;
group_id: GroupID;
is_admin: boolean;
invite_id: GroupInviteID;
last_online_ms: number;
}

/\*_ Group invite _/
export interface GroupInvite {
id: GroupInviteID;
group_id: GroupID;
inviter_id: UserID;
invitee_id: GroupInviteeID;
role: GroupRole;
note: string;
active_from: number;
expires_at: number;
created_at: number;
last_modified_at: number;
from_placeholder_invitee?: string;
labels: LabelValue[];
redeem_code?: string;
external_id?: ExternalID;
external_payload?: ExternalPayload;
}

export interface GroupInviteFE extends GroupInvite {
group_name: String;
group_avatar?: String;
invitee_name: String;
invitee_avatar?: String;
permission_previews: SystemPermissionType[];
}

/\*_ Webhook _/
export interface Webhook {
id: WebhookID;
name: string;
url: string;
alt_index: string;
event: WebhookEventLabel;
signature: string;
description: string;
active: boolean;
filters: string;
labels: string[];
external_id?: ExternalID;
external_payload?: ExternalPayload;
created_at: number;
note?: string;
}

export interface WebhookFE extends Webhook {
permission_previews: SystemPermissionType[];
}

/\*_ Permission for directory resource frontend representation _/
export interface DirectoryResourcePermissionFE {
permission_id: string;
grant_type: string;
}

/\*_ State diff record _/
export interface StateDiffRecord {
id: StateDiffRecordID;
timestamp_ns: bigint;
notes?: string;
drive_id: DriveID;
endpoint_url: URLEndpoint;
implementation: "RUST_ICP_CANISTER" | "JAVASCRIPT_RUNTIME";
diff_forward: string;
diff_backward: string;
checksum_forward: string;
checksum_backward: string;
}

export interface FilePathBreadcrumb {
resource_id: string;
resource_name: string;
visibility_preview: BreadcrumbVisibilityPreviewEnum[];
}

export enum BreadcrumbVisibilityPreviewEnum {
PUBLIC_VIEW = "PUBLIC_VIEW",
PUBLIC_MODIFY = "PUBLIC_MODIFY",
PRIVATE_VIEW = "PRIVATE_VIEW",
PRIVATE_MODIFY = "PRIVATE_MODIFY",
}

/\*_ Search category enum _/
export enum SearchCategoryEnum {
ALL = "ALL",
FILES = "FILES",
FOLDERS = "FOLDERS",
CONTACTS = "CONTACTS",
DISKS = "DISKS",
DRIVES = "DRIVES",
GROUPS = "GROUPS",
}

/\*_ Search sort by enum _/
export enum SearchSortByEnum {
RELEVANCE = "RELEVANCE",
ALPHABETICAL = "ALPHABETICAL",
SCORE = "SCORE",
CREATED_AT = "CREATED_AT",
UPDATED_AT = "UPDATED_AT",
}

/** Search result item \*/
export interface SearchResult {
/** Title of the search result _/
title: string;
/\*\* Preview text _/
preview: string;
/** Relevance score \*/
score: number;
/** Resource ID with type information _/
resource_id: SearchResultResourceID;
/\*\* Category of the search result _/
category: SearchCategoryEnum;
metadata?: string;
created_at: number;
updated_at: number;
}

/\*_ API key _/
export interface FactoryApiKey {
id: FactoryApiKeyID;
value: ApiKeyValue;
user_id: UserID;
name: string;
created_at: number;
expires_at: number;
is_revoked: boolean;
}

export interface GiftcardSpawnOrg {
id: GiftcardSpawnOrgID;
usd_revenue_cents: number;
note: string;
gas_cycles_included: number;
timestamp_ms: number;
external_id: string;
redeemed: boolean;
disk_auth_json?: string;
}

export interface GiftcardRefuel {
id: GiftcardRefuelID;
usd_revenue_cents: number;
note: string;
gas_cycles_included: number;
timestamp_ms: number;
external_id: string;
redeemed: boolean;
}

export interface ExternalIDvsInternalIDMap {
success: boolean;
message: string;
external_id: ExternalID;
internal_ids: string[];
}

/\*_ Data structure for the response when resolving external IDs. _/
export interface ExternalIDsDriveResponseData {
results: ExternalIDvsInternalIDMap[];
}

export interface JobRunFE extends JobRun {
permission_previews: SystemPermissionType[];
}

## Disk Frontend Files

### // src/components/ContactsPage/index.tsx

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button, Drawer, Layout, Typography, Space, Input, Form } from "antd";
import type {
ContactFE,
Disk,
IRequestCreateDisk,
IRequestListDisks,
IResponseCreateDisk,
IResponseListDisks,
UserID,
} from "@officexapp/types";
import { DiskTypeEnum, SystemPermissionType } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
createDiskAction,
listDisksAction,
} from "../../redux-offline/disks/disks.actions";
import { CloseOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import ContactsAddDrawer from "./contact.add";
import ContactTab from "./contact.tab";
import ContactsTableList from "./contacts.table";
import { SAMPLE_CONTACTS } from "./sample";
import useScreenType from "react-screentype-hook";
import { useIdentitySystem } from "../../framework/identity";
import {
checkContactTablePermissionsAction,
listContactsAction,
} from "../../redux-offline/contacts/contacts.actions";
import { pastLastCheckedCacheLimit } from "../../api/helpers";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

// Define tab item type for TypeScript
type TabItem = {
key: string;
label: React.ReactNode;
children: React.ReactNode;
closable?: boolean;
};

const ContactsPage: React.FC = () => {
// Drawer state
const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
const screenType = useScreenType();
const { wrapOrgCode, currentProfile } = useIdentitySystem();
const [lastClickedId, setLastClickedId] = useState<string | null>(null);
const { tablePermissions, lastChecked } = useSelector(
(state: ReduxAppState) => ({
tablePermissions: state.contacts.tablePermissions,
lastChecked: state.contacts.lastChecked,
})
);
const dispatch = useDispatch();

// Sample contact data - expanded list
const isContentTabOpen = useCallback(
(id: string) => {
if (id === lastClickedId) {
return true;
}
return tabItemsRef.current.some((item) => item.key === id);
},
[lastClickedId]
);

// Tab state management
const [activeKey, setActiveKey] = useState<string>("list");
const [tabItems, setTabItems] = useState<TabItem[]>([
{
key: "list",
label: "Contacts List",
children: null,
closable: false,
},
]);

// Create a ref to track the current tabItems state
const tabItemsRef = useRef(tabItems);

useEffect(() => {
console.log(`contactspage last checked`, lastChecked);
if (currentProfile && pastLastCheckedCacheLimit(lastChecked)) {
dispatch(checkContactTablePermissionsAction(currentProfile.userID));
dispatch(listContactsAction({}));
}
}, [currentProfile, lastChecked]);

// Keep the ref updated with the latest tabItems state
useEffect(() => {
tabItemsRef.current = tabItems;
if (lastClickedId && !tabItems.some((item) => item.key === lastClickedId)) {
setLastClickedId(null);
}
}, [tabItems]);

// Function to handle clicking on a contact
const handleClickContentTab = useCallback(
(contact: ContactFE, focus_tab = false) => {
setLastClickedId(contact.id);
// Use the ref to access the current state
const currentTabItems = tabItemsRef.current;
console.log("Current tabItems via ref:", currentTabItems);

      const existingTabIndex = currentTabItems.findIndex(
        (item) => item.key === contact.id
      );
      console.log(`existingTabIndex`, existingTabIndex);

      if (existingTabIndex !== -1 && focus_tab == true) {
        setActiveKey(contact.id);
        return;
      }

      if (existingTabIndex !== -1) {
        // Tab already exists, remove it
        const updatedTabs = currentTabItems.filter(
          (item) => item.key !== contact.id
        );
        setTabItems(updatedTabs);
      } else {
        // Create new tab
        const newTab: TabItem = {
          key: contact.id,
          label: contact.name,
          children: (
            <ContactTab
              contactCache={contact}
              onDelete={handleDeletionCloseTabs}
            />
          ),
          closable: true,
        };

        // Insert new tab at position 1 (after list tab)
        setTabItems((prev) => {
          const updatedTabs = [...prev];
          updatedTabs.splice(1, 0, newTab);
          return updatedTabs;
        });

        // Switch to the clicked contact's tab
        if (focus_tab) {
          setActiveKey(contact.id);
        }
      }
    },
    [] // No dependencies needed since we use the ref

);

const handleDeletionCloseTabs = (userID: UserID) => {
setActiveKey("list");
const updatedTabs = tabItems.filter((item) => item.key !== userID);
setTabItems(updatedTabs);
tabItemsRef.current = updatedTabs;
};

// Handle tab change
const onTabChange = (newActiveKey: string) => {
setActiveKey(newActiveKey);
if (newActiveKey === "list") {
const newUrl = wrapOrgCode(`/resources/contacts`);
window.history.pushState({}, "", newUrl);
} else {
const newUrl = wrapOrgCode(`/resources/contacts/${newActiveKey}`);
window.history.pushState({}, "", newUrl);
}
};

// Handle tab removal
const onTabEdit = (targetKey: string, action: "add" | "remove") => {
if (action === "remove") {
// Filter out the tab being removed
const newTabs = tabItems.filter((item) => item.key !== targetKey);
setTabItems(newTabs);
tabItemsRef.current = newTabs;

      if (targetKey === lastClickedId) {
        setLastClickedId(null);
      }

      // If the active tab was removed, go back to the list tab
      if (targetKey === activeKey) {
        setActiveKey("list");
      }
    }

};

// Toggle drawer
const toggleDrawer = () => {
setDrawerOpen(!drawerOpen);
};

// The rest of your component remains the same
return (
<Layout
style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        overflowX: "hidden",
      }} >
<Content
style={{
          padding: screenType.isMobile ? "0px" : "0 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }} >

<div
style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            margin: screenType.isMobile
              ? "0px 8px 8px 16px"
              : "0px 0px 16px 16px",
          }} >
<Title
level={2}
style={{
              fontWeight: 500,
              fontSize: "24px",
              marginBottom: 0,
              color: "#262626",
            }} >
Contacts
</Title>
<Button
size={screenType.isMobile ? "small" : "middle"}
type={
screenType.isMobile && activeKey !== "list"
? "default"
: "primary"
}
icon={<PlusOutlined />}
onClick={toggleDrawer}
style={{ marginBottom: screenType.isMobile ? "8px" : 0 }}
disabled={!tablePermissions.includes(SystemPermissionType.CREATE)} >
Add Contact
</Button>
</div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            className="custom-tabs-container"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: screenType.isMobile ? "70vh" : 0, // Critical fix for flexbox scrolling
            }}
          >
            {/* Custom tab bar with pinned first tab */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #f0f0f0",
                overflow: "hidden",
              }}
            >
              {/* Pinned first tab */}
              <div
                className={`pinned-tab ${activeKey === "list" ? "active-tab" : ""}`}
                onClick={() => onTabChange("list")}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor: activeKey === "list" ? "#fff" : "#fafafa",
                  border: activeKey === "list" ? "1px solid #f0f0f0" : "none",
                  borderBottom:
                    activeKey === "list" ? "1px solid #fff" : "none",
                  borderRadius: "4px 4px 0 0",
                  marginRight: "2px",
                  zIndex: 1,
                  position: "relative",
                  fontWeight: activeKey === "list" ? "500" : "normal",
                  minWidth: "120px",
                  textAlign: "center",
                }}
              >
                Search All
              </div>

              {/* Scrollable container for the rest of the tabs */}
              <div style={{ overflow: "auto", display: "flex", flex: 1 }}>
                {tabItems.slice(1).map((item) => (
                  <div
                    key={item.key}
                    className={`scroll-tab ${activeKey === item.key ? "active-tab" : ""}`}
                    onClick={() => onTabChange(item.key)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      backgroundColor:
                        activeKey === item.key ? "#fff" : "#fafafa",
                      border:
                        activeKey === item.key ? "1px solid #f0f0f0" : "none",
                      borderBottom:
                        activeKey === item.key ? "1px solid #fff" : "none",
                      borderRadius: "4px 4px 0 0",
                      marginRight: "2px",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontWeight: activeKey === item.key ? "500" : "normal",
                    }}
                  >
                    {item.closable && (
                      <CloseOutlined
                        style={{ marginRight: "8px", fontSize: "12px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTabEdit(item.key, "remove");
                        }}
                      />
                    )}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                minHeight: screenType.isMobile ? "70vh" : 0,
                position: "relative", // Added for absolute positioning of children
              }}
            >
              {/* Render all tab content but only show the active one */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: activeKey === "list" ? "flex" : "none",
                  overflow: "hidden",
                }}
              >
                <ContactsTableList
                  isContentTabOpen={isContentTabOpen}
                  handleClickContentTab={handleClickContentTab}
                />
              </div>

              {/* Render all other tabs */}
              {tabItems
                .filter((item) => item.key !== "list")
                .map((item) => (
                  <div
                    key={item.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: activeKey === item.key ? "flex" : "none",
                      overflow: "hidden",
                    }}
                  >
                    {item.children}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Content>

      <ContactsAddDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        onAddContact={() => {}}
      />
    </Layout>

);
};

export default ContactsPage;

### src/components/ContactsPage/contact.table.tsx

import React, { useEffect, useState } from "react";
import {
Button,
Dropdown,
Input,
Space,
Table,
Avatar,
Tag,
Badge,
Menu,
List,
message,
Popover,
Result,
} from "antd";
import {
BarsOutlined,
ClockCircleOutlined,
DownOutlined,
SearchOutlined,
SortAscendingOutlined,
TeamOutlined,
UserAddOutlined,
MailOutlined,
DeleteOutlined,
RightOutlined,
SyncOutlined,
LoadingOutlined,
LockOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { shortenAddress } from "../../framework/identity/constants";
import { ContactFE, SystemPermissionType } from "@officexapp/types";
import useScreenType from "react-screentype-hook";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useDispatch, useSelector } from "react-redux";
import {
checkContactTablePermissionsAction,
listContactsAction,
} from "../../redux-offline/contacts/contacts.actions";
import { formatUserString, getLastOnlineStatus } from "../../api/helpers";
import { useIdentitySystem } from "../../framework/identity";
import { Link } from "react-router-dom";

interface ContactsTableListProps {
isContentTabOpen: (id: string) => boolean;
handleClickContentTab: (contact: ContactFE, focus_tab?: boolean) => void;
}

const ContactsTableList: React.FC<ContactsTableListProps> = ({
isContentTabOpen,
handleClickContentTab,
}) => {
const dispatch = useDispatch();
const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
const { contacts, loading, tablePermissions } = useSelector(
(state: ReduxAppState) => ({
contacts: state.contacts.contacts,
loading: state.contacts.loading,
tablePermissions: state.contacts.tablePermissions,
})
);
const { wrapOrgCode, currentProfile } = useIdentitySystem();
console.log(`look at contacts`, contacts);
const screenType = useScreenType();
const [searchText, setSearchText] = useState("");
const [filteredContacts, setFilteredContacts] = useState(contacts);
const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

// Update filtered contacts whenever search text or contacts change
useEffect(() => {
const filtered = contacts.filter((contact) =>
contact.name.toLowerCase().includes(searchText.toLowerCase())
);
setFilteredContacts(filtered);
}, [searchText, contacts]);

// Handle responsive layout
useEffect(() => {
const handleResize = () => {
const desktopView = document.getElementById("desktop-view");
const mobileView = document.getElementById("mobile-view");

      if (desktopView && mobileView) {
        if (window.innerWidth <= 768) {
          desktopView.style.display = "none";
          mobileView.style.display = "flex";
        } else {
          desktopView.style.display = "flex";
          mobileView.style.display = "none";
        }
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);

}, []);

// Handle row selection
const rowSelection = {
selectedRowKeys,
onChange: (newSelectedRowKeys: React.Key[]) => {
setSelectedRowKeys(newSelectedRowKeys);

      // // Now clicking row just selects the checkbox
      // const key = record.id;
      // const newSelectedRowKeys = selectedRowKeys.includes(key)
      //     ? selectedRowKeys.filter((k) => k !== key)
      //     : [...selectedRowKeys, key];
      // setSelectedRowKeys(newSelectedRowKeys);
    },

};

// Dropdown menu items for the Manage button
const manageMenuItems = [
{
key: "1",
icon: <UserAddOutlined />,
label: "Add to Group",
disabled: true,
},
{
key: "2",
icon: <MailOutlined />,
label: "Send Invites",
disabled: true,
},
{
key: "3",
icon: <DeleteOutlined />,
label: "Delete",
disabled: true,
},
];

// Define table columns
const columns: ColumnsType<ContactFE> = [
{
title: "Contact",
dataIndex: "name",
key: "name",
render: (\_: any, record: ContactFE) => {
const lastOnlineStatus = getLastOnlineStatus(record.last_online_ms);
return (
<Space
onClick={(e) => {
e?.stopPropagation();
handleClickContentTab(record);
}} >

<div
onClick={(e) => {
e.stopPropagation();
handleClickContentTab(record, true);
const newUrl = wrapOrgCode(`/resources/contacts/${record.id}`);
window.history.pushState({}, "", newUrl);
}} >
<Popover content={lastOnlineStatus.text}>
<Badge
// @ts-ignore
status={lastOnlineStatus.status}
dot
offset={[-3, 3]} >
<Avatar
size="default"
src={
record.avatar
? record.avatar
: `https://ui-avatars.com/api/?name=${record.name}`
}
/>
</Badge>
</Popover>
<span style={{ marginLeft: "8px" }}>{record.name}</span>
</div>
<Tag
onClick={() => {
// copy to clipboard
formatUserString(record.name, record.id);
message.success("Copied to clipboard");
}}
color="default" >
{shortenAddress(record.icp_principal)}
</Tag>
</Space>
);
},
},
// {
// title: "ID",
// dataIndex: "id",
// key: "id",
// width: 120, // Reduced width for ID column
// ellipsis: true, // Add ellipsis to handle overflow
// render: (_: string, record: ContactFE) => (
// <Tag
// onClick={() => {
// // copy to clipboard
// formatUserString(record.name, record.id);
// message.success("Copied to clipboard");
// }}
// color="default"
// >
// {shortenAddress(record.icp_principal)}
// </Tag>
// ),
// },
];

// Example items for filter dropdowns
const filterItems = [
{ key: "1", label: "Coming Soon" },
{ key: "2", label: "Coming Soon" },
{ key: "3", label: "Coming Soon" },
];

const renderMobileList = () => {
return (
<List
itemLayout="horizontal"
dataSource={filteredContacts}
renderItem={(contact: ContactFE) => (
<List.Item
style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: isContentTabOpen(contact.id)
                ? "#e6f7ff"
                : "transparent",
            }}
onClick={() => handleClickContentTab(contact, true)} >

<div
style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
              }} >
<div
style={{ display: "flex", alignItems: "center", gap: "12px" }} >
<Avatar
size="default"
src={
contact.avatar
? contact.avatar
: `https://ui-avatars.com/api/?name=${contact.name}`
}
/>
<div style={{ display: "flex", flexDirection: "column" }}>
<span style={{ fontWeight: "500" }}>{contact.name}</span>
<div
style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }} >
<Badge color="green" dot />
<span
style={{ fontSize: "10px", color: "rgba(0,0,0,0.45)" }} >
<ClockCircleOutlined style={{ marginRight: 4 }} />
Active 2h ago
</span>
</div>
</div>
</div>
<div
style={{ display: "flex", alignItems: "center", gap: "12px" }} >
<Tag color="default">{shortenAddress(contact.id)}</Tag>
<RightOutlined style={{ color: "rgba(0,0,0,0.4)" }} />
</div>
</div>
</List.Item>
)}
/>
);
};

const syncLatest = () => {
if (!currentProfile) return;
dispatch(listContactsAction({}));
dispatch(checkContactTablePermissionsAction(currentProfile.userID));
};

return (

<div
style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }} >
{/_ Header section with search and filters _/}
<div style={{ padding: "16px 16px 0 16px" }}>
{/_ We'll use a useEffect to handle responsive layout _/}
<div style={{ marginBottom: "16px" }}>
{/_ For larger screens (desktop) _/}
<div
className="desktop-view"
id="desktop-view"
style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }} >
{/_ Search input _/}
<Space direction="horizontal">
<Input
placeholder="Search Contacts..."
prefix={<SearchOutlined />}
value={searchText}
onChange={(e) => setSearchText(e.target.value)}
style={{ width: "240px" }}
/>
{loading ? (
<span>
<LoadingOutlined />
<i style={{ marginLeft: 8, color: "rgba(0,0,0,0.2)" }}>
Syncing
</i>
</span>
) : (
<SyncOutlined
onClick={() => {
message.info("Syncing latest...");
syncLatest();
}}
style={{ color: "rgba(0,0,0,0.2)" }}
/>
)}
</Space>
{/_ Filter options and manage button _/}
<div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
<Dropdown menu={{ items: filterItems, onClick: () => {} }}>
<a
onClick={(e) => e.preventDefault()}
style={{ color: "rgba(0,0,0,0.4)" }} >
<Space>
<SortAscendingOutlined /> Sort By <DownOutlined />
</Space>
</a>
</Dropdown>
<Dropdown menu={{ items: filterItems, onClick: () => {} }}>
<a
onClick={(e) => e.preventDefault()}
style={{ color: "rgba(0,0,0,0.4)" }} >
<Space>
<BarsOutlined /> Filter By <DownOutlined />
</Space>
</a>
</Dropdown>
<Dropdown menu={{ items: filterItems, onClick: () => {} }}>
<a
onClick={(e) => e.preventDefault()}
style={{ color: "rgba(0,0,0,0.4)" }} >
<Space>
<TeamOutlined /> Group By <DownOutlined />
</Space>
</a>
</Dropdown>
<Dropdown
menu={{ items: manageMenuItems }}
disabled={selectedRowKeys.length === 0} >
<Button>
Manage{" "}
{selectedRowKeys.length > 0
? `(${selectedRowKeys.length})`
: ""}
<DownOutlined />
</Button>
</Dropdown>
</div>
</div>

          {/* For mobile screens */}
          <div
            className="mobile-view"
            id="mobile-view"
            style={{
              display: "none",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Search input - always on top for mobile */}
            <Input
              placeholder="Search contacts..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />

            {/* Filter options and manage button */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      <SortAscendingOutlined /> Sort By <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>

                <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    <Space>
                      <BarsOutlined /> Filter By <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>

                {!screenType.isMobile && (
                  <Dropdown menu={{ items: filterItems, onClick: () => {} }}>
                    <a
                      onClick={(e) => e.preventDefault()}
                      style={{ color: "rgba(0,0,0,0.4)" }}
                    >
                      <Space>
                        <TeamOutlined /> Group By <DownOutlined />
                      </Space>
                    </a>
                  </Dropdown>
                )}
              </div>

              {!screenType.isMobile && (
                <Dropdown
                  menu={{ items: manageMenuItems }}
                  disabled={selectedRowKeys.length === 0}
                >
                  <Button>
                    Manage{" "}
                    {selectedRowKeys.length > 0
                      ? `(${selectedRowKeys.length})`
                      : ""}
                    <DownOutlined />
                  </Button>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      {tablePermissions.includes(SystemPermissionType.VIEW) ||
      contacts.length > 0 ? (
        <div
          style={{ flex: 1, padding: "0 16px 16px 16px", overflowY: "auto" }}
        >
          {screenType.isMobile ? (
            renderMobileList()
          ) : (
            <Table
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
                columnWidth: 50,
              }}
              columns={columns}
              dataSource={filteredContacts}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => {
                  handleClickContentTab(record, false);
                },
                style: {
                  backgroundColor: isContentTabOpen(record.id)
                    ? "#e6f7ff"
                    : "transparent",
                  cursor: "pointer",
                },
              })}
              size="middle"
            />
          )}
          <br />
          <br />
        </div>
      ) : (
        <Result
          icon={<LockOutlined />}
          title="Unauthorized"
          subTitle={
            <div>
              <span>Sorry, you are not authorized to view contacts.</span>
              <br />
              <span>Contact your organization administrator.</span>
            </div>
          }
          extra={
            <Link to={wrapOrgCode("/welcome")}>
              <Button type="primary">Back Home</Button>
            </Link>
          }
          style={{
            marginTop: screenType.isMobile ? "0vh" : "10vh",
            marginBottom: "20vh",
          }}
        />
      )}
    </div>

);
};

export default ContactsTableList;

### src/pages/DisksPage/disk.page.tsx

import { useNavigate, useParams } from "react-router-dom";
import DiskTab from "./disk.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect } from "react";
import { getDiskAction } from "../../redux-offline/disks/disks.actions";
import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const DiskPage = () => {
const dispatch = useDispatch();
const navigate = useNavigate();
const { wrapOrgCode } = useIdentitySystem();
const screenType = useScreenType();
const params = useParams();
const diskID = params.diskID;
const disk = useSelector(
(state: ReduxAppState) => state.disks.diskMap[diskID || ""]
);
useEffect(() => {
if (diskID) {
dispatch(getDiskAction(diskID));
}
}, []);
if (!disk) {
return null;
}
return (
<Layout
style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        overflowX: "hidden",
      }} >

<div
style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
        }} >
<Button
type="text"
icon={<LeftOutlined />}
onClick={() => navigate(wrapOrgCode("/resources/disks"))}
style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }} >
Search Disks
</Button>
</div>
<Content
style={{
          padding: screenType.isMobile ? "0px" : "0 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }} >
<DiskTab
diskCache={disk}
onDelete={() => {
navigate(wrapOrgCode(`/resources/disks`));
}}
/>
</Content>
</Layout>
);
};

export default DiskPage;

### src/pages/DisksPage/disk.tab.tsx

import React, { useEffect, useState } from "react";
import {
Typography,
Card,
Button,
Form,
Input,
Space,
Tag,
Row,
Col,
Tooltip,
Badge,
Popover,
message,
Tabs,
FloatButton,
Divider,
Popconfirm,
Select,
Switch,
} from "antd";
import {
EditOutlined,
TagOutlined,
ClockCircleOutlined,
DatabaseOutlined,
GlobalOutlined,
FileTextOutlined,
CopyOutlined,
InfoCircleOutlined,
DownOutlined,
UpOutlined,
CodeOutlined,
KeyOutlined,
LoadingOutlined,
SyncOutlined,
} from "@ant-design/icons";
import {
IRequestUpdateDisk,
SystemPermissionType,
DiskID,
DiskTypeEnum,
} from "@officexapp/types";
import {
LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
shortenAddress,
} from "../../framework/identity/constants";
import CodeBlock from "../../components/CodeBlock";
import useScreenType from "react-screentype-hook";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
deleteDiskAction,
getDiskAction,
updateDiskAction,
} from "../../redux-offline/disks/disks.actions";
import { DiskFEO } from "../../redux-offline/disks/disks.reducer";
import { useNavigate } from "react-router-dom";
import {
defaultBrowserCacheDiskID,
defaultTempCloudSharingDiskID,
} from "../../api/dexie-database";
import TagCopy from "../../components/TagCopy";
import { generateRedeemDiskGiftCardURL } from "./disk.redeem";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Define the props for the DiskTab component
interface DiskTabProps {
diskCache: DiskFEO;
onSave?: (updatedDisk: Partial<DiskFEO>) => void;
onDelete?: (diskID: DiskID) => void;
}

const DiskTab: React.FC<DiskTabProps> = ({ diskCache, onSave, onDelete }) => {
const dispatch = useDispatch();
const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
const [isEditing, setIsEditing] = useState(false);
const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
const [showCodeSnippets, setShowCodeSnippets] = useState(false);
const [form] = Form.useForm();
const screenType = useScreenType();
const navigate = useNavigate();
const [giftLink, setGiftLink] = useState("");
const disk =
useSelector((state: ReduxAppState) => state.disks.diskMap[diskCache.id]) ||
diskCache;

useEffect(() => {
const \_showCodeSnippets = localStorage.getItem(
LOCAL_STORAGE_TOGGLE_REST_API_DOCS
);
if (\_showCodeSnippets === "true") {
setShowCodeSnippets(true);
}
}, []);

const toggleEdit = () => {
if (isEditing) {
form.resetFields();
}
setIsEditing(!isEditing);
};

const handleSave = () => {
form.validateFields().then((values) => {
// Determine which fields have changed
const changedFields: IRequestUpdateDisk = { id: disk.id as DiskID };

      // Define the specific fields we care about
      const fieldsToCheck: (keyof IRequestUpdateDisk)[] = [
        "name",
        "public_note",
        "private_note",
        "auth_json",
        "external_id",
        "external_payload",
        "endpoint",
      ];

      // Only check the fields we care about
      fieldsToCheck.forEach((field) => {
        // Skip if the field isn't in values
        if (!(field in values)) return;

        const valueFromForm = values[field];
        const originalValue = disk[field as keyof DiskFEO];

        // Only include fields that have changed
        if (valueFromForm !== originalValue) {
          // Handle empty strings - don't include them if they're just empty strings replacing undefined/null
          if (valueFromForm === "" && !originalValue) {
            return;
          }

          changedFields[field] = valueFromForm;
        }
      });

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length > 1 && changedFields.id) {
        // More than just the ID
        // Dispatch the update action if we're online
        dispatch(
          updateDiskAction({
            ...changedFields,
          })
        );

        message.success(
          isOnline
            ? "Updating disk..."
            : "Queued disk update for when you're back online"
        );

        // Call the onSave prop if provided (for backward compatibility)
        if (onSave) {
          onSave(changedFields);
        }
      } else {
        message.info("No changes detected");
      }

      setIsEditing(false);
    });

};

const formatDate = (timestamp: number) => {
return new Date(timestamp).toLocaleDateString("en-US", {
year: "numeric",
month: "long",
day: "numeric",
});
};

const copyToClipboard = (text: string) => {
navigator.clipboard.writeText(text);
message.success("Copied to clipboard");
};

const renderReadOnlyField = (
label: string,
value: string,
icon: React.ReactNode,
navigationRoute?: string
) => {
const handleClick = (e: React.MouseEvent) => {
if (navigationRoute) {
if (e.ctrlKey || e.metaKey) {
// Open in a new tab with the full URL
const url = `${window.location.origin}${navigationRoute}`;
window.open(url, "\_blank");
} else {
// Navigate using React Router
navigate(navigationRoute);
}
} else {
// Default behavior if no navigation route is provided
copyToClipboard(value);
}
};
if (label === "Auth JSON") {
return (
<Input.Password
readOnly
onClick={handleClick}
value={value}
style={{
            marginBottom: 8,
            backgroundColor: "#fafafa",
            cursor: "pointer",
          }}
variant="borderless"
addonBefore={

<div
style={{
                width: screenType.isMobile ? 120 : 90,
                display: "flex",
                alignItems: "center",
              }} >
{icon}
<span style={{ marginLeft: 8 }}>{label}</span>
</div>
}
suffix={
<Tooltip title="Copy to clipboard">
<CopyOutlined
onClick={() => copyToClipboard(value)}
style={{ cursor: "pointer", color: "#1890ff" }}
/>
</Tooltip>
}
/>
);
}
return (
<Input
readOnly
onClick={handleClick}
value={value}
style={{
          marginBottom: 8,
          backgroundColor: "#fafafa",
          cursor: "pointer",
        }}
variant="borderless"
addonBefore={
<div
style={{
              width: screenType.isMobile ? 120 : 90,
              display: "flex",
              alignItems: "center",
            }} >
{icon}
<span style={{ marginLeft: 8 }}>{label}</span>
</div>
}
suffix={
<Tooltip title="Copy to clipboard">
<CopyOutlined
onClick={() => copyToClipboard(value)}
style={{ cursor: "pointer", color: "#1890ff" }}
/>
</Tooltip>
}
/>
);
};

const getDiskTypeLabel = (type: DiskTypeEnum) => {
switch (type) {
case DiskTypeEnum.LocalSSD:
return "Physical SSD";
case DiskTypeEnum.AwsBucket:
return "Amazon Bucket";
case DiskTypeEnum.StorjWeb3:
return "StorjWeb3 Bucket";
case DiskTypeEnum.BrowserCache:
return "Offline Browser";
case DiskTypeEnum.IcpCanister:
return "ICP Canister";
default:
return "Unknown";
}
};

if (!disk) return null;

const initialValues = {
name: disk.name,
disk_type: disk.disk_type,
auth_json: disk.auth_json || "",
public_note: disk.public_note || "",
private_note: disk.private_note || "",
external_id: disk.external_id || "",
external_payload: disk.external_payload || "",
endpoint: disk.endpoint || "",
};

const renderCodeSnippets = () => {
const jsCode_GET = `function getDisk(id) {\n  return fetch(\`/disks/get/\${id}\`, {\n method: 'GET',\n headers: {\n 'Content-Type': 'application/json',\n },\n }).then(response => response.json());\n}`;
    const jsCode_CREATE = `function createDisk(diskData) {\n return fetch('/disks/create', {\n method: 'POST',\n headers: {\n 'Content-Type': 'application/json',\n },\n body: JSON.stringify(diskData),\n }).then(response => response.json());\n}`;
    const jsCode_UPDATE = `function updateDisk(diskData) {\n return fetch('/disks/update', {\n method: 'POST',\n headers: {\n 'Content-Type': 'application/json',\n },\n body: JSON.stringify(diskData),\n }).then(response => response.json());\n}`;
    const jsCode_DELETE = `function deleteDisk(id) {\n return fetch('/disks/delete', {\n method: 'POST',\n headers: {\n 'Content-Type': 'application/json',\n },\n body: JSON.stringify({ id }),\n }).then(response => response.json());\n}`;
    const jsCode_LIST = `function listDisks(params) {\n return fetch('/disks/list', {\n method: 'POST',\n headers: {\n 'Content-Type': 'application/json',\n },\n body: JSON.stringify(params),\n }).then(response => response.json());\n}`;

    return (
      <Card
        bordered={false}
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          height: "100%",
        }}
        title="API Reference"
      >
        <Tabs defaultActiveKey="javascript">
          <Tabs.TabPane tab="JavaScript" key="javascript">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <CodeBlock
                code={jsCode_GET}
                language="javascript"
                title="GET Disk"
              />
              <CodeBlock
                code={jsCode_CREATE}
                language="javascript"
                title="CREATE Disk"
              />
              <CodeBlock
                code={jsCode_UPDATE}
                language="javascript"
                title="UPDATE Disk"
              />
              <CodeBlock
                code={jsCode_DELETE}
                language="javascript"
                title="DELETE Disk"
              />
              <CodeBlock
                code={jsCode_LIST}
                language="javascript"
                title="LIST Disks"
              />
            </Space>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Prompt" key="prompt"></Tabs.TabPane>
          <Tabs.TabPane tab="Python" key="python"></Tabs.TabPane>
          <Tabs.TabPane tab="CURL" key="curl"></Tabs.TabPane>
        </Tabs>
      </Card>
    );

};

const syncLatest = () => {
dispatch(getDiskAction(disk.id));
};

const generateGiftLink = async () => {
try {
// Construct the gift card parameters from form values
const giftParams = {
name: `Gift - ${disk.name}`,
disk_type: disk.disk_type,
public_note: disk.public_note || "",
auth_json: disk.auth_json || "",
endpoint: disk.endpoint || "",
};

      // Generate the URL
      const url = generateRedeemDiskGiftCardURL(giftParams);

      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      message.success(`Gift link copied to clipboard!`);
      setGiftLink(url);
    } catch (error) {
      console.error("Error generating gift link:", error);
      message.error("Please fill in at least the name and disk type fields");
    }

};

return (

<div
style={{
        padding: "0",
        height: "100%",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
      }} >
<Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
<Col>
{/_ Empty col for spacing _/}
<p></p>
</Col>
<Col>
<Space>
{isEditing ? (
<>
<Button
size={screenType.isMobile ? "small" : "middle"}
onClick={toggleEdit}
type="default" >
Cancel
</Button>
<Button
size={screenType.isMobile ? "small" : "middle"}
onClick={handleSave}
type="primary" >
Save Changes
</Button>
</>
) : (
<>
<Button
icon={<EditOutlined />}
onClick={toggleEdit}
type="primary"
size={screenType.isMobile ? "small" : "middle"}
ghost
disabled={
!disk.permission_previews.includes(
SystemPermissionType.EDIT
)
} >
Edit
</Button>
</>
)}
</Space>
</Col>
</Row>

      <Row gutter={16}>
        <Col span={showCodeSnippets && !screenType.isMobile ? 16 : 24}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
          >
            {isEditing ? (
              <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input
                    placeholder="Disk name"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                <Form.Item
                  name="disk_type"
                  label="Disk Type"
                  rules={[
                    { required: true, message: "Please select disk type" },
                  ]}
                >
                  <Select
                    disabled
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    <Option value={DiskTypeEnum.BrowserCache}>
                      Offline Browser
                    </Option>
                    <Option value={DiskTypeEnum.AwsBucket}>Amazon S3</Option>
                    <Option value={DiskTypeEnum.LocalSSD}>Physical SSD</Option>
                    <Option value={DiskTypeEnum.AwsBucket}>
                      Amazon Bucket
                    </Option>
                    <Option value={DiskTypeEnum.StorjWeb3}>
                      StorjWeb3 Bucket
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item name="public_note" label="Public Note">
                  <TextArea
                    rows={6}
                    placeholder="Public information about this disk"
                    variant="borderless"
                    style={{ backgroundColor: "#fafafa" }}
                  />
                </Form.Item>

                {disk.permission_previews.includes(
                  SystemPermissionType.EDIT
                ) && (
                  <>
                    <Form.Item name="endpoint" label="Endpoint URL">
                      <Input
                        prefix={<GlobalOutlined />}
                        placeholder="URL for disk billing and info"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="private_note"
                      label="Private Note"
                      extra="Only organization owners and editors can view this note"
                    >
                      <TextArea
                        rows={6}
                        placeholder="Private notes (only visible to owners and editors)"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>

                    {disk.disk_type !== DiskTypeEnum.BrowserCache && (
                      <Form.Item
                        name="auth_json"
                        label="Authentication JSON"
                        extra="Authentication information for cloud storage"
                      >
                        <TextArea
                          rows={4}
                          placeholder='{"key": "value", ...}'
                          variant="borderless"
                          style={{ backgroundColor: "#fafafa" }}
                        />
                      </Form.Item>
                    )}

                    <Form.Item name="external_id" label="External ID">
                      <Input
                        placeholder="External identifier"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>

                    <Form.Item name="external_payload" label="External Payload">
                      <TextArea
                        rows={2}
                        placeholder="Additional data for external systems"
                        variant="borderless"
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>
                  </>
                )}

                <Divider />
                <Form.Item name="delete">
                  <Popconfirm
                    title="Are you sure you want to delete this disk?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                      dispatch(deleteDiskAction({ id: disk.id }));
                      message.success(
                        isOnline
                          ? "Deleting disk..."
                          : "Queued disk delete for when you're back online"
                      );
                      if (onDelete) {
                        onDelete(disk.id);
                      }
                    }}
                  >
                    <Button
                      disabled={
                        !disk.permission_previews.includes(
                          SystemPermissionType.DELETE
                        )
                      }
                      ghost
                      type="primary"
                      danger
                    >
                      Delete Disk
                    </Button>
                  </Popconfirm>
                </Form.Item>
              </Form>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space
                      align="center"
                      size={16}
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Space align="center" size={16}>
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            backgroundColor: "#1890ff",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: "28px",
                          }}
                        >
                          <DatabaseOutlined />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            height: "64px",
                            marginTop: screenType.isMobile ? "-32px" : 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "2px",
                            }}
                          >
                            <Title
                              level={3}
                              style={{ marginBottom: 0, marginRight: "12px" }}
                            >
                              {disk.name}
                            </Title>
                            {disk.id === defaultBrowserCacheDiskID ||
                            disk.id === defaultTempCloudSharingDiskID ? (
                              <Tag color="blue">Temp</Tag>
                            ) : (
                              <TagCopy id={disk.id} />
                            )}
                            <div style={{ marginTop: "0px" }}>
                              {disk.isLoading ? (
                                <span>
                                  <LoadingOutlined />
                                  <i
                                    style={{
                                      marginLeft: 8,
                                      color: "rgba(0,0,0,0.2)",
                                    }}
                                  >
                                    Syncing
                                  </i>
                                </span>
                              ) : (
                                <SyncOutlined
                                  onClick={() => {
                                    message.info("Syncing latest...");
                                    syncLatest();
                                  }}
                                  style={{ color: "rgba(0,0,0,0.2)" }}
                                />
                              )}
                            </div>
                          </div>
                          <Space>
                            <Text type="secondary">
                              {getDiskTypeLabel(disk.disk_type)}
                            </Text>
                          </Space>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {/* Always displayed fields */}

                    {!screenType.isMobile && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {disk.labels &&
                          disk.labels.map((label, index) => (
                            <Tag
                              key={index}
                              style={{ marginBottom: 4, marginLeft: 4 }}
                            >
                              {label}
                            </Tag>
                          ))}
                      </div>
                    )}

                    <div
                      style={{
                        marginBottom: screenType.isMobile ? 8 : 16,
                        marginTop: screenType.isMobile
                          ? 16
                          : disk.labels && disk.labels.length > 0
                            ? 0
                            : 32,
                      }}
                    >
                      <Card size="small" style={{ marginTop: 8 }}>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        {disk.public_note || "No public note available"}
                      </Card>
                    </div>

                    {screenType.isMobile && disk.labels && (
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {disk.labels.map((label, index) => (
                          <Tag
                            key={index}
                            style={{ marginBottom: 4, marginLeft: 4 }}
                          >
                            {label}
                          </Tag>
                        ))}
                      </div>
                    )}

                    {/* Advanced section with details */}
                    <details
                      style={{ marginTop: "16px" }}
                      open={isAdvancedOpen}
                      onToggle={(e) => setIsAdvancedOpen(e.currentTarget.open)}
                    >
                      <summary
                        style={{
                          cursor: "pointer",
                          color: "#595959",
                          fontSize: "14px",
                          marginBottom: "8px",
                          userSelect: "none",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Advanced &nbsp;
                        {screenType.isMobile ? null : isAdvancedOpen ? (
                          <UpOutlined />
                        ) : (
                          <DownOutlined />
                        )}
                      </summary>

                      <div style={{ padding: "8px 0" }}>
                        {renderReadOnlyField(
                          "Disk ID",
                          disk.id,
                          <DatabaseOutlined />
                        )}

                        {disk.auth_json &&
                          disk.permission_previews.includes(
                            SystemPermissionType.EDIT
                          ) &&
                          renderReadOnlyField(
                            "Auth JSON",
                            disk.auth_json,
                            <KeyOutlined />
                          )}

                        {disk.endpoint &&
                          renderReadOnlyField(
                            "Billing",
                            disk.endpoint,
                            <GlobalOutlined />
                          )}

                        {disk.private_note &&
                          disk.permission_previews.includes(
                            SystemPermissionType.EDIT
                          ) && (
                            <div style={{ marginTop: "16px" }}>
                              <Space align="center">
                                <Text strong>Private Note:</Text>
                                <Popover
                                  content="Only organization owners and editors can view this note"
                                  trigger="hover"
                                >
                                  <InfoCircleOutlined
                                    style={{ color: "#1890ff" }}
                                  />
                                </Popover>
                              </Space>
                              <Card
                                size="small"
                                style={{
                                  marginTop: 8,
                                  backgroundColor: "#fafafa",
                                }}
                              >
                                <FileTextOutlined style={{ marginRight: 8 }} />
                                {disk.private_note}
                              </Card>
                            </div>
                          )}

                        {disk.auth_json &&
                          disk.permission_previews.includes(
                            SystemPermissionType.EDIT
                          ) && (
                            <Input
                              value={giftLink}
                              readOnly
                              suffix={
                                <span
                                  onClick={() => {
                                    navigator.clipboard.writeText(giftLink);
                                    message.success("Copied to clipboard");
                                  }}
                                  style={{ cursor: "pointer" }}
                                >
                                  <CopyOutlined
                                    style={{
                                      cursor: "pointer",
                                      margin: "0px 8px",
                                    }}
                                  />
                                  Copy
                                </span>
                              }
                              prefix={
                                <Button
                                  size="small"
                                  type="dashed"
                                  onClick={generateGiftLink}
                                >
                                  Share Gift Link
                                </Button>
                              }
                              style={{ marginTop: 8, marginBottom: 8 }}
                            />
                          )}

                        <div style={{ marginTop: "16px" }}>
                          <Space align="center">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Created on {formatDate(disk.created_at)}
                            </Text>
                          </Space>
                          {disk.external_id && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External ID: {disk.external_id}
                              </Text>
                            </div>
                          )}
                          {disk.external_payload && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                External Payload: {disk.external_payload}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Col>

        {/* Conditional rendering of code snippets column */}
        {showCodeSnippets && !screenType.isMobile && (
          <Col span={8}>{renderCodeSnippets()}</Col>
        )}
      </Row>

      {/* FloatButton for View Code at bottom right corner */}
      {!screenType.isMobile && !showCodeSnippets && (
        <FloatButton
          icon={<CodeOutlined />}
          type="default"
          tooltip="View Code"
          onClick={() => {
            setShowCodeSnippets(true);
            localStorage.setItem(
              LOCAL_STORAGE_TOGGLE_REST_API_DOCS,
              JSON.stringify(true)
            );
          }}
          style={{ right: 24, bottom: 64 }}
        />
      )}
      <br />
      <br />
    </div>

);
};

export default DiskTab;

### src/pages/DisksPage/disk.add.tsx

import React, { useState, useEffect } from "react";
import {
Button,
Drawer,
Typography,
Input,
Form,
Space,
Tag,
Tooltip,
Select,
message,
Switch,
Divider,
Popover,
} from "antd";
import {
DatabaseOutlined,
TagOutlined,
InfoCircleOutlined,
GlobalOutlined,
FileTextOutlined,
KeyOutlined,
CopyOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
IRequestCreateDisk,
DiskTypeEnum,
GenerateID,
} from "@officexapp/types";
import {
createDiskAction,
listDisksAction,
} from "../../redux-offline/disks/disks.actions";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { generateRedeemDiskGiftCardURL } from "./disk.redeem";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DisksAddDrawerProps {
open: boolean;
onClose: () => void;
onAddDisk: (diskData: IRequestCreateDisk) => void;
}

const DisksAddDrawer: React.FC<DisksAddDrawerProps> = ({
open,
onClose,
onAddDisk,
}) => {
const dispatch = useDispatch();
const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
const [loading, setLoading] = useState(false);
const [form] = Form.useForm();
const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
const [displayedName, setDisplayedName] = useState("");
const [diskType, setDiskType] = useState<DiskTypeEnum>(
DiskTypeEnum.AwsBucket
);
const [labels, setLabels] = useState<string[]>([]);
const [inputVisible, setInputVisible] = useState(false);
const [inputValue, setInputValue] = useState("");
const [formChanged, setFormChanged] = useState(false);
const [giftLink, setGiftLink] = useState("");

// Reset form when drawer opens
useEffect(() => {
if (open) {
form.resetFields();
setIsAdvancedOpen(false);
setDisplayedName("");
setDiskType(DiskTypeEnum.AwsBucket);
setLabels([]);
setInputVisible(false);
setInputValue("");
setFormChanged(false);
}
}, [open, form]);

// Handle name change
const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const value = e.target.value;
setDisplayedName(value);
form.setFieldsValue({ name: value });
setFormChanged(true);
};

// Handle disk type change
const handleDiskTypeChange = (value: DiskTypeEnum) => {
setDiskType(value);
setFormChanged(true);
};

// Check if auth JSON field should be shown
const shouldShowAuthJson = () => {
return (
diskType === DiskTypeEnum.StorjWeb3 || diskType === DiskTypeEnum.AwsBucket
);
};

// Labels management
const handleClose = (removedLabel: string) => {
const newLabels = labels.filter((label) => label !== removedLabel);
setLabels(newLabels);
setFormChanged(true);
};

const showInput = () => {
setInputVisible(true);
};

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setInputValue(e.target.value);
};

const handleInputConfirm = () => {
if (inputValue && !labels.includes(inputValue)) {
setLabels([...labels, inputValue]);
}
setInputVisible(false);
setInputValue("");
setFormChanged(true);
};

const handleAddDisk = () => {
form
.validateFields()
.then((values) => {
// Create disk data from form values
const diskData: IRequestCreateDisk = {
id: GenerateID.Disk(),
name: values.name,
disk_type: values.diskType,
public_note: values.publicNote || "",
private_note: values.privateNote || "",
auth_json: values.authJson || undefined,
external_id: values.externalId || undefined,
external_payload: values.externalPayload || undefined,
endpoint: values.endpoint || undefined,
};

        setLoading(true);

        // Dispatch the create disk action
        dispatch(createDiskAction(diskData));

        message.success(
          isOnline
            ? "Creating disk..."
            : "Queued disk creation for when you're back online"
        );

        message.success(`Page will refresh upon successful disk creation...`);

        // Call the parent's onAddDisk for any additional handling
        onAddDisk(diskData);

        // Close the drawer
        onClose();

        setLoading(false);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        setLoading(false);
      });

};

const generateGiftLink = async () => {
try {
// Get current form values
const formValues = await form.validateFields();

      // Construct the gift card parameters from form values
      const giftParams = {
        name: formValues.name || displayedName,
        disk_type: formValues.diskType || diskType,
        public_note: formValues.publicNote || "",
        auth_json: formValues.authJson || "",
        endpoint: formValues.endpoint || "",
      };

      // Generate the URL
      const url = generateRedeemDiskGiftCardURL(giftParams);

      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      message.success(`Gift link copied to clipboard!`);
      setGiftLink(url);
    } catch (error) {
      console.error("Error generating gift link:", error);
      message.error("Please fill in at least the name and disk type fields");
    }

};

return (
<Drawer
title="Add New Disk"
placement="right"
onClose={onClose}
open={open}
width={500}
footer={

<div style={{ textAlign: "right" }}>
<Button size="large" onClick={onClose} style={{ marginRight: 8 }}>
Cancel
</Button>
<Button
onClick={handleAddDisk}
type="primary"
size="large"
loading={loading}
disabled={!displayedName || loading} >
Add Disk
</Button>
</div>
} >
<Form
form={form}
layout="vertical"
initialValues={{
          name: "",
          diskType: DiskTypeEnum.AwsBucket,
          publicNote: "",
          privateNote: "",
          authJson: "",
          externalId: "",
          externalPayload: "",
          endpoint: "",
        }} >
<Form.Item
name="diskType"
label={
<Tooltip title="Type of disk storage">
<Space>
Disk Type <InfoCircleOutlined style={{ color: "#aaa" }} />
</Space>
</Tooltip>
}
required >
<Select
placeholder="Select disk type"
onChange={handleDiskTypeChange}
value={diskType}
variant="borderless"
style={{ backgroundColor: "#fafafa" }} >
<Option value={DiskTypeEnum.LocalSSD}>Physical SSD</Option>
<Option value={DiskTypeEnum.StorjWeb3}>StorjWeb3 Bucket</Option>
<Option value={DiskTypeEnum.AwsBucket}>Amazon Bucket</Option>
</Select>
</Form.Item>

        <Form.Item
          name="name"
          label={
            <Tooltip title="Name for the disk">
              <Space>
                Name <InfoCircleOutlined style={{ color: "#aaa" }} />
              </Space>
            </Tooltip>
          }
          required
        >
          <Input
            prefix={<DatabaseOutlined />}
            size="large"
            placeholder="Enter disk name"
            onChange={handleNameChange}
            variant="borderless"
            style={{ backgroundColor: "#fafafa" }}
          />
        </Form.Item>

        {shouldShowAuthJson() && (
          <Form.Item
            name="authJson"
            label={
              <Tooltip title="Authentication JSON for cloud storage">
                <Space>
                  Auth JSON <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              placeholder='{"key": "value", ...}'
              rows={4}
              onChange={() => setFormChanged(true)}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>
        )}

        {/* Advanced Section */}
        <details
          style={{ marginTop: "16px" }}
          open={isAdvancedOpen}
          onToggle={(e) => setIsAdvancedOpen(e.currentTarget.open)}
        >
          <summary
            style={{
              cursor: "pointer",
              color: "#595959",
              fontSize: "14px",
              marginBottom: "8px",
              userSelect: "none",
            }}
          >
            Advanced Details
          </summary>

          <Form.Item
            name="publicNote"
            label={
              <Tooltip title="Public information about this disk">
                <Space>
                  Public Note <InfoCircleOutlined style={{ color: "#aaa" }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              placeholder="Public information about this disk"
              rows={2}
              onChange={() => setFormChanged(true)}
              variant="borderless"
              style={{ backgroundColor: "#fafafa" }}
            />
          </Form.Item>

          <div style={{ padding: "12px 0" }}>
            <Form.Item
              name="privateNote"
              label={
                <Tooltip title="Private notes for this disk (only visible to you)">
                  <Space>
                    Private Note{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="Private notes (only visible to you)"
                rows={2}
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Tooltip title="Labels to categorize this disk">
                  <Space>
                    Labels <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {labels.map((label) => (
                  <Tag
                    key={label}
                    closable
                    onClose={() => handleClose(label)}
                    style={{ marginRight: 3 }}
                  >
                    {label}
                  </Tag>
                ))}
                {inputVisible ? (
                  <Input
                    type="text"
                    size="small"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                    autoFocus
                    variant="borderless"
                    style={{ width: 78, backgroundColor: "#fafafa" }}
                  />
                ) : (
                  <Tag onClick={showInput} style={{ cursor: "pointer" }}>
                    <TagOutlined /> New Label
                  </Tag>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="endpoint"
              label={
                <Tooltip title="URL for info about this disk, including billing">
                  <Space>
                    Endpoint URL{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                prefix={<GlobalOutlined />}
                placeholder="Service endpoint URL"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="externalId"
              label={
                <Tooltip title="External identifier for integration with other systems">
                  <Space>
                    External ID <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <Input
                placeholder="External identifier"
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>

            <Form.Item
              name="externalPayload"
              label={
                <Tooltip title="Additional data for external systems">
                  <Space>
                    External Payload{" "}
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Space>
                </Tooltip>
              }
            >
              <TextArea
                placeholder="JSON payload for external systems"
                rows={2}
                onChange={() => setFormChanged(true)}
                variant="borderless"
                style={{ backgroundColor: "#fafafa" }}
              />
            </Form.Item>
            <Divider />
            <Popover
              content={`You can share this link with a friend for them to redeem the disk. You do not need to click "Add Disk"`}
            >
              <p style={{ color: "rgba(0, 0, 0, 0.4)" }}>
                Optional: Instead of adding this disk to your organization, you
                can gift it to a friend with a magic link to redeem.
              </p>
              <Input
                value={giftLink}
                readOnly
                suffix={
                  <CopyOutlined
                    onClick={() => {
                      navigator.clipboard.writeText(giftLink);
                      message.success("Copied to clipboard");
                    }}
                  />
                }
                prefix={
                  <Button size="small" type="dashed" onClick={generateGiftLink}>
                    Generate Gift Link
                  </Button>
                }
              />
            </Popover>
          </div>
        </details>
      </Form>
    </Drawer>

);
};

export default DisksAddDrawer;

### src/redux-offline/disks/disks.actions.ts

// src/redux-offline/disks/disks.actions.ts

import {
DiskID,
DiskTypeEnum,
DriveID,
GenerateID,
IRequestCreateDisk,
IRequestDeleteDisk,
IRequestListDisks,
IRequestUpdateDisk,
UserID,
} from "@officexapp/types";
import { v4 as uuidv4 } from "uuid";

export const GET_DISK = "GET_DISK";
export const GET_DISK_COMMIT = "GET_DISK_COMMIT";
export const GET_DISK_ROLLBACK = "GET_DISK_ROLLBACK";

export const LIST_DISKS = "LIST_DISKS";
export const LIST_DISKS_COMMIT = "LIST_DISKS_COMMIT";
export const LIST_DISKS_ROLLBACK = "LIST_DISKS_ROLLBACK";

export const CREATE_DISK = "CREATE_DISK";
export const CREATE_DISK_COMMIT = "CREATE_DISK_COMMIT";
export const CREATE_DISK_ROLLBACK = "CREATE_DISK_ROLLBACK";

export const UPDATE_DISK = "UPDATE_DISK";
export const UPDATE_DISK_COMMIT = "UPDATE_DISK_COMMIT";
export const UPDATE_DISK_ROLLBACK = "UPDATE_DISK_ROLLBACK";

export const DELETE_DISK = "DELETE_DISK";
export const DELETE_DISK_COMMIT = "DELETE_DISK_COMMIT";
export const DELETE_DISK_ROLLBACK = "DELETE_DISK_ROLLBACK";

export const CHECK_DISKS_TABLE_PERMISSIONS = "CHECK_DISKS_TABLE_PERMISSIONS";
export const CHECK_DISKS_TABLE_PERMISSIONS_COMMIT =
"CHECK_DISKS_TABLE_PERMISSIONS_COMMIT";
export const CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK =
"CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK";

// Get Disk
export const getDiskAction = (id: DiskID) => ({
type: GET_DISK,
meta: {
optimisticID: id,
offline: {
// Define the effect (the API call to make)
effect: {
url: `/disks/get/${id}`,
method: "GET",
headers: {
"Content-Type": "application/json",
// Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
},
data: {},
},
// Action to dispatch on success
commit: { type: GET_DISK_COMMIT },
// Action to dispatch on failure
rollback: { type: GET_DISK_ROLLBACK },
},
},
});

// List Disks
export const listDisksAction = (payload: IRequestListDisks) => ({
type: LIST_DISKS,
meta: {
offline: {
// Define the effect (the API call to make)
effect: {
url: `/disks/list`,
method: "POST",
headers: {
"Content-Type": "application/json",
// Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
},
data: payload,
},
// Action to dispatch on success
commit: { type: LIST_DISKS_COMMIT },
// Action to dispatch on failure
rollback: { type: LIST_DISKS_ROLLBACK },
},
},
});

// Create Disk
export const createDiskAction = (diskData: IRequestCreateDisk) => {
const id = GenerateID.Disk();
const payload = {
...diskData,
id,
};
return {
type: CREATE_DISK,
meta: {
optimisticID: id,
offline: {
effect: {
url: `/disks/create`,
method: "POST",
headers: {
"Content-Type": "application/json",
// Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
},
data: payload,
},
// Action to dispatch on success
commit: { type: CREATE_DISK_COMMIT, meta: { optimisticID: id } },
// Action to dispatch on failure
rollback: { type: CREATE_DISK_ROLLBACK, meta: { optimisticID: id } },
},
},
};
};

// Update Disk
export const updateDiskAction = (diskData: IRequestUpdateDisk) => {
const id = diskData.id;
const payload = {
...diskData,
};
return {
type: UPDATE_DISK,
meta: {
optimisticID: id,
offline: {
effect: {
url: `/disks/update`,
method: "POST",
headers: {
"Content-Type": "application/json",
// Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
},
data: payload,
},
// Action to dispatch on success
commit: { type: UPDATE_DISK_COMMIT, meta: { optimisticID: id } },
// Action to dispatch on failure
rollback: { type: UPDATE_DISK_ROLLBACK, meta: { optimisticID: id } },
},
},
};
};

// Delete Disk
export const deleteDiskAction = (payload: IRequestDeleteDisk) => {
const id = payload.id;
return {
type: DELETE_DISK,
meta: {
optimisticID: id,
offline: {
effect: {
url: `/disks/delete`,
method: "POST",
headers: {
"Content-Type": "application/json",
// Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
},
data: payload,
},
// Action to dispatch on success
commit: { type: DELETE_DISK_COMMIT, meta: { optimisticID: id } },
// Action to dispatch on failure
rollback: {
type: DELETE_DISK_ROLLBACK,
meta: { optimisticID: id },
},
},
},
};
};

// Check Disk Table Permissions
export const checkDiskTablePermissionsAction = (userID: UserID) => {
const id = `disk_table_permissions_${userID}`;

const payload = {
resource_id: "TABLE_DISKS",
grantee_id: userID,
};

return {
type: CHECK_DISKS_TABLE_PERMISSIONS,
meta: {
optimisticID: id,
offline: {
effect: {
url: `/permissions/system/check`,
method: "POST",
headers: {
"Content-Type": "application/json",
// Authorization: `Bearer HANDLED_BY_OFFLINE_EFFECT_MIDDLEWARE`,
},
data: payload,
},
// Action to dispatch on success
commit: {
type: CHECK_DISKS_TABLE_PERMISSIONS_COMMIT,
meta: { optimisticID: id },
},
// Action to dispatch on failure
rollback: {
type: CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK,
meta: { optimisticID: id },
},
},
},
};
};

### src/redux-offline/disks/disks.reducer.ts

// src/redux-offline/disks/disks.reducer.ts
import { Disk, DiskFE, DiskID, SystemPermissionType } from "@officexapp/types";
import {
CREATE_DISK,
CREATE_DISK_COMMIT,
CREATE_DISK_ROLLBACK,
LIST_DISKS,
LIST_DISKS_COMMIT,
LIST_DISKS_ROLLBACK,
GET_DISK,
GET_DISK_COMMIT,
GET_DISK_ROLLBACK,
UPDATE_DISK,
UPDATE_DISK_COMMIT,
UPDATE_DISK_ROLLBACK,
CHECK_DISKS_TABLE_PERMISSIONS,
CHECK_DISKS_TABLE_PERMISSIONS_COMMIT,
CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK,
} from "./disks.actions";
import {
defaultBrowserCacheDiskID,
defaultTempCloudSharingDiskID,
} from "../../api/dexie-database";

export const DISKS_REDUX_KEY = "disks";
export const DISKS_DEXIE_TABLE = DISKS_REDUX_KEY;

export interface DiskFEO extends DiskFE {
\_isOptimistic?: boolean; // flag for optimistic updates
\_optimisticID?: string; // unique ID for optimistic updates
\_syncWarning?: string; // tooltip for users
\_syncConflict?: boolean; // flag for corrupted data due to sync failures
\_syncSuccess?: boolean; // flag for successful sync
\_markedForDeletion?: boolean; // flag for deletion
lastChecked?: number;
isLoading?: boolean;
}

interface DisksState {
defaultDisk: DiskFEO | null;
disks: DiskFEO[];
diskMap: Record<DiskID, DiskFEO>;
loading: boolean;
error: string | null;
tablePermissions: SystemPermissionType[];
lastChecked: number;
}

const initialState: DisksState = {
defaultDisk: null,
disks: [],
diskMap: {},
loading: false,
error: null,
tablePermissions: [],
lastChecked: 0,
};

const updateOrAddDisk = (disks: DiskFEO[], newDisk: DiskFEO): DiskFEO[] => {
const existingIndex = disks.findIndex(
(disk) => disk.id === newDisk.id || disk.\_optimisticID === newDisk.id
);

if (existingIndex !== -1) {
// Replace existing disk
return [
...disks.slice(0, existingIndex),
newDisk,
...disks.slice(existingIndex + 1),
];
} else {
// Add to the front of the array
return [newDisk, ...disks];
}
};

export const disksReducer = (state = initialState, action: any): DisksState => {
switch (action.type) {
// ------------------------------ GET DISKS --------------------------------- //

    // Get Disks
    case GET_DISK: {
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, action.optimistic),
        diskMap: {
          ...state.diskMap,
          [action.optimistic.id]: { ...action.optimistic, isLoading: true },
        },
      };
    }

    case GET_DISK_COMMIT: {
      const realDisk = action.payload.ok.data;
      // Update the optimistic disk with the real data
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === realDisk.id || disk.id === realDisk.id) {
            return realDisk;
          }
          return disk;
        }),
        diskMap: {
          ...state.diskMap,
          [action.payload.ok.data.id]: {
            ...action.payload.ok.data,
            lastChecked: Date.now(),
            isLoading: false,
          },
        },
      };
    }

    case GET_DISK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic disk with the error message
      const newDiskMap = { ...state.diskMap };
      delete newDiskMap[action.meta.optimisticID];
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === action.meta.optimisticID) {
            return {
              ...disk,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
              isLoading: false,
            };
          }
          return disk;
        }),
        diskMap: newDiskMap,
        error: action.payload.message || "Failed to fetch disk",
      };
    }

    // ------------------------------ LIST DISKS --------------------------------- //

    case LIST_DISKS: {
      return {
        ...state,
        defaultDisk: null,
        disks: action.optimistic || [],
        loading: true,
        error: null,
      };
    }

    case LIST_DISKS_COMMIT: {
      // Get items from the API response
      const serverDisks = action.payload.ok.data.items || [];

      const newDisks: DiskFEO[] = serverDisks.reduce(
        (acc: DiskFEO[], item: DiskFEO) => updateOrAddDisk(acc, item),
        state.disks
      );
      const newDiskMap = serverDisks.reduce(
        (acc: Record<DiskID, DiskFEO>, item: DiskFEO) => {
          acc[item.id] = { ...item, lastChecked: Date.now() };
          return acc;
        },
        state.diskMap
      );

      return {
        ...state,
        defaultDisk: null,
        disks: newDisks,
        diskMap: newDiskMap,
        loading: false,
        lastChecked: Date.now(),
      };
    }

    case LIST_DISKS_ROLLBACK: {
      if (!action.payload.response) return state;
      return {
        ...state,
        loading: false,
        error: action.error_message || "Failed to fetch disks",
      };
    }

    // ------------------------------ CREATE DISK --------------------------------- //

    case CREATE_DISK: {
      const optimisticDisk = action.optimistic;
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, optimisticDisk),
        loading: true,
        error: null,
      };
    }

    case CREATE_DISK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      const newDisk = {
        ...action.payload.ok.data,
        _syncSuccess: true,
        _syncConflict: false,
        _syncWarning: "",
        _isOptimistic: false,
      };
      const filteredDisks = state.disks.filter(
        (disk) => disk._optimisticID !== optimisticID
      );
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      setTimeout(() => {
        // we refresh to ensure the new disk upload manager is initialized
        window.location.reload();
      }, 2000);
      return {
        ...state,
        // Add the newly created disk to our items array
        disks: updateOrAddDisk(filteredDisks, newDisk),
        loading: false,
      };
    }

    case CREATE_DISK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Add a sync warning to the optimistic disk
      const newReduxDisks = state.disks.map((disk) => {
        if (disk._optimisticID === action.meta.optimisticID) {
          return {
            ...disk,
            _syncWarning: action.error_message,
            _syncSuccess: false,
            _syncConflict: true,
            _isOptimistic: false,
          };
        }
        return disk;
      });
      // removal from dexie is already handled in optimistic middleware which can handle async, whereas reducers are pure sync functions
      return {
        ...state,
        disks: newReduxDisks,
        loading: false,
        error: action.payload.message || "Failed to create disk",
      };
    }

    // ------------------------------ UPDATE DISK --------------------------------- //

    case UPDATE_DISK: {
      const optimisticDisk = action.optimistic;
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, optimisticDisk),
        loading: true,
        error: null,
      };
    }

    case UPDATE_DISK_COMMIT: {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic disk with the real data
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === optimisticID) {
            return {
              ...disk,
              ...action.payload.ok.data,
              _syncSuccess: true,
              _syncConflict: false,
              _syncWarning: "",
              _isOptimistic: false,
            };
          }
          return disk;
        }),
        loading: false,
      };
    }

    case UPDATE_DISK_ROLLBACK: {
      if (!action.payload.response) return state;
      // Update the optimistic disk with the error message
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === action.meta.optimisticID) {
            return {
              ...disk,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return disk;
        }),
        loading: false,
        error: action.payload.message || "Failed to update disk",
      };
    }

    // ------------------------------ DELETE DISK --------------------------------- //

    case "DELETE_DISK": {
      const optimisticDisk = action.optimistic;
      return {
        ...state,
        disks: updateOrAddDisk(state.disks, optimisticDisk),
        loading: true,
        error: null,
      };
    }

    case "DELETE_DISK_COMMIT": {
      const optimisticID = action.meta?.optimisticID;
      // Update the optimistic disk with the real data
      return {
        ...state,
        disks: state.disks.filter(
          (disk) => disk._optimisticID !== optimisticID
        ),
        loading: false,
      };
    }

    case "DELETE_DISK_ROLLBACK": {
      // Update the optimistic disk with the error message
      return {
        ...state,
        disks: state.disks.map((disk) => {
          if (disk._optimisticID === action.meta.optimisticID) {
            return {
              ...disk,
              _syncWarning: action.error_message,
              _syncSuccess: false,
              _syncConflict: true,
              _isOptimistic: false,
            };
          }
          return disk;
        }),
        loading: false,
        error: action.payload.message || "Failed to delete disk",
      };
    }

    case CHECK_DISKS_TABLE_PERMISSIONS: {
      const permission_types = action.optimistic?.permission_types || [];
      return {
        ...state,
        loading: true,
        error: null,
        tablePermissions: permission_types,
      };
    }

    case CHECK_DISKS_TABLE_PERMISSIONS_COMMIT: {
      return {
        ...state,
        loading: false,
        tablePermissions: action.payload.ok.data.permissions,
      };
    }

    case CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK: {
      return {
        ...state,
        loading: false,
        error:
          action.payload.message || "Failed to check disks table permissions",
      };
    }

    default:
      return state;

}
};

### src/redux-offline/disks/disks.optimistic.ts

// src/redux-offline/disks/disks.optimistic.ts

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";
import {
defaultBrowserCacheDiskID,
defaultTempCloudSharingDiskID,
getDexieDb,
markSyncConflict,
} from "../../api/dexie-database";
import {
LIST*DISKS,
LIST_DISKS_COMMIT,
LIST_DISKS_ROLLBACK,
CREATE_DISK,
CREATE_DISK_COMMIT,
CREATE_DISK_ROLLBACK,
GET_DISK,
GET_DISK_COMMIT,
GET_DISK_ROLLBACK,
UPDATE_DISK,
UPDATE_DISK_COMMIT,
UPDATE_DISK_ROLLBACK,
DELETE_DISK,
DELETE_DISK_COMMIT,
DELETE_DISK_ROLLBACK,
CHECK_DISKS_TABLE_PERMISSIONS,
CHECK_DISKS_TABLE_PERMISSIONS_COMMIT,
CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK,
} from "../disks/disks.actions";
import {
AuthProfile,
IndexDB_ApiKey,
IndexDB_Organization,
IndexDB_Profile,
} from "../../framework/identity";
import { DiskFEO, DISKS_DEXIE_TABLE, DISKS_REDUX_KEY } from "./disks.reducer";
import * from "lodash";
import { DiskTypeEnum, SystemPermissionType } from "@officexapp/types";
import { SYSTEM_PERMISSIONS_DEXIE_TABLE } from "../permissions/permissions.reducer";

/\*\*

- Middleware for handling optimistic updates for the disks table
  \*/
  export const disksOptimisticDexieMiddleware = (currentIdentitySet: {
  currentOrg: IndexDB_Organization;
  currentProfile: AuthProfile;
  }): Middleware => {
  // Return the actual middleware function with access to the provided values
  // @ts-ignore
  return (store: MiddlewareAPI<Dispatch, any>) =>
  (next: Dispatch<AnyAction>) =>
  async (action: AnyAction) => {
  // Skip actions we don't care about

        // Skip actions we don't care about
        if (
          ![
            GET_DISK,
            GET_DISK_COMMIT,
            GET_DISK_ROLLBACK,
            LIST_DISKS,
            LIST_DISKS_COMMIT,
            LIST_DISKS_ROLLBACK,
            CREATE_DISK,
            CREATE_DISK_COMMIT,
            CREATE_DISK_ROLLBACK,
            UPDATE_DISK,
            UPDATE_DISK_COMMIT,
            UPDATE_DISK_ROLLBACK,
            DELETE_DISK,
            DELETE_DISK_COMMIT,
            DELETE_DISK_ROLLBACK,
            CHECK_DISKS_TABLE_PERMISSIONS,
            CHECK_DISKS_TABLE_PERMISSIONS_COMMIT,
            CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK,
          ].includes(action.type)
        ) {
          return next(action);
        }

        const userID = currentIdentitySet.currentProfile?.userID;
        const orgID = currentIdentitySet.currentOrg?.driveID;

        // Skip if we don't have identity info
        if (!userID || !orgID) {
          console.warn(
            `Missing identity info for ${action.type}. Skipping optimistic update.`
          );
          return next(action);
        }

        // Get db instance for this user+org pair
        // This won't create a new instance if the same one is already open
        const db = getDexieDb(userID, orgID);
        const table = db.table<DiskFEO, string>(DISKS_DEXIE_TABLE);
        let enhancedAction = action;

        try {
          // Process action based on type

          // ------------------------------ GET DISKS --------------------------------- //

          switch (action.type) {
            case GET_DISK: {
              // Get cached data from IndexedDB
              const optimisticID = action.meta.optimisticID;
              const cachedDisk = await table.get(optimisticID);
              if (cachedDisk) {
                enhancedAction = {
                  ...action,
                  optimistic: {
                    ...cachedDisk,
                    _isOptimistic: true,
                    _optimisticID: optimisticID,
                    _syncSuccess: false,
                    _syncConflict: false,
                    _syncWarning: `Awaiting Sync. This disk was fetched offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be refetched. Anything else depending on it may also be affected.`,
                  },
                };
              }
              break;
            }

            case GET_DISK_COMMIT: {
              const realDisk = action.payload?.ok?.data;
              if (realDisk) {
                await table.put({
                  ...realDisk,
                  _optimisticID: null,
                  _isOptimistic: false,
                  _syncSuccess: true,
                  _syncConflict: false,
                  _syncWarning: "",
                });
              }
              break;
            }

            case GET_DISK_ROLLBACK: {
              if (!action.payload.response) break;
              try {
                const err = await action.payload.response.json();
                const optimisticID = action.meta?.optimisticID;
                if (optimisticID) {
                  const error_message = `Failed to get disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                  await markSyncConflict(table, optimisticID, error_message);
                  enhancedAction = {
                    ...action,
                    error_message,
                  };
                }
              } catch (e) {
                console.log(e);
              }
              break;
            }

            // ------------------------------ LIST DISKS --------------------------------- //

            case LIST_DISKS: {
              // Get cached data from IndexedDB
              const cachedDisks = await table.toArray();

              // Enhance action with cached data if available
              if (cachedDisks && cachedDisks.length > 0) {
                enhancedAction = {
                  ...action,
                  optimistic: cachedDisks.map((d) => ({
                    ...d,
                    _isOptimistic: true,
                    _optimisticID: d.id,
                  })),
                };
              }
              break;
            }

            case LIST_DISKS_COMMIT: {
              // Extract disks from the response
              const disks = action.payload?.ok?.data?.items || [];

              // Update IndexedDB with fresh data
              await db.transaction("rw", table, async () => {
                // Get both default disks if they exist
                const defaultBrowserDisk = await table.get(
                  defaultBrowserCacheDiskID
                );
                const defaultCloudSharingDisk = await table.get(
                  defaultTempCloudSharingDiskID
                );

                // Filter out the default disks from the server response
                const nonDefaultDisks = disks.filter(
                  (d: DiskFEO) =>
                    d.id !== defaultBrowserCacheDiskID &&
                    d.id !== defaultTempCloudSharingDiskID
                );

                // Update or add each disk from API response
                for (const disk of nonDefaultDisks) {
                  await table.put({
                    ...disk,
                    _optimisticID: disk.id,
                    _isOptimistic: false,
                    _syncConflict: false,
                    _syncWarning: "",
                    _syncSuccess: true,
                  });
                }

                // Make sure our default disks stay in the database
                if (defaultBrowserDisk) {
                  await table.put({
                    ...defaultBrowserDisk,
                    _isOptimistic: false,
                    _syncConflict: false,
                    _syncWarning: "",
                    _syncSuccess: true,
                  });
                }

                if (defaultCloudSharingDisk) {
                  await table.put({
                    ...defaultCloudSharingDisk,
                    _isOptimistic: false,
                    _syncConflict: false,
                    _syncWarning: "",
                    _syncSuccess: true,
                  });
                }
              });
              break;
            }

            case LIST_DISKS_ROLLBACK: {
              if (!action.payload.response) break;
              try {
                if (!action.payload.response) break;
                const err = await action.payload.response.json();
                const error_message = `Failed to fetch disks - ${err.err.message}`;
                enhancedAction = {
                  ...action,
                  error_message,
                };
              } catch (e) {
                console.log(e);
              }
              break;
            }

            // ------------------------------ CREATE DISK --------------------------------- //

            case CREATE_DISK: {
              // Only handle actions with disk data
              if (action.meta?.offline?.effect?.data) {
                const diskData = action.meta.offline.effect.data;
                const optimisticID = action.meta.optimisticID;

                // Create optimistic disk object
                const optimisticDisk: DiskFEO = {
                  id: optimisticID,
                  ...diskData,
                  created_at: Date.now(),
                  updated_at: Date.now(),
                  permission_previews: [
                    SystemPermissionType.CREATE,
                    SystemPermissionType.EDIT,
                    SystemPermissionType.DELETE,
                    SystemPermissionType.VIEW,
                    SystemPermissionType.INVITE,
                  ],
                  _optimisticID: optimisticID,
                  _syncWarning: `Awaiting Sync. This disk was created offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be recreated. Anything else depending on it may also be affected.`,
                  _syncConflict: false,
                  _syncSuccess: false,
                  _isOptimistic: true,
                };

                // Save to IndexedDB
                await table.put(optimisticDisk);

                // Enhance action with optimisticID
                enhancedAction = {
                  ...action,
                  optimistic: optimisticDisk,
                };
              }
              break;
            }

            case CREATE_DISK_COMMIT: {
              const optimisticID = action.meta?.optimisticID;
              const realDisk = action.payload?.ok?.data;
              if (optimisticID && realDisk) {
                await db.transaction("rw", table, async () => {
                  // Remove optimistic version
                  await table.delete(optimisticID);
                  // Add real version
                  await table.put({
                    ...realDisk,
                    _optimisticID: null,
                    _syncSuccess: true,
                    _syncConflict: false,
                    _syncWarning: "",
                    _isOptimistic: false,
                  });
                });
              }
              break;
            }

            case CREATE_DISK_ROLLBACK: {
              if (!action.payload.response) break;
              try {
                const err = await action.payload.response.json();
                const optimisticID = action.meta?.optimisticID;
                if (optimisticID) {
                  const error_message = `Failed to create disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                  await markSyncConflict(table, optimisticID, error_message);
                  enhancedAction = {
                    ...action,
                    error_message,
                  };
                }
              } catch (e) {
                console.log(e);
              }
              break;
            }

            // ------------------------------ UPDATE DISK --------------------------------- //

            case UPDATE_DISK: {
              // Only handle actions with disk data
              if (action.meta?.offline?.effect?.data) {
                const diskData = action.meta.offline.effect.data;
                const optimisticID = action.meta.optimisticID;

                const cachedDisk = await table.get(optimisticID);

                // Create optimistic disk object
                const optimisticDisk: DiskFEO = {
                  id: diskData.id,
                  ...cachedDisk,
                  ...diskData,
                  updated_at: Date.now(),
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                  _syncWarning: `Awaiting Sync. This disk was edited offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be reverted. Anything else depending on it may also be affected.`,
                  _syncConflict: false,
                  _syncSuccess: false,
                };

                // Save to IndexedDB
                await table.put(optimisticDisk);

                // Enhance action with optimisticID
                enhancedAction = {
                  ...action,
                  optimistic: optimisticDisk,
                };
              }
              break;
            }

            case UPDATE_DISK_COMMIT: {
              const optimisticID = action.meta?.optimisticID;
              const realDisk = action.payload?.ok?.data;
              if (optimisticID && realDisk) {
                await db.transaction("rw", table, async () => {
                  // Remove optimistic version
                  await table.delete(optimisticID);
                  // Add real version
                  await table.put({
                    ...realDisk,
                    _syncSuccess: true,
                    _syncConflict: false,
                    _syncWarning: "",
                    _isOptimistic: false,
                    _optimisticID: null,
                  });
                });
              }
              break;
            }

            case UPDATE_DISK_ROLLBACK: {
              if (!action.payload.response) break;
              try {
                const err = await action.payload.response.json();
                const optimisticID = action.meta?.optimisticID;
                if (optimisticID) {
                  const error_message = `Failed to update disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                  await markSyncConflict(table, optimisticID, error_message);
                  enhancedAction = {
                    ...action,
                    error_message,
                  };
                }
              } catch (e) {
                console.log(e);
              }
              break;
            }

            // ------------------------------ DELETE DISK --------------------------------- //

            case DELETE_DISK: {
              const optimisticID = action.meta.optimisticID;

              const cachedDisk = await table.get(optimisticID);

              if (cachedDisk) {
                const optimisticDisk: DiskFEO = {
                  ...cachedDisk,
                  id: optimisticID,
                  _markedForDeletion: true,
                  _syncWarning: `Awaiting Sync. This disk was deleted offline and will auto-sync with cloud when you are online again. If there are errors, it may need to be restored. Anything else depending on it may also be affected.`,
                  _syncConflict: false,
                  _syncSuccess: false,
                  _isOptimistic: true,
                  _optimisticID: optimisticID,
                };

                // mark for deletion in indexdb
                // Save to IndexedDB
                await table.put(optimisticDisk);

                // Enhance action with optimisticID
                enhancedAction = {
                  ...action,
                  optimistic: optimisticDisk,
                };
              }

              break;
            }

            case DELETE_DISK_COMMIT: {
              const optimisticID = action.meta?.optimisticID;
              if (optimisticID) {
                await db.transaction("rw", table, async () => {
                  // Remove optimistic version
                  await table.delete(optimisticID);
                });
              }
              break;
            }

            case DELETE_DISK_ROLLBACK: {
              if (!action.payload.response) break;
              try {
                const err = await action.payload.response.json();
                const optimisticID = action.meta?.optimisticID;
                if (optimisticID) {
                  const error_message = `Failed to delete disk - a sync conflict occured between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                  await markSyncConflict(table, optimisticID, error_message);
                  enhancedAction = {
                    ...action,
                    error_message,
                  };
                }
              } catch (e) {
                console.log(e);
              }
              break;
            }

            case CHECK_DISKS_TABLE_PERMISSIONS: {
              // check dexie
              const systemPermissionsTable = db.table(
                SYSTEM_PERMISSIONS_DEXIE_TABLE
              );
              const permission = await systemPermissionsTable.get(
                action.meta?.optimisticID
              );
              if (permission) {
                enhancedAction = {
                  ...action,
                  optimistic: permission,
                };
              }
              break;
            }

            case CHECK_DISKS_TABLE_PERMISSIONS_COMMIT: {
              const optimisticID = action.meta?.optimisticID;
              const permissions = action.payload?.ok?.data?.permissions;

              if (permissions) {
                // Save to system permissions table
                const systemPermissionsTable = db.table(
                  SYSTEM_PERMISSIONS_DEXIE_TABLE
                );
                await systemPermissionsTable.put({
                  id: optimisticID,
                  resource_id: "TABLE_DISKS",
                  granted_to: optimisticID.replace("disk_table_permissions_", ""),
                  granted_by: optimisticID.replace("disk_table_permissions_", ""),
                  permission_types: permissions,
                  begin_date_ms: 0,
                  expiry_date_ms: -1,
                  note: "Table permission",
                  created_at: 0,
                  last_modified_at: 0,
                  from_placeholder_grantee: null,
                  labels: [],
                  redeem_code: null,
                  metadata: null,
                  external_id: null,
                  external_payload: null,
                  resource_name: "Disks Table",
                  grantee_name: "You",
                  grantee_avatar: null,
                  granter_name: "System",
                  permission_previews: [],
                  _optimisticID: optimisticID,
                  _isOptimistic: false,
                  _syncSuccess: true,
                  _syncConflict: false,
                });
              }
              break;
            }

            case CHECK_DISKS_TABLE_PERMISSIONS_ROLLBACK: {
              if (!action.payload.response) break;
              try {
                const err = await action.payload.response.json();
                const optimisticID = action.meta?.optimisticID;
                if (optimisticID) {
                  const error_message = `Failed to check contact table permissions - a sync conflict occurred between your offline local copy & the official cloud record. You may see sync conflicts in other related data. Error message for your request: ${err.err.message}`;
                  await markSyncConflict(table, optimisticID, error_message);
                  enhancedAction = {
                    ...action,
                    error_message,
                  };
                }
              } catch (e) {
                console.log(e);
              }
              break;
            }
          }

          // Pass the (potentially enhanced) action to the next middleware
          return next(enhancedAction);
        } catch (error) {
          console.error(`Error in disks middleware for ${action.type}:`, error);
          // Continue with the original action if there's an error
          return next(action);
        }
      };

  };
