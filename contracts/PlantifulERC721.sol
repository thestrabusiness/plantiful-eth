//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlantifulERC721 is ERC721, Ownable {
  enum LifecycleState { Seed, Seedling, Growing, Mature, Flowering }
  enum WateredState { Healthy, Underwatered, Overwatered }

  struct Plant {
    uint256 id;
    uint256 generatedAt;
    uint256 lastWateredAt;
    uint8 hp;
    uint8 moistureSensitivity;
    uint8 soilDrainageRateInHours;
  }

  struct PlantState {
    LifecycleState lifecycleState;
    WateredState wateredState;
  }

  struct PlantDetails {
    Plant plant;
    PlantState state;
  }

  uint256 nextId = 0;

  mapping(uint256 => Plant) private _plants;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function mint(uint8 moistureSensitivity, uint8 soilDrainageRateInHours) public onlyOwner {
    _plants[nextId] = Plant(nextId, block.timestamp, block.timestamp, 255, moistureSensitivity, soilDrainageRateInHours);
    _safeMint(msg.sender, nextId);
    nextId++;
  }

  function requireAlivePlant(uint8 hp) private pure {
    require(hp > 0, "Can't water a dead plant");
  }

  function requireOwner(uint256 tokenId) private view {
    require(
      msg.sender == ownerOf(tokenId),
      "You can't water someone else's plant"
    );
  }

  function calculateLifecycleState(uint256 generatedAt) private view returns(LifecycleState) {
    uint256 timeInSecondsSinceBirth = block.timestamp - generatedAt;

    if (timeInSecondsSinceBirth <= 3 days) {
      return LifecycleState.Seed;
    } else if (
      timeInSecondsSinceBirth > 3 days &&
      timeInSecondsSinceBirth <= 7 days
    ) {
      return LifecycleState.Seedling;
    } else if (
      timeInSecondsSinceBirth > 3 days &&
      timeInSecondsSinceBirth <= 14 days
    ) {
      return LifecycleState.Growing;
    } else if (
      timeInSecondsSinceBirth > 14 days &&
      timeInSecondsSinceBirth <= 21 days
    ) {
      return LifecycleState.Mature;
    } else {
      return LifecycleState.Flowering;
    }
  }

  function calculatePlantState(Plant memory plant) private view returns(PlantState memory) {
    LifecycleState lifecycleState = calculateLifecycleState(plant.generatedAt);
    // TODO: Write function to calculate watered state
    // wateredState = calculateWateredState(
    //   plant.lastWateredAt,
    //   plant.moistureSensitivity
    // );
    return PlantState(lifecycleState, WateredState.Healthy);
  }

  function water(uint256 tokenId) public {
    requireOwner(tokenId);
    Plant storage plant = _plants[tokenId];
    requireAlivePlant(plant.hp);
    plant.lastWateredAt = block.timestamp;
  }

  function getUsersPlants(address user) public view returns(PlantDetails[] memory) {
    uint256 tokenCount = balanceOf(user);
    if(tokenCount == 0) {
      return new PlantDetails[](0);
    } else {
      PlantDetails[] memory result = new PlantDetails[](tokenCount);
      uint256 totalPlants = nextId;
      uint256 resultIndex = 0;
      uint256 i;

      for(i = 0; i < totalPlants; i++) {
        if(ownerOf(i) == user) {

          Plant memory plant = _plants[i];
          PlantState memory state = calculatePlantState(plant);
          result[resultIndex] = PlantDetails(plant, state);
          resultIndex++;
        }
      }

      return result;
    }
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override {
    Plant storage plant = _plants[tokenId];
    requireAlivePlant(plant.hp);

    super._beforeTokenTransfer(from, to, tokenId);
  }
}
