# System Architecture Guide

## Overview

The Blockchain-Based Botanical Traceability system for Ayurvedic herbs is built on a modular, scalable architecture that ensures security, transparency, and efficiency throughout the herb supply chain. This document provides a comprehensive breakdown of the system's architectural components, data flows, and technical design decisions.

## Core Architectural Principles

### 1. Permissioned Blockchain Foundation

The system is built on a **permissioned blockchain network** rather than a public blockchain for several critical reasons:

- **Enterprise Control**: Only authorized participants (farmers, processors, labs, manufacturers) can join and write to the network
- **Performance**: Higher transaction throughput compared to public blockchains
- **Privacy**: Sensitive business data remains within the network
- **Compliance**: Easier to meet regulatory requirements for data handling

### 2. Hybrid Data Storage

The architecture employs a **hybrid approach** combining blockchain with traditional databases:

- **On-Chain**: Critical traceability data, timestamps, and immutable records
- **Off-Chain**: Large files (photos, documents), detailed analytics, and user interface data

### 3. Microservices Design

The backend is structured as **loosely coupled microservices**:

- **Scalability**: Each service can scale independently
- **Technology Flexibility**: Different services can use different technologies
- **Fault Isolation**: Failure in one service doesn't bring down the entire system
- **Team Autonomy**: Different teams can work on different services

## System Components

### 1. Blockchain Layer

#### Hyperledger Fabric Network

.
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Orderer       │    │   Peer Node     │    │   Peer Node     │
│   (Consensus)   │◄──►│   (Farmer)      │◄──►│   (Processor)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Certificate   │
                    │   Authority     │
                    └─────────────────┘
```

**Components**:

- **Orderer Nodes**: Handle transaction ordering and consensus
- **Peer Nodes**: Maintain ledger copies and execute chaincode
- **Certificate Authority**: Manages digital identities and certificates
- **Chaincode (Smart Contracts)**: Business logic for herb traceability

#### Smart Contract Structure

```go
// Main contract for herb batch management
type HerbContract struct {
    // Core functions
    CreateBatch(ctx, batchID, farmerID, location, species)
    UpdateBatch(ctx, batchID, processorID, qualityData)
    TransferBatch(ctx, batchID, fromID, toID)
    VerifyBatch(ctx, batchID)
}
```

### 2. Backend Services Layer

#### API Gateway

```
┌─────────────────┐
│   API Gateway   │
│  (Express.js)   │
├─────────────────┤
│ • Authentication │
│ • Rate Limiting  │
│ • Request Routing│
│ • Logging        │
└─────────────────┘
```

**Responsibilities**:

- **Authentication**: JWT token validation and user session management
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Prevent abuse and ensure fair resource usage
- **Request Routing**: Direct requests to appropriate microservices

#### Microservices Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Auth Service   │    │  Batch Service  │    │  Analytics     │
│                 │    │                 │    │  Service       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • User Mgmt     │    │ • Batch CRUD    │    │ • Reports      │
│ • Permissions   │    │ • Validation    │    │ • Dashboards   │
│ • Sessions      │    │ • History       │    │ • Metrics      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3. Data Layer

#### On-Chain Storage

```json
{
  "batch": {
    "id": "ASH-2024-001",
    "species": "Withania somnifera",
    "farmer": "Ram Singh",
    "location": {
      "lat": 26.9124,
      "lng": 75.7873,
      "timestamp": "2024-03-15T06:30:00Z"
    },
    "quality": {
      "moisture": 8.0,
      "rootLength": "15-20cm"
    },
    "history": [
      {
        "stage": "collection",
        "actor": "Ram Singh",
        "timestamp": "2024-03-15T06:30:00Z"
      }
    ]
  }
}
```

#### Off-Chain Storage

```
MongoDB Collections:
├── batches (metadata, large files references)
├── users (profiles, permissions)
├── analytics (computed metrics)
└── audit_logs (system events)
```

### 4. Mobile Applications

#### Collector App Architecture

```
┌─────────────────┐
│   React Native  │
├─────────────────┤
│ • GPS Module    │
│ • Camera        │
│ • Offline Sync  │
│ • QR Generator  │
└─────────────────┘
```

**Key Features**:

- **Offline-First**: Works without internet connectivity
- **GPS Integration**: Automatic location capture
- **Photo Capture**: Visual documentation of herbs
- **Data Synchronization**: Syncs when connectivity returns

### 5. Consumer Portal

#### Web Application Architecture

```
┌─────────────────┐
│    React.js     │
├─────────────────┤
│ • QR Scanner    │
│ • Map Display   │
│ • Timeline View │
│ • Certificate   │
│   Viewer        │
└─────────────────┘
```

## Data Flow Architecture

### Herb Journey Data Flow

```
1. Collection Phase
   Farmer App → GPS Capture → Local Storage → Sync → Blockchain

