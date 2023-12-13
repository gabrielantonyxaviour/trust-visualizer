const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OneInchEIP712Visualizer", function () {
  let OneInchEIP712Visualizer;

  beforeEach(async function () {
    const OneInchEIP712VisualizerFactory = await ethers.getContractFactory("OneInchEIP712Visualizer");
    OneInchEIP712Visualizer = await OneInchEIP712VisualizerFactory.deploy();
    await OneInchEIP712Visualizer.deployed();
  });

  it("Should visualize EIP712 message", async function () {
    const DOMAIN_SEPARATOR = "0xb50c8913581289bd2e066aeef89fceb9615d490d673131fd1a7047436706834e";
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
        ethers.utils.defaultAbiCoder.encode(["uint128", "uint128"], [9, 142])
      ];

      const expectedArguments = (
        ethers.BigNumber.from("45118768841948961586167738353692277076075522015101619148498725069326976558864"),
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0x00000000219ab540356cBB839Cbe05303d7705Fa",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        ethers.BigNumber.from("1000000000000000000"),
        ethers.BigNumber.from("1420000000"),
        ethers.BigNumber.from("0"),
        ethers.utils.defaultAbiCoder.encode(["uint128", "uint128"], [9, 142])
      );
  
      const encodedMessage = ethers.utils.defaultAbiCoder.encode([
        "uint256",
        "address",
        "address",
        "address",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "bytes"
      ], order);

    await expect(OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, DOMAIN_SEPARATOR))
      .to.emit(OneInchEIP712Visualizer, 'Result')
      .withArgs(expectedArguments);
  });

});