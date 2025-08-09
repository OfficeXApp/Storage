import { Space } from "antd";
import SwitchProfile from "../SwitchProfile";
import { Link } from "react-router-dom";
import OrganizationSwitcher from "../SwitchOrganization";

export interface SlimAppHeaderProps {
  title?: React.ReactNode;
}

const SlimAppHeader = ({ title }: SlimAppHeaderProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 10px",
        backgroundColor: "#ffffff",
      }}
    >
      {title || (
        <Link to="/org/current/welcome" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontWeight: "bold",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "#1a1a3a",
              fontSize: "1rem",

              fontFamily: "sans-serif",
            }}
          >
            <span>OfficeX</span>
          </div>
        </Link>
      )}

      <div style={{ display: "flex", alignItems: "center" }}>
        <SwitchProfile />
        <OrganizationSwitcher />
      </div>
    </div>
  );
};
export default SlimAppHeader;
