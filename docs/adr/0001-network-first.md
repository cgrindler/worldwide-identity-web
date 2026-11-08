# ADR-0001: Identity-gated network, separate control plane and transition boundary

- Status: direction approved; protocol details and production deployment pending
- Architecture revision: 0.4, clarifying the earlier conceptual 0.3 diagram
- Project: Worldwide Identity Web (WIW)

## Context and decision

WIW is intended to be an alternative network, not just another application or
identity provider on today's web. It has a distinct membership boundary,
namespace and service-routing policy. Its first phase would borrow the existing
internet as an underlay, just as other overlay networks do. Separate physical
infrastructure is not required for a separate logical network, but the preview
would still depend on underlay providers and remain vulnerable to their outages
and traffic analysis.

Adopt defense in depth, not an assertion that any configuration is "most secure."
WireGuard provides authenticated encrypted transport between peer keys; it does
not verify people or applications. Reuse an unmodified implementation rather
than invent a new WireGuard-derived cipher suite or packet format.

No lower OSI layer can supply human identity. L1/L2 measures such as MACsec are
useful on operator-owned links, not a substitute for application authorization.
SCION and independent peering remain later research/interoperability options,
not existing WIW features.

## Architecture

See the [vector diagram](../architecture.svg). It describes a target system;
only offline parsing and denial stubs are implemented.

### 1. Enrollment and credential plane

The proposed enrollment uses supported NFC identity documents, issuer trust
anchors and document-signature validation. Chip/active authentication is
conditional on document support. Holder binding, liveness, revocation and
renewal require their own protocols and assessment; a locally reported match
is not trustworthy merely because it ran on the user's device.

An eventual credential should reveal only the attributes needed by a verifier.
Selective disclosure, unlinkability, key binding and revocation are distinct
properties. BBS, SD-JWT and zero-knowledge passport systems are candidates with
different tradeoffs, not interchangeable ready-made guarantees.

Enrollment should not require rescanning the passport at every connection.
Later logins prove possession of a credential-bound key; periodic renewal,
recovery and re-enrollment may still be necessary. Credentials cannot safely
remain valid forever after a single passport scan.

Multiple passports, document replacement and malicious issuers defeat a simple
"one passport = one human" assumption. Deduplication scope and recovery remain
open. No global unique-human guarantee is made.

Hardware-backed keys can reduce extraction; compromised devices can still use
them, relay authentication or share sessions. Attestation raises accessibility,
platform-exclusion and tracking risks. It is not an implemented requirement.

### 2. Federation and network control plane

Reviewed operators would run admission controllers, registry replicas and
routers. Admission must bind a fresh credential presentation to the requesting
device key, challenge and intended audience before provisioning a short-lived,
service-scoped peer lease.

Controls must support expiry, revocation, key rotation, replay rejection, route
isolation and fail-closed behavior on stale control-plane state. WireGuard has
no built-in certificate-expiry mechanism; a controller must actually remove
expired peers and routes. Service authentication remains required even when a
peer is reachable.

Routers should enforce authenticated peer/flow state and authorization, not
perform passport or zero-knowledge verification for every packet. An operator
or threshold root still represents trust. Root rotation, quorum independence,
compromise recovery and federation policy require a specification.

### 3. Native data plane and services

Use an overlay-local address allocation plan with collision handling; it does
not reserve globally routable address space. Restrict lateral reachability and
scope routes to approved services. A WireGuard tunnel is not authorization.

Protect client-to-service traffic end-to-end using established TLS/QUIC
implementations, service-key validation and reviewed application/session
binding. Tunnel endpoints must not automatically receive plaintext or global
member identifiers. Do not expose a stable personal TLS certificate across
all sites while also claiming unlinkability.

HTTP stacks can be reused behind a WIW-aware client/service node. Existing
browsers and apps are not automatically compatible: registry trust, origin
isolation, certificate handling and client integration still need engineering.

WireGuard's optional pre-shared key can add a symmetric component, but securely
distributing and rotating it is a separate problem. Post-quantum key exchange,
onion routing and formal protocol verification remain research gates. No
post-quantum security or metadata anonymity is claimed for this preview.

### 4. Names and origins

Every native site is intended to be addressed as `wiw.<domain>`. Registration
requires an authenticated mapping of name, service key, operator and lifecycle
metadata. A human-readable name is **not self-certifying**: a signature proves
what its signer said, not that the signer owns the name.

The client must validate the registry trust chain, freshness, key rotation and
relevant log evidence. Missing or invalid records cause explicit failure,
never a downgrade to public DNS, an internet gateway, or a guessed hostname.

The `wiw` prefix is not reserved in DNS. An ordinary browser may reach a
completely unrelated public site with that hostname. WIW mode, certificate
trust, cookies, storage and application origins must be isolated from ordinary
browsing. A browser extension alone may not provide sufficient isolation.

