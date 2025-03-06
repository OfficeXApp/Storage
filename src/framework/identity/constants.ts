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

export const ONBOARDING_CHECKPOINTS = {
  FRESH_USER: "FRESH_USER",
  SAMPLE_FILES_LOADED: "SAMPLE_FILES_LOADED",
};

export function shortenAddress(address: string): string {
  // if less than 10 chars, throw error
  if (address.length < 10) {
    return address;
  }
  const slug = `${address.slice(0, 5)}..${address.slice(-3)}`;
  return slug;
}

export const hexStringToUint8Array = (hexString: string): Uint8Array => {
  const result = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    result[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return result;
};

// [TEMP]
export const FACTORY_CANISTER_ID = "jjx63-5iaaa-aaaak-ao7xq-cai";
// export const FACTORY_CANISTER_ID =
//   window.location.origin === "http://localhost:5173"
//     ? "bkyz2-fmaaa-aaaaa-qaaaq-cai"
//     : "jjx63-5iaaa-aaaak-ao7xq-cai";
