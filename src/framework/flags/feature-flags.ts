export const ENABLE_APPSTORE = true;
export const ENABLE_WALLET = false;

export const LOCALSTORAGE_IS_AI_CHAT_ENABLED =
  "LOCALSTORAGE_IS_AI_CHAT_ENABLED";
export const isAIChatEnabled = () => {
  // check if localstorage
  const enableChatWithAI = localStorage.getItem(
    LOCALSTORAGE_IS_AI_CHAT_ENABLED
  );
  return enableChatWithAI === "true";
};
export const setAIChatEnabled = (enabled: boolean) => {
  localStorage.setItem(
    LOCALSTORAGE_IS_AI_CHAT_ENABLED,
    enabled ? "true" : "false"
  );
  setTimeout(() => {
    window.location.reload();
  }, 300);
};
