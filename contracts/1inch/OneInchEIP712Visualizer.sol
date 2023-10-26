// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../interface/IEIP721Visualizer.sol";

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

    struct Order {
        uint256 salt;
        address makerAsset;
        address takerAsset;
        address maker;
        address receiver;
        address allowedSender;
        uint256 makingAmount;
        uint256 takingAmount;
        uint256 offsets;
        bytes interactions;
    }

    constructor() {}

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

    function getStartTime(uint256 salt) internal pure returns (uint256) {
        return (salt & _TIME_START_MASK) >> _TIME_START_SHIFT;
    }

    function getDuration(uint256 salt) internal pure returns (uint256) {
        return (salt & _DURATION_MASK) >> _DURATION_SHIFT;
    }

    function getInitialRateBump(uint256 salt) internal pure returns (uint256) {
        return (salt & _INITIAL_RATE_BUMP_MASK) >> _INITIAL_RATE_BUMP_SHIFT;
    }

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
