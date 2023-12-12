const { networks } = require("../../networks");
task("deploy-erc6865", "Deploys the ERC6865Registry contract")
  .addOptionalParam(
    "verify",
    "Set to true to verify contract",
    false,
    types.boolean
  )
  .setAction(async (taskArgs) => {
    console.log(`Deploying ERC6865Registry contract to ${network.name}`);

    console.log("\n__Compiling Contracts__");
    await run("compile");

    const raribleFactory = await ethers.getContractFactory("ERC6865Registry");
    const rarible = await raribleFactory.deploy();

    console.log(
      `\nWaiting blocks for transaction ${rarible.deployTransaction.hash} to be confirmed...`
    );

    await rarible.deployTransaction.wait(networks[network.name]);

    console.log("\nDeployed ERC6865Registry contract to:", rarible.address);

    if (network.name === "localFunctionsTestnet") {
      return;
    }

    const verifyContract = taskArgs.verify;
    if (
      network.name !== "localFunctionsTestnet" &&
      verifyContract &&
      !!networks[network.name].verifyApiKey &&
      networks[network.name].verifyApiKey !== "UNSET"
    ) {
      try {
        console.log("\nVerifying contract...");
        await run("verify:verify", {
          address: rarible.address,
          constructorArguments: [],
        });
        console.log("Contract verified");
      } catch (error) {
        if (!error.message.includes("Already Verified")) {
          console.log(
            "Error verifying contract.  Ensure you are waiting for enough confirmation blocks, delete the build folder and try again."
          );
          console.log(error);
        } else {
          console.log("Contract already verified");
        }
      }
    } else if (verifyContract && network.name !== "localFunctionsTestnet") {
      console.log(
        "\nPOLYGONSCAN_API_KEY, ETHERSCAN_API_KEY or FUJI_SNOWTRACE_API_KEY is missing. Skipping contract verification..."
      );
    }

    console.log(
      `\n ERC6865Registry contract deployed to ${rarible.address} on ${network.name}`
    );
  });
