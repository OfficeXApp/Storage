import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Space, Tooltip } from "antd";
import {
  DirectoryResourceID,
  FilePathBreadcrumb,
  BreadcrumbVisibilityPreviewEnum,
} from "@officexapp/types";
import { useIdentitySystem } from "../../framework/identity";
import { Link } from "react-router-dom";
import { extractDiskInfo } from "../../api/helpers";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
} from "../../api/dexie-database";

interface PermissionStatusMessageProps {
  resource_id: DirectoryResourceID;
  breadcrumbs: FilePathBreadcrumb[];
}

const PermissionStatusMessage: React.FC<PermissionStatusMessageProps> = ({
  resource_id,
  breadcrumbs,
}) => {
  const resource = resource_id.startsWith("FolderID_") ? "folder" : "file";
  const { wrapOrgCode } = useIdentitySystem();

  const { diskTypeEnum, diskID } = extractDiskInfo();

  // Find the current resource in breadcrumbs
  const currentBreadcrumb = breadcrumbs.find(
    (b) => b.resource_id === resource_id
  );

  // Determine visibility status based on breadcrumbs
  let message = "";
  let messageColor = "";
  let tooltipText = "";
  let ancestorWithPermission = null;
  let ancestorPart = "";

  // Check if current resource has any direct permissions
  const hasDirectPermissions =
    currentBreadcrumb?.visibility_preview &&
    currentBreadcrumb.visibility_preview.length > 0;

  // Find all ancestors with permissions
  const ancestorsWithPermission = breadcrumbs.filter(
    (b) =>
      b.resource_id !== resource_id &&
      b.visibility_preview &&
      b.visibility_preview.length > 0
  );

  // First check if any ancestor has public permissions (highest priority)
  const publicAncestor = ancestorsWithPermission.find(
    (a) =>
      a.visibility_preview.includes(
        BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW
      ) ||
      a.visibility_preview.includes(
        BreadcrumbVisibilityPreviewEnum.PUBLIC_MODIFY
      )
  );

  // If public ancestor exists, use it as highest priority
  if (publicAncestor) {
    ancestorWithPermission = publicAncestor;
    ancestorPart = ` via ancestor folder "${ancestorWithPermission.resource_name}"`;
  }
  // Otherwise, use the closest ancestor with any permissions
  else if (ancestorsWithPermission.length > 0) {
    // Sort ancestors by their position in the breadcrumb trail (closest first)
    const sortedAncestors = [...ancestorsWithPermission].sort((a, b) => {
      // Higher index means closer to current resource in breadcrumb trail
      return (
        breadcrumbs.findIndex((x) => x.resource_id === b.resource_id) -
        breadcrumbs.findIndex((x) => x.resource_id === a.resource_id)
      );
    });

    ancestorWithPermission = sortedAncestors[0]; // Closest ancestor
    ancestorPart = ` via ancestor folder "${ancestorWithPermission.resource_name}"`;
  }

  // If no visibility info available - assume private
  if (
    !currentBreadcrumb ||
    !currentBreadcrumb.visibility_preview ||
    currentBreadcrumb.visibility_preview.length === 0
  ) {
    if (ancestorWithPermission) {
      // No direct permissions but inherited from ancestor
      const ancestorVisibility = ancestorWithPermission.visibility_preview;

      // Public permissions take priority over private/exclusive
      if (
        ancestorVisibility.includes(
          BreadcrumbVisibilityPreviewEnum.PUBLIC_MODIFY
        )
      ) {
        message = `This ${resource} is PUBLIC EDITABLE via ancestor folder`;
        messageColor = "red";
        tooltipText = `This ${resource} can be modified by anyone because its ancestor folder has public edit permission`;
      } else if (
        ancestorVisibility.includes(BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW)
      ) {
        message = `This ${resource} is PUBLIC VIEW ONLY via ancestor folder`;
        messageColor = "red";
        tooltipText = `This ${resource} is visible to anyone because its ancestor folder has public visibility`;
      } else if (
        ancestorVisibility.includes(
          BreadcrumbVisibilityPreviewEnum.PRIVATE_VIEW
        ) ||
        ancestorVisibility.includes(
          BreadcrumbVisibilityPreviewEnum.PRIVATE_MODIFY
        )
      ) {
        message = `This ${resource} is shared with an EXCLUSIVE LIST via ancestor folder`;
        messageColor = "#1677ff"; // Blue
        tooltipText = `This ${resource} is accessible to specific users because its ancestor folder has been shared with them`;
      }
    } else {
      // Completely private
      message = `This ${resource} is PRIVATE and hidden. Only you can see it.`;
      messageColor = "green";
      tooltipText = "You are the only one who can see it";
    }
  } else {
    // Has direct permissions on this resource
    const visibility_preview = currentBreadcrumb.visibility_preview;

    let directStatus = "";
    // Public permissions take priority over private/exclusive
    if (
      visibility_preview.includes(BreadcrumbVisibilityPreviewEnum.PUBLIC_MODIFY)
    ) {
      directStatus = `PUBLIC EDITABLE`;
      messageColor = "red";
      tooltipText = `This ${resource} can be edited by anyone with the link`;
    } else if (
      visibility_preview.includes(BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW)
    ) {
      directStatus = `PUBLIC VIEW ONLY`;
      messageColor = "red";
      tooltipText = `This ${resource} can be viewed by anyone with the link`;
    } else if (
      visibility_preview.includes(
        BreadcrumbVisibilityPreviewEnum.PRIVATE_VIEW
      ) ||
      visibility_preview.includes(
        BreadcrumbVisibilityPreviewEnum.PRIVATE_MODIFY
      )
    ) {
      directStatus = `shared with an EXCLUSIVE LIST`;
      messageColor = "#1677ff"; // Blue
      tooltipText = `Only specific users or groups have access to this ${resource}`;

      if (
        visibility_preview.includes(
          BreadcrumbVisibilityPreviewEnum.PRIVATE_MODIFY
        )
      ) {
        tooltipText += " with edit permission";
      } else {
        tooltipText += " with view-only permission";
      }
    }

    if (ancestorWithPermission) {
      // Evaluate priority between direct and ancestor permissions
      const ancestorVisibility = ancestorWithPermission.visibility_preview;
      const hasAncestorPublic =
        ancestorVisibility.includes(
          BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW
        ) ||
        ancestorVisibility.includes(
          BreadcrumbVisibilityPreviewEnum.PUBLIC_MODIFY
        );
      const hasDirectPublic =
        visibility_preview.includes(
          BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW
        ) ||
        visibility_preview.includes(
          BreadcrumbVisibilityPreviewEnum.PUBLIC_MODIFY
        );

      // If direct permissions are public or ancestor permissions are not public, show both
      if (hasDirectPublic || !hasAncestorPublic) {
        message = `This ${resource} is ${directStatus} directly and via ancestor folder`;
        tooltipText += ` (both directly and via its ancestor folder)`;
      } else {
        // If ancestor permissions are public and direct permissions are not, prioritize ancestor
        message = `This ${resource} has EXCLUSIVE LIST permissions directly but is PUBLIC via ancestor folder`;
        tooltipText = `This ${resource} has public access via its ancestor folder which overrides its direct exclusive sharing`;
        messageColor = "red"; // Use red for public permissions
      }
    } else {
      // Only direct permissions
      message = `This ${resource} is ${directStatus} directly`;
    }
  }

  if (diskID === defaultTempCloudSharingDiskID) {
    message = `This ${resource} is PUBLIC on internet via free public filesharing disk`;
    messageColor = "red";
    tooltipText = `This ${resource} is accessible to anyone on the internet because it is stored on a free public filesharing disk`;
  }

  if (diskID === defaultBrowserCacheDiskID) {
    message = `This ${resource} is OFFLINE and hidden. You can generate a temporary 8 hour sharing link`;
    messageColor = "blue";
    tooltipText =
      "You are the only one who can see it until you generate a temporary link, which lasts less than 24h hours.";
  }

  return (
    <div style={{ marginBottom: "8px" }}>
      <Tooltip title={tooltipText}>
        <Space>
          <span style={{ color: messageColor }}>
            {message}
            {ancestorWithPermission && (
              <>
                {" "}
                <Link
                  to={wrapOrgCode(
                    `/drive/${diskTypeEnum}/${diskID}/${ancestorWithPermission.resource_id}/`
                  )}
                >
                  "{ancestorWithPermission.resource_name}"
                </Link>
              </>
            )}
          </span>
          <InfoCircleOutlined style={{ color: "#aaa" }} />
        </Space>
      </Tooltip>
    </div>
  );
};

export default PermissionStatusMessage;
