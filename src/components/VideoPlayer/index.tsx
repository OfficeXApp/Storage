// VideoPlayer.tsx
import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Button, Spin, Alert, Typography } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";

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
  const [seekingState, setSeekingState] = useState({
    isSeeking: false,
    seekRetries: 0,
  });

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

  // Function to reload video at current time after seeking error
  const handleSeekingError = (player: any) => {
    if (seekingState.seekRetries < 3) {
      const currentTime = player.currentTime();

      // Reset the source with appropriate cache busting for network errors
      const cacheBuster = `?cb=${Date.now()}`;
      const urlWithCacheBuster = url.includes("?")
        ? `${url}&cb=${Date.now()}`
        : `${url}${cacheBuster}`;

      console.log(
        `Retrying after seeking error (attempt ${seekingState.seekRetries + 1})...`
      );

      player.src({
        src: urlWithCacheBuster,
        type: getVideoType(url),
      });

      player.one("loadedmetadata", () => {
        // Restore playback position after reload
        if (currentTime > 0) {
          player.currentTime(currentTime);
        }
        player
          .play()
          .catch((e: any) => console.warn("Auto-play prevented:", e));
        setError(null);
      });

      setSeekingState({
        isSeeking: false,
        seekRetries: seekingState.seekRetries + 1,
      });
    }
  };

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // Create a video-js element specifically as Video.js docs recommend
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");

      // Set critical attributes for better seeking behavior
      videoElement.setAttribute("preload", "auto");

      // Append to the ref
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      // Initialize videojs with improved options for seeking
      const player = videojs(
        videoElement,
        {
          controls: true,
          responsive: true,
          fluid: true,
          preload: "auto",
          html5: {
            vhs: {
              overrideNative: !videojs.browser.IS_SAFARI, // Let Safari use native HLS
              withCredentials: false,
              enableLowInitialPlaylist: false, // Disable low quality initial playlist
              limitRenditionByPlayerDimensions: false, // Don't limit by player size
              handleManifestRedirects: true, // Handle redirects in manifest
              bandwidth: 5000000, // Set higher initial bandwidth estimate (5Mbps)
            },
            hls: {
              overrideNative: !videojs.browser.IS_SAFARI, // Let Safari use native HLS
            },
            nativeAudioTracks: videojs.browser.IS_SAFARI,
            nativeVideoTracks: videojs.browser.IS_SAFARI,
          },
          liveui: false,
          playbackRates: [0.5, 1, 1.5, 2],
          inactivityTimeout: 2000,
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

      // Add custom retry behavior for errors
      let lastErrorTime = 0;
      const errorInterval = 5000; // 5 seconds between retries

      // Add custom error handling to mimic reloadSourceOnError plugin
      player.on("error", () => {
        const now = Date.now();
        const errorObj = (player.error() || {}) as any;

        // Only reload if enough time has passed since last error
        if (now - lastErrorTime > errorInterval) {
          lastErrorTime = now;

          // For network errors, we can try reloading with cache buster
          if (errorObj.code === 2) {
            const currentSrc = player.currentSrc();
            const currentType = getVideoType(currentSrc);
            const cacheBuster = `${currentSrc.includes("?") ? "&" : "?"}cb=${Date.now()}`;

            console.log("Reloading source with cache buster after error");

            setTimeout(() => {
              player.src({
                src: currentSrc + cacheBuster,
                type: currentType,
              });
              player.load();
            }, 1000); // Small delay before reloading
          }
        }
      });

      // Add seeking event listeners
      player.on("seeking", () => {
        console.log("Video seeking started");
        setSeekingState((prev) => ({ ...prev, isSeeking: true }));
      });

      player.on("seeked", () => {
        console.log("Video seeking completed");
        setSeekingState({ isSeeking: false, seekRetries: 0 });
      });

      // Add debugging event listeners
      player.on("waiting", () => {
        console.log("Video is waiting/buffering");
      });

      player.on("error", (error: any) => {
        console.error("Video player error:", player.error());
        const errorObj = (player.error() || {}) as any;
        const errorMessage = `Error code ${errorObj.code}: ${errorObj.message}`;

        setError(errorMessage);

        // Special handling for network errors during seeking
        if (errorObj.code === 2 && seekingState.isSeeking) {
          console.log("Network error during seeking - attempting recovery");
          handleSeekingError(player);
        }
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
        setError(null);
      });

      // Important: Set crossOrigin attribute for CORS requests with improved settings
      const tech = player.tech({ IWillNotUseThisInPlugins: true });
      if (tech) {
        const el = tech.el();
        if (el) {
          el.setAttribute("crossOrigin", "anonymous");
        }
      }

      // Set timeout for network operations
      //   player.setTimeout(() => {
      //     if (isLoading) {
      //       setIsLoading(false);
      //       setError("Timeout loading video. Please try again.");
      //     }
      //   }, 30000);

      // Save player reference
      playerRef.current = player;
    } else {
      // If player already exists, just update the source
      resetPlayer(url);
    }
  }, [videoRef]);

  // Function to reset player with new URL
  const resetPlayer = (newUrl: string) => {
    const player = playerRef.current;
    if (player && newUrl) {
      setIsLoading(true);
      setError(null);
      setSeekingState({ isSeeking: false, seekRetries: 0 });

      player.src({
        src: newUrl,
        type: getVideoType(newUrl),
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
  };

  // Update player source when URL changes
  useEffect(() => {
    resetPlayer(url);
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

  const handleRetry = () => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.currentTime();
      resetPlayer(url);

      // Restore position after retry if needed
      if (currentTime > 0) {
        player.one("loadedmetadata", () => {
          player.currentTime(currentTime);
          player
            .play()
            .catch((e: any) => console.warn("Auto-play prevented:", e));
        });
      }
    }
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
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRetry}
                >
                  Retry
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                  Download Video
                </Button>
              </div>
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
