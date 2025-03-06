import {
  english,
  generateMnemonic,
  mnemonicToAccount,
  Account,
} from "viem/accounts";
import {
  LOCAL_STORAGE_ALIAS_NICKNAME,
  LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
  LOCAL_STORAGE_SEED_PHRASE,
} from "../identity/constants";

/**
 * Function createLocalWalletWithMnemonic
 *
 * Function to create a new wallet using a mnemonic phrase
 * The wallet can be used for local operations, like signing messages, without needing a chain
 * Example usage
 * const wallet = createLocalWalletWithMnemonic();
 */
export const createLocalWalletWithMnemonic = (): Account => {
  // Generate a new random mnemonic phrase
  const mnemonic = generateMnemonic(english);

  // Convert the mnemonic to an account object (deriving the private key)
  const account = mnemonicToAccount(mnemonic);

  console.log(`EVM Address: ${account.address}`);
  console.log(`EVM Mnemonic: ${mnemonic}`);

  // Store the mnemonic securely in local storage
  localStorage.setItem(LOCAL_STORAGE_EVM_PUBLIC_ADDRESS, account.address);
  localStorage.setItem(LOCAL_STORAGE_SEED_PHRASE, mnemonic);

  return account;
};

/**
 * Shortens an Ethereum address by keeping the first 3 and last 3 characters.
 * @param address - The full Ethereum address.
 * @returns The shortened address.
 */
export function shortenAddress(address: string): string {
  // if less than 10 chars, throw error
  if (address.length < 10) {
    return address;
  }
  const slug = `${address.slice(0, 5)}..${address.slice(-3)}`;
  return slug;
}

export const createDefaultAnonEVMIdentity = async (): Promise<{
  account: Account;
  alias: string;
  slug: string;
}> => {
  console.log("Creating default anonymous evm identity");
  const account = await createLocalWalletWithMnemonic();
  const alias = "Anonymous";
  localStorage.setItem(LOCAL_STORAGE_ALIAS_NICKNAME, alias);
  const slug = shortenAddress(account.address);
  return {
    account,
    slug,
    alias,
  };
};
