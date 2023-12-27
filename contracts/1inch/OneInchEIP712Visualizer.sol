// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../interface/IEIP712Visualizer.sol";

/**
 * @title OneInchEIP712Visualizer
 * @dev This contract is used to visualize EIP-712 messages for 1inch protocol.
 * It decodes the encoded message and returns a more readable format.
 * Functions are based in the @1inch/fusion-sdk library.
 * The main part of the encoded message is the salt which encapsulates:
 * - auction start time
 * - duration of an auction
 * - initial rate bump
 * - taker fee
 * - salt (optional parameter to control entropy)
 */
contract OneInchEIP712Visualizer is IEIP712Visualizer {
    bytes32 public constant DOMAIN_SEPARATOR =
        0xb50c8913581289bd2e066aeef89fceb9615d490d673131fd1a7047436706834e; //v1.1
    uint256 private constant _TIME_START_MASK =
        0xFFFFFFFF00000000000000000000000000000000000000000000000000000000;
    uint256 private constant _DURATION_MASK =
        0x00000000FFFFFF00000000000000000000000000000000000000000000000000;
    uint256 private constant _INITIAL_RATE_BUMP_MASK =
        0x00000000000000FFFFFF00000000000000000000000000000000000000000000;
    uint256 private constant _TIME_START_SHIFT = 224; // orderTimeMask 224-255
    uint256 private constant _DURATION_SHIFT = 200; // durationMask 200-223
    uint256 private constant _INITIAL_RATE_BUMP_SHIFT = 176; // initialRateMask 176-200

    /**
     * @dev Struct representing an order in the 1inch protocol.
     */
    struct Order {
        uint256 salt; ///< Encapsulates the auction start time, duration, initial rate bump, taker fee and an optional salt
        address makerAsset; ///< The address of the asset the limit order creator wants to sell (address of a token contract)
        address takerAsset; ///< The address of the asset the limit order creator wants to buy (address of a token contract)
        address maker; ///< The address of the limit order creator
        address receiver; ///< By default contains a zero address, which means that taker asset will be sent to the address of the creator of the limit order. Otherwise, then taker asset will be sent to the specified address
        address allowedSender; ///< By default contains a zero address, which means that a limit order is available for everyone to fill. Otherwise, the limit order will be available for execution only for the specified address (private limit order)
        uint256 makingAmount; ///< Amount of maker asset
        uint256 takingAmount; ///< Amount of taker asset
        uint256 offsets; ///< Every 32's bytes represents offset of the n'ths interaction
        bytes interactions; ///< Hex bytes string with interactions meta fields concat(makerAssetData, takerAssetData, getMakingAmount, getTakingAmount, predicate, permit, preIntercation, postInteraction)
    }

    constructor() {}

    /**
     * @dev Visualizes an EIP-712 message by decoding it and returning a more readable format.
     * @param encodedMessage The encoded EIP-712 message.
     * @param domainHash The domain hash of the EIP-712 message.
     * @return A Result struct containing the decoded information.
     */
    function visualizeEIP712Message(
        bytes memory encodedMessage,
        bytes32 domainHash
    ) external view returns (Result memory) {
        require(
            domainHash == DOMAIN_SEPARATOR,
            "1inchEIP712Visualizer: unsupported domain"
        );

        Order memory order = abi.decode(encodedMessage, (Order));

        uint256 startTime = getStartTime(order.salt);
        uint256 endTime = startTime + getDuration(order.salt);

        return
            Result({
                assetsIn: buildAssetsIn(order),
                assetsOut: buildAssetsOut(order),
                liveness: Liveness({from: startTime, to: endTime})
            });
    }

    /**
     * @dev Extracts the start time from the salt.
     * @param salt The salt from the order.
     * @return The start time of the auction as a Unix timestamp.
     */
    function getStartTime(uint256 salt) internal pure returns (uint256) {
        return (salt & _TIME_START_MASK) >> _TIME_START_SHIFT;
    }

    /**
     * @dev Extracts the duration from the salt.
     * @param salt The salt from the order.
     * @return The duration of the auction in seconds.
     */
    function getDuration(uint256 salt) internal pure returns (uint256) {
        return (salt & _DURATION_MASK) >> _DURATION_SHIFT;
    }

    /**
     * @dev Extracts the initial rate bump from the salt.
     * @param salt The salt from the order.
     * @return The initial rate bump for the auction.
     */
    function getInitialRateBump(uint256 salt) internal pure returns (uint256) {
        return (salt & _INITIAL_RATE_BUMP_MASK) >> _INITIAL_RATE_BUMP_SHIFT;
    }

    /**
     * @notice Builds the assetsIn array from the order.
     * @dev 
     * The function first calculates the maximum taking amount by adding the initial rate bump to the taking amount.
     * It then creates a UserAssetMovement struct for the taker asset with the calculated amounts.
     * A value of 10000000 corresponds to a 100% rate bump.
     * The function returns an array of UserAssetMovement structs representing the assets in the order.
     * @param order The order.
     * @return The assetsIn array.
     */
    function buildAssetsIn(
        Order memory order
    ) internal pure returns (UserAssetMovement[] memory) {
        uint256 maxTakingAmount = (order.takingAmount *
            (10000000 + getInitialRateBump(order.salt))) / 10000000;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = maxTakingAmount;
        amounts[1] = order.takingAmount;
        UserAssetMovement[] memory assetsIn = new UserAssetMovement[](1);
        assetsIn[0] = UserAssetMovement({
            assetTokenAddress: order.takerAsset,
            id: 0,
            amounts: amounts
        });
        return assetsIn;
    }

    /**
     * @dev Builds the assetsOut array from the order.
     * @param order The order.
     * @return The assetsOut array.
     */
    function buildAssetsOut(
        Order memory order
    ) internal pure returns (UserAssetMovement[] memory) {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = order.makingAmount;
        UserAssetMovement[] memory assetsOut = new UserAssetMovement[](1);
        assetsOut[0] = UserAssetMovement({
            assetTokenAddress: order.makerAsset,
            id: 0,
            amounts: amounts
        });
        return assetsOut;
    }
}

