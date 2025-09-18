// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedData;
    address public owner;

    event DataStored(uint256 indexed newValue, address indexed setter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        storedData = 0;
    }

    function set(uint256 newValue) public {
        storedData = newValue;
        emit DataStored(newValue, msg.sender);
    }

    function get() public view returns (uint256) {
        return storedData;
    }

    function restrictedSet(uint256 newValue) public onlyOwner {
        storedData = newValue;
        emit DataStored(newValue, msg.sender);
    }
}