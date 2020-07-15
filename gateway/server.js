const express = require('express');
const app = express();
channel = '';
amqp = require('amqplib');
EventEmitter = require('events');
let cors = require('cors');
fs = require('fs');
uuid = require('uuid');
validator = require('validatorjs');
bodyParser = require('body-parser');
multer = require('multer');
async = require('async');
require('../common/config/validate');
require('dotenv').config();
path = require('path');
app_path = path.join(__dirname);
mime = require("mime");
env = process.env;
middleware = require("./middleware")
helpers = require("./helper")
fn = require("../common/config/rMQ")


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v4() + '.' + mime.getExtension(file.mimetype));
    }
  });

upload = multer({ storage: storage });


app.use(cors());

app.use(express.urlencoded({
    extended: false
}));

app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//rabbitMq connection
rmq = require('../common/config/rMQ');
RabbitMQChannel = null;
exchange = env.RABBIT_MQ_EXCHANGE_NAME;
queue_name = env.RABBIT_MQ_QUEUE_NAME;
pattern = env.RABBIT_MQ_PATTERN;
rabbitMQConnString = 'amqp://' + env.RABBIT_MQ_USER + ":" + env.RABBIT_MQ_PASSWORD + "@" + env.RABBIT_MQ_HOST;
rmq.InitBrokerOrDie(rabbitMQConnString);


//MongoDb Connection
mdb = require("../common/config/mongoDb")
mdb.InItMongoDb(env.MONGO_DB_DBNAME)

app.use(helpers.gatewayResponse);
app.use(middleware.parseJwt);
app.use(middleware.checkRole);

app.use('/static', express.static(path.join(__dirname, 'uploads')));
let routers = fs.readdirSync('routes/');
routers.forEach(router => {
    router = router.replace('.js', '');
    if (router === 'index') {
        app.use('/', require('./routes/' + router + '.js'));
    } else {
        app.use('/' + router.toLowerCase(), require('./routes/' + router + '.js'));
    }
});
app.listen(4500, function () {
    console.log('Example app listening on port 4500')
})