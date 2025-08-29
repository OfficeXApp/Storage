import React from "react";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { useIdentitySystem } from "../../framework/identity";

const NotFoundPage = () => {
  const { wrapOrgCode } = useIdentitySystem();
  return (
    <Result
      status="404"
      title={<span>404 Not Found</span>}
      subTitle={<span>Sorry, the page you visited does not exist.</span>}
      extra={
        <Link to={wrapOrgCode("/drive")}>
          <Button type="primary">Go Home</Button>
        </Link>
      }
      style={{ marginTop: "10vh" }}
    />
  );
};

export default NotFoundPage;
