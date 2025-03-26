// import React, { useState, useRef, useEffect, useCallback } from "react";
// import {
//   Button,
//   Card,
//   Progress,
//   Space,
//   Table,
//   Tag,
//   message,
//   Divider,
//   Typography,
//   Popover,
//   Image,
// } from "antd";
// import {
//   UploadOutlined,
//   PauseCircleOutlined,
//   PlayCircleOutlined,
//   DeleteOutlined,
//   FileImageOutlined,
//   FileTextOutlined,
//   FileZipOutlined,
//   FilePdfOutlined,
//   FileUnknownOutlined,
//   EyeOutlined,
//   DownloadOutlined,
// } from "@ant-design/icons";
// import { useMultiUploader } from "../../framework/uploader/hook";
// import {
//   UploadState,
//   UploadID,
//   QueuedUploadItem,
// } from "../../framework/uploader/types";
// import { DiskTypeEnum, GenerateID } from "@officexapp/types";
// import { defaultBrowserCacheDiskID } from "../../api/dexie-database";
// import { IndexedDBAdapter } from "../../framework/uploader/adapters/indexdb.adapter";
// import { sleep } from "../../api/helpers";

// const { Title, Text } = Typography;

// /**
//  * A demo component showcasing the usage of the MultiUploader framework
//  * specifically with IndexedDB
//  */
// const SandboxUploader: React.FC = () => {
//   const {
//     uploadFile,
//     uploadFiles,
//     pauseUpload,
//     resumeUpload,
//     cancelUpload,
//     clearFinishedUploads,
//     pauseAllUploads,
//     resumeAllUploads,
//     currentUploads,
//     progress,
//     getFileUrl,
//     isInitialized,
//     uploadManager,
//     registerAdapter,
//   } = useMultiUploader();

//   const [fileList, setFileList] = useState<File[]>([]);
//   const [urls, setUrls] = useState<Record<string, string>>({});
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [initializationStatus, setInitializationStatus] =
//     useState("Initializing...");
//   const [previewOpen, setPreviewOpen] = useState(false);
//   const [previewImage, setPreviewImage] = useState("");
//   const [previewTitle, setPreviewTitle] = useState("");
//   const [adapterRegistered, setAdapterRegistered] = useState(false);

//   useEffect(() => {
//     const registerAdapters = async () => {
//       if (isInitialized && !adapterRegistered) {
//         try {
//           // Create IndexedDB adapter
//           const indexedDBAdapter = new IndexedDBAdapter();

//           // Configuration for IndexedDB
//           const indexDBConfig = {
//             databaseName: "OFFICEX-browser-cache-storage-user123",
//             objectStoreName: "files",
//           };

//           // Register the adapter
//           await registerAdapter(
//             indexedDBAdapter,
//             DiskTypeEnum.BrowserCache,
//             defaultBrowserCacheDiskID,
//             indexDBConfig,
//             1, // Concurrency
//             2 // Priority
//           );

//           console.log("Adapter registered successfully");
//           setAdapterRegistered(true);
//         } catch (error) {
//           console.error("Failed to register adapter:", error);
//         }
//       }
//     };

//     registerAdapters();
//   }, [isInitialized, adapterRegistered, registerAdapter]);

//   // Check initialization status
//   useEffect(() => {
//     if (isInitialized) {
//       setInitializationStatus("Initialized");
//       console.log("MultiUploader initialized successfully");
//       console.log(
//         "Available adapters:",
//         uploadManager?.getRegisteredAdapters()
//       );
//     } else {
//       setInitializationStatus("Not initialized");
//     }
//   }, [isInitialized, uploadManager]);

//   // Update URLs for completed uploads
//   useEffect(() => {
//     const checkCompletedUploads = async () => {
//       await sleep(2000);
//       for (const upload of currentUploads) {
//         if (upload.state === UploadState.COMPLETED && !urls[upload.id]) {
//           try {
//             console.log(`Fetching URL for completed upload ${upload.id}`);
//             const url = await getFileUrl(upload.id);

//             if (url) {
//               console.log(`Got URL for ${upload.id}: ${url}`);
//               setUrls((prev) => ({ ...prev, [upload.id]: url }));
//             } else {
//               console.warn(`No URL returned for ${upload.id}`);
//             }
//           } catch (error) {
//             console.error(`Error getting URL for ${upload.id}:`, error);
//           }
//         }
//       }
//     };

//     checkCompletedUploads();
//   }, [currentUploads, getFileUrl, urls]);

//   // Handle file selection
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const filesArray = Array.from(e.target.files);
//       setFileList((prev) => [...prev, ...filesArray]);
//     }
//   };

