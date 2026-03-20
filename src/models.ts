export type Activity = {
  id: string;
  name: string;
  cost: number;
  category: "Museum" | "Hiking" | "Theater";
  startTime: Date;
};

export type Trip = {
  id: number;
  destination: string;
  startDate: Date;
  activities: Activity[];
};

export type DestinationInfo = {
  currency: string;
  flag: string;
};
