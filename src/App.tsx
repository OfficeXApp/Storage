// App.tsx

import { DriveFullFilePath, StorageLocationEnum, useDrive } from "./framework";
import RouterUI from "./RouterUI";
import { useCallback, useEffect, useState } from "react";
import { Alert, Spin } from "antd";
import Marquee from "react-fast-marquee";
import { setupFreeTrialStorj } from "./api/storj";
import mixpanel from "mixpanel-browser";
import { useIdentitySystem } from "./framework/identity";
import { LOCAL_STORAGE_SEED_PHRASE } from "./framework/identity/constants";
import { useMultiUploader } from "./framework/uploader/hook";
import {
  checkDiskTablePermissionsAction,
  listDisksAction,
} from "./redux-offline/disks/disks.actions";
import { useDispatch } from "react-redux";
import {
  checkApiKeyTablePermissionsAction,
  listApiKeysAction,
} from "./redux-offline/api-keys/api-keys.actions";
import {
  checkContactTablePermissionsAction,
  listContactsAction,
} from "./redux-offline/contacts/contacts.actions";
import {
  checkDriveTablePermissionsAction,
  listDrivesAction,
} from "./redux-offline/drives/drives.actions";
import {
  checkGroupTablePermissionsAction,
  listGroupsAction,
} from "./redux-offline/groups/groups.actions";
import { listGroupInvitesAction } from "./redux-offline/group-invites/group-invites.actions";
import { listLabelsAction } from "./redux-offline/labels/labels.actions";
import {
  checkWebhookTablePermissionsAction,
  listWebhooksAction,
} from "./redux-offline/webhooks/webhooks.actions";
import { sleep } from "./api/helpers";
import {
  checkSystemPermissionTablePermissionsAction,
  listSystemPermissionsAction,
} from "./redux-offline/permissions/permissions.actions";

import { DiskTypeEnum } from "@officexapp/types";
import {
  defaultTempCloudSharingDiskID,
  defaultTempCloudSharingRootFolderID,
} from "./api/dexie-database";

function App() {
  const [emvMnemonic, setEvmMnemonic] = useState<string | null>(null);
  const [icpMnemonic, setIcpMnemonic] = useState<string | null>(null);
  const { currentProfile, currentOrg } = useIdentitySystem();
  const { evmPublicKey, icpPublicKey, slug } = currentProfile || {};
  const dispatch = useDispatch();

  useEffect(() => {
    const _evmMnemonic = localStorage.getItem(LOCAL_STORAGE_SEED_PHRASE);
    const _icpMnemonic = localStorage.getItem(LOCAL_STORAGE_SEED_PHRASE);
    if (_evmMnemonic) {
      setEvmMnemonic(_evmMnemonic);
    }
    if (_icpMnemonic) {
      setIcpMnemonic(_icpMnemonic);
    }
    setupFreeTrialStorj();
  }, []);

  useEffect(() => {
    const incrementalFetchData = async () => {
      if (currentProfile && currentOrg) {
        let bufferTime = 0;
        if (currentOrg.endpoint) {
          bufferTime = 1000;
          if (window.location.pathname.includes("/drive")) {
            bufferTime = 2000;
          }
        }

        dispatch(listDisksAction({}));
        // await sleep(bufferTime);
        // dispatch(listContactsAction({}));
        // await sleep(bufferTime);
        // await sleep(bufferTime);
        // dispatch(listGroupsAction({}));
        // await sleep(bufferTime);
        // dispatch(checkContactTablePermissionsAction(currentProfile.userID));
        // await sleep(bufferTime);
        // dispatch(checkDiskTablePermissionsAction(currentProfile.userID));
        // await sleep(bufferTime);
        // dispatch(checkGroupTablePermissionsAction(currentProfile.userID));

        // await sleep(bufferTime);
        // dispatch(listDrivesAction({}));
        // await sleep(bufferTime);
        // dispatch(checkDriveTablePermissionsAction(currentProfile.userID));
        // await sleep(bufferTime);
        // dispatch(listLabelsAction({}));
        // await sleep(bufferTime);
        // dispatch(listWebhooksAction({}));
        // await sleep(bufferTime);
        // dispatch(checkWebhookTablePermissionsAction(currentProfile.userID));
        // await sleep(bufferTime);
        // dispatch(checkApiKeyTablePermissionsAction(currentProfile.userID));
        // await sleep(bufferTime);
        // dispatch(
        //   checkSystemPermissionTablePermissionsAction(currentProfile.userID)
        // );
        // await sleep(bufferTime);
        // dispatch(listSystemPermissionsAction({}));
      }
    };
    incrementalFetchData();
  }, [currentOrg?.endpoint, currentProfile?.userID]);

  useEffect(() => {
    setupAnalytics();
  }, [currentProfile]);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const ref = urlParams.get("ref") || "";

  const setupAnalytics = useCallback(() => {
    if (window.location.hostname === "drive.officex.app" && currentProfile) {
      mixpanel.identify(evmPublicKey);
      mixpanel.people.set({
        $name: slug,
        evmAddress: evmPublicKey,
        icpAddress: icpPublicKey,
        ref: ref,
      });
    }
  }, [evmPublicKey, icpPublicKey, slug, ref]);

  return (
    <div style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
      {/* <Alert
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
      /> */}
      <RouterUI />
    </div>
  );
}

export default App;
