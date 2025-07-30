import React, { useState } from "react";
import { Typography, Card, Input, Row, Col, Layout, Tag, Badge } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { appstore_apps } from "./constants";
import { Link } from "react-router-dom";
import { useIdentitySystem } from "../../framework/identity";
import {
  ServiceWithOffersFromVendors,
  DiskTypeEnum,
  IDPrefixEnum,
} from "@officexapp/types";
import { Helmet } from "react-helmet";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

// AppCard component for individual app tiles
const AppCard = ({ app }: { app: ServiceWithOffersFromVendors }) => {
  // Split subheading into two lines
  const subheadingLines = app.subheading.split("\n");

  return (
    <Badge.Ribbon text={app.is_featured ? "Featured" : ""}>
      <Card
        hoverable // Ant Design's built-in hover effect
        style={{
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
          transition: "all 0.3s ease", // Smooth transition for hover effect
          cursor: "default", // Ensure cursor doesn't change to pointer
        }}
        bodyStyle={{ padding: "16px" }}
        cover={
          <div
            style={{
              height: "160px", // Fixed height for the image container
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f2f5", // Placeholder background
            }}
          >
            <img
              alt={app.name}
              src={app.cover_image}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Ensure image covers the area without distortion
                borderRadius: "8px 8px 0 0",
              }}
              onError={(e: any) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = `https://placehold.co/400x250/cccccc/000?text=Image+Error`; // Fallback image
              }}
            />
          </div>
        }
      >
        <Card.Meta
          title={
            <Title level={4} style={{ margin: 0, fontSize: "18px" }}>
              {app.name}
            </Title>
          }
          description={
            <>
              <Paragraph
                style={{ margin: 0, lineHeight: "1.4", color: "#595959" }}
              >
                {subheadingLines[0]}
              </Paragraph>
              <Paragraph
                style={{ margin: 0, lineHeight: "1.4", color: "#595959" }}
              >
                {subheadingLines[1]}
              </Paragraph>
            </>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

const AppStore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { wrapOrgCode } = useIdentitySystem();

  // Filter apps based on search term
  const filteredApps = appstore_apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.subheading.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundColor: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Helmet>
        <title>App Store - OfficeX</title>
      </Helmet>
      <Content
        style={{
          padding: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          paddingBottom: "64px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title
            level={1}
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#262626",
            }}
          >
            Explore Appstore
          </Title>
          <Text
            style={{
              textAlign: "center",
              width: "100%",
              fontSize: "1.1rem",
              fontWeight: "lighter",
            }}
          >
            Agents Mall to install apps & shop vendors
          </Text>
        </div>
        <div
          style={{ marginBottom: "32px", maxWidth: "600px", margin: "0 auto" }}
        >
          <Input.Search
            placeholder="Search for apps, agents & services..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderRadius: "8px", marginBottom: "32px" }}
          />
          <br />
        </div>

        <Row gutter={[24, 24]} justify="center">
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => (
              <Col
                key={app.id}
                xs={24} // Full width on extra small screens
                sm={12} // Half width on small screens
                md={8} // One-third width on medium screens
                lg={6} // One-fourth width on large screens
                xl={6} // One-fourth width on extra large screens
                xxl={4} // One-sixth width on extra extra large screens
                style={{
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }} // Center cards in their columns
              >
                <Link
                  to={wrapOrgCode(`/appstore/app/${app.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <AppCard app={app} />
                </Link>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: "center", padding: "50px" }}>
              <Paragraph style={{ fontSize: "18px", color: "#8c8c8c" }}>
                No apps found matching your search.
              </Paragraph>
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  );
};

export default AppStore;
