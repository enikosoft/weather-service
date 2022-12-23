# Weather service 🌤

Weather API from *https://weather.visualcrossing.com*.
Available on VisualCrossingWebServices: *Weather History Data, Weather Time Line Data, Weather Forecast Data* 

## Technologies stack
- *node.js*, *express.js*
- *Typescript*
- *knex*, *objection.js*
- database - *postgresql*
## Development

The first time, you will need to run

```
npm install
```

After run megrations and seeds files. Before paste correct data in *.env* file. Test WEATHER_API_KEY you should to find in *testWeatherApiKeys.txt*

```
npm run migrate:latest

npm run knex:seeds
```

Then just start the server with

```
npm start:watch
```
It uses nodemon for livereloading👆


### Need to implement:
- [ ] Add Swagger
- [ ] Unit tests for weather routes
- [ ] Add Logger
- [ ] Add Docker
