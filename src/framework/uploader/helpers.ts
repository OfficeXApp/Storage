// src/framework/uploader/helpers.ts

/**
 * Get MIME type for a file based on extension
 * @param file File to get MIME type for
 * @returns MIME type string
 */
export function getMimeType(file: File | Blob): string {
  // Return existing type if available
  if (file.type) {
    return file.type;
  }

  // If it's a File object, get the extension from the name
  let extension = "";
  if ("name" in file && file.name) {
    extension = file.name.split(".").pop()?.toLowerCase() || "";
  }

  if (!extension) {
    return "application/octet-stream"; // Default binary type
  }

  // Common MIME types by extension
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",

    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    rtf: "application/rtf",
    md: "text/markdown",

    // Web
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    xml: "application/xml",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    m4a: "audio/mp4",

    // Video
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",

    // Archives
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",

    // Other
    csv: "text/csv",
    ics: "text/calendar",
    vcf: "text/vcard",
  };

  return mimeTypes[extension] || "application/octet-stream";
}
