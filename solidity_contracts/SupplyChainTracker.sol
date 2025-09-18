// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SupplyChainTracker
 * @dev Contract for tracking herb batches through the supply chain stages.
 * Manages transitions from farmer to processor to consumer with unique batch identification.
 */
contract SupplyChainTracker {
    enum Stage { Harvested, Processed, Packaged, Sold }

    struct Item {
        uint256 batchId;
        string location;
        string crop;
        string farmerName;
        Stage stage;
        address currentOwner;
        uint256 timestamp;
    }

    mapping(uint256 => Item) public items;
    mapping(bytes32 => bool) private batchHashes; // To prevent duplicate combinations
    uint256 private nextBatchId = 1;

    event ItemAdded(uint256 batchId, string location, string crop, string farmerName, address owner);
    event StageUpdated(uint256 batchId, Stage newStage, address owner);

    function addItem(string memory _location, string memory _crop, string memory _farmerName) public returns (uint256) {
        // Create a unique hash of the combination to prevent duplicates
        bytes32 batchHash = keccak256(abi.encodePacked(_location, _crop, _farmerName));
        require(!batchHashes[batchHash], "Batch with this combination already exists");

        uint256 batchId = nextBatchId++;
        items[batchId] = Item({
            batchId: batchId,
            location: _location,
            crop: _crop,
            farmerName: _farmerName,
            stage: Stage.Harvested,
            currentOwner: msg.sender,
            timestamp: block.timestamp
        });

        batchHashes[batchHash] = true;
        emit ItemAdded(batchId, _location, _crop, _farmerName, msg.sender);
        return batchId;
    }

    function updateStage(uint256 _batchId, Stage _newStage) public {
        require(items[_batchId].currentOwner == msg.sender, "Not owner");
        require(uint(_newStage) == uint(items[_batchId].stage) + 1, "Invalid stage transition");
        items[_batchId].stage = _newStage;
        items[_batchId].timestamp = block.timestamp;
        emit StageUpdated(_batchId, _newStage, msg.sender);
    }

    function getItem(uint256 _batchId) public view returns (
        uint256 batchId,
        string memory location,
        string memory crop,
        string memory farmerName,
        Stage stage,
        address currentOwner,
        uint256 timestamp
    ) {
        Item memory item = items[_batchId];
        return (
            item.batchId,
            item.location,
            item.crop,
            item.farmerName,
            item.stage,
            item.currentOwner,
            item.timestamp
        );
    }

    function getStageName(Stage _stage) public pure returns (string memory) {
        if (_stage == Stage.Harvested) return "Harvested";
        if (_stage == Stage.Processed) return "Processed";
        if (_stage == Stage.Packaged) return "Packaged";
        if (_stage == Stage.Sold) return "Sold";
        return "Unknown";
    }
}