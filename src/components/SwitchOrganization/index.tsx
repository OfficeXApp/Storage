import React, { useState, useEffect } from "react";
import {
  SwapOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  FolderOutlined,
  LinkOutlined,
  CloudOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Select,
  Space,
  Modal,
  Form,
  Input,
  Button,
  Popconfirm,
  message,
  Tag,
  Tabs,
  Tooltip,
} from "antd";
import {
  IndexDB_Organization,
  useIdentitySystem,
} from "../../framework/identity";
import { DriveID } from "@officexapp/types";
import { shortenAddress } from "../../framework/identity/constants";

const { TabPane } = Tabs;

const OrganizationSwitcher = () => {
  const {
    currentOrg,
    currentProfile,
    listOfOrgs,
    listOfProfiles,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    switchProfile,
  } = useIdentitySystem();

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("new"); // "new" or "edit-enter"
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [activeTabKey, setActiveTabKey] = useState("newOrg");
  const [enterOrgTabKey, setEnterOrgTabKey] = useState("enterOrg");

  // Selected profile for organization entry
  const [selectedProfileId, setSelectedProfileId] = useState("");

  // Form states for new organization
  const [newOrgNickname, setNewOrgNickname] = useState("");

  // Form states for existing organization import
  const [existingOrgNickname, setExistingOrgNickname] = useState("");
  const [existingOrgEndpoint, setExistingOrgEndpoint] = useState("");

  // Form states for editing
  const [editOrgNickname, setEditOrgNickname] = useState("");
  const [editOrgEndpoint, setEditOrgEndpoint] = useState("");
  const [editOrgNote, setEditOrgNote] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Preview states
  const [previewEndpoint, setPreviewEndpoint] = useState("");

  // Effect to set existing org details when editing
  useEffect(() => {
    if (modalMode === "edit-enter" && selectedOrgId) {
      const org = listOfOrgs.find(
        (org) => org.driveID === selectedOrgId
      ) as IndexDB_Organization;
      if (org) {
        setEditOrgNickname(org.nickname || "");
        setEditOrgEndpoint(org.endpoint || "");
        setEditOrgNote(org.note || "");
        setHasChanges(false); // Reset changes flag when loading org details

        // Set default selected profile to current profile
        if (org.defaultProfile) {
          setSelectedProfileId(org.defaultProfile);
        } else if (currentProfile) {
          setSelectedProfileId(currentProfile.userID);
        } else if (listOfProfiles.length > 0) {
          setSelectedProfileId(listOfProfiles[0].userID);
        }
      }
    }
  }, [modalMode, selectedOrgId, listOfOrgs, currentProfile, listOfProfiles]);

  // Track changes to org details
  useEffect(() => {
    if (modalMode === "edit-enter" && selectedOrgId) {
      const org = listOfOrgs.find(
        (org) => org.driveID === selectedOrgId
      ) as IndexDB_Organization;
      if (org) {
        setHasChanges(
          editOrgNickname !== org.nickname ||
            editOrgEndpoint !== org.endpoint ||
            editOrgNote !== org.note
        );
      }
    }
  }, [
    editOrgNickname,
    editOrgEndpoint,
    editOrgNote,
    selectedOrgId,
    listOfOrgs,
    modalMode,
  ]);

  const handleOrgSelect = (driveID: string) => {
    if (driveID === "add-organization") {
      // Reset form states
      setNewOrgNickname("");
      setExistingOrgNickname("");
      setExistingOrgEndpoint("");
      setPreviewEndpoint("");
      setActiveTabKey("newOrg");
      setModalMode("new");
      setIsModalVisible(true);
    } else {
      // For entering or editing an existing organization
      setSelectedOrgId(driveID);
      setModalMode("edit-enter");
      setEnterOrgTabKey("enterOrg");
      setIsModalVisible(true);
    }
  };

  // Function to normalize URL (trim trailing slash)
  const normalizeUrl = (url: string): string => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
  };

  // Validate if string is a URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleCreateNewOrg = async () => {
    try {
      // Generate a unique drive ID for the new organization
      const newDriveID = `DriveID_${newOrgNickname.replace(/\s+/g, "_")}_${Date.now()}`;

      // Create the new organization
      const newOrg = await createOrganization({
        driveID: newDriveID as DriveID,
        nickname: newOrgNickname,
        icpPublicAddress: newDriveID, // This would come from identity system or be generated
        endpoint: "https://api.officex.app",
        note: `Created on ${new Date().toLocaleDateString()}`,
      });

      // Switch to the new organization
      await switchOrganization(newOrg, "");

      message.success(`Organization "${newOrgNickname}" created successfully!`);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error creating organization:", error);
      message.error("Failed to create organization. Please try again.");
    }
  };

  const handleImportExistingOrg = async () => {
    if (!isValidUrl(existingOrgEndpoint)) {
      message.error("Please enter a valid URL for the endpoint");
      return;
    }

    try {
      const normalizedEndpoint = normalizeUrl(existingOrgEndpoint);

      // Generate a unique drive ID for the imported organization
      const newDriveID = `DriveID_${existingOrgNickname.replace(/\s+/g, "_")}_${Date.now()}`;

      // Create the imported organization
      const newOrg = await createOrganization({
        driveID: newDriveID as DriveID,
        nickname: existingOrgNickname,
        icpPublicAddress: "", // This would be fetched or derived from the endpoint
        endpoint: normalizedEndpoint,
        note: `Imported on ${new Date().toLocaleDateString()}`,
      });

      // Switch to the imported organization
      await switchOrganization(newOrg, "");

      message.success(
        `Organization "${existingOrgNickname}" imported successfully!`
      );
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error importing organization:", error);
      message.error("Failed to import organization. Please try again.");
    }
  };

  const handleUpdateOrg = async () => {
    try {
      const org = listOfOrgs.find(
        (org) => org.driveID === selectedOrgId
      ) as IndexDB_Organization;

      // Validate endpoint URL if it has changed
      if (
        editOrgEndpoint &&
        editOrgEndpoint !== org.endpoint &&
        !isValidUrl(editOrgEndpoint)
      ) {
        message.error("Please enter a valid URL for the endpoint");
        return;
      }

      if (org) {
        const normalizedEndpoint = editOrgEndpoint
          ? normalizeUrl(editOrgEndpoint)
          : org.endpoint;

        const updatedOrg = {
          ...org,
          nickname: editOrgNickname || org.nickname,
          endpoint: normalizedEndpoint,
          note: editOrgNote,
        };

        await updateOrganization(updatedOrg);
        message.success(
          `Organization "${editOrgNickname}" updated successfully!`
        );
        setHasChanges(false);

        // close the modal
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      message.error("Failed to update organization. Please try again.");
    }
  };

  const handleDeleteOrg = async () => {
    try {
      if (selectedOrgId) {
        await deleteOrganization(selectedOrgId);
        message.success("Organization removed successfully!");
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      message.error("Failed to remove organization. Please try again.");
    }
  };

  const handleEnterOrg = async (orgId: string) => {
    const org = listOfOrgs.find(
      (org) => org.driveID === orgId
    ) as IndexDB_Organization;

    const profile = listOfProfiles.find(
      (profile) => profile.userID === selectedProfileId
    );

    console.log(
      `Entering org ${org.nickname} with profile ${profile?.nickname}`
    );

    if (org) {
      // Switch profile if needed and if a valid profile is selected
      if (profile) {
        await switchProfile(profile);
      }

      // Switch to the organization
      await switchOrganization(org, profile?.userID);
      message.success(`Entered "${org.nickname}" organization`);
      setIsModalVisible(false);
    }
  };

  const renderPreviewSection = (endpoint: string) => {
    return (
      <details style={{ marginBottom: "12px", marginTop: "-16px" }}>
        <summary
          style={{
            cursor: "pointer",
            color: "#595959",
            fontSize: "14px",
            marginBottom: "4px",
            userSelect: "none",
          }}
        >
          Advanced
        </summary>
        <Form.Item
          label={
            <Space>
              Endpoint URL
              <Tooltip title="Enter the endpoint URL of the existing organization. Leave empty for offline local org">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          style={{ marginTop: "8px" }}
        >
          <Input
            value={endpoint || ""}
            onChange={(e) => setPreviewEndpoint(e.target.value)}
            placeholder="https://api.officex.app"
            style={{ flex: 1, color: "#8c8c8c" }}
            prefix={<LinkOutlined />}
          />
        </Form.Item>
      </details>
    );
  };

  const renderOrganizationOptions = () => {
    const options = [];

    // Current organization option
    if (currentOrg) {
      const typedCurrentOrg = currentOrg as unknown as IndexDB_Organization;
      options.push({
        value: typedCurrentOrg.driveID,
        label: (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {typedCurrentOrg.nickname || "Unnamed Organization"}
            </span>
            <Tag style={{ flexShrink: 0, marginLeft: "8px" }}>
              {shortenAddress(typedCurrentOrg.icpPublicAddress)}
            </Tag>
          </div>
        ),
      });
    }

    // Other organizations
    listOfOrgs
      .filter(
        (org) =>
          !currentOrg ||
          org.driveID !==
            (currentOrg as unknown as IndexDB_Organization).driveID
      )
      .forEach((org) => {
        const typedOrg = org as unknown as IndexDB_Organization;
        options.push({
          value: typedOrg.driveID,
          label: (
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {typedOrg.nickname || "Unnamed Organization"}
              </span>
              <Tag style={{ flexShrink: 0, marginLeft: "8px" }}>
                {shortenAddress(typedOrg.icpPublicAddress)}
              </Tag>
            </div>
          ),
        });
      });

    // Add new organization option
    options.push({
      value: "add-organization",
      label: (
        <Space>
          <PlusOutlined />
          <span>Add Organization</span>
        </Space>
      ),
    });

    return options;
  };

  const renderAddOrgModal = () => (
    <Modal
      title="Add Organization"
      open={isModalVisible && modalMode === "new"}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={500}
    >
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
        <TabPane tab="Create New" key="newOrg">
          <Form layout="vertical">
            <Form.Item
              label={<Space>Organization Name</Space>}
              required
              style={{ marginTop: "8px" }}
            >
              <Input
                value={newOrgNickname}
                onChange={(e) => setNewOrgNickname(e.target.value)}
                placeholder="Enter organization nickname"
              />
            </Form.Item>

            {renderPreviewSection("")}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <Space>
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleCreateNewOrg}
                  disabled={!newOrgNickname.trim()}
                >
                  Create Organization
                </Button>
              </Space>
            </div>
          </Form>
        </TabPane>

        <TabPane tab="Add Existing Organization" key="existingOrg">
          <Form layout="vertical">
            <Form.Item
              label={
                <Space>
                  Organization Name
                  <Tooltip title="Enter a nickname for this organization. Only you will see this.">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              required
              style={{ marginTop: "8px" }}
            >
              <Input
                value={existingOrgNickname}
                onChange={(e) => setExistingOrgNickname(e.target.value)}
                placeholder="Enter organization nickname"
              />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  Endpoint URL
                  <Tooltip title="Enter the endpoint URL of the existing organization">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              required
              style={{ marginTop: "-8px" }}
            >
              <Input
                value={existingOrgEndpoint}
                onChange={(e) => {
                  setExistingOrgEndpoint(e.target.value);
                  setPreviewEndpoint(e.target.value);
                }}
                placeholder="https://api.officex.app"
                prefix={<LinkOutlined />}
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <Space>
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleImportExistingOrg}
                  disabled={
                    !existingOrgNickname.trim() || !existingOrgEndpoint.trim()
                  }
                >
                  Add Existing Organization
                </Button>
              </Space>
            </div>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );

  const renderProfileOptions = () => {
    return listOfProfiles.map((profile) => ({
      value: profile.userID,
      label: (
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <UserOutlined />
            <span>{profile.nickname || "Anonymous"}</span>
          </Space>
          <Tag
            color={
              profile.userID === currentProfile?.userID ? "blue" : "default"
            }
          >
            {shortenAddress(profile.icpPublicAddress)}
          </Tag>
        </Space>
      ),
    }));
  };

  const renderEditEnterOrgModal = () => {
    const org = listOfOrgs.find(
      (org) => org.driveID === selectedOrgId
    ) as IndexDB_Organization;

    if (!org) return null;
    return (
      <Modal
        title={
          <span>
            {org.nickname}{" "}
            <Tag style={{ marginLeft: "8px" }}>
              {shortenAddress(org.icpPublicAddress)}
            </Tag>
          </span>
        }
        open={isModalVisible && modalMode === "edit-enter"}
        onCancel={() => setIsModalVisible(false)}
        closeIcon={<CloseOutlined />}
        footer={null}
        width={500}
      >
        <Tabs activeKey={enterOrgTabKey} onChange={setEnterOrgTabKey}>
          <TabPane tab="Enter Organization" key="enterOrg">
            <Form layout="vertical">
              <Form.Item
                label={`Enter as Profile:`}
                style={{ marginBottom: "16px" }}
              >
                <Select
                  style={{ width: "100%" }}
                  options={renderProfileOptions()}
                  value={selectedProfileId}
                  onChange={setSelectedProfileId}
                />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "24px",
                }}
              >
                <Space>
                  <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button
                    key="enter"
                    type="primary"
                    onClick={() => handleEnterOrg(selectedOrgId)}
                  >
                    Enter Organization
                  </Button>
                </Space>
              </div>
            </Form>
          </TabPane>

          <TabPane tab="Edit Org" key="editOrg">
            <Form layout="vertical">
              <Form.Item
                label={
                  <Space>
                    Organization Name
                    <Tooltip title="Edit the organization nickname">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                style={{ marginTop: "8px" }}
              >
                <Input
                  value={editOrgNickname}
                  onChange={(e) => setEditOrgNickname(e.target.value)}
                  placeholder="Enter organization nickname"
                  prefix={<FolderOutlined />}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    Endpoint URL
                    <Tooltip title="Edit the endpoint URL of this organization">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  value={editOrgEndpoint}
                  onChange={(e) => {
                    setEditOrgEndpoint(e.target.value);
                    setPreviewEndpoint(e.target.value);
                  }}
                  placeholder="https://api.officex.app"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>

              {/* Custom footer with proper alignment */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "24px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <Popconfirm
                    title="Are you sure you want to remove this organization?"
                    description="This action cannot be undone."
                    onConfirm={handleDeleteOrg}
                    okText="Yes"
                    cancelText="No"
                    disabled={listOfOrgs.length <= 1}
                  >
                    <Button
                      danger
                      type="text"
                      size="small"
                      icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
                      disabled={listOfOrgs.length <= 1}
                    >
                      Remove
                    </Button>
                  </Popconfirm>
                </div>

                <div>
                  <Space>
                    <Button
                      key="cancel"
                      onClick={() => setIsModalVisible(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      key="update"
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleUpdateOrg}
                      disabled={!editOrgNickname.trim() || !hasChanges}
                    >
                      Update
                    </Button>
                  </Space>
                </div>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  return (
    <>
      <Select
        showSearch
        placeholder="Switch Organization"
        filterOption={(input, option) => {
          // Get the organization data
          const orgId = option?.value;
          if (orgId === "add-organization") {
            // Special case for "Add Organization" option
            return "add organization".includes(input.toLowerCase());
          }

          // Find the organization by ID
          const org = listOfOrgs.find((org) => org.driveID === orgId);
          if (!org) return false;

          // Search in nickname and ICP address
          const nickname = (org.nickname || "").toLowerCase();
          const icpAddress = (org.icpPublicAddress || "").toLowerCase();
          const inputLower = input.toLowerCase();

          return (
            nickname.includes(inputLower) || icpAddress.includes(inputLower)
          );
        }}
        value={(currentOrg as unknown as IndexDB_Organization)?.driveID}
        options={renderOrganizationOptions()}
        onChange={(value) => {
          if (value === "add-organization") {
            setNewOrgNickname("");
            setExistingOrgNickname("");
            setExistingOrgEndpoint("");
            setActiveTabKey("newOrg");
            setModalMode("new");
            setIsModalVisible(true);
          } else {
            // Show the entry modal for the selected organization
            setSelectedOrgId(value);
            setModalMode("edit-enter");
            setEnterOrgTabKey("enterOrg"); // Default to enter tab
            setIsModalVisible(true);
          }
        }}
        suffixIcon={<SwapOutlined />}
        variant="borderless"
        style={{
          margin: "8px",
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderRadius: "8px",
          width: "calc(100% - 16px)",
        }}
        dropdownStyle={{
          minWidth: "300px", // Match the width of the select component
          maxWidth: "400px",
        }}
        listItemHeight={40}
        listHeight={256}
      />

      {renderAddOrgModal()}
      {renderEditEnterOrgModal()}
    </>
  );
};

export default OrganizationSwitcher;
