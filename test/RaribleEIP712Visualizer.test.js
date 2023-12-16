const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RaribleEIP712Visualizer", function () {
  let RaribleEIP712Visualizer;
  const DOMAIN_SEPARATOR =
    "0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7";
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
  const orderErc1155InEthOutStruct = {
    maker: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // replace with actual address
    makeAsset: {
      assetType: {
        assetClass: ethers.utils
          .keccak256(ethers.utils.toUtf8Bytes("ETH"))
          .slice(0, 10), // replace with actual bytes4
        data: "0x00", // replace with actual bytes
      },
      value: "1000000000000000000",
    },
    taker: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // replace with actual address
    takeAsset: {
      assetType: {
        assetClass: ethers.utils
          .keccak256(ethers.utils.toUtf8Bytes("ERC1155"))
          .slice(0, 10), // replace with actual bytes4
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
  console.log(orderErc1155InEthOut);
  // To mimic Solidity's abi.encode in ethers.js, manually add the length of the dynamic data, "bytes" in types array,
  // to the start of the encoded output
  const encodedWitouthLength = ethers.utils.defaultAbiCoder.encode(
    types,
    orderErc1155InEthOut
  );
  const lengthPadded =
    "0x0000000000000000000000000000000000000000000000000000000000000020";
  const encodedMessage = lengthPadded + encodedWitouthLength.slice(2); // Slice off the '0x' prefix

  console.log(encodedMessage);
  beforeEach(async function () {
    const RaribleEIP712VisualizerFactory = await ethers.getContractFactory(
      "RaribleEIP712Visualizer"
    );
    RaribleEIP712Visualizer = await RaribleEIP712VisualizerFactory.deploy();
    await RaribleEIP712Visualizer.deployed();
  });

  it("Should return the correct values when calling visualizeEIP712message", async function () {
    const result = await RaribleEIP712Visualizer.visualizeEIP712Message(
      encodedMessage,
      DOMAIN_SEPARATOR
    );

    // Map the result to a more readable format
    const mappedResult = {
      assetsIn: result.assetsIn.map(([assetTokenAddress, id, amounts]) => ({
        assetTokenAddress,
        id,
        amounts,
      })),
      assetsOut: result.assetsOut.map(([assetTokenAddress, id, amounts]) => ({
        assetTokenAddress,
        id,
        amounts,
      })),
      liveness: {
        from: result.liveness[0],
        to: result.liveness[1],
      },
    };

    const expectedResult = {
      assetsIn: [
        {
          assetTokenAddress: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
          id: ethers.BigNumber.from("2"),
          amounts: [ethers.BigNumber.from("8")],
        },
      ],
      assetsOut: [
        {
          assetTokenAddress: "0x0000000000000000000000000000000000000000",
          id: ethers.BigNumber.from("0"),
          amounts: [ethers.BigNumber.from("1000000000000000000")],
        },
      ],
      liveness: {
        from: ethers.BigNumber.from("1698643839"),
        to: ethers.BigNumber.from("1798843839"),
      },
    };

    expect(mappedResult).to.deep.equal(expectedResult);
  });
  it("Should revert when visualizing EIP712 message due to incorrect domain separator", async function () {
    const INCORRECT_DOMAIN_SEPARATOR =
      "0x96c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7";
    await expect(
      RaribleEIP712Visualizer.visualizeEIP712Message(
        encodedMessage,
        INCORRECT_DOMAIN_SEPARATOR
      )
    ).to.be.revertedWith("RaribleEIP712Visualizer: unsupported domain");
  });
});
