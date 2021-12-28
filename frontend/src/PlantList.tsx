import React, { FC } from "react";
import { useEthers } from "@usedapp/core";

import { useGetUsersPlants } from "./hooks";
import { Plant } from "./hooks/useGetUsersPlants";
import { BigNumber } from "ethers";

interface PlantListItemProps {
  plant: Plant;
}

const bigNumberToDateString = (value: BigNumber): string => {
  const date = new Date(value.toNumber() * 1000);
  return date.toLocaleString();
};

const bigNumberToHours = (value: BigNumber): number => {
  return Math.round(value.toNumber() / 60 / 60);
};

const PlantListItem: FC<PlantListItemProps> = ({
  plant: { generatedAt, lastWateredAt, droughtResistance, kind },
}) => {
  return (
    <div className="text-center mx-2">
      <div>Created at: {bigNumberToDateString(generatedAt)}</div>
      <div>Last watered at: {bigNumberToDateString(lastWateredAt)}</div>
      <div>Drought resistance: {bigNumberToHours(droughtResistance)} hours</div>
      <div>Kind: {kind}</div>
    </div>
  );
};

const PlantList = () => {
  const { account } = useEthers();
  const plants = useGetUsersPlants(account);

  if (account) {
    return (
      <div className="mx-5">
        <h1 className="text-center text-2xl mb-5">Plant List</h1>
        <div className="flex flex-row">
          {plants.map((plant) => {
            return <PlantListItem plant={plant} />;
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default PlantList;
