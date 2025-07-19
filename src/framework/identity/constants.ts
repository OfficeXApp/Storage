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

export const LOCAL_DEV_MODE = true;

// LOCAL vs. PROD
export const FACTORY_CANISTER_ENDPOINT = LOCAL_DEV_MODE
  ? "http://be2us-64aaa-aaaaa-qaabq-cai.localhost:8000"
  : "https://glvgj-aiaaa-aaaak-apdmq-cai.icp0.io";

// "http://be2us-64aaa-aaaaa-qaabq-cai.localhost:8000"
export const DEFAULT_GIFTCARD_REFUEL_VENDOR = LOCAL_DEV_MODE
  ? "http://be2us-64aaa-aaaaa-qaabq-cai.localhost:8000"
  : "https://glvgj-aiaaa-aaaak-apdmq-cai.icp0.io";

export const DOCUMENTS_APP_ENDPOINT = LOCAL_DEV_MODE
  ? "http://localhost:3002/docs/"
  : "https://demoofidapps.web.app/docs/";

export const SPREADSHEET_APP_ENDPOINT = LOCAL_DEV_MODE
  ? "http://localhost:3002/sheets/"
  : "https://demoofidapps.web.app/sheets/";

export const WEB2_FACTORY_ENDPOINT = LOCAL_DEV_MODE
  ? "http://localhost:8888"
  : "https://officex.otterpad.cc";

// Hardcoded Gift Card Options
export const initialGiftCardOptions: GiftCardOption[] = [
  {
    title: "🇺🇸 Amazon Web Services | FREE",
    subtext: "American Data Centers",
    value: WEB2_FACTORY_ENDPOINT,
  },
  {
    title: "🌐 World Computer | PAID",
    subtext:
      "Internet Computer Protocol Mainnet, decentralized trustless crypto cloud",
    value: FACTORY_CANISTER_ENDPOINT,
    buyLink: "https://nowpayments.io/payment?iid=4444542097",
  },
  {
    title: "🇨🇭 Swiss Mountain Bunker | PAID",
    subtext:
      "Mountain Datacenter in a Nuclear Fallout Bunker, decentralized trustless crypto cloud, committed to neutrality.",
    value: "https://glvgj-aiaaa-aaaak-dfj3f-cai.icp0.io",
    buyLink: "https://nowpayments.io/payment?iid=4444542097",
  },
  {
    title: "📦 Custom | FREE",
    subtext: "Bring your own backend server",
    value: "enter custom url endpoint",
    buyLink: "https://repocloud.io/?ref=wxmj693",
  },
  {
    title: "🇨🇳 Alibaba Cloud | FREE",
    subtext: "Chinese Data Centers",
    value: "https://free-alibaba-china.officex.app",
  },
  {
    title: "🇪🇺 Hetzner Cloud | FREE",
    subtext: "European Union / German Data Centers",
    value: "https://free-hetzner-eu.officex.app",
  },
];

export interface GiftCardOption {
  title: string;
  subtext: string;
  value: string;
  buyLink?: string;
}
