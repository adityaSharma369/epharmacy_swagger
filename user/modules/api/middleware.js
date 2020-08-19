const jwt = require('jsonwebtoken')
const {makeMiddlewareInvoker} = require('bottlejs-express')

function AttachRequestHelpers() {
    return (req, res, next) => {
        res.err = function (payload) {
            if (payload) {
                payload['http_code'] = (payload['http_code']) ? payload['http_code'] : 500;
            } else {
                payload = {
                    'http_code': 500
                };
            }
            return res.respond(payload);
        }
        res.respond = function (payload) {
            payload.http_code = (payload.http_code) ? payload.http_code : 200;
            const response = {
                msg: payload.msg,
                error: payload.error,
                errors: payload.errors,
                data: payload.data,
            };
            return res.status(payload.http_code)
                .send(response);
        }
        next();
    }
}

function ParseJWTtoken() {
    return (req, res, next) => {
        try {
            req.authenticated = false;
            let token;
            const bearerHeader = req.headers['authorization'];
            if (bearerHeader) {
                const bearer = bearerHeader.split(" ");
                token = bearer[1];
                req.token = token;
                jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                    if (err) {
                        console.log("cannot decode JWT token passed in request headers", err);
                        req.authenticated = false;
                        req.decoded = null;
                        res.respond({
                            "http_code": 401,
                            "error": "invalid token"
                        });
                    } else {
                        req.decoded = decoded;
                        req.authenticated = true;
                        next();
                    }
                });
            } else {
                res.respond({
                    "http_code": 401,
                    "error": "user is not logged in"
                });
            }
        } catch (e) {
            res.respond({http_code: 500, error: 'error while parsing jwt token'})
        }
    }
}

module.exports.ParseAuthToken = (bottle, app) => {
    app.use(makeMiddlewareInvoker(bottle, ParseJWTtoken));
}

module.exports.AttachRequestHelpers = (bottle, app) => {
    app.use(makeMiddlewareInvoker(bottle, AttachRequestHelpers));
}




