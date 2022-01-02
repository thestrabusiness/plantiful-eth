import chai, { expect } from "chai";
import hre, { ethers } from "hardhat";
import chaiAsPromised from "chai-as-promised";
import { add } from "date-fns";

import { PlantifulERC721, PlantifulERC721__factory } from "../typechain";
import { wateredStates, lifecycleStates } from "../frontend/src/types";

chai.use(chaiAsPromised);

describe("PlantifulERC721", function () {
  let Contract: PlantifulERC721__factory;
  let contract: PlantifulERC721;
  let ownerAddress: string;

  this.beforeEach(async function () {
    await hre.network.provider.send("hardhat_reset");
  });

  this.beforeEach(async () => {
    Contract = await ethers.getContractFactory("PlantifulERC721");
    contract = await Contract.deploy();
    await contract.deployed();
    ownerAddress = await contract.owner();
  });

  describe("mint", function () {
    it("Should mint a plant with the given wateringFrequencyInDays", async function () {
      const expectedWateringFrequency = 3;
      const mintTx = await contract.mint(expectedWateringFrequency);
      await mintTx.wait();

      const getUsersPlantsResponse = await contract.getUsersPlants(
        ownerAddress
      );
      const actualWateringFrequency =
        getUsersPlantsResponse[0].plant.wateringFrequencyInDays;

      expect(getUsersPlantsResponse.length).to.equal(1);
      expect(actualWateringFrequency).to.equal(expectedWateringFrequency);
    });
  });

  describe("getUsersPlants", function () {
    let address: string;
    const numberOfPlants = 3;

    this.beforeEach(async () => {
      [, { address }] = await ethers.getSigners();

      for (let i = 0; i < numberOfPlants; i++) {
        const mintTx = await contract.mint(3);
        await mintTx.wait();
        const transferTx = await contract.transferFrom(
          ownerAddress,
          address,
          i
        );
        await transferTx.wait();
      }
    });

    it("returns the list of plants for the given user address", async function () {
      const getUsersPlantsResponse = await contract.getUsersPlants(address);
      expect(getUsersPlantsResponse.length).to.equal(numberOfPlants);
    });
  });

  describe("water", function () {
    it("Should push a new timestamp on to the given plants wateringTimes", async function () {
      const mintTx = await contract.mint(1);
      await mintTx.wait();

      const waterTx1 = await contract.water(0);
      await waterTx1.wait();

      const waterTx2 = await contract.water(0);
      await waterTx2.wait();

      const wateringTimes = await contract.getPlantWateringTimes(0);

      expect(wateringTimes.length).to.equal(2);
    });

    it("Should reject an attempt to water another user's plants", async function () {
      const mintTx = await contract.mint(1);
      await mintTx.wait();

      const [, otherSigner] = await ethers.getSigners();
      const withNewSigner = contract.connect(otherSigner);

      const waterTx = withNewSigner.water(0);
      await expect(waterTx).to.eventually.be.rejectedWith(
        Error,
        "VM Exception while processing transaction: reverted with reason string 'You can't water someone else's plant'"
      );
    });
  });

  describe("getPlantWateredState", function () {
    describe("for a plant that was just generated and not yet watered", function () {
      it("returns 'Healthy' when the first watering time hasn't passed", async function () {
        const mintTx = await contract.mint(1);
        await mintTx.wait();

        const wateredState = await contract.getPlantWateredState(0);
        expect(wateredStates[wateredState]).to.equal("Healthy");
      });

      it("returns 'Underwatered' when the first watering has passed", async function () {
        const wateringFrequency = 3;
        const mintTx = await contract.mint(wateringFrequency);
        await mintTx.wait();

        await ethers.provider.send("evm_mine", [
          add(new Date(), { days: wateringFrequency + 1 }).getTime() / 1000,
        ]);

        const wateredState = await contract.getPlantWateredState(0);

        expect(wateredStates[wateredState]).to.equal("Underwatered");
      });
    });

    describe("for a plant that has been watered at least once", function () {
      it("returns 'Healthy' when the plant has been watered once in the watering period", async function () {
        const mintTx = await contract.mint(1);
        await mintTx.wait();

        const waterTx = await contract.water(0);
        await waterTx.wait();

        const wateredState = await contract.getPlantWateredState(0);
        expect(wateredStates[wateredState]).to.equal("Healthy");
      });

      it("returns 'Underwatered' when the plant has not been watered in the watering period", async function () {
        const wateringFrequency = 1;
        const mintTx = await contract.mint(wateringFrequency);
        await mintTx.wait();

        await ethers.provider.send("evm_mine", [
          add(new Date(), { days: wateringFrequency + 1 }).getTime() / 1000,
        ]);

        const wateredState = await contract.getPlantWateredState(0);
        expect(wateredStates[wateredState]).to.equal("Underwatered");
      });

      it("returns 'Overwatered' when the plant has been watered more than once in the watering period", async function () {
        const wateringFrequency = 1;
        const mintTx = await contract.mint(wateringFrequency);
        await mintTx.wait();

        const waterTx = await contract.water(0);
        const waterTx2 = await contract.water(0);
        await waterTx.wait();
        await waterTx2.wait();

        const wateredState = await contract.getPlantWateredState(0);
        expect(wateredStates[wateredState]).to.equal("Overwatered");
      });
    });
  });

  describe("getPlantLifecycleState", function () {
    it("returns 'Seed' for  a plant less than 3 days old", async function () {
      const mintTx = await contract.mint(1);
      await mintTx.wait();

      const lifecyleState = await contract.getPlantLifecycleState(0);
      expect(lifecycleStates[lifecyleState]).to.equal("Seed");
    });

    it("returns 'Seedling' for a plant between 3-7 days old", async function () {
      const mintTx = await contract.mint(1);
      await mintTx.wait();

      await ethers.provider.send("evm_mine", [
        add(new Date(), { days: 4 }).getTime() / 1000,
      ]);

      const lifecyleState = await contract.getPlantLifecycleState(0);
      expect(lifecycleStates[lifecyleState]).to.equal("Seedling");
    });

    it("returns 'Young' for a plant between 7-14 days old", async function () {
      const mintTx = await contract.mint(1);
      await mintTx.wait();

      await ethers.provider.send("evm_mine", [
        add(new Date(), { days: 8 }).getTime() / 1000,
      ]);

      const lifecyleState = await contract.getPlantLifecycleState(0);
      expect(lifecycleStates[lifecyleState]).to.equal("Young");
    });

    it("returns 'Mature' for a plant between 14-21 days old", async function () {
      const mintTx = await contract.mint(1);
      await mintTx.wait();

      await ethers.provider.send("evm_mine", [
        add(new Date(), { days: 15 }).getTime() / 1000,
      ]);

      const lifecyleState = await contract.getPlantLifecycleState(0);
      expect(lifecycleStates[lifecyleState]).to.equal("Mature");
    });

    it("returns 'Thriving' for a plant greater than 21 days old", async function () {
      const mintTx = await contract.mint(1);
      await mintTx.wait();

      await ethers.provider.send("evm_mine", [
        add(new Date(), { days: 22 }).getTime() / 1000,
      ]);

      const lifecyleState = await contract.getPlantLifecycleState(0);
      expect(lifecycleStates[lifecyleState]).to.equal("Thriving");
    });
  });

  describe("tokenURI", function () {
    it("contains the plant's watered state", async function () {
      const wateringFrequency = 1;
      const mintTx = await contract.mint(wateringFrequency);
      await mintTx.wait();

      const waterTx = await contract.water(0);
      const waterTx2 = await contract.water(0);
      await waterTx.wait();
      await waterTx2.wait();

      const tokenUri = await contract.tokenURI(0);
      expect(tokenUri).to.contain("overwatered");
    });

    it("contains the plant's lifecycle state", async function () {
      const wateringFrequency = 1;
      const mintTx = await contract.mint(wateringFrequency);
      await mintTx.wait();

      const tokenUri = await contract.tokenURI(0);
      expect(tokenUri).to.contain("seed");
    });
  });
});
