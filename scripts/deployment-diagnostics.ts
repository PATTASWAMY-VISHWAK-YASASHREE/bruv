import { ethers } from "ethers";
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DeploymentResult {
  timestamp: string;
  network: {
    name: string;
    chainId: number;
    blockNumber: number;
    gasPrice: string;
  };
  accounts: Array<{
    address: string;
    balance: string;
  }>;
  deployment: {
    contractName: string;
    contractAddress: string;
    deployerAddress: string;
    transactionHash: string;
    gasUsed: string;
    gasPrice: string;
    blockNumber: number;
    deploymentTime: number;
  };
  contractVerification: {
    bytecode: string;
    abi: any[];
    isContract: boolean;
    codeSize: number;
  };
  errors: string[];
  warnings: string[];
  logs: string[];
}

async function runDeploymentDiagnostics(): Promise<void> {
  const results: DeploymentResult[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];

  console.log('🚀 Starting Hardhat deployment diagnostics...');

  try {
    // Connect to network using viem
    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();
    const walletClients = await viem.getWalletClients();
    const deployerClient = walletClients[0];

    // Capture network info
    const chainId = await publicClient.getChainId();
    const blockNumber = await publicClient.getBlockNumber();
    const gasPrice = await publicClient.getGasPrice();

    const networkInfo: DeploymentResult['network'] = {
      name: hre.network.name || 'hardhat',
      chainId: Number(chainId),
      blockNumber: Number(blockNumber),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei'
    };

    logs.push(`Network: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);
    logs.push(`Current block: ${networkInfo.blockNumber}`);
    logs.push(`Gas price: ${networkInfo.gasPrice}`);

    // Get account balances
    const accountBalances = await Promise.all(
      walletClients.slice(0, 5).map(async (client) => {
        const balance = await publicClient.getBalance({
          address: client.account.address
        });
        return {
          address: client.account.address,
          balance: ethers.formatEther(balance) + ' ETH'
        };
      })
    );

    logs.push(`Available accounts: ${accountBalances.length}`);

    // Start deployment timer
    const deploymentStart = Date.now();

    logs.push('📦 Deploying SupplyChainTracker contract...');

    // Deploy contract using viem
    const deployArtifacts = await hre.artifacts.readArtifact("SupplyChainTracker");
    const hash = await deployerClient.deployContract({
      abi: deployArtifacts.abi,
      bytecode: deployArtifacts.bytecode as `0x${string}`,
      args: []
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const contractAddress = receipt.contractAddress;

    if (!contractAddress) {
      throw new Error('Contract deployment failed - no contract address returned');
    }

    const deploymentEnd = Date.now();
    const deploymentTime = deploymentEnd - deploymentStart;

    logs.push(`✅ Deployment completed in ${deploymentTime}ms`);

    // Verify contract deployment
    const code = await publicClient.getCode({ address: contractAddress });
    const isContract = code !== '0x';

    if (!isContract) {
      warnings.push('⚠️  WARNING: Contract address does not contain deployed code!');
      warnings.push(`Contract address: ${contractAddress}`);
    }

    // Get contract ABI
    const abiArtifacts = await hre.artifacts.readArtifact("SupplyChainTracker");
    const abi = abiArtifacts.abi;

    const verification: DeploymentResult['contractVerification'] = {
      bytecode: code,
      abi,
      isContract,
      codeSize: (code.length - 2) / 2 // Remove 0x prefix and convert to bytes
    };

    // Create deployment result
    const result: DeploymentResult = {
      timestamp: new Date().toISOString(),
      network: networkInfo,
      accounts: accountBalances,
      deployment: {
        contractName: 'SupplyChainTracker',
        contractAddress,
        deployerAddress: deployerClient.account.address,
        transactionHash: hash,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.effectiveGasPrice.toString(),
        blockNumber: Number(receipt.blockNumber),
        deploymentTime
      },
      contractVerification: verification,
      errors,
      warnings,
      logs
    };

    results.push(result);

    // Test contract interaction
    logs.push('🧪 Testing contract interaction...');

    try {
      // Test a transaction (addItem)
      const txHash = await deployerClient.writeContract({
        address: contractAddress,
        abi: abiArtifacts.abi,
        functionName: 'addItem',
        args: ['Test Location', 'Test Crop', 'Test Farmer']
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      logs.push(`✅ Contract write successful. Transaction: ${txHash}`);

      // Test a read call (getItem with batchId 1)
      const itemData = await publicClient.readContract({
        address: contractAddress,
        abi: abiArtifacts.abi,
        functionName: 'getItem',
        args: [1]
      });
      logs.push(`✅ Contract read successful. Item batch ID: ${itemData[0]}`);

    } catch (error: any) {
      errors.push(`❌ Contract interaction failed: ${error.message}`);
      if (error.message.includes('not a contract')) {
        errors.push('🔍 This indicates the contract was not properly deployed or the address is incorrect');
      }
    }

    // Save results to JSON file
    const outputDir = path.join(__dirname, '../mcp_tool_outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `deployment_diagnostics_${Date.now()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

    console.log(`📄 Diagnostics saved to: ${outputFile}`);
    console.log('📊 Summary:');
    console.log(`   - Network: ${networkInfo.name}`);
    console.log(`   - Contract Address: ${contractAddress}`);
    console.log(`   - Transaction Hash: ${receipt.hash}`);
    console.log(`   - Gas Used: ${receipt.gasUsed}`);
    console.log(`   - Block Number: ${receipt.blockNumber}`);
    console.log(`   - Deployment Time: ${deploymentTime}ms`);

    if (errors.length > 0) {
      console.log('❌ Errors encountered:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }

  } catch (error: any) {
    errors.push(`💥 Deployment failed: ${error.message}`);
    console.error('💥 Deployment diagnostics failed:', error);

    // Save error results
    const errorResult: DeploymentResult = {
      timestamp: new Date().toISOString(),
      network: {
        name: hre.network.name || 'unknown',
        chainId: 0,
        blockNumber: 0,
        gasPrice: '0 gwei'
      },
      accounts: [],
      deployment: {
        contractName: 'SupplyChainTracker',
        contractAddress: '0x0000000000000000000000000000000000000000',
        deployerAddress: '0x0000000000000000000000000000000000000000',
        transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        gasUsed: '0',
        gasPrice: '0',
        blockNumber: 0,
        deploymentTime: 0
      },
      contractVerification: {
        bytecode: '',
        abi: [],
        isContract: false,
        codeSize: 0
      },
      errors,
      warnings,
      logs
    };

    const outputDir = path.join(__dirname, '../mcp_tool_outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `deployment_diagnostics_error_${Date.now()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify([errorResult], null, 2));

    console.log(`📄 Error diagnostics saved to: ${outputFile}`);
  }
}

// Run the diagnostics
runDeploymentDiagnostics()
  .then(() => {
    console.log('🎉 Diagnostics completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Diagnostics failed:', error);
    process.exit(1);
  });