2. Processing Phase
   Processor App → Quality Check → Lab Results → Blockchain Update

3. Manufacturing Phase
   Manufacturer System → Batch Mixing → QR Generation → Packaging

4. Consumer Phase
   Consumer Portal → QR Scan → Blockchain Query → Journey Display
```

### Real-Time Synchronization Flow

```
Mobile App          API Gateway         Blockchain         Database
    │                     │                     │                │
    ├─── Capture Data ───►│                     │                │
    │                     ├─── Validate ───────►│                │
    │                     │                     ├─── Store ─────►│
    │                     │                     │                ├─── Index ───►
    │◄─── Confirmation ────┤◄─── Receipt ────────┤◄─── Hash ──────┤
```

## Security Architecture

### Identity Management

```
Certificate Authority
        │
        ├── Farmer Certificates
        ├── Processor Certificates
        ├── Lab Certificates
        └── Manufacturer Certificates
```

### Access Control

- **Role-Based Access Control (RBAC)**: Different permissions for different roles
- **Attribute-Based Access Control (ABAC)**: Context-aware permissions
- **Multi-Signature Transactions**: Require multiple approvals for critical operations

### Data Encryption

- **At Rest**: AES-256 encryption for database storage
- **In Transit**: TLS 1.3 for all network communications
- **On Chain**: Cryptographic hashing for data integrity

## Scalability Architecture

### Horizontal Scaling

```
Load Balancer
    │
    ├── API Server 1
    ├── API Server 2
    └── API Server 3
```

### Database Sharding

```
MongoDB Cluster
├── Shard 1 (Batches A-M)
├── Shard 2 (Batches N-Z)
└── Config Servers
```

### Blockchain Scaling

- **Channel Partitioning**: Separate channels for different herb types
- **State Database Optimization**: LevelDB/CouchDB for efficient queries
- **Off-Chain Storage**: Large files stored externally with hash references

## Deployment Architecture

### Development Environment

```
Local Development
├── Docker Compose
│   ├── Hyperledger Fabric
│   ├── MongoDB
│   └── Redis
└── VS Code Dev Containers
```

### Production Environment

```
Kubernetes Cluster
├── Ingress Controller
├── Service Mesh (Istio)
├── Blockchain Network
├── Application Pods
└── Monitoring Stack
```

## Monitoring and Observability

### Application Monitoring

```
Prometheus → Grafana Dashboards
    │
    ├── API Response Times
    ├── Error Rates
    ├── Blockchain Performance
    └── User Activity
```

### Blockchain Monitoring

- **Transaction Throughput**: Monitor network performance
- **Block Creation Time**: Ensure timely consensus
- **Peer Health**: Monitor node availability
- **Chaincode Performance**: Track smart contract execution

## Integration Architecture

### External Systems Integration

```
┌─────────────────┐    ┌─────────────────┐
│   Weather API   │    │   Lab Systems   │
│                 │    │                 │
├─────────────────┤    ├─────────────────┤
│ • Real-time     │    │ • Test Results  │
│   Conditions    │    │ • Certificates  │
└─────────────────┘    └─────────────────┘
```

### API Integration Patterns

- **REST APIs**: For synchronous operations
- **Webhooks**: For event-driven updates
- **Message Queues**: For asynchronous processing
- **File Transfers**: For bulk data operations

## Performance Optimization

### Caching Strategy

```
Redis Cache Layers:
├── Session Cache (5 min TTL)
├── API Response Cache (1 hour TTL)
├── Blockchain Query Cache (24 hour TTL)
└── Static Asset Cache (1 week TTL)
```

### Database Optimization

- **Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Efficient query patterns
- **Connection Pooling**: Reuse database connections
- **Read Replicas**: Distribute read load

## Disaster Recovery

### Backup Strategy

- **Blockchain Data**: Regular state snapshots
- **Database**: Daily backups with point-in-time recovery
- **Application Code**: Version-controlled with rollback capability

### High Availability

- **Multi-AZ Deployment**: Cross availability zone redundancy
- **Load Balancing**: Automatic failover
- **Database Replication**: Master-slave replication
- **Blockchain Redundancy**: Multiple peer nodes per organization

## Conclusion

This architecture provides a robust, scalable, and secure foundation for the Ayurvedic herbs traceability system. The modular design allows for independent scaling of components, while the blockchain foundation ensures immutability and transparency. The hybrid data approach balances performance with data integrity, making the system both efficient and trustworthy.

The architecture is designed to handle the complexities of a multi-stakeholder supply chain while maintaining the performance and usability required for real-world deployment.
