import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { parseWiwName, PreviewClient, WiwError } from "../dist/index.js";

test("WIW hostnames are canonicalized without inventing a registration", () => {
  assert.equal(parseWiwName("WIW.Example.COM"), "wiw.example.com");
  assert.equal(parseWiwName("wiw.store-1.example.test"), "wiw.store-1.example.test");
  assert.equal(parseWiwName("wiw.a.test"), "wiw.a.test");
});

test("malformed, ambiguous and non-WIW names are rejected", () => {
  const invalid = [
    "", "example.com", "www.example.com", "wiw", "wiw.shop", "wiw..com",
    "wiw.example.com.", " wiw.example.com", "wiw.example.com ",
    "https://wiw.example.com", "wiw.example.com/path", "wiw.example.com:443",
    "wiw.example.com@attacker.test", "wiw.example.com?query=x", "wiw.example.com#x",
    "wiw.example.com\\path", "wiw.example.com\n", "wiw.example.com\u0000",
    "wiw.127.0.0.1", "wiw.[::1]", "wiw._tcp.test", "wiw.-shop.test",
    "wiw.shop-.test", "wiw.example.c", "wiw.example.123", "wiw.*.test",
    "wiw.ex\u00e4mple.com", "wiw.xn--exmple-cua.com", "wiw.example.xn--p1ai",
    "wiw.example\u3002com", "wiw.%65xample.com", null, undefined, {}, 42,
  ];
  for (const input of invalid) {
    assert.throws(() => parseWiwName(input), { name: "WiwError", code: "INVALID_NAME" });
  }
});

test("label and hostname length limits are enforced at their exact boundaries", () => {
  const maxLabel = "a".repeat(63);
  assert.equal(parseWiwName(`wiw.${maxLabel}.test`), `wiw.${maxLabel}.test`);
  assert.throws(() => parseWiwName(`wiw.${"a".repeat(64)}.test`), { code: "INVALID_NAME" });
  const maxName = `wiw.${maxLabel}.${maxLabel}.${maxLabel}.${"a".repeat(57)}`;
  assert.equal(maxName.length, 253);
  assert.equal(parseWiwName(maxName), maxName);
  assert.throws(() => parseWiwName(`${maxName}a`), { code: "INVALID_NAME" });
});

test("all privileged operations fail closed and never call fetch", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("Preview unexpectedly used the network.");
  });
  const client = new PreviewClient();
  for (const proof of [new Uint8Array(), new Uint8Array([1, 2, 3])]) {
    await assert.rejects(client.verifyMembership(proof), {
      name: "WiwError",
      code: "IDENTITY_NOT_IMPLEMENTED",
    });
  }
  await assert.rejects(client.resolve("wiw.example.test"), { code: "NAMING_NOT_IMPLEMENTED" });
  await assert.rejects(client.connect("wiw.example.test"), { code: "NETWORK_NOT_IMPLEMENTED" });
  await assert.rejects(client.openInternetGateway(), { code: "GATEWAY_DISABLED" });
  assert.equal(fetch.mock.callCount(), 0);
});

test("resolve and connect use the same name validation and never rewrite www", async () => {
  const client = new PreviewClient();
  for (const name of ["www.example.com", "https://wiw.example.com", "wiw..test"]) {
    await assert.rejects(client.resolve(name), { code: "INVALID_NAME" });
    await assert.rejects(client.connect(name), { code: "INVALID_NAME" });
  }
});

test("errors expose a machine-readable code without echoing identity material", async () => {
  const error = new WiwError("GATEWAY_DISABLED", "Gateway disabled.");
  assert.ok(error instanceof Error);
  assert.equal(error.code, "GATEWAY_DISABLED");
  assert.equal(error.name, "WiwError");
  const syntheticMaterial = "synthetic-presentation-not-real-identity";
  await assert.rejects(
    new PreviewClient().verifyMembership(new TextEncoder().encode(syntheticMaterial)),
    (failure) => {
      assert.ok(failure instanceof WiwError);
      assert.equal(failure.code, "IDENTITY_NOT_IMPLEMENTED");
      assert.equal(failure.message.includes(syntheticMaterial), false);
      return true;
    },
  );
});

test("design profiles are disabled, not deployable network configurations", async () => {
  for (const name of ["wireguard", "gateway"]) {
    const url = new URL(`../profiles/${name}.preview.json`, import.meta.url);
    const profile = JSON.parse(await readFile(url, "utf8"));
    assert.equal(profile.status, "design-only");
    assert.equal(profile.enabled, false);
  }
  const gateway = JSON.parse(await readFile(new URL("../profiles/gateway.preview.json", import.meta.url), "utf8"));
  assert.equal(gateway.inbound, "deny");
  assert.equal(gateway.forwardMemberCredentials, false);
  assert.equal(gateway.dnsFallbackForWiw, false);
  assert.equal(gateway.tlsInterception, false);
});
