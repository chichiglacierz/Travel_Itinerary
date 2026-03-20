import type { DestinationInfo } from "../models.js";

//Fetch destination info
export const getDestinationInfo = async (
  countryName: string,
): Promise<DestinationInfo | undefined> => {
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`,
    );
    const data = await response.json();
    const result: DestinationInfo = {
      currency: Object.keys(data[0].currencies)[0] || "Unknown",
      flag: data[0].flag,
    };
    return result;
  } catch (error) {
    //throw new Error("Could not fetch country data");
    console.log(error);
  }
};
