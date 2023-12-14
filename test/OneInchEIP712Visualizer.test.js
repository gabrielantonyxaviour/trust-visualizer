const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OneInchEIP712Visualizer", function () {
    let OneInchEIP712Visualizer;
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
    //   console.log(order)

  beforeEach(async function () {
    const OneInchEIP712VisualizerFactory = await ethers.getContractFactory("OneInchEIP712Visualizer");
    OneInchEIP712Visualizer = await OneInchEIP712VisualizerFactory.deploy();
    await OneInchEIP712Visualizer.deployed();
  });

  it("Should visualize EIP712 message", async function () {
      const expectedReturnValue = ([
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
      ]);
    //   console.log(expectedReturnValue)

    //   const encodedMessage = ethers.utils.defaultAbiCoder.encode([
    //     "uint256",
    //     "address",
    //     "address",
    //     "address",
    //     "address",
    //     "address",
    //     "uint256",
    //     "uint256",
    //     "uint256",
    //     "bytes"
    //   ], order);
    //   console.log(encodedMessage)
      const encodedMessage = "0x000000000000000000000000000000000000000000000000000000000000002063c051750000b400c35000000000000000000000000000000000000000002710000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000219ab540356cbb839cbe05303d7705fa000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000054a37b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000090000000000000000000000000000008e"

    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, DOMAIN_SEPARATOR);
    expect(result).to.deep.equal(expectedReturnValue);
  });
  it("Should revert when visualizing EIP712 message due to incorrect domain separator", async function () {
    const INCORRECT_DOMAIN_SEPARATOR = "0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7";
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

    await expect(OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, INCORRECT_DOMAIN_SEPARATOR))
      .to.be.revertedWith("1inchEIP712Visualizer: unsupported domain");
  });
  it("Should calculate the correct start time and duration", async function () {
    const expectedStartTime = ethers.BigNumber.from("1673548149");
    const expectedDuration = ethers.BigNumber.from("180");
    console.log("StartTime: ", expectedStartTime, "Duration: ", expectedDuration)

  //   const encodedMessage = ethers.utils.defaultAbiCoder.encode([
  //     "uint256",
  //     "address",
  //     "address",
  //     "address",
  //     "address",
  //     "address",
  //     "uint256",
  //     "uint256",
  //     "uint256",
  //     "bytes"
  //   ], order);
  //   console.log(encodedMessage)
    const encodedMessage = "0x000000000000000000000000000000000000000000000000000000000000002063c051750000b400c35000000000000000000000000000000000000000002710000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000219ab540356cbb839cbe05303d7705fa000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000054a37b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000090000000000000000000000000000008e"

    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, DOMAIN_SEPARATOR);
    expect(result).to.equal(expectedStartTime.add(expectedDuration));
  });
  it("Should calculate the correct initial rate bump", async function () {
    const expectedInitialRateBump = ethers.BigNumber.from("50000");
    const takingAmount = ethers.BigNumber.from("1420000000");
    console.log("Expected initial rate bump: ", expectedInitialRateBump, "Taking amount: ", takingAmount)

  //   const encodedMessage = ethers.utils.defaultAbiCoder.encode([
  //     "uint256",
  //     "address",
  //     "address",
  //     "address",
  //     "address",
  //     "address",
  //     "uint256",
  //     "uint256",
  //     "uint256",
  //     "bytes"
  //   ], order);
  //   console.log(encodedMessage)
    const encodedMessage = "0x000000000000000000000000000000000000000000000000000000000000002063c051750000b400c35000000000000000000000000000000000000000002710000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000219ab540356cbb839cbe05303d7705fa000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000054a37b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000090000000000000000000000000000008e"

    const result = await OneInchEIP712Visualizer.visualizeEIP712Message(encodedMessage, DOMAIN_SEPARATOR);
    const initialRateBump = (result.maxTakingAmount * 10000000 / takingAmount) - 10000000;
    expect(initialRateBump).to.equal(expectedInitialRateBump);
  }); 
});