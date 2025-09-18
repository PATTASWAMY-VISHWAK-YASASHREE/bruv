import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SupplyChainTrackerModule", (m) => {
  const supplyChainTracker = m.contract("SupplyChainTracker");

  return { supplyChainTracker };
});