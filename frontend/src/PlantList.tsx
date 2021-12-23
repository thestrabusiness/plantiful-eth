import React, { FC } from "react";
import { useEthers } from "@usedapp/core";

import { useGetUsersPlants } from "./hooks";
import { Plant } from "./hooks/useGetUsersPlants";

interface PlantListItemProps {
  plant: Plant;
}

const PlantListItem: FC<PlantListItemProps> = ({
  plant: { generatedAt, lastWateredAt, droughtResistance, kind },
}) => {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div>Created at: {generatedAt.toString()}</div>
      <div>Last watered at: {lastWateredAt.toString()}</div>
      <div>Drought resistance: {droughtResistance.toString()}</div>
      <div>Kind: {kind}</div>
    </div>
  );
};

const PlantList = () => {
  const { account } = useEthers();
  const plants = useGetUsersPlants(account);

  if (account) {
    return (
      <div>
        <h1>Plant List</h1>
        {plants.map((plant) => {
          return <PlantListItem plant={plant} />;
        })}
      </div>
    );
  }

  return null;
};

export default PlantList;
