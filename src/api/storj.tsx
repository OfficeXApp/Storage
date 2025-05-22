import {
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
} from "../framework";
import { notification } from "antd";
import { Link } from "react-router-dom";

export const freeTrialStorjCreds = {
  access_key: "jw23ptdypclkptmfmfnirxjfkoqa",
  secret_key: "jyfrblil2o7fhmw5qxfenwhp5qbsxykvo4l3we2eu4yenqfodfdyw",
  endpoint: "https://gateway.storjshare.io",
};

// export const freeTrialStorjCreds = {
//   access_key: "jw23ptdypclkptmfmfnirxjfkoqa",
//   secret_key: "j3smkybq2b24foid56xw2tteesaes4dlamqueg5z4jiijeevdqlow",
//   endpoint: "https://gateway.storjshare.io",
// };

export const setupFreeTrialStorj = () => {
  const isStorjSet =
    localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_SECRET_KEY) &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_ENDPOINT);

  if (!isStorjSet) {
    localStorage.setItem(
      LOCAL_STORAGE_STORJ_ACCESS_KEY,
      freeTrialStorjCreds.access_key
    );
    localStorage.setItem(
      LOCAL_STORAGE_STORJ_SECRET_KEY,
      freeTrialStorjCreds.secret_key
    );
    localStorage.setItem(
      LOCAL_STORAGE_STORJ_ENDPOINT,
      freeTrialStorjCreds.endpoint
    );
  }
};

export const isFreeTrialStorj = () => {
  const isFreeTrialStorj =
    localStorage.getItem(LOCAL_STORAGE_STORJ_ACCESS_KEY) ===
      freeTrialStorjCreds.access_key &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_SECRET_KEY) ===
      freeTrialStorjCreds.secret_key &&
    localStorage.getItem(LOCAL_STORAGE_STORJ_ENDPOINT) ===
      freeTrialStorjCreds.endpoint;
  return isFreeTrialStorj;
};
