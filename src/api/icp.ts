import { Principal } from "@dfinity/principal";
import { wordlist } from "@scure/bip39/wordlists/english";
import { hexToBytes, sha256, toBytes } from "viem";
import { entropyToMnemonic, generateMnemonic } from "@scure/bip39";
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

// Helper function to generate a deterministic mnemonic from a string
export const generateDeterministicMnemonic = (secret: string): string => {
  const secretBytes = new TextEncoder().encode(secret);
  const entropyHex = sha256(secretBytes);
  const entropyBytes = hexToBytes(entropyHex);
  return entropyToMnemonic(entropyBytes, wordlist);
};
