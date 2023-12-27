// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC6865Registry
 * @dev This contract is used to store EIP-6865 implementations for different protocols by domain separator.
 */
contract ERC6865Registry is Ownable {
    // Mapping to store EIP-6865 implementations for different protocols by domain separator
    mapping(bytes32 => address) private implementations;

    /**
     * @dev Emitted when a new EIP-6865 implementation is registered.
     */
    event ImplementationAdded(
        bytes32 indexed domainSeparator,
        address implementation
    );

    /**
     * @dev Add or update a EIP-6865 implementation for a specific protocol.
     * @param domainSeparator The protocol domain separator.
     * @param implementation The address of the EIP-6865 implementation contract.
     */
    function addImplementation(
        bytes32 domainSeparator,
        address implementation
    ) external onlyOwner {
        // Ensure the implementation address is valid
        require(implementation != address(0), "Invalid implementation address");

        // Register the new implementation
        implementations[domainSeparator] = implementation;

        // Emit an event to log the registration
        emit ImplementationAdded(domainSeparator, implementation);
    }

    /**
     * @dev Returns the EIP-6865 implementation for a specific protocol.
     * @param domainSeparator The protocol domain separator.
     * @return The address of the EIP-6865 implementation contract.
     */
    function getImplementation(
        bytes32 domainSeparator
    ) external view returns (address) {
        return implementations[domainSeparator];
    }
}
