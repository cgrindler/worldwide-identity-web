# Contributing to WIW

The project is a design and offline developer preview. Contributions from
web/app developers, network engineers and identity/privacy researchers are
welcome. Start with the [architecture decision](docs/adr/0001-network-first.md)
and [preview guide](docs/developer-preview.md).

## Proposing a change

1. Open a GitHub issue describing the problem, assumptions, alternatives and
   expected effect on privacy, interoperability and abuse handling.
2. For protocol or security-boundary changes, obtain design review before
   implementation. Do not invent cryptography or default to allowing access.
3. Make focused changes with tests. Keep unfinished capabilities visibly
   disabled and errors explicit.
4. Run `npm test` and `npm run demo`. For Rust changes also run
   `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`
   and `cargo test --workspace`.
5. Update the directly affected documentation and submit a pull request.

Do not use real passports, biometric material, identity credentials or private
keys as fixtures. Use synthetic data with no personal information.
Do not claim audits, certification, uniqueness, legal compliance or anonymity
without evidence for the specific property.

Read [contributor terms](CLA.md), [licensing/IP policy](docs/ip-policy.md)
and the [code of conduct](CODE_OF_CONDUCT.md). Disclose third-party sources,
licenses and any generated material that affects review or provenance.

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md),
not in public issues containing exploit details or personal data.
