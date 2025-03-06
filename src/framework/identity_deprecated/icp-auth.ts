import { Ed25519KeyIdentity } from "@dfinity/identity";
import { wordlist } from "@scure/bip39/wordlists/english";
import {
  generateMnemonic as genMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from "@scure/bip39";
import {
  LOCAL_STORAGE_ICP_PUBLIC_ADDRESS,
  LOCAL_STORAGE_SEED_PHRASE,
} from "../identity/constants";
import { Principal } from "@dfinity/principal";

export interface ICPAccount {
  publicKeyHex: string;
  identity: Ed25519KeyIdentity;
  principal: Principal;
}

// Function to generate mnemonic seed phrase
export const generateICPIdentityWithMnemonic = async (): Promise<{
  mnemonic: string;
  identity: Ed25519KeyIdentity;
  privateKeyHex: string;
  publicKeyHex: string;
  principal: Principal;
}> => {
  console.log("Generating ICP identity with mnemonic seed phrase!");
  // Generate a 12-word mnemonic seed phrase
  const mnemonic = genMnemonic(wordlist);
  console.log("ICP Mnemonic Seed Phrase:", mnemonic);

  // Derive a seed from the mnemonic
  const seed = mnemonicToSeedSync(mnemonic);

  // Derive Ed25519 keypair from the seed
  const derivedKey = await deriveEd25519KeyFromSeed(seed);

  // Create the identity from the derived key
  const identity = Ed25519KeyIdentity.fromSecretKey(derivedKey);

  // Export the private key and public key
  const privateKeyHex = arrayBufferToHex(identity.getKeyPair().secretKey);
  const publicKeyHex = arrayBufferToHex(identity.getPublicKey().toDer());

  console.log("ICP Private Key (Hex):", privateKeyHex);
  console.log("ICP Public Key (Hex):", publicKeyHex);

  // Convert the hex string into a Uint8Array (browser compatible)
  const publicKeyBuffer = hexStringToUint8Array(publicKeyHex);
  // Derive Principal from the public key
  const principal = Principal.selfAuthenticating(publicKeyBuffer);

  localStorage.setItem(LOCAL_STORAGE_ICP_PUBLIC_ADDRESS, publicKeyHex);
  localStorage.setItem(LOCAL_STORAGE_SEED_PHRASE, mnemonic);
  console.log("ICP Principal:", principal.toText());

  return {
    mnemonic,
    identity,
    privateKeyHex,
    publicKeyHex,
    principal,
  };
};

// Function to derive Ed25519 key from seed (uses the first 32 bytes of the seed)
const deriveEd25519KeyFromSeed = async (
  seed: Uint8Array
): Promise<Uint8Array> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", seed);
  return new Uint8Array(hashBuffer).slice(0, 32); // Ed25519 secret key should be 32 bytes
};

// Function to restore identity from mnemonic seed phrase
export const restoreICPIdentityFromMnemonic = async (
  mnemonic: string
): Promise<ICPAccount> => {
  console.log("Restoring icp identity from mnemonic seed phrase", mnemonic);
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error("Invalid icp mnemonic phrase");
  }

  // Derive the seed from the mnemonic
  const seed = mnemonicToSeedSync(mnemonic);

  // Derive the Ed25519 keypair from the seed
  const derivedKey = await deriveEd25519KeyFromSeed(seed);

  // Create the identity from the derived key
  const identity = Ed25519KeyIdentity.fromSecretKey(derivedKey);

  // Export the private key and public key
  const privateKeyHex = arrayBufferToHex(identity.getKeyPair().secretKey);
  const publicKeyHex = arrayBufferToHex(identity.getPublicKey().toDer());

  localStorage.setItem(LOCAL_STORAGE_ICP_PUBLIC_ADDRESS, publicKeyHex);

  // Convert the hex string into a Uint8Array (browser compatible)
  const publicKeyBuffer = hexStringToUint8Array(publicKeyHex);

  // Derive Principal from the public key
  const principal = Principal.selfAuthenticating(publicKeyBuffer);

  console.log("Restored ICP Private Key (Hex):", privateKeyHex);
  console.log("Restored ICP Public Key (Hex):", publicKeyHex);
  console.log("Restored ICP Principal:", principal.toText());

  return {
    identity,
    publicKeyHex,
    principal,
  };
};

// Helper function to convert ArrayBuffer to hex string
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Helper function to convert hex string to Uint8Array
export const hexStringToUint8Array = (hexString: string): Uint8Array => {
  const result = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    result[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return result;
};
