jwt = require('jsonwebtoken');
modelFn = require('../common/config/functions');
helpers = require("./helper")
guest_endpoints = ['/account/login', '/account/logout',"/account/register"];
JWT_SECRET = env.JWT_SECRET
let middleware = {
    parseJwt: function (req, res, next) {
        try {
            var token = "";

            // Split token from header
            if (req.headers['authorization'] !== undefined) {
                token = req.headers['authorization'].split(' ')[1];
            }

            _controller = req.originalUrl.split('/')[1];
            _action = req.originalUrl.split('/')[2];
            is_protected = false;
            console.log('/' + guest_endpoints.indexOf('/' + _controller + '/' + '*') + '/' + guest_endpoints.indexOf('/' + _controller + '/' + _action));

            if (guest_endpoints.indexOf('/' + _controller + '/' + '*') === -1 && guest_endpoints.indexOf('/' + _controller + '/' + _action) === -1) {
                is_protected = true;
            }
            console.log(is_protected)
            if (is_protected) {
                modelFn.model('token')
                    .findOne({
                        token: token
                    })
                    .then((table_token) => {
                        console.log("tokeeeeeeeeeeenenenenene", table_token)
                        if (table_token != null) {
                            if (!table_token['is_active']) {
                                return res.respond({
                                    http_code: 500,
                                    error: "invalid token"
                                })
                            }
                            if (req.headers['authorization'] === undefined) {
                                return res.respond({
                                    http_code: 500,
                                    error: "invalid token"
                                })
                            }
                            if (!token) {
                                return res.respond({
                                    http_code: 500,
                                    error: "invalid token"
                                })
                            } else {
                                console.log(token);
                                jwt.verify(token, JWT_SECRET, (err, decoded) => {
                                    if (err) {
                                        return res.respond({
                                            http_code: 500,
                                            error: "invalid token"
                                        })
                                    } else {
                                        _currentUser = decoded;
                                        next();
                                    }
                                });
                            }

                        } else {
                            return res.respond({
                                http_code: 500,
                                error: "invalid token"
                            })
                        }
                    });
            } else {
                jwt.verify(token, JWT_SECRET, (err, decoded) => {
                    if (err) {
                        _currentUser = null;
                    } else {
                        _currentUser = decoded;
                    }
                });
                next();
            }
        } catch (e) {
            return res.respond({
                http_code: 500,
                error: 'exception thrown',
            });
        }
    }
};

module.exports = middleware;