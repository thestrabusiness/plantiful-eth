import { BigNumber } from "ethers";

export type Plant = {
  id: BigNumber;
  generatedAt: BigNumber;
  wateringFrequencyInDays: number;
  hp: number;
  lastWateredAt: BigNumber;
  wateredState: WateredState;
};

export type PlantList = Plant[];

type WateredState = "Underwatered" | "Healthy" | "Overwatered";

interface EnumMapping<T> {
  [id: number]: T;
}

export const wateredStates: EnumMapping<WateredState> = {
  0: "Underwatered",
  1: "Healthy",
  2: "Overwatered",
};
