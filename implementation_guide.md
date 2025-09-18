# Implementation Guide: Blockchain-Based Ayurvedic Herbs Traceability

## Overview

This guide provides a comprehensive, step-by-step implementation walkthrough for building the Blockchain-Based Botanical Traceability system for Ayurvedic herbs. It covers everything from environment setup to deployment, with detailed code examples and troubleshooting tips.

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: Minimum 16GB (recommended 32GB)
- **Storage**: 50GB free space
- **Network**: Stable internet connection

### Software Dependencies

- **Node.js**: Version 16.0 or higher
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: Version 2.25 or higher
- **VS Code**: Latest version with required extensions

### Development Tools

- **Go**: Version 1.19 or higher (for chaincode)
- **Expo CLI**: For React Native development
- **Git Bash** or **PowerShell**: For command execution

## Phase 1: Environment Setup

### Step 1.1: Install Node.js and npm

**Windows:**

```powershell
# Download and install from official website
# https://nodejs.org/en/download/

# Verify installation
node --version
npm --version
```

**macOS (using Homebrew):**

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu):**

```bash
# Update package list
sudo apt update

# Install Node.js 16
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 1.2: Install Docker and Docker Compose

**Windows:**

```powershell
# Download Docker Desktop from
# https://www.docker.com/products/docker-desktop

# Start Docker Desktop
# Verify installation
docker --version
docker-compose --version
```

**macOS:**

```bash
# Install Docker Desktop
# https://www.docker.com/products/docker-desktop

# Or using Homebrew
brew install --cask docker

# Verify
docker --version
docker-compose --version
```

**Linux:**

```bash
# Install Docker
sudo apt update
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify
docker --version
docker compose version
```

### Step 1.3: Install Go (for Chaincode)

**Windows:**

```powershell
# Download from https://golang.org/dl/
# Install and add to PATH

# Verify
go version
```

**macOS:**

```bash
brew install go

# Verify
go version
```

**Linux:**

```bash
# Download latest Go
wget https://golang.org/dl/go1.19.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.19.linux-amd64.tar.gz

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH=$PATH:/usr/local/go/bin

# Verify
go version
```

### Step 1.4: Install VS Code Extensions

Open VS Code and install these extensions:

- Go (by Google)
- TypeScript Importer
- Docker
- Kubernetes
- GitLens
- Prettier
- ESLint

### Step 1.5: Install Expo CLI

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify
expo --version
```

## Phase 2: Project Initialization

### Step 2.1: Create Project Structure

```bash
# Create main project directory
mkdir ayurvedic-traceability
cd ayurvedic-traceability

# Create subdirectories
mkdir blockchain backend mobile web docs

# Initialize Git repository
git init
```

### Step 2.2: Initialize Backend Project

```bash
cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express cors helmet dotenv fabric-network mongoose bcryptjs jsonwebtoken
npm install -D nodemon jest supertest

# Create basic structure
mkdir src routes models middleware utils
touch src/app.js src/server.js
```

### Step 2.3: Initialize Mobile Project

```bash
cd ../mobile

# Create Expo project
npx create-expo-app . --template blank-typescript

# Install dependencies
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage react-native-geolocation-service
npm install react-native-qrcode-scanner expo-barcode-scanner
```

### Step 2.4: Initialize Web Project

```bash
cd ../web

# Create React app with TypeScript
npx create-react-app . --template typescript

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-qr-scanner leaflet react-leaflet
npm install axios react-router-dom
```

## Phase 3: Blockchain Network Setup

### Step 3.1: Download Hyperledger Fabric

```bash
cd ../blockchain

# Download Fabric binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.0 1.4.9

# This creates bin/ and config/ directories
```

### Step 3.2: Generate Network Artifacts

Create `crypto-config.yaml`:

```yaml
PeerOrgs:
  - Name: Farmers
    Domain: farmers.ayurvedic.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1

  - Name: Processors
    Domain: processors.ayurvedic.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1

  - Name: Labs
    Domain: labs.ayurvedic.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1

  - Name: Manufacturers
    Domain: manufacturers.ayurvedic.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1
```

