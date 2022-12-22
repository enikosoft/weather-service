import {BadRequest} from './../../exceptions/errors';
import moment, {MomentInput} from 'moment';
import {WeatherDailyLog} from '.';
import {SearchPeriod} from './weather.type';
import {omit} from 'lodash';

export const dateFormat = 'YYYY-MM-DD';

export const getDateFromPeriod = (period: SearchPeriod) => {
  if (period === SearchPeriod.Today) {
    return moment().local().format('YYYY-MM-DD');
  }

  if (period === SearchPeriod.Yesterday) {
    return moment().local().subtract(1, 'day').format('YYYY-MM-DD');
  }

  if (period === SearchPeriod.TwoDaysAgo) {
    return moment().local().subtract(2, 'day').format('YYYY-MM-DD');
  }

  return moment().local().format('YYYY-MM-DD');
};

export const startDateAndEndDateValidation = (startDate: MomentInput, endDate: MomentInput) => {
  const momentStartDate = moment(startDate, dateFormat, true).isValid() ? moment.utc(startDate).toISOString() : false;
  const momentEndDate = moment(endDate, dateFormat, true).isValid() ? moment.utc(endDate).toISOString() : false;

  if ((startDate && !endDate) || (startDate && !endDate)) {
    throw new BadRequest('If using Between Search Type, Start date and End date are required.');
  }

  if (startDate || endDate) {
    if (!momentStartDate || !momentEndDate) {
      throw new BadRequest('Start or end date param is invalid. Please, enter the next format: "YYYY-MM-DD".');
    }

    if (moment(momentEndDate).isSame(momentStartDate) || moment(momentEndDate).isBefore(momentStartDate)) {
      throw new BadRequest('End Date must be older then Start Date.');
    }
  }

  return {
    momentStartDate,
    momentEndDate,
  };
};

export const mapDbValuesToResponse = (model: WeatherDailyLog) => {
  const mutatedModel = omit(model, ['city_id', 'id', 'created_at', 'updated_at']);

  const {temperature, maxTemperature, minTemperature} = mutatedModel;

  return {
    ...mutatedModel,
    temperature: Number(temperature) ? Math.floor(Math.round(temperature)) : null,
    maxTemperature: Number(maxTemperature) ? Math.floor(Math.round(maxTemperature)) : null,
    minTemperature: Number(minTemperature) ? Math.floor(Math.round(minTemperature)) : null,
  };
};
