import {Knex} from 'knex';

exports.up = async function (knex: Knex) {
  await knex.raw(`
    CREATE TYPE city_request_type AS enum (
      'GET_CITY_WEATHER',
      'GET_CITY',
      'UPDATE_CITY',
      'DELETE_CITY'
    );
  `);

  await knex.schema.createTable('cities_query_log', (table) => {
    table.increments('id');

    table.integer('city_id').references('id').inTable('cities').onDelete('CASCADE').notNullable();

    table.specificType('type', 'city_request_type').notNullable();

    table.jsonb('attributes').defaultTo([]);

    table.timestamps(true, true);

    table.index(['id', 'city_id', 'type']);
  });
};

exports.down = async function (knex: Knex) {
  await knex.raw(`DROP TYPE city_request_type IF EXIST;`);

  return knex.schema.dropTable('cities_query_log');
};