Generate crypto materials:

```bash
# Generate certificates
../bin/cryptogen generate --config=./crypto-config.yaml --output=./crypto-config

# Verify
ls crypto-config/
```

### Step 3.3: Create Genesis Block

Create `configtx.yaml`:

```yaml
Organizations:
  - &Farmers
    Name: FarmersMSP
    ID: FarmersMSP
    MSPDir: crypto-config/peerOrganizations/farmers.ayurvedic.com/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('FarmersMSP.member')"
      Writers:
        Type: Signature
        Rule: "OR('FarmersMSP.member')"
      Admins:
        Type: Signature
        Rule: "OR('FarmersMSP.admin')"
    AnchorPeers:
      - Host: peer0.farmers.ayurvedic.com
        Port: 7051

  - &Processors
    Name: ProcessorsMSP
    ID: ProcessorsMSP
    MSPDir: crypto-config/peerOrganizations/processors.ayurvedic.com/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('ProcessorsMSP.member')"
      Writers:
        Type: Signature
        Rule: "OR('ProcessorsMSP.member')"
      Admins:
        Type: Signature
        Rule: "OR('ProcessorsMSP.admin')"
    AnchorPeers:
      - Host: peer0.processors.ayurvedic.com
        Port: 7051

Capabilities:
  Channel: &ChannelCapabilities
    V2_0: true
  Orderer: &OrdererCapabilities
    V2_0: true
  Application: &ApplicationCapabilities
    V2_0: true

Application: &ApplicationDefaults
  Organizations:
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
    LifecycleEndorsement:
      Type: ImplicitMeta
      Rule: "MAJORITY Endorsement"
    Endorsement:
      Type: ImplicitMeta
      Rule: "MAJORITY Endorsement"

Orderer: &OrdererDefaults
  OrdererType: solo
  Addresses:
    - orderer.ayurvedic.com:7050
  BatchTimeout: 2s
  BatchSize:
    MaxMessageCount: 10
    AbsoluteMaxBytes: 99 MB
    PreferredMaxBytes: 512 KB
  Kafka:
    Brokers:
      - 127.0.0.1:9092
  Organizations:
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
    BlockValidation:
      Type: ImplicitMeta
      Rule: "ANY Writers"

Channel: &ChannelDefaults
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
  Capabilities:
    <<: *ChannelCapabilities

Profiles:
  AyurvedicChannel:
    Consortium: AyurvedicConsortium
    <<: *ChannelDefaults
    Application:
      <<: *ApplicationDefaults
      Organizations:
        - *Farmers
        - *Processors
      Capabilities:
        <<: *ApplicationCapabilities

  OrdererGenesis:
    <<: *ChannelDefaults
    Orderer:
      <<: *OrdererDefaults
      Organizations:
        - *Farmers
      Capabilities:
        <<: *OrdererCapabilities
    Consortiums:
      AyurvedicConsortium:
        Organizations:
          - *Farmers
          - *Processors
```

Generate genesis block:

```bash
# Create genesis block
../bin/configtxgen -profile OrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

# Create channel configuration
../bin/configtxgen -profile AyurvedicChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID ayurvedicchannel

# Create anchor peer updates
../bin/configtxgen -profile AyurvedicChannel -outputAnchorPeersUpdate ./channel-artifacts/FarmersMSPanchors.tx -channelID ayurvedicchannel -asOrg FarmersMSP
../bin/configtxgen -profile AyurvedicChannel -outputAnchorPeersUpdate ./channel-artifacts/ProcessorsMSPanchors.tx -channelID ayurvedicchannel -asOrg ProcessorsMSP
```

### Step 3.4: Start Blockchain Network

Create `docker-compose.yaml`:

