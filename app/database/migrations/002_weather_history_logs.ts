import {Knex} from 'knex';

exports.up = async function (knex: Knex) {
  await knex.schema.createTable('weather_daily_logs', (table) => {
    table.increments('id');

    table.integer('city_id').references('id').inTable('cities').onDelete('CASCADE');

    table.float('temperature').nullable();
    table.float('maxTemperature').nullable();
    table.float('minTemperature').nullable();
    table.float('precipitation').nullable();
    table.float('seaLevelPressure').nullable();
    table.float('relativeHumidity').nullable();
    table.float('visibility').nullable();
    table.float('windSeed').nullable();
    table.float('cloudcover').nullable();
    table.float('snow').nullable();
    table.float('dewPoint').nullable();
    table.float('windGust').nullable();
    table.float('windDirection').nullable();
    table.dateTime('datetime').nullable();
    table.dateTime('sunrise').nullable();
    table.dateTime('sunset').nullable();
    table.float('moonphase').nullable();

    table.timestamps(true, true);

    table.index(['id', 'city_id']);
  });

  await knex.schema.createTable('weather_hourly_logs', (table) => {
    table.increments('id');

    table.integer('city_id').references('id').inTable('cities').onDelete('CASCADE');

    table.float('temperature').nullable();
    table.float('feelslike').nullable();
    table.float('precipitation').nullable();
    table.float('seaLevelPressure').nullable();
    table.float('relativeHumidity').nullable();
    table.float('visibility').nullable();
    table.float('windSeed').nullable();
    table.float('cloudcover').nullable();
    table.float('snow').nullable();
    table.float('dewPoint').nullable();
    table.float('windGust').nullable();
    table.float('windDirection').nullable();
    table.dateTime('datetime').nullable();
    table.integer('datetimeEpoch').nullable();

    table.timestamps(true, true);

    table.index(['id', 'city_id']);
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTable('weather_daily_logs').dropTable('weather_hourly_logs');
};
