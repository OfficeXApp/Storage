import { Ed25519PublicKey } from "@dfinity/identity";
import { Address } from "viem";

export type UserID = string & { readonly __fileUUID: unique symbol };
export type UserNickname = string;

export interface User {
  id: UserID;
  nickname: UserNickname;
  evmPublicAddress: Address;
  icpPrincipal: Ed25519PublicKey;
}