```yaml
version: '2'

networks:
  ayurvedic:

services:
  orderer.ayurvedic.com:
    container_name: orderer.ayurvedic.com
    image: hyperledger/fabric-orderer:2.2
    environment:
      - FABRIC_LOGGING_SPEC=INFO
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=FarmersMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ./crypto-config/ordererOrganizations/ayurvedic.com/orderers/orderer.ayurvedic.com/msp:/var/hyperledger/orderer/msp
      - ./crypto-config/ordererOrganizations/ayurvedic.com/orderers/orderer.ayurvedic.com/tls/:/var/hyperledger/orderer/tls
    ports:
      - 7050:7050
    networks:
      - ayurvedic

  peer0.farmers.ayurvedic.com:
    container_name: peer0.farmers.ayurvedic.com
    image: hyperledger/fabric-peer:2.2
    environment:
      - CORE_PEER_ID=peer0.farmers.ayurvedic.com
      - CORE_PEER_ADDRESS=peer0.farmers.ayurvedic.com:7051
      - CORE_PEER_LISTENADDRESS=0.0.0.0:7051
      - CORE_PEER_CHAINCODEADDRESS=peer0.farmers.ayurvedic.com:7052
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052
      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.farmers.ayurvedic.com:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.farmers.ayurvedic.com:7051
      - CORE_PEER_LOCALMSPID=FarmersMSP
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=ayurvedic_ayurvedic
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/farmers.ayurvedic.com/peers/peer0.farmers.ayurvedic.com/msp:/etc/hyperledger/fabric/msp
      - ./crypto-config/peerOrganizations/farmers.ayurvedic.com/peers/peer0.farmers.ayurvedic.com/tls:/etc/hyperledger/fabric/tls
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    ports:
      - 7051:7051
      - 7053:7053
    networks:
      - ayurvedic
```

Start the network:

```bash
# Start network
docker-compose up -d

# Check containers
docker ps

# Check logs
docker logs orderer.ayurvedic.com
docker logs peer0.farmers.ayurvedic.com
```

## Phase 4: Smart Contract Development

### Step 4.1: Create Chaincode Structure

```bash
cd ../blockchain
mkdir chaincode/herb-contract
cd chaincode/herb-contract

# Initialize Go module
go mod init herb-contract

# Create main file
touch main.go
```

### Step 4.2: Implement Smart Contract

Create `main.go`:

```go
package main

import (
    "encoding/json"
    "fmt"
    "strconv"
    "strings"
    "time"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// HerbBatch represents a batch of herbs
type HerbBatch struct {
    BatchID     string    `json:"batchId"`
    Species     string    `json:"species"`
    FarmerID    string    `json:"farmerId"`
    Location    Location  `json:"location"`
    Quality     Quality   `json:"quality"`
    Status      string    `json:"status"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
    History     []History `json:"history"`
}

// Location represents GPS coordinates
type Location struct {
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
    Address   string  `json:"address"`
}

// Quality represents quality metrics
type Quality struct {
    Moisture    float64 `json:"moisture"`
    RootLength  string  `json:"rootLength"`
    Purity      float64 `json:"purity"`
    Photos      []string `json:"photos"`
}

// History represents batch history
type History struct {
    Action    string    `json:"action"`
    Actor     string    `json:"actor"`
    Timestamp time.Time `json:"timestamp"`
    Details   string    `json:"details"`
}

// HerbContract contract for managing herb batches
type HerbContract struct {
    contractapi.Contract
}

// CreateBatch creates a new herb batch
func (hc *HerbContract) CreateBatch(ctx contractapi.TransactionContextInterface,
    batchID string, farmerID string, species string,
    latitude float64, longitude float64, address string) error {

    // Validate input
    if batchID == "" || farmerID == "" || species == "" {
        return fmt.Errorf("batchID, farmerID, and species are required")
    }

    // Check if batch already exists
    existing, err := ctx.GetStub().GetState(batchID)
    if err != nil {
        return err
    }
    if existing != nil {
        return fmt.Errorf("batch %s already exists", batchID)
    }

    // Validate location (basic geo-fencing)
    if !hc.validateLocation(latitude, longitude) {
        return fmt.Errorf("location outside approved regions")
    }

    // Validate season
    if !hc.validateSeason(species) {
        return fmt.Errorf("collection not allowed in current season for %s", species)
    }

    // Create batch
    batch := HerbBatch{
        BatchID:   batchID,
        Species:   species,
        FarmerID:  farmerID,
        Location:  Location{Latitude: latitude, Longitude: longitude, Address: address},
        Status:    "created",
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
        History: []History{
            {
                Action:    "created",
                Actor:     farmerID,
                Timestamp: time.Now(),
                Details:   fmt.Sprintf("Batch created by farmer %s", farmerID),
            },
        },
    }

    // Save to ledger
    batchJSON, err := json.Marshal(batch)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(batchID, batchJSON)
}

