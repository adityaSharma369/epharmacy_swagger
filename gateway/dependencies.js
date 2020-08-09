const Bottle = require('bottlejs');
// const CMSDependencies = require('./modules/cms/dependencies');
const APIDependencies = require('./modules/api/dependencies');
// const CmsToApiBridgeEvents = require('./modules/events/CmsToApiBridgeEvents');

const diProvider = new Bottle();
const dependencies = function () {
  // diProvider.factory('CmsToApiEvents', () => new CmsToApiBridgeEvents());

  // CMSDependencies(diProvider);
  APIDependencies(diProvider);
  return diProvider;
};

module.exports = dependencies;
