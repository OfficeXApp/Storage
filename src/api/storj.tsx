import {
  LOCAL_STORAGE_STORJ_ACCESS_KEY,
  LOCAL_STORAGE_STORJ_ENDPOINT,
  LOCAL_STORAGE_STORJ_SECRET_KEY,
} from "@officexapp/framework";
import { notification } from "antd";
import { Link } from "react-router-dom";

export const freeTrialStorjCreds = {
  access_key: "jwu43kry2lja5z27c5mwfwxxkvea",
  secret_key: "j37zrkuw7e2rvxywqmidx6gcmqf64brxygvbqhgiaotcfv47telme",
  endpoint: "https://gateway.storjshare.io",
};

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