//   // Upload selected files
//   const handleUpload = () => {
//     if (fileList.length === 0) {
//       message.warning("Please select files first");
//       return;
//     }

//     try {
//       // Store mapping of file name to upload ID for easier tracking
//       const fileToIdMap = new Map();

//       // Upload all files in the fileList
//       const uploadIds = uploadFiles(
//         fileList.map((file) => ({ file, fileID: GenerateID.File() })),
//         "/uploads",
//         DiskTypeEnum.BrowserCache,
//         defaultBrowserCacheDiskID,
//         {
//           onFileComplete: (id) => {
//             // Find the file this ID corresponds to
//             const matchingFile = fileList.find((file) => {
//               return fileToIdMap.get(file.name) === id;
//             });

//             if (matchingFile) {
//               message.success(
//                 `File ${matchingFile.name} uploaded successfully`
//               );
//               console.log(
//                 `Upload complete for ${matchingFile.name} with ID: ${id}`
//               );
//               fetchFileUrl(id);
//             } else {
//               console.warn(`Completed upload ID ${id} doesn't match any file`);
//               fetchFileUrl(id); // Try anyway
//             }
//           },
//           onAllComplete: () => {
//             message.success("All files uploaded successfully");
//             setFileList([]);
//           },
//         }
//       );

//       // Store the mapping between files and their upload IDs
//       fileList.forEach((file, index) => {
//         if (index < uploadIds.length) {
//           fileToIdMap.set(file.name, uploadIds[index]);
//           console.log(
//             `Mapped file ${file.name} to upload ID: ${uploadIds[index]}`
//           );
//         }
//       });

//       console.log("Started uploads with IDs:", uploadIds);
//     } catch (error) {
//       console.error("Error starting uploads:", error);
//       message.error("Failed to start uploads. Check console for details.");
//     }
//   };

//   // Get file URL after upload is complete
//   const fetchFileUrl = async (id: UploadID) => {
//     console.log(`Fetching URL for ${id}`);
//     try {
//       // Log all available uploads first to help with debugging
//       console.log("Current uploads:", currentUploads);

//       // Check if this ID exists in our upload list
//       const uploadItem = currentUploads.find((upload) => upload.id === id);
//       if (!uploadItem) {
//         console.warn(`No upload found with ID ${id} in currentUploads`);
//         // Try to get the URL anyway, since the ID might be correct in IndexedDB
//       } else {
//         console.log(`Found upload for ID ${id}: ${uploadItem.file.name}`);
//       }

//       const url = await getFileUrl(id);
//       console.log(`URL for ${id}:`, url);

//       if (url) {
//         setUrls((prev) => ({ ...prev, [id]: url }));
//       } else {
//         console.warn(`No URL returned for ${id}`);

//         // Let's try once more after a short delay
//         setTimeout(async () => {
//           const retryUrl = await getFileUrl(id);
//           if (retryUrl) {
//             console.log(`Succeeded getting URL for ${id} after retry`);
//             setUrls((prev) => ({ ...prev, [id]: retryUrl }));
//           } else {
//             console.error(`Failed to get URL for ${id} after retry`);
//           }
//         }, 1000);
//       }
//     } catch (error) {
//       console.error(`Error getting URL for ${id}:`, error);
//     }
//   };

//   // Handle pause upload
//   const handlePauseUpload = async (id: UploadID) => {
//     try {
//       const paused = await pauseUpload(id);
//       if (paused) {
//         message.info(`Upload paused: ${id}`);
//       } else {
//         message.error(`Failed to pause upload: ${id}`);
//       }
//     } catch (error) {
//       console.error(`Error pausing upload ${id}:`, error);
//       message.error("Failed to pause upload. Check console for details.");
//     }
//   };

//   // Handle resume upload
//   const handleResumeUpload = async (id: UploadID, item: QueuedUploadItem) => {
//     try {
//       const resumed = await resumeUpload(id, item.fileID, item.file);
//       if (resumed) {
//         message.info(`Upload resumed: ${id}`);
//       } else {
//         message.error(`Failed to resume upload: ${id}`);
//       }
//     } catch (error) {
//       console.error(`Error resuming upload ${id}:`, error);
//       message.error("Failed to resume upload. Check console for details.");
//     }
//   };

//   // Handle cancel upload
//   const handleCancelUpload = async (id: UploadID) => {
//     try {
//       const cancelled = await cancelUpload(id);
//       if (cancelled) {
//         revokeObjectURL(id);
//         message.info(`Upload cancelled: ${id}`);
//       } else {
//         message.error(`Failed to cancel upload: ${id}`);
//       }
//     } catch (error) {
//       console.error(`Error cancelling upload ${id}:`, error);
//       message.error("Failed to cancel upload. Check console for details.");
//     }
//   };

