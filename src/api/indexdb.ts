import { v4 as uuidv4 } from "uuid";
import { Observable, Subject } from "rxjs";
import {
  DriveFileRawDestination,
  FileMetadataFragment,
  FileUUID,
} from "@officexapp/framework";

class IndexedDBStorage {
  private static instance: IndexedDBStorage;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = "officex-storage";
  private readonly STORE_NAME = "files";

  private constructor() {}

  public static getInstance(): IndexedDBStorage {
    if (!IndexedDBStorage.instance) {
      IndexedDBStorage.instance = new IndexedDBStorage();
    }
    return IndexedDBStorage.instance;
  }

  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error("INDEXEDDB_NOT_SUPPORTED"));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        if (error?.name === 'QuotaExceededError') {
          reject(new Error("STORAGE_QUOTA_EXCEEDED"));
        } else if (/^Access is denied/.test(error?.message || '')) {
          reject(new Error("PRIVATE_MODE_NOT_SUPPORTED"));
        } else {
          reject(new Error("INDEXEDDB_INITIALIZATION_FAILED"));
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.STORE_NAME, { keyPath: "id" });
      };
    });
  }

  private async generateThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 256;

      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let drawWidth, drawHeight, startX, startY;

          if (aspectRatio > 1) {
            // Landscape image
            drawHeight = 256;
            drawWidth = drawHeight * aspectRatio;
            startX = (drawWidth - 256) / 2;
            startY = 0;
          } else {
            // Portrait image
            drawWidth = 256;
            drawHeight = drawWidth / aspectRatio;
            startX = 0;
            startY = (drawHeight - 256) / 2;
          }

          ctx!.drawImage(img, -startX, -startY, drawWidth, drawHeight);
          canvas.toBlob(blob => resolve(blob!), 'image/png');
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/') || file.type === 'image/gif') {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          video.currentTime = 0;
        };
        video.onseeked = () => {
          const aspectRatio = video.videoWidth / video.videoHeight;
          let drawWidth, drawHeight, startX, startY;

          if (aspectRatio > 1) {
            // Landscape video
            drawHeight = 256;
            drawWidth = drawHeight * aspectRatio;
            startX = (drawWidth - 256) / 2;
            startY = 0;
          } else {
            // Portrait video
            drawWidth = 256;
            drawHeight = drawWidth / aspectRatio;
            startX = 0;
            startY = (drawHeight - 256) / 2;
          }

          ctx!.drawImage(video, -startX, -startY, drawWidth, drawHeight);
          canvas.toBlob(blob => resolve(blob!), 'image/png');
        };
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = URL.createObjectURL(file);
      } else {
       // For other file types, create a larger, subtle, centered file icon
       const size = 256;
       const iconSize = size * 0.85; // Make the icon larger
       const margin = (size - iconSize) / 2; // Center the icon
       const pageWidth = iconSize * 0.8;
       const pageHeight = iconSize * 0.9;
       const foldSize = iconSize * 0.2;

       // Transparent background
       ctx!.clearRect(0, 0, size, size);

       // File body
       ctx!.fillStyle = 'rgba(245, 245, 245, 0.9)'; // Slightly more opaque fill
       ctx!.strokeStyle = 'rgba(220, 220, 220, 0.9)'; // Slightly more opaque stroke
       ctx!.lineWidth = 2; // Slightly thicker line for visibility
       ctx!.beginPath();
       ctx!.moveTo(margin, margin);
       ctx!.lineTo(margin + pageWidth - foldSize, margin);
       ctx!.lineTo(margin + pageWidth, margin + foldSize);
       ctx!.lineTo(margin + pageWidth, margin + pageHeight);
       ctx!.lineTo(margin, margin + pageHeight);
       ctx!.closePath();
       ctx!.fill();
       ctx!.stroke();

       // Folder corner
       ctx!.beginPath();
       ctx!.moveTo(margin + pageWidth - foldSize, margin);
       ctx!.lineTo(margin + pageWidth - foldSize, margin + foldSize);
       ctx!.lineTo(margin + pageWidth, margin + foldSize);
       ctx!.closePath();
       ctx!.fillStyle = 'rgba(230, 230, 230, 0.9)'; // Slightly more opaque fill
       ctx!.fill();
       ctx!.stroke();

       // File extension or type
       ctx!.fillStyle = 'rgba(120, 120, 120, 0.9)'; // Slightly darker, more opaque text
       ctx!.font = 'bold 36px Arial'; // Larger font
       ctx!.textAlign = 'center';
       ctx!.textBaseline = 'middle';
       const extension = file.name.split('.').pop()?.toUpperCase() || file.type.split('/')[1]?.toUpperCase() || 'FILE';
       ctx!.fillText(extension.substring(0, 4), size / 2, size / 2 + 30); // Adjust text position

       canvas.toBlob(blob => resolve(blob!), 'image/png');
      }
    });
  }

  public uploadRawFile(file: File): Observable<{
    progress: number;
    metadataFragment: FileMetadataFragment | null;
  }> {
    const subject = new Subject<{
      progress: number;
      metadataFragment: FileMetadataFragment | null;
    }>();

    if (!this.db) {
      subject.error(new Error("INDEXEDDB_NOT_INITIALIZED"));
      return subject.asObservable();
    }

    const id = uuidv4() as FileUUID;
    const ext = file.name.split(".").pop();
    const metadata: FileMetadataFragment = {
      id,
      modifiedDate: file.lastModified ? new Date(file.lastModified) : new Date(),
      fileSize: file.size,
      rawURL: `${id}.${ext}`,
      name: file.name,
      mimeType: file.type,
    };

    this.generateThumbnail(file).then(thumbnailBlob => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put({
          id: metadata.rawURL,
          file: event.target!.result,
          metadata,
          thumbnail: thumbnailBlob,
        });

        request.onerror = () => {
          subject.error(new Error("INDEXEDDB_UPLOAD_FAILED"));
        };

        request.onsuccess = () => {
          subject.next({ progress: 100, metadataFragment: metadata });
          subject.complete();
        };
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          subject.next({ progress, metadataFragment: null });
        }
      };

      reader.onerror = () => {
        subject.error(new Error("FILE_READ_ERROR"));
      };

      reader.readAsArrayBuffer(file);
    }).catch(error => {
      subject.error(error);
    });

    return subject.asObservable();
  }

  public async getRawFile(filePath: DriveFileRawDestination): Promise<Blob> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(filePath);

      request.onerror = () => {
        reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
      };

      request.onsuccess = () => {
        if (request.result) {
          resolve(new Blob([request.result.file], { type: request.result.metadata.mimeType }));
        } else {
          reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
        }
      };
    });
  }

  public async deleteFile(filePath: DriveFileRawDestination): Promise<boolean> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(filePath);

      request.onerror = () => {
        reject(new Error("INDEXEDDB_DELETE_FAILED"));
      };

      request.onsuccess = () => {
        resolve(true);
      };
    });
  }

  public async listFiles(): Promise<FileMetadataFragment[]> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error("INDEXEDDB_LIST_FILES_FAILED"));
      };

      request.onsuccess = () => {
        const metadataFragments = request.result.map(item => item.metadata);
        resolve(metadataFragments);
      };
    });
  }

  public async clearStorage(): Promise<void> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error("INDEXEDDB_CLEAR_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async downloadFile(filePath: DriveFileRawDestination): Promise<Blob> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(filePath);

      request.onerror = () => {
        reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
      };

      request.onsuccess = () => {
        if (request.result) {
          resolve(new Blob([request.result.file], { type: request.result.metadata.mimeType }));
        } else {
          reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
        }
      };
    });
  }

  public async getThumbnail(filePath: DriveFileRawDestination): Promise<Blob> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }
  
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(filePath);
  
      request.onerror = () => {
        reject(new Error("INDEXEDDB_THUMBNAIL_NOT_FOUND"));
      };
  
      request.onsuccess = () => {
        if (request.result && request.result.thumbnail) {
          // Ensure that we're returning a Blob
          if (request.result.thumbnail instanceof Blob) {
            resolve(request.result.thumbnail);
          } else {
            // If it's not a Blob, create a new Blob from the data
            resolve(new Blob([request.result.thumbnail], { type: 'image/png' }));
          }
        } else {
          reject(new Error("INDEXEDDB_THUMBNAIL_NOT_FOUND"));
        }
      };
    });
  }
}

export default IndexedDBStorage;