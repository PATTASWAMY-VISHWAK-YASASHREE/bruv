# API Reference: Blockchain-Based Ayurvedic Herbs Traceability

## Overview

This document provides comprehensive API reference documentation for the
Blockchain-Based Botanical Traceability system. It covers all REST API
endpoints, smart contract functions, data structures, and integration examples.

## Table of Contents

- [REST API Endpoints](#rest-api-endpoints)
- [Smart Contract Functions](#smart-contract-functions)
- [Data Structures](#data-structures)
- [Error Codes](#error-codes)
- [Integration Examples](#integration-examples)

## REST API Endpoints

### Base URL

```http
http://localhost:3000/api
```

### Authentication

All API requests require authentication using JWT tokens in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Batch Management

#### Create Batch

Create a new herb batch in the blockchain ledger.

**Endpoint:** `POST /batches`

**Request Body:**

```json
{
  "batchId": "ASH-2024-001",
  "farmerId": "farmer1",
  "species": "Ashwagandha",
  "latitude": 26.9124,
  "longitude": 75.7873,
  "address": "Jaipur, Rajasthan, India"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Batch created successfully",
  "data": {
    "batchId": "ASH-2024-001",
    "farmerId": "farmer1",
    "species": "Ashwagandha",
    "location": {
      "latitude": 26.9124,
      "longitude": 75.7873,
      "address": "Jaipur, Rajasthan, India"
    },
    "status": "created",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "history": [
      {
        "action": "created",
        "actor": "farmer1",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": "Batch created by farmer farmer1"
      }
    ]
  }
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "success": false,
  "error": "Batch ASH-2024-001 already exists"
}
```

#### Get Batch

Retrieve detailed information about a specific batch.

**Endpoint:** `GET /batches/{batchId}`

**Parameters:**

- `batchId` (path): Unique identifier for the batch

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "batchId": "ASH-2024-001",
    "farmerId": "farmer1",
    "species": "Ashwagandha",
    "location": {
      "latitude": 26.9124,
      "longitude": 75.7873,
      "address": "Jaipur, Rajasthan, India"
    },
    "quality": {
      "moisture": 12.5,
      "rootLength": "15-20cm",
      "purity": 95.2,
      "photos": ["photo1.jpg", "photo2.jpg"]
    },
    "status": "processed",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z",
    "history": [
      {
        "action": "created",
        "actor": "farmer1",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": "Batch created by farmer farmer1"
      },
      {
        "action": "processed",
        "actor": "processor1",
        "timestamp": "2024-01-16T14:20:00Z",
        "details": "Batch processed and quality checked"
      }
    ]
  }
}
```

#### Update Batch

Update batch status and add history entry.

**Endpoint:** `PUT /batches/{batchId}`

**Parameters:**

- `batchId` (path): Unique identifier for the batch

**Request Body:**

```json
{
  "actorId": "processor1",
  "action": "processed",
  "details": "Batch processed and quality checked by certified processor"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Batch updated successfully",
  "data": {
    "batchId": "ASH-2024-001",
    "status": "processed",
    "updatedAt": "2024-01-16T14:20:00Z",
    "history": [
      {
        "action": "created",
        "actor": "farmer1",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": "Batch created by farmer farmer1"
      },
      {
        "action": "processed",
        "actor": "processor1",
        "timestamp": "2024-01-16T14:20:00Z",
        "details": "Batch processed and quality checked by certified processor"
      }
    ]
  }
}
```

#### Get All Batches

Retrieve all batches in the system.

**Endpoint:** `GET /batches`

**Query Parameters:**

- `status` (optional): Filter by batch status (created, processed, packaged,
  shipped, delivered)
- `farmerId` (optional): Filter by farmer ID
- `species` (optional): Filter by herb species
- `limit` (optional): Maximum number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "batchId": "ASH-2024-001",
      "farmerId": "farmer1",
      "species": "Ashwagandha",
      "status": "processed",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "batchId": "BRA-2024-002",
      "farmerId": "farmer2",
      "species": "Brahmi",
      "status": "created",
      "createdAt": "2024-01-16T09:15:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

### User Management

#### User Registration

Register a new user in the system.

**Endpoint:** `POST /users/register`

**Request Body:**

```json
{
  "email": "farmer@example.com",
  "password": "securepassword123",
  "name": "Rajesh Kumar",
  "role": "farmer",
  "organization": "Organic Herbs Co-op",
  "location": {
    "latitude": 26.9124,
    "longitude": 75.7873,
    "address": "Jaipur, Rajasthan, India"
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "user123",
    "email": "farmer@example.com",
    "name": "Rajesh Kumar",
    "role": "farmer",
    "organization": "Organic Herbs Co-op",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### User Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "farmer@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "user123",
      "email": "farmer@example.com",
      "name": "Rajesh Kumar",
      "role": "farmer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### Get User Profile

Retrieve current user profile information.

**Endpoint:** `GET /users/profile`

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "email": "farmer@example.com",
    "name": "Rajesh Kumar",
    "role": "farmer",
    "organization": "Organic Herbs Co-op",
    "location": {
      "latitude": 26.9124,
      "longitude": 75.7873,
      "address": "Jaipur, Rajasthan, India"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLogin": "2024-01-16T09:30:00Z"
  }
}
```

## Smart Contract Functions

### HerbContract

#### CreateBatch

Creates a new herb batch on the blockchain.

**Function Signature:**

```go
func (hc *HerbContract) CreateBatch(ctx contractapi.TransactionContextInterface,
    batchID string, farmerID string, species string,
    latitude float64, longitude float64, address string) error
```

**Parameters:**

- `batchID`: Unique identifier for the batch
- `farmerID`: ID of the farmer creating the batch
- `species`: Herb species name
- `latitude`: GPS latitude coordinate
- `longitude`: GPS longitude coordinate
- `address`: Human-readable location address

**Returns:**

- `error`: nil on success, error message on failure

**Validation Rules:**

- Batch ID must be unique
- Location must be within approved regions (Rajasthan bounds)
- Collection must be in allowed season for the species
- All parameters must be non-empty

#### UpdateBatch

Updates batch status and adds history entry.

**Function Signature:**

```go
func (hc *HerbContract) UpdateBatch(ctx contractapi.TransactionContextInterface,
    batchID string, actorID string, action string, details string) error
```

**Parameters:**

- `batchID`: Unique identifier for the batch
- `actorID`: ID of the actor performing the update
- `action`: Action performed (processed, packaged, shipped, delivered)
- `details`: Detailed description of the action

**Returns:**

- `error`: nil on success, error message on failure

#### GetBatch

Retrieves detailed batch information.

**Function Signature:**

```go
func (hc *HerbContract) GetBatch(ctx contractapi.TransactionContextInterface,
    batchID string) (*HerbBatch, error)
```

**Parameters:**

- `batchID`: Unique identifier for the batch

**Returns:**

- `*HerbBatch`: Batch data structure
- `error`: nil on success, error message on failure

#### GetAllBatches

Retrieves all batches in the system.

**Function Signature:**

```go
func (hc *HerbContract) GetAllBatches(ctx contractapi.TransactionContextInterface)
([]*HerbBatch, error)
```

**Returns:**

- `[]*HerbBatch`: Array of all batch data structures
- `error`: nil on success, error message on failure

## Data Structures

### HerbBatch

Represents a batch of herbs in the blockchain ledger.

```go
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
```

**Fields:**

- `BatchID`: Unique batch identifier
- `Species`: Herb species (Ashwagandha, Brahmi, Tulsi, Neem)
- `FarmerID`: ID of the farmer who created the batch
- `Location`: GPS coordinates and address
- `Quality`: Quality metrics and photos
- `Status`: Current batch status
- `CreatedAt`: Batch creation timestamp
- `UpdatedAt`: Last update timestamp
- `History`: Array of historical actions

### Location

GPS coordinates and address information.

```go
type Location struct {
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
    Address   string  `json:"address"`
}
```

### Quality

Quality assessment data for the herb batch.

```go
type Quality struct {
    Moisture    float64  `json:"moisture"`
    RootLength  string   `json:"rootLength"`
    Purity      float64  `json:"purity"`
    Photos      []string `json:"photos"`
}
```

### History

Historical record of actions performed on a batch.

```go
type History struct {
    Action    string    `json:"action"`
    Actor     string    `json:"actor"`
    Timestamp time.Time `json:"timestamp"`
    Details   string    `json:"details"`
}
```

### User

User account information.

```typescript
interface User {
  userId: string;
  email: string;
  name: string;
  role: 'farmer' | 'processor' | 'lab' | 'manufacturer' | 'retailer';
  organization: string;
  location: Location;
  createdAt: Date;
  lastLogin: Date;
}
```

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

### Blockchain Error Codes

| Error Code | Description |
|------------|-------------|
| BATCH_EXISTS | Batch with given ID already exists |
| BATCH_NOT_FOUND | Batch with given ID not found |
| INVALID_LOCATION | Location outside approved regions |
| INVALID_SEASON | Collection not allowed in current season |
| UNAUTHORIZED | User not authorized for this operation |
| INVALID_PARAMS | Invalid function parameters |

### Common Error Responses

**Validation Error:**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "batchId": "Batch ID is required",
    "species": "Species must be one of: Ashwagandha, Brahmi, Tulsi, Neem"
  }
}
```

**Authentication Error:**

```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please provide a valid JWT token"
}
```

**Blockchain Error:**

```json
{
  "success": false,
  "error": "Blockchain transaction failed",
  "details": "Batch ASH-2024-001 already exists"
}
```

## Integration Examples

### JavaScript/Node.js Integration

```javascript
const axios = require('axios');

class AyurvedicAPI {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createBatch(batchData) {
    try {
      const response = await this.client.post('/batches', batchData);
      return response.data;
    } catch (error) {
      console.error('Create batch failed:', error.response.data);
      throw error;
    }
  }

  async getBatch(batchId) {
    try {
      const response = await this.client.get(`/batches/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('Get batch failed:', error.response.data);
      throw error;
    }
  }

  async updateBatch(batchId, updateData) {
    try {
      const response = await this.client.put(`/batches/${batchId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update batch failed:', error.response.data);
      throw error;
    }
  }
}

// Usage example
const api = new AyurvedicAPI('http://localhost:3000/api', 'your-jwt-token');

async function example() {
  // Create a new batch
  const batchData = {
    batchId: 'ASH-2024-001',
    farmerId: 'farmer1',
    species: 'Ashwagandha',
    latitude: 26.9124,
    longitude: 75.7873,
    address: 'Jaipur, Rajasthan, India'
  };

  const result = await api.createBatch(batchData);
  console.log('Batch created:', result);

  // Get batch details
  const batch = await api.getBatch('ASH-2024-001');
  console.log('Batch details:', batch);

  // Update batch status
  const updateData = {
    actorId: 'processor1',
    action: 'processed',
    details: 'Batch processed and quality checked'
  };

  const updateResult = await api.updateBatch('ASH-2024-001', updateData);
  console.log('Batch updated:', updateResult);
}
```

### React Native Mobile Integration

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BatchData {
  batchId: string;
  farmerId: string;
  species: string;
  latitude: number;
  longitude: number;
  address: string;
}

const API_BASE_URL = 'http://your-server-ip:3000/api';

const BatchManager: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem('authToken');
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();

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
  };

  const createBatch = async (batchData: BatchData) => {
    setLoading(true);
    try {
      const result = await apiRequest('/batches', {
        method: 'POST',
        body: JSON.stringify(batchData),
      });

      Alert.alert('Success', 'Batch created successfully!');
      loadBatches(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      const result = await apiRequest('/batches');
      setBatches(result.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load batches');
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = () => {
    const sampleBatch: BatchData = {
      batchId: `BATCH-${Date.now()}`,
      farmerId: 'farmer1',
      species: 'Ashwagandha',
      latitude: 26.9124,
      longitude: 75.7873,
      address: 'Jaipur, Rajasthan, India'
    };

    createBatch(sampleBatch);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Batch Management
      </Text>

      <Button
        title={loading ? 'Creating...' : 'Create New Batch'}
        onPress={handleCreateBatch}
        disabled={loading}
      />

      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10
      }}>
        Recent Batches:
      </Text>

      {batches.map((batch) => (
        <View key={batch.batchId} style={{
          padding: 10,
          borderWidth: 1,
          marginBottom: 10
        }}>
          <Text>Batch ID: {batch.batchId}</Text>
          <Text>Species: {batch.species}</Text>
          <Text>Status: {batch.status}</Text>
          <Text>Created: {new Date(batch.createdAt).toLocaleDateString()}</Text>
        </View>
      ))}
    </View>
  );
};

export default BatchManager;
```

### Python Integration

```python
import requests
import json
from typing import Dict, List, Optional

class AyurvedicAPIClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })

    def create_batch(self, batch_data: Dict) -> Dict:
        """Create a new herb batch"""
        response = self.session.post(f'{self.base_url}/batches', json=batch_data)
        response.raise_for_status()
        return response.json()

    def get_batch(self, batch_id: str) -> Dict:
        """Get batch details"""
        response = self.session.get(f'{self.base_url}/batches/{batch_id}')
        response.raise_for_status()
        return response.json()

    def update_batch(self, batch_id: str, update_data: Dict) -> Dict:
        """Update batch status"""
        response = self.session.put(f'{self.base_url}/batches/{batch_id}', json=update_data)
        response.raise_for_status()
        return response.json()

    def get_all_batches(self, status: Optional[str] = None) -> List[Dict]:
        """Get all batches with optional status filter"""
        params = {'status': status} if status else {}
        response = self.session.get(f'{self.base_url}/batches', params=params)
        response.raise_for_status()
        return response.json()['data']

# Usage example
if __name__ == '__main__':
    client = AyurvedicAPIClient('http://localhost:3000/api', 'your-jwt-token')

    # Create a batch
    batch_data = {
        'batchId': 'ASH-2024-001',
        'farmerId': 'farmer1',
        'species': 'Ashwagandha',
        'latitude': 26.9124,
        'longitude': 75.7873,
        'address': 'Jaipur, Rajasthan, India'
    }

    try:
        result = client.create_batch(batch_data)
        print('Batch created:', result)

        # Get the batch
        batch = client.get_batch('ASH-2024-001')
        print('Batch details:', batch)

        # Update the batch
        update_data = {
            'actorId': 'processor1',
            'action': 'processed',
            'details': 'Batch processed and quality checked'
        }

        updated = client.update_batch('ASH-2024-001', update_data)
        print('Batch updated:', updated)

    except requests.exceptions.RequestException as e:
        print('API request failed:', e)
```

## Webhook Integration

### Batch Status Change Webhook

The system can send webhook notifications when batch status changes.

**Webhook Payload:**

```json
{
  "event": "batch.status_changed",
  "batchId": "ASH-2024-001",
  "oldStatus": "created",
  "newStatus": "processed",
  "actorId": "processor1",
  "timestamp": "2024-01-16T14:20:00Z",
  "details": "Batch processed and quality checked",
  "batch": {
    "batchId": "ASH-2024-001",
    "species": "Ashwagandha",
    "farmerId": "farmer1",
    "location": {
      "latitude": 26.9124,
      "longitude": 75.7873,
      "address": "Jaipur, Rajasthan, India"
    }
  }
}
```

### Quality Alert Webhook

Sent when quality metrics fall outside acceptable ranges.

**Webhook Payload:**

```json
{
  "event": "batch.quality_alert",
  "batchId": "ASH-2024-001",
  "alertType": "moisture_high",
  "threshold": 15.0,
  "actual": 18.5,
  "severity": "warning",
  "timestamp": "2024-01-16T14:20:00Z",
  "recommendations": [
    "Reduce moisture content through proper drying",
    "Monitor storage conditions"
  ]
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authenticated requests:** 1000 requests per hour per user
- **Unauthenticated requests:** 100 requests per hour per IP
- **Batch creation:** 50 batches per hour per user

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Versioning

The API uses semantic versioning:

- **Current version:** v1.0.0
- **Base path:** `/api/v1/`
- **Backward compatibility:** Maintained for all v1.x.x releases

## Support

For API support and questions:

- **Documentation:** <https://api.ayurvedic-traceability.com/docs>
- **Support Email:** <api-support@ayurvedic-traceability.com>
- **Status Page:** <https://status.ayurvedic-traceability.com>
- **Community Forum:** <https://community.ayurvedic-traceability.com>
