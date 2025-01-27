import React, { useEffect, useState } from "react";
import { read, utils, WorkBook } from "xlsx";
import "./SheetJSPreview.css";
import { Button, Result } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { FileMetadata } from "../../framework";
import mixpanel from "mixpanel-browser";

interface SheetJSPreviewProps {
  file: FileMetadata;
  rowCount?: number; // Default number of rows to display
  maxPreviewSize?: number; // Maximum size for preview (in MB)
  showButtons?: boolean;
}

interface SheetRow {
  [key: string]: any; // Generic object type for each row
}

const SheetJSPreview: React.FC<SheetJSPreviewProps> = ({
  file,
  rowCount = 50,
  maxPreviewSize = 1,
  showButtons = true,
}) => {
  const [data, setData] = useState<SheetRow[]>([]); // State for rows
  const [headers, setHeaders] = useState<string[]>([]); // State for column headers
  const [fileSize, setFileSize] = useState<number>(0); // Store file size

  const { rawURL: url } = file;

  useEffect(() => {
    const checkFileSizeAndFetch = async () => {
      try {
        // Perform a HEAD request to check file size
        const headResponse = await fetch(url, { method: "HEAD" });

        const contentLength = headResponse.headers.get("Content-Length");
        if (contentLength) {
          const sizeInBytes = parseInt(contentLength, 10);
          const sizeInMB = sizeInBytes / (1024 * 1024); // Convert bytes to MB
          setFileSize(sizeInMB);
          if (sizeInMB > maxPreviewSize) {
            return; // Exit early if file size exceeds the limit
          }
        }

        // Fetch and preview the file if it's within the size limit
        fetchData();
      } catch (error) {
        console.error("Error checking file size:", error);
      }
    };
    const fetchData = async () => {
      try {
        // Fetch the XLSX file as an ArrayBuffer from the remote URL
        // disable cors
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        // Parse the ArrayBuffer into a workbook
        const workbook: WorkBook = read(arrayBuffer, { type: "array" });

        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert worksheet to JSON (array of objects)
        const jsonData: SheetRow[] = utils.sheet_to_json(worksheet, {
          header: 1,
        });

        if (jsonData.length > 0) {
          // Set headers as the first row and data as the next `rowCount` rows
          setHeaders(jsonData[0] as string[]);
          setData(jsonData.slice(1, rowCount + 1)); // Take the first `rowCount` rows
        }
      } catch (error) {
        console.error("Error fetching or processing the XLSX file:", error);
      }
    };

    checkFileSizeAndFetch();
  }, [url, rowCount]);
  console.log("url is", url);

  if (url.startsWith("blob") || !url.includes("http")) {
    return (
      <Result
        icon={<FileExcelOutlined />}
        title="Preview Unavailable"
        extra={
          showButtons
            ? [
                <div key="download">
                  <a
                    href={url}
                    target={
                      file.extension.toLowerCase() === "pdf"
                        ? "_blank"
                        : "_self"
                    }
                    download={file.originalFileName}
                  >
                    <Button
                      type="primary"
                      onClick={() => {
                        mixpanel.track("Download File", {
                          "File Type": file.originalFileName.split(".").pop(),
                        });
                      }}
                      key="download1"
                    >
                      Download
                    </Button>
                  </a>
                </div>,
              ]
            : []
        }
      />
    );
  }

  if (fileSize > maxPreviewSize) {
    return (
      <Result
        icon={<FileExcelOutlined />}
        title="Preview Unavailable"
        subTitle={`File size exceeded the max preview size of ${maxPreviewSize} mb`}
        extra={
          showButtons
            ? [
                <div key="download">
                  <a
                    href={url}
                    target={
                      file.extension.toLowerCase() === "pdf"
                        ? "_blank"
                        : "_self"
                    }
                    download={file.originalFileName}
                  >
                    <Button
                      type="primary"
                      onClick={() => {
                        mixpanel.track("Download File", {
                          "File Type": file.originalFileName.split(".").pop(),
                        });
                      }}
                      key="download1"
                    >
                      Download
                    </Button>
                  </a>
                </div>,
              ]
            : []
        }
      />
    );
  }

  return (
    <div className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            {/* Render table headers */}
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Render table rows */}
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>{row[colIndex]}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={headers.length}>
              {/* Display the total number of rows */}
              Only showing first {data.length} rows
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default SheetJSPreview;
