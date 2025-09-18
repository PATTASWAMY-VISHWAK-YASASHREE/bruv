import { createWalletClient, http, parseEther } from 'viem';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'); // Default account #0 private key

const client = createWalletClient({
  account,
  chain: hardhat,
  transport: http('http://127.0.0.1:8545'),
});

async function sendEth() {
  const hash = await client.sendTransaction({
    to: '0x7B1478e3eA8C14d65bA758975bAF3C60dd4eFA7a',
    value: parseEther('1'), // Send 1 ETH
  });
  console.log('Transaction hash:', hash);
}

sendEth().catch(console.error);