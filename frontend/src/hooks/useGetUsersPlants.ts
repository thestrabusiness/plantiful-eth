import { BigNumber } from "ethers";
import { useContractCall } from "@usedapp/core";

import {
  plantifulERC721ContractAddress,
  plantifulERC721ContractInterface,
} from "../contracts";

export type Plant = {
  generatedAt: BigNumber;
  lastWateredAt: BigNumber;
  droughtResistance: BigNumber;
  kind: unknown;
};
export type PlantList = Plant[];

type UseGetPlantsResult = [BigNumber, BigNumber, BigNumber, unknown][];

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
    ([generatedAt, lastWateredAt, droughtResistance, kind]) => {
      return {
        generatedAt,
        lastWateredAt,
        droughtResistance,
        kind,
      };
    }
  );

  return plants;
};

export default useGetUsersPlants;
