import React, { useEffect, useRef } from "react";
import { CopyOutlined } from "@ant-design/icons";
import { Tooltip, message } from "antd";
import "highlight.js/styles/default.min.css";
import hljs from "./highlightjs"; // Import your custom hljs configuration
import toast from "react-hot-toast";

interface CodeBlockProps {
  code: string;
  language: "javascript" | "python" | "bash";
  className?: string;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  className,
  title,
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success(<span>Copied to clipboard</span>);
  };

  // Get shortened language label
  const getLanguageLabel = (lang: string): string => {
    switch (lang.toLowerCase()) {
      case "javascript":
        return "JS";
      case "python":
        return "PY";
      case "bash":
        return "CURL";
      default:
        return lang.toUpperCase();
    }
  };

  // Use the passed title or default to shortened language label
  const displayTitle = title || getLanguageLabel(language);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          backgroundColor: "#f6f8fa",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          borderBottom: "1px solid #e1e4e8",
          fontSize: "14px",
          fontFamily:
            "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
        }}
      >
        <span
          style={{
            color: "#586069",
            fontWeight: "bold",
            backgroundColor: "#e6edf3",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "12px",
          }}
        >
          {displayTitle}
        </span>
        <Tooltip title="Copy to clipboard">
          <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
            <span style={{ fontSize: "0.7rem", marginRight: "8px" }}>
              {getLanguageLabel(language)}
            </span>
            <CopyOutlined
              style={{
                color: "#1890ff",
                fontSize: "16px",
              }}
            />
          </div>
        </Tooltip>
      </div>
      <pre
        style={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
          maxHeight: "150px",
          overflowY: "scroll",
        }}
      >
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
