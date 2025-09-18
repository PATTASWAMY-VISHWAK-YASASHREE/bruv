// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HerbBatch
 * @dev Contract for managing individual herb batches in the Ayurvedic traceability system.
 * Stores batch details like ID, type, location, and quality score.
 * Adapted from Solidity docs for supply chain traceability.
 */
contract HerbBatch {
    struct Batch {
        uint256 id;
        string herbType;  // e.g., "Brahmi"
        string originLocation;  // GPS coordinates
        uint256 harvestDate;
        address farmer;
        uint8 qualityScore;  // 1-100
        bool verified;
    }

    mapping(uint256 => Batch) public batches;
    uint256 public batchCount;

    event BatchCreated(uint256 id, address farmer);
    event BatchVerified(uint256 id);

    modifier onlyFarmer(uint256 _id) {
        require(batches[_id].farmer == msg.sender, "Only farmer can modify");
        _;
    }

    function createBatch(string memory _herbType, string memory _location) public {
        batchCount++;
        batches[batchCount] = Batch({
            id: batchCount,
            herbType: _herbType,
            originLocation: _location,
            harvestDate: block.timestamp,
            farmer: msg.sender,
            qualityScore: 0,
            verified: false
        });
        emit BatchCreated(batchCount, msg.sender);
    }

    function verifyBatch(uint256 _id, uint8 _score) public onlyFarmer(_id) {
        require(_score >= 1 && _score <= 100, "Invalid score");
        batches[_id].qualityScore = _score;
        batches[_id].verified = true;
        emit BatchVerified(_id);
    }

    function getBatch(uint256 _id) public view returns (Batch memory) {
        return batches[_id];
    }
}