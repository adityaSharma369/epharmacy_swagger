const _ = require('lodash');

const DefaultController = require('./controllers');
const UserController = require('./controllers/UserController');
const AccountController = require('./controllers/AccountController');
const AddressController = require('./controllers/AddressController');


const RabbitMQ = require('../utils/RabbitMQ');
const MongoDB = require('../utils/MongoDB');
const Validator = require('../utils/Validator')

const UserRecord = require('./db/UserRecord');
const TokenRecord = require('./db/TokenRecord');
const AddressRecord = require('./db/AddressRecord');

env = process.env;
const exchange = env.RABBIT_MQ_EXCHANGE_NAME
const queueName = env.RABBIT_MQ_QUEUE_NAME
const pattern = env.RABBIT_MQ_PATTERN

const APIDependencies = async function (diProvider) {
    let rmq = RabbitMQ();
    rmq.init("amqp://root:framework@rabbitmq",exchange,queueName,pattern)

    diProvider.constant('RabbitMQ', rmq);
    diProvider.service('MongoDB', MongoDB);
    diProvider.service('Validator', Validator, 'MongoDB');

    diProvider.service('UserRecord', UserRecord, 'MongoDB');
    diProvider.service('TokenRecord', TokenRecord, 'MongoDB');
    diProvider.service('AddressRecord', AddressRecord, 'MongoDB');

    diProvider.service('DefaultController', DefaultController);
    diProvider.service('UserController', UserController, 'Validator', 'RabbitMQ', 'UserRecord');
    diProvider.service('AddressController', AddressController, 'Validator', 'RabbitMQ', 'AddressRecord','UserRecord');
    diProvider.service('AccountController', AccountController, 'Validator', 'RabbitMQ', 'UserRecord','TokenRecord');
};

module.exports = APIDependencies;
