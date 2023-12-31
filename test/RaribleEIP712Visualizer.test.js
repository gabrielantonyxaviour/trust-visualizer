const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  types,
  orderERC20InERC1155Out,
  orderErc1155InEthOut,
  orderETHInERC721Out,
} = require("../utils/raribleData");

/**
 * @dev Tests for ERC6865Registry.sol
 * @author @gabrielantonyxaviour
 * @notice RaribleEIP712Visualizer is a contract that decodes EIP-712 message data in the Rarible Protocol
 */
describe("RaribleEIP712Visualizer", function () {
  let RaribleEIP712Visualizer;

  // EIP-712 domain separator hash for Rarible
  const DOMAIN_SEPARATOR =
    "0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7";

  beforeEach(async function () {
    // Deploy RaribleEIP712Visualizer contract
    const RaribleEIP712VisualizerFactory = await ethers.getContractFactory(
      "RaribleEIP712Visualizer"
    );
    RaribleEIP712Visualizer = await RaribleEIP712VisualizerFactory.deploy();
    await RaribleEIP712Visualizer.deployed();
  });

  it("Should revert when visualizing EIP712 message due to incorrect domain separator", async function () {
    // Obtaining the encoded EIP712 message of the Rarble Order
    const encodedWithoutLength = ethers.utils.defaultAbiCoder.encode(
      types,
      orderErc1155InEthOut
    );
    // To mimic Solidity's abi.encode in ethers.js, manually add the length of the dynamic data, "bytes" in types array,
    // to the start of the encoded output
    const lengthPadded =
      "0x0000000000000000000000000000000000000000000000000000000000000020";
    const encodedMessage = lengthPadded + encodedWithoutLength.slice(2);

    const INCORRECT_DOMAIN_SEPARATOR =
      "0x96c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7";

    // Expect the call to revert due to incorrect domain separator
    await expect(
      RaribleEIP712Visualizer.visualizeEIP712Message(
        encodedMessage,
        INCORRECT_DOMAIN_SEPARATOR
      )
    ).to.be.revertedWith("RaribleEIP712Visualizer: unsupported domain");
  });

  it("Should return the correct values when calling visualizeEIP712message to decode ERC1155 In ETH Out Order", async function () {
    // Obtaining the encoded EIP712 message of the Rarble Order
    const encodedWithoutLength = ethers.utils.defaultAbiCoder.encode(
      types,
      orderErc1155InEthOut
    );
    // To mimic Solidity's abi.encode in ethers.js, manually add the length of the dynamic data, "bytes" in types array,
    // to the start of the encoded output
    const lengthPadded =
      "0x0000000000000000000000000000000000000000000000000000000000000020";
    const encodedMessage = lengthPadded + encodedWithoutLength.slice(2);
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

    // Expected result of the EIP712 Visualization of the Rarible Order
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

    // Check that the result matches the expected result
    expect(mappedResult).to.deep.equal(expectedResult);
  });
  it("Should return the correct values when calling visualizeEIP712message to decode ERC20 In ERC1155 Out Order", async function () {
    // Obtaining the encoded EIP712 message of the Rarble Order
    const encodedWithoutLength = ethers.utils.defaultAbiCoder.encode(
      types,
      orderERC20InERC1155Out
    );
    // To mimic Solidity's abi.encode in ethers.js, manually add the length of the dynamic data, "bytes" in types array,
    // to the start of the encoded output
    const lengthPadded =
      "0x0000000000000000000000000000000000000000000000000000000000000020";
    const encodedMessage = lengthPadded + encodedWithoutLength.slice(2);
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

    // Expected result of the EIP712 Visualization of the Rarible Order
    const expectedResult = {
      assetsIn: [
        {
          assetTokenAddress:
            "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8".toLowerCase(),
          id: ethers.BigNumber.from("0"),
          amounts: [ethers.BigNumber.from("10000000000000000000")],
        },
      ],
      assetsOut: [
        {
          assetTokenAddress: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
          id: ethers.BigNumber.from("2"),
          amounts: [ethers.BigNumber.from("6")],
        },
      ],
      liveness: {
        from: ethers.BigNumber.from("1698643839"),
        to: ethers.BigNumber.from("1798843839"),
      },
    };

    // Check that the result matches the expected result
    expect(mappedResult).to.deep.equal(expectedResult);
  });
  it("Should return the correct values when calling visualizeEIP712message to decode ETH In ERC721 Out Order", async function () {
    // Obtaining the encoded EIP712 message of the Rarble Order
    const encodedWithoutLength = ethers.utils.defaultAbiCoder.encode(
      types,
      orderETHInERC721Out
    );
    // To mimic Solidity's abi.encode in ethers.js, manually add the length of the dynamic data, "bytes" in types array,
    // to the start of the encoded output
    const lengthPadded =
      "0x0000000000000000000000000000000000000000000000000000000000000020";
    const encodedMessage = lengthPadded + encodedWithoutLength.slice(2);
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

    // Expected result of the EIP712 Visualization of the Rarible Order
    const expectedResult = {
      assetsIn: [
        {
          assetTokenAddress: "0x0000000000000000000000000000000000000000",
          id: ethers.BigNumber.from("0"),
          amounts: [ethers.BigNumber.from("100000000000000000")],
        },
      ],
      assetsOut: [
        {
          assetTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          id: ethers.BigNumber.from("10"),
          amounts: [ethers.BigNumber.from("1")],
        },
      ],
      liveness: {
        from: ethers.BigNumber.from("1698643839"),
        to: ethers.BigNumber.from("1798843839"),
      },
    };

    // Check that the result matches the expected result
    expect(mappedResult).to.deep.equal(expectedResult);
  });
});
