import {Knex} from 'knex';

exports.up = async function (knex: Knex) {
  await knex.schema.createTable('countries', (table) => {
    table.increments('id');
    table.string('name', 50).notNullable();
    table.string('region', 150).notNullable();
    table.string('iso3', 5).notNullable();

    table.index(['name']);
  });

  await knex.schema.createTable('cities', (table) => {
    table.increments('id');

    table.integer('country_id').references('id').inTable('countries').onDelete('CASCADE');

    table.string('name', 50).notNullable();
    table.string('countryCode', 5).notNullable();
    table.boolean('is_capital').defaultTo(false);
    table.float('latitude').notNullable();
    table.float('longitude').notNullable();

    table.index(['name']);
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTable('cities').dropTable('countries');
};
