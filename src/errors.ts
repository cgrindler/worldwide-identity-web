export type WiwErrorCode =
  | "INVALID_NAME"
  | "NAMING_NOT_IMPLEMENTED"
  | "IDENTITY_NOT_IMPLEMENTED"
  | "NETWORK_NOT_IMPLEMENTED"
  | "GATEWAY_DISABLED";

export class WiwError extends Error {
  readonly code: WiwErrorCode;

  constructor(code: WiwErrorCode, message: string) {
    super(message);
    this.name = "WiwError";
    this.code = code;
  }
}
