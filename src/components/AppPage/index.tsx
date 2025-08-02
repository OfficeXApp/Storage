import React, { useState } from "react";
import {
  Typography,
  Card,
  Input,
  Row,
  Col,
  Layout,
  Button,
  Carousel,
  Collapse,
  Avatar,
  Tag,
  Space,
  Popover,
  Statistic,
  Divider,
  Drawer, // Import Drawer
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  SearchOutlined,
  StarFilled,
  LinkOutlined,
  UserOutlined,
  DollarCircleOutlined,
  PlusOutlined,
  TeamOutlined,
  FireOutlined,
  DollarOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { appstore_apps } from "../AppStore/constants";
import NotFoundPage from "../NotFound";
import { useIdentitySystem } from "../../framework/identity";
import RunAppDrawer from "../RunAppDrawer";
import { Helmet } from "react-helmet";
import {
  ServiceWithOffersFromVendors,
  CheckoutRun,
  OfferPreview,
  VendorOffer,
} from "@officexapp/types";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;
const { Panel } = Collapse;

const AppPage = () => {
  const { app_id } = useParams();
  const { wrapOrgCode } = useIdentitySystem();

  // Find the app, ensuring it's typed as ServiceWithOffersFromVendors to access 'offers' directly
  const app = appstore_apps.find((app) => app.id === app_id) as
    | ServiceWithOffersFromVendors
    | undefined;

  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false); // State for Drawer visibility
  const [checkoutRun, setCheckoutRun] = useState<CheckoutRun | null>(null);

  if (!app) {
    return <NotFoundPage />;
  }

  // Now, directly use app.offers and populate the images
  // We create a new array of offers to ensure immutability and add the images
  const offersWithImages: OfferPreview[] =
    app.offers?.map((offer) => ({
      ...offer,
      // Duplicating the image for the carousel to function, as it needs at least two distinct items to slide.
      // If you only want one image, remove the second `app.coverImage`.
      images: [app.cover_image, app.cover_image],
    })) || []; // Default to an empty array if app.offers is undefined

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(wrapOrgCode("/appstore"));
  };

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  const filteredOffers = offersWithImages.filter((offer) =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRunVendorJob = (offer: OfferPreview, vendor: VendorOffer) => {
    setCheckoutRun({
      vendorID: vendor.id,
      vendorName: vendor.name,
      vendorAvatar: vendor.avatar,
      aboutUrl: vendor.about_url || "",
      offerName: offer.title,
      offerDescription: vendor.description,
      callToAction: vendor.call_to_action,
      checkoutVideo: vendor.checkout_video,
      checkoutOptions: vendor.checkout_options,
      priceLine: vendor.price_line,
    });
    showDrawer();
  };

  const BookmarkedDemandPopoverContent = (
    <div>
      <Paragraph style={{ margin: 0 }}>
        Bookmarked demand represents the total potential revenue from users who
        have bookmarked this offer.
      </Paragraph>
      <Paragraph style={{ margin: 0 }}>
        Calculated as: # of Bookmarks &times; Avg. Customer Lifetime Value.
      </Paragraph>
    </div>
  );

  const BecomeVendorPopoverContent = (
    <div>
      <Paragraph style={{ margin: 0 }}>
        Anyone can become a vendor and start earning by fulfilling offers on our
        platform.
      </Paragraph>
      <Paragraph style={{ margin: 0 }}>
        It's 100% crypto payments, permissionless, and your reputation directly
        impacts your success!
      </Paragraph>
      <Button
        onClick={() => {
          window.open("https://tally.so/r/mVOkBa", "_blank");
        }}
        size="small"
        style={{ marginTop: "16px" }}
      >
        Get Started
      </Button>
    </div>
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundColor: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* React Helmet */}
      <Helmet>
        <title>{app.name} - Appstore</title>
      </Helmet>
      {/* Sticky Top Bar: Back Button & Search Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "white",
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{
            padding: 0,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Back to Appstore
        </Button>
        <Input.Search
          placeholder={`Search ${app.name} Offers...`}
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "calc(100% - 200px)", maxWidth: "400px" }}
        />
      </div>

      <Content
        style={{
          padding: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          paddingBottom: "64px",
        }}
      >
        {/* App Title and Description */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={1} style={{ fontWeight: "bold", color: "#262626" }}>
            {app.name}
          </Title>
          <Paragraph
            style={{ fontSize: "16px", color: "#8c8c8c", marginTop: "-8px" }}
          >
            {app.subheading.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Paragraph>
        </div>

        {/* Offers/Workflows Section */}
        <Row gutter={[24, 24]}>
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <Col xs={24} key={offer.id}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    overflow: "hidden",
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <Row align="stretch" gutter={16}>
                    {/* Carousel for Images */}
                    <Col
                      xs={24}
                      md={8}
                      style={{
                        padding: "24px",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        backgroundColor: "#f0f2f5",
                        borderRadius: "12px 0 0 12px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          height: "320px",
                          width: "100%",
                          overflow: "hidden",
                          borderRadius: "8px",
                        }}
                      >
                        <Carousel
                          autoplay
                          dots={true}
                          dotPosition="bottom"
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          {offer.images.map((image, idx) => (
                            <div
                              key={idx}
                              style={{ width: "100%", height: "100%" }}
                            >
                              <img
                                alt={`Offer Image ${idx + 1}`}
                                src={image}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                onError={(e: any) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://placehold.co/250x320/cccccc/000?text=Image+Error`;
                                }}
                              />
                            </div>
                          ))}
                        </Carousel>
                      </div>
                    </Col>

                    {/* Offer Details */}
                    <Col xs={24} md={16} style={{ padding: "24px" }}>
                      <Title
                        level={3}
                        style={{ marginTop: 0, marginBottom: 8 }}
                      >
                        {offer.title}
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#1890ff",
                          marginBottom: 4,
                        }}
                      >
                        ${offer.price}
                        <Text style={{ fontSize: "14px", color: "#595959" }}>
                          {offer.price_unit}
                        </Text>
                      </Paragraph>
                      <Paragraph
                        style={{
                          fontSize: "13px",
                          color: "#8c8c8c",
                          marginBottom: 16,
                        }}
                      >
                        {offer.price_explanation}
                      </Paragraph>

                      <Paragraph
                        style={{ color: "#595959", lineHeight: "1.6" }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: offer.description,
                          }}
                        />
                      </Paragraph>

                      {/* Divider between rich text and stats/buttons */}
                      <Divider style={{ margin: "24px 0" }} />

                      {/* Stats and Buttons on the same row */}
                      <Row
                        gutter={[16, 16]}
                        align="middle"
                        justify="space-between"
                      >
                        <Col xs={24} lg={14}>
                          {" "}
                          {/* Adjust column span for responsiveness */}
                          <Space
                            size="middle"
                            style={{
                              width: "100%",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                            }}
                          >
                            <Statistic
                              title="Bookmarks"
                              value={offer.bookmarks}
                              prefix={<BookOutlined />}
                              valueStyle={{ fontSize: 16 }}
                            />
                            <Popover
                              content={BookmarkedDemandPopoverContent}
                              title="What is Bookmarked Demand?"
                              trigger="hover"
                            >
                              <Statistic
                                title="Bookmarked Demand"
                                value={offer.bookmarked_demand}
                                prefix={<DollarCircleOutlined />}
                                valueStyle={{ fontSize: 16 }}
                              />
                            </Popover>
                            <Statistic
                              title="Cumulative Sales"
                              value={offer.cumulative_sales}
                              prefix={<DollarOutlined />}
                              valueStyle={{ fontSize: 16 }}
                            />
                          </Space>
                        </Col>
                        <Col xs={24} lg={10} style={{ textAlign: "right" }}>
                          <Space size="middle">
                            <Button
                              type="dashed"
                              size="large"
                              icon={<BookOutlined />}
                            >
                              Bookmark
                            </Button>
                            <Button
                              type="primary"
                              size="large"
                              icon={<CaretRightOutlined />}
                              onClick={() =>
                                handleRunVendorJob(offer, offer.vendors[0])
                              }
                            >
                              {offer.call_to_action || "Run Job"}
                            </Button>
                          </Space>
                        </Col>
                      </Row>

                      {/* Vendors Accordion */}
                      <Collapse
                        bordered={false}
                        style={{
                          marginTop: "32px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <Panel
                          header={
                            <Space
                              align="center"
                              style={{
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text strong style={{ fontSize: "16px" }}>
                                {" "}
                                <TeamOutlined style={{ marginRight: 8 }} />
                                Vendors ({offer.vendors.length})
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "13px" }}
                              >
                                Click to view vendors
                              </Text>
                            </Space>
                          }
                          key="1"
                          style={{ borderBottom: "none" }}
                        >
                          {offer.vendors.length > 0 ? (
                            <Space
                              direction="vertical"
                              size={12}
                              style={{ width: "100%", marginTop: 16 }}
                            >
                              {" "}
                              {offer.vendors.map((vendor) => (
                                <Card
                                  key={vendor.id}
                                  size="small"
                                  hoverable
                                  style={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "8px",
                                    width: "100%",
                                  }}
                                  bodyStyle={{ padding: "12px 16px" }}
                                >
                                  <Row align="middle" justify="space-between">
                                    <Col>
                                      {" "}
                                      <Row gutter={8} align="middle">
                                        <Col>
                                          <Avatar
                                            src={vendor.avatar}
                                            icon={<UserOutlined />}
                                            size="large"
                                          />
                                        </Col>
                                        <Col>
                                          <Space direction="vertical" size={2}>
                                            <Text
                                              strong
                                              style={{ fontSize: "16px" }}
                                            >
                                              {vendor.name}
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: "13px" }}
                                            >
                                              Price: {vendor.price_line}
                                            </Text>
                                            <Space size={4} wrap>
                                              <Tag
                                                icon={<StarFilled />}
                                                color="gold"
                                              >
                                                {vendor.reviews_score} Reviews
                                              </Tag>
                                              <Tag color="blue">
                                                Uptime: {vendor.uptime_score}%
                                              </Tag>
                                            </Space>
                                          </Space>
                                        </Col>
                                      </Row>
                                    </Col>
                                    <Col>
                                      {" "}
                                      <Button
                                        type="default"
                                        onClick={() =>
                                          handleRunVendorJob(offer, vendor)
                                        }
                                        icon={<CaretRightOutlined />}
                                      >
                                        {vendor.call_to_action || "Run Job"}
                                      </Button>
                                    </Col>
                                  </Row>
                                </Card>
                              ))}
                            </Space>
                          ) : (
                            <Paragraph
                              type="secondary"
                              style={{ textAlign: "center", padding: "16px" }}
                            >
                              No vendors currently fulfilling this offer.
                            </Paragraph>
                          )}
                          {/* Subtle "Become Vendor" link inside accordion */}
                          <div
                            style={{ textAlign: "center", marginTop: "24px" }}
                          >
                            <Popover
                              content={BecomeVendorPopoverContent}
                              title="Become a Vendor"
                              trigger="hover"
                            >
                              <Button
                                type="link"
                                size="middle"
                                icon={<PlusOutlined />}
                              >
                                Become a Vendor for this Offer
                              </Button>
                            </Popover>
                          </div>
                        </Panel>
                      </Collapse>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: "center", padding: "50px" }}>
              <Paragraph style={{ fontSize: "18px", color: "#8c8c8c" }}>
                No offers or workflows found for "{app.name}" matching your
                search.
              </Paragraph>
            </Col>
          )}
        </Row>

        {/* --- Main "Become Vendor" Button (kept for prominence) --- */}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Popover
            content={BecomeVendorPopoverContent}
            title="Become a Vendor"
            trigger="hover"
          >
            <Button
              type="default"
              size="large"
              icon={<PlusOutlined />}
              style={{ padding: "0 30px", height: "50px", fontSize: "18px" }}
            >
              Add New Offer
            </Button>
          </Popover>
        </div>
      </Content>

      {/* The Ant Design Drawer Component */}
      {isDrawerVisible && checkoutRun && (
        <RunAppDrawer
          onCloseDrawer={onCloseDrawer}
          isDrawerVisible={isDrawerVisible}
          checkoutRun={checkoutRun}
        />
      )}
    </Layout>
  );
};

export default AppPage;
