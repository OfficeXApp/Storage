import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Dropdown,
  Input,
  Space,
  Table,
  Tooltip,
  message,
  Typography,
  Popconfirm,
  Popover,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Permission } from "@aws-sdk/client-s3";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  DirectoryPermissionID,
  DirectoryPermissionType,
  DirectoryResourceID,
  FileRecordFE,
  IRequestListDirectoryPermissions,
} from "@officexapp/types";
import DirectoryPermissionAddDrawer, {
  PreExistingStateForEdit,
} from "./directory-permission.add";
import { LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN } from "../../framework/identity/constants";
import TagCopy from "../TagCopy";
import { set } from "lodash";
import {
  deleteDirectoryPermissionAction,
  listDirectoryPermissionsAction,
} from "../../redux-offline/permissions/permissions.actions";
import { DirectoryPermissionFEO } from "../../redux-offline/permissions/permissions.reducer";
import PermissionStatusMessage from "./directory-warning";
import { generateRedeemDirectoryPermitURL } from "./directory-permission.redeem";
import { useIdentitySystem } from "../../framework/identity";
import { useMultiUploader } from "../../framework/uploader/hook";
import {
  defaultBrowserCacheDiskID,
  defaultTempCloudSharingDiskID,
} from "../../api/dexie-database";
import { fileRawUrl_BTOA } from "../FreeFileSharePreview";
import {
  FileFEO,
  FolderFEO,
} from "../../redux-offline/directory/directory.reducer";
import { getNextUtcMidnight, urlSafeBase64Encode } from "../../api/helpers";

interface DirectorySharingDrawerProps {
  open: boolean;
  onClose: () => void;
  resourceID: DirectoryResourceID;
  resourceName: string;
  resource?: FileFEO | FolderFEO;
}

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface PermissionRecord {
  key: string;
  who: string;
  who_id: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canUpload: boolean;
  whenStart: number | null;
  whenEnd: number | null;
  isEditing: boolean;
  original: DirectoryPermissionFEO;
}

