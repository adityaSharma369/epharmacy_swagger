let amqp = require('amqplib/callback_api');

const events = require('events');

let rmq_connection;
let pub_channel;
let worker_channel;
let offlinePubQueue = [];
let global_exchange;
let global_queue;
let bind_pattern;
let routesConfig = {};

const RabbitMQ = function () {

    async function init(connection_string = "rabbitmq", exchange, queueName, pattern, router) {
        try {
            routesConfig = router;
            amqp.connect(connection_string, function (err, conn) {

                global_exchange = exchange;
                global_queue = queueName;
                bind_pattern = pattern

                if (err) {
                    console.log("[AMQP] cannot connect to rabbitMQ ..")
                    return setTimeout(() => {
                        console.log("[AMQP] reattempt rabbitMQ connection");
                        init(connection_string);
                    }, 1000)
                }
                conn.on("error", function (err) {
                    if (err.message !== "Connection closing") {
                        console.error("[AMQP] conn error", err.message);
                    }
                });
                conn.on("close", function () {
                    console.error("[AMQP] reconnecting");
                    return setTimeout(() => {
                        init(connection_string);
                    }, 1000)
                });

                rmq_connection = conn;

                startPublisher();
                startWorker();

            });
        } catch (e) {
            throw e;
        }
    }

    async function startPublisher() {
        try {
            rmq_connection.createConfirmChannel(function (err, ch) {
                if (err) {
                    rmq_connection.close();
                }
                ch.on("error", function (err) {
                    console.error("[AMQP] channel error", err.message);
                });
                ch.on("close", function () {
                    console.log("[AMQP] channel closed");
                });

                pub_channel = ch;
                while (true) {
                    let m = offlinePubQueue.shift();
                    if (!m) break;
                    publishMsg(m[0], m[1], m[2]);
                }
            });
        } catch (e) {
            throw e;
        }
    }

    function startWorker() {
        rmq_connection.createChannel(function (err, ch) {
                if (err) {
                    rmq_connection.close();
                }

                worker_channel = ch;

                ch.on("error", function (err) {
                    // handle
                });

                ch.on("close", function () {
                    console.log("[AMQP] channel closed");
                });

                ch.prefetch(10);
                ch.responseEmitter = new events.EventEmitter();
                ch.responseEmitter.setMaxListeners(0);

                ch.assertExchange(global_exchange, 'topic', {
                    durable: false
                });
                ch.assertQueue(global_queue, {
                    exclusive: false,
                    durable: false
                });

                ch.bindQueue(global_queue, global_exchange, bind_pattern);
                ch.bindQueue(global_queue, global_exchange, bind_pattern + ".*");

                ch.consume(global_queue, function (msg) {
                    let key = msg.fields.routingKey;
                    try {
                        console.log("message contents", msg.content.toString())
                        let body = JSON.parse(msg.content.toString());
                        // reply recieved for request made by this MS earlier
                        if (msg.fields.exchange === '') {
                            console.log("[IN-REPLY]", body.http_code, body.msg);
                            ch.responseEmitter.emit(msg.properties.correlationId, msg.content)
                        } else {

                            // console.log("[IN-REQ]", key);
                            // let bits = key.split('.');
                            // let service;
                            // let action;
                            // if (bits.length === 3) {
                            //     service = bits[1];
                            //     action = bits[2];
                            // } else {
                            //     service = bits[0];
                            //     action = bits[1];
                            // }

                            let req = {
                                body: body,
                                clean: function (obj) {
                                    Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : '');
                                    return obj;
                                }
                            };
                            let res = {
                                respond: function (data) {
                                    data = JSON.stringify(data);
                                    ch.sendToQueue(msg.properties.replyTo, Buffer.from(data), {
                                        correlationId: msg.properties.correlationId
                                    });
                                },
                                err: function (data) {
                                    data = JSON.stringify(data);
                                    ch.sendToQueue(msg.properties.replyTo, Buffer.from(data), {
                                        correlationId: msg.properties.correlationId
                                    });
                                }
                            };

                            const routeInvoker = routesConfig[key];
                            if (routeInvoker) {
                                routeInvoker(req, res);
                            } else {
                                res.respond({http_code: 404, error: 'invalid endpoint triggered'})
                                console.log("invalid endpoint triggered .. ")
                            }
                        }
                    } catch (e) {
                        console.log("invalid JSON body", e);
                    }
                }, {
                    noAck: true
                });

            }
        );
    }

    function publishMsg(exchange, routingKey, content, correlationId) {
        try {
            pub_channel.publish(exchange, routingKey, content, {
                    correlationId,
                    replyTo: global_queue,
                    persistent: true
                },
                function (err, ok) {
                    if (err) {
                        console.error("[AMQP] publish", err);
                        offlinePubQueue.push([exchange, routingKey, content]);
                        pub_channel.connection.close();
                    }
                });
        } catch (e) {
            console.error("[AMQP] publish", e.message);
            offlinePubQueue.push([exchange, routingKey, content]);
        }
    }

    async function execute(pattern, data, timeOut = 100) {
        try {
            return new Promise((resolve, reject) => {
                console.log("[OUT-REQ] in Execute", pattern, global_exchange);
                // const correlationId = uuid.v4();
                const correlationId = "12343432sfdfsdf";
                let msg = JSON.stringify(data);
                worker_channel.responseEmitter.once(correlationId, resolve);
                publishMsg(global_exchange, pattern, Buffer.from(msg), correlationId)

                setTimeout(function () {
                    reject({
                        msg: pattern + ' timed out after ' + timeOut + ' ms',
                        http_code: 500
                    });
                }, timeOut);
            });
        } catch (e) {
            throw e;
        }
    }

    return {
        init, execute
    }

}

module.exports = RabbitMQ
