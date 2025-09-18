const { expect } = require("chai");

describe("SimpleStorage", function () {
  let simpleStorage;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
  });

  it("Should set the deployer as owner", async function () {
    expect(await simpleStorage.owner()).to.equal(owner.address);
  });

  it("Should start with initial value of 0", async function () {
    expect(await simpleStorage.get()).to.equal(0);
  });

  it("Should store a value", async function () {
    await simpleStorage.set(42);
    expect(await simpleStorage.get()).to.equal(42);
  });

  it("Should emit DataStored event when setting value", async function () {
    await expect(simpleStorage.set(123))
      .to.emit(simpleStorage, "DataStored")
      .withArgs(123, owner.address);
  });

  it("Should allow owner to use restrictedSet", async function () {
    await simpleStorage.restrictedSet(99);
    expect(await simpleStorage.get()).to.equal(99);
  });

  it("Should revert when non-owner tries to use restrictedSet", async function () {
    await expect(
      simpleStorage.connect(addr1).restrictedSet(88)
    ).to.be.revertedWith("Only owner can call this function");
  });
});