// App.tsx

import {
  DriveFullFilePath,
  Identity,
  StorageLocationEnum,
  useDrive,
  UserID,
} from "@officexapp/framework";
import RouterUI from "./RouterUI";
import { useCallback, useEffect, useState } from "react";
import { Alert, Spin } from "antd";
import Marquee from "react-fast-marquee";
import { setupFreeTrialStorj } from "./api/storj";
import mixpanel from "mixpanel-browser";

const { CONSTANTS, ONBOARDING_CHECKPOINTS, useIdentity } = Identity;

function App() {
  const [emvMnemonic, setEvmMnemonic] = useState<string | null>(null);
  const [icpMnemonic, setIcpMnemonic] = useState<string | null>(null);
  const { evmSlug, evmAccount, icpAccount } = useIdentity();

  useEffect(() => {
    const _evmMnemonic = localStorage.getItem(
      Identity.CONSTANTS.LOCAL_STORAGE_EVM_WALLET_MNEMONIC
    );
    const _icpMnemonic = localStorage.getItem(
      Identity.CONSTANTS.LOCAL_STORAGE_ICP_WALLET_MNEMONIC
    );
    if (_evmMnemonic) {
      setEvmMnemonic(_evmMnemonic);
    }
    if (_icpMnemonic) {
      setIcpMnemonic(_icpMnemonic);
    }
    setupFreeTrialStorj();
  }, []);

  useEffect(() => {
    setupAnalytics();
  }, [evmAccount, icpAccount, evmSlug]);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const ref = urlParams.get("ref") || "";

  const setupAnalytics = useCallback(() => {
    if (
      window.location.hostname === "drive.officex.app" &&
      evmSlug !== "0x0" &&
      evmAccount &&
      icpAccount
    ) {
      mixpanel.identify(evmAccount?.address);
      mixpanel.people.set({
        $name: evmSlug,
        evmAddress: evmAccount?.address,
        icpAddress: icpAccount?.publicKeyHex,
        ref: ref,
      });
    }
  }, [evmAccount, icpAccount, evmSlug, ref]);

  return (
    <div style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
      <Alert
        message={
          <Marquee pauseOnHover gradient={false}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <span>
                Buy $OFFICEX today! Grassroots crypto, zero insiders, zero VCs
                <a
                  href="https://app.uniswap.org/swap?inputCurrency=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&outputCurrency=0x48808407d95f691D076C90337d42eE3836656990"
                  target="_blank"
                  style={{ padding: "0px 10px" }}
                >
                  Buy $OFFICEX
                </a>
                Official & Only Sale - Extreme Healthy Tokenomics, Industry
                Leading Liquidity{" "}
                <a
                  href="https://app.uniswap.org/swap?inputCurrency=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&outputCurrency=0x48808407d95f691D076C90337d42eE3836656990"
                  target="_blank"
                  style={{ padding: "0px 10px" }}
                >
                  Buy $OFFICEX
                </a>
              </span>
              <span>
                #OfficeX - Where Freedom Works | 100% Decentralized | 100% Open
                Source{" "}
                <a
                  href="https://app.uniswap.org/swap?inputCurrency=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&outputCurrency=0x48808407d95f691D076C90337d42eE3836656990"
                  target="_blank"
                  style={{ padding: "0px 10px" }}
                >
                  Buy $OFFICEX
                </a>
              </span>
            </div>
          </Marquee>
        }
        type="info"
        banner
        closable={false}
      />
      <RouterUI />
    </div>
  );
}

export default App;
