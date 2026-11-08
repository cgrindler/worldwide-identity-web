# Developer preview

This release is an offline reference scaffold for protocol and API discussion.
There is no enrollment service, browser, registry, testnet or gateway to deploy.

## Layout

- [`src/`](../src/): TypeScript name parser and denial-only client.
- [`crates/wiw-core/`](../crates/wiw-core/): independent Rust core stubs.
- [`profiles/`](../profiles/): disabled, design-only profiles, not executable
  WireGuard, firewall, or proxy configurations.
- [`examples/preview.ts`](../examples/preview.ts): offline demonstration.
- [`test/preview.test.mjs`](../test/preview.test.mjs): public API and profile tests.

There are no TypeScript-to-Rust bindings yet. Kotlin, Swift and Go bindings are
future work; do not represent them as available SDKs.

## Commands

With Node.js 24+ and npm:

```shell
npm ci
npm test
npm run demo
```

`npm test` builds declarations and JavaScript into the ignored `dist` directory
and runs Node's built-in test runner. `npm run demo` runs erasable TypeScript
directly using Node; no development web server or `tsx` is required.

With Rust stable and a platform linker:

```shell
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

Windows MSVC toolchains need the matching Visual Studio C++ build tools and
Windows SDK. `cargo check --workspace --all-targets` can type-check without
linking, but is not a replacement for running the tests.

## TypeScript example

```typescript
import { parseWiwName, PreviewClient, WiwError } from "./src/index.ts";

const name = parseWiwName("WIW.Example.test"); // syntax only
const client = new PreviewClient();

try {
  await client.resolve(name);
} catch (error) {
  if (!(error instanceof WiwError)) throw error;
  console.error(error.code, error.message);
}
```

`parseWiwName` accepts a hostname, not a URL. See the
[exact grammar and limits](adr/0001-network-first.md#4-names-and-origins).
It does not look up a host, check ownership, validate a trademark or authorize
the caller.

| API | Outcome in this preview |
| --- | --- |
| `parseWiwName(input)` | Lowercase ASCII hostname, or `INVALID_NAME` |
| `verifyMembership(presentation)` | Always `IDENTITY_NOT_IMPLEMENTED` |
| `resolve(name)` | `INVALID_NAME` or `NAMING_NOT_IMPLEMENTED` |
| `connect(name)` | `INVALID_NAME` or `NETWORK_NOT_IMPLEMENTED` |
| `openInternetGateway()` | Always `GATEWAY_DISABLED` |

These are typed exceptions, not success-shaped result objects. The example
prints expected denials; applications should propagate or visibly report them.
Never supply real passports, face images, biometrics or production credentials.

The Rust functions return explicit `Err(PreviewError::...)` for every call.
They do not provision peers or alter the host. Their interfaces are placeholders,
not a frozen wire protocol. An eventual implementation will require challenge,
audience and key bindings, expiry/revocation state and authenticated return types.

## Adding real capabilities

Do not replace a stub with a permissive fallback or a `verified: true` field.
First add the relevant reviewed protocol and failure cases to the ADR/spec,
then implementation and cross-client tests. Resolve these gates explicitly:

1. Issuer trust, holder binding, device keys, credential privacy and recovery.
2. Authentication of registry records, key rotation, name disputes and origins.
3. Admission-to-WireGuard key binding, peer leases, revocation and route isolation.
4. End-to-end service authentication independent of the transport peer.
5. Gateway destination policy, redirects, rebinding, egress isolation and quotas.

CI checks the scaffold only. Passing it is not protocol verification, a security
audit, or authorization to deploy a real identity system.
