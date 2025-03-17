// src/components/LabelsPage/label.add.tsx

import React, { useState } from "react";
import {
  Button,
  ColorPicker,
  Drawer,
  Form,
  Input,
  Space,
  Typography,
} from "antd";
import { LabelFE, IRequestCreateLabel } from "@officexapp/types";
import { useDispatch, useSelector } from "react-redux";
import { createLabelAction } from "../../redux-offline/labels/labels.actions";
import useScreenType from "react-screentype-hook";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { ReduxAppState } from "../../redux-offline/ReduxProvider";

const { Text } = Typography;

interface LabelsAddDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddLabel: (label: LabelFE) => void;
}

const LabelsAddDrawer: React.FC<LabelsAddDrawerProps> = ({
  open,
  onClose,
  onAddLabel,
}) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: ReduxAppState) => state.offline?.online);
  const screenType = useScreenType();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [labelValue, setLabelValue] = useState("");

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setLoading(true);

      const labelData: IRequestCreateLabel = {
        value: values.value,
        description: values.description || undefined,
        color: values.color || "#1890ff", // Default to blue if no color selected
        external_id: values.external_id || undefined,
        external_payload: values.external_payload || undefined,
      };

      dispatch(createLabelAction(labelData));

      // Call onAddLabel with the created label data
      if (onAddLabel) {
        const newLabel = {
          ...labelData,
          id: "", // This will be filled by the server
          created_at: Date.now(),
          last_updated_at: Date.now(),
          created_by: "",
          resources: [],
          labels: [],
          permission_previews: [],
        } as LabelFE;
        onAddLabel(newLabel);
      }

      // Reset form and close drawer
      form.resetFields();
      setLabelValue("");
      setLoading(false);
      onClose();
    });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelValue(e.target.value);
  };

  return (
    <Drawer
      title="Add New Label"
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
      width={screenType.isMobile ? "100%" : 400}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!labelValue.trim()}
            >
              Create Label
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          label="Label"
          name="value"
          rules={[
            { required: true, message: "Please enter a label text" },
            { max: 50, message: "Label text cannot exceed 50 characters" },
          ]}
        >
          <Input placeholder="Enter label text" onChange={handleValueChange} />
        </Form.Item>

        {/* Advanced section with details label */}
        <details
          style={{ marginTop: "16px" }}
          open={isAdvancedOpen}
          onToggle={(e) => setIsAdvancedOpen(e.currentTarget.open)}
        >
          <summary
            style={{
              cursor: "pointer",
              color: "#595959",
              fontSize: "14px",
              marginBottom: "8px",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #f0f0f0",
              paddingTop: "16px",
            }}
          >
            Advanced Settings &nbsp;
            {isAdvancedOpen ? <UpOutlined /> : <DownOutlined />}
          </summary>

          <div style={{ padding: "8px 0" }}>
            <Form.Item label="Description" name="description">
              <Input.TextArea
                rows={3}
                placeholder="Enter description (optional)"
              />
            </Form.Item>

            <Form.Item label="Color" name="color" initialValue="#1890ff">
              <ColorPicker />
            </Form.Item>

            <Form.Item label="External ID" name="external_id">
              <Input placeholder="External system identifier" />
            </Form.Item>

            <Form.Item label="External Payload" name="external_payload">
              <Input.TextArea
                rows={2}
                placeholder="Additional data for external systems"
              />
            </Form.Item>
          </div>
        </details>
      </Form>
    </Drawer>
  );
};

export default LabelsAddDrawer;