const DirectorySharingDrawer: React.FC<DirectorySharingDrawerProps> = ({
  open,
  onClose,
  resourceID,
  resourceName,
  resource,
}) => {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(window.location.href);
  const [searchText, setSearchText] = useState("");
  const { permissionMap, permissionIDs } = useSelector(
    (state: ReduxAppState) => ({
      permissionMap: state.directoryPermissions.permissionMap,
      permissionIDs:
        state.directoryPermissions.resourcePermissionsMap[resourceID] || [],
    })
  );

  //   const permissions = permissionIDs.map((pid) => permissionMap[pid]);
  const permissions = useMemo(() => {
    return permissionIDs
      .map((pid) => permissionMap[pid])
      .filter((p) => p.id.startsWith("DirectoryPermissionID_"));
  }, [permissionIDs, permissionMap]);

  const { wrapOrgCode, currentOrg, currentProfile } = useIdentitySystem();
  const [permissionForEdit, setPermissionForEdit] =
    useState<PreExistingStateForEdit>();

  const { uploadTargetDiskID } = useMultiUploader();
  const isOfflineDisk =
    uploadTargetDiskID === defaultTempCloudSharingDiskID ||
    uploadTargetDiskID === defaultBrowserCacheDiskID;

  const dispatch = useDispatch();
  useEffect(() => {
    if (uploadTargetDiskID === defaultTempCloudSharingDiskID && resource) {
      const _file = resource as FileRecordFE;
      const payload: fileRawUrl_BTOA = {
        note: `${currentProfile?.userID} shared a file with you`,
        original: _file,
      };
      setShareUrl(
        `${window.location.origin}${wrapOrgCode("/share/free-cloud-filesharing")}?redeem=${urlSafeBase64Encode(
          JSON.stringify(payload)
        )}`
      );
    } else {
      setShareUrl(window.location.href);
    }
  }, [resourceID]);

  useEffect(() => {
    const should_default_advanced_open = localStorage.getItem(
      LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN
    );

    if (parseInt(should_default_advanced_open || "0")) {
      setIsAdvancedOpen(true);
    }
  }, []);

  const [dataSource, setDataSource] = useState<PermissionRecord[]>([]);

  useEffect(() => {
    if (isOfflineDisk) return;
    if (permissions.length > 0) {
      const data = permissions
        .filter((p) => p)
        .map((p) => {
          let who = p.grantee_name || p.granted_to || "";
          if (p.metadata?.metadata_type === "DIRECTORY_PASSWORD") {
            who = "Password";
          }
          return {
            key: p.id,
            who,
            who_id: p.granted_to || "",
            canView: p.permission_types.includes(DirectoryPermissionType.VIEW),
            canEdit: p.permission_types.includes(DirectoryPermissionType.EDIT),
            canDelete: p.permission_types.includes(
              DirectoryPermissionType.DELETE
            ),
            canInvite: p.permission_types.includes(
              DirectoryPermissionType.INVITE
            ),
            canUpload: p.permission_types.includes(
              DirectoryPermissionType.UPLOAD
            ),
            whenStart: p.begin_date_ms,
            whenEnd: p.expiry_date_ms,
            isEditing: false,
            original: p,
          };
        });

      setDataSource(data);
    } else if (dataSource.length > 0) {
      setDataSource([]);
    }
  }, [permissions]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    message.success("Share URL copied to clipboard");
  };

  const toggleEditMode = (record: PermissionRecord) => {
    const grantee_type = record.original.granted_to.startsWith("GroupID_")
      ? "group"
      : "contact";
    setPermissionForEdit({
      id: record.original.id,
      resource_id: record.original.resource_id,
      granted_to: record.original.granted_to,
      grantee_type: grantee_type,
      grantee_name: record.original.grantee_name || record.original.granted_to,
      permission_types: record.original.permission_types,
      begin_date_ms: record.original.begin_date_ms,
      expiry_date_ms: record.original.expiry_date_ms,
      inheritable: record.original.inheritable,
      note: record.original.note,
      external_id: record.original.external_id,
      external_payload: record.original.external_payload,
      password: record.original.metadata.content.DirectoryPassword,
      redeem_code: record.original.redeem_code,
    });
    setIsAddDrawerOpen(true);
  };

  const handleRemove = (id: DirectoryPermissionID) => {
    // Dispatch delete action
    dispatch(
      deleteDirectoryPermissionAction({
        permission_id: id,
      })
    );

    // Reload permissions list after a short delay to allow the delete to process
    setTimeout(() => {
      const payload: IRequestListDirectoryPermissions = {
        filters: {
          resource_id: resourceID,
        },
      };
      dispatch(listDirectoryPermissionsAction(payload));
    }, 500);
  };

  const handleAddPermission = () => {
    setIsAddDrawerOpen(true);
  };

  const getPermissionSummary = (record: PermissionRecord) => {
    const permissions = [];
    if (record.canView) permissions.push("View");
    if (record.canEdit) permissions.push("Edit");
    if (record.canDelete) permissions.push("Delete");
    if (record.canInvite) permissions.push("Invite");

    return permissions.length ? permissions.join(", ") : "No permissions";
  };

  const getDateRangeSummary = (record: PermissionRecord) => {
    if (record.key === "1") return "Always";

    if (!record.whenStart && !record.whenEnd) return "No time limit";

    const startDate = record.whenStart
      ? new Date(record.whenStart).toLocaleDateString()
      : "Any time";
    const endDate = record.whenEnd
      ? new Date(record.whenEnd).toLocaleDateString()
      : "No end date";

    return `${startDate} to ${endDate}`;
  };

  const columns = [
    {
      title: "Who",
      dataIndex: "who",
      key: "who",
      width: "45%",
      render: (name: string, record: PermissionRecord) => (
        <span style={{ fontSize: "16px" }}>
          <Popover content={record.original.note || "Add Custom Notes"}>
            {name}
          </Popover>
          {record.who_id !== "PUBLIC" && (
            <TagCopy id={record.who_id} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
    },
    {
      title: "Can",
      key: "can",
      width: "25%",
      render: (_: any, record: PermissionRecord) => {
        return (
          <span style={{ fontSize: "14px" }}>
            {getPermissionSummary(record)}
          </span>
        );
      },
    },
    {
      title: "When",
      key: "when",
      width: "20%",
      render: (_: any, record: PermissionRecord) => {
        return (
          <span style={{ fontSize: "14px" }}>
            {getDateRangeSummary(record)}
          </span>
        );
      },
    },
    {
      title: () => {
        return (
          <Button
            onClick={handleAddPermission}
            icon={<PlusOutlined style={{ fontSize: "20px" }} />}
            disabled={isOfflineDisk}
          >
            Add
          </Button>
        );
      },
      key: "action",
      width: "10%",
      render: (_: any, record: PermissionRecord) => {
        const items: MenuProps["items"] = [];
        if (
          record.original.granted_to.startsWith(
            "PlaceholderPermissionGranteeID_"
          )
        ) {
          items.push({
            key: "magiclink",
            label: (
              <a
                onClick={() => {
                  const magicLink = generateRedeemDirectoryPermitURL({
                    fileURL: window.location.href,
                    wrapOrgCode,
                    permissionID: record.original.id,
                    resourceName: resourceName,
                    orgName: currentOrg?.nickname || "",
                    permissionTypes: record.original.permission_types,
                    resourceID: resourceID,
                    redeemCode: record.original.redeem_code || "",
                    daterange: {
                      begins_at: record.original.begin_date_ms,
                      expires_at: record.original.expiry_date_ms,
                    },
                  });
                  navigator.clipboard.writeText(magicLink);
                  message.success("Copied magic link!");
                }}
              >
                Copy Magic Link
              </a>
            ),
          });
        }
        if (record.original.metadata?.metadata_type === "DIRECTORY_PASSWORD") {
          items.push({
            key: "password",
            label: (
              <a
                onClick={() => {
                  navigator.clipboard.writeText(
                    record.original.metadata.content.DirectoryPassword
                  );
                  message.success("Copied password!");
                }}
              >
                Copy Password
              </a>
            ),
          });
        }
        items.push({
          key: "remove",
          label: (
            <Popconfirm
              title="Are you sure you want to remove this permission? This cannot be undone"
              onConfirm={() => handleRemove(record.original.id)}
            >
              <span>Remove</span>
            </Popconfirm>
          ),
        });

        return (
          <Space>
            <Button
              type="text"
              icon={
                record.isEditing ? (
                  <CheckOutlined style={{ fontSize: "20px" }} />
                ) : (
                  <EditOutlined style={{ fontSize: "20px" }} />
                )
              }
              onClick={() => toggleEditMode(record)}
              disabled={isOfflineDisk}
            />
            <Dropdown
              disabled={isOfflineDisk}
              menu={{ items }}
              trigger={["click"]}
            >
              <Button
                type="text"
                icon={<MoreOutlined style={{ fontSize: "20px" }} />}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <Drawer
      title="Share Directory"
      placement="right"
      onClose={onClose}
      open={open}
      width={700}
      footer={null}
    >
      <PermissionStatusMessage
        resource_id={resourceID}
        permissions={permissions}
      />
      <div style={{ marginBottom: "16px" }}>
        <Input
          value={shareUrl}
          readOnly
          size="large"
          variant="borderless"
          style={{ backgroundColor: "#fafafa" }}
          suffix={
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={handleCopyUrl}
              size="large"
              style={{ marginLeft: 8 }}
            >
              Copy Link
            </Button>
          }
        />
      </div>

      {/* Advanced Section */}
      <details
        style={{ marginTop: "16px" }}
        open={isAdvancedOpen}
        onToggle={(e) => {
          setIsAdvancedOpen(e.currentTarget.open);

          localStorage.setItem(
            LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN,
            e.currentTarget.open ? "1" : "0"
          );
        }}
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
          Advanced
        </summary>

        <Input
          placeholder="Search by name"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginTop: "16px", marginBottom: 8 }}
          prefix={<InfoCircleOutlined style={{ color: "#aaa" }} />}
          size="middle"
        />

        <Table
          dataSource={dataSource.filter((item) =>
            item.who.toLowerCase().includes(searchText.toLowerCase())
          )}
          columns={columns}
          pagination={false}
          rowKey="key"
          bordered={false}
          rowClassName={() => "permission-table-row"}
        />
      </details>

      <style>
        {`
          .permission-table-row td {
            padding: 16px 8px;
          }
          .ant-table-thead > tr > th {
            background-color: #fafafa;
            font-weight: bold;
            font-size: 16px;
          }
        `}
      </style>
      <DirectoryPermissionAddDrawer
        open={isAddDrawerOpen}
        onClose={() => {
          setIsAddDrawerOpen(false);
          setPermissionForEdit(undefined);
        }}
        onSubmitCallback={() => {
          setTimeout(() => {
            const payload: IRequestListDirectoryPermissions = {
              filters: {
                resource_id: resourceID,
              },
            };
            dispatch(listDirectoryPermissionsAction(payload));
          }, 500);
        }}
        resourceID={resourceID}
        resourceName={resourceName}
        preExistingStateForEdit={permissionForEdit}
      />
    </Drawer>
  );
};

export default DirectorySharingDrawer;
