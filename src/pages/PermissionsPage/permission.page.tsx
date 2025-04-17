import { useNavigate, useParams } from "react-router-dom";
import PermissionsTab from "./permission.tab";
import { useDispatch, useSelector } from "react-redux";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import { useEffect, useState } from "react";
import {
  getSystemPermissionAction,
  getDirectoryPermissionAction,
} from "../../redux-offline/permissions/permissions.actions";
import { Button, Layout, Radio } from "antd";
import { Content } from "antd/es/layout/layout";
import useScreenType from "react-screentype-hook";
import { LeftOutlined } from "@ant-design/icons";
import { useIdentitySystem } from "../../framework/identity";

const PermissionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wrapOrgCode } = useIdentitySystem();
  const screenType = useScreenType();
  const params = useParams();
  const permissionID = params.permissionID;
  const permissionVariant = params.permissionVariant;

  // Get the correct permission based on selected type
  const systemPermission = useSelector(
    (state: ReduxAppState) =>
      state.systemPermissions.permissionMap[permissionID || ""]
  );

  const permission = systemPermission;

  if (!permission) {
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
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate(wrapOrgCode("/resources/permissions"))}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          Search Permissions
        </Button>
      </div>
      <Content
        style={{
          padding: screenType.isMobile ? "0px" : "0 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <PermissionsTab
          permissionCache={permission}
          onDelete={() => {
            navigate(wrapOrgCode(`/resources/permissions`));
          }}
        />
      </Content>
    </Layout>
  );
};

export default PermissionsPage;
