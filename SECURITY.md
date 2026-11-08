# Security policy

## Supported scope

This is an experimental, offline preview. It must not be used to protect real
identity documents, enroll real people, operate a VPN or gateway, or decide
production access. No version is production-supported or independently audited.
Security fixes are developed on the default branch.

Explicit denial is intentional: changing an unimplemented path into a simulated
success can create a security bug even if no live network is present.

## Reporting

Use GitHub's **Security > Report a vulnerability** on this repository when
private vulnerability reporting is enabled. Include the affected commit,
reproduction steps, impact and a minimal synthetic example.

If that private channel is unavailable, contact the maintainer using a private
method on their GitHub profile, or open a public issue requesting a private
channel **without technical exploit details**. Do not publish sensitive reports
in ordinary issues or disclose them through unrelated services.

Never attach passports, face images, private keys, live credentials or personal
records. The project makes no guaranteed response-time or bounty commitment.

## Production gates

The [ADR](docs/adr/0001-network-first.md) records threat assumptions and
unresolved decisions. A live implementation requires reviewed credential
bindings, replay/expiry/revocation behavior, native-origin isolation, naming
integrity, network segmentation, gateway destination validation, privacy review
and incident recovery. Passing scaffold tests does not establish those properties.
