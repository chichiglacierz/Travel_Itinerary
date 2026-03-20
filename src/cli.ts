import inquirer from "inquirer";
import type { Trip, Activity } from "./models.ts";
import {
  createTrip,
  addActivity,
  calculateTotalCost,
  filterByCategory,
  getActivitiesByDay,
} from "./services/itineraryService.ts";
import { getDestinationInfo } from "./services/destinationService.ts";

let allTrips: Trip[] = [];

let currentTrip: Trip | null = null;

let begin = false;
let activityCategories: ["Museum", "Hiking", "Theater", "Others"] = [
  "Museum",
  "Hiking",
  "Theater",
  "Others",
];
//Create a trip
const handleCreateTrip = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "destination",
      message: "Where would you like to travel to?",
    },
    {
      type: "input",
      name: "startDate",
      message: "Start date (YYYY-MM-DD):",
    },
  ]);

  const date = new Date(answers.startDate);
  let id = allTrips.length + 1;

  currentTrip = createTrip(answers.destination, date, id);

  allTrips.push(currentTrip);

  console.log("all tripis" + JSON.stringify(allTrips));
  //Destination detailss
  try {
    const info = await getDestinationInfo(answers.destination);
    console.log("Trip to " + currentTrip.destination + " created :))");
    console.log("Currency: " + info.currency);
    console.log("Flag: " + info.flag);
  } catch (error) {
    console.log("Trip to " + currentTrip.destination + " created :))");

    console.error(error);
  }
};

//Add activity
const handleAddActivity = async () => {
  if (!currentTrip) {
    console.log("No trip has been registered. Please create one first.");
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "activityName",
      message: "Activity name:",
    },
    {
      type: "number",
      name: "cost",
      message: "Cost (SEK):",
    },
    {
      type: "input",
      name: "startDate",
      message: "Date (YYYY-MM-DD HH:mm):",
    },
    {
      type: "list",
      name: "category",
      message:
        "Category: Choose one between " +
        activityCategories
          .map((cat, index) => `${index + 1}. ${cat}`)
          .join(", ") +
        " (Enter the number corresponding to the category)",
      choices: activityCategories,
    },
  ]);

  const activity: Activity = {
    id: Date.now().toString(),
    name: answers.activityName,
    cost: answers.cost,
    category:
      activityCategories[parseInt(answers.category) - 1] ||
      activityCategories[activityCategories.length - 1],
    startTime: new Date(answers.startDate),
  };

  let updatedtrip = addActivity(currentTrip, activity);

  allTrips = allTrips.map((trip) =>
    trip.id === currentTrip?.id ? (currentTrip = updatedtrip) : trip,
  );

  console.log("Added " + activity.name);

  console.log("All Trips: " + JSON.stringify(allTrips));
};

//View trip details
const handleViewTrip = async () => {
  // prompt for trip id

  if (allTrips.length === 0) {
    console.log("No trips available to view. Redirecting to main menu...");
    return;
  }

  const tripId = await inquirer.prompt([
    {
      type: "number",
      name: "tripId",
      message: "Enter the trip ID to view details:",
    },
  ]);

  console.log("Trip ID entered: " + tripId.tripId);

  if (tripId.tripId) {
    const tripToView: Trip | undefined = allTrips.find(
      (t) => t.id === parseInt(tripId.tripId),
    );

    console.log("Trip to view: " + JSON.stringify(tripToView));

    if (tripToView === undefined) {
      console.log(
        "Trip with ID " +
          tripId.tripId +
          " not found. Redirecting to main menu...",
      );
      return;
    }

    console.log("\n--- Trip Details ---");
    console.log("Destination: " + tripToView.destination);
    console.log("Start: " + tripToView.startDate.toLocaleDateString());
    console.log("Total cost: " + calculateTotalCost(tripToView) + " SEK");

    // show trip activities
    if (tripToView.activities.length === 0) {
      console.log("No activities added to this trip yet.");
    } else {
      console.log("\n--- Activities ---");
      tripToView.activities.forEach((activity, index) => {
        console.log(index + 1 + ". " + "Activity: " + activity.name);
        console.log("   Cost: " + activity.cost + " SEK");
        console.log("   Category: " + activity.category);
        console.log("   Start Time: " + activity.startTime.toLocaleString());
      });
    }
  } else if (currentTrip) {
    const tripToView = currentTrip;

    console.log("Trip to view: " + JSON.stringify(tripToView));

    console.log("\n--- Trip Details ---");
    console.log("Destination: " + tripToView.destination);
    console.log("Start: " + tripToView.startDate.toLocaleDateString());
    console.log("Total cost: " + calculateTotalCost(tripToView) + " SEK");

    // show trip activities
    if (tripToView.activities.length === 0) {
      console.log("No activities added to this trip yet.");
    } else {
      console.log("\n--- Activities ---");
      tripToView.activities.forEach((activity, index) => {
        console.log(index + 1 + ". " + "Activity: " + activity.name);
        console.log("   Cost: " + activity.cost + " SEK");
        console.log("   Category: " + activity.category);
        console.log("   Start Time: " + activity.startTime.toLocaleString());
      });
    }
  } else if (!currentTrip && !tripId) {
    console.log("No trip has been registered. Redirecting to main menu...");
    return;
  }
};

