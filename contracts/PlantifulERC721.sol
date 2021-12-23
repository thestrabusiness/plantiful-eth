//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlantifulERC721 is ERC721, Ownable {
  enum PlantKind{ MOSS, FERN, CONIFER, FLOWERING }

  struct Plant {
    uint256 generatedAt;
    uint256 lastWateredAt;
    uint256 droughtResistance;
    PlantKind kind;
  }

  uint256 nextId = 0;

  mapping(uint256 => Plant) private _plantDetails;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function mint(uint256 droughtResistance, PlantKind kind) public onlyOwner {
    _plantDetails[nextId] = Plant(
      block.timestamp,
      block.timestamp,
      droughtResistance,
      kind
    );

    _safeMint(msg.sender, nextId);

    nextId++;
  }

  function water(uint256 tokenId) public {
    Plant storage plant = _plantDetails[tokenId];
    require(
      plant.lastWateredAt + plant.droughtResistance > block.timestamp,
      "Can't water a dead plant"
    );
    require(
      msg.sender == ownerOf(tokenId),
      "You can't water someone else's plant"
    );

    plant.lastWateredAt = block.timestamp;
  }

  function getUsersPlants(address user) public view returns(Plant[] memory){
    uint256 tokenCount = balanceOf(user);
    if(tokenCount == 0) {
      return new Plant[](0);
    } else {
      Plant[] memory result = new Plant[](tokenCount);
      uint256 totalPlants = nextId;
      uint256 resultIndex = 0;
      uint256 i;

      for(i=0; i<totalPlants; i++){
        if(ownerOf(i) == user) {
          result[resultIndex] = _plantDetails[i];
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
    Plant storage plant = _plantDetails[tokenId];
    require(
      plant.lastWateredAt + plant.droughtResistance > block.timestamp,
      "Can't transfer a dead plant"
    );

    super._beforeTokenTransfer(from, to, tokenId);
  }
}
