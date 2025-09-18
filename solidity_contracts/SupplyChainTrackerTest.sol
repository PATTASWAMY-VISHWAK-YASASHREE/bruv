// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SupplyChainTracker.sol";

/**
 * @title SupplyChainTrackerTest
 * @dev Test contract for SupplyChainTracker.sol.
 * Tests item addition and stage updates with location, crop, and farmer data.
 */
contract SupplyChainTrackerTest {
    SupplyChainTracker tracker;

    function beforeEach() public {
        tracker = new SupplyChainTracker();
    }

    function testAddItem() public {
        uint256 batchId = tracker.addItem("Farm A", "Turmeric", "John Doe");
        (
            uint256 id,
            string memory location,
            string memory crop,
            string memory farmerName,
            SupplyChainTracker.Stage stage,
            address owner,
        ) = tracker.getItem(batchId);

        assert(id == 1);
        assert(keccak256(abi.encodePacked(location)) == keccak256(abi.encodePacked("Farm A")));
        assert(keccak256(abi.encodePacked(crop)) == keccak256(abi.encodePacked("Turmeric")));
        assert(keccak256(abi.encodePacked(farmerName)) == keccak256(abi.encodePacked("John Doe")));
        assert(uint(stage) == 0);  // Harvested
        assert(owner == address(this));
    }

    function testPreventDuplicateBatch() public {
        tracker.addItem("Farm A", "Turmeric", "John Doe");

        // This should fail
        try tracker.addItem("Farm A", "Turmeric", "John Doe") {
            assert(false); // Should not reach here
        } catch Error(string memory) {
            // Expected to fail
        }
    }

    function testUpdateStage() public {
        uint256 batchId = tracker.addItem("Farm B", "Ginger", "Jane Smith");
        tracker.updateStage(batchId, SupplyChainTracker.Stage.Processed);

        (
            ,
            ,
            ,
            ,
            SupplyChainTracker.Stage stage,
            ,
        ) = tracker.getItem(batchId);

        assert(uint(stage) == 1);  // Processed
    }
}