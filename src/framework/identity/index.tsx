/**
 * @module identity
 *
 * Handles creation of anonymous identity via evm wallet
 */
import { CONSTANTS, ONBOARDING_CHECKPOINTS } from "./constants";
import { createDefaultAnonEVMIdentity } from "./evm-auth";
import { IdentityProvider, useIdentity } from "./identity.provider";

export default {
  createDefaultAnonEVMIdentity,
  IdentityProvider,
  useIdentity,
  CONSTANTS,
  ONBOARDING_CHECKPOINTS,
};
