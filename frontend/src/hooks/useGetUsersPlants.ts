import { BigNumber } from "ethers";
import { useContractCall } from "@usedapp/core";

import {
  plantifulERC721ContractAddress,
  plantifulERC721ContractInterface,
} from "../contracts";

export type Plant = {
  id: BigNumber;
  generatedAt: BigNumber;
  wateringFrequencyInDays: number;
  hp: number;
  lastWateredAt: BigNumber;
  wateredState: WateredState;
};
export type PlantList = Plant[];

type UseGetPlantsResult = [
  [BigNumber, BigNumber, number, number],
  BigNumber,
  number
][];

export type WateredState = "Underwatered" | "Healthy" | "Overwatered";

interface EnumMapping<T> {
  [id: number]: T;
}

const wateredStates: EnumMapping<WateredState> = {
  0: "Underwatered",
  1: "Healthy",
  2: "Overwatered",
};

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
