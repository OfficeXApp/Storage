import React, { useState, useCallback, useEffect } from "react";
import { Upload, Button, Progress, message, Input } from "antd";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import { mnemonicToAccount } from "viem/accounts";
import { mnemonicToSeed } from "@scure/bip39";

const SignatureAuthTest = () => {
  const [icpAddress, setIcpAddress] = useState<string>("");
  const [emvAddress, setEmvAddress] = useState<string>("");
  const [icpIdentity, setIcpIdentity] = useState<Ed25519KeyIdentity | null>(
    null
  );
  const [apiKey, setApiKey] = useState<string>("");
  const [proofString, setProofString] = useState<string>("");
  const [seedPhrase, setSeedPhrase] = useState<string>(
    "violin artwork tourist punch flight axis shy eagle divide bulb catalog flash"
  );

  const generateWallets = async () => {
    try {
      // EVM wallet using viem (unchanged)
      const account = mnemonicToAccount(seedPhrase);
      const evmAddress = account.address;

      // Convert mnemonic to seed bytes for Ed25519 identity
      // We use mnemonicToSeed instead of mnemonicToEntropy
      const seedBytes = await mnemonicToSeed(seedPhrase, "");

      // Create a consistent slice of the seed to use for the identity
      // Using the first 32 bytes of the seed for consistency
      const identitySeed = seedBytes.slice(0, 32);

      // Create Ed25519 identity using the generate method with our seed
      const _icpIdentity = Ed25519KeyIdentity.generate(identitySeed);
      const icpPrincipal = _icpIdentity.getPrincipal().toString();

      // Set state
      setIcpIdentity(_icpIdentity);
      setIcpAddress(icpPrincipal);
      setEmvAddress(evmAddress);

      message.success("Wallets generated successfully");
    } catch (error) {
      message.error(`Failed to generate wallets: ${(error as Error).message}`);
      console.error(error);
    }
  };

  const generateSignatureProof = async () => {
    try {
      if (!icpIdentity) {
        message.error("Please generate wallets first");
        return null;
      }

      const now = Date.now();

      // Get the raw public key directly from the identity
      const rawPublicKey = icpIdentity.getPublicKey().toRaw(); // This gets the raw key without DER encoding

      // Create the compatible principal using Principal.selfAuthenticating
      const compatiblePrincipal = Principal.selfAuthenticating(
        new Uint8Array(rawPublicKey)
      );
      console.log(
        "Expected backend principal:",
        compatiblePrincipal.toString()
      );

      // For the challenge, we still need the raw key as an array
      const publicKeyArray = Array.from(new Uint8Array(rawPublicKey));

      const challenge = {
        timestamp_ms: now,
        drive_canister_id: "drive_canister_id",
        user_icp_public_key: publicKeyArray,
      };

      const challengeBytes = new TextEncoder().encode(
        JSON.stringify(challenge)
      );

      const signature = await icpIdentity.sign(challengeBytes);
      const signatureArray = new Uint8Array(signature);

      const proof = {
        auth_type: "Signature",
        challenge,
        signature: Array.from(signatureArray),
      };

      // For debugging, log what we're about to encode
      console.log("Proof structure before encoding:", JSON.stringify(proof));
      console.log(
        "Expected backend principal:",
        compatiblePrincipal.toString()
      );

      const proofString = btoa(JSON.stringify(proof));
      setProofString(proofString);
      return proofString;
    } catch (error) {
      console.error("Signature generation error:", error);
      message.error(
        "Failed to generate signature proof: " + (error as Error).message
      );
      return null;
    }
  };

  const attemptSignatureAuthCall = async () => {
    try {
      // Generate the proof string if not already generated
      const proof = proofString || (await generateSignatureProof());
      if (!proof) {
        message.error("Failed to generate signature proof");
        return;
      }

      // Make an API call with the Bearer token
      const response = await fetch(
        "https://your-backend-api-url/protected-resource",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${proof}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        message.success("Authentication successful!");
        console.log("Response data:", data);
      } else {
        message.error(
          `Authentication failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      message.error(`API call failed: ${(error as Error).message}`);
      console.error(error);
    }
  };
  const attemptApiKeyAuthCall = async () => {
    //
  };

  return (
    <div className="w-full max-w-md">
      <Input
        value={seedPhrase}
        onChange={(e) => setSeedPhrase(e.target.value)}
      />
      <Button onClick={generateWallets}>1. Generate Wallets from Seed</Button>
      <p>ICP Address: {icpAddress}</p>
      <p>EVM Address: {emvAddress}</p>
      <Button onClick={generateSignatureProof}>
        2. Generate Signature Proof
      </Button>
      <p>Signature Proof: {proofString}</p>
      <Button onClick={attemptSignatureAuthCall}>3. Test Signature Auth</Button>
      <br />
      <Button onClick={attemptApiKeyAuthCall}>4. Test API Key Auth</Button>
    </div>
  );
};

export default SignatureAuthTest;