// UpdateBatch updates batch information
func (hc *HerbContract) UpdateBatch(ctx contractapi.TransactionContextInterface,
    batchID string, actorID string, action string, details string) error {

    // Get existing batch
    batchJSON, err := ctx.GetStub().GetState(batchID)
    if err != nil {
        return err
    }
    if batchJSON == nil {
        return fmt.Errorf("batch %s does not exist", batchID)
    }

    // Unmarshal
    var batch HerbBatch
    err = json.Unmarshal(batchJSON, &batch)
    if err != nil {
        return err
    }

    // Update batch
    batch.UpdatedAt = time.Now()
    batch.Status = action
    batch.History = append(batch.History, History{
        Action:    action,
        Actor:     actorID,
        Timestamp: time.Now(),
        Details:   details,
    })

    // Save updated batch
    updatedJSON, err := json.Marshal(batch)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(batchID, updatedJSON)
}

// GetBatch returns batch information
func (hc *HerbContract) GetBatch(ctx contractapi.TransactionContextInterface,
    batchID string) (*HerbBatch, error) {

    batchJSON, err := ctx.GetStub().GetState(batchID)
    if err != nil {
        return nil, err
    }
    if batchJSON == nil {
        return nil, fmt.Errorf("batch %s does not exist", batchID)
    }

    var batch HerbBatch
    err = json.Unmarshal(batchJSON, &batch)
    if err != nil {
        return nil, err
    }

    return &batch, nil
}

// GetAllBatches returns all batches
func (hc *HerbContract) GetAllBatches(ctx contractapi.TransactionContextInterface) ([]*HerbBatch, error) {
    resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var batches []*HerbBatch
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var batch HerbBatch
        err = json.Unmarshal(queryResponse.Value, &batch)
        if err != nil {
            return nil, err
        }

        batches = append(batches, &batch)
    }

    return batches, nil
}

// validateLocation checks if location is within approved regions
func (hc *HerbContract) validateLocation(latitude, longitude float64) bool {
    // Rajasthan region bounds (approximate)
    return latitude >= 23.0 && latitude <= 30.0 &&
           longitude >= 69.0 && longitude <= 78.0
}

// validateSeason checks if collection is allowed in current season
func (hc *HerbContract) validateSeason(species string) bool {
    now := time.Now()
    month := int(now.Month())

    // Define seasonal restrictions
    seasons := map[string][]int{
        "Ashwagandha": {10, 11, 12, 1, 2, 3}, // Oct-Mar
        "Brahmi":      {6, 7, 8, 9},          // Jun-Sep
        "Tulsi":       {1, 2, 3, 4, 5, 6},    // Jan-Jun
        "Neem":        {1, 2, 3, 4, 5, 6},    // Jan-Jun
    }

    allowedMonths, exists := seasons[species]
    if !exists {
        return true // Allow if species not defined
    }

    for _, m := range allowedMonths {
        if m == month {
            return true
        }
    }

    return false
}

func main() {
    chaincode, err := contractapi.NewChaincode(new(HerbContract))
    if err != nil {
        fmt.Printf("Error creating herb contract: %s", err.Error())
        return
    }

    if err := chaincode.Start(); err != nil {
        fmt.Printf("Error starting herb contract: %s", err.Error())
    }
}
```

### Step 4.3: Package and Install Chaincode

```bash
# Package chaincode
cd ../../
peer lifecycle chaincode package herb-contract.tar.gz --path ./chaincode/herb-contract --lang golang --label herb-contract_1.0

