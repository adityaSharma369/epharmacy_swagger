const RabbitMQ = require("./modules/utils/RabbitMQ")

env = process.env;
const exchange = env.RABBIT_MQ_EXCHANGE_NAME
const queueName = env.RABBIT_MQ_QUEUE_NAME
const pattern = env.RABBIT_MQ_PATTERN

rmq = RabbitMQ()
CURRENT_DOMAIN=env.CURRENT_DOMAIN
const dependencies = require('./dependencies')();
const modules = require('./modules');

modules.apiRouter(dependencies, rmq);

rmq.init("amqp://root:framework@rabbitmq", exchange, queueName, pattern, rmq.routes)

console.log("listening on rabbitMQ ... ")

// app.listen(PORT, () => debug(`Listening on ${PORT}!`))

