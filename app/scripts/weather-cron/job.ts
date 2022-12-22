import {getCitiesForJob} from './cities';
import {storeWeatherData} from './weather';

// COST for visualcrossing API
// 84 city -> Record 326 cost

// 984 records after first migration
export const weatherJob = async () => {
  try {
    const cities = await getCitiesForJob();
    await storeWeatherData(cities);
  } catch (e) {
    console.error('Weather Cron JOB error:', e);
  }
};
