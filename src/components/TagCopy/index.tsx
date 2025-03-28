import { shortenAddress } from "../../framework/identity/constants";
import { message, Tag, Tooltip } from "antd";

const TagCopy = ({
  id,
  color,
  style = {},
}: {
  id: string;
  color?: string;
  style?: object;
}) => {
  let slug = shortenAddress(id.split("_").pop() || "");

  const handleCopy = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    message.success("Copied to clipboard");
  };

  return (
    <Tooltip title={id}>
      <Tag
        color={color || "default"}
        style={{ cursor: "pointer", ...style }}
        onClick={handleCopy}
      >
        {slug}
      </Tag>
    </Tooltip>
  );
};

export default TagCopy;
