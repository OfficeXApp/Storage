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
  console.log("Trimming from folder path:", filePath);
  const lastSlashIndex = filePath.lastIndexOf("/");
  const trimmedPath =
    lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : filePath;
  console.log("Trimmed path:", trimmedPath);
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


export function checkIsProdByURL(): boolean {
  if (typeof window !== 'undefined' && window.location) {
      return window.location.hostname === 'drive.officex.app';
  }
  console.error('Window or location is undefined.');
  return false;
}
