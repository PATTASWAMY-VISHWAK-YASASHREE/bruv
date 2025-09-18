import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

const cotiTestnet = defineChain({
  id: 7082400,
  name: 'COTI Testnet',
  network: 'coti-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'COTI',
    symbol: 'COTI',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.coti.io/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'CotiScan', url: 'https://testnet.cotiscan.io' },
  },
});

const bytecode = "0x6080806040523460155761042d908161001a8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c80633129e773146102ee578063be6340451461021a578063bfb231d2146101be5763f405c96b14610045575f80fd5b346101ba5760403660031901126101ba5760043560243560048110156101ba575f8281526020819052604090206001015460081c6001600160a01b0316330361018957815f525f60205260ff600160405f200154166004811015610175576001810180911161016157810361011c57816101136060927f20f13d5051a99e5a3e1fe067b2dad576cc3253d70a33e0c746becebd65d4baa4945f525f6020526100f381600160405f20016103df565b825f525f60205242600260405f200155604051928352602083019061039e565b336040820152a1005b60405162461bcd60e51b815260206004820152601860248201527f496e76616c6964207374616765207472616e736974696f6e00000000000000006044820152606490fd5b634e487b7160e01b5f52601160045260245ffd5b634e487b7160e01b5f52602160045260245ffd5b60405162461bcd60e51b81526020600482015260096024820152682737ba1037bbb732b960b91b6044820152606490fd5b5f80fd5b346101ba5760203660031901126101ba576004355f525f602052608060405f2080549060026001820154910154906040519283526102026020840160ff831661039e565b60081c6001600160a01b031660408301526060820152f35b346101ba5760203660031901126101ba57600435805f525f60205260405f20546102b3576102466103ab565b9080825260208201905f8252604083019133835260608401914283525f525f60205260405f20935184556001840190519260048410156101755761028c600294836103df565b518154610100600160a81b03191660089190911b610100600160a81b031617905551910155005b60405162461bcd60e51b81526020600482015260136024820152724974656d20616c72656164792065786973747360681b6044820152606490fd5b346101ba5760203660031901126101ba575f606061030a6103ab565b82815282602082015282604082015201526004355f525f60205260405f206103306103ab565b8154815260018201549160ff83169260208301916004851015610175576002610387916080968552604086019360018060a01b039060081c168452015492606085019384526040519451855251602085019061039e565b516001600160a01b03166040830152516060820152f35b9060048210156101755752565b604051906080820182811067ffffffffffffffff8211176103cb57604052565b634e487b7160e01b5f52604160045260245ffd5b9060048110156101755760ff8019835416911617905556fea26469706673582212207d41a80d21d5bc8b588fe52a567ee85b3d692df6eed564dc7d0c61f7bd1e636664736f6c634300081e0033";

const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "batchId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum SupplyChainTracker.Stage",
        "name": "newStage",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "StageUpdated",
    "type": "event"
  },
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
        "name": "_batchId",
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
            "internalType": "enum SupplyChainTracker.Stage",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "items",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "batchId",
        "type": "uint256"
      },
      {
        "internalType": "enum SupplyChainTracker.Stage",
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
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_batchId",
        "type": "uint256"
      },
      {
        "internalType": "enum SupplyChainTracker.Stage",
        "name": "_newStage",
        "type": "uint8"
      }
    ],
    "name": "updateStage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function main() {
  console.log("Deploying SupplyChainTracker...");

  const isLocal = true; // Hardcoded for local deployment
  const rpcUrl = 'http://127.0.0.1:8545';
  const privateKey = process.env.COTI_TESTNET_PRIVATE_KEY as `0x${string}`;
  const chain = hardhat; // For local, use hardhat chain

  const walletClient = createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: http(rpcUrl),
    chain: chain,
  });
  
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
    chain: chain,
  });

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log("SupplyChainTracker deployed to:", contractAddress);
  console.log("Public URL:", `https://testnet.cotiscan.io/address/${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});