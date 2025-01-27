import { useCallback, useState } from "react";
import useTorrent from "../../api/torrent";

const TorrentUploader = () => {
  const { isReady, torrentInfo, error, seedFile, downloadTorrent } =
    useTorrent();
  const [infoHash, setInfoHash] = useState("");

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        seedFile(files);
      }
    },
    [seedFile]
  );

  const handleDownload = useCallback(() => {
    if (infoHash.trim()) {
      downloadTorrent(infoHash.trim());
    }
  }, [infoHash, downloadTorrent]);

  return (
    <div>
      <h2>Torrent Seeder</h2>
      {!isReady && <p>Initializing WebTorrent client...</p>}

      <div style={{ marginBottom: "2rem" }}>
        <h3>Seed File</h3>
        <input type="file" onChange={handleFileSelect} disabled={!isReady} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3>Download File</h3>
        <input
          type="text"
          value={infoHash}
          onChange={(e) => setInfoHash(e.target.value)}
          placeholder="Enter Info Hash"
          disabled={!isReady}
          style={{ marginRight: "1rem" }}
        />
        <button onClick={handleDownload} disabled={!isReady}>
          Download
        </button>
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {torrentInfo && (
        <div>
          <h3>Torrent Info:</h3>
          <p>Info Hash: {torrentInfo.infoHash}</p>
          <p>Magnet URI: {torrentInfo.magnetURI}</p>
          <p>Progress: {(torrentInfo.progress * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

export default TorrentUploader;