//View
const handleviewByCategory = async () => {
  if (!currentTrip) {
    console.log("No trip created.");
    return;
  } else {
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "category",
        message: "Select category to filter:",
        choices: activityCategories,
      },
    ]);

    const getcategoryTripData = await filterByCategory(
      allTrips,
      answer.category,
    );

    console.log("getcategoryData: " + JSON.stringify(getcategoryTripData));

    console.log("\n--- Activities in category: " + answer.category + " ---");

    if (getcategoryTripData.length === 0) {
      console.log("No activities in this category.");
    } else {
      getcategoryTripData.forEach((trip) => {
        console.log("Trip: " + trip.destination);

        trip.activities.forEach((activity) => {
          console.log("Trip: " + trip.destination);
          console.log("   Activity: " + activity.name);
          console.log("   Cost: " + activity.cost + " SEK");
          console.log("   Start Time: " + activity.startTime.toLocaleString());
        });
      });
    }
  }
};

//View by day
const handleviewByDay = async () => {
  if (!currentTrip) {
    console.log("No trip created.");
    return;
  } else {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "date",
        message: "Enter date to filter (YYYY-MM-DD):",
      },
    ]);
    const date = new Date(answer.date);
    const getDayData = await getActivitiesByDay(currentTrip, date);

    console.log("\n--- Activities on " + answer.date + " ---");
    if (getDayData.length === 0) {
      console.log("No activities on this day.");
    } else {
      getDayData.forEach((activity, index) => {
        console.log(index + 1 + ". " + "Activity: " + activity.name);
        console.log("   Cost: " + activity.cost + " SEK");
        console.log("   Category: " + activity.category);
      });
    }
  }
};

//View Choice
const mainMenu = async () => {
  begin = true;
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message:
        "What do you want to do?, \n Press 1 to create a trip,  \n Press 2 to add an activity, \n Press 3 to view trip details, \n Press 4 to view activities by category, \n Press 5 to view activities by day, \n Press 6 to view budget, \n Press 7 to exit the program",
      choices: [
        "Create Trip",
        "Add Activity",
        "View Trip",
        "View Activities by Category",
        "View Activities by Day",
        "View Budget",
        "Exit",
      ],
    },
  ]);

  if (answers.action === "1") {
    console.log("Has started: " + begin + " and action is: " + answers.action);

    await handleCreateTrip();

    let ask = await inquirer.prompt([
      {
        type: "confirm",
        name: "addMore",
        message: "Do you want to add an activity Now?",
      },
    ]);
    if (ask.addMore) {
      await handleAddActivity();
    }
  } else if (answers.action === "2") {
    await handleAddActivity();
  } else if (answers.action === "3") {
    await handleViewTrip();
  } else if (answers.action === "4") {
    await handleviewByCategory();
  } else if (answers.action === "5") {
    await handleviewByDay();
  } else if (answers.action === "6") {
    console.log("error");
  } else if (answers.action === "7") {
    begin = false;
    console.log("Goodbye!");
    return;
  }

  while (begin) {
    await mainMenu();
  }
};

console.log("Travel Planner");
mainMenu();
