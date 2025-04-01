import { Principal } from "@dfinity/principal";
import { wordlist } from "@scure/bip39/wordlists/english";
import { generate } from "random-words";
import { sha256 } from "viem";

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
  return (generate(12) as string[]).join(" ");
};

export const passwordToSeedPhrase = (password: string) => {
  // Generate a deterministic hash from the password
  const passwordBytes = new TextEncoder().encode(password);
  const hashBytes = sha256(passwordBytes);

  // Use the hash to select 12 words from the BIP39 wordlist
  const words = [];
  const totalWords = wordlist.length;

  // Use each 11 bits of the hash to select a word
  for (let i = 0; i < 12; i++) {
    // Take 11 bits at a time from the hash to select a word
    const startBit = (i * 11) % (32 * 8); // 32 bytes * 8 bits
    const byteIndex = Math.floor(startBit / 8);
    const bitOffset = startBit % 8;

    // Extract 11 bits across potentially two bytes
    // @ts-ignore
    let value = hashBytes[byteIndex] << 8;
    if (byteIndex + 1 < hashBytes.length) {
      // @ts-ignore
      value |= hashBytes[byteIndex + 1];
    }

    // Shift right to align with the bit offset, then mask to get 11 bits
    value = (value >> (8 - bitOffset)) & 0x7ff; // 0x7FF = 2047 (11 bits)

    // Use modulo to ensure we're in range for the wordlist
    const wordIndex = value % totalWords;
    words.push(wordlist[wordIndex]);
  }

  return words.join(" ");
};