//   // Handle file download
//   const handleDownloadFile = (url: string, fileName: string) => {
//     try {
//       console.log(`Downloading ${fileName} from ${url}`);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();

//       // Clean up after download starts
//       setTimeout(() => {
//         document.body.removeChild(link);
//       }, 100);
//     } catch (error) {
//       console.error("Error downloading file:", error);
//       message.error("Failed to download file. Please try again.");
//     }
//   };

//   // Get file icon based on type
//   const getFileIcon = (file: File) => {
//     const type = file.type;

//     if (type.startsWith("image/")) {
//       return <FileImageOutlined />;
//     } else if (type.includes("pdf")) {
//       return <FilePdfOutlined />;
//     } else if (
//       type.includes("zip") ||
//       type.includes("rar") ||
//       type.includes("tar") ||
//       type.includes("gzip")
//     ) {
//       return <FileZipOutlined />;
//     } else if (type.startsWith("text/") || type.includes("document")) {
//       return <FileTextOutlined />;
//     } else {
//       return <FileUnknownOutlined />;
//     }
//   };

//   // Get tag color based on upload state
//   const getStateTagColor = (state: UploadState) => {
//     switch (state) {
//       case UploadState.ACTIVE:
//         return "processing";
//       case UploadState.COMPLETED:
//         return "success";
//       case UploadState.PAUSED:
//         return "warning";
//       case UploadState.FAILED:
//         return "error";
//       case UploadState.CANCELLED:
//         return "default";
//       case UploadState.QUEUED:
//         return "blue";
//       default:
//         return "blue";
//     }
//   };

//   // Format bytes to human-readable format
//   const formatBytes = (bytes: number, decimals = 2) => {
//     if (bytes === 0) return "0 Bytes";

//     const k = 1024;
//     const dm = decimals < 0 ? 0 : decimals;
//     const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

//     const i = Math.floor(Math.log(bytes) / Math.log(k));

//     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
//   };

//   // Check if a file is an image based on its type
//   const isImageFile = (file: File) => {
//     return file.type.startsWith("image/");
//   };

//   // Image preview content for Popover
//   const renderImagePreview = (url: string) => {
//     return (
//       <div style={{ width: "250px" }}>
//         <Image src={url} alt="Preview" style={{ width: "100%" }} />
//       </div>
//     );
//   };

//   // Table columns
//   const columns = [
//     {
//       title: "File",
//       dataIndex: "file",
//       key: "file",
//       render: (file: File, record: QueuedUploadItem) => {
//         const isCompleted = record.state === UploadState.COMPLETED;
//         const isImage = isImageFile(file);
//         console.log("urls", urls);
//         const fileUrl = urls[record.id];
//         console.log(
//           `isCompleted: ${isCompleted}, isImage: ${isImage}, fileUrl: ${fileUrl}`
//         );
//         if (isCompleted && isImage && fileUrl) {
//           return (
//             <Popover
//               content={renderImagePreview(fileUrl)}
//               title={file.name}
//               trigger="hover"
//               placement="right"
//             >
//               <Space>
//                 {getFileIcon(file)}
//                 <span style={{ cursor: "pointer", color: "#1890ff" }}>
//                   {file.name}
//                 </span>
//               </Space>
//             </Popover>
//           );
//         }