Domain-control checks could bootstrap a name claim, but neither DNS control nor
identity verification proves trademark rights. New names, transfer, expirations,
confusables, disputes and appeals need a registration policy. No automated name
claiming or DNS configuration is included here.

The syntax-only preview accepts ASCII hostnames up to 253 characters, labels
up to 63 characters, `wiw.` followed by at least two labels, and an alphabetic
final label of 2-63 characters. It lowercases ASCII. URLs, paths, ports,
whitespace, IP literals, trailing dots, Unicode and `xn--` labels are rejected.
IDNs and short native-only names await a separately reviewed naming policy.
`example.test` in demonstrations is a fixture, not a registration.

### 5. Transition gateway

The gateway is an explicit side boundary, not a layer through which all native
traffic must flow. It starts disabled.

- **Outbound:** only admitted clients, explicit destination/protocol policy and
  isolated egress. Preserve end-to-end HTTPS; do not install a TLS interception
  root. Block internal, loopback, link-local, metadata and overlay destinations;
  defend DNS rebinding and revalidate redirects/resolution before every
  connection. These are future implementation requirements, not implemented
  filters in the JSON profile.
- **Inbound:** deny by default. Optional public mirrors use a separate origin,
  isolated identity and least-privilege publishing path; never expose a native
  service's private routes through an unrestricted reverse proxy.
- **Identity:** do not forward WIW credentials or fabricate a member identity
  for outside visitors. Internet responses remain untrusted. A site may still
  recognize users through cookies, accounts or fingerprinting.
- **Bootstrap:** a separate public onboarding/download surface may be reachable
  without membership. It cannot grant membership without the enrollment checks.
- **Operations:** resource quotas, upstream DDoS coordination, auditable operator
  policy, bounded privacy-preserving logs and explicit retirement criteria.

Opaque end-to-end TLS prevents gateway payload inspection. Malware scanning of
encrypted content is not promised. Admission and rate limits cannot prevent an
attacker from saturating underlay links.

### 6. Governance and privacy

Define trust-anchor governance, incident response, operator review, service
abuse handling, device/account recovery, appeals and policy change procedures.
Log public infrastructure keys and registry events where appropriate, **not
passport details, biometrics, personal nullifiers or browsing histories**.
Even infrastructure transparency can reveal service relationships; review it.

The earlier diagram combined unlinkable credentials with court-ordered
"unmasking." That capability does not arise automatically. An identity-opening
scheme requires retained linkage/escrow and introduces a different trust and
privacy model. It is unresolved and is **not implemented or claimed**. Resolve
it explicitly before enrolling real participants.

On-device processing is a minimization goal, not a guarantee of GDPR compliance
or of absence of personal-data processing. Biometric holder verification needs
jurisdiction-specific legal assessment, a lawful basis, retention decisions and
where applicable a DPIA. No production compliance claim is made.

## Threat assumptions and limits

| Threat | Proposed control / remaining limit |
| --- | --- |
| Verified malicious member | Service authorization, quotas, revocation and appeals; identity is not good intent |
| Stolen or relayed credential | Key binding, freshness and device revocation; an unlocked compromised endpoint remains dangerous |
| Compromised issuer/operator | Federation policy, audits, key rotation and independent oversight; collusion remains possible |
| Naming downgrade/phishing | Authenticated resolution, fail closed, visible mode and origin separation |
| Gateway SSRF or lateral movement | No live proxy in preview; isolated, destination-checked egress required later |
| Mass traffic analysis | Minimize identifiers and logs; WireGuard is not an anonymity network |
| Multi-document enrollment | No global uniqueness guarantee; define deduplication and recovery policy |
| Control-plane outage | Expiring leases and explicit failures, not indefinite cached access |
| Underlay flood or censorship | External network mitigations; no cryptographic guarantee of availability |

## Consequences and implementation gate

This is more complex than an ordinary VPN or login SDK. It requires native
client integration, registry and federation protocols, operator participation,
and organizational governance. Applications still need ordinary security.

The approved initial implementation is deliberately a scaffold: no cryptography
invented, no production identity collection, no default allow, no automatic
public-DNS fallback, and no "verified" flag supplied by an untrusted caller.
The SDK has no transport injection that can silently promote fake data.

Before a real testnet: finalize messages, cryptographic bindings, freshness,
revocation and recovery semantics; implement adversarial test vectors; design
client isolation and gateway policy; then obtain independent review.

## References

- [WireGuard protocol and optional PSK](https://www.wireguard.com/protocol/)
- [NIST SP 800-207: Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)
- [ICAO Doc 9303](https://www.icao.int/publications/pages/publication.aspx?docnum=9303)
- [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [RFC 9334: Remote ATtestation procedureS architecture](https://www.rfc-editor.org/rfc/rfc9334)
- [SCION architecture](https://docs.scion.org/en/latest/architecture/overview.html)

References are building blocks, not endorsements, certifications or claims of
WIW interoperability.
