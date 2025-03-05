import React, { useCallback, useEffect, useState } from "react";
import {
  Input,
  Avatar,
  Typography,
  AutoComplete,
  message,
  Button,
  Modal,
  Select,
  Form,
  Space,
  Popconfirm,
  Divider,
  Tag,
  Tooltip,
  Tabs,
  Collapse,
} from "antd";
import {
  CloseOutlined,
  FileOutlined,
  FolderOutlined,
  MenuOutlined,
  SearchOutlined,
  SwapOutlined,
  SyncOutlined,
  UserOutlined,
  ReloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { FileMetadata, FolderMetadata, useDrive } from "../../framework";
import { Link, useNavigate } from "react-router-dom";
import { trimToFolderPath, truncateMiddlePath } from "../../api/helpers";
import useScreenType from "react-screentype-hook";
import { generate } from "random-words"; // Import random-words library
import { useIdentity } from "../../framework/identity"; // Import corrected useIdentity hook
import {
  IndexDB_Profile,
  useSwitchOrgProfiles,
} from "../../api/switch-profiles";
import { shortenAddress } from "../../framework/identity_deprecated/evm-auth";

const { Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Helper function to generate a random seed phrase using BIP39 compatible words
const generateRandomSeed = () => {
  // Generate 12 random words for a standard BIP39 mnemonic
  return (generate(12) as string[]).join(" ");
};

interface HeaderProps {
  onSearch?: (value: string) => void;
  setSidebarVisible: (visible: boolean) => void;
}

const SearchHeader: React.FC<HeaderProps> = ({ setSidebarVisible }) => {
  const { importProfileFromSeed, profile, generateNewAccount } = useIdentity();
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([]);
  const { searchFilesQuery, reindexFuzzySearch } = useDrive();
  const navigate = useNavigate();
  const screenType = useScreenType();

  // User profile management states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "existing">("new");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );

  // Separate state for each tab
  const [newUserNickname, setNewUserNickname] = useState("Anonymous");
  const [newSeedPhrase, setNewSeedPhrase] = useState(generateRandomSeed());

  const [importUserNickname, setImportUserNickname] = useState("A Past Life");
  const [importSeedPhrase, setImportSeedPhrase] = useState("");

  // Shared editing nickname for existing user
  const [existingUserNickname, setExistingUserNickname] = useState("");

  const [activeTabKey, setActiveTabKey] = useState("newUser");

  // Separate preview states for each tab
  const [newUserPreviewAddresses, setNewUserPreviewAddresses] = useState({
    icpAddress: "",
    evmAddress: "",
  });

  const [importUserPreviewAddresses, setImportUserPreviewAddresses] = useState({
    icpAddress: "",
    evmAddress: "",
  });

  // Get multi org hook
  const {
    currentProfile,
    listOfProfiles,
    addProfile,
    updateProfile,
    removeProfile,
    selectProfile,
  } = useSwitchOrgProfiles();

  // Search functionality
  const handleSearch = useCallback(
    async (value: string) => {
      if (value.trim()) {
        const result = await searchFilesQuery(value, 10, 0);
        const newOptions = [
          ...result.folders.map((folder: FolderMetadata) => ({
            value: folder.fullFolderPath,
            label: (
              <Link
                to={`/drive/${encodeURIComponent(folder.fullFolderPath.replace("::", "/"))}`}
              >
                <FolderOutlined style={{ marginRight: 5 }} />
                {truncateMiddlePath(
                  folder.fullFolderPath.replace("::", "/"),
                  10,
                  20
                )}
              </Link>
            ),
          })),
          ...result.files.map((file: FileMetadata) => ({
            value: file.fullFilePath,
            label: (
              <Link
                to={`/drive/${encodeURIComponent(file.fullFilePath.replace("::", "/"))}`}
              >
                <FileOutlined />{" "}
                {truncateMiddlePath(
                  file.fullFilePath.replace("::", "/"),
                  10,
                  20
                )}
              </Link>
            ),
          })),
        ];
        setOptions(newOptions);
      } else {
        setOptions([]);
      }
    },
    [searchFilesQuery]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchValue);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, handleSearch]);

  // Effect to preview addresses based on current tab and seed phrase - now updated to use separate states
  useEffect(() => {
    const previewWalletAddresses = async () => {
      try {
        if (
          activeTabKey === "newUser" &&
          newSeedPhrase &&
          newSeedPhrase.trim() !== ""
        ) {
          // Preview for new user tab
          const tempProfile = await importProfileFromSeed(newSeedPhrase);
          setNewUserPreviewAddresses({
            icpAddress: tempProfile.icpAccount?.principal.toString() || "",
            evmAddress: tempProfile.evmAccount?.address || "",
          });
        } else if (
          activeTabKey === "importSeed" &&
          importSeedPhrase &&
          importSeedPhrase.trim() !== ""
        ) {
          // Preview for import seed tab
          const tempProfile = await importProfileFromSeed(importSeedPhrase);
          setImportUserPreviewAddresses({
            icpAddress: tempProfile.icpAccount?.principal.toString() || "",
            evmAddress: tempProfile.evmAccount?.address || "",
          });
        }
      } catch (error) {
        console.error("Error previewing addresses:", error);
        // Set the appropriate state based on active tab
        if (activeTabKey === "newUser") {
          setNewUserPreviewAddresses({
            icpAddress: "Invalid seed",
            evmAddress: "Invalid seed",
          });
        } else {
          setImportUserPreviewAddresses({
            icpAddress: "Invalid seed",
            evmAddress: "Invalid seed",
          });
        }
      }
    };

    previewWalletAddresses();
  }, [activeTabKey, newSeedPhrase, importSeedPhrase, importProfileFromSeed]);

  const onSelect = (value: string) => {
    const [storageLocation, ...pathParts] = value.split("::");
    navigate(
      `/drive/${encodeURIComponent(storageLocation)}/${encodeURIComponent(pathParts.join("/"))}`
    );
  };

  const renderSearchBar = () => {
    return (
      <AutoComplete
        options={options}
        onSelect={onSelect}
        onSearch={(value) => setSearchValue(value)}
        style={{ width: "100%", maxWidth: "500px" }}
        allowClear
      >
        <Input
          placeholder="Search files and folders"
          prefix={<SearchOutlined />}
          suffix={
            searchValue ? null : (
              <SyncOutlined
                onClick={() => {
                  message.info("Reindexing search data...");
                  reindexFuzzySearch();
                }}
              />
            )
          }
        />
      </AutoComplete>
    );
  };

  const renderUserOptions = () => {
    const options = [];

    // Current user option
    if (currentProfile) {
      options.push({
        value: currentProfile.userID,
        label: (
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Space>
              <UserOutlined />
              <span>{currentProfile.nickname || "Anonymous"}</span>
            </Space>
            <Tag color="blue">
              {shortenAddress(currentProfile.icpPublicAddress) ||
                shortenAddress(profile.icpAccount?.principal.toString() || "")}
            </Tag>
          </Space>
        ),
      });
    }

    // Other users
    listOfProfiles
      .filter(
        (profile) => !currentProfile || profile.userID !== currentProfile.userID
      )
      .forEach((profile) => {
        options.push({
          value: profile.userID,
          label: (
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Space>
                <UserOutlined />
                <span>{profile.nickname || "Anonymous"}</span>
              </Space>
              <Tag color="default">
                {shortenAddress(profile.icpPublicAddress)}
              </Tag>
            </Space>
          ),
        });
      });

    // Add new user option
    options.push({
      value: "add-profile",
      label: (
        <Space>
          <PlusOutlined
            onClick={() => {
              setIsModalVisible(true);
              setModalMode("new");
            }}
          />
          <span>Add Profile</span>
        </Space>
      ),
    });

    return options;
  };

  const UserSwitcher = () => {
    return (
      <Select
        showSearch
        placeholder="Switch Profile"
        filterOption={(input, option) =>
          (option?.label ?? "")
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        value={currentProfile ? currentProfile.userID : undefined}
        options={renderUserOptions()}
        onChange={(value) => {
          if (value === "add-profile") {
            setNewUserNickname("Anonymous");
            setImportUserNickname("A Past Life");
            setNewSeedPhrase(generateRandomSeed());
            setImportSeedPhrase("");
            setActiveTabKey("newUser");
            setModalMode("new");
            setIsModalVisible(true);
          } else {
            const profile = listOfProfiles.find((p) => p.userID === value);
            if (profile) {
              setSelectedProfileId(value);
              setExistingUserNickname(profile.nickname || "Anonymous");
              setModalMode("existing");
              setIsModalVisible(true);
            }
          }
        }}
        suffixIcon={<SwapOutlined />}
        variant="borderless"
        style={{
          margin: "16px",
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderRadius: "8px",
          minWidth: "250px",
        }}
        optionRender={(option) => option.label}
      />
    );
  };

  const renderPreviewSection = () => {
    // Select the appropriate preview addresses based on the active tab
    const previewAddresses =
      activeTabKey === "newUser"
        ? newUserPreviewAddresses
        : importUserPreviewAddresses;

    return (
      <details style={{ marginBottom: "8px" }}>
        <summary
          style={{
            cursor: "pointer",
            color: "#595959",
            fontSize: "14px",
            marginBottom: "4px",
            userSelect: "none",
          }}
        >
          Preview
        </summary>
        <div
          style={{
            padding: "0 12px",
            marginBottom: "8px",
            fontSize: "13px",
          }}
        >
          {activeTabKey === "newUser" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "8px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "70px",
                  }}
                >
                  {activeTabKey === "newUser" && (
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      onClick={() => setNewSeedPhrase(generateRandomSeed())}
                      size="small"
                      style={{ color: "#8c8c8c", padding: "0 4px" }}
                    />
                  )}
                </div>
                <Input
                  value="Auto-generated from random seed"
                  readOnly
                  variant="borderless"
                  style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "70px",
                  }}
                >
                  <span style={{ color: "#8c8c8c", marginRight: "4px" }}>
                    Seed
                  </span>
                </div>
                <Input
                  value={newSeedPhrase}
                  readOnly
                  variant="borderless"
                  style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
                  suffix={
                    <Typography.Text
                      copyable={{ text: newSeedPhrase }}
                      style={{ color: "#8c8c8c" }}
                    />
                  }
                />
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "70px",
              }}
            >
              <span style={{ color: "#8c8c8c", marginRight: "4px" }}>ICP</span>
            </div>
            <Input
              value={previewAddresses.icpAddress}
              readOnly
              variant="borderless"
              style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
              suffix={
                <Typography.Text
                  copyable={{ text: previewAddresses.icpAddress }}
                  style={{ color: "#8c8c8c" }}
                />
              }
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "70px",
              }}
            >
              <span style={{ color: "#8c8c8c" }}>EVM</span>
            </div>
            <Input
              value={previewAddresses.evmAddress}
              readOnly
              variant="borderless"
              style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
              suffix={
                <Typography.Text
                  copyable={{ text: previewAddresses.evmAddress }}
                  style={{ color: "#8c8c8c" }}
                />
              }
            />
          </div>
        </div>
      </details>
    );
  };
  const renderAddNewUserModal = () => (
    <Modal
      title="Add Profile"
      open={isModalVisible && modalMode === "new"}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsModalVisible(false)}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={
            activeTabKey === "importSeed" &&
            importUserPreviewAddresses.evmAddress == "Invalid seed"
          }
          onClick={async () => {
            try {
              // Determine which seed and nickname to use based on active tab
              const seedToUse =
                activeTabKey === "newUser" ? newSeedPhrase : importSeedPhrase;
              const nicknameToUse =
                activeTabKey === "newUser"
                  ? newUserNickname
                  : importUserNickname;

              // Create new anonymous user or import from seed
              const newAuthProfile = await importProfileFromSeed(seedToUse);

              // Add profile to local storage
              const newProfile = await addProfile({
                icpPublicAddress: newAuthProfile.icpSlug,
                emvPublicAddress: newAuthProfile.evmSlug,
                seedPhrase: seedToUse,
                note: "",
                avatar: "",
                nickname: nicknameToUse,
              });

              // Select the new profile
              selectProfile(newProfile);

              message.success(`User ${nicknameToUse} added successfully!`);
              setIsModalVisible(false);
            } catch (error) {
              console.error("Error adding user:", error);
              message.error("Failed to add user. Please try again.");
            }
          }}
        >
          {activeTabKey === "newUser" ? "Create Profile" : "Import Profile"}
        </Button>,
      ]}
      width={500}
    >
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
        <TabPane tab="New Profile" key="newUser">
          <Form layout="vertical" style={{ marginBottom: "12px" }}>
            <Form.Item label="Nickname" style={{ marginBottom: "12px" }}>
              <Input
                value={newUserNickname}
                onChange={(e) => setNewUserNickname(e.target.value)}
                placeholder="Enter nickname"
              />
            </Form.Item>
          </Form>

          {renderPreviewSection()}
        </TabPane>

        <TabPane tab="Import from Seed" key="importSeed">
          <Form layout="vertical">
            <Form.Item label="Nickname" style={{ marginBottom: "12px" }}>
              <Input
                value={importUserNickname}
                onChange={(e) => setImportUserNickname(e.target.value)}
                placeholder="Enter nickname"
              />
            </Form.Item>

            <Form.Item label="Seed Phrase" style={{ marginBottom: "16px" }}>
              <Input.TextArea
                value={importSeedPhrase}
                onChange={(e) => setImportSeedPhrase(e.target.value)}
                placeholder="Enter 12-word seed phrase"
                rows={2}
              />
            </Form.Item>
          </Form>

          {renderPreviewSection()}
        </TabPane>
      </Tabs>
    </Modal>
  );

  const renderExistingUserPreviewSection = (profile: IndexDB_Profile) => {
    return (
      <details style={{ marginBottom: "8px" }}>
        <summary
          style={{
            cursor: "pointer",
            color: "#595959",
            fontSize: "14px",
            marginBottom: "4px",
            userSelect: "none",
          }}
        >
          Preview
        </summary>
        <div
          style={{
            padding: "0 12px",
            marginBottom: "8px",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "70px",
              }}
            >
              <span style={{ color: "#8c8c8c", marginRight: "4px" }}>ICP</span>
            </div>
            <Input
              value={profile.icpPublicAddress}
              readOnly
              variant="borderless"
              style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
              suffix={
                <Typography.Text
                  copyable={{ text: profile.icpPublicAddress }}
                  style={{ color: "#8c8c8c" }}
                />
              }
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "70px",
              }}
            >
              <span style={{ color: "#8c8c8c" }}>EVM</span>
            </div>
            <Input
              value={profile.emvPublicAddress}
              readOnly
              variant="borderless"
              style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
              suffix={
                <Typography.Text
                  copyable={{ text: profile.emvPublicAddress }}
                  style={{ color: "#8c8c8c" }}
                />
              }
            />
          </div>
        </div>
      </details>
    );
  };

  const renderExistingUserModal = () => {
    const profile = listOfProfiles.find((p) => p.userID === selectedProfileId);
    const nicknameChanged =
      profile && profile.nickname !== existingUserNickname;

    if (!profile) return null;

    return (
      <Modal
        title="Switch Profile"
        open={isModalVisible && modalMode === "existing"}
        onCancel={() => setIsModalVisible(false)}
        closeIcon={<CloseOutlined />}
        width={500}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Nickname">
            <Input
              value={existingUserNickname}
              onChange={(e) => setExistingUserNickname(e.target.value)}
              placeholder="Enter nickname"
            />
          </Form.Item>

          {renderExistingUserPreviewSection(profile)}

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
                title="Are you sure you want to remove this profile?"
                description="This action cannot be undone."
                onConfirm={async () => {
                  try {
                    if (selectedProfileId) {
                      await removeProfile(selectedProfileId);
                      message.success("Profile removed successfully!");
                      setIsModalVisible(false);
                    }
                  } catch (error) {
                    console.error("Error removing profile:", error);
                    message.error(
                      "Failed to remove profile. Please try again."
                    );
                  }
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  type="text"
                  size="small"
                  icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
                >
                  Remove
                </Button>
              </Popconfirm>
            </div>

            <div>
              <Space>
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  key="confirm"
                  type="primary"
                  onClick={async () => {
                    if (!selectedProfileId) return;

                    // If the nickname has been edited, update the profile first
                    if (nicknameChanged) {
                      try {
                        const updatedProfile = {
                          ...profile,
                          nickname: existingUserNickname,
                        };
                        await updateProfile(updatedProfile);
                        message.success(
                          `Profile updated to ${existingUserNickname} successfully!`
                        );
                      } catch (error) {
                        console.error("Error updating profile:", error);
                        message.error(
                          "Failed to update profile. Please try again."
                        );
                        return;
                      }
                    }

                    // If we're not already using this profile, switch to it
                    if (currentProfile?.userID !== profile.userID) {
                      try {
                        // First import the seed to the identity provider
                        await importProfileFromSeed(profile.seedPhrase);

                        // Then switch the local profile
                        selectProfile(profile);

                        message.success(
                          `Switched to ${existingUserNickname || "Anonymous"} (${shortenAddress(
                            profile.icpPublicAddress
                          )})`
                        );
                      } catch (error) {
                        console.error("Error switching profile:", error);
                        message.error(
                          "Failed to switch profile. Please try again."
                        );
                        return;
                      }
                    }

                    setIsModalVisible(false);
                  }}
                >
                  {nicknameChanged ? "Update Profile" : "Switch Profile"}
                </Button>
              </Space>
            </div>
          </div>
        </Form>
      </Modal>
    );
  };

  if (screenType.isMobile) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#fbfbfb",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "8px 0px",
        }}
      >
        {screenType.isMobile && (
          <Button
            icon={<MenuOutlined />}
            onClick={() => setSidebarVisible(true)}
            style={{ margin: "0px 8px 0px 8px" }}
          />
        )}
        {renderSearchBar()}
        {renderAddNewUserModal()}
        {renderExistingUserModal()}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#fbfbfb",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0px",
      }}
    >
      <div style={{ flex: 1 }}>{renderSearchBar()}</div>

      <div className="header-right">
        {UserSwitcher()}
        <Link to="/settings">
          <Avatar icon={<UserOutlined />} size="large" />
        </Link>
      </div>

      {renderAddNewUserModal()}
      {renderExistingUserModal()}
    </div>
  );
};

export default SearchHeader;
