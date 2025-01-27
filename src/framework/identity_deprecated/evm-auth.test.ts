import { describe, it, expect, beforeEach } from "vitest";
import { mnemonicToAccount } from "viem/accounts";
import { createLocalWalletWithMnemonic, shortenAddress } from "./evm-auth";
import {
  LOCAL_STORAGE_EVM_PUBLIC_ADDRESS,
  LOCAL_STORAGE_EVM_WALLET_MNEMONIC,
} from "./constants";

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("createLocalWalletWithMnemonic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should generate the same wallet from the same mnemonic", () => {
    // Step 1: Generate the wallet and store the mnemonic
    const account1 = createLocalWalletWithMnemonic();
    const storedMnemonic = localStorage.getItem(
      LOCAL_STORAGE_EVM_WALLET_MNEMONIC
    );

    // Step 2: Regenerate the wallet using the stored mnemonic
    const regeneratedAccount = mnemonicToAccount(storedMnemonic!);

    // Step 3: Check if both accounts have the same address
    expect(account1.address).toBe(regeneratedAccount.address);
  });

  it("should store the address and mnemonic in localStorage", () => {
    // Generate the wallet
    const account = createLocalWalletWithMnemonic();

    // Retrieve the stored values
    const storedAddress = localStorage.getItem(
      LOCAL_STORAGE_EVM_PUBLIC_ADDRESS
    );
    const storedMnemonic = localStorage.getItem(
      LOCAL_STORAGE_EVM_WALLET_MNEMONIC
    );

    // Validate that the stored values match the generated ones
    expect(storedAddress).toBe(account.address);
    expect(storedMnemonic).not.toBeNull();
    expect(storedMnemonic!.split(" ").length).toBe(12); // Assuming a 12-word mnemonic
  });
});

// Tests for the shortenAddress function
describe("shortenAddress", () => {
  it("should return the shortened form of a valid Ethereum address", () => {
    const address = "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC";
    const result = shortenAddress(address);
    expect(result).toBe("0xa5c..8AC");
  });

  // it("should throw an error for an invalid Ethereum address", () => {
  //   const invalidAddress = "0xInvalidAddress";
  //   expect(() => shortenAddress(invalidAddress)).toThrow("Invalid address");
  // });

  it("should throw an error for an empty string", () => {
    const emptyAddress = "";
    expect(() => shortenAddress(emptyAddress)).toThrow("Invalid address");
  });
});
