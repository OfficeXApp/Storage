import {
  BreadcrumbVisibilityPreviewEnum,
  DirectoryPermissionType,
  DiskTypeEnum,
  DriveID,
  UploadStatus,
  UserID,
} from "@officexapp/types";
import { FileFEO } from "../redux-offline/directory/directory.reducer";
import {
  defaultTempCloudSharingDemoGalleryFolderID,
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingRootFolderID,
  defaultTempCloudSharingTutorialVideosFolderID,
} from "./dexie-database";

export const fetchDemoGalleryFiles = (
  userID: UserID,
  orgID: DriveID
): FileFEO[] => {
  const now = Date.now();

  // Helper function to create consistent file records
  const createDemoFile = (filename: string, size: number): FileFEO => {
    // Convert filename to slug format for the ID
    const fileSlug = filename
      .replace(/\s+/g, "-")
      .replace(/\./g, "")
      .toLowerCase();

    return {
      id: `FileID_demo-${fileSlug}`,
      name: filename,
      parent_folder_uuid: defaultTempCloudSharingDemoGalleryFolderID,
      file_version: 1,
      extension: "jpeg",
      full_directory_path: `${defaultTempCloudSharingDiskID}::/Demo Gallery/${filename}`,
      labels: [],
      created_by: userID,
      created_at: now,
      disk_id: defaultTempCloudSharingDiskID,
      disk_type: DiskTypeEnum.StorjWeb3,
      file_size: size, // size in bytes
      raw_url: `https://ofx-bucko.s3.us-east-1.amazonaws.com/demo-gallery/${encodeURIComponent(filename)}`,
      last_updated_date_ms: now,
      last_updated_by: userID,
      deleted: false,
      drive_id: orgID,
      expires_at: -1,
      has_sovereign_permissions: true,
      upload_status: UploadStatus.COMPLETED,
      clipped_directory_path: `${defaultTempCloudSharingDiskID}::/Demo Gallery/${filename}`,
      permission_previews: [
        DirectoryPermissionType.VIEW,
        DirectoryPermissionType.EDIT,
        DirectoryPermissionType.DELETE,
      ],
      _isOptimistic: false,
      _syncConflict: false,
      _syncWarning: "",
      _syncSuccess: true,
      breadcrumbs: [
        {
          resource_id: defaultTempCloudSharingRootFolderID,
          resource_name: "Free Cloud Sharing",
          visibility_preview: [BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW],
        },
        {
          resource_id: defaultTempCloudSharingDemoGalleryFolderID,
          resource_name: "Demo Gallery",
          visibility_preview: [BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW],
        },
      ],
    };
  };

  // All files from the screenshot
  const files: FileFEO[] = [
    createDemoFile("admin multisigs.jpeg", 353200),
    createDemoFile("advanced permissions.jpeg", 284500),
    createDemoFile("anonymous filesharing.jpeg", 155800),
    createDemoFile("anonymous spreadsheets.jpeg", 525600),
    createDemoFile("anonymous workspace.jpeg", 196800),
    createDemoFile("apache open source.jpeg", 447300),
    createDemoFile("apocalypse proof.jpeg", 278000),
    createDemoFile("creator monetization.jpeg", 298900),
    createDemoFile("developer rest api.jpeg", 374500),
    createDemoFile("documents for nomads.jpeg", 154400),
    createDemoFile("external aliases.jpeg", 165600),
    createDemoFile("fall of privacy.jpeg", 439700),
    createDemoFile("global filesharing.jpeg", 411500),
    createDemoFile("lifetime storage.jpeg", 330000),
    createDemoFile("manifesto decks.jpeg", 293200),
    createDemoFile("private notes.jpeg", 469000),
    createDemoFile("rewind replay.jpeg", 627300),
    createDemoFile("sharing analytics.jpeg", 247700),
    createDemoFile("sovereign workspace.jpeg", 331900),
    createDemoFile("torrent coupons.jpeg", 278800),
    createDemoFile("universal search.jpeg", 306200),
    createDemoFile("universal tags.jpeg", 393400),
    createDemoFile("webhooks api.jpeg", 241000),
  ];

  return files;
};

export const fetchDemoTutorialFiles = (
  userID: UserID,
  orgID: DriveID
): FileFEO[] => {
  const now = Date.now();

  // Helper function to create consistent file records
  const createDemoFile = (
    filename: string,
    size: number,
    raw_url: string
  ): FileFEO => {
    // Convert filename to slug format for the ID
    const fileSlug = filename
      .replace(/\s+/g, "-")
      .replace(/\./g, "")
      .toLowerCase();

    return {
      id: `FileID_tutorial-${fileSlug}`,
      name: filename,
      parent_folder_uuid: defaultTempCloudSharingTutorialVideosFolderID,
      file_version: 1,
      extension: "mp4",
      full_directory_path: `${defaultTempCloudSharingDiskID}::/Demo Gallery/Tutorial Videos/${filename}`,
      labels: [],
      created_by: userID,
      created_at: now,
      disk_id: defaultTempCloudSharingDiskID,
      disk_type: DiskTypeEnum.StorjWeb3,
      file_size: size, // size in bytes
      raw_url,
      last_updated_date_ms: now,
      last_updated_by: userID,
      deleted: false,
      drive_id: orgID,
      expires_at: -1,
      has_sovereign_permissions: true,
      upload_status: UploadStatus.COMPLETED,
      clipped_directory_path: `${defaultTempCloudSharingDiskID}::/Demo Gallery/Tutorial Videos/${filename}`,
      permission_previews: [
        DirectoryPermissionType.VIEW,
        DirectoryPermissionType.EDIT,
        DirectoryPermissionType.DELETE,
      ],
      _isOptimistic: false,
      _syncConflict: false,
      _syncWarning: "",
      _syncSuccess: true,
      breadcrumbs: [
        {
          resource_id: defaultTempCloudSharingRootFolderID,
          resource_name: "Free Cloud Sharing",
          visibility_preview: [BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW],
        },
        {
          resource_id: defaultTempCloudSharingDemoGalleryFolderID,
          resource_name: "Demo Gallery",
          visibility_preview: [BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW],
        },
        {
          resource_id: defaultTempCloudSharingTutorialVideosFolderID,
          resource_name: "Tutorial Videos",
          visibility_preview: [BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW],
        },
      ],
    };
  };

  // All files from the screenshot
  const files: FileFEO[] = [
    createDemoFile(
      "officex_alpha_product_walkthrough.mp4",
      32739200,
      "https://ofx-bucko.s3.us-east-1.amazonaws.com/demo-gallery/officex_alpha_product_walkthrough.mp4"
    ),
  ];

  return files;
};
