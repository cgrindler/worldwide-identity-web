//! Offline preview only. No credentials are verified and no network state is changed.

use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PreviewError {
    IdentityNotImplemented,
    NetworkNotImplemented,
    GatewayDisabled,
}

impl fmt::Display for PreviewError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        let message = match self {
            Self::IdentityNotImplemented => "membership verification is not implemented",
            Self::NetworkNotImplemented => "WireGuard peer provisioning is not implemented",
            Self::GatewayDisabled => "the transition gateway is disabled",
        };
        formatter.write_str(message)
    }
}

impl std::error::Error for PreviewError {}

pub fn verify_membership(_presentation: &[u8]) -> Result<(), PreviewError> {
    Err(PreviewError::IdentityNotImplemented)
}

pub fn provision_wireguard_peer(_public_key: &[u8; 32]) -> Result<(), PreviewError> {
    Err(PreviewError::NetworkNotImplemented)
}

pub fn open_transition_gateway() -> Result<(), PreviewError> {
    Err(PreviewError::GatewayDisabled)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn no_presentation_is_accepted() {
        for presentation in [&[][..], &[1, 2, 3][..], &[0; 128][..]] {
            assert_eq!(
                verify_membership(presentation),
                Err(PreviewError::IdentityNotImplemented)
            );
        }
    }

    #[test]
    fn no_peer_can_be_provisioned() {
        for key in [[0; 32], [1; 32], [255; 32]] {
            assert_eq!(
                provision_wireguard_peer(&key),
                Err(PreviewError::NetworkNotImplemented)
            );
        }
    }

    #[test]
    fn gateway_cannot_be_opened() {
        assert_eq!(
            open_transition_gateway(),
            Err(PreviewError::GatewayDisabled)
        );
    }

    #[test]
    fn error_messages_are_explicit() {
        assert_eq!(
            PreviewError::IdentityNotImplemented.to_string(),
            "membership verification is not implemented"
        );
    }
}
