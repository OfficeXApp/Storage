import React from "react";
import { Skeleton, Row, Col } from "antd";
import "./skeletons.css";

interface DriveContentSkeletonProps {
  showToolbar?: boolean;
  showBreadcrumb?: boolean;
  fileCount?: number;
  viewMode?: "grid" | "list";
}

const DriveContentSkeleton: React.FC<DriveContentSkeletonProps> = ({
  showToolbar = true,
  showBreadcrumb = true,
  fileCount = 12,
  viewMode = "grid",
}) => {
  const renderFileSkeletons = () => {
    const skeletons = [];

    if (viewMode === "grid") {
      // Grid view - file cards
      for (let i = 0; i < fileCount; i++) {
        skeletons.push(
          <Col key={i} xs={12} sm={8} md={6} lg={4} xl={3}>
            <div className="skeleton-file-card">
              <Skeleton.Image active style={{ width: "100%", height: 120 }} />
              <div className="skeleton-file-info">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: "80%", height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: "60%", height: 12, marginTop: 4 }}
                />
              </div>
            </div>
          </Col>
        );
      }
    } else {
      // List view - file rows
      for (let i = 0; i < fileCount; i++) {
        skeletons.push(
          <div key={i} className="skeleton-file-row">
            <Skeleton.Avatar active size="small" />
            <Skeleton.Input active style={{ width: "30%", height: 16 }} />
            <Skeleton.Input active style={{ width: "15%", height: 16 }} />
            <Skeleton.Input active style={{ width: "20%", height: 16 }} />
            <Skeleton.Button active size="small" style={{ width: 60 }} />
          </div>
        );
      }
    }

    return skeletons;
  };

  return (
    <div className="drive-content-skeleton">
      {showBreadcrumb && (
        <div className="skeleton-breadcrumb">
          <Skeleton.Button
            active
            size="small"
            style={{ width: 60, marginRight: 8 }}
          />
          <span className="skeleton-separator">/</span>
          <Skeleton.Button
            active
            size="small"
            style={{ width: 80, marginLeft: 8 }}
          />
        </div>
      )}

      {showToolbar && (
        <div className="skeleton-toolbar">
          <div className="skeleton-toolbar-left">
            <Skeleton.Button
              active
              style={{ width: 100, height: 32, marginRight: 8 }}
            />
            <Skeleton.Button
              active
              style={{ width: 80, height: 32, marginRight: 8 }}
            />
            <Skeleton.Button active style={{ width: 90, height: 32 }} />
          </div>
          <div className="skeleton-toolbar-right">
            <Skeleton.Input
              active
              style={{ width: 200, height: 32, marginRight: 8 }}
            />
            <Skeleton.Button active style={{ width: 40, height: 32 }} />
          </div>
        </div>
      )}

      <div className="skeleton-file-content">
        {viewMode === "grid" ? (
          <Row gutter={[16, 16]} className="skeleton-file-grid">
            {renderFileSkeletons()}
          </Row>
        ) : (
          <div className="skeleton-file-list">
            <div className="skeleton-list-header">
              <Skeleton.Input active style={{ width: "30%", height: 16 }} />
              <Skeleton.Input active style={{ width: "15%", height: 16 }} />
              <Skeleton.Input active style={{ width: "20%", height: 16 }} />
              <Skeleton.Input active style={{ width: "10%", height: 16 }} />
            </div>
            {renderFileSkeletons()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveContentSkeleton;
