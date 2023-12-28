const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @dev Tests for ERC6865Registry.sol
 * @author @SilviaMargaritaOcegueda
 * @notice ERC6865Registry is a contract that stores EIP-712 domain separator hashes and their corresponding implementations
 */
describe("ERC6865Registry", function () {
  let ERC6865Registry;
  let registry;
  let owner;
  let notOwnerAddress;
  let implementationAddress;

  beforeEach(async function () {
    // Deploy ERC6865Registry contract before each test
    ERC6865Registry = await ethers.getContractFactory("ERC6865Registry");
    [owner, notOwnerAddress] = await ethers.getSigners();
    implementationAddress = ethers.Wallet.createRandom().address;
    registry = await ERC6865Registry.deploy();
    await registry.deployed();
  });

  it("Should add and get implementation", async function () {
    // Generate a unique domain separator for testing
    const domainSeparator = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("test")
    );

    // Add implementation to the registry
    await registry
      .connect(owner)
      .addImplementation(domainSeparator, implementationAddress);

    // Retrieve implementation from the registry
    const result = await registry.getImplementation(domainSeparator);

    // Check that the retrieved implementation matches the added one
    expect(result).to.equal(implementationAddress);
  });

  it("Should fail to add implementation from non-owner", async function () {
    // Generate a unique domain separator for testing
    const domainSeparator = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("test")
    );

    // Attempt to add implementation from a non-owner account
    await expect(
      registry
        .connect(notOwnerAddress)
        .addImplementation(domainSeparator, implementationAddress)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should fail to add implementation with zero address", async function () {
    // Generate a unique domain separator for testing
    const domainSeparator = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("test")
    );
    const zeroAddress = ethers.constants.AddressZero;

    // Attempt to add implementation with a zero address
    await expect(
      registry.connect(owner).addImplementation(domainSeparator, zeroAddress)
    ).to.be.revertedWith("Invalid implementation address");
  });
});
