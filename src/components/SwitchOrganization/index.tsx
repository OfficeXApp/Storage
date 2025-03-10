import React, { useState, useEffect, useCallback } from "react";
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
  SyncOutlined,
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
  Typography,
  Progress,
  ProgressProps,
} from "antd";
import {
  IndexDB_Organization,
  useIdentitySystem,
} from "../../framework/identity";
import { DriveID } from "@officexapp/types";
import {
  FACTORY_CANISTER_ENDPOINT,
  shortenAddress,
} from "../../framework/identity/constants";
import { debounce } from "lodash";
import { InfoCircleOutlined } from "@ant-design/icons";
import { UserID } from "@officexapp/types";
import { v4 as uuidv4 } from "uuid";
import { sleep } from "../../api/helpers";
import EarnProgressOverview from "../EarnProgressOverview";
import { generateRandomSeed } from "../../api/icp";
import { useReduxOfflineMultiTenant } from "../../store/ReduxProvider";

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
    createProfile,
    createApiKey,
    deriveProfileFromSeed,
  } = useIdentitySystem();
  const { deleteReduxOfflineStore } = useReduxOfflineMultiTenant();
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
  const [createLoading, setCreateLoading] = useState(false);

  // Preview states
  const [previewEndpoint, setPreviewEndpoint] = useState("");
  const [giftCardValue, setGiftCardValue] = useState("");

  const [importApiLoading, setImportApiLoading] = useState(false);
  const [importApiError, setImportApiError] = useState<string | null>(null);
  const [importApiKey, setImportApiKey] = useState("");
  const [importApiUserNickname, setImportApiUserNickname] = useState("");
  const [importApiOrgNickname, setImportApiOrgNickname] = useState("");
  const [importApiPreviewData, setImportApiPreviewData] = useState({
    icpAddress: "",
    evmAddress: "",
    userID: "",
    driveID: "",
    isOwner: false,
    nickname: "",
    driveNickname: "",
  });

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
    } else if (modalMode === "new") {
      if (currentProfile) {
        setSelectedProfileId(currentProfile.userID);
      } else if (listOfProfiles.length > 0) {
        setSelectedProfileId(listOfProfiles[0].userID);
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
        // Parse the format DriveID_abc123:password123@https://endpoint.com
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

        // Extract Org ICP from DriveID
        const orgIcp = driveID.replace("DriveID_", "");

        // Construct the whoami URL with the specific drive ID
        const whoamiUrl = `${endpoint}/v1/${driveID}/organization/whoami`;

        // Only the password part should go in the Authorization header
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

          // Auto-populate nickname fields if they're empty and server returned nicknames
          if (!importApiUserNickname && whoAmI.nickname) {
            setImportApiUserNickname(whoAmI.nickname);
          }

          if (!importApiOrgNickname && whoAmI.drive_nickname) {
            setImportApiOrgNickname(whoAmI.drive_nickname);
          }
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
    [importApiUserNickname, importApiOrgNickname]
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
      setGiftCardValue("");
    } else {
      // For entering or editing an existing organization
      setSelectedOrgId(driveID);
      setModalMode("edit-enter");
      setEnterOrgTabKey("enterOrg");
      setIsModalVisible(true);
    }
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
                    Org ICP
                  </span>
                </div>
                <Input
                  value={importApiPreviewData.driveID.replace("DriveID_", "")}
                  readOnly
                  variant="borderless"
                  style={{ flex: 1, color: "#8c8c8c", padding: "0" }}
                  suffix={
                    <Typography.Text
                      copyable={{
                        text: importApiPreviewData.driveID.replace(
                          "DriveID_",
                          ""
                        ),
                      }}
                      style={{ color: "#8c8c8c" }}
                    />
                  }
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
                    Profile
                  </span>
                </div>
                <Input
                  value={importApiUserNickname}
                  onChange={(e) => setImportApiUserNickname(e.target.value)}
                  placeholder="Enter profile nickname"
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "70px",
                  }}
                >
                  <span style={{ color: "#8c8c8c" }}>ICP</span>
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
              Enter a valid password to see organization details
            </div>
          )}
        </div>
      </details>
    );
  };

  const handleApiLogin = async () => {
    // Only proceed if we have valid API preview data
    if (!importApiPreviewData.userID || !importApiPreviewData.icpAddress) {
      message.error("Invalid or expired password");
      return;
    }

    // Parse the format DriveID_abc123:password123@https://endpoint.com
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

    try {
      // Use either user-provided nickname or server-provided nickname
      const profileNickToUse =
        importApiUserNickname || importApiPreviewData.nickname || "API User";

      const orgNickToUse =
        importApiOrgNickname ||
        importApiPreviewData.driveNickname ||
        "Imported Organization";

      // First check if a profile with this ICP address already exists
      const existingProfiles = listOfProfiles.filter(
        (profile) =>
          profile.icpPublicAddress === importApiPreviewData.icpAddress
      );

      let profileToUse;

      if (existingProfiles.length > 0) {
        // Use existing profile
        profileToUse = existingProfiles[0];
        setSelectedProfileId(profileToUse.userID);
      } else {
        // Create a new profile
        profileToUse = await createProfile({
          icpPublicAddress: importApiPreviewData.icpAddress,
          evmPublicAddress: importApiPreviewData.evmAddress || "",
          seedPhrase: "",
          note: `Imported via API password for organization ${driveID}`,
          avatar: "",
          nickname: profileNickToUse,
        });
      }

      // Create the new organization with the API info
      const newOrg = await createOrganization({
        driveID: importApiPreviewData.driveID as DriveID,
        nickname: orgNickToUse,
        icpPublicAddress: importApiPreviewData.driveID.replace("DriveID_", ""),
        endpoint: endpoint,
        note: `Organization imported via API for user ${profileNickToUse}`,
        defaultProfile: profileToUse.userID,
      });

      // Store the API key for later use
      await createApiKey({
        apiKeyID: `ApiKey_${uuidv4()}`,
        userID: profileToUse.userID,
        driveID: driveID,
        note: `Auto-generated for ${orgNickToUse} (${endpoint})`,
        value: password,
        endpoint,
      });

      // Switch to this organization with the profile
      await switchProfile(profileToUse);
      await switchOrganization(newOrg, profileToUse.userID);

      message.success(
        `Successfully logged in to organization "${orgNickToUse}"`
      );
      setImportApiKey("");
      setImportApiUserNickname("");
      setImportApiOrgNickname("");
      setImportApiPreviewData({
        icpAddress: "",
        evmAddress: "",
        userID: "",
        driveID: "",
        isOwner: false,
        nickname: "",
        driveNickname: "",
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error logging in to organization:", error);
      message.error("Failed to log in to organization. Please try again.");
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
      // Set loading state
      setCreateLoading(true);

      // Check if gift card is provided
      if (giftCardValue && giftCardValue.trim() !== "") {
        try {
          // Step 1: Redeem the gift card at the factory endpoint
          const profile = listOfProfiles.find(
            (profile) => profile.userID === selectedProfileId
          );

          if (!profile) {
            throw new Error("No profile selected");
          }

          // Extract ICP principal from profile UserID (remove the UserID prefix)
          const icpPrincipal = profile.userID.replace("UserID_", "");

          message.info("Redeeming gift card...");

          // Make the first POST request to redeem the voucher
          const redeemResponse = await fetch(
            `${FACTORY_CANISTER_ENDPOINT}/v1/default/giftcards/redeem`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                giftcard_id: giftCardValue,
                owner_icp_principal: icpPrincipal,
                organization_name: newOrgNickname,
              }),
            }
          );

          if (!redeemResponse.ok) {
            message.error("Failed to redeem gift card");
            throw new Error(
              `Failed to redeem gift card: ${redeemResponse.statusText}`
            );
          }

          const redeemData = await redeemResponse.json();

          if (!redeemData.ok || !redeemData.ok.data) {
            throw new Error("Invalid response from voucher redemption");
          }

          message.info("Minting on blockchain...");

          // wait 5 seconds
          await sleep(5000);

          message.info("Claiming your cloud...");

          const { drive_id, endpoint, redeem_code } = redeemData.ok.data;

          // Step 2: Make the second POST request to complete the organization setup
          const completeRedeemUrl = `${endpoint}/v1/${drive_id}/organization/redeem`;
          const completeRedeemResponse = await fetch(completeRedeemUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              redeem_code: redeem_code,
            }),
          });

          if (!completeRedeemResponse.ok) {
            throw new Error(
              `Failed to complete organization setup: ${completeRedeemResponse.statusText}`
            );
          }

          const completeRedeemData = await completeRedeemResponse.json();

          if (!completeRedeemData.ok || !completeRedeemData.ok.data) {
            message.error(`Error deploying organization - ${redeem_code}`);
            localStorage.setItem("FACTORY_REDEEM_CODE", redeem_code);
            throw new Error("Invalid response from organization setup");
          }

          // Extract the admin login password from the response
          const { admin_login_password } = completeRedeemData.ok.data;

          // Step 3: Use the admin login password to log in with the API flow
          // Parse the format DriveID_abc123:password123@https://endpoint.com
          const colonIndex = admin_login_password.indexOf(":");
          const atSymbolIndex = admin_login_password.lastIndexOf("@");

          if (
            colonIndex === -1 ||
            atSymbolIndex === -1 ||
            atSymbolIndex === admin_login_password.length - 1
          ) {
            throw new Error("Invalid admin login password format");
          }

          // Extract driveID, password and endpoint
          const driveID = admin_login_password.substring(0, colonIndex).trim();
          const password = admin_login_password
            .substring(colonIndex + 1, atSymbolIndex)
            .trim();
          let adminEndpoint = admin_login_password
            .substring(atSymbolIndex + 1)
            .trim();

          // Validate driveID
          if (!driveID.startsWith("DriveID_")) {
            throw new Error("Invalid Drive ID format in admin login password");
          }

          // Remove trailing slash if present in endpoint
          if (adminEndpoint.endsWith("/")) {
            adminEndpoint = adminEndpoint.slice(0, -1);
          }

          // Use either user-provided nickname or the one we set earlier
          const profileNickToUse = profile.nickname || "API User";
          const orgNickToUse = newOrgNickname;

          // Create the new organization with the API info
          const newOrg = await createOrganization({
            driveID: driveID as DriveID,
            nickname: orgNickToUse,
            icpPublicAddress: driveID.replace("DriveID_", ""),
            endpoint: adminEndpoint,
            note: `Organization created with gift card ${giftCardValue}`,
            defaultProfile: profile.userID,
          });

          // Store the API key for later use
          await createApiKey({
            apiKeyID: `ApiKey_${uuidv4()}`,
            userID: profile.userID,
            driveID: driveID,
            note: `Auto-generated from gift card for ${orgNickToUse} (${adminEndpoint})`,
            value: password,
            endpoint: adminEndpoint,
          });

          // Switch to this organization with the profile
          await switchProfile(profile);
          await switchOrganization(newOrg, profile.userID);

          message.success(
            `Successfully created organization "${orgNickToUse}" with gift card`
          );
          setGiftCardValue("");
          setIsModalVisible(false);
        } catch (error) {
          console.error("Error redeeming gift card:", error);
          message.error(
            `Failed to redeem gift card: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      } else {
        // Original flow for creating organization without gift card
        // Generate a unique drive ID for the new organization
        const seedPhrase = generateRandomSeed();
        const tempProfile = await deriveProfileFromSeed(seedPhrase);
        const newDriveID = `DriveID_${tempProfile.icpPublicAddress}`;

        // Create the new organization
        const newOrg = await createOrganization({
          driveID: newDriveID as DriveID,
          nickname: newOrgNickname,
          icpPublicAddress: tempProfile.icpPublicAddress,
          endpoint: "https://api.officex.app",
          note: `Created on ${new Date().toLocaleDateString()}`,
          defaultProfile: selectedProfileId, // Use the selectedProfileId
        });

        // Switch to the new organization
        await switchOrganization(newOrg, selectedProfileId);

        message.success(
          `Organization "${newOrgNickname}" created successfully!`
        );
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      message.error("Failed to create organization. Please try again.");
    } finally {
      setCreateLoading(false);
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
        await deleteReduxOfflineStore(selectedOrgId);
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
      <details style={{ marginBottom: "12px", marginTop: "8px" }}>
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
        <Form.Item label={<Space>Owner</Space>} style={{ marginTop: "8px" }}>
          <Select
            style={{ width: "100%" }}
            options={renderProfileOptions()}
            value={selectedProfileId}
            onChange={setSelectedProfileId}
            placeholder="Select Profile"
          />
        </Form.Item>
        <Form.Item
          label={
            <Space>
              Gift Card
              <Tooltip title="Gift Cards let you connect to the world computer $ICP">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          style={{ marginTop: "-16px" }}
        >
          <Input
            value={giftCardValue}
            onChange={(e) => setGiftCardValue(e.target.value)}
            placeholder="GiftCardID_abc123"
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
            <Tag
              onClick={() => {
                navigator.clipboard
                  .writeText(
                    `DriveID_${typedCurrentOrg.icpPublicAddress}@${typedCurrentOrg.endpoint}`
                  )
                  .then(() => {
                    message.success("Copied to clipboard!");
                  })
                  .catch(() => {
                    message.error("Failed to copy to clipboard.");
                  });
              }}
              style={{ flexShrink: 0, marginLeft: "8px" }}
            >
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
                  loading={createLoading}
                >
                  Create Organization
                </Button>
              </Space>
            </div>
          </Form>
        </TabPane>

        <TabPane tab="Login Existing" key="existingOrg">
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

            {renderApiLoginPreviewSection()}

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
                  onClick={handleApiLogin}
                  disabled={
                    !importApiPreviewData.userID ||
                    !importApiPreviewData.icpAddress ||
                    importApiLoading
                  }
                >
                  Login Organization
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
      {/* <EarnProgressOverview /> */}

      {renderAddOrgModal()}
      {renderEditEnterOrgModal()}
    </>
  );
};

export default OrganizationSwitcher;
