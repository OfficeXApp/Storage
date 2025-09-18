import React from "react";
import { Skeleton } from "antd";
import "./skeletons.css";

interface PageSkeletonProps {
  showHeader?: boolean;
  showSidebar?: boolean;
  rows?: number;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({
  showHeader = true,
  showSidebar = false,
  rows = 4,
}) => {
  return (
    <div className="page-skeleton">
      {showHeader && (
        <div className="skeleton-header">
          <Skeleton.Button
            active
            size="large"
            style={{ width: 200, height: 32 }}
          />
          <div className="skeleton-header-actions">
            <Skeleton.Button active size="small" style={{ width: 80 }} />
            <Skeleton.Button active size="small" style={{ width: 100 }} />
          </div>
        </div>
      )}

      <div className="skeleton-content">
        {showSidebar && (
          <div className="skeleton-sidebar">
            <Skeleton.Button
              active
              style={{ width: "100%", height: 40, marginBottom: 16 }}
            />
            <Skeleton
              active
              paragraph={{
                rows: 6,
                width: ["100%", "80%", "90%", "70%", "85%", "75%"],
              }}
            />
          </div>
        )}

        <div className="skeleton-main">
          <Skeleton
            active
            title={{ width: "40%" }}
            paragraph={{
              rows: rows,
              width: ["100%", "95%", "85%", "90%"],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
