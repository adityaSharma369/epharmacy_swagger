const Bottle = require('bottlejs');
const APIDependencies = require('./modules/api/dependencies');
const diProvider = new Bottle();
const dependencies = function () {
  APIDependencies(diProvider);
  return diProvider;
};

module.exports = dependencies;
