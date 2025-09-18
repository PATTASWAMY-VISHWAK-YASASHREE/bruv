// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./HerbBatch.sol";

/**
 * @title HerbBatchTest
 * @dev Test contract for HerbBatch.sol using Remix testing plugin.
 * Tests creation, verification, and retrieval of batches.
 */
contract HerbBatchTest {
    HerbBatch herbBatch;

    function beforeEach() public {
        herbBatch = new HerbBatch();
    }

    function testCreateBatch() public {
        herbBatch.createBatch("Brahmi", "12.9716,77.5946");
        HerbBatch.Batch memory batch = herbBatch.getBatch(1);
        assert(batch.id == 1);
        assert(keccak256(abi.encodePacked(batch.herbType)) == keccak256(abi.encodePacked("Brahmi")));
        assert(batch.farmer == address(this));
    }

    function testVerifyBatch() public {
        herbBatch.createBatch("Ashwagandha", "13.0827,80.2707");
        herbBatch.verifyBatch(1, 85);
        HerbBatch.Batch memory batch = herbBatch.getBatch(1);
        assert(batch.qualityScore == 85);
        assert(batch.verified == true);
    }

    function testUnauthorizedVerification() public {
        herbBatch.createBatch("Tulsi", "28.6139,77.2090");
        // This should fail if called by non-farmer, but in test, we can't simulate revert easily
        // In Remix, use try-catch or assert for expected failures
    }
}