# Install on peer
peer lifecycle chaincode install herb-contract.tar.gz

# Approve for organization
peer lifecycle chaincode approveformyorg --channelID ayurvedicchannel --name herb-contract --version 1.0 --package-id herb-contract_1.0:... --sequence 1

# Commit chaincode
peer lifecycle chaincode commit --channelID ayurvedicchannel --name herb-contract --version 1.0 --sequence 1
```

## Phase 5: Backend API Development

### Step 5.1: Create Express Server

Create `backend/src/app.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = app;
```

Create `backend/src/server.js`:

```javascript
const app = require('./app');
const { connectDB } = require('./utils/database');

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
```

### Step 5.2: Database Connection

Create `backend/src/utils/database.js`:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurvedic', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

module.exports = { connectDB };
```

### Step 5.3: Fabric SDK Integration

Create `backend/src/utils/fabric.js`:

```javascript
const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

class FabricService {
  constructor() {
    this.walletPath = path.join(process.cwd(), 'wallet');
    this.ccpPath = path.join(process.cwd(), 'connection-profile.json');
  }

  async connectAsUser(userId, orgName = 'Farmers') {
    try {
      // Load connection profile
      const ccp = JSON.parse(fs.readFileSync(this.ccpPath, 'utf8'));

      // Create wallet
      const wallet = await Wallets.newFileSystemWallet(this.walletPath);

      // Check if user exists
      const identity = await wallet.get(userId);
      if (!identity) {
        throw new Error(`Identity ${userId} not found in wallet`);
      }

      // Create gateway
      const gateway = new Gateway();
      await gateway.connect(ccp, {
        wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true }
      });

      return gateway;
    } catch (error) {
      console.error('Fabric connection error:', error);
      throw error;
    }
  }

  async submitTransaction(userId, channelName, chaincodeName, functionName, ...args) {
    let gateway;
    try {
      gateway = await this.connectAsUser(userId);
      const network = await gateway.getNetwork(channelName);
      const contract = network.getContract(chaincodeName);

      const result = await contract.submitTransaction(functionName, ...args);
      return result.toString();
    } catch (error) {
      console.error('Transaction submission error:', error);
      throw error;
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }
  }

  async evaluateTransaction(userId, channelName, chaincodeName, functionName, ...args) {
    let gateway;
    try {
      gateway = await this.connectAsUser(userId);
      const network = await gateway.getNetwork(channelName);
      const contract = network.getContract(chaincodeName);

      const result = await contract.evaluateTransaction(functionName, ...args);
      return result.toString();
    } catch (error) {
      console.error('Transaction evaluation error:', error);
      throw error;
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }
  }
}

module.exports = new FabricService();
```

### Step 5.4: API Routes

Create `backend/src/routes/index.js`:

```javascript
const express = require('express');
const batchRoutes = require('./batchRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Mount routes
router.use('/batches', batchRoutes);
router.use('/users', userRoutes);

module.exports = router;
```

Create `backend/src/routes/batchRoutes.js`:

