import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Space, Tooltip } from "antd";
import { DirectoryPermissionFEO } from "../../redux-offline/permissions/permissions.reducer";
import { DirectoryResourceID } from "@officexapp/types";

interface PermissionStatusMessageProps {
  resource_id: DirectoryResourceID;
  permissions: DirectoryPermissionFEO[];
}

const PermissionStatusMessage: React.FC<PermissionStatusMessageProps> = ({
  resource_id,
  permissions,
}) => {
  const currentTime = Date.now();
  const resource = resource_id.startsWith("FolderID_") ? "folder" : "file";

  // Filter to only PUBLIC permissions
  const publicPermissions = permissions.filter(
    (p) => p && p.granted_to === "PUBLIC"
  );

  // Check if any public permission is currently active
  const activePublicPermissions = publicPermissions.filter((p) => {
    const hasStarted =
      p.begin_date_ms === null || p.begin_date_ms <= currentTime;
    const hasNotExpired =
      p.expiry_date_ms === null ||
      p.expiry_date_ms === -1 ||
      p.expiry_date_ms > currentTime;
    return hasStarted && hasNotExpired;
  });

  // Check for future public permissions
  const futurePublicPermissions = publicPermissions.filter(
    (p) => p.begin_date_ms !== null && p.begin_date_ms > currentTime
  );

  // Determine message and color
  let message = "";
  let messageColor = "";
  let tooltipText = "";

  if (permissions.length === 0) {
    message = `This ${resource} is PRIVATE and hidden. Only you can see it.`;
    messageColor = "green";
    tooltipText = "You are the only one who can see it";
  } else if (activePublicPermissions.length > 0) {
    message = `This ${resource} is PUBLIC on the internet`;
    messageColor = "red";

    // If there's an expiry, mention when it will become private
    const earliestExpiryPermission = activePublicPermissions
      .filter((p) => p.expiry_date_ms !== null && p.expiry_date_ms !== -1)
      .sort((a, b) => a.expiry_date_ms - b.expiry_date_ms)[0];

    if (earliestExpiryPermission) {
      const expiryDate = new Date(
        earliestExpiryPermission.expiry_date_ms
      ).toLocaleDateString();
      tooltipText = `Public access will expire on ${expiryDate}`;
    } else {
      tooltipText = `This ${resource} can be accessed by anyone with the link`;
    }
  } else if (futurePublicPermissions.length > 0) {
    const earliestFuturePermission = futurePublicPermissions.sort(
      (a, b) => a.begin_date_ms - b.begin_date_ms
    )[0];
    const futureDate = new Date(
      earliestFuturePermission.begin_date_ms
    ).toLocaleDateString();

    message = `This ${resource} is currently PRIVATE but will become PUBLIC in the future`;
    messageColor = "#ec6d05"; // Amber/warning
    tooltipText = `This ${resource} will become public on ${futureDate}`;
  } else {
    message = `This ${resource} is PRIVATE to an exclusive list`;
    messageColor = "#1677ff"; // Blue
    tooltipText = `Only specific users or groups have access to this ${resource}`;
  }

  return (
    <div style={{ marginBottom: "8px" }}>
      <Tooltip title={tooltipText}>
        <Space>
          <span style={{ color: messageColor }}>{message}</span>
          <InfoCircleOutlined style={{ color: "#aaa" }} />
        </Space>
      </Tooltip>
    </div>
  );
};

export default PermissionStatusMessage;
