export const ENABLE_APPSTORE = true;
export const ENABLE_WALLET = false;

export const LOCALSTORAGE_IS_AI_CHAT_ENABLED =
  "LOCALSTORAGE_IS_AI_CHAT_ENABLED";
export const LOCALSTORAGE_IS_AI_CHAT_REMOTE = "LOCALSTORAGE_IS_AI_CHAT_REMOTE";
export const isAIChatEnabled = () => {
  return true;
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

export const setAIChatRemoteDefault = (enabled: boolean) => {
  localStorage.setItem(
    LOCALSTORAGE_IS_AI_CHAT_REMOTE,
    enabled ? "true" : "false"
  );
};
export const isAIChatRemoteDefault = () => {
  const isRemote = localStorage.getItem(LOCALSTORAGE_IS_AI_CHAT_REMOTE);
  return isRemote === "true";
};
