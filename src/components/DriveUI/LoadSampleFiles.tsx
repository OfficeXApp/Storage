import {
  DriveFullFilePath,
  Identity,
  StorageLocationEnum,
  useDrive,
  UserID,
} from "@officexapp/framework";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const { CONSTANTS, ONBOARDING_CHECKPOINTS } = Identity;

const LoadSampleFiles = () => {
  const navigate = useNavigate();
  const { uploadFilesFolders, createFolder, fetchFilesAtFolderPath } =
    useDrive();

  useEffect(() => {
    setTimeout(() => {
      uploadDefaultFiles();
    }, 500);
  }, []);
  const uploadDefaultFiles = async () => {
    const onboardingCheckpoint = localStorage.getItem(
      CONSTANTS.LOCAL_STORAGE_ONBOARDING_CHECKPOINT
    );
    console.log("Onboarding checkpoint:", onboardingCheckpoint);
    if (onboardingCheckpoint === ONBOARDING_CHECKPOINTS.FRESH_USER) {
      console.log("Uploading default files...");
      const isLocalhost = window.location.hostname === "localhost";
      const filesToUpload = isLocalhost
        ? ["Whitepaper.pdf", "Logo.jpg"]
        : [
            "https://firebasestorage.googleapis.com/v0/b/arbitrage-bot-ea10c.appspot.com/o/officex%2Fwhitepaper.pdf?alt=media&token=9c239cc8-b1c5-47f7-a00b-e4d09b876a34",
            "https://firebasestorage.googleapis.com/v0/b/arbitrage-bot-ea10c.appspot.com/o/officex%2Flogo.jpg?alt=media&token=223e42d5-3cdf-4be6-ba9b-32e89ab0faa5",
          ];
      const fileObjects: File[] = [];

      for (const fileName of filesToUpload) {
        try {
          const response = await fetch(fileName);

          const blob = await response.blob();
          const file = new File(
            [blob],
            fileName
              .split(isLocalhost ? "/" : "%2F")
              .pop()
              ?.split("?")[0] || "",
            {
              type: blob.type,
            }
          );
          fileObjects.push(file);
        } catch (error) {
          console.error(`Error loading file ${fileName}:`, error);
        }
      }

      if (fileObjects.length > 0) {
        uploadFilesFolders(
          fileObjects,
          "",
          StorageLocationEnum.BrowserCache,
          "user123" as UserID,
          5,
          (fileUUID) => {
            console.log(`Local callback: File ${fileUUID} upload completed`);
          }
        );
      }
      const fullFolderPath =
        `${StorageLocationEnum.BrowserCache}::album` as DriveFullFilePath;
      await createFolder(
        fullFolderPath,
        StorageLocationEnum.BrowserCache,
        "user123" as UserID
      );
      localStorage.setItem(
        CONSTANTS.LOCAL_STORAGE_ONBOARDING_CHECKPOINT,
        ONBOARDING_CHECKPOINTS.SAMPLE_FILES_LOADED
      );
      appendRefreshParam();
    }
  };

  const appendRefreshParam = () => {
    console.log("Appending refresh param...");
    const params = new URLSearchParams(location.search);
    params.set("refresh", uuidv4());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  return <div id="load-sample-files" />;
};
export default LoadSampleFiles;
