//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlantifulERC721 is ERC721, Ownable {
  enum WateredState { Underwatered, Healthy, Overwatered }

  struct Plant {
    uint256 id;
    uint256 generatedAt;
    uint8 wateringFrequencyInDays;
    uint8 hp;
  }

  struct PlantDetails {
    Plant plant;
    uint256 lastWateredAt;
    WateredState wateredState;
  }


  uint256 nextId = 0;

  mapping (uint256 => Plant) private _plants;
  mapping (uint256 => uint256[]) private _wateringTimes;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function mint(uint8 wateringFrequencyInDays) public onlyOwner {
    Plant storage plant = _plants[nextId];
    plant.id = nextId;
    plant.generatedAt = block.timestamp;
    plant.wateringFrequencyInDays = wateringFrequencyInDays;
    plant.hp = 255;

    _safeMint(msg.sender, nextId);
    nextId++;
  }

  function water(uint256 tokenId) public {
    Plant storage plant = _plants[tokenId];
    require(plant.hp > 0, "Can't water a dead plant");
    require(
      msg.sender == ownerOf(tokenId),
      "You can't water someone else's plant"
    );

    uint256[] storage wateringTimes = _wateringTimes[tokenId];
    wateringTimes.push(block.timestamp);
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
          uint256 numberOfWaterings = _wateringTimes[i].length;
          uint256 lastWateredAt;

          if(numberOfWaterings > 0) {
           lastWateredAt =  _wateringTimes[i][numberOfWaterings - 1];
          }

          WateredState wateredState = getPlantWateredState(i);
          result[resultIndex] = PlantDetails(plant, lastWateredAt, wateredState);
          resultIndex++;
        }
      }

      return result;
    }
  }

  function getPlantWateredState(uint256 tokenId) public view returns(WateredState) {
    Plant memory plant = _plants[tokenId];
    uint256[] memory wateringTimes = _wateringTimes[tokenId];
    uint256 wateringFrequencyInSeconds = uint256(plant.wateringFrequencyInDays) * 24 * 60 * 60;

    if(wateringTimes.length == 0) {
      uint256 nextWaterTime = plant.generatedAt + wateringFrequencyInSeconds;

      if(block.timestamp < nextWaterTime) {
        return WateredState.Healthy;
      } else {
        return WateredState.Underwatered;
      }
    } else {
      uint256 i;
      uint256 wateringCount;
      uint256 searchWindow = block.timestamp - wateringFrequencyInSeconds;

      for(i = wateringTimes.length; i > 0; i--) {
        uint256 wateringTimeForIndex = wateringTimes[i - 1];

        if(wateringTimeForIndex >= searchWindow) {
          wateringCount++;
        } else {
          break;
        }
      }

      if(wateringCount > 1) {
        return WateredState.Overwatered;
      } else if(wateringCount == 0) {
        return WateredState.Underwatered;
      } else {
        return WateredState.Healthy;
      }
    }
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override {
    Plant storage plant = _plants[tokenId];
    require(plant.hp > 0, "Can't transfer a dead plant");
    super._beforeTokenTransfer(from, to, tokenId);
  }
}
