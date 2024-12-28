import React, { useCallback, useEffect, useState } from "react";
import {
  Input,
  Avatar,
  Typography,
  AutoComplete,
  message,
  Button,
  Modal,
} from "antd";
import {
  CloseOutlined,
  CloudSyncOutlined,
  FileOutlined,
  FolderOutlined,
  MenuOutlined,
  SearchOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  FileMetadata,
  FolderMetadata,
  Identity,
  useDrive,
} from "../../framework";
import { Link, useNavigate } from "react-router-dom";
import { trimToFolderPath, truncateMiddlePath } from "../../api/helpers";
import useScreenType from "react-screentype-hook";

const { useIdentity } = Identity;

const { Text } = Typography;

interface HeaderProps {
  onSearch?: (value: string) => void;
  setSidebarVisible: (visible: boolean) => void;
}

const SearchHeader: React.FC<HeaderProps> = ({ setSidebarVisible }) => {
  const { alias, icpSlug, evmSlug } = useIdentity();
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([]);
  const { searchFilesQuery, reindexFuzzySearch } = useDrive();
  const navigate = useNavigate();
  const screenType = useScreenType();

  const handleSearch = useCallback(
    async (value: string) => {
      console.log("Searching for:", value);
      if (value.trim()) {
        const result = await searchFilesQuery(value, 10, 0);
        console.log("Search result:", result);
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
                onClick={async () => {
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

      <div className="header-right" style={{ cursor: "not-allowed" }}>
        <Text style={{ margin: "0px 16px" }}>{`${alias} (${icpSlug})`}</Text>
        <Link to="/settings">
          <Avatar icon={<UserOutlined />} size="large" />
        </Link>
      </div>
    </div>
  );
};

export default SearchHeader;
