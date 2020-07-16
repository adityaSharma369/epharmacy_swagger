// connect to rabbitMQ or die
require('dotenv').config();
amqp = require('amqplib');
tmq = require("../common/config/rMQ.js");
fn = require("../common/config/functions.js");
jwt = require('jsonwebtoken');
sha1 = require('sha1');
uuid = require('uuid');
bcrypt = require('bcryptjs');
EventEmitter = require('events');
validator = require('validatorjs');
path = require('path');
app_path = path.join(__dirname);
paginator = require('mongoose-paginate');
const mongoose = require('mongoose');
require('../common/config/validate.js');
env = process.env;

JWT_SECRET=env.JWT_SECRET
RabbitMQChannel = null;
exchange = env.RABBIT_MQ_EXCHANGE_NAME;
queue_name = env.RABBIT_MQ_QUEUE_NAME;
pattern = env.RABBIT_MQ_PATTERN;
rabbitMQConnString = 'amqp://' + env.RABBIT_MQ_USER + ":" + env.RABBIT_MQ_PASSWORD + "@" + env.RABBIT_MQ_HOST;

console.log("listening to pattern ", pattern);
tmq.InitBrokerOrDie(rabbitMQConnString);

//MongoDb Connection
mdb = require("../common/config/mongoDb")
mdb.InItMongoDb(env.MONGO_DB_DBNAME)


process.on("SIGTERM", () => {
    console.log("process exiting ...");
    process.abort();
});
