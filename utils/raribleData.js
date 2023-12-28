const { ethers } = require("hardhat");

// Helper function to get the bytes4 asset class from the asset type
function getAssetClass(assetType) {
  return ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes(assetType))
    .slice(0, 10);
}

// Order Types
const types = [
  "address",
  {
    type: "tuple",
    name: "makerAsset",
    components: [
      {
        name: "assetType",
        type: "tuple",
        components: [
          { name: "assetClass", type: "bytes4" },
          { name: "data", type: "bytes" },
        ],
      },
      { name: "value", type: "uint256" },
    ],
  },
  "address",
  {
    type: "tuple",
    name: "takerAsset",
    components: [
      {
        name: "assetType",
        type: "tuple",
        components: [
          { name: "assetClass", type: "bytes4" },
          { name: "data", type: "bytes" },
        ],
      },
      { name: "value", type: "uint256" },
    ],
  },
  "uint256",
  "uint256",
  "uint256",
  "bytes4",
  "bytes",
];

// Order data where ERC115 is received and ETH is sent
const orderErc1155InEthOutStruct = {
  maker: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // replace with actual address
  makeAsset: {
    assetType: {
      assetClass: getAssetClass("ETH"), // replace with actual bytes4
      data: "0x00", // replace with actual bytes
    },
    value: "1000000000000000000",
  },
  taker: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // replace with actual address
  takeAsset: {
    assetType: {
      assetClass: getAssetClass("ERC1155"), // replace with actual bytes4
      data: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        ["0x00000000219ab540356cBB839Cbe05303d7705Fa", 2]
      ), // replace with actual bytes
    },
    value: "8",
  },
  salt: ethers.BigNumber.from(
    "45118768841948961586167738353692277076075522015101619148498725069326976558864"
  ),
  start: ethers.BigNumber.from("1698643839"),
  end: ethers.BigNumber.from("1798843839"),
  dataType: "0x12345678",
  data: "0x00",
};

const orderErc1155InEthOut = [
  orderErc1155InEthOutStruct.maker,
  orderErc1155InEthOutStruct.makeAsset,
  orderErc1155InEthOutStruct.taker,
  orderErc1155InEthOutStruct.takeAsset,
  orderErc1155InEthOutStruct.salt,
  orderErc1155InEthOutStruct.start,
  orderErc1155InEthOutStruct.end,
  orderErc1155InEthOutStruct.dataType,
  orderErc1155InEthOutStruct.data,
];

// Order data where ERC20 is received and ERC1155 is sent
const orderERC20InERC1155OutStruct = {
  maker: "0x000075B45Dff84C00Cf597d5C3E766108CeA0000".toLowerCase(),
  makeAsset: {
    assetType: {
      assetClass: getAssetClass("ERC1155"),
      data: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        ["0x00000000219ab540356cBB839Cbe05303d7705Fa", 2]
      ),
    },
    value: "6",
  },
  taker: "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8".toLowerCase(),
  takeAsset: {
    assetType: {
      assetClass: getAssetClass("ERC20"),
      data: ethers.utils.defaultAbiCoder.encode(
        ["address"],
        ["0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"]
      ),
    },
    value: "10000000000000000000",
  },
  salt: ethers.BigNumber.from(
    "45118768841948961586167738353692277076075522015101619148498725069326976558864"
  ),
  start: ethers.BigNumber.from("1698643839"),
  end: ethers.BigNumber.from("1798843839"),
  dataType: "0x12345678",
  data: "0x00",
};

const orderERC20InERC1155Out = [
  orderERC20InERC1155OutStruct.maker,
  orderERC20InERC1155OutStruct.makeAsset,
  orderERC20InERC1155OutStruct.taker,
  orderERC20InERC1155OutStruct.takeAsset,
  orderERC20InERC1155OutStruct.salt,
  orderERC20InERC1155OutStruct.start,
  orderERC20InERC1155OutStruct.end,
  orderERC20InERC1155OutStruct.dataType,
  orderERC20InERC1155OutStruct.data,
];

// Order data where ETH is received and ERC721 is sent
const orderETHInERC721OutStruct = {
  maker: "0x000075B45Dff84C00Cf597d5C3E766108CeA0000".toLowerCase(),
  makeAsset: {
    assetType: {
      assetClass: getAssetClass("ERC721"),
      data: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 10]
      ),
    },
    value: "1",
  },
  taker: "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8".toLowerCase(),
  takeAsset: {
    assetType: {
      assetClass: getAssetClass("ETH"),
      data: "0x00",
    },
    value: "100000000000000000",
  },
  salt: ethers.BigNumber.from(
    "45118768841948961586167738353692277076075522015101619148498725069326976558864"
  ),
  start: ethers.BigNumber.from("1698643839"),
  end: ethers.BigNumber.from("1798843839"),
  dataType: "0x12345678",
  data: "0x00",
};

const orderETHInERC721Out = [
  orderETHInERC721OutStruct.maker,
  orderETHInERC721OutStruct.makeAsset,
  orderETHInERC721OutStruct.taker,
  orderETHInERC721OutStruct.takeAsset,
  orderETHInERC721OutStruct.salt,
  orderETHInERC721OutStruct.start,
  orderETHInERC721OutStruct.end,
  orderETHInERC721OutStruct.dataType,
  orderETHInERC721OutStruct.data,
];

Object.freeze(orderERC20InERC1155Out);
Object.freeze(orderErc1155InEthOut);
Object.freeze(orderETHInERC721Out);

module.exports = {
  orderErc1155InEthOut,
  orderERC20InERC1155Out,
  orderETHInERC721Out,
  types,
};
