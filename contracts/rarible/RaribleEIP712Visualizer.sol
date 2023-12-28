// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../interface/IEIP712Visualizer.sol";

/**
 * @title RaribleEIP712Visualizer
 * @author @gabrielantonyxaviour
 * @dev This contract is used to visualize EIP-712 messages for Rarible protocol.
 * It decodes the encoded message and returns a more readable format.
 */
contract RaribleEIP712Visualizer is IEIP712Visualizer {
    bytes4 public constant ETH_ASSET_CLASS = bytes4(keccak256("ETH")); ///< Asset class for ETH
    bytes4 public constant ERC20_ASSET_CLASS = bytes4(keccak256("ERC20")); ///< Asset class for ERC20
    bytes4 public constant ERC721_ASSET_CLASS = bytes4(keccak256("ERC721")); ///< Asset class for ERC721
    bytes4 public constant ERC1155_ASSET_CLASS = bytes4(keccak256("ERC1155")); ///< Asset class for ERC1155

    bytes32 constant ASSET_TYPE_TYPEHASH =
        keccak256("AssetType(bytes4 assetClass,bytes data)"); ///< EIP-712 type hash for AssetType

    bytes32 constant ASSET_TYPEHASH =
        keccak256(
            "Asset(AssetType assetType,uint256 value)AssetType(bytes4 assetClass,bytes data)"
        ); ///< EIP-712 type hash for Asset

    bytes32 public constant DOMAIN_SEPARATOR =
        0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7; ///< EIP-712 domain separator hash

    // @dev Struct representing an Asset Type in the Rarible protocol.
    struct AssetType {
        bytes4 assetClass;
        bytes data;
    }

    // @dev Struct representing an Asset in the Rarible protocol.
    struct Asset {
        AssetType assetType;
        uint256 value;
    }

    // @dev Struct representing an Order in the Rarible protocol.
    struct Order {
        address maker;
        Asset makeAsset;
        address taker;
        Asset takeAsset;
        uint256 salt;
        uint256 start;
        uint256 end;
        bytes4 dataType;
        bytes data;
    }

    constructor() {}

    /**
     * @notice Visualizes an EIP-712 message by decoding it and returning a more readable format.
     * @param encodedMessage The encoded bytes data of the EIP-712 message to be decoded.
     * @param domainHash The domain hash of the EIP-712 message.
     * @return Result containing the decoded information.
     */
    function visualizeEIP712Message(
        bytes memory encodedMessage,
        bytes32 domainHash
    ) external view returns (Result memory) {
        require(
            domainHash == DOMAIN_SEPARATOR,
            "RaribleEIP712Visualizer: unsupported domain"
        );

        Order memory order = abi.decode(encodedMessage, (Order));

        return
            Result({
                assetsIn: buildAssetsIn(order),
                assetsOut: buildAssetsOut(order),
                liveness: Liveness({from: order.start, to: order.end})
            });
    }

    /**
     * @notice Builds the UserAssetMovement array for the assets that are received in the order.
     * @param order The decoded order from the EIP-712 message.
     * @return UserAssetMovement array containing the assets that are received in the order.
     */
    function buildAssetsIn(
        Order memory order
    ) internal pure returns (UserAssetMovement[] memory) {
        if (order.takeAsset.assetType.assetClass == ETH_ASSET_CLASS) {
            return buildETHAsset(order.takeAsset);
        } else if (order.takeAsset.assetType.assetClass == ERC20_ASSET_CLASS) {
            return buildERC20Asset(order.takeAsset);
        } else if (order.takeAsset.assetType.assetClass == ERC721_ASSET_CLASS) {
            return buildERC721Asset(order.takeAsset);
        } else if (
            order.takeAsset.assetType.assetClass == ERC1155_ASSET_CLASS
        ) {
            return buildERC1155Asset(order.takeAsset);
        } else {
            revert("Unsupported asset class");
        }
    }

    /**
     * @notice Builds the UserAssetMovement array for the assets that are sent in the order.
     * @param order The decoded order from the EIP-712 message.
     * @return UserAssetMovement array containing the assets that are sent in the order.
     */
    function buildAssetsOut(
        Order memory order
    ) internal pure returns (UserAssetMovement[] memory) {
        if (order.makeAsset.assetType.assetClass == ETH_ASSET_CLASS) {
            return buildETHAsset(order.makeAsset);
        } else if (order.makeAsset.assetType.assetClass == ERC20_ASSET_CLASS) {
            return buildERC20Asset(order.makeAsset);
        } else if (order.makeAsset.assetType.assetClass == ERC721_ASSET_CLASS) {
            return buildERC721Asset(order.makeAsset);
        } else if (
            order.makeAsset.assetType.assetClass == ERC1155_ASSET_CLASS
        ) {
            return buildERC1155Asset(order.makeAsset);
        } else {
            revert("Unsupported asset class");
        }
    }

    /**
     * @notice Builds the UserAssetMovement array for the ERC721 asset.
     * @param asset The decoded asset from the EIP-712 message.
     * @return assets UserAssetMovement array containing the ERC721 asset.
     */
    function buildERC721Asset(
        Asset memory asset
    ) internal pure returns (UserAssetMovement[] memory assets) {
        (address tokenAddress, uint tokenId) = abi.decode(
            asset.assetType.data,
            (address, uint256)
        );

        assets = new UserAssetMovement[](1);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;
        assets[0] = UserAssetMovement({
            assetTokenAddress: tokenAddress,
            id: tokenId,
            amounts: amounts
        });

    }

    /**
     * @notice Builds the UserAssetMovement array for the ERC20 asset.
     * @param asset The decoded asset from the EIP-712 message.
     * @return assets UserAssetMovement array containing the ERC20 asset.
     */
    function buildERC20Asset(
        Asset memory asset
    ) internal pure returns (UserAssetMovement[] memory assets) {
        address tokenAddress = abi.decode(asset.assetType.data, (address));

        assets = new UserAssetMovement[](1);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = asset.value;
        assets[0] = UserAssetMovement({
            assetTokenAddress: tokenAddress,
            id: 0,
            amounts: amounts
        });

    }

    /**
     * @notice Builds the UserAssetMovement array for the ERC1155 asset.
     * @param asset The decoded asset from the EIP-712 message.
     * @return assets UserAssetMovement array containing the ERC1155 asset.
     */
    function buildERC1155Asset(
        Asset memory asset
    ) internal pure returns (UserAssetMovement[] memory assets) {
        (address tokenAddress, uint tokenId) = abi.decode(
            asset.assetType.data,
            (address, uint256)
        );

        assets = new UserAssetMovement[](1);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = asset.value;
        assets[0] = UserAssetMovement({
            assetTokenAddress: tokenAddress,
            id: tokenId,
            amounts: amounts
        });

    }

    /**
     * @notice Builds the UserAssetMovement array for the ETH asset.
     * @param asset The decoded asset from the EIP-712 message.
     * @return assets UserAssetMovement array containing the ETH asset.
     */
    function buildETHAsset(
        Asset memory asset
    ) internal pure returns (UserAssetMovement[] memory assets) {
        assets = new UserAssetMovement[](1);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = asset.value;
        assets[0] = UserAssetMovement({
            assetTokenAddress: address(0),
            id: 0,
            amounts: amounts
        });
    }
}