```javascript
const express = require('express');
const fabricService = require('../utils/fabric');

const router = express.Router();

// Create batch
router.post('/', async (req, res) => {
  try {
    const {
      batchId,
      farmerId,
      species,
      latitude,
      longitude,
      address
    } = req.body;

    const result = await fabricService.submitTransaction(
      'farmer1', // user ID
      'ayurvedicchannel',
      'herb-contract',
      'CreateBatch',
      batchId,
      farmerId,
      species,
      latitude.toString(),
      longitude.toString(),
      address
    );

    res.json({
      success: true,
      message: 'Batch created successfully',
      data: JSON.parse(result)
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get batch
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const result = await fabricService.evaluateTransaction(
      'farmer1',
      'ayurvedicchannel',
      'herb-contract',
      'GetBatch',
      batchId
    );

    res.json({
      success: true,
      data: JSON.parse(result)
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update batch
router.put('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { actorId, action, details } = req.body;

    const result = await fabricService.submitTransaction(
      'processor1',
      'ayurvedicchannel',
      'herb-contract',
      'UpdateBatch',
      batchId,
      actorId,
      action,
      details
    );

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: JSON.parse(result)
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all batches
router.get('/', async (req, res) => {
  try {
    const result = await fabricService.evaluateTransaction(
      'farmer1',
      'ayurvedicchannel',
      'herb-contract',
      'GetAllBatches'
    );

    res.json({
      success: true,
      data: JSON.parse(result)
    });
  } catch (error) {
    console.error('Get all batches error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

## Phase 6: Mobile App Development

### Step 6.1: Basic App Structure

Update `mobile/App.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './screens/HomeScreen';
import CollectionScreen from './screens/CollectionScreen';
import HistoryScreen from './screens/HistoryScreen';
import QRScannerScreen from './screens/QRScannerScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Ayurvedic Traceability' }}
        />
        <Stack.Screen
          name="Collection"
          component={CollectionScreen}
          options={{ title: 'New Collection' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Collection History' }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ title: 'Scan QR Code' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
```

### Step 6.2: GPS Location Service

Create `mobile/services/locationService.ts`:

```typescript
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

class LocationService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location for herb collection tracking',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  watchLocation(callback: (location: LocationData) => void): number {
    return Geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
      }
    );
  }

  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }
}

