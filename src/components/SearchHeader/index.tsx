import React, { useCallback, useEffect, useState } from "react";
import { Input, Button } from "antd";
import {
  MenuOutlined,
  SearchOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useScreenType from "react-screentype-hook";
import { generate } from "random-words"; // Import random-words library
import { useIdentitySystem } from "../../framework/identity"; // Import corrected useIdentity hook
import SwitchProfile from "../SwitchProfile";

interface HeaderProps {
  onSearch?: (value: string) => void;
  setSidebarVisible: (visible: boolean) => void;
}

const SearchHeader: React.FC<HeaderProps> = ({ setSidebarVisible }) => {
  const { wrapOrgCode } = useIdentitySystem();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const screenType = useScreenType();

  const handleSearch = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    navigate(wrapOrgCode(`/search?query=${encodedQuery}`));
    setSearchValue("");
  };

  const renderSearchBar = () => {
    return (
      <Input
        placeholder="Search Organization"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        suffix={<SearchOutlined onClick={() => handleSearch(searchValue)} />}
        onPressEnter={() => handleSearch(searchValue)}
        allowClear
        style={{ width: "100%", maxWidth: "500px" }}
      />
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
            style={{ margin: "0px 8px 0px 8px", padding: "4px 8px" }}
          />
        )}
        {renderSearchBar()}

        <SwitchProfile showAvatar={false} />
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

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* <WalletOutlined color="rgba(165, 165, 165, 0.4)" /> */}
        <SwitchProfile showAvatar />
      </div>
    </div>
  );
};

export default SearchHeader;
