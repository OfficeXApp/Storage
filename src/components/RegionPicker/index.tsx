import React, { useState, useMemo } from "react";
import { Button, Modal, Select, Tooltip } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { language_dropdown_options } from "./constants"; // Adjust path as needed
import { LocaleSwitcher } from "lingo.dev/react-client";

const { Option } = Select;

// --- Type Definitions ---

// Define the structure of a language option from your language_dropdown_options array
interface LanguageOptionData {
  id: string; // e.g., "en-US" - unique identifier for selection
  code: string; // e.g., "en" - base language code
  title: string; // e.g., "🇯🇵 日本語"
  hint: string; // e.g., "Japanese"
}

// Define the structure of the 'option' object that Ant Design's Select passes to filterOption
interface SelectOptionProps {
  value: string; // This will now be the 'id' (e.g., "en-US")
  label: string; // This is the combined string we set: "🇯🇵 日本語 (Japanese)"
  hint: string; // This is the English hint we passed: "Japanese"
  children: React.ReactNode; // The actual JSX content inside <Option>
  // Ant Design might add other internal props, but these are the ones we explicitly use or set.
}

/**
 * A language picker component for Ant Design.
 * Displays a flag emoji button which, when clicked, opens a modal
 * with a searchable single-select dropdown of languages.
 *
 * @param {object} props - Component props.
 * @param {string} [props.initialLanguageId='en-US'] - The ISO code of the initially selected language (e.g., "en-US").
 */
const RegionPicker = ({ initialLanguageId = "en-US" }) => {
  // Changed default to a full ID
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLanguageId, setCurrentLanguageId] = useState(initialLanguageId);

  // Find the currently selected language object for the button display
  const selectedLanguage = useMemo(
    () =>
      language_dropdown_options.find((lang) => lang.id === currentLanguageId) ||
      language_dropdown_options[0], // Fallback to the first option if initial ID is not found
    [currentLanguageId]
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // The 'value' received here will now be the full 'id' (e.g., "en-US")
  const handleSelectChange = (value: string) => {
    setCurrentLanguageId(value);
    setIsModalVisible(false);
  };

  // Custom filter function for the Select component
  // Allows searching by native name (title) and English hint
  const filterOption = (input: string, option?: SelectOptionProps) => {
    const lowerInput = input.toLowerCase();
    return (
      option?.label?.toLowerCase().includes(lowerInput) || // Search by combined label
      option?.hint?.toLowerCase().includes(lowerInput) || // Search by hint directly
      false
    );
  };

  // Extract just the flag emoji from the title string
  const getFlagEmoji = (title: string) => {
    // Regex to match one or more flag emojis at the start of the string
    const match = title.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)+/u);
    return match ? match[0] : "🌐"; // Fallback to a globe emoji
  };

  return <LocaleSwitcher locales={["en", "es", "zh", "vi"]} />;

  return (
    <>
      <Tooltip
        title={`Current Language: ${selectedLanguage.title} (${selectedLanguage.hint})`}
      >
        <Button
          onClick={showModal}
          icon={
            <span
              role="img"
              aria-label={selectedLanguage.hint}
              style={{ fontSize: "1.2em" }}
            >
              {getFlagEmoji(selectedLanguage.title)}
            </span>
          }
          size="middle"
          type="text"
        />
      </Tooltip>

      <Modal
        title="Select Language"
        open={isModalVisible} // Use 'open' for Ant Design v5, 'visible' for v4
        onCancel={handleCancel}
        footer={null} // No default footer buttons needed
        width={400} // Adjust modal width for better readability
        destroyOnClose // Ensures the Select state is reset each time it opens
      >
        <Select
          showSearch
          placeholder="Search or select a language..."
          optionFilterProp="label" // This tells Select to filter based on the 'label' prop of Option
          filterOption={filterOption} // Use our custom filter function
          onChange={handleSelectChange}
          value={currentLanguageId}
          style={{ width: "100%" }}
        >
          {language_dropdown_options.map((lang) => (
            <Option
              key={lang.id}
              value={lang.id}
              label={`${lang.title} ${lang.hint}`}
              hint={lang.hint}
            >
              {lang.title}{" "}
              <span style={{ color: "#999", fontSize: "0.9em" }}>
                {lang.hint}
              </span>
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default RegionPicker;
