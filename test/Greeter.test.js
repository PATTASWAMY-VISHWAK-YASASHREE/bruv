const { expect } = require("chai");

describe("Greeter", function () {
  let greeter;

  beforeEach(async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    greeter = await Greeter.deploy("Hello, world!");
    await greeter.waitForDeployment();
  });

  it("Should return the new greeting once it's changed", async function () {
    expect(await greeter.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });

  it("Should deploy with the correct initial greeting", async function () {
    expect(await greeter.greet()).to.equal("Hello, world!");
  });
});