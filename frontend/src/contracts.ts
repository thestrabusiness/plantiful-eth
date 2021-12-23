import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import plantERC721JSON from "./PlantifulERC721.json";

const plantifulERC721ContractAddress = process.env
  .REACT_APP_ERC721_CONTRACT_ADDRESS as string;

const plantifulERC721ContractInterface = new ethers.utils.Interface(
  plantERC721JSON.abi
);
const plantifulERC721Contract = new Contract(
  plantifulERC721ContractAddress,
  plantifulERC721ContractInterface
);

export {
  plantifulERC721Contract,
  plantifulERC721ContractAddress,
  plantifulERC721ContractInterface,
};