//         return (
//           <Space>
//             {getFileIcon(file)}
//             <span>{file.name}</span>
//           </Space>
//         );
//       },
//     },
//     {
//       title: "Size",
//       dataIndex: "file",
//       key: "size",
//       render: (file: File) => formatBytes(file.size),
//     },
//     {
//       title: "Status",
//       dataIndex: "state",
//       key: "state",
//       render: (state: UploadState) => (
//         <Tag color={getStateTagColor(state)}>{state.toUpperCase()}</Tag>
//       ),
//     },
//     {
//       title: "Progress",
//       key: "progress",
//       render: (_: any, record: QueuedUploadItem) => {
//         const uploadProgress = record.lastProgress?.progress || 0;
//         return (
//           <Progress
//             percent={Math.floor(uploadProgress)}
//             size="small"
//             status={
//               record.state === UploadState.FAILED ? "exception" : undefined
//             }
//           />
//         );
//       },
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_: any, record: QueuedUploadItem) => {
//         const canPause = record.state === UploadState.ACTIVE;
//         const canResume = record.state === UploadState.PAUSED;
//         const canCancel =
//           record.state === UploadState.ACTIVE ||
//           record.state === UploadState.PAUSED;
//         const isCompleted = record.state === UploadState.COMPLETED;
//         const fileUrl = urls[record.id];
//         const isImage = isImageFile(record.file);

//         return (
//           <Space size="small">
//             {canPause && (
//               <Button
//                 icon={<PauseCircleOutlined />}
//                 onClick={() => handlePauseUpload(record.id)}
//                 size="small"
//                 type="text"
//               />
//             )}
//             {canResume && (
//               <Button
//                 icon={<PlayCircleOutlined />}
//                 onClick={() => handleResumeUpload(record.id, record)}
//                 size="small"
//                 type="text"
//               />
//             )}
//             {canCancel && (
//               <Button
//                 icon={<DeleteOutlined />}
//                 onClick={() => handleCancelUpload(record.id)}
//                 size="small"
//                 danger
//                 type="text"
//               />
//             )}
//             {isCompleted && fileUrl && (
//               <>
//                 {isImage && (
//                   <Button
//                     icon={<EyeOutlined />}
//                     onClick={() => window.open(fileUrl, "_blank")}
//                     size="small"
//                     type="text"
//                   />
//                 )}
//                 <Button
//                   icon={<DownloadOutlined />}
//                   onClick={() => handleDownloadFile(fileUrl, record.file.name)}
//                   size="small"
//                   type="text"
//                 />
//               </>
//             )}
//           </Space>
//         );
//       },
//     },
//   ];

//   const revokeObjectURL = useCallback(
//     (id: UploadID) => {
//       const url = urls[id];
//       if (url) {
//         URL.revokeObjectURL(url);
//         setUrls((prev) => {
//           const newUrls = { ...prev };
//           delete newUrls[id];
//           return newUrls;
//         });
//       }
//     },
//     [urls]
//   );

//   return (
//     <Card
//       title="IndexedDB File Upload Demo"
//       style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}
//     >
//       <Space direction="vertical" size="large" style={{ width: "100%" }}>
//         {/* Initialization status */}
//         <div>
//           <Tag
//             color={isInitialized ? "success" : "warning"}
//             style={{ marginBottom: 16 }}
//           >
//             Status: {initializationStatus}
//           </Tag>
//         </div>

//         {/* File selection */}
//         <div>
//           <Title level={4}>Select Files</Title>
//           <Space>
//             <Button
//               icon={<UploadOutlined />}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               Select Files
//             </Button>
//             <input
//               ref={fileInputRef}
//               type="file"
//               multiple
//               onChange={handleFileSelect}
//               style={{ display: "none" }}
//             />
//             <Button
//               type="primary"
//               onClick={handleUpload}
//               disabled={fileList.length === 0 || !isInitialized}
//             >
//               Upload to IndexedDB
//             </Button>
//           </Space>
//           {fileList.length > 0 && (
//             <div style={{ marginTop: 16 }}>
//               <Text>{fileList.length} file(s) selected</Text>
//               <ul>
//                 {fileList.map((file, index) => (
//                   <li key={index}>
//                     {file.name} - {formatBytes(file.size)}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         <Divider />

//         {/* Upload progress summary */}
//         <div>
//           <Title level={4}>Upload Progress</Title>
//           <Space style={{ marginBottom: 16 }}>
//             <Button
//               onClick={() => pauseAllUploads()}
//               disabled={progress.activeFiles === 0}
//             >
//               Pause All
//             </Button>
//             <Button
//               onClick={() => resumeAllUploads()}
//               disabled={progress.pausedFiles === 0}
//             >
//               Resume All
//             </Button>
//             <Button
//               onClick={() => clearFinishedUploads()}
//               disabled={progress.completedFiles + progress.failedFiles === 0}
//             >
//               Clear Finished
//             </Button>
//           </Space>

//           <div style={{ marginBottom: 16 }}>
//             <Text>Overall Progress: {progress.overallProgress}%</Text>
//             <Progress percent={progress.overallProgress} />
//           </div>

//           <Space style={{ marginBottom: 16 }}>
//             <Tag color="blue">Total: {progress.totalFiles}</Tag>
//             <Tag color="processing">Active: {progress.activeFiles}</Tag>
//             <Tag color="success">Completed: {progress.completedFiles}</Tag>
//             <Tag color="warning">Paused: {progress.pausedFiles}</Tag>
//             <Tag color="error">Failed: {progress.failedFiles}</Tag>
//           </Space>
//         </div>

//         <Divider />

//         {/* Uploads list */}
//         <div>
//           <Title level={4}>Uploads</Title>
//           <Table
//             dataSource={currentUploads}
//             columns={columns}
//             rowKey="id"
//             pagination={false}
//             locale={{ emptyText: "No uploads in progress" }}
//           />
//         </div>
//       </Space>
//     </Card>
//   );
// };

// export default SandboxUploader;
