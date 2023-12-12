const { networks } = require("../../networks");
task("deploy-oneinch", "Deploys the OneInchEIP712Visualizer contract")
  .addOptionalParam(
    "verify",
    "Set to true to verify contract",
    false,
    types.boolean
  )
  .setAction(async (taskArgs) => {
    console.log(
      `Deploying OneInchEIP712Visualizer contract to ${network.name}`
    );

    console.log("\n__Compiling Contracts__");
    await run("compile");

    const oneinchFactory = await ethers.getContractFactory(
      "OneInchEIP712Visualizer"
    );
    const oneinch = await oneinchFactory.deploy();

    console.log(
      `\nWaiting blocks for transaction ${oneinch.deployTransaction.hash} to be confirmed...`
    );

    await oneinch.deployTransaction.wait(networks[network.name]);

    console.log(
      "\nDeployed OneInchEIP712Visualizer contract to:",
      oneinch.address
    );

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
          address: oneinch.address,
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
      `\n OneInchEIP712Visualizer contract deployed to ${oneinch.address} on ${network.name}`
    );
  });
