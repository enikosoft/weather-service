import cors from 'cors';
import express from 'express';

import {Model} from 'objection';

import Knex from 'knex';
import knexConfig from './config/knex';
import bodyParser from 'body-parser';
import {Routes} from './routes/routes.interface';
import config from './config';
import errorMiddleware from './middlewares/error.middleware';

class App {
  app: express.Application;
  env: string;
  port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = config.env || 'development';
    this.port = config.port || 3000;

    this.connectToObjection();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.initializeMiddlewares();

    require('./loaders');
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`* Server listening on port: ${config.port} *`);
    });
  }

  getServer() {
    return this.app;
  }

  private connectToObjection() {
    const knex = Knex(knexConfig.development);
    Model.knex(knex);
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    this.app.use(bodyParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
