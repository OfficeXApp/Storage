// Constants - Adjust these based on your needs
export const LOCAL_STORAGE_SEED_PHRASE = "LOCAL_STORAGE_SEED_PHRASE";
export const LOCAL_STORAGE_ALIAS_NICKNAME = "LOCAL_STORAGE_ALIAS_NICKNAME";
export const LOCAL_STORAGE_EVM_PUBLIC_ADDRESS =
  "LOCAL_STORAGE_EVM_PUBLIC_ADDRESS";

export const LOCAL_STORAGE_ICP_PUBLIC_ADDRESS =
  "LOCAL_STORAGE_ICP_PUBLIC_ADDRESS";

export const LOCAL_STORAGE_ONBOARDING_CHECKPOINT =
  "LOCAL_STORAGE_ONBOARDING_CHECKPOINT";

export const LOCAL_STORAGE_ORGANIZATION_DRIVE_ID =
  "LOCAL_STORAGE_ORGANIZATION_DRIVE_ID";

export const CONSTANTS = {
  LOCAL_STORAGE_ALIAS_NICKNAME,
  LOCAL_STORAGE_SEED_PHRASE,
  LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
  LOCAL_STORAGE_ICP_PUBLIC_ADDRESS,
  LOCAL_STORAGE_ONBOARDING_CHECKPOINT,
  LOCAL_STORAGE_ORGANIZATION_DRIVE_ID,
};

export const LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN =
  "LOCAL_STORAGE_DIRECTORY_PERMISSIONS_ADVANCED_OPEN";

export const LOCAL_STORAGE_TOGGLE_REST_API_DOCS =
  "LOCAL_STORAGE_TOGGLE_REST_API_DOCS";

export const ONBOARDING_CHECKPOINTS = {
  FRESH_USER: "FRESH_USER",
  SAMPLE_FILES_LOADED: "SAMPLE_FILES_LOADED",
};

export function shortenAddress(address: string): string {
  // if less than 10 chars, throw error
  if (address.length < 10) {
    return address;
  }
  const slug = `${address.slice(0, 3)}..${address.slice(-3)}`;
  return slug;
}

export const hexStringToUint8Array = (hexString: string): Uint8Array => {
  const result = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    result[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return result;
};

// LOCAL vs. PROD
// export const FACTORY_CANISTER_ENDPOINT =
//   "http://be2us-64aaa-aaaaa-qaabq-cai.e131-42-115-249-36.ngrok-free.app/v1/default/giftcards/redeem";
export const FACTORY_CANISTER_ENDPOINT =
  "http://be2us-64aaa-aaaaa-qaabq-cai.localhost:8000";
