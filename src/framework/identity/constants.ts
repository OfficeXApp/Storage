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

export enum DEPLOYMENT_STAGE {
  LocalDevelopment,
  StagingPublicTestnet,
  Production,
}

// LOCAL_DEV
const _DEPLOYMENT_STAGING: DEPLOYMENT_STAGE = DEPLOYMENT_STAGE.LocalDevelopment;

export const FREE_STAGING_CANISTER = `lqy7q-dh777-77777-aaaaq-cai`;

// LOCAL vs. PROD
export const FACTORY_CANISTER_ENDPOINT =
  // @ts-ignore
  _DEPLOYMENT_STAGING === DEPLOYMENT_STAGE.Production
    ? "https://glvgj-aiaaa-aaaak-apdmq-cai.icp0.io"
    : // @ts-ignore
      _DEPLOYMENT_STAGING === DEPLOYMENT_STAGE.StagingPublicTestnet
      ? `https://${FREE_STAGING_CANISTER}.icp-testnet.click`
      : "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000";

export const DEFAULT_GIFTCARD_REFUEL_VENDOR =
  // @ts-ignore
  _DEPLOYMENT_STAGING === DEPLOYMENT_STAGE.Production
    ? "https://glvgj-aiaaa-aaaak-apdmq-cai.icp0.io"
    : // @ts-ignore
      _DEPLOYMENT_STAGING === DEPLOYMENT_STAGE.StagingPublicTestnet
      ? `https://${FREE_STAGING_CANISTER}.icp-testnet.click`
      : "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8000";

export const FREE_STAGING_ENDPOINT = `https://${FREE_STAGING_CANISTER}.icp-testnet.click`;
export const FREE_STAGING_AUTH_TOKEN =
  "eyJhdXRoX3R5cGUiOiJBUElfX0tFWSIsInZhbHVlIjoiMzcxZDYwNzYxMzllNmQ2MDhiNjY5ZWMzMjA2YzQwOWFmMjZlNTBiNjdkMTRlMWNkNjY4YmY2NDMwOGM4YmNlZSJ9";
