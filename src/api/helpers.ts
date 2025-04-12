import { UserID } from "@officexapp/types";

export function truncateMiddlePath(
  path: string,
  keepFront: number,
  keepBack: number
): string {
  const totalKeepLength = keepFront + keepBack;

  if (path.length <= totalKeepLength) {
    return path;
  }

  const separator = "...";

  const start = path.substring(0, keepFront);
  const end = path.substring(path.length - keepBack);

  return `${start}${separator}${end}`;
}

export function trimToFolderPath(filePath: string) {
  const lastSlashIndex = filePath.lastIndexOf("/");
  const trimmedPath =
    lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : filePath;

  return trimmedPath;
}

export const getFileType = (
  filename: string
): "image" | "video" | "audio" | "pdf" | "other" => {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
      return "image";
    case "mp4":
    case "webm":
    case "ogg":
    case "mov":
    case "avi":
      return "video";
    case "mp3":
    case "wav":
    case "flac":
    case "aac":
      return "audio";
    case "pdf":
      return "pdf";
    default:
      return "other";
  }
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getLastOnlineStatus = (lastOnlineMs: number) => {
  if (!lastOnlineMs) {
    return {
      status: "default",
      text: "Not Seen Yet",
    };
  }

  const now = Date.now();
  const diffMs = now - lastOnlineMs;
  const diffHours = diffMs / (1000 * 60 * 60);

  // Active in last 3 hours - show success
  if (diffHours <= 3) {
    return {
      status: "success",
      text: `Last online ${formatTimeAgo(lastOnlineMs)}`,
    };
  }

  // Active in last 24 hours - show processing
  if (diffHours <= 24) {
    return {
      status: "processing",
      text: `Last online ${formatTimeAgo(lastOnlineMs)}`,
    };
  }

  // More than 24 hours - show default status with date
  return {
    status: "default",
    text: formatDate(lastOnlineMs),
  };
};

export const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) {
    return "just now";
  }

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  return formatDate(timestamp);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatUserString = (nickname: string, userID: UserID) => {
  const userstring = `${nickname.replace(" ", "_")}@${userID}`;
  navigator.clipboard.writeText(userstring);
};

// Encode: Direct URL-safe Base64
export function urlSafeBase64Encode(str: string) {
  // Handle Unicode characters
  const utf8Bytes = new TextEncoder().encode(str);
  const binaryString = Array.from(utf8Bytes)
    .map((byte) => String.fromCharCode(byte))
    .join("");

  // Standard Base64 encoding
  const base64 = btoa(binaryString);

  // Make URL-safe by replacing characters
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Decode: URL-safe Base64 to original string
export function urlSafeBase64Decode(str: string) {
  // Convert back to standard Base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }

  // Decode Base64 to binary
  const binaryString = atob(base64);

  // Convert binary to UTF-8
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Decode UTF-8
  return new TextDecoder().decode(bytes);
}

export function areArraysEqual(array1: any[], array2: any[]) {
  if (array1.length !== array2.length) return false;

  // Sort both arrays to ensure consistent comparison
  const sorted1 = [...array1].sort();
  const sorted2 = [...array2].sort();

  return sorted1.every((value, index) => value === sorted2[index]);
}

export const getNextUtcMidnight = () => {
  // Get current date in UTC
  const now = new Date();

  // Create a new Date object for the next day at midnight UTC
  const nextMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1, // Add 1 day to get tomorrow
      0, // Hour: 00
      0, // Minute: 00
      0, // Second: 00
      0 // Millisecond: 000
    )
  );

  // Return the Unix timestamp in milliseconds
  return nextMidnight.getTime();
};

export const wrapAuthStringOrHeader = (
  _url: string,
  _headers: HeadersInit,
  auth: string
) => {
  let url = _url;
  let headers = _headers;
  if (_url.includes("icp0.io")) {
    // if no question mark already in url, then add ?auth=, otherwise &auth=
    if (_url.includes("?")) {
      url = `${_url}&auth=${auth}`;
    } else {
      url = `${_url}?auth=${auth}`;
    }
    headers = _headers;
    return { url, headers };
  } else {
    headers = {
      ..._headers,
      Authorization: `Bearer ${auth}`,
    };
    return { url, headers };
  }
};

export const pastLastCheckedCacheLimit = (lastChecked: number) => {
  if (lastChecked === 0) return false;
  const cacheLimit = 1000 * 60 * 2;
  return lastChecked + cacheLimit < Date.now();
};
