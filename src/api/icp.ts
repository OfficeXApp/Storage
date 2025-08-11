import { Principal } from "@dfinity/principal";
import { wordlist } from "@scure/bip39/wordlists/english";
import { sha256, toBytes } from "viem";
import { generateMnemonic } from "@scure/bip39";
import * as bip39 from "bip39";

export const formatCycles = (cycles: bigint) => {
  if (cycles === null) return "";

  const trillion = BigInt(1000000000000);
  const billion = BigInt(1000000000);
  const million = BigInt(1000000);
  const thousand = BigInt(1000);

  if (cycles >= trillion) {
    return (Number(cycles / (trillion / BigInt(100))) / 100).toFixed(2) + "T";
  } else if (cycles >= billion) {
    return (Number(cycles / (billion / BigInt(100))) / 100).toFixed(2) + "B";
  } else if (cycles >= million) {
    return (Number(cycles / (million / BigInt(100))) / 100).toFixed(2) + "M";
  } else if (cycles >= thousand) {
    return (Number(cycles / (thousand / BigInt(100))) / 100).toFixed(2) + "K";
  } else {
    return cycles.toLocaleString();
  }
};

// Helper function to validate ICP address (placeholder implementation)
export const isValidIcpAddress = (address: string): boolean => {
  try {
    // Try to create a Principal object
    // This will throw an error if the format is invalid
    const principal = Principal.fromText(address);
    return true;
  } catch (error) {
    console.error("Invalid Principal ID:", error);
    return false;
  }
};

// Helper function to generate a random seed phrase
export const generateRandomSeed = (): string => {
  // return (generate(12) as string[]).join(" ");
  return generateMnemonic(wordlist, 128);
};

export const passwordToSeedPhrase = (password: string) => {
  // 1. Generate a deterministic hash (entropy) from the password.
  const passwordBytes = new TextEncoder().encode(password);

  // The sha256 function from viem returns a hex string.
  const entropyHex = sha256(passwordBytes);

  // 2. Convert the hex string to a Uint8Array using viem's toBytes function.
  const entropyBytes = toBytes(entropyHex);

  // 3. Use bip39.entropyToMnemonic to convert the entropy into a mnemonic.
  // The library expects a Buffer, so we need to convert our Uint8Array.
  return bip39.entropyToMnemonic(Buffer.from(entropyBytes), wordlist);
};
