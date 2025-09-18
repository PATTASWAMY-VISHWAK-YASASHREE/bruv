// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
 * @title AyurvedicToken
 * @dev This contract implements an ERC-20 token for tracking Ayurvedic herbs.
 * It extends the OpenZeppelin ERC20 implementation with additional functionality
 * for managing and tracing Ayurvedic herbs in the supply chain.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AyurvedicToken is ERC20 {
    /*
     * @dev Constructor to initialize the token with a name and symbol
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     */
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        // Mint initial supply to the deployer
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /*
     * @dev Mint new tokens to an address
     * @param to The address to receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /*
     * @dev Transfer tokens from one address to another
     * @param from The address from which tokens will be transferred
     * @param to The address to which tokens will be transferred
     * @param amount The amount of tokens to transfer
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    /*
     * @dev Approve an address to spend tokens on behalf of the sender
     * @param spender The address to be approved
     * @param amount The amount of tokens to approve
     */
    function approve(address spender, uint256 amount) public override returns (bool) {
        return super.approve(spender, amount);
    }

    /*
     * @dev Burn tokens from an address
     * @param account The address from which tokens will be burned
     * @param amount The amount of tokens to burn
     */
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}