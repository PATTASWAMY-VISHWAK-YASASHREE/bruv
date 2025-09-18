# Bruv - Solidity Smart Contract Workspace

A Solidity-based smart contract workspace with organized contracts and tests folders.

## Project Structure

```
bruv/
├── contracts/          # Smart contract source files
│   └── Greeter.sol    # Example smart contract
├── test/              # Test files for smart contracts
│   └── Greeter.test.js # Tests for Greeter contract
├── scripts/           # Deployment and utility scripts
│   └── deploy.js      # Contract deployment script
├── hardhat.config.js  # Hardhat configuration
├── package.json       # Node.js dependencies and scripts
└── README.md          # This file
```

## Prerequisites

- Node.js (v16 or later)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bruv
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test
```

### Deploy Contracts
```bash
npm run deploy
```

### Start Local Blockchain
```bash
npm run node
```

## Smart Contracts

### Greeter.sol
A simple smart contract that stores and returns a greeting message. It demonstrates:
- Constructor with parameters
- State variables
- Public view functions
- Public state-changing functions

## Testing

Tests are written using Mocha and Chai, integrated with Hardhat's testing environment. The test suite includes:
- Contract deployment testing
- Function call testing
- State change verification

## Development

This workspace uses Hardhat as the development framework, providing:
- Solidity compilation
- Local blockchain for testing
- Contract deployment scripts
- Comprehensive testing suite

## License

MIT