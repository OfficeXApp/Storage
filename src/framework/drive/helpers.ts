import { UploadableFile } from "./storage/storj-web3";
import { StorageLocationEnum, UploadFolderPath } from "./types";

export const sayHello = (name: string) => {
  console.log(`Hello ${name}!`);
};

export const sanitizeFilePath = (filePath: string): string => {
  // Replace colons with semicolons
  let sanitized = filePath.replace(/:/g, ";");

  // Replace multiple consecutive slashes with a single slash
  sanitized = sanitized.replace(/\/+/g, "/");

  // Remove leading and trailing slashes
  sanitized = sanitized.replace(/^\/+|\/+$/g, "");

  // Additional sanitization can be added here
  // For example, removing or replacing other potentially dangerous characters

  return sanitized;
};

export const getUploadFolderPath = (): {
  uploadFolderPath: UploadFolderPath;
  storageLocation: StorageLocationEnum;
} => {
  const urlPath = decodeURIComponent(window.location.pathname); // Decode the URL
  const pathParts = urlPath.split("/"); // Split the path into parts

  // Determine the storage location; default to BrowserCache if not found
  const storageLocation =
    (pathParts[2] as StorageLocationEnum) || StorageLocationEnum.BrowserCache;

  // Determine the upload folder path, accounting for cases where the path may be shorter than expected
  const uploadFolderPath =
    pathParts.length > 3 ? pathParts.slice(3).join("/") : "";

  return { uploadFolderPath, storageLocation };
};

export const getTotalSize = (
  body: File | Uint8Array | Blob | string | ReadableStream
): number => {
  if (body instanceof File || body instanceof Blob) {
    return body.size;
  } else if (typeof body === "string") {
    return new Blob([body]).size;
  } else if (body instanceof Uint8Array) {
    return body.byteLength;
  } else if (body instanceof ReadableStream) {
    // Note: We can't reliably get the size of a ReadableStream
    return 0;
  }
  return 0;
};

export function getMimeType(body: UploadableFile): string {
  if (body instanceof File) {
    return body.type || "application/octet-stream";
  } else if (typeof body === "string") {
    return "text/plain";
  } else {
    return "application/octet-stream";
  }
}

export function getFileExtension(filePath: string): string {
  const fileName = filePath.split("/").pop(); // Get the last part after the final '/'
  if (fileName && fileName.includes(".")) {
    const extension = `.${fileName.split(".").pop()}`; // Add the dot before the extension
    return extension;
  }
  return ""; // Return empty string if no extension
}

export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    // Text
    txt: "text/plain",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    csv: "text/csv",
    xml: "text/xml",

    // Scripts
    js: "text/javascript",
    json: "application/json",

    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    tiff: "image/tiff",
    ico: "image/x-icon",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    m4a: "audio/mp4",

    // Video
    mp4: "video/mp4",
    webm: "video/webm",
    ogv: "video/ogg",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    mkv: "video/x-matroska",
    "3gp": "video/3gpp",
    ts: "video/mp2t",
    m4v: "video/x-m4v",
    mpg: "video/mpeg",
    mpeg: "video/mpeg",
    mts: "video/mts",
    vob: "video/vob",
    divx: "video/divx",
    rmvb: "application/vnd.rn-realmedia-vbr",

    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",

    // Other
    swf: "application/x-shockwave-flash",
    rtf: "application/rtf",
    eot: "application/vnd.ms-fontobject",
    ttf: "font/ttf",
    woff: "font/woff",
    woff2: "font/woff2",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}
