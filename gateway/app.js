const PORT = process.env.PORT;
const express = require('express');
const app = express();
const debug = require('debug')("api:index");
const dependencies = require('./dependencies')();
const modules = require('./modules');

app.use(express.json());
modules.apiRouter(dependencies, app);
app.listen(PORT, () => debug(`Listening on ${PORT}!`));
