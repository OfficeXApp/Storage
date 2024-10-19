import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'Ok' : string } |
  { 'Err' : string };
export interface _SERVICE {
  'create_drive' : ActorMethod<[string], Result>,
  'get_canister_balance' : ActorMethod<[], bigint>,
  'get_drive_by_index' : ActorMethod<[bigint], [] | [string]>,
  'get_total_drives' : ActorMethod<[], bigint>,
  'get_user_drive' : ActorMethod<[], [] | [string]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
