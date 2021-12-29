import { BigNumber } from "ethers";
import { useContractCall } from "@usedapp/core";

import {
  plantifulERC721ContractAddress,
  plantifulERC721ContractInterface,
} from "../contracts";

export type WateredState = "Healthy" | "Underwatered" | "Overwatered";
export type LifecycleState =
  | "Seed"
  | "Seedling"
  | "Growing"
  | "Mature"
  | "Flowering";

export type Plant = {
  id: BigNumber;
  generatedAt: BigNumber;
  lastWateredAt: BigNumber;
  soilDrainageRateInHours: number;
  hp: number;
  lifecycleState: LifecycleState;
  wateredState: WateredState;
};
export type PlantList = Plant[];

interface EnumMapping<T> {
  [id: number]: T;
}

const lifeCycles: EnumMapping<LifecycleState> = {
  0: "Seed",
  1: "Seedling",
  3: "Growing",
  4: "Mature",
  5: "Flowering",
};

const wateredStates: EnumMapping<WateredState> = {
  0: "Healthy",
  1: "Underwatered",
  3: "Overwatered",
};

const lifecycleStateFromApi = (apiValue: number): LifecycleState => {
  return lifeCycles[apiValue];
};

const wateredStateFromApi = (apiValue: number): WateredState => {
  return wateredStates[apiValue];
};

type PlantDetails = [BigNumber, BigNumber, BigNumber, number, number];
type PlantState = [number, number];
type UseGetPlantsResult = [PlantDetails, PlantState][];

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
      [id, generatedAt, lastWateredAt, hp, soilDrainageRateInHours],
      [lifecycleState, wateredState],
    ]) => {
      return {
        id,
        generatedAt,
        lastWateredAt,
        hp,
        soilDrainageRateInHours,
        lifecycleState: lifecycleStateFromApi(lifecycleState),
        wateredState: wateredStateFromApi(wateredState),
      };
    }
  );

  return plants;
};

export default useGetUsersPlants;
