//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlantifulERC721 is ERC721Enumerable, Ownable {
  using Strings for uint256;

  enum WateredState { Underwatered, Healthy, Overwatered }
  enum LifecycleState { Seed, Seedling, Young, Mature, Thriving  }

  string baseURI = "ipfs://";
  string public baseExtension = ".json";

  uint256 nextId = 0;

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


  mapping (uint256 => Plant) private _plants;
  mapping (uint256 => uint256[]) private _wateringTimes;

  constructor() ERC721("Plantiful", "PLANT") {}

  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
    baseExtension = _newBaseExtension;
  }

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

  function getPlantWateringTimes(uint256 tokenId) public view returns(uint256[] memory) {
    return _wateringTimes[tokenId];
  }

  function getPlantLifecycleState(uint256 tokenId) public view returns(LifecycleState) {
    Plant memory plant = _plants[tokenId];
    uint256 timeInSecondsSinceBirth = block.timestamp - plant.generatedAt;

    if (timeInSecondsSinceBirth <= 3 days) {
      return LifecycleState.Seed;
    } else if (
      timeInSecondsSinceBirth > 3 days &&
      timeInSecondsSinceBirth <= 7 days
    ) {
      return LifecycleState.Seedling;
    } else if (
      timeInSecondsSinceBirth > 7 days &&
      timeInSecondsSinceBirth <= 14 days
    ) {
      return LifecycleState.Young;
    } else if (
      timeInSecondsSinceBirth > 14 days &&
      timeInSecondsSinceBirth <= 21 days
    ) {
      return LifecycleState.Mature;
    } else {
      return LifecycleState.Thriving;
    }
  }

  function tokenURI(uint256 tokenId)
  public
  view
  virtual
  override
  returns (string memory)
  {
    require(
      _exists(tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );

    string memory currentBaseURI = _baseURI();

    WateredState wateredState = getPlantWateredState(tokenId);
    string memory wateredStatePart = wateredStateToURIString(wateredState);

    LifecycleState lifecyleState = getPlantLifecycleState(tokenId);
    string memory lifecyleStatePart = lifecycleStateToURIString(lifecyleState);

    string memory tokenIdentifier = string(abi.encodePacked(
      tokenId.toString(),
      "-",
      wateredStatePart,
      "-",
      lifecyleStatePart
    ));

    return bytes(currentBaseURI).length > 0
      ? string(abi.encodePacked(currentBaseURI, tokenIdentifier, baseExtension))
      : "";
  }

  function wateredStateToURIString(WateredState wateredState) internal pure returns(string memory) {
    if(wateredState == WateredState.Underwatered) {
      return "underwatered";
    } else if (wateredState == WateredState.Healthy) {
      return "healthy";
    } else if (wateredState == WateredState.Overwatered) {
      return "overwatered";
    } else {
      revert();
    }
  }
  function lifecycleStateToURIString(LifecycleState lifecyleState) internal pure returns(string memory) {
    if(lifecyleState == LifecycleState.Seed) {
      return "seed";
    } else if (lifecyleState == LifecycleState.Seedling) {
      return "seedling";
    } else if (lifecyleState == LifecycleState.Young) {
      return "young";
    } else if (lifecyleState == LifecycleState.Mature) {
      return "mature";
    } else if (lifecyleState == LifecycleState.Thriving) {
      return "thriving";
    } else {
      revert();
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
