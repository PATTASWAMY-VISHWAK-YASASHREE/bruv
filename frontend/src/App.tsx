import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

// Type declarations for EIP-6963
interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
}

interface WalletProvider {
  info: EIP6963ProviderInfo
  provider: any
}

function App() {
  const [account, setAccount] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [recipient, setRecipient] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])
  
  // Contract interaction state
  const [contract, setContract] = useState<any>(null)
  const [batchId, setBatchId] = useState<string>('')
  const [newStage, setNewStage] = useState<string>('1')
  const [itemDetails, setItemDetails] = useState<any>(null)
  const [location, setLocation] = useState<string>('')
  const [crop, setCrop] = useState<string>('')
  const [farmerName, setFarmerName] = useState<string>('')

  // Contract address (deployed on local Hardhat network)
  const CONTRACT_ADDRESS = '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d'
  
  // Contract ABI
  const CONTRACT_ABI = [
    'function addItem(string _location, string _crop, string _farmerName) public returns (uint256)',
    'function updateStage(uint256 _batchId, uint8 _newStage) public',
    'function getItem(uint256 _batchId) public view returns (uint256 batchId, string location, string crop, string farmerName, uint8 stage, address currentOwner, uint256 timestamp)',
    'function getStageName(uint8 _stage) public pure returns (string)'
  ]

  // Initialize contract when wallet connects
  const initializeContract = async (provider: any) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      setContract(contractInstance)
    } catch (err: any) {
      console.error('Failed to initialize contract:', err)
    }
  }

  // Connect to a specific wallet
  const connectWallet = async (wallet?: WalletProvider) => {
    try {
      setError('')

      const provider = wallet ? wallet.provider : window.ethereum
      if (!provider) {
        throw new Error('No Ethereum provider found')
      }

      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]

      setAccount(account)
      setIsConnected(true)

      // Get balance
      await getBalance(account)

      // Initialize contract
      await initializeContract(provider)

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Connection error:', err)
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (window.ethereum) {
        // Revoke permissions if supported
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ 'eth_accounts': {} }]
        })
      }
    } catch (err) {
      // Some wallets may not support revoking permissions, that's okay
      console.log('Could not revoke permissions:', err)
    }

    // Clear state
    setAccount('')
    setBalance('')
    setIsConnected(false)
    setError('')
  }

  // Contract interaction functions
  const addHerbBatch = async () => {
    if (!contract || !location || !crop || !farmerName) {
      setError('Please fill in all fields (location, crop, farmer name)');
      return;
    }

    try {
      setError('')
      const tx = await contract.addItem(location, crop, farmerName);
      await tx.wait();
      setError('✅ Herb batch created successfully! Batch ID will be assigned automatically.');
      // Clear form after successful submission
      setLocation('');
      setCrop('');
      setFarmerName('');
    } catch (err: any) {
      console.error('Error adding batch:', err);
      if (err.message.includes('Batch with this combination already exists')) {
        setError('❌ A batch with this location, crop, and farmer name combination already exists!');
      } else {
        setError('❌ Failed to create batch: ' + err.message);
      }
    }
  };

  const updateBatchStage = async () => {
    if (!contract || !batchId) {
      setError('Please enter a batch ID');
      return;
    }

    try {
      setError('')
      const tx = await contract.updateStage(parseInt(batchId), parseInt(newStage));
      await tx.wait();
      setError('✅ Batch stage updated successfully!');
      // Refresh batch details
      await getBatchDetails();
    } catch (err: any) {
      setError('❌ Failed to update stage: ' + err.message);
    }
  };

  const getBatchDetails = async () => {
    if (!contract || !batchId) {
      setError('Please enter a batch ID');
      return;
    }

    try {
      setError('')
      const [
        id,
        batchLocation,
        batchCrop,
        batchFarmerName,
        stage,
        currentOwner,
        timestamp
      ] = await contract.getItem(parseInt(batchId));

      const stageName = await contract.getStageName(stage);

      setItemDetails({
        batchId: id.toString(),
        location: batchLocation,
        crop: batchCrop,
        farmerName: batchFarmerName,
        stage: stageName,
        owner: currentOwner,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
      });
    } catch (err: any) {
      setError('❌ Failed to get batch details: ' + err.message);
      setItemDetails(null);
    }
  };

  // Get account balance
  const getBalance = async (accountAddress: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(accountAddress)
      const balanceInEth = ethers.formatEther(balance)
      setBalance(parseFloat(balanceInEth).toFixed(4))
    } catch (err: any) {
      setError(`Failed to get balance: ${err.message}`)
    }
  }

  // Send transaction
  const sendTransaction = async () => {
    if (!recipient || !amount) {
      setError('Please enter recipient address and amount')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      })

      setError('Transaction sent! Hash: ' + tx.hash)
      setRecipient('')
      setAmount('')

      // Refresh balance after transaction
      await getBalance(account)
    } catch (err: any) {
      setError(`Transaction failed: ${err.message}`)
    }
  }

  // Listen for account changes
  useEffect(() => {
    // Set up EIP-6963 wallet detection
    const handleWalletAnnouncement = (event: any) => {
      const wallet = event.detail
      setAvailableWallets(prev => {
        // Avoid duplicates
        if (prev.some(w => w.info.uuid === wallet.info.uuid)) {
          return prev
        }
        return [...prev, wallet]
      })
    }

    // Request wallets to announce themselves
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    // Listen for wallet announcements
    window.addEventListener('eip6963:announceProvider', handleWalletAnnouncement)

    // Set up account change listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          getBalance(accounts[0])
        } else {
          setAccount('')
          setBalance('')
          setIsConnected(false)
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleWalletAnnouncement)
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }, [account])

  return (
    <div className="App">
      <h1>MetaMask Transaction UI</h1>

      {!isConnected ? (
        <div className="connect-section">
          <h2>Connect Wallet</h2>
          {availableWallets.length > 0 ? (
            <div className="wallet-list">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.info.uuid}
                  onClick={() => connectWallet(wallet)}
                  className="wallet-button"
                >
                  <img src={wallet.info.icon} alt={wallet.info.name} className="wallet-icon" />
                  {wallet.info.name}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => connectWallet()} className="connect-button">
              Connect MetaMask
            </button>
          )}
        </div>
      ) : (
        <div className="wallet-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Connected Account</h2>
            <button onClick={disconnectWallet} className="disconnect-button">
              Disconnect
            </button>
          </div>
          <p><strong>Address:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} ETH</p>

          <div className="transaction-section">
            <h3>Send Transaction</h3>
            <div className="form-group">
              <label htmlFor="recipient">Recipient Address:</label>
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient((e.target as HTMLInputElement).value)}
                placeholder="0x..."
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount (ETH):</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount((e.target as HTMLInputElement).value)}
                placeholder="0.01"
                className="input-field"
              />
            </div>
            <button onClick={sendTransaction} className="send-button">
              Send Transaction
            </button>
          </div>
        </div>
      )}

      {isConnected && contract && (
        <div className="contract-section">
          <h3>🌿 Ayurvedic Supply Chain Tracker</h3>
          <p>Contract: {CONTRACT_ADDRESS}</p>

          <h4>Create New Herb Batch</h4>
          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation((e.target as HTMLInputElement).value)}
              placeholder="e.g., Kerala Farm"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="crop">Crop Type:</label>
            <input
              id="crop"
              type="text"
              value={crop}
              onChange={(e) => setCrop((e.target as HTMLInputElement).value)}
              placeholder="e.g., Turmeric"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="farmerName">Farmer Name:</label>
            <input
              id="farmerName"
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName((e.target as HTMLInputElement).value)}
              placeholder="e.g., John Doe"
              className="input-field"
            />
          </div>
          <button onClick={addHerbBatch} className="contract-button add-button">
            ➕ Create Herb Batch
          </button>

          <h4>View/Update Existing Batch</h4>
          <div className="form-group">
            <label htmlFor="batchId">Batch ID:</label>
            <input
              id="batchId"
              type="number"
              value={batchId}
              onChange={(e) => setBatchId((e.target as HTMLInputElement).value)}
              placeholder="Enter batch ID"
              className="input-field"
            />
          </div>

          <div className="contract-buttons">
            <button onClick={getBatchDetails} className="contract-button view-button">
              👁️ View Batch Details
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="newStage">Update to Stage:</label>
            <select
              id="newStage"
              value={newStage}
              onChange={(e) => setNewStage((e.target as HTMLSelectElement).value)}
              className="input-field"
            >
              <option value="1">Processed</option>
              <option value="2">Packaged</option>
              <option value="3">Sold</option>
            </select>
            <button onClick={updateBatchStage} className="contract-button update-button">
              🔄 Update Stage
            </button>
          </div>

          {itemDetails && (
            <div className="item-details">
              <h4>Batch Details:</h4>
              <p><strong>Batch ID:</strong> {itemDetails.batchId}</p>
              <p><strong>Location:</strong> {itemDetails.location}</p>
              <p><strong>Crop:</strong> {itemDetails.crop}</p>
              <p><strong>Farmer:</strong> {itemDetails.farmerName}</p>
              <p><strong>Stage:</strong> {itemDetails.stage}</p>
              <p><strong>Owner:</strong> {itemDetails.owner}</p>
              <p><strong>Timestamp:</strong> {itemDetails.timestamp}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  )
}

export default App