import React, { FC } from "react";
import { useEthers } from "@usedapp/core";

import { useGetUsersPlants, useWaterPlant } from "./hooks";
import { Plant } from "./hooks/useGetUsersPlants";
import { BigNumber } from "ethers";

interface PlantListItemProps {
  plant: Plant;
}

const bigNumberToDateString = (value: BigNumber): string => {
  const date = new Date(value.toNumber() * 1000);
  return date.toLocaleString();
};

const PlantListItem: FC<PlantListItemProps> = ({
  plant: {
    id,
    generatedAt,
    wateringFrequencyInDays,
    hp,
    lastWateredAt,
    wateredState,
  },
}) => {
  const { state, send: waterPlant } = useWaterPlant();

  const sendingTransaction = state.status === "Mining";
  const buttonLabel = sendingTransaction ? "Watering..." : "Water";

  const lastWateredAtText = lastWateredAt.gt(0)
    ? bigNumberToDateString(lastWateredAt)
    : "never";

  return (
    <div className="text-center mx-2">
      <div>Created at: {bigNumberToDateString(generatedAt)}</div>
      <div>HP: {hp}</div>
      <div>Water every {wateringFrequencyInDays} day(s)</div>
      <div>Last watered at {lastWateredAtText}</div>
      <div>{wateredState}</div>
      <button
        className="bg-blue-100 border border-blue-200 px-4 py-2 my-2"
        onClick={() => {
          waterPlant(id);
        }}
        disabled={sendingTransaction}
      >
        {buttonLabel}
      </button>
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
