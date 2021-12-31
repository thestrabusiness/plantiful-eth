import { PlantList, wateredStates } from "../types";
import { BigNumber } from "ethers";
import { useContractCall } from "@usedapp/core";

import {
  plantifulERC721ContractAddress,
  plantifulERC721ContractInterface,
} from "../contracts";

type UseGetPlantsResult = [
  [BigNumber, BigNumber, number, number],
  BigNumber,
  number
][];

const useGetUsersPlants = (account: string | null | undefined) => {
  const [results] = (useContractCall(
    account && {
      abi: plantifulERC721ContractInterface,
      address: plantifulERC721ContractAddress,
      method: "getUsersPlants",
      args: [account],
    }
  ) ?? [[]]) as UseGetPlantsResult[];

  const plants: PlantList = results.map(
    ([
      [id, generatedAt, wateringFrequencyInDays, hp],
      lastWateredAt,
      wateredState,
    ]) => {
      return {
        id,
        generatedAt,
        wateringFrequencyInDays,
        hp,
        lastWateredAt,
        wateredState: wateredStates[wateredState],
      };
    }
  );

  return plants;
};

export default useGetUsersPlants;
