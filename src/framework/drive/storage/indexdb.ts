// indexdb.ts

import { v4 as uuidv4 } from "uuid";
import { Observable, Subject } from "rxjs";
import {
  DriveFileRawDestinationIndexDBFileID,
  FileMetadataFragment,
  FileUUID,
  HashtableTypeEnum,
} from "../types";
import { FuseIndex } from "fuse.js";

let indexedDB: IDBFactory;
let LocalStorage: any;

class IndexedDBStorage {
  private static instance: IndexedDBStorage;
  private db: IDBDatabase | null = null;
  private localStorage: typeof window.localStorage | any;
  private readonly DB_NAME = "officex-storage";
  private readonly FILES_STORE_NAME = "files";
  private readonly HASHTABLES_STORE_NAME = "hashtables";
  private isNode: boolean;

  private constructor() {
    this.isNode = typeof window === "undefined";
  }

  public static getInstance(): IndexedDBStorage {
    if (!IndexedDBStorage.instance) {
      IndexedDBStorage.instance = new IndexedDBStorage();
    }
    return IndexedDBStorage.instance;
  }

  public async initialize(): Promise<void> {
    if (this.db && this.localStorage) {
      console.log("IndexedDBStorage already initialized");
      return Promise.resolve();
    }
    if (typeof window !== "undefined" && window.indexedDB) {
      // Browser environment
      indexedDB = window.indexedDB;
      IDBKeyRange = window.IDBKeyRange;
      this.localStorage = window.localStorage;
    } else {
      // Node.js environment
      const { LocalStorage: _LocalStorage } = await import("node-localstorage");
      LocalStorage = _LocalStorage;
      this.localStorage = new LocalStorage("./scratch");
      const fakeIndexedDB = await import("fake-indexeddb");
      const FDBKeyRange = fakeIndexedDB.IDBKeyRange;
      indexedDB = fakeIndexedDB.default;
      IDBKeyRange = FDBKeyRange;
    }
    return new Promise((resolve, reject) => {
      if (!indexedDB) {
        reject(new Error("INDEXEDDB_NOT_SUPPORTED"));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        if (error?.name === "QuotaExceededError") {
          reject(new Error("STORAGE_QUOTA_EXCEEDED"));
        } else if (/^Access is denied/.test(error?.message || "")) {
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
        if (!db.objectStoreNames.contains(this.FILES_STORE_NAME)) {
          db.createObjectStore(this.FILES_STORE_NAME, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(this.HASHTABLES_STORE_NAME)) {
          db.createObjectStore(this.HASHTABLES_STORE_NAME, { keyPath: "type" });
        }
      };
    });
  }

  private async generateThumbnail(file: File): Promise<Blob> {
    if (this.isNode) {
      // Placeholder for Node.js thumbnail generation
      return new Blob([Buffer.alloc(256)], { type: "image/png" });
    } else {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 256;
        canvas.height = 256;

        if (file.type.startsWith("image/")) {
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
            canvas.toBlob((blob) => resolve(blob!), "image/png");
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = URL.createObjectURL(file);
        } else if (
          file.type.startsWith("video/") ||
          file.type === "image/gif"
        ) {
          const video = document.createElement("video");
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
            canvas.toBlob((blob) => resolve(blob!), "image/png");
          };
          video.onerror = () => reject(new Error("Failed to load video"));
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
          ctx!.fillStyle = "rgba(245, 245, 245, 0.9)"; // Slightly more opaque fill
          ctx!.strokeStyle = "rgba(220, 220, 220, 0.9)"; // Slightly more opaque stroke
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
          ctx!.fillStyle = "rgba(230, 230, 230, 0.9)"; // Slightly more opaque fill
          ctx!.fill();
          ctx!.stroke();

          // File extension or type
          ctx!.fillStyle = "rgba(120, 120, 120, 0.9)"; // Slightly darker, more opaque text
          ctx!.font = "bold 36px Arial"; // Larger font
          ctx!.textAlign = "center";
          ctx!.textBaseline = "middle";
          const extension =
            file.name.split(".").pop()?.toUpperCase() ||
            file.type.split("/")[1]?.toUpperCase() ||
            "FILE";
          ctx!.fillText(extension.substring(0, 4), size / 2, size / 2 + 30); // Adjust text position

          canvas.toBlob((blob) => resolve(blob!), "image/png");
        }
      });
    }
  }

  public uploadRawFile(
    file: File,
    presetID?: FileUUID
  ): Observable<{
    progress: number;
    metadataFragment: FileMetadataFragment;
  }> {
    const subject = new Subject<{
      progress: number;
      metadataFragment: FileMetadataFragment;
    }>();

    if (!this.db) {
      subject.error(new Error("INDEXEDDB_NOT_INITIALIZED"));
      return subject.asObservable();
    }

    const id = presetID ? presetID : (uuidv4() as FileUUID);
    const ext = file.name.split(".").pop();
    const metadata: FileMetadataFragment = {
      id,
      fileSize: file.size,
      rawURL: `${id}.${ext}` as DriveFileRawDestinationIndexDBFileID,
      name: file.name,
      mimeType: file.type,
    };

    const chunkSize = 1024 * 1024; // 1MB chunks
    let offset = 0;
    let chunkIndex = 0;

    const readAndStoreChunk = () => {
      const slice = file.slice(offset, offset + chunkSize);
      const reader = new FileReader();

      reader.onload = (e) => {
        const chunk = e.target!.result as ArrayBuffer;
        const transaction = this.db!.transaction(
          [this.FILES_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(this.FILES_STORE_NAME);

        const request = store.put({
          id: `${metadata.rawURL}_chunk_${chunkIndex}`,
          chunk: new Uint8Array(chunk),
          offset: offset,
        });

        request.onerror = () => {
          subject.error(new Error("INDEXEDDB_UPLOAD_FAILED"));
        };

        request.onsuccess = () => {
          offset += chunk.byteLength;
          chunkIndex++;
          const progress = Math.min(
            100,
            Math.round((offset / file.size) * 100)
          );
          subject.next({ progress, metadataFragment: metadata });

          if (offset < file.size) {
            readAndStoreChunk();
          } else {
            // Store file metadata
            store.put({
              id: metadata.rawURL,
              totalChunks: chunkIndex,
              fileSize: file.size,
              mimeType: file.type,
            });

            // File upload complete, now generate and save thumbnail
            this.generateThumbnail(file)
              .then((thumbnailBlob) => {
                const thumbnailTransaction = this.db!.transaction(
                  [this.FILES_STORE_NAME],
                  "readwrite"
                );
                const thumbnailStore = thumbnailTransaction.objectStore(
                  this.FILES_STORE_NAME
                );
                thumbnailStore.put({
                  id: `${metadata.rawURL}_thumb`,
                  thumbnail: thumbnailBlob,
                });

                subject.next({ progress: 100, metadataFragment: metadata });
                subject.complete();
              })
              .catch((error) => {
                console.error("Error generating thumbnail:", error);
                subject.next({ progress: 100, metadataFragment: metadata });
                subject.complete();
              });
          }
        };
      };

      reader.onerror = () => {
        subject.error(new Error("FILE_READ_ERROR"));
      };

      reader.readAsArrayBuffer(slice);
    };

    readAndStoreChunk();

    return subject.asObservable();
  }

  public async getRawFile(
    filePath: DriveFileRawDestinationIndexDBFileID
  ): Promise<Blob> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.FILES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.FILES_STORE_NAME);

      const metadataRequest = store.get(filePath);

      metadataRequest.onerror = () => {
        reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
      };

      metadataRequest.onsuccess = () => {
        if (!metadataRequest.result) {
          reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
          return;
        }

        const { totalChunks, mimeType } = metadataRequest.result;
        const chunks: Uint8Array[] = [];

        const getChunk = (index: number) => {
          const chunkRequest = store.get(`${filePath}_chunk_${index}`);

          chunkRequest.onerror = () => {
            reject(new Error("INDEXEDDB_CHUNK_NOT_FOUND"));
          };

          chunkRequest.onsuccess = () => {
            if (chunkRequest.result) {
              chunks.push(chunkRequest.result.chunk);
            }

            if (index < totalChunks - 1) {
              getChunk(index + 1);
            } else {
              const blob = new Blob(chunks, { type: mimeType });
              resolve(blob);
            }
          };
        };

        getChunk(0);
      };
    });
  }

  public getFileStream(
    filePath: DriveFileRawDestinationIndexDBFileID
  ): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start: async (controller) => {
        if (!this.db) {
          throw new Error("INDEXEDDB_NOT_INITIALIZED");
        }

        const transaction = this.db.transaction(
          [this.FILES_STORE_NAME],
          "readonly"
        );
        const store = transaction.objectStore(this.FILES_STORE_NAME);

        const metadata = await new Promise((resolve, reject) => {
          const request = store.get(filePath);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
        });

        if (!metadata) {
          throw new Error("INDEXEDDB_FILE_NOT_FOUND");
        }

        const { totalChunks } = metadata as any;

        for (let i = 0; i < totalChunks; i++) {
          const chunk = await new Promise<Uint8Array>((resolve, reject) => {
            const request = store.get(`${filePath}_chunk_${i}`);
            request.onsuccess = () => resolve(request.result.chunk);
            request.onerror = () =>
              reject(new Error("INDEXEDDB_CHUNK_NOT_FOUND"));
          });

          controller.enqueue(chunk);
        }

        controller.close();
      },
    });
  }

  public async deleteFile(
    filePath: DriveFileRawDestinationIndexDBFileID
  ): Promise<boolean> {
    if (!this.db) {
      throw new Error("INDEXEDDB_NOT_INITIALIZED");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.FILES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.FILES_STORE_NAME);

      // First, get the file metadata to know how many chunks to delete
      const metadataRequest = store.get(filePath);

      metadataRequest.onerror = () => {
        reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
      };

      metadataRequest.onsuccess = () => {
        if (!metadataRequest.result) {
          reject(new Error("INDEXEDDB_FILE_NOT_FOUND"));
          return;
        }

        const { totalChunks } = metadataRequest.result;

        // Delete file metadata
        store.delete(filePath);

        // Delete all chunks
        for (let i = 0; i < totalChunks; i++) {
          store.delete(`${filePath}_chunk_${i}`);
        }

        // Delete thumbnail
        store.delete(`${filePath}_thumb`);

        transaction.oncomplete = () => {
          resolve(true);
        };

        transaction.onerror = () => {
          reject(new Error("INDEXEDDB_DELETE_FAILED"));
        };
      };
    });
  }

  public async listFiles(): Promise<FileMetadataFragment[]> {
    if (this.isNode) {
      const files: FileMetadataFragment[] = [];
      for (let i = 0; i < this.localStorage.length; i++) {
        const key = this.localStorage.key(i);
        if (key && !key.endsWith("_file") && !key.endsWith("_thumb")) {
          const item = this.localStorage.getItem(key);
          if (item) {
            files.push(JSON.parse(item));
          }
        }
      }
      return files;
    } else {
      if (!this.db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(
          [this.FILES_STORE_NAME],
          "readonly"
        );
        const store = transaction.objectStore(this.FILES_STORE_NAME);
        const request = store.getAll();

        request.onerror = () => {
          reject(new Error("INDEXEDDB_LIST_FILES_FAILED"));
        };

        request.onsuccess = () => {
          const metadataFragments = request.result.map((item) => item.metadata);
          resolve(metadataFragments);
        };
      });
    }
  }

  public async clearStorage(): Promise<void> {
    if (this.isNode) {
      this.localStorage.clear();
      return Promise.resolve();
    } else {
      if (!this.db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(
          [this.FILES_STORE_NAME],
          "readwrite"
        );
        const store = transaction.objectStore(this.FILES_STORE_NAME);
        const request = store.clear();

        request.onerror = () => {
          reject(new Error("INDEXEDDB_CLEAR_FAILED"));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    }
  }

  public async getThumbnail(
    filePath: DriveFileRawDestinationIndexDBFileID
  ): Promise<Blob> {
    if (this.isNode) {
      const thumbnailData = this.localStorage.getItem(`${filePath}_thumb`);
      if (!thumbnailData) {
        throw new Error("INDEXEDDB_THUMBNAIL_NOT_FOUND");
      }
      return new Blob([Buffer.from(thumbnailData)], { type: "image/png" });
    } else {
      if (!this.db) {
        throw new Error("INDEXEDDB_NOT_INITIALIZED");
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(
          [this.FILES_STORE_NAME],
          "readonly"
        );
        const store = transaction.objectStore(this.FILES_STORE_NAME);
        const request = store.get(`${filePath}_thumb`);

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
              resolve(
                new Blob([request.result.thumbnail], { type: "image/png" })
              );
            }
          } else {
            reject(new Error("INDEXEDDB_THUMBNAIL_NOT_FOUND"));
          }
        };
      });
    }
  }

  public async saveHashtable<T>(
    type: HashtableTypeEnum,
    data: T
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("INDEXEDDB_NOT_INITIALIZED"));
        return;
      }

      const transaction = this.db.transaction(
        [this.HASHTABLES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.HASHTABLES_STORE_NAME);

      const request = store.put({ type, data });

      request.onerror = () => {
        reject(new Error("INDEXEDDB_SAVE_HASHTABLE_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async getHashtable<T>(type: HashtableTypeEnum): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("INDEXEDDB_NOT_INITIALIZED"));
        return;
      }

      const transaction = this.db.transaction(
        [this.HASHTABLES_STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(this.HASHTABLES_STORE_NAME);

      const request = store.get(type);

      request.onerror = () => {
        reject(new Error("INDEXEDDB_GET_HASHTABLE_FAILED"));
      };

      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
    });
  }

  // Save Fuse.js index to IndexedDB
  public async saveFuseIndex(fuseIndex: FuseIndex<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("INDEXEDDB_NOT_INITIALIZED"));
        return;
      }

      const transaction = this.db.transaction(
        [this.HASHTABLES_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(this.HASHTABLES_STORE_NAME);

      const serializedIndex = JSON.stringify(fuseIndex.toJSON());
      const request = store.put({
        type: "FuseFuzzySearch",
        data: serializedIndex,
      });

      request.onerror = () => {
        reject(new Error("INDEXEDDB_SAVE_FUSE_INDEX_FAILED"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }
}

export default IndexedDBStorage;
