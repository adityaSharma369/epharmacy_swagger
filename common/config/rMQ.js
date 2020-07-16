let amqp = require('amqplib/callback_api');
let rabbitMQconn;
let rabbitMQchan;

// if the connection is closed or fails to be established at all, we will reconnect
const InitBrokerOrDie = (rabbitMQConnString) => {
    amqp.connect(rabbitMQConnString, function (err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            console.log("[AMQP] restart process starts here")
            return setTimeout(() => {
                console.log("timeout triggered");
                InitBrokerOrDie(rabbitMQConnString);
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
                InitBrokerOrDie(rabbitMQConnString);
            }, 1000)
        });

        console.log("[AMQP] connected");
        rabbitMQconn = conn;

        whenConnected();
    });
}

function whenConnected() {
    startPublisher();
    startWorker();
}

let offlinePubQueue = [];
let pubChannel = null

function startPublisher() {
    rabbitMQconn.createConfirmChannel(function (err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });

        pubChannel = ch;
        while (true) {
            let m = offlinePubQueue.shift();
            if (!m) break;
            publish(m[0], m[1], m[2]);
        }
    });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content, correlationId) {
    try {
        pubChannel.publish(exchange, routingKey, content, {correlationId, replyTo: queue_name, persistent: true},
            function (err, ok) {
                if (err) {
                    console.error("[AMQP] publish", err);
                    offlinePubQueue.push([exchange, routingKey, content]);
                    pubChannel.connection.close();
                }
            });
    } catch (e) {
        console.error("[AMQP] publish", e.message);
        offlinePubQueue.push([exchange, routingKey, content]);
    }
}

// A worker that acks messages only if processed succesfully
function startWorker() {
    rabbitMQconn.createChannel(function (err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });
        ch.prefetch(10);
        rabbitMQchan = ch;
        ch.responseEmitter = new EventEmitter();
        ch.responseEmitter.setMaxListeners(0);
        ch.assertExchange(exchange, 'topic', {
            durable: false
        });

        ch.assertQueue(queue_name, {
            exclusive: false,
            durable: false
        });

        ch.bindQueue(queue_name, exchange, pattern);
        ch.bindQueue(queue_name, exchange, pattern + ".*");

        ch.consume(queue_name, function (msg) {
            let key = msg.fields.routingKey;
            try {
                // console.log("message contents",msg.content.toString())
                let body = JSON.parse(msg.content.toString());
                // reply recieved for request made by this MS earlier
                if (msg.fields.exchange === '') {
                    console.log("[IN-REPLY]", body.http_code, body.msg);
                    ch.responseEmitter.emit(msg.properties.correlationId, msg.content)
                } else {
                    console.log("[IN-REQ]", key);
                    let bits = key.split('.');
                    let service;
                    let action;
                    if (bits.length === 3) {
                        service = bits[1];
                        action = bits[2];
                    } else {
                        service = bits[0];
                        action = bits[1];
                    }
                    let req = {
                        body: body,
                        clean: function (obj) {
                            Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : '');
                            return obj;
                        }
                    };
                    let res = {
                        replyBack: function (data) {
                            console.log("[OUT-REPLY] ", msg.properties.replyTo);
                            data = JSON.stringify(data);
                            ch.sendToQueue(msg.properties.replyTo, Buffer.from(data), {
                                correlationId: msg.properties.correlationId
                            });
                        }
                    };
                    service = require(app_path + '/routes/' + service + '.js');
                    if (service[action]) {
                        // console.log("body",req.body)
                        service[action](req, res);
                    }
                }
            } catch (e) {
                console.log("invalid JSON body recieved ", e);
            }
        }, {
            noAck: true
        });

    });
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    rabbitMQconn.close();
    return true;
}

const Execute = (req, data, route, timeOut = 100) => new Promise((resolve, reject) => {
    console.log("[OUT-REQ] in Execute", route, exchange);
    const correlationId = uuid.v4();
    if (req.user && req.user.user.customer !== undefined) {
        data["customer_id"] = req.user.user.customer
    }
    let msg = JSON.stringify(data);
    rabbitMQchan.responseEmitter.once(correlationId, resolve);
    publish(exchange, route, Buffer.from(msg), correlationId)

    setTimeout(function () {
        reject({
            msg: route + ' timed out after ' + timeOut + ' ms',
            http_code: 500
        });
    }, timeOut);

}).catch((err) => {
    console.log(err, "error in execute")
});

module.exports.InitBrokerOrDie = InitBrokerOrDie;
module.exports.Execute = Execute;
