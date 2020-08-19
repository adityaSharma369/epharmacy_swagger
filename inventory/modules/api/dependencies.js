const _ = require('lodash');

const ProductController = require('./controllers/ProductController');
const BrandController = require('./controllers/BrandController');
const CategoryController = require('./controllers/CategoryController');
const ManufacturerController = require('./controllers/ManufacturerController');
const MoleculeController = require('./controllers/MoleculeController');
const SymptomController = require('./controllers/SymptomController');


const RabbitMQ = require('../utils/RabbitMQ');
const MongoDB = require('../utils/MongoDB');
const Validator = require('../utils/Validator')

const ProductRecord = require('./db/ProductRecord');
const ProductImageRecord = require('./db/ProductImageRecord');
const BrandRecord = require('./db/BrandRecord');
const MoleculeRecord = require('./db/MoleculeRecord');
const ManufacturerRecord = require('./db/ManufacturerRecord');
const SymptomRecord = require('./db/SymptomRecord');
const CategoryRecord = require('./db/CategoryRecord');
const CategoryProductRecord = require('./db/CategoryProductRecord');

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

    diProvider.service('ProductRecord', ProductRecord, 'MongoDB');
    diProvider.service('ProductImageRecord', ProductImageRecord, 'MongoDB');
    diProvider.service('MoleculeRecord', MoleculeRecord, 'MongoDB');
    diProvider.service('ManufacturerRecord', ManufacturerRecord, 'MongoDB');
    diProvider.service('SymptomRecord', SymptomRecord, 'MongoDB');
    diProvider.service('CategoryProductRecord', CategoryProductRecord, 'MongoDB');
    diProvider.service('CategoryRecord', CategoryRecord, 'MongoDB');
    diProvider.service('BrandRecord', BrandRecord, 'MongoDB');

    diProvider.service('ProductController', ProductController, 'Validator', 'RabbitMQ', 'ProductRecord',
        'ProductImageRecord','BrandRecord','ManufacturerRecord','MoleculeRecord');

    diProvider.service('BrandController', BrandController, 'Validator', 'RabbitMQ', 'BrandRecord');
    diProvider.service('ManufacturerController', ManufacturerController, 'Validator', 'RabbitMQ', 'ManufacturerRecord');
    diProvider.service('MoleculeController', MoleculeController, 'Validator', 'RabbitMQ', 'MoleculeRecord');
    diProvider.service('SymptomController', SymptomController, 'Validator', 'RabbitMQ', 'SymptomRecord');
    diProvider.service('CategoryController', CategoryController, 'Validator', 'RabbitMQ', 'CategoryRecord',"CategoryProductRecord");
};

module.exports = APIDependencies;
