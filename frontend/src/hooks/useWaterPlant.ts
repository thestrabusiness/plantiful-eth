import { useContractFunction } from "@usedapp/core";

import { plantifulERC721Contract } from "../contracts";

const useWaterPlant = () => {
  const { state, send } = useContractFunction(plantifulERC721Contract, "water");
  return { state, send };
};

export default useWaterPlant;
