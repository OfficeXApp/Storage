import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button, Result, message } from "antd";
import { GiftOutlined, DisconnectOutlined } from "@ant-design/icons";
import { FileMetadata, FileUUID, FolderUUID, Identity, StorageLocationEnum } from "@officexapp/framework";
import FilePreview from "../FilePreview";
import useScreenType from "react-screentype-hook";
import { getPseudoShareLink, updateRefInShareUrl } from "../../api/pseudo-share";
import mixpanel from "mixpanel-browser";

const { useIdentity } = Identity;

const GiftPage: React.FC = () => {
  const [searchParams] = useSearchParams(); // Use to extract query params
  const [giftID, setGiftID] = useState<string >('');
  const [giftUrl, setGiftUrl] = useState<string >('');
  const [giftTitle, setGiftTitle] = useState<string >('');
  const [error, setError] = useState<string >('');
  const [fileMetadata, setFileMetadata] = useState<FileMetadata>();
  const screenType = useScreenType();
  const { evmSlug, evmAccount, icpAccount } = useIdentity();

  useEffect(() => {
    const id = searchParams.get('id'); // Get the 'id' query param from the URL

    if (id) {
      setGiftID(id);
       
      // Fetch the Firestore record based on the giftID
      const fetchGift = async () => {
        try {
          const gift = await getPseudoShareLink(id);
          
          // Extract the URL and title from the Firestore response
          setGiftUrl(gift.url);
          setGiftTitle(gift.title);
            const metadata = {
                id: '' as FileUUID,
                originalFileName: gift.title,
                folderUUID: '' as FolderUUID,
                fileVersion: 0,
                priorVersion: null,
                nextVersion: null,
                extension: gift.title.split('.').pop(),
                fullFilePath: `${StorageLocationEnum.BrowserCache}::${gift.title}`,
                tags: [],
                owner: '',
                createdDate: new Date(),
                modifiedDate: new Date(),
                storageLocation: StorageLocationEnum.BrowserCache,
                fileSize: 0,
                rawURL: gift.url,
            } as unknown as FileMetadata;
            setFileMetadata(metadata);
        } catch (error: any) {
          console.error("Error fetching gift:", error);
          setError(error.message);
        }
      };
      
      fetchGift();
    }
  }, [searchParams]);

  // Display error if no id in URL
  if (!giftID) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Result
          status="error"
          icon={<DisconnectOutlined />}
          title="No Gift Found"
          subTitle="The gift you are looking for does not exist."
          extra={
            <Button type="primary">
              <Link to="/drive">Back to Drive</Link>
            </Button>
          }
        />
      </div>
    );
  }

  // Display error if the document was not found or some other error occurred
  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Result
          status="404"
          icon={<DisconnectOutlined />}
          title="Gift Not Found"
          subTitle={error}
          extra={
            <Button type="primary">
              <Link to="/drive">Back to Drive</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const handleShare = () => {
    const currentUrl = window.location.href;
    const newUrl = updateRefInShareUrl(currentUrl, evmAccount?.address || '');
    navigator.clipboard.writeText(newUrl)
      .then(() => {
        message.success("URL copied to clipboard!");
      })
      .catch(() => {
        message.error("Failed to copy the URL.");
      });
      mixpanel.track('Share File', {
        'File Type': giftTitle.split('.').pop(),
        'Link': newUrl,
      })
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Result
        icon={<GiftOutlined />}
        title={giftTitle || "Loading gift..."}
        subTitle="This file was shared with you"
        extra={[
            <a
                  href={giftUrl}
                  download={giftTitle}
                  target={
                    giftUrl.split('.').pop() === "pdf" ? "_blank" : "_self"
                  }
                >
          <Button 
            type="primary" 
            key="download" 
            disabled={!giftUrl}
            onClick={() => {
                mixpanel.track('Download File', {
                    'File Type': giftTitle.split('.').pop(),
                  })
                  
            }}
          >
            Download
          </Button></a>,
          <Button 
            key="share" 
            onClick={handleShare}
          >
            Copy Share
          </Button>,
        ]}
      />
      <div style={{ padding: screenType.isMobile ? 10 : 0 }}>
      {
        fileMetadata && <FilePreview file={fileMetadata} showButtons={false} />
      }
      </div>
        <br /><br /><br /><br /><br /><br />
    </div>
  );
};

export default GiftPage;
