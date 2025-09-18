# MetaMask Transaction UI

A minimal React application demonstrating MetaMask wallet integration for Ethereum transactions.

## Features

- **MetaMask Detection**: Automatically detects if MetaMask is installed
- **Wallet Connection**: Connect to MetaMask wallet and display account information
- **Balance Display**: Shows current ETH balance of connected account
- **Transaction Sending**: Send ETH to any Ethereum address
- **Real-time Updates**: Automatically updates balance after transactions
- **Network Monitoring**: Listens for account and network changes

## Prerequisites

- [MetaMask Browser Extension](https://metamask.io/download/)
- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Connect Wallet**: Click "Connect MetaMask" to connect your MetaMask wallet
2. **View Account**: Once connected, you'll see your account address and ETH balance
3. **Send Transaction**:
   - Enter the recipient's Ethereum address
   - Enter the amount of ETH to send
   - Click "Send Transaction"
   - Confirm the transaction in MetaMask

## Architecture

The application uses:
- **React** for the UI components
- **ethers.js v6** for Ethereum blockchain interaction
- **MetaMask Provider** for wallet communication
- **EIP-1193** standard for wallet connectivity

## Key Components

- `App.tsx`: Main component handling wallet connection and transaction logic
- `checkMetaMask()`: Detects MetaMask installation
- `connectWallet()`: Requests account access from MetaMask
- `getBalance()`: Fetches account balance using ethers.js
- `sendTransaction()`: Creates and sends ETH transactions

## Security Notes

- Always verify transaction details in MetaMask before confirming
- Never share your private keys or seed phrase
- Test transactions on testnets before mainnet usage
- The application only requests necessary permissions

## Development

To modify the application:

1. Edit `src/App.tsx` for component logic
2. Update `src/App.css` for styling
3. Add new features following the existing patterns

## Testing

For testing with local Hardhat network:
1. Start Hardhat node: `npx hardhat node`
2. Import test accounts into MetaMask
3. Switch MetaMask to localhost:8545 network
4. Test transactions between accounts

## Research Summary

This UI was created based on comprehensive research of:
- Official MetaMask documentation and SDK
- Ethereum provider API (EIP-1193)
- ethers.js library documentation
- React integration patterns from MetaMask examples
- Hardhat testing and deployment practices

The implementation follows best practices for:
- Error handling and user feedback
- Event listening for account/network changes
- TypeScript for type safety
- Modern React hooks and state management