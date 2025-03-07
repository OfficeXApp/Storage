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
  InfoCircleOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { FileMetadata, FolderMetadata, useDrive } from "../../framework";
import { Link, useNavigate } from "react-router-dom";
import { trimToFolderPath, truncateMiddlePath } from "../../api/helpers";
import useScreenType from "react-screentype-hook";
import { generate } from "random-words"; // Import random-words library
import { useIdentitySystem } from "../../framework/identity"; // Import corrected useIdentity hook
import { IndexDB_Profile } from "../../framework/identity";
import { shortenAddress } from "../../framework/identity/constants";
import { UserID } from "@officexapp/types";
import { debounce } from "lodash";

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
  const {
    currentProfile,
    deriveProfileFromSeed,
    readProfile,
    listOfOrgs,
    createOrganization,
    createApiKey,
    switchOrganization,
  } = useIdentitySystem();
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([]);
  const { searchFilesQuery, reindexFuzzySearch } = useDrive();
  const navigate = useNavigate();
  const screenType = useScreenType();

  // User currentProfile management states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "existing">("new");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const [importApiLoading, setImportApiLoading] = useState(false);
  const [importApiError, setImportApiError] = useState<string | null>(null);
  const [importApiPreviewData, setImportApiPreviewData] = useState({
    icpAddress: "",
    evmAddress: "",
    userID: "",
    driveID: "",
    isOwner: false,
    nickname: "",
    driveNickname: "",
  });

  // Separate state for each tab
  const [newUserNickname, setNewUserNickname] = useState("Anonymous");
  const [newSeedPhrase, setNewSeedPhrase] = useState(generateRandomSeed());

  const [importUserNickname, setImportUserNickname] = useState("A Past Life");
  const [importSeedPhrase, setImportSeedPhrase] = useState("");

  const [importApiUserNickname, setImportApiUserNickname] = useState("");
  const [importApiOrgNickname, setImportApiOrgNickname] = useState("");
  const [importApiKey, setImportApiKey] = useState("");

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
    listOfProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
  } = useIdentitySystem();

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
          const tempProfile = await deriveProfileFromSeed(newSeedPhrase);
          setNewUserPreviewAddresses({
            icpAddress: tempProfile.icpPublicAddress,
            evmAddress: tempProfile.evmPublicAddress,
          });
        } else if (
          activeTabKey === "importSeed" &&
          importSeedPhrase &&
          importSeedPhrase.trim() !== ""
        ) {
          // Preview for import seed tab
          const tempProfile = await deriveProfileFromSeed(importSeedPhrase);
          setImportUserPreviewAddresses({
            icpAddress: tempProfile.icpPublicAddress,
            evmAddress: tempProfile.evmPublicAddress,
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
  }, [activeTabKey, newSeedPhrase, importSeedPhrase, deriveProfileFromSeed]);

  // if (!currentProfile) {
  //   return null;
  // }

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
              {shortenAddress(currentProfile.icpPublicKey)}
            </Tag>
          </Space>
        ),
      });
    }

    // Other users
    listOfProfiles
      .filter(
        (profile) => !profile || profile.userID !== currentProfile?.userID
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
      value: "add-currentProfile",
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
        filterOption={(input, option) => {
          // Get the profile associated with this option
          const profile = listOfProfiles.find(
            (p) => p.userID === option?.value
          );

          // If it's the "add profile" option
          if (option?.value === "add-currentProfile") {
            return "add profile".includes(input.toLowerCase());
          }

          // If we have a profile, check if input matches nickname or address
          if (profile) {
            const nickname = (profile.nickname || "Anonymous").toLowerCase();
            const icpAddress = profile.icpPublicAddress.toLowerCase();
            const inputLower = input.toLowerCase();

            return (
              nickname.includes(inputLower) ||
              icpAddress.includes(inputLower) ||
              shortenAddress(profile.icpPublicAddress)
                .toLowerCase()
                .includes(inputLower)
            );
          }

          return false;
        }}
        value={currentProfile ? currentProfile.userID : undefined}
        options={renderUserOptions()}
        onChange={(value: UserID) => {
          console.log(`Clicked on `, value);
          if (value === "add-currentProfile") {
            setNewUserNickname("Anonymous");
            setImportUserNickname("A Past Life");
            setNewSeedPhrase(generateRandomSeed());
            setImportSeedPhrase("");
            setActiveTabKey("newUser");
            setModalMode("new");
            setIsModalVisible(true);
          } else {
            const currentProfile = listOfProfiles.find(
              (p) => p.userID === value
            );
            if (currentProfile) {
              setSelectedProfileId(value);
              setExistingUserNickname(currentProfile.nickname || "Anonymous");
              setModalMode("existing");
              setIsModalVisible(true);
            }
          }
        }}
        suffixIcon={<SwapOutlined />}
        variant="borderless"
        style={{
          margin: "0px 8px",
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
  const renderApiLoginPreviewSection = () => {
    return (
      <details style={{ marginBottom: "8px" }} open>
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
          {importApiLoading ? (
            <div style={{ textAlign: "center", padding: "10px" }}>
              <SyncOutlined spin />
              <span style={{ marginLeft: "8px" }}>Verifying password...</span>
            </div>
          ) : importApiError ? (
            <div style={{ color: "#ff4d4f", padding: "10px" }}>
              {importApiError}
            </div>
          ) : importApiPreviewData.userID ? (
            <>
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
                    Org Name
                  </span>
                </div>
                <Input
                  value={importApiOrgNickname}
                  onChange={(e) => setImportApiOrgNickname(e.target.value)}
                  placeholder="Enter organization nickname"
                  variant="borderless"
                  style={{
                    flex: 1,
                    color: "#1f1f1f",
                    padding: "0",
                    borderBottom: "1px dashed #d9d9d9",
                    borderRadius: 0,
                  }}
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
                    Nickname
                  </span>
                </div>
                <Input
                  value={importApiUserNickname}
                  onChange={(e) => setImportApiUserNickname(e.target.value)}
                  placeholder="Enter nickname"
                  variant="borderless"
                  style={{
                    flex: 1,
                    color: "#1f1f1f",
                    padding: "0",
                    borderBottom: "1px dashed #d9d9d9",
                    borderRadius: 0,
                  }}
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
                    ICP
                  </span>
                </div>
                <Input
                  value={importApiPreviewData.icpAddress}
                  readOnly
                  variant="borderless"
                  style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
                  suffix={
                    <Typography.Text
                      copyable={{ text: importApiPreviewData.icpAddress }}
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
                  value={importApiPreviewData.evmAddress}
                  readOnly
                  variant="borderless"
                  style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
                  suffix={
                    <Typography.Text
                      copyable={{ text: importApiPreviewData.evmAddress }}
                      style={{ color: "#8c8c8c" }}
                    />
                  }
                />
              </div>
            </>
          ) : (
            <div
              style={{ padding: "10px", color: "#8c8c8c", textAlign: "center" }}
            >
              Enter a valid password to see account details
            </div>
          )}
        </div>
      </details>
    );
  };
  const debouncedFetchWhoAmI = useCallback(
    debounce(async (passwordInput: string) => {
      if (!passwordInput || passwordInput.trim() === "") {
        setImportApiPreviewData({
          icpAddress: "",
          evmAddress: "",
          userID: "",
          driveID: "",
          isOwner: false,
          nickname: "",
          driveNickname: "",
        });
        setImportApiLoading(false);
        return;
      }

      try {
        // Parse the new format DriveID_abc123:password123@https://endpoint.com
        // First check for the colon to separate driveID from password
        const colonIndex = passwordInput.indexOf(":");
        const atSymbolIndex = passwordInput.lastIndexOf("@");

        if (
          colonIndex === -1 ||
          atSymbolIndex === -1 ||
          atSymbolIndex === passwordInput.length - 1
        ) {
          throw new Error(
            "Invalid format. Expected: {drive}:{password}@{endpoint} (e.g. DriveID_abc123:password123@https://endpoint.com)"
          );
        }

        // Extract driveID, password and endpoint
        const driveID = passwordInput.substring(0, colonIndex).trim();
        const password = passwordInput
          .substring(colonIndex + 1, atSymbolIndex)
          .trim();
        let endpoint = passwordInput.substring(atSymbolIndex + 1).trim();

        // Validate driveID
        if (!driveID.startsWith("DriveID_")) {
          throw new Error(
            "Invalid Drive ID format. Expected format starts with 'DriveID_'"
          );
        }

        // Remove trailing slash if present in endpoint
        if (endpoint.endsWith("/")) {
          endpoint = endpoint.slice(0, -1);
        }

        // Construct the whoami URL with the specific drive ID
        const whoamiUrl = `${endpoint}/v1/${driveID}/organization/whoami`;

        // Important: Only the password part should go in the Authorization header, not the driveID
        const response = await fetch(whoamiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${password}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);

        // Handle nested structure where data is inside ok.data
        if (data && data.ok && data.ok.data) {
          const whoAmI = data.ok.data;
          setImportApiPreviewData({
            icpAddress: whoAmI.icp_principal,
            evmAddress: whoAmI.evm_public_address || "",
            userID: whoAmI.userID,
            driveID: driveID,
            isOwner: whoAmI.is_owner,
            nickname: whoAmI.nickname || "",
            driveNickname: whoAmI.drive_nickname || "",
          });
          console.log(`importaApiPreview`, importApiPreviewData);

          // Auto-populate nickname field if it's empty and server returned a nickname
          if (!importApiUserNickname && whoAmI.nickname) {
            setImportApiUserNickname(whoAmI.nickname);
          }
          setImportApiOrgNickname(whoAmI.drive_nickname);
        } else {
          throw new Error("Invalid response format from server");
        }

        setImportApiError(null);
      } catch (error) {
        console.error("Error fetching whoami:", error);
        setImportApiError(
          error instanceof Error
            ? error.message
            : "Invalid password or network error"
        );
        setImportApiPreviewData({
          icpAddress: "",
          evmAddress: "",
          userID: "",
          driveID: "",
          isOwner: false,
          nickname: "",
          driveNickname: "",
        });
      } finally {
        setImportApiLoading(false);
      }
    }, 500),
    [importApiUserNickname]
  );
  const handlePasswordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPassword = e.target.value;
    setImportApiKey(newPassword);

    if (newPassword && newPassword.trim() !== "") {
      setImportApiLoading(true);
      debouncedFetchWhoAmI(newPassword);
    } else {
      debouncedFetchWhoAmI.cancel();
      setImportApiLoading(false);
      setImportApiError(null);
      setImportApiPreviewData({
        icpAddress: "",
        evmAddress: "",
        userID: "",
        driveID: "",
        isOwner: false,
        nickname: "",
        driveNickname: "",
      });
    }
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
            (activeTabKey === "importSeed" &&
              importUserPreviewAddresses.evmAddress === "Invalid seed") ||
            (activeTabKey === "importApi" &&
              (!importApiPreviewData.userID ||
                !importApiPreviewData.icpAddress ||
                importApiLoading))
          }
          onClick={async () => {
            try {
              // Handle different tabs
              if (activeTabKey === "newUser" || activeTabKey === "importSeed") {
                // Determine which seed and nickname to use based on active tab
                const seedToUse =
                  activeTabKey === "newUser" ? newSeedPhrase : importSeedPhrase;
                const nicknameToUse =
                  activeTabKey === "newUser"
                    ? newUserNickname
                    : importUserNickname;

                // Create new anonymous user or import from seed
                const newAuthProfile = await deriveProfileFromSeed(seedToUse);

                // Add profile to local storage
                const newProfile = await createProfile({
                  icpPublicAddress: newAuthProfile.icpPublicAddress,
                  evmPublicAddress: newAuthProfile.evmPublicAddress,
                  seedPhrase: seedToUse,
                  note: "",
                  avatar: "",
                  nickname: nicknameToUse,
                });

                // Select the new profile
                await switchProfile(newProfile);

                message.success(`User ${nicknameToUse} added successfully!`);
              } else if (activeTabKey === "importApi") {
                // Only proceed if we have valid API preview data
                if (
                  !importApiPreviewData.userID ||
                  !importApiPreviewData.icpAddress
                ) {
                  message.error("Invalid or expired password");
                  return;
                }

                // Parse the new format DriveID_abc123:password123@https://endpoint.com
                const colonIndex = importApiKey.indexOf(":");
                const atSymbolIndex = importApiKey.lastIndexOf("@");

                if (
                  colonIndex === -1 ||
                  atSymbolIndex === -1 ||
                  atSymbolIndex === importApiKey.length - 1
                ) {
                  message.error(
                    "Invalid format. Expected: {drive}:{password}@{endpoint} (e.g. DriveID_abc123:password123@https://endpoint.com)"
                  );
                  return;
                }

                // Extract driveID, password and endpoint
                const driveID = importApiKey.substring(0, colonIndex).trim();
                const password = importApiKey
                  .substring(colonIndex + 1, atSymbolIndex)
                  .trim();
                let endpoint = importApiKey.substring(atSymbolIndex + 1).trim();

                // Validate driveID
                if (!driveID.startsWith("DriveID_")) {
                  message.error(
                    "Invalid Drive ID format. Expected format starts with 'DriveID_'"
                  );
                  return;
                }

                // Remove trailing slash if present in endpoint
                if (endpoint.endsWith("/")) {
                  endpoint = endpoint.slice(0, -1);
                }

                // Use either user-provided nickname or server-provided nickname (if available)
                const nickToUse =
                  importApiUserNickname ||
                  importApiPreviewData.nickname ||
                  "API User";

                // Create the profile
                const newProfile = await createProfile({
                  icpPublicAddress: importApiPreviewData.icpAddress,
                  evmPublicAddress: importApiPreviewData.evmAddress,
                  seedPhrase: "",
                  note: `Imported via API password for organization ${driveID}`,
                  avatar: "",
                  nickname: nickToUse,
                });

                // Switch to the new profile
                await switchProfile(newProfile);

                // Store the API key for later use - store the full string including driveID
                await createApiKey({
                  apiKeyID: `ApiKey_${uuidv4()}`,
                  userID: newProfile.userID,
                  driveID: driveID,
                  note: `Auto-generated for ${nickToUse} (${endpoint})`,
                  value: password,
                  endpoint,
                });

                message.success(`Successfully logged in as ${nickToUse}`);
                setImportApiKey("");
                setImportApiUserNickname("");
                setImportApiPreviewData({
                  icpAddress: "",
                  evmAddress: "",
                  userID: "",
                  driveID: "",
                  isOwner: false,
                  nickname: "",
                  driveNickname: "",
                });
              }

              setIsModalVisible(false);
            } catch (error) {
              console.error("Error adding user:", error);
              message.error("Failed to add user. Please try again.");
            }
          }}
        >
          {activeTabKey === "newUser"
            ? "Create Profile"
            : activeTabKey === "importSeed"
              ? "Import Profile"
              : "Login Existing"}
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

        <TabPane tab="Login Existing" key="importApi">
          <Form layout="vertical">
            <Form.Item
              label={
                <span>
                  Password&nbsp;
                  <Tooltip title="Format: {drive}:{password}@{endpoint} (e.g. DriveID_abc123:password123@https://endpoint.com)">
                    <InfoCircleOutlined style={{ color: "#aaa" }} />
                  </Tooltip>
                </span>
              }
              style={{ marginBottom: "16px" }}
              validateStatus={importApiError ? "error" : ""}
              help={importApiError}
            >
              <Input.TextArea
                value={importApiKey}
                onChange={handlePasswordChange}
                placeholder="DriveID_abc123:password123@https://endpoint.com"
                rows={2}
              />
            </Form.Item>
          </Form>

          {renderApiLoginPreviewSection()}
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

  const renderExistingUserPreviewSection = (
    evmPublicKey: string,
    icpPublicKey: string
  ) => {
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
              value={icpPublicKey}
              readOnly
              variant="borderless"
              style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
              suffix={
                <Typography.Text
                  copyable={{ text: icpPublicKey }}
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
              value={evmPublicKey}
              readOnly
              variant="borderless"
              style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
              suffix={
                <Typography.Text
                  copyable={{ text: evmPublicKey }}
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
    const selectedProfile = listOfProfiles.find(
      (profile) => profile.userID === selectedProfileId
    );
    const nicknameChanged =
      selectedProfile && selectedProfile.nickname !== existingUserNickname;

    if (!selectedProfile) return null;

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

          {renderExistingUserPreviewSection(
            selectedProfile.evmPublicAddress,
            selectedProfile.icpPublicAddress
          )}

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
                      await deleteProfile(selectedProfileId);
                      message.success("Profile removed successfully!");
                      setIsModalVisible(false);
                    }
                  } catch (error) {
                    console.error("Error removing currentProfile:", error);
                    message.error(
                      "Failed to remove currentProfile. Please try again."
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

                    // If the nickname has been edited, update the currentProfile first
                    if (nicknameChanged) {
                      try {
                        // const updatedProfile = {
                        //   ...currentProfile,
                        //   nickname: existingUserNickname,
                        // };
                        if (!selectedProfile) {
                          message.error(
                            "Failed to read preexisting profile. Please try again."
                          );
                          return;
                        }
                        const updatedProfile = {
                          ...selectedProfile,
                          nickname: existingUserNickname,
                        };
                        await updateProfile(updatedProfile);
                        message.success(
                          `Profile updated to ${existingUserNickname} successfully!`
                        );
                      } catch (error) {
                        console.error("Error updating currentProfile:", error);
                        message.error(
                          "Failed to update currentProfile. Please try again."
                        );
                        return;
                      }
                    }
                    // If we're not already using this currentProfile, switch to it
                    if (
                      !nicknameChanged &&
                      currentProfile?.userID !== selectedProfileId
                    ) {
                      try {
                        // Then switch to selected profile
                        if (!selectedProfile) {
                          message.error(
                            "Failed to read selected profile. Please try again."
                          );
                          return;
                        }
                        console.log(`switching to `, selectedProfile);
                        await switchProfile(selectedProfile);

                        message.success(
                          `Switched to ${existingUserNickname || "Anonymous"} (${shortenAddress(
                            selectedProfile.icpPublicAddress
                          )})`
                        );
                      } catch (error) {
                        console.error("Error switching currentProfile:", error);
                        message.error(
                          "Failed to switch currentProfile. Please try again."
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
