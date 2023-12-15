const { expect } = require("chai");
const { ethers } = require("hardhat");
const { json } = require("hardhat/internal/core/params/argumentTypes");

describe("OneInchEIP712Visualizer", function () {
  let OneInchEIP712Visualizer;
  const DOMAIN_SEPARATOR = "0xb50c8913581289bd2e066aeef89fceb9615d490d673131fd1a7047436706834e";
  const types = ['uint256', 'address', 'address', 'address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'];
  const order = [
    ethers.BigNumber.from("45118768841948961586167738353692277076075522015101619148498725069326976558864"),
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0x00000000219ab540356cBB839Cbe05303d7705Fa",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    ethers.BigNumber.from("1000000000000000000"),
    ethers.BigNumber.from("1420000000"),
    ethers.BigNumber.from("0"),
    ethers.utils.solidityPack(["uint128", "uint128"], [9, 142])
  ];
  //   console.log(order)
  const encodedWitouthLength= ethers.utils.defaultAbiCoder.encode(types, order);
  // To mimic Solidity's abi.encode in ethers.js, manually add the length of the dynamic data, "bytes" in types array,
  // to the start of the encoded output
  const lengthPadded = "0x0000000000000000000000000000000000000000000000000000000000000020";
  const encodedMessage = lengthPadded + encodedWitouthLength.slice(2); // Slice off the '0x' prefix
  const expectedInitialRateBump = ethers.BigNumber.from("50000");
  const expectedTakingAmount = ethers.BigNumber.from("1420000000");
  const expectedMaxTakingAmount = expectedTakingAmount.mul(ethers.BigNumber.from("10000000").add(expectedInitialRateBump)).div(ethers.BigNumber.from("10000000"));
  
  beforeEach(async function () {
    const OneInchEIP712VisualizerFactory = await ethers.getContractFactory("OneInchEIP712Visualizer");
    OneInchEIP712Visualizer = await OneInchEIP712VisualizerFactory.deploy();
    await OneInchEIP712Visualizer.deployed();
  });

  it("Should return the correct values when calling visualizeEIP712message", async function () {

    const expectedAssetsInassetTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const expectedAssetsInId = ethers.BigNumber.from("0");
    const expectedAssetsInAmounts = [expectedMaxTakingAmount, expectedTakingAmount];
    const expectedAssetsOutAssetTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const expectedAssetsOutId = ethers.BigNumber.from("0");
    const expectedAssetsOutAmounts = [ethers.BigNumber.from("1000000000000000000")];
    const expectedLivenessFrom = ethers.BigNumber.from("1673548149");
    const expectedLivenessTo = ethers.BigNumber.from("1673548329");
    
   
    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, DOMAIN_SEPARATOR);
   
    expect(result.assetsIn[0].assetTokenAddress).to.equal(expectedAssetsInassetTokenAddress);
    expect(result.assetsIn[0].id).to.equal(expectedAssetsInId);
    expect(result.assetsIn[0].amounts[0]).to.equal(expectedAssetsInAmounts[0]);
    expect(result.assetsIn[0].amounts[1]).to.equal(expectedAssetsInAmounts[1]);
    expect(result.assetsOut[0].assetTokenAddress).to.equal(expectedAssetsOutAssetTokenAddress);
    expect(result.assetsOut[0].id).to.equal(expectedAssetsOutId);
    expect(result.assetsOut[0].amounts[0]).to.equal(expectedAssetsOutAmounts[0]);
    expect(result.assetsOut[0].amounts[1]).to.be.undefined;
    expect(result.liveness.from).to.equal(expectedLivenessFrom);
    expect(result.liveness.to).to.equal(expectedLivenessTo);
  });
  it("Should revert when visualizing EIP712 message due to incorrect domain separator", async function () {
    const INCORRECT_DOMAIN_SEPARATOR = "0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7";
    await expect(OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, INCORRECT_DOMAIN_SEPARATOR))
      .to.be.revertedWith("1inchEIP712Visualizer: unsupported domain");
  });
  it("Should calculate the correct start time and duration", async function () {
    const expectedStartTime = ethers.BigNumber.from("1673548149");
    const expectedDuration = ethers.BigNumber.from("180");
    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, DOMAIN_SEPARATOR);
    expect(result.liveness.to).to.equal(expectedStartTime.add(expectedDuration));
  });
  it("Should calculate the correct initial rate bump", async function () {
    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, DOMAIN_SEPARATOR);
    const initialRateBump = (result.assetsIn[0].amounts[0] * 10000000 / expectedTakingAmount) - 10000000;
    expect(initialRateBump).to.equal(expectedInitialRateBump);
  }); 
});