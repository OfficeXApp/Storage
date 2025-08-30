// DDocumentEditor.tsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import {
  Modal,
  Button,
  Result,
  Typography,
  message,
  Input,
  Spin,
  Tooltip,
  Popconfirm,
  Alert,
} from "antd";
import docsLogo from "../../assets/docs-logo.png";
import {
  FileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
  FileExcelOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { FileUUID, StorageLocationEnum, useDrive } from "../../framework";
import useScreenType from "react-screentype-hook";
import { Link, useNavigate, useParams } from "react-router-dom";
// import FilePreview from "../FilePreview";
import { createPseudoShareLink } from "../../api/pseudo-share";
import mixpanel from "mixpanel-browser";
import { isFreeTrialStorj } from "../../api/storj";
import { useIdentitySystem } from "../../framework/identity";
import {
  FileFEO,
  shouldBehaveOfflineDiskUIIntent,
} from "../../redux-offline/directory/directory.reducer";
import {
  DirectoryPermissionType,
  DirectoryResourceID,
  DiskID,
  DiskTypeEnum,
  FileConflictResolutionEnum,
  FileID,
  fileRawUrl_BTOA,
  FolderID,
} from "@officexapp/types";
import {
  extractDiskInfo,
  sleep,
  urlSafeBase64Decode,
  urlSafeBase64Encode,
  wrapAuthStringOrHeader,
} from "../../api/helpers";
import {
  bumpRecentDirectory,
  generateListDirectoryKey,
  GET_FILE,
  getFileAction,
  UPDATE_FILE,
  updateFileAction,
} from "../../redux-offline/directory/directory.actions";
import { useDispatch, useSelector } from "react-redux";
import {
  connect,
  Connection,
  debug,
  Methods,
  RemoteProxy,
  WindowMessenger,
} from "penpal";
import DirectorySharingDrawer from "../../components/DirectorySharingDrawer";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";
import {
  DDOCS_ENDPOINT,
  LOCAL_DEV_MODE,
} from "../../framework/identity/constants";
import { Helmet } from "react-helmet";
import Marquee from "react-fast-marquee";
import SlimAppHeader from "../../components/SlimAppHeader";
import { useMultiUploader } from "../../framework/uploader/hook";

import DirectoryGuard from "../../components/DriveUI/DirectoryGuard";
import AIChatPanel from "../../components/AIChatPanel";

const { Text } = Typography;

const DDocumentEditor = () => {
  const {
    orgcode,
    fileID,
    diskTypeEnum: diskTypeEnumFromUrl,
    diskID: diskIDFromUrl,
    parentFolderID: parentFolderIDFromUrl,
  } = useParams();
  const screenType = useScreenType();
  const navigate = useNavigate();
  const isMobile = screenType.isMobile;
  const [redeemData, setRedeemData] = useState<fileRawUrl_BTOA | null>(null);
  const currentLoadingFileRef = useRef<string | null>(null);
  const lastLoadedFileRef = useRef<string>("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const penpalRef = useRef<RemoteProxy<Methods>>(null);
  const penpalConnectionRef = useRef<Connection | null>(null);
  const {
    uploadFiles,
    uploadTargetDiskID,
    uploadTargetDisk,
    uploadTargetFolderID,
  } = useMultiUploader();
  const {
    currentProfile,
    currentOrg,
    currentAPIKey,
    generateSignature,
    wrapOrgCode,
  } = useIdentitySystem();
  const { evmPublicKey, icpAccount } = currentProfile || {};
  const dispatch = useDispatch();
  // State for file content and UI
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  // IndexedDB specific state and methods
  const dbNameRef = useRef<string>(
    `OFFICEX-browser-cache-storage-${currentOrg?.driveID}-${currentProfile?.userID}`
  );
  const fileContentRef = useRef<any>(null);
  const loadingPromiseRef = useRef<Promise<any> | null>(null);
  const [fileContentVersion, setFileContentVersion] = useState(0);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [fileContentError, setFileContentError] = useState<string | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(
    fileID === "new" || false
  );

  const [emptyFile, setEmptyFile] = useState({
    id: `FileID_${uuidv4()}`,
    name: `Untitled Document`,
    isNewBlank: true,
  });

  const fileFromRedux: FileFEO | undefined = useSelector(
    (state: ReduxAppState) =>
      state.directory.fileMap[fileID === "new" ? emptyFile.id : fileID || ""]
  );

  const file = fileFromRedux || redeemData?.original || emptyFile;

  const [currentFileName, setCurrentFileName] = useState("Untitled Document");
  const currentFileNameRef = useRef<string>(currentFileName);

  const [freshGeneratedSignature, setFreshGeneratedSignature] =
    useState<string>("");

  const params = new URLSearchParams(location.search);

  const objectStoreNameRef = useRef<string>("files");

  useEffect(() => {
    const defaultName =
      file.name.replace(".officex-doc", "") || "Untitled Document";
    setCurrentFileName(defaultName);
    currentFileNameRef.current = defaultName;

    if (!fileFromRedux) {
      if (!fileID) return;
      setTimeout(() => {
        fetchFileById(fileID);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const getRedeemParam = async () => {
      const searchParams = new URLSearchParams(location.search);
      const redeemParam = searchParams.get("redeem");

      if (redeemParam) {
        try {
          const decodedData = JSON.parse(urlSafeBase64Decode(redeemParam));
          setRedeemData(decodedData);
        } catch (error) {
          console.error("Error decoding redeem parameter:", error);
          toast.error(<span>Invalid resource access link</span>);
        }
      }
    };

    getRedeemParam();
  }, [location]);

  const fetchJsonContent = useCallback(async (url: string) => {
    if (!url) return;

    setFileContentLoading(true);
    setFileContentError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        setFileContentError(`HTTP error: ${response.status}`);
        throw new Error(`HTTP error: ${response.status}`);
      }

      // Get response as text
      const text = await response.text();

      try {
        // Parse as JSON
        // const jsonData = JSON.parse(text);

        // Store in ref instead of state
        fileContentRef.current = text;

        // Signal that content has been updated
        setFileContentVersion((prev) => prev + 1);
        setIframeReady(true);
        setIsContentLoaded(true); // Set content loaded to true on success
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        fileContentRef.current = { raw: text };
        setFileContentVersion((prev) => prev + 1);
        setFileContentError("Could not parse file as JSON");
      }
    } catch (error) {
      console.error("Error loading file content:", error);
      setFileContentError(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setFileContentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fileUrl) {
      loadingPromiseRef.current = fetchJsonContent(fileUrl);
    }
  }, [fileUrl, fetchJsonContent]);

  useEffect(() => {
    const updateFreshSignature = async () => {
      const signature = await generateSignature();
      setFreshGeneratedSignature(signature);
    };

    // Run immediately
    updateFreshSignature();

    // Set up interval to run every 25 seconds
    const interval = setInterval(updateFreshSignature, 25000);

    // Cleanup function - clears the interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Help garbage collection by clearing the ref
      fileContentRef.current = null;
    };
  }, []);

  const isFileSizeValidForPreview = (file: FileFEO) => {
    const sizeInMB = file.file_size / (1024 * 1024);
    const sizeInGB = sizeInMB / 1024;

    if (
      file.disk_type === DiskTypeEnum.BrowserCache ||
      file.disk_type === DiskTypeEnum.IcpCanister
    ) {
      return isMobile ? sizeInMB < 200 : sizeInGB < 1;
    } else if (
      file.disk_type === DiskTypeEnum.StorjWeb3 ||
      file.disk_type === DiskTypeEnum.AwsBucket
    ) {
      return sizeInGB < 2;
    }
    return true;
  };

  useEffect(() => {
    if (fileID) {
      if (fileID === "new") {
        setIframeReady(true);
        mixpanel.track("New Document");
      } else {
        fetchFileById(fileID);
        mixpanel.track("View Document");
        mixpanel.track("View File");
      }
    }
  }, [location]);

  useEffect(() => {
    if (currentOrg && currentProfile) {
      dbNameRef.current = `OFFICEX-browser-cache-storage-${currentOrg.driveID}-${currentProfile.userID}`;
    }
  }, [currentOrg, currentProfile]);

  const fileType = "officex-doc";

  // New method to handle files from IndexedDB
  const getFileFromIndexedDB = async (fileId: FileUUID): Promise<string> => {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbNameRef.current, 1);

      openRequest.onerror = (event) => {
        console.error("Error opening IndexedDB:", event);
        reject(new Error("Failed to open IndexedDB"));
      };

      openRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Try retrieving the file first
        const filesTransaction = db.transaction(
          [objectStoreNameRef.current],
          "readonly"
        );
        const filesStore = filesTransaction.objectStore(
          objectStoreNameRef.current
        );
        const fileRequest = filesStore.get(fileId);

        fileRequest.onsuccess = async () => {
          if (fileRequest.result) {
            // Check if we have the complete file
            if (fileRequest.result.uploadComplete) {
              // For certain file types that need reconstruction from chunks
              if (
                [
                  "image",
                  "video",
                  "audio",
                  "pdf",
                  "document",
                  "other",
                  "officex-doc",
                  "officex-doc",
                ].includes(fileType)
              ) {
                try {
                  const fileBlob = await reconstructFileFromChunks(db, fileId);
                  if (fileBlob) {
                    const url = URL.createObjectURL(fileBlob);
                    resolve(url);
                  } else {
                    reject(new Error("Failed to reconstruct file from chunks"));
                  }
                } catch (error) {
                  console.error("Error reconstructing file:", error);
                  reject(error);
                }
              } else {
                // For other types where direct access may be enough
                resolve(fileRequest.result.url || "");
              }
            } else {
              reject(new Error("File upload is not complete"));
            }
          } else {
            reject(new Error("File not found in IndexedDB"));
          }
        };

        fileRequest.onerror = (event) => {
          console.error("Error retrieving file from IndexedDB:", event);
          reject(new Error("Failed to retrieve file from IndexedDB"));
        };
      };

      // Handle database version upgrade (first time)
      openRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(objectStoreNameRef.current)) {
          db.createObjectStore(objectStoreNameRef.current, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("file_chunks")) {
          db.createObjectStore("file_chunks", { keyPath: "id" });
        }
      };
    });
  };

  // Helper method to reconstruct a file from chunks
  const reconstructFileFromChunks = async (
    db: IDBDatabase,
    fileId: FileUUID
  ): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      try {
        // First get the file metadata to determine chunks
        const filesTransaction = db.transaction(
          [objectStoreNameRef.current],
          "readonly"
        );
        const filesStore = filesTransaction.objectStore(
          objectStoreNameRef.current
        );
        const metadataRequest = filesStore.get(fileId);

        metadataRequest.onsuccess = async () => {
          if (!metadataRequest.result) {
            console.error("File metadata not found for reconstruction");
            return resolve(null);
          }

          const fileInfo = metadataRequest.result;
          const chunkSize = 1024 * 1024; // Default 1MB chunks
          const totalChunks = Math.ceil(fileInfo.size / chunkSize);

          // Start transaction for chunks
          const chunksTransaction = db.transaction(["file_chunks"], "readonly");
          const chunksStore = chunksTransaction.objectStore("file_chunks");

          const chunks: Uint8Array[] = [];
          let loadedChunks = 0;

          // Process each chunk
          for (let i = 0; i < totalChunks; i++) {
            const chunkId = `${fileId}_chunk_${i}`;
            const chunkRequest = chunksStore.get(chunkId);

            chunkRequest.onsuccess = (event) => {
              const result = (event.target as IDBRequest).result;
              if (result && result.data) {
                chunks[i] = result.data; // Store at correct position
                loadedChunks++;

                // Check if all chunks are loaded
                if (loadedChunks === totalChunks) {
                  const blob = new Blob(chunks, {
                    type: fileInfo.type || "application/octet-stream",
                  });
                  resolve(blob);
                }
              } else {
                console.warn(`Missing chunk ${i} for file ${fileId}`);
                loadedChunks++;

                // Even with missing chunks, try to construct partial file
                if (loadedChunks === totalChunks) {
                  if (chunks.length > 0) {
                    const blob = new Blob(chunks.filter(Boolean), {
                      type: fileInfo.type || "application/octet-stream",
                    });
                    resolve(blob);
                  } else {
                    resolve(null);
                  }
                }
              }
            };

            chunkRequest.onerror = (event) => {
              console.error(`Error loading chunk ${i}:`, event);
              loadedChunks++;

              // Continue with remaining chunks
              if (loadedChunks === totalChunks && chunks.length > 0) {
                const blob = new Blob(chunks.filter(Boolean), {
                  type: fileInfo.type || "application/octet-stream",
                });
                resolve(blob);
              }
            };
          }

          // Handle case with no chunks
          if (totalChunks === 0) {
            resolve(null);
          }
        };

        metadataRequest.onerror = (event) => {
          console.error("Error getting file metadata:", event);
          reject(new Error("Failed to get file metadata"));
        };
      } catch (error) {
        console.error("Error during file reconstruction:", error);
        reject(error);
      }
    });
  };

  useEffect(() => {
    if (!file) return;
    // If file ID hasn't changed, don't reload
    if (file.id === lastLoadedFileRef.current) {
      return;
    }

    // If we're already loading this file, don't start a new load
    if (currentLoadingFileRef.current === file.id) {
      return;
    }
    // Clear previous URL when switching to a new file
    if (fileUrl && file.id !== lastLoadedFileRef.current) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl("");
      setIsContentLoaded(false);
    }
    const loadFileContent = async () => {
      if (!file || !fileType) return;

      // if (!currentOrg?.host) {
      //   setFileUrl(file.raw_url || "");
      //   setIsLoading(false);
      //   return;
      // }

      // // Check if file is fully uploaded
      // if (
      //   file.upload_status !== "COMPLETED" &&
      //   currentOrg?.host &&
      //   !offlineDisk
      // ) {
      //   setIsLoading(false);
      //   return;
      // }

      // Check if file size is valid for preview
      if (!isFileSizeValidForPreview(file)) {
        setIsLoading(false);
        return;
      }

      currentLoadingFileRef.current = file.id;
      setIsLoading(true);
      try {
        if (file.disk_type === DiskTypeEnum.BrowserCache) {
          // Use IndexedDB approach instead of indexdbGetFileUrl
          const url = await getFileFromIndexedDB(file.id as FileUUID);
          setFileUrl(url);
        } else if (
          file.disk_type === DiskTypeEnum.StorjWeb3 ||
          file.disk_type === DiskTypeEnum.AwsBucket
        ) {
          const url = await getPresignedUrl(file.raw_url as string);
          setFileUrl(url as string);
        } else if (file.disk_type === DiskTypeEnum.IcpCanister) {
          // Handle IcpCanister files using the raw download endpoints
          // wait 3 seconds
          await sleep(3000);
          const blobUrl = await fetchFileContentFromCanister(file.id as string);
          if (blobUrl) {
            setFileUrl(blobUrl);
          } else {
            throw new Error("Failed to load file from Canister");
          }
        }
        lastLoadedFileRef.current = file.id;
      } catch (error) {
        console.error("Error loading file content", error);
        // toast(<span>Failed to load file content</span>);
      } finally {
        setIsLoading(false);
        currentLoadingFileRef.current = null;
      }
    };

    loadFileContent();

    if (file.id !== lastLoadedFileRef.current) {
      const defaultName =
        file.name.replace(".officex-doc", "") || "Unknown File";
      setCurrentFileName(defaultName);
      currentFileNameRef.current = defaultName;
    }

    // Cleanup function
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file, fileType]);

  async function getPresignedUrl(initialUrl: string) {
    try {
      // Make a GET request to follow redirects without downloading content
      const url_with_auth = await wrapUrlWithAuth(initialUrl);
      const response = await fetch(url_with_auth, {
        method: "GET",
        redirect: "follow",
      });

      if (response.ok) {
        // response.url will contain the final URL after all redirects
        return response.url;
      } else {
        console.error("Error fetching presigned URL:", response.status);
        setFileContentError(`HTTP error: ${response.status}`);
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to get presigned URL:", error);
      setFileContentError(`Failed to get presigned URL: ${error}`);
      throw error;
    }
  }

  const fetchFileContentFromCanister = async (fileId: string) => {
    let auth_token = currentAPIKey?.value || (await generateSignature());
    try {
      // 1. Fetch metadata
      const { url, headers } = wrapAuthStringOrHeader(
        `${currentOrg?.host}/v1/drive/${currentOrg?.driveID}/directory/raw_download/meta?file_id=${fileId}`,
        {
          "Content-Type": "application/json",
        },
        auth_token
      );
      const metaRes = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!metaRes.ok) {
        throw new Error(`Metadata request failed: ${metaRes.statusText}`);
      }

      const metadata = await metaRes.json();
      const { total_size, total_chunks } = metadata;

      // 2. Fetch all chunks
      let allBytes = new Uint8Array(total_size);
      let offset = 0;

      for (let i = 0; i < total_chunks; i++) {
        const { url, headers } = wrapAuthStringOrHeader(
          `${currentOrg?.host}/v1/drive/${currentOrg?.driveID}/directory/raw_download/chunk?file_id=${fileId}&chunk_index=${i}`,
          {
            "Content-Type": "application/json",
          },
          auth_token
        );
        const chunkRes = await fetch(url, {
          method: "GET",
          headers,
        });

        if (!chunkRes.ok) {
          throw new Error(`Chunk request #${i} failed: ${chunkRes.statusText}`);
        }

        const chunkBuf = await chunkRes.arrayBuffer();
        allBytes.set(new Uint8Array(chunkBuf), offset);
        offset += chunkBuf.byteLength;
      }

      // 3. Create blob and URL
      const blob = new Blob([allBytes]);
      const blobUrl = URL.createObjectURL(blob);

      return blobUrl;
    } catch (error) {
      console.error(
        `Error fetching content from Canister for ${fileId}:`,
        error
      );
      return null;
    }
  };

  const handleRename = async (newName: string) => {
    const oldName = file.name;
    if (oldName === newName) return;
    if (newName.split(".").length === 1) {
      toast.error(<span>Filename must include extension</span>);
      return;
    }
    setIsUpdatingName(true);
    try {
      // update file action
      const updateAction = {
        action: UPDATE_FILE as "UPDATE_FILE",
        payload: {
          id: file.id,
          name: newName,
        },
      };

      dispatch(
        updateFileAction(
          updateAction,
          undefined,
          shouldBehaveOfflineDiskUIIntent(file.disk_id)
        )
      );
      toast.success(<span>File renamed successfully</span>);
    } catch (error) {
      toast.error(<span>Failed to rename file</span>);
    } finally {
      setIsUpdatingName(false);
      setIsEditing(false);
    }
  };

  const wrapUrlWithAuth = async (url: string) => {
    const signature = await generateSignature();
    let auth_token = currentAPIKey?.value || signature;
    if (currentOrg?.host && url?.includes(currentOrg.host)) {
      if (url.includes("?")) {
        return `${url}&auth=${auth_token}`;
      } else {
        return `${url}?auth=${auth_token}`;
      }
    } else {
      return url;
    }
  };

  const saveFileContent = async (fileContent: any) => {
    if (!file || !fileContent) {
      toast.error(<span>No file or content to save</span>);
      return false;
    }

    const _currentFileName = currentFileNameRef.current;

    const _fileContent = fileContent;

    try {
      // Convert string content to a file object
      const blob = new Blob([_fileContent], {
        type: "text/plain",
      });
      const fileObject = new File(
        [blob],
        `${_currentFileName.replace(".officex-doc", "")}.officex-doc`,
        {
          type: "text/plain",
        }
      );

      // Get the folder and disk information
      const parentFolderID =
        file.parent_folder_uuid ||
        parentFolderIDFromUrl ||
        uploadTargetFolderID ||
        "root";
      const diskType =
        file.disk_type || diskTypeEnumFromUrl || uploadTargetDisk?.disk_type;
      const diskID = file.disk_id || diskIDFromUrl || uploadTargetDiskID;

      if (!diskID) {
        toast.error(<span>No disk ID available for saving</span>);
        return false;
      }

      // Create file object with the same ID to overwrite existing file
      const uploadFileObject = {
        file: fileObject,
        fileID: file.id as FileID, // Use the existing file ID to overwrite
      };

      // Upload the file (which will overwrite the existing one)
      // The useMultiUploader will handle all disk types appropriately
      uploadFiles([uploadFileObject], parentFolderID, diskType, diskID, {
        onFileComplete: (fileUUID) => {
          // Refresh the file content after save
          // fetchFileById(file.id as FileID);
          dispatch(
            updateFileAction(
              {
                action: UPDATE_FILE as "UPDATE_FILE",
                payload: {
                  id: file.id,
                  name: `${_currentFileName.replace(".officex-doc", "")}.officex-doc`,
                },
              },
              undefined,
              shouldBehaveOfflineDiskUIIntent(file.disk_id)
            )
          );
          const pathDescription = (fileFromRedux.breadcrumbs || [])
            .slice(0, -1)
            .map((b) => b.resource_name)
            .join("/");

          const truncatedPathDescription =
            pathDescription.length > 50
              ? `...${pathDescription.slice(-47)}`
              : pathDescription;

          const description = ` ${truncatedPathDescription}`;
          const href = `${window.location.origin}${wrapOrgCode(
            `/drive/${
              file.disk_type || diskTypeEnumFromUrl
            }/${file.disk_type || diskType}/${fileUUID}${fileUUID.startsWith("FolderID_") ? "/" : ""}`
          )}`;

          bumpRecentDirectory(
            {
              id: fileUUID as DirectoryResourceID,
              title: fileObject.name,
              disk_id: file.disk_id || diskID,
              disk_type: file.disk_type || diskType,
              resource_id: fileUUID as DirectoryResourceID,
              href,
              last_opened: Date.now(),
              description,
            },
            currentProfile?.userID || "",
            currentOrg?.driveID || ""
          );
        },
        metadata: {
          dispatch,
        },
        parentFolderID: parentFolderID,
        listDirectoryKey: generateListDirectoryKey({
          folder_id: parentFolderID || undefined,
        }),
        fileConflictResolution: FileConflictResolutionEnum.REPLACE,
      });

      // setTimeout(() => {
      //   toast.success(`File ${_currentFileName} saved successfully`);
      // }, 5000);

      return true;
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error(<span>Failed to save file</span>);
      return false;
    }
  };

  // const parentMethods = {
  //   getFileData: () => {
  //     if (!file) {
  //       return {
  //         error: "No file data available",
  //         loading: isLoading,
  //       };
  //     }
  //     const _offlineDisk =
  //       file && file.disk_type
  //         ? shouldBehaveOfflineDiskUIIntent(file.disk_id)
  //         : true;
  //     // Always return metadata, loading state, and content reference
  //     return {
  //       file,
  //       contents: {
  //         content: fileContentRef.current,
  //         contentLoading: fileContentLoading || isLoading,
  //         contentError: fileContentError,
  //         contentVersion: fileContentVersion,
  //         url: fileUrl,
  //         editable:
  //           fileID === "new" ||
  //           file.permission_previews?.includes(DirectoryPermissionType.EDIT) ||
  //           _offlineDisk,
  //       },
  //     };
  //   },
  //   downloadFile: (fileContent: string) => {
  //     const _currentFileName = currentFileNameRef.current;
  //     const blob = new Blob([fileContent], { type: "application/json" });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     const _fileName = `${_currentFileName.replace(".officex-doc", "")}.officex-doc`;
  //     a.download = _fileName;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //     return `File ${_fileName} downloaded successfully.`;
  //   },
  //   saveFile: useCallback(
  //     async (fileContent: string) => {
  //       if (fileID !== "new") {
  //         const shouldSave = window.confirm(
  //           "Are you sure you want to save? Be careful not to overwrite other people's work. Realtime collab editing coming soon."
  //         );
  //         if (!shouldSave) return false;
  //       }

  //       const success = await saveFileContent(fileContent);

  //       history.replaceState(
  //         {},
  //         "",
  //         wrapOrgCode(
  //           `/drive/${file.disk_type || diskTypeEnumFromUrl}/${
  //             file.disk_id || diskIDFromUrl
  //           }/${file.parent_folder_uuid || parentFolderIDFromUrl}/${file.id}/apps/sheets`
  //         )
  //       );

  //       setTimeout(() => {
  //         fetchFileById(file.id as FileID);
  //       }, 5000);

  //       if (success) {
  //         return `File ${currentFileName} saved successfully.`;
  //       } else {
  //         return `Failed to save file ${currentFileName}.`;
  //       }
  //     },
  //     [currentFileName, file, saveFileContent]
  //   ),
  //   shareFile: useCallback(() => {
  //     setIsShareDrawerOpen(true);
  //     // Implement your save logic here
  //     return `File ${"fileName"} shared successfully.`;
  //   }, []),
  //   logMessage: useCallback((message: string) => {
  //     return `Parent received: ${message}`;
  //   }, []),
  // };

  useEffect(() => {
    // This function will be returned and called only when DDocumentEditor unmounts

    return () => {
      if (penpalConnectionRef.current) {
        penpalConnectionRef.current.destroy();
      }
    };
  }, []);

  const saveFile = useCallback(
    async (fileContent: string) => {
      // if (fileID !== "new") {
      //   const shouldSave = window.confirm(
      //     "Are you sure you want to save? Be careful not to overwrite other people's work. Realtime collab editing coming soon."
      //   );
      //   if (!shouldSave) return false;
      // }

      const success = await saveFileContent(fileContent);

      history.replaceState(
        {},
        "",
        wrapOrgCode(
          `/drive/${file.disk_type || diskTypeEnumFromUrl}/${
            file.disk_id || diskIDFromUrl
          }/${file.parent_folder_uuid || parentFolderIDFromUrl}/${file.id}/apps/documents`
        )
      );

      setTimeout(() => {
        fetchFileById(file.id as FileID);
      }, 5000);

      if (success) {
        return `File ${currentFileName} saved successfully.`;
      } else {
        return `Failed to save file ${currentFileName}.`;
      }
    },
    [currentFileName, file, saveFileContent]
  );
  const shareFile = useCallback(() => {
    setIsShareDrawerOpen(true);
    // Implement your save logic here
    return `File ${"fileName"} shared successfully.`;
  }, []);
  const logMessage = useCallback((message: string) => {
    return `Parent received: ${message}`;
  }, []);
  const getFileData = useCallback(async () => {
    // Add this log for debugging. It should now show the correct file object.

    if (!file) {
      return { error: "No file data available", loading: isLoading };
    }
    if (loadingPromiseRef.current) {
      await loadingPromiseRef.current;
    }

    const _offlineDisk = file?.disk_type
      ? shouldBehaveOfflineDiskUIIntent(file.disk_id)
      : true;
    const signature = await generateSignature();
    const auth_token = currentAPIKey?.value || signature;
    const payload = {
      file,
      contents: {
        content: fileContentRef.current,
        contentLoading: fileContentLoading || isLoading,
        contentError: fileContentError,
        contentVersion: fileContentVersion,
        webrtc_handshake_servers: currentOrg?.host
          ? [
              `${LOCAL_DEV_MODE ? "ws" : "wss"}://${currentOrg?.host.replace(LOCAL_DEV_MODE ? "http://" : "https://", "")}/v1/drive/${currentOrg?.driveID}/organization/webrtc?auth=${auth_token}&file_id=${file.id}`,
            ]
          : ["wss://webrtc-handshake.officex.app"],
        url: fileUrl,
        editable:
          fileID === "new" ||
          file.permission_previews?.includes(DirectoryPermissionType.EDIT) ||
          _offlineDisk,
      },
      user: {
        id: currentProfile?.userID,
        name: currentProfile?.nickname,
        slug: currentProfile?.slug,
        auth_token,
      },
    };

    if (_offlineDisk) {
      payload.file.permission_previews = [
        DirectoryPermissionType.EDIT,
        DirectoryPermissionType.UPLOAD,
        DirectoryPermissionType.MANAGE,
        DirectoryPermissionType.VIEW,
        DirectoryPermissionType.INVITE,
        DirectoryPermissionType.DELETE,
      ];
    }

    return payload;
  }, [
    file,
    isLoading,
    fileContentLoading,
    fileContentError,
    fileContentVersion,
    fileUrl,
    fileID,
    saveFile,
    shareFile,
    logMessage,
  ]);
  const downloadFile = useCallback((fileContent: string) => {
    const _currentFileName = currentFileNameRef.current;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const _fileName = `${_currentFileName.replace(".officex-doc", "")}.officex-doc`;
    a.download = _fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return `File ${_fileName} downloaded successfully.`;
  }, []);

  const parentMethods = {
    getFileData,
    downloadFile,
    saveFile,
    shareFile,
    logMessage,
  };

  // REPLACE it with this useCallback-wrapped version of setupPenpal
  const setupPenpal = () => {
    if (penpalConnectionRef.current) {
      penpalConnectionRef.current.destroy();
    }

    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Define the methods right here, ensuring they close over the latest state and refs.

      try {
        const messenger = new WindowMessenger({
          remoteWindow: iframeRef.current.contentWindow,
          allowedOrigins: [new URL(DDOCS_ENDPOINT).origin],
        });

        const connection = connect({
          messenger,
          methods: parentMethods,
          // log: debug("Parent Penpal"),
        });

        penpalConnectionRef.current = connection;
      } catch (error) {
        console.error("Parent: Failed to establish Penpal connection:", error);
      }
    }
  };

  const { diskID: extractedDiskID } = extractDiskInfo();
  const offlineDisk = file
    ? shouldBehaveOfflineDiskUIIntent(extractedDiskID)
    : true;

  const fetchFileById = (fileId: FileID) => {
    try {
      // Create the get file action
      const getAction = {
        action: GET_FILE as "GET_FILE",
        payload: {
          id: fileId,
        },
      };

      dispatch(getFileAction(getAction, offlineDisk));

      // setTimeout(() => {
      //   setIframeReady(true);
      // }, 10000);
    } catch (error) {
      console.error("Error fetching file by ID:", error);
    }
  };

  if (!currentOrg && !currentProfile) {
    return null;
  }

  // unauthorized access to file
  if (
    // iframeReady &&
    fileID &&
    !fileFromRedux &&
    !redeemData &&
    fileID !== "new"
  ) {
    return (
      <DirectoryGuard
        resourceID={fileID}
        loading={(fileFromRedux as any)?.isLoading}
        fetchResource={() => {
          if (!fileID) return;
          fetchFileById(fileID);
        }}
      />
    );
  }

  if (fileID && fileContentError) {
    return (
      <DirectoryGuard
        resourceID={fileID}
        loading={false}
        fetchResource={() => {
          if (!fileID) return;
          fetchFileById(fileID);
        }}
      />
    );
  }

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{currentFileName.replace(".officex-doc", "")}</title>
        <link rel="icon" href="/docs-favicon.ico" />
      </Helmet>
      <Alert
        message={
          <Marquee pauseOnHover gradient={false}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <span>
                OfficeX Documents are in Beta Preview
                <a
                  href="https://officex.app"
                  target="_blank"
                  style={{ padding: "0px 10px" }}
                >
                  Learn More
                </a>
                <span>
                  Anonymous Workspace | Instant Access | No Signup Required
                  <a
                    href="https://t.me/officex_armybot"
                    target="_blank"
                    style={{ padding: "0px 10px" }}
                  >
                    Join Community
                  </a>
                </span>{" "}
              </span>
              <span>
                #OfficeX - Where Freedom Works | 100% Decentralized | 100% Open
                Source{" "}
                <a
                  href="https://officex.app"
                  target="_blank"
                  style={{ padding: "0px 10px" }}
                >
                  Learn More
                </a>
              </span>
            </div>
          </Marquee>
        }
        type="info"
        banner
        closable
      />
      <SlimAppHeader
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              // backgroundColor: "#f0f0f0",
              backgroundColor: "#ffffff",
              cursor: "pointer",
            }}
          >
            <Link
              to={
                parentFolderIDFromUrl || file.parent_folder_uuid
                  ? wrapOrgCode(
                      `/drive/${file.disk_type || diskTypeEnumFromUrl}/${
                        file.disk_id || diskIDFromUrl
                      }/${file.parent_folder_uuid || parentFolderIDFromUrl}/`
                    )
                  : wrapOrgCode("/drive")
              }
            >
              <img
                alt="Documents"
                src={docsLogo}
                style={
                  {
                    width: 30,
                    objectFit: "cover",
                    margin: "0px",
                  } as React.CSSProperties
                }
              />
            </Link>
            <Input
              value={currentFileName}
              onChange={(e) => {
                setCurrentFileName(e.target.value);
                currentFileNameRef.current = e.target.value;
              }}
              style={{
                marginLeft: 8,
                minWidth: screenType.isMobile ? 100 : 300,
                maxWidth: screenType.isMobile ? 200 : "unset",
              }}
              variant="borderless"
            />
          </div>
        }
      />
      {file && iframeReady && isContentLoaded ? (
        <iframe
          ref={iframeRef} // Attach the ref here
          src={DDOCS_ENDPOINT}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
          style={{
            width: "100%",
            height: screenType.isMobile ? "85vh" : "87vh",
            border: "none",
          }}
          onLoad={setupPenpal} // Trigger Penpal setup when the iframe content loads
        />
      ) : (
        <div
          style={{
            width: "100vw",
            height: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Spin />
          <br />
          <p style={{ marginTop: 16, fontWeight: 500, color: "gray" }}>
            Loading from Blockchain... <br />
            May take up to 15 seconds...
          </p>
        </div>
      )}

      <DirectorySharingDrawer
        open={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        resourceID={file.id as DirectoryResourceID}
        resourceName={currentFileName}
        resource={file}
        breadcrumbs={file?.breadcrumbs || []}
        currentUserPermissions={file?.permission_previews || []}
      />
      {!screenType.isMobile && (
        <AIChatPanel
          uploadPanelVisible={true}
          setUploadPanelVisible={() => {}}
        />
      )}
    </div>
  );
};

export default DDocumentEditor;
