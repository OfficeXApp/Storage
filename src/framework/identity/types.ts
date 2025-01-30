import { Ed25519PublicKey } from "@dfinity/identity";
import { Address } from "viem";
import { DriveFullFilePath } from "../drive/types";

export type CanisterID = string & { readonly __fileUUID: unique symbol };

export type UserID = string & { readonly __fileUUID: unique symbol };

export type TeamID = string & { readonly __fileUUID: unique symbol };
export type ApiKeyID = string & { readonly __fileUUID: unique symbol };
export type ApiKeyValue = string & { readonly __fileUUID: unique symbol };

export interface User {
  id: UserID;
  nickname: string;
  evmPublicAddress: Address;
  icpPrincipal: Ed25519PublicKey;
  apiKeys: ApiKeyID[];
  teams: TeamID[];
  sharedDrives: CanisterID[];
}

// Team structure
export interface Team {
  id: TeamID;
  name: string;
  owner: UserID;
  admins: Record<UserID, InviteMetadata>;
  members: Record<UserID, InviteMetadata>;
  createdAt: number;
  lastModifiedAt: number;
  canisterID: CanisterID;
}
export interface InviteMetadata {
  userID: UserID;
  invitedBy: UserID;
  invitedAt: number;
  role: TeamRole;
  activeFrom: number | null; // user set
  expiresAt: number | null; // user set
}

export enum TeamRole {
  MEMBER = "member", // Member of team
  ADMIN = "admin", // Can manage members
  OWNER = "owner", // Can manage admins
}

// API Key Management
// User in OfficeX can have multiple API Keys that can expire
export interface APIKeyMetadata {
  id: ApiKeyID;
  key: ApiKeyValue;
  userID: UserID;
  salt: string;
  nonce: number;
  name: string;
  createdAt: number;
  expiresAt: number | null;
  isRevoked: boolean;
}