export default new LocationService();
```

### Step 6.3: API Service

Create `mobile/services/apiService.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api'; // Update for production

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async createBatch(batchData: {
    batchId: string;
    farmerId: string;
    species: string;
    latitude: number;
    longitude: number;
    address: string;
  }): Promise<any> {
    return this.request('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  async getBatch(batchId: string): Promise<any> {
    return this.request(`/batches/${batchId}`);
  }

  async updateBatch(batchId: string, updateData: {
    actorId: string;
    action: string;
    details: string;
  }): Promise<any> {
    return this.request(`/batches/${batchId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getAllBatches(): Promise<any> {
    return this.request('/batches');
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('authToken', data.token);
    return data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }
}

export default new ApiService();
```

### Step 6.4: Collection Screen

Create `mobile/screens/CollectionScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import locationService, { LocationData } from '../services/locationService';
import apiService from '../services/apiService';

type RootStackParamList = {
  Collection: undefined;
  // ... other screens
};

type CollectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Collection'
>;

type Props = {
  navigation: CollectionScreenNavigationProp;
};

const CollectionScreen: React.FC<Props> = ({ navigation }) => {
  const [batchId, setBatchId] = useState('');
  const [farmerId, setFarmerId] = useState('farmer1'); // Default for demo
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required for collection tracking');
        return;
      }

      const currentLocation = await locationService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Failed to get current location');
    }
  };

  const handleSubmit = async () => {
    if (!batchId || !species || !location) {
      Alert.alert('Missing Information', 'Please fill all fields and ensure location is available');
      return;
    }

    setLoading(true);
    try {
      const batchData = {
        batchId,
        farmerId,
        species,
        latitude: location.latitude,
        longitude: location.longitude,
        address: `Lat: ${location.latitude}, Lng: ${location.longitude}`,
      };

      const result = await apiService.createBatch(batchData);

      Alert.alert(
        'Success',
        'Batch created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to create batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Herb Collection</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Batch ID</Text>
        <TextInput
          style={styles.input}
          value={batchId}
          onChangeText={setBatchId}
          placeholder="e.g., ASH-2024-001"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Species</Text>
        <TextInput
          style={styles.input}
          value={species}
          onChangeText={setSpecies}
          placeholder="e.g., Ashwagandha"
        />
      </View>

      <View style={styles.locationGroup}>
        <Text style={styles.label}>Location</Text>
        {location ? (
          <View style={styles.locationInfo}>
            <Text>Latitude: {location.latitude.toFixed(6)}</Text>
            <Text>Longitude: {location.longitude.toFixed(6)}</Text>
            <Text>Accuracy: {location.accuracy?.toFixed(1)}m</Text>
          </View>
        ) : (
          <Text style={styles.locationPlaceholder}>Getting location...</Text>
        )}
        <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
          <Text style={styles.refreshButtonText}>Refresh Location</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Creating Batch...' : 'Create Batch'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  locationGroup: {
    marginBottom: 20,
  },
  locationInfo: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationPlaceholder: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#2196f3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CollectionScreen;
```

## Phase 7: Web Portal Development

### Step 7.1: React App Setup

Update `web/src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

// Components
import Header from './components/Header';
import Home from './pages/Home';
import ScanQR from './pages/ScanQR';
import BatchDetails from './pages/BatchDetails';
import Dashboard from './pages/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<ScanQR />} />
            <Route path="/batch/:batchId" element={<BatchDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

### Step 7.2: QR Scanner Component

Create `web/src/components/QRScanner.tsx`:

```typescript
import React, { useRef, useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import QrScanner from 'react-qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError: (error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const scannerRef = useRef<QrScanner>(null);

  const handleScan = (data: any) => {
    if (data) {
      onScan(data.text);
    }
  };

  const handleError = (error: any) => {
    console.error('QR scan error:', error);
    onError(error);
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  const previewStyle = {
    height: 300,
    width: 300,
  };

  return (
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Scan QR Code
      </Typography>

      <Box sx={{ mb: 2 }}>
        <QrScanner
          ref={scannerRef}
          delay={300}
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
          facingMode={facingMode}
          constraints={{
            video: { facingMode }
          }}
        />
      </Box>

      <Button
        variant="outlined"
        onClick={toggleCamera}
        sx={{ mb: 2 }}
      >
        Switch Camera
      </Button>

      <Typography variant="body2" color="text.secondary">
        Point your camera at the QR code on the product packaging
      </Typography>
    </Paper>
  );
};

export default QRScanner;
```

### Step 7.3: API Service

Create `web/src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async getBatch(batchId: string): Promise<any> {
    return this.request(`/batches/${batchId}`);
  }

  async getAllBatches(): Promise<any> {
    return this.request('/batches');
  }

  async createBatch(batchData: any): Promise<any> {
    return this.request('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  async updateBatch(batchId: string, updateData: any): Promise<any> {
    return this.request(`/batches/${batchId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }
}

export default new ApiService();
```

## Phase 8: Testing and Deployment

### Step 8.1: Unit Testing

Create `backend/src/tests/batchRoutes.test.js`:

```javascript
const request = require('supertest');
const app = require('../app');

describe('Batch Routes', () => {
  describe('POST /api/batches', () => {
    it('should create a new batch', async () => {
      const batchData = {
        batchId: 'TEST-001',
        farmerId: 'farmer1',
        species: 'Ashwagandha',
        latitude: 26.9124,
        longitude: 75.7873,
        address: 'Jaipur, Rajasthan'
      };

      const response = await request(app)
        .post('/api/batches')
        .send(batchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.batchId).toBe('TEST-001');
    });

    it('should return error for invalid data', async () => {
      const invalidData = {
        batchId: '',
        farmerId: 'farmer1',
        species: 'Ashwagandha'
      };

      const response = await request(app)
        .post('/api/batches')
        .send(invalidData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/batches/:batchId', () => {
    it('should return batch details', async () => {
      const response = await request(app)
        .get('/api/batches/TEST-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.batchId).toBe('TEST-001');
    });

    it('should return 404 for non-existent batch', async () => {
      const response = await request(app)
        .get('/api/batches/NONEXISTENT')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
```

### Step 8.2: Integration Testing

Create `backend/src/tests/integration.test.js`:

```javascript
const request = require('supertest');
const app = require('../app');

describe('Integration Tests', () => {
  let testBatchId = 'INT-TEST-001';

  beforeAll(async () => {
    // Clean up any existing test data
  });

  afterAll(async () => {
    // Clean up test data
  });

  it('should complete full batch lifecycle', async () => {
    // 1. Create batch
    const createResponse = await request(app)
      .post('/api/batches')
      .send({
        batchId: testBatchId,
        farmerId: 'farmer1',
        species: 'Ashwagandha',
        latitude: 26.9124,
        longitude: 75.7873,
        address: 'Jaipur, Rajasthan'
      })
      .expect(200);

    expect(createResponse.body.success).toBe(true);

    // 2. Get batch
    const getResponse = await request(app)
      .get(`/api/batches/${testBatchId}`)
      .expect(200);

    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data.status).toBe('created');

    // 3. Update batch (simulate processing)
    const updateResponse = await request(app)
      .put(`/api/batches/${testBatchId}`)
      .send({
        actorId: 'processor1',
        action: 'processed',
        details: 'Batch processed and quality checked'
      })
      .expect(200);

    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.status).toBe('processed');
  });
});
```

### Step 8.3: Deployment Scripts

Create `deploy.sh`:

```bash
#!/bin/bash

# Build and deploy script for Ayurvedic Traceability System

echo "Starting deployment..."

# Build backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Build web app
echo "Building web app..."
cd web
npm run build
cd ..

# Build mobile app
echo "Building mobile app..."
cd mobile
npx expo build:android --type app-bundle
cd ..

# Deploy to server
echo "Deploying to server..."
# Add your deployment commands here
# Example: rsync, docker push, etc.

echo "Deployment completed!"
```

### Step 8.4: Docker Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/ayurvedic
    depends_on:
      - mongodb
    networks:
      - ayurvedic-network

  web:
    build:
      context: ./web
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - ayurvedic-network

  mongodb:
    image: mongo:5.0
    volumes:
      - mongodb_data:/data/db
    networks:
      - ayurvedic-network

  blockchain:
    image: hyperledger/fabric-peer:2.2
    # Add blockchain configuration
    networks:
      - ayurvedic-network

networks:
  ayurvedic-network:
    driver: bridge

volumes:
  mongodb_data:
```

## Phase 9: Documentation and Final Setup

### Step 9.1: Environment Configuration

Create `backend/.env.example`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ayurvedic

# Blockchain Configuration
FABRIC_CHANNEL=ayurvedicchannel
CHAINCODE_NAME=herb-contract

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Step 9.2: README Updates

Update `README.md` with deployment and usage instructions.

### Step 9.3: Final Testing

Run comprehensive tests:

```bash
# Backend tests
cd backend
npm test

# Integration tests
npm run test:integration

# Mobile tests
cd ../mobile
npm test

# Web tests
cd ../web
npm test
```

## Troubleshooting

### Common Issues

1. **Blockchain Network Not Starting**
   - Check Docker is running
   - Verify port availability (7050, 7051, etc.)
   - Check crypto-config directory exists

2. **Chaincode Installation Fails**
   - Ensure Go is properly installed
   - Check chaincode path is correct
   - Verify network is running

3. **API Connection Issues**
   - Check backend server is running on correct port
   - Verify CORS configuration
   - Check network connectivity

4. **Mobile App GPS Issues**
   - Ensure location permissions are granted
   - Check GPS is enabled on device
   - Verify location accuracy settings

### Debug Commands

```bash
# Check blockchain network
docker ps | grep fabric

# View blockchain logs
docker logs peer0.farmers.ayurvedic.com

# Check API server
curl http://localhost:3000/health

# Test database connection
mongosh --eval "db.stats()"
```

## Conclusion

This implementation guide provides a comprehensive roadmap for building the Blockchain-Based Botanical Traceability system. Following these steps will result in a functional prototype that demonstrates the core concepts of transparent, immutable herb supply chain tracking.

The system is designed to be scalable, secure, and user-friendly, addressing the critical need for trust and transparency in the Ayurvedic herbs market. With proper testing and deployment, this prototype can serve as the foundation for a production-ready solution that benefits farmers, manufacturers, and consumers alike.
