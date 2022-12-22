import {CronJob} from 'cron';
import weatherJob from './../scripts/weather-cron';

/**
 * Cron job for updating daily and hourly weather every midnigth at 1 minute
 */
export const updateWeather = new CronJob('00 01 00 * * *', async () => {
  console.log('* Update weather cron *');
  await weatherJob();
});

updateWeather.start();
