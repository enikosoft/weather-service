import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const env = dotenv.config();

if (env.error) {
  throw new Error("Couldn't find .env file.");
}

export default {
  port: parseInt(process.env.PORT),
  env: process.env.NODE_ENV,
  api: {
    prefix: '/api',
    version: '1.0',
  },
};
