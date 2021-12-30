// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as fs from "fs";
import setEnvValue from "./helpers/setEnvValue";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const PlantifulERC721 = await ethers.getContractFactory("PlantifulERC721");
  const plantifulERC721 = await PlantifulERC721.deploy("Plantiful", "PTFL");

  await plantifulERC721.deployed();

  plantifulERC721.mint(3);
  plantifulERC721.mint(4);
  plantifulERC721.mint(5);

  console.log("PlantifulERC721 deployed to:", plantifulERC721.address);
  setEnvValue("REACT_APP_ERC721_CONTRACT_ADDRESS", plantifulERC721.address);
  fs.copyFileSync(
    "./artifacts/contracts/PlantifulERC721.sol/PlantifulERC721.json",
    "./frontend/src/PlantifulERC721.json"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
