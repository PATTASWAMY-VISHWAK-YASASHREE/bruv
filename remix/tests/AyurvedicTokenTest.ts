// SPDX-License-Identifier: MIT
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("AyurvedicToken", function () {
  let AyurvedicToken: Contract;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let addrs: Signer[];

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const AyurvedicTokenFactory = await ethers.getContractFactory("AyurvedicToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract with an initial supply of 1000 tokens.
    AyurvedicToken = await AyurvedicTokenFactory.deploy(1000);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await AyurvedicToken.owner()).to.equal(await owner.getAddress());
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await AyurvedicToken.balanceOf(await owner.getAddress());
      expect(await AyurvedicToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await AyurvedicToken.transfer(await addr1.getAddress(), 50);
      const addr1Balance = await AyurvedicToken.balanceOf(await addr1.getAddress());
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await AyurvedicToken.connect(addr1).transfer(await addr2.getAddress(), 50);
      const addr2Balance = await AyurvedicToken.balanceOf(await addr2.getAddress());
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await AyurvedicToken.balanceOf(await owner.getAddress());

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        AyurvedicToken.connect(addr1).transfer(await owner.getAddress(), 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await AyurvedicToken.balanceOf(await owner.getAddress())).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await AyurvedicToken.balanceOf(await owner.getAddress());

      // Transfer 100 tokens from owner to addr1.
      await AyurvedicToken.transfer(await addr1.getAddress(), 100);

      // Transfer another 50 tokens from owner to addr2.
      await AyurvedicToken.transfer(await addr2.getAddress(), 50);

      // Check balances.
      const finalOwnerBalance = await AyurvedicToken.balanceOf(await owner.getAddress());
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

      const addr1Balance = await AyurvedicToken.balanceOf(await addr1.getAddress());
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await AyurvedicToken.balanceOf(await addr2.getAddress());
      expect(addr2Balance).to.equal(50);
    });
  });
});