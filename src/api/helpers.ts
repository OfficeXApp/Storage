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

export function checkShouldAllowWorldComputer(): boolean {
  if (typeof window !== "undefined" && window.location) {
    // To enable showing, add `?allow_world_computer=1` to the URL
    // or be in dev env
    const alreadyAllowed = localStorage.getItem("allow_world_computer");
    const showAllow =
      window.location.search.includes("allow_world_computer=1") ||
      alreadyAllowed; // || window.location.origin === "http://localhost:5173";
    // console.log(`Should allow world computer: ${showAllow}`);
    if (showAllow) {
      localStorage.setItem("allow_world_computer", "1");
    }
    return Boolean(showAllow);
  }
  console.error("Window or location is undefined.");
  return false;
}

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
