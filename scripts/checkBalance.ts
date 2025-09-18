import { createPublicClient, http, formatEther } from 'viem';
import { hardhat } from 'viem/chains';

const client = createPublicClient({
  chain: hardhat,
  transport: http('http://127.0.0.1:8545'),
});

async function checkBalance() {
  const balance = await client.getBalance({
    address: '0x7B1478e3eA8C14d65bA758975bAF3C60dd4eFA7a',
  });
  console.log('Balance of 0x7B1478e3eA8C14d65bA758975bAF3C60dd4eFA7a:', formatEther(balance), 'ETH');
}

checkBalance().catch(console.error);