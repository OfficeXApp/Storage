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
  let message = <span></span>;
  let messageColor = "";
  let tooltipText = <span></span>;
  let tooltipText2 = <span></span>;
  let ancestorWithPermission = null;
  let ancestorPart = <span></span>;

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
    ancestorPart = (
      <span>
        {" "}
        via ancestor folder "${ancestorWithPermission.resource_name}"
      </span>
    );
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
    ancestorPart = (
      <span>
        {" "}
        via ancestor folder "${ancestorWithPermission.resource_name}"
      </span>
    );
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
        message = (
          <span>This {resource} is PUBLIC EDITABLE via ancestor folder</span>
        );
        messageColor = "red";
        tooltipText = (
          <span>
            This {resource} can be modified by anyone because its ancestor
            folder has public edit permission
          </span>
        );
      } else if (
        ancestorVisibility.includes(BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW)
      ) {
        message = (
          <span>This {resource} is PUBLIC VIEW ONLY via ancestor folder</span>
        );
        messageColor = "red";
        tooltipText = (
          <span>
            This {resource} is visible to anyone because its ancestor folder has
            public visibility
          </span>
        );
      } else if (
        ancestorVisibility.includes(
          BreadcrumbVisibilityPreviewEnum.PRIVATE_VIEW
        ) ||
        ancestorVisibility.includes(
          BreadcrumbVisibilityPreviewEnum.PRIVATE_MODIFY
        )
      ) {
        message = (
          <span>
            This {resource} is shared with an EXCLUSIVE LIST via ancestor folder
          </span>
        );
        messageColor = "#1677ff"; // Blue
        tooltipText = (
          <span>
            This {resource} is accessible to specific users because its ancestor
            folder has been shared with them
          </span>
        );
      }
    } else {
      // Completely private
      message = (
        <span>This {resource} is PRIVATE and hidden. Only you can see it.</span>
      );
      messageColor = "green";
      tooltipText = <span>You are the only one who can see it</span>;
    }
  } else {
    // Has direct permissions on this resource
    const visibility_preview = currentBreadcrumb.visibility_preview;

    let directStatus = <span></span>;
    // Public permissions take priority over private/exclusive
    if (
      visibility_preview.includes(BreadcrumbVisibilityPreviewEnum.PUBLIC_MODIFY)
    ) {
      directStatus = <span>PUBLIC EDITABLE</span>;
      messageColor = "red";
      tooltipText = (
        <span>This {resource} can be edited by anyone with the link</span>
      );
    } else if (
      visibility_preview.includes(BreadcrumbVisibilityPreviewEnum.PUBLIC_VIEW)
    ) {
      directStatus = <span>PUBLIC VIEW ONLY</span>;
      messageColor = "red";
      tooltipText = (
        <span>This {resource} can be viewed by anyone with the link</span>
      );
    } else if (
      visibility_preview.includes(
        BreadcrumbVisibilityPreviewEnum.PRIVATE_VIEW
      ) ||
      visibility_preview.includes(
        BreadcrumbVisibilityPreviewEnum.PRIVATE_MODIFY
      )
    ) {
      directStatus = <span>shared with an EXCLUSIVE LIST</span>;
      messageColor = "#1677ff"; // Blue
      tooltipText = (
        <span>
          Only specific users or groups have access to this {resource}
        </span>
      );

      if (
        visibility_preview.includes(
          BreadcrumbVisibilityPreviewEnum.PRIVATE_MODIFY
        )
      ) {
        tooltipText = (
          <span>
            Only specific users or groups have access to this {resource} with
            edit permission
          </span>
        );
      } else {
        tooltipText = (
          <span>
            Only specific users or groups have access to this {resource} with
            view-only permission
          </span>
        );
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
        message = (
          <span>
            This {resource} is {directStatus} directly and via ancestor folder
          </span>
        );
        tooltipText2 = (
          <span> (both directly and via its ancestor folder)</span>
        );
      } else {
        // If ancestor permissions are public and direct permissions are not, prioritize ancestor
        message = (
          <span>
            This {resource} has EXCLUSIVE LIST permissions directly but is
            PUBLIC via ancestor folder
          </span>
        );
        tooltipText = (
          <span>
            This ${resource} has public access via its ancestor folder which
            overrides its direct exclusive sharing
          </span>
        );
        messageColor = "red"; // Use red for public permissions
      }
    } else {
      // Only direct permissions
      message = (
        <span>
          This {resource} is {directStatus} directly
        </span>
      );
    }
  }

  if (diskID === defaultTempCloudSharingDiskID) {
    message = (
      <span>
        This ${resource} is PUBLIC on internet via free public filesharing disk
      </span>
    );
    messageColor = "red";
    tooltipText = (
      <span>
        This ${resource} is accessible to anyone on the internet because it is
        stored on a free public filesharing disk
      </span>
    );
  }

  if (diskID === defaultBrowserCacheDiskID) {
    message = (
      <span>
        This ${resource} is OFFLINE and hidden. You can generate a temporary 8
        hour sharing link
      </span>
    );
    messageColor = "blue";
    tooltipText = (
      <span>
        You are the only one who can see it until you generate a temporary link,
        which lasts less than 24h hours.
      </span>
    );
  }

  return (
    <div style={{ marginBottom: "8px" }}>
      <Tooltip
        title={
          <span>
            {tooltipText}
            {tooltipText2}
          </span>
        }
      >
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
