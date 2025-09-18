import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SupplyChainTracker...");

  const SupplyChainTracker = await ethers.getContractFactory("SupplyChainTracker");
  const supplyChainTracker = await SupplyChainTracker.deploy();

  await supplyChainTracker.waitForDeployment();
  const contractAddress = await supplyChainTracker.getAddress();

  console.log("SupplyChainTracker deployed to:", contractAddress);
  console.log("Public URL:", `https://testnet.cotiscan.io/address/${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});