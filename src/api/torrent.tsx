import { useState, useEffect, useCallback } from "react";
// @ts-ignore
import WebTorrent, { Torrent } from "webtorrent/dist/webtorrent.min.js";

let client: WebTorrent.Instance | null = null;
let refCount = 0;

interface TorrentInfo {
  infoHash: string;
  progress: number;
  magnetURI: string;
  files?: string[];
}

const useTorrent = () => {
  const [isReady, setIsReady] = useState(false);
  const [torrentInfo, setTorrentInfo] = useState<TorrentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      client = new WebTorrent();
      client.on("error", (err: Error) => {
        console.error("Client error:", err);
        setError(`Client error: ${err.message}`);
      });
      setIsReady(true);
    }

    refCount++;

    return () => {
      refCount--;
      if (refCount === 0 && client) {
        client.destroy();
        client = null;
        setIsReady(false);
      }
    };
  }, []);

  const seedFile = useCallback(
    (files: File | File[] | FileList) => {
      if (!isReady || !client) {
        setError("WebTorrent client is not ready");
        return;
      }

      setError(null);
      setTorrentInfo(null);

      try {
        const fileArray =
          files instanceof FileList
            ? Array.from(files)
            : Array.isArray(files)
              ? files
              : [files];

        client.seed(
          fileArray,
          {
            announceList: [
              ["wss://tracker.openwebtorrent.com"],
              ["wss://tracker.btorrent.xyz"],
              ["wss://tracker.fastcast.nz"],
            ],
          },
          (torrent: Torrent) => {
            console.log("Seeding started:", torrent);
            setTorrentInfo({
              infoHash: torrent.infoHash,
              progress: torrent.progress,
              magnetURI: torrent.magnetURI,
              files: torrent.files.map((f: File) => f.name),
            });

            torrent.on("upload", () => {
              setTorrentInfo((prev) =>
                prev
                  ? {
                      ...prev,
                      progress: torrent.progress,
                    }
                  : null
              );
            });

            torrent.on("error", (err: Error) => {
              console.error("Seed error:", err);
              setError(`Seed error: ${err.message}`);
            });
          }
        );
      } catch (err) {
        console.error("Seed error:", err);
        setError(err instanceof Error ? err.message : "Failed to seed file");
      }
    },
    [isReady]
  );

  const downloadTorrent = useCallback(
    (infoHash: string) => {
      if (!isReady || !client) {
        setError("WebTorrent client is not ready");
        return;
      }

      setError(null);
      setTorrentInfo(null);

      try {
        // Create a more complete magnet URI with trackers
        const trackers = [
          "wss://tracker.openwebtorrent.com",
          "wss://tracker.btorrent.xyz",
          "wss://tracker.fastcast.nz",
        ];

        const magnetURI = `magnet:?xt=urn:btih:${infoHash}&tr=${encodeURIComponent(trackers[0])}&tr=${encodeURIComponent(trackers[1])}&tr=${encodeURIComponent(trackers[2])}`;

        console.log("Downloading torrent with magnetURI:", magnetURI);

        client.add(magnetURI, { announce: trackers }, (torrent: Torrent) => {
          console.log("Download started:", torrent);

          setTorrentInfo({
            infoHash: torrent.infoHash,
            progress: torrent.progress,
            magnetURI: torrent.magnetURI,
            files: torrent.files.map((f: File) => f.name),
          });

          torrent.on("download", () => {
            console.log("Downloaded:", torrent.downloaded);
            setTorrentInfo((prev) =>
              prev
                ? {
                    ...prev,
                    progress: torrent.progress,
                  }
                : null
            );
          });

          torrent.on("done", () => {
            console.log("Download finished");
            torrent.files.forEach((file: any) => {
              // Stream the file to get actual content
              const stream = file.createReadStream();
              const chunks: Uint8Array[] = [];

              stream.on("data", (chunk: Uint8Array) => {
                console.log("Received chunk:", chunk.length, "bytes");
                chunks.push(chunk);
              });

              stream.on("end", () => {
                console.log("Stream ended, total chunks:", chunks.length);
                // Combine all chunks
                const totalLength = chunks.reduce(
                  (acc, chunk) => acc + chunk.length,
                  0
                );
                const fullBuffer = new Uint8Array(totalLength);
                let offset = 0;
                chunks.forEach((chunk) => {
                  fullBuffer.set(chunk, offset);
                  offset += chunk.length;
                });

                console.log("Creating blob of size:", fullBuffer.length);
                const blob = new Blob([fullBuffer], {
                  type: "application/octet-stream",
                });
                console.log("Blob created, size:", blob.size);

                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              });

              stream.on("error", (err: any) => {
                console.error("Stream error:", err);
                setError(`Stream error: ${err.message}`);
              });
            });
          });

          torrent.on("error", (err: Error) => {
            console.error("Download error:", err);
            setError(`Download error: ${err.message}`);
          });
        });
      } catch (err) {
        console.error("Download error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to download torrent"
        );
      }
    },
    [isReady]
  );

  return {
    isReady,
    torrentInfo,
    error,
    seedFile,
    downloadTorrent,
  };
};

export default useTorrent;
