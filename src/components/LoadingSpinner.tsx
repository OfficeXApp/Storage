import React from "react";
import { Spin } from "antd";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  tip?: string;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  tip = "Loading...",
  style = {},
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
        width: "100%",
        ...style,
      }}
    >
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;
