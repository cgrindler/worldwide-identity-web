import { parseWiwName, PreviewClient, WiwError } from "../src/index.ts";

const name = parseWiwName("WIW.Example.test");
console.log(`Worldwide Identity Web | offline preview\nAddress syntax: ${name}`);

const client = new PreviewClient();
const operations = [
  () => client.verifyMembership(new Uint8Array()),
  () => client.resolve(name),
  () => client.connect(name),
  () => client.openInternetGateway(),
];

for (const operation of operations) {
  try {
    await operation();
    throw new Error("A preview stub unexpectedly succeeded.");
  } catch (error) {
    if (!(error instanceof WiwError) || error.code === "INVALID_NAME") {
      throw error;
    }
    console.log(`${error.code}: ${error.message}`);
  }
}

console.log("No identity verified, DNS query sent, tunnel opened or internet traffic forwarded.");
