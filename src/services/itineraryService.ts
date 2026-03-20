import type { Activity, Trip } from "../models.js";

//Calculate cost
export const calculateTotalCost = (trip: Trip): number =>
  trip.activities.reduce((sum, activity) => sum + activity.cost, 0);

//add activity
export const addActivity = (trip: Trip, activity: Activity): Trip => {
  const newActivities = [...trip.activities, activity];

  return {
    ...trip,
    activities: newActivities,
  };
};

//Create a trip
export const createTrip = (
  destination: string,
  startDate: Date,
  id: number,
): Trip => {
  return {
    id,
    destination,
    startDate,
    activities: [],
  };
};

//Filter catergory
export const filterByCategory = (
  allTrips: Trip[],
  category: string,
): Trip[] => {
  let categoryTrips: Trip[] = [];

  console.log("Filtering by category: " + category);

  allTrips.forEach((trip) => {
    trip.activities.filter((activity) => {
      console.log(activity);

      if (activity.category.toLowerCase() === category.toLowerCase()) {
        categoryTrips.push(trip);
        // return true;
      }
    });

    return categoryTrips;
  });
  // return categoryTrips.reduce((activities, trip) => [...activities, ...trip.activities], []);

  return categoryTrips;
};

//Sort activities
export const sortActivitiesByTime = (trip: Trip): Activity[] => {
  const sortedActivities = [...trip.activities];

  sortedActivities.sort(
    (activity1, activity2) =>
      activity1.startTime.getTime() - activity2.startTime.getTime(),
  );

  return sortedActivities;
};

//filter activity by a specific day
export const getActivitiesByDay = (trip: Trip, date: Date): Activity[] => {
  return trip.activities.filter(
    (activity) =>
      activity.startTime.getFullYear() === date.getFullYear() &&
      activity.startTime.getMonth() === date.getMonth() &&
      activity.startTime.getDate() === date.getDate(),
  );
};
