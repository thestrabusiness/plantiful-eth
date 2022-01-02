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

interface EnumMapping<T> {
  [id: number]: T;
}

type WateredState = "Underwatered" | "Healthy" | "Overwatered";

export const wateredStates: EnumMapping<WateredState> = {
  0: "Underwatered",
  1: "Healthy",
  2: "Overwatered",
};

type LifecycleState = "Seed" | "Seedling" | "Young" | "Mature" | "Thriving";

export const lifecycleStates: EnumMapping<LifecycleState> = {
  0: "Seed",
  1: "Seedling",
  2: "Young",
  3: "Mature",
  4: "Thriving",
};
