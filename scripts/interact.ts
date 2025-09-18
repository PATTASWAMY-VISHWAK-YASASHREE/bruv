import { createWalletClient, createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_batchId",
        "type": "uint256"
      }
    ],
    "name": "addItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_itemId",
        "type": "uint256"
      }
    ],
    "name": "getItem",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "batchId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "stage",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "currentOwner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct SupplyChainTracker.Item",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_itemId",
        "type": "uint256"
      },
      {
        "internalType": "enum SupplyChainTracker.Stage",
        "name": "_stage",
        "type": "uint8"
      }
    ],
    "name": "updateStage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ItemAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum SupplyChainTracker.Stage",
        "name": "stage",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "StageUpdated",
    "type": "event"
  }
];

const contractAddress = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";

async function main() {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(process.env.COTI_TESTNET_PRIVATE_KEY as `0x${string}`),
    transport: http('http://127.0.0.1:8545'),
    chain: hardhat,
  });

  const publicClient = createPublicClient({
    transport: http('http://127.0.0.1:8545'),
    chain: hardhat,
  });

  // Example: Add an item
  console.log("Adding an item...");
  const hash1 = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "addItem",
    args: [1], // Only batchId
  });
  console.log("Transaction hash:", hash1);

  // Wait for confirmation
  const receipt1 = await publicClient.waitForTransactionReceipt({ hash: hash1 });
  console.log("Item added, block:", receipt1.blockNumber);

  // Example: Update stage
  console.log("Updating stage...");
  const hash2 = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "updateStage",
    args: [1, 1], // Stage 1 (Harvested)
  });
  console.log("Transaction hash:", hash2);

  const receipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 });
  console.log("Stage updated, block:", receipt2.blockNumber);

  // Example: Get item
  console.log("Getting item...");
  const item = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getItem",
    args: [1],
  });
  console.log("Item:", item);
}

main().catch(console.error);