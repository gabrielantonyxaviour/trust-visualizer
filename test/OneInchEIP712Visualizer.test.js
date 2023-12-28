const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @dev Tests for ERC6865Registry.sol
 * @author @SilviaMargaritaOcegueda
 * @notice OneInchEIP712Visualizer is a contract that decodes EIP-712 message data in the OneInch Protocol
 */
describe("OneInchEIP712Visualizer", function () {
  let OneInchEIP712Visualizer;

  // EIP-712 domain separator hash for OneInch v1.1
  const DOMAIN_SEPARATOR =
    "0xb50c8913581289bd2e066aeef89fceb9615d490d673131fd1a7047436706834e";

  // Order Types
  const types = [
    "uint256",
    "address",
    "address",
    "address",
    "address",
    "address",
    "uint256",
    "uint256",
    "uint256",
    "bytes",
  ];

  // Order data
  const order = [
    ethers.BigNumber.from(
      "45118768841948961586167738353692277076075522015101619148498725069326976558864"
    ),
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0x00000000219ab540356cBB839Cbe05303d7705Fa",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    ethers.BigNumber.from("1000000000000000000"),
    ethers.BigNumber.from("1420000000"),
    ethers.BigNumber.from("0"),
    ethers.utils.solidityPack(["uint128", "uint128"], [9, 142]),
  ];
  // To mimic Solidity's abi.encode in ethers.js, manually add the length of the dynamic data, "bytes" in types array,
  // to the start of the encoded output
  const encodedWitouthLength = ethers.utils.defaultAbiCoder.encode(
    types,
    order
  );
  const lengthPadded =
    "0x0000000000000000000000000000000000000000000000000000000000000020";
  const encodedMessage = lengthPadded + encodedWitouthLength.slice(2); // Slice off the '0x' prefix
  const expectedInitialRateBump = ethers.BigNumber.from("50000");
  const expectedTakingAmount = ethers.BigNumber.from("1420000000");
  const expectedMaxTakingAmount = expectedTakingAmount
    .mul(ethers.BigNumber.from("10000000").add(expectedInitialRateBump))
    .div(ethers.BigNumber.from("10000000"));

  beforeEach(async function () {
    // Deploy OneInchEIP712Visualizer
    const OneInchEIP712VisualizerFactory = await ethers.getContractFactory(
      "OneInchEIP712Visualizer"
    );
    OneInchEIP712Visualizer = await OneInchEIP712VisualizerFactory.deploy();
    await OneInchEIP712Visualizer.deployed();
  });

  it("Should return the correct values when calling visualizeEIP712message", async function () {
    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(
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

    // Expected result of the EIP712 Visualization of the OneInch Order
    const expectedResult = {
      assetsIn: [
        {
          assetTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          id: ethers.BigNumber.from("0"),
          amounts: [expectedMaxTakingAmount, expectedTakingAmount],
        },
      ],
      assetsOut: [
        {
          assetTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          id: ethers.BigNumber.from("0"),
          amounts: [ethers.BigNumber.from("1000000000000000000")],
        },
      ],
      liveness: {
        from: ethers.BigNumber.from("1673548149"),
        to: ethers.BigNumber.from("1673548329"),
      },
    };

    // Check that the result matches the expected result
    expect(mappedResult).to.deep.equal(expectedResult);
  });
  it("Should revert when visualizing EIP712 message due to incorrect domain separator", async function () {
    const INCORRECT_DOMAIN_SEPARATOR =
      "0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7";

    // Attempt to visualize EIP712 message with incorrect domain separator
    await expect(
      OneInchEIP712Visualizer.visualizeEIP712Message(
        encodedMessage,
        INCORRECT_DOMAIN_SEPARATOR
      )
    ).to.be.revertedWith("1inchEIP712Visualizer: unsupported domain");
  });
  it("Should calculate the correct start time and duration", async function () {
    const expectedStartTime = ethers.BigNumber.from("1673548149");
    const expectedDuration = ethers.BigNumber.from("180");
    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(
      encodedMessage,
      DOMAIN_SEPARATOR
    );

    // Check that the EIP712 Visualization of the OneInch Order matches the expected Liveness
    expect(result.liveness.to).to.equal(
      expectedStartTime.add(expectedDuration)
    );
  });
  it("Should calculate the correct initial rate bump", async function () {
    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(
      encodedMessage,
      DOMAIN_SEPARATOR
    );
    const initialRateBump =
      (result.assetsIn[0].amounts[0] * 10000000) / expectedTakingAmount -
      10000000;

    // Check that the EIP712 Visualization of the OneInch Order matches the expected initial rate bump
    expect(initialRateBump).to.equal(expectedInitialRateBump);
  });
});
