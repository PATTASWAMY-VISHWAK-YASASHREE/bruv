const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy Greeter
  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Bruv!");
  await greeter.waitForDeployment();
  console.log("Greeter deployed to:", await greeter.getAddress());

  // Deploy SimpleStorage
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.waitForDeployment();
  console.log("SimpleStorage deployed to:", await simpleStorage.getAddress());

  console.log("All contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});