import {
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
} from "../framework";
import { notification } from "antd";
import { Link } from "react-router-dom";

export const freeTrialStorjCreds = {
  access_key: "jw23ptdypclkptmfmfnirxjfkoqa",
  secret_key: "jyfrblil2o7fhmw5qxfenwhp5qbsxykvo4l3we2eu4yenqfodfdyw",
  endpoint: "https://gateway.storjshare.io",
};

// export const freeTrialStorjCreds = {
//   access_key: "jw23ptdypclkptmfmfnirxjfkoqa",
//   secret_key: "j3smkybq2b24foid56xw2tteesaes4dlamqueg5z4jiijeevdqlow",
//   endpoint: "https://gateway.storjshare.io",
// };

export const setupFreeTrialStorj = () => {
  const isStorjSet =
    localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_SECRET_KEY) &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_ENDPOINT);

  if (!isStorjSet) {
    localStorage.setItem(
      LOCAL_STORAGE_STORJ_ACCESS_KEY,
      freeTrialStorjCreds.access_key
    );
    localStorage.setItem(
      LOCAL_STORAGE_STORJ_SECRET_KEY,
      freeTrialStorjCreds.secret_key
    );
    localStorage.setItem(
      LOCAL_STORAGE_STORJ_ENDPOINT,
      freeTrialStorjCreds.endpoint
    );
  }
};

export const isFreeTrialStorj = () => {
  const isFreeTrialStorj =
    localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) ===
      freeTrialStorjCreds.access_key &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_SECRET_KEY) ===
      freeTrialStorjCreds.secret_key &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_ENDPOINT) ===
      freeTrialStorjCreds.endpoint;
  return isFreeTrialStorj;
};

import { S3, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

/**
 * Simple function to upload a file to Storj and return a presigned URL
 */
export async function uploadTempTrialSharing(file: File): Promise<string> {
  // Storj configuration
  const storjConfig = {
    endpoint: "https://gateway.storjshare.io",
    region: "us-east-1",
    accessKeyId: "jw23ptdypclkptmfmfnirxjfkoqa",
    secretAccessKey: "j3smkybq2b24foid56xw2tteesaes4dlamqueg5z4jiijeevdqlow",
    bucket: "officex",
  };

  // Initialize S3 client for Storj
  const s3Client = new S3({
    credentials: {
      accessKeyId: storjConfig.accessKeyId,
      secretAccessKey: storjConfig.secretAccessKey,
    },
    endpoint: storjConfig.endpoint,
    region: storjConfig.region,
    forcePathStyle: true, // Required for Storj
  });

  try {
    // Generate unique key for the file
    const fileExtension = file.name.split(".").pop() || "";
    const uniqueKey = `temp-trial/${uuidv4()}.${fileExtension}`;

    // Read file as ArrayBuffer
    const fileBuffer = await readFileAsArrayBuffer(file);

    // Upload file to Storj
    const putCommand = new PutObjectCommand({
      Bucket: storjConfig.bucket,
      Key: uniqueKey,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type || "application/octet-stream",
      ACL: "public-read", // Make it publicly accessible
    });

    await s3Client.send(putCommand);

    // Generate presigned URL (valid for 7 days)
    const getCommand = new GetObjectCommand({
      Bucket: storjConfig.bucket,
      Key: uniqueKey,
      ResponseContentDisposition: `inline; filename="${file.name}"`,
    });

    const presignedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return presignedUrl;
  } catch (error: any) {
    console.error("Error uploading file to Storj:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Helper function to read file as ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// Usage example:
/*
try {
  const file = document.getElementById('fileInput').files[0];
  const presignedUrl = await uploadTempTrialSharing(file);
  console.log('File uploaded successfully! URL:', presignedUrl);
  
  // You can now use this URL to access the file
  // window.open(presignedUrl); // Open in new tab
} catch (error) {
  console.error('Upload failed:', error);
}
*/
