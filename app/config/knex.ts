import path from 'path';

require('dotenv').config({path: path.resolve(__dirname, '../../.env')});

export namespace Database {
  export const user = process.env.DB_USER;
  export const password = process.env.DB_PASS;
  export const host = process.env.DB_HOST;
  export const port = Number(process.env.DB_PORT);
  export const database = process.env.DB_NAME;

  export const url = `postgres://${user}:${password}@${host}:${port}/${database}`;
}

export const config = {
  development: {
    client: 'postgresql',
    connection: {
      charset: 'utf8',
      timezone: 'UTC',
      host: Database.host,
      database: Database.database,
      user: Database.user,
      password: Database.password,
      port: Database.port,
    },
    seeds: {
      directory: path.join(__dirname, '../database/seeds'),
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, '../database/migrations'),
    },
  },
};

export default config;
