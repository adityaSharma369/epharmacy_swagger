const _ = require('lodash');

const DefaultController = require('./controllers');
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const AccountController = require('./controllers/AccountController');
const MoleculeController = require('./controllers/MoleculeController');
const ManufacturerController = require('./controllers/ManufacturerController');
const SymptomController = require('./controllers/SymptomController');
const BrandController = require('./controllers/BrandController');
const CategoryController = require('./controllers/CategoryController');
const AddressController = require('./controllers/AddressController');

const RabbitMQ = require('./../utils/RabbitMQ');
const MongoDB = require('./../utils/MongoDB');
const Validator = require('./../utils/Validator')


env = process.env;
const exchange = env.RABBIT_MQ_EXCHANGE_NAME
const queueName = env.RABBIT_MQ_QUEUE_NAME
const pattern = env.RABBIT_MQ_PATTERN

const APIDependencies = async function (diProvider) {
    let rmq = RabbitMQ();
    rmq.init("amqp://root:framework@rabbitmq", exchange, queueName, pattern)

    diProvider.constant('RabbitMQ', rmq);
    diProvider.service('MongoDB', MongoDB);
    diProvider.service('Validator', Validator, 'MongoDB');

    diProvider.service('DefaultController', DefaultController);
    diProvider.service('ProductController', ProductController, 'Validator', 'RabbitMQ');
    diProvider.service('UserController', UserController, 'Validator', 'RabbitMQ');
    diProvider.service('AccountController', AccountController, 'Validator', 'RabbitMQ');
    diProvider.service('MoleculeController', MoleculeController, 'Validator', 'RabbitMQ');
    diProvider.service('ManufacturerController', ManufacturerController, 'Validator', 'RabbitMQ');
    diProvider.service('SymptomController', SymptomController, 'Validator', 'RabbitMQ');
    diProvider.service('BrandController', BrandController, 'Validator', 'RabbitMQ');
    diProvider.service('CategoryController', CategoryController, 'Validator', 'RabbitMQ');
    diProvider.service('AddressController', AddressController, 'Validator', 'RabbitMQ');

};

module.exports = APIDependencies;
