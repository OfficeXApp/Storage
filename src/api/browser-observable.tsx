import React, { useState, useRef, useEffect } from 'react';
import { Button, Progress, List, Upload, message, Flex } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile, UploadProps } from 'antd/lib/upload/interface';
import { DriveDB, IndexedDBStorage, UserID } from '@officexapp/framework'; 
import { StorageLocationEnum, UploadProgress, UploadItem, FileUploadStatusEnum } from '@officexapp/framework';
import { green, red, grey } from '@ant-design/colors';

const UploadFiles: React.FC = () => {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);

  const driveDBRef = useRef<DriveDB>();
  const cancelUploadRef = useRef<(id: string) => void>();

  useEffect(() => {
    const init = async () => {
      const indexDBStorage = IndexedDBStorage.getInstance();
      await indexDBStorage.initialize()
      driveDBRef.current = new DriveDB(indexDBStorage);
    }
    init()
  }, []);

  const handleUpload = async (files: File[]) => {
    const driveDB = driveDBRef.current;

    if (!driveDB) {
      message.error('DriveDB is not initialized');
      return;
    }

    const userId = 'user123' as UserID;
    const uploadFolderPath = 'uploads';

    try {
      const { progress$, cancelUpload, uploadComplete$, getUploadQueue } = driveDB.uploadFilesFolders(
        files,
        uploadFolderPath,
        StorageLocationEnum.BrowserCache,
        userId,
        1
      );

      cancelUploadRef.current = cancelUpload;

      // Initialize upload items
      setUploadItems(getUploadQueue());

      // Subscribe to progress updates
      progress$.subscribe((progress: UploadProgress) => {
        setUploadItems(getUploadQueue());
        setOverallProgress(progress.percentage);
      });

      // Handle completion
      uploadComplete$.subscribe({
        next: (fileUUID) => {
          setUploadItems(getUploadQueue());
        },
        complete: () => {
          console.log('All uploads complete');
          message.success('All files uploaded successfully');
        },
        error: (err) => {
          console.error('Upload error:', err);
          message.error('Upload failed.');
        }
      });
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('Upload failed.');
    }
  };

  const handleSelectFiles: UploadProps['customRequest'] = ({ file, onSuccess }) => {
    handleUpload([file as RcFile]);
    onSuccess?.('OK');
  };

  const handleCancel = (id: string) => {
    if (cancelUploadRef.current) {
      cancelUploadRef.current(id);
    }
  };

  const getProgressColor = (status: FileUploadStatusEnum): string => {
    switch (status) {
      case FileUploadStatusEnum.Completed:
        return green[6];
      case FileUploadStatusEnum.Failed:
        return red[5];
      case FileUploadStatusEnum.Cancelled:
        return grey[5];
      default:
        return 'rgba(0, 0, 0, 0.06)';
    }
  };

  const MultiColorProgress: React.FC<{ percent: number, items: UploadItem[] }> = ({ percent, items }) => {
    const totalSteps = items.length;
    const strokeColors = items.map(item => getProgressColor(item.status));

    return (
      <Progress
        percent={percent}
        steps={totalSteps}
        strokeColor={strokeColors}
      />
    );
  };

  return (
    <div>
      <Upload
        customRequest={handleSelectFiles}
        multiple
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Select and Upload Files</Button>
      </Upload>

      <Flex gap="small" vertical style={{ marginTop: 16 }}>
        <MultiColorProgress percent={overallProgress} items={uploadItems} />
      </Flex>

      <List
        itemLayout="horizontal"
        dataSource={uploadItems.reverse()}
        renderItem={(item) => (
          <List.Item 
            actions={[
              item.status === FileUploadStatusEnum.Queued || item.status === FileUploadStatusEnum.Uploading
                ? <Button onClick={() => handleCancel(item.id)}>Cancel</Button>
                : null
            ]}
          >
            <List.Item.Meta title={item.name} description={item.status} />
            <Progress
              percent={item.progress}
              status={
                item.status === FileUploadStatusEnum.Failed ? 'exception' :
                item.status === FileUploadStatusEnum.Completed ? 'success' :
                item.status === FileUploadStatusEnum.Cancelled ? 'normal' :
                'active'
              }
              strokeColor={getProgressColor(item.status)}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default UploadFiles;