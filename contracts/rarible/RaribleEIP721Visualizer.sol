// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../interface/IEIP721Visualizer.sol";

contract RaribleEIP712Visualizer is IEIP712Visualizer {
    bytes4 public constant ETH_ASSET_CLASS = bytes4(keccak256("ETH"));
    bytes4 public constant ERC20_ASSET_CLASS = bytes4(keccak256("ERC20"));
    bytes4 public constant ERC721_ASSET_CLASS = bytes4(keccak256("ERC721"));
    bytes4 public constant ERC1155_ASSET_CLASS = bytes4(keccak256("ERC1155"));

    bytes32 constant ASSET_TYPE_TYPEHASH =
        keccak256("AssetType(bytes4 assetClass,bytes data)");

    bytes32 constant ASSET_TYPEHASH =
        keccak256(
            "Asset(AssetType assetType,uint256 value)AssetType(bytes4 assetClass,bytes data)"
        );

    bytes32 public constant DOMAIN_SEPARATOR =
        0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7;

    struct AssetType {
        bytes4 assetClass;
        bytes data;
    }

    struct Asset {
        AssetType assetType;
        uint value;
    }

    struct Order {
        address maker;
        Asset makeAsset;
        address taker;
        Asset takeAsset;
        uint salt;
        uint start;
        uint end;
        bytes4 dataType;
        bytes data;
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

        return
            Result({
                assetsIn: buildAssetsIn(order),
                assetsOut: buildAssetsOut(order),
                liveness: Liveness({from: order.start, to: order.end})
            });
    }

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

        return assets;
    }

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

        return assets;
    }

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

        return assets;
    }

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
