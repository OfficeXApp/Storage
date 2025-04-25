// VideoPlayer.tsx
import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Button, Spin, Alert, Typography } from "antd";
import { DownloadOutlined, BugOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface VideoPlayerProps {
  url: string;
  fileName?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  fileName = "Video",
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to determine video MIME type from URL
  const getVideoType = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase() || "";

    switch (extension) {
      case "mp4":
        return "video/mp4";
      case "webm":
        return "video/webm";
      case "ogg":
        return "video/ogg";
      case "mov":
        return "video/quicktime";
      case "avi":
        return "video/x-msvideo";
      case "m3u8":
        return "application/x-mpegURL";
      case "mpd":
        return "application/dash+xml";
      default:
        // For S3/Storj URLs with no extension in the filename
        if (url.includes("X-Amz-Signature")) {
          return "video/mp4"; // Default for S3 presigned URLs
        }
        return "video/mp4";
    }
  };

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // Create a video-js element specifically as Video.js docs recommend
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");

      // Append to the ref
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      // Initialize videojs with proper options
      const player = videojs(
        videoElement,
        {
          controls: true,
          responsive: true,
          fluid: true,
          html5: {
            vhs: {
              overrideNative: true,
              withCredentials: false,
              enableLowInitialPlaylist: true,
            },
            hls: {
              overrideNative: true,
            },
            nativeAudioTracks: false,
            nativeVideoTracks: false,
          },
          techOrder: ["html5"],
          sources: [
            {
              src: url,
              type: getVideoType(url),
            },
          ],
        },
        () => {
          console.log("Player is ready");
          setIsLoading(false);
        }
      );

      // Add debugging event listeners
      player.on("waiting", () => {
        console.log("Video is waiting/buffering");
      });

      player.on("error", (error: any) => {
        console.error("Video player error:", player.error());
        setError(
          `Error code ${player?.error()?.code}: ${player?.error()?.message}`
        );
      });

      player.on("loadedmetadata", () => {
        const metadata = {
          duration: player.duration(),
          dimensions: `${player.videoWidth()}x${player.videoHeight()}`,
        };
        console.log("Video metadata loaded:", metadata);
      });

      player.on("playing", () => {
        console.log("Video is playing");
      });

      // Important: Set crossOrigin attribute for CORS requests
      const tech = player.tech({ IWillNotUseThisInPlugins: true });
      if (tech) {
        const el = tech.el();
        if (el) {
          el.setAttribute("crossOrigin", "anonymous");
        }
      }

      // Save player reference
      playerRef.current = player;
    } else {
      // If player already exists, just update the source
      const player = playerRef.current;
      player.src({
        src: url,
        type: getVideoType(url),
      });
    }
  }, [videoRef]);

  // Update player source when URL changes
  useEffect(() => {
    const player = playerRef.current;
    if (player && url) {
      setIsLoading(true);
      setError(null);

      player.src({
        src: url,
        type: getVideoType(url),
      });

      // Reset loading state when metadata is loaded
      player.one("loadedmetadata", () => {
        setIsLoading(false);
      });

      // Set error if loading fails
      player.one("error", () => {
        setIsLoading(false);
      });
    }
  }, [url]);

  // Dispose the Video.js player when component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const handleDownload = () => {
    window.open(url, "_blank");
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "800px" }}>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        >
          <Spin size="large" />
        </div>
      )}

      {error && (
        <Alert
          type="error"
          message="Video Playback Error"
          description={
            <div>
              <p>{error}</p>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                Download Video
              </Button>
            </div>
          }
          style={{ marginBottom: "15px" }}
        />
      )}

      <div data-vjs-player style={{ width: "100%" }}>
        <div ref={videoRef}></div>
      </div>
    </div>
  );
};

export default VideoPlayer;
