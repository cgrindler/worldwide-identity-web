import { WiwError } from "./errors.ts";
import { parseWiwName } from "./naming.ts";

export { WiwError, type WiwErrorCode } from "./errors.ts";
export { parseWiwName } from "./naming.ts";

export class PreviewClient {
  async verifyMembership(_presentation: Uint8Array): Promise<never> {
    throw new WiwError(
      "IDENTITY_NOT_IMPLEMENTED",
      "No membership verifier exists in this preview. Do not provide real identity data.",
    );
  }

  async resolve(name: string): Promise<never> {
    parseWiwName(name);
    throw new WiwError(
      "NAMING_NOT_IMPLEMENTED",
      "Authenticated WIW resolution is not implemented. DNS fallback is forbidden.",
    );
  }

  async connect(name: string): Promise<never> {
    parseWiwName(name);
    throw new WiwError(
      "NETWORK_NOT_IMPLEMENTED",
      "No WIW network connection or WireGuard peer has been provisioned.",
    );
  }

  async openInternetGateway(): Promise<never> {
    throw new WiwError("GATEWAY_DISABLED", "The transition gateway is disabled in this preview.");
  }
}
