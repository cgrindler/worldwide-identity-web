import { WiwError } from "./errors.ts";

const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function parseWiwName(input: string): string {
  if (typeof input !== "string" || input.length > 253 || !/^[\x21-\x7e]+$/.test(input)) {
    throw new WiwError("INVALID_NAME", "Expected an ASCII hostname of at most 253 characters.");
  }

  const name = input.toLowerCase();
  const labels = name.split(".");
  const lastLabel = labels.at(-1);
  if (
    labels.length < 3 ||
    labels[0] !== "wiw" ||
    lastLabel === undefined ||
    !/^[a-z]{2,63}$/.test(lastLabel) ||
    labels.some((label) => !labelPattern.test(label) || label.startsWith("xn--"))
  ) {
    throw new WiwError(
      "INVALID_NAME",
      "Expected wiw.<domain>, without a URL, port, path, trailing dot or internationalized labels.",
    );
  }

  return name;
}
