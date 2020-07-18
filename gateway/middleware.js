jwt = require('jsonwebtoken');
modelFn = require('../common/config/functions');
helpers = require("./helper")
guest_endpoints = ['/account/login', '/account/logout', "/account/register", "/static/*"];
admin_endpoints = [
    'user.*',
    "/product/add",
    "/product/edit",
    "/product/delete",
    "/category/add",
    "/category/edit",
    "/category/delete",
    "/product/uploadImage",
    "/order/confirmOrder",
    "/order/rejectOrder"];
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

            if (guest_endpoints.indexOf('/' + _controller + '/' + '*') === -1 && guest_endpoints.indexOf('/' + _controller + '/' + _action) === -1) {
                is_protected = true;
            }
            if (is_protected) {
                modelFn.model('token')
                    .findOne({
                        token: token
                    })
                    .then((table_token) => {
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
    },

    checkRole: function (req, res, next) {

        try {

            _controller = req.originalUrl.split('/')[1];
            _action = req.originalUrl.split('/')[2];
            is_protected = false

            if (guest_endpoints.indexOf('/' + _controller + '/' + '*') === -1 && guest_endpoints.indexOf('/' + _controller + '/' + _action) === -1) {
                is_protected = true;
            }
            if (is_protected) {
                is_admin_api = true;
                if (admin_endpoints.indexOf(_controller + '.' + '*') === -1 && admin_endpoints.indexOf('/' + _controller + '/' + _action) === -1) {
                    is_admin_api = false;
                }

                if (is_admin_api == true) {
                    if (_currentUser.role == "admin") {
                        next();
                    } else {
                        return res.respond({
                            http_code: 500,
                            error: "not allowed it is an admin API"
                        })
                    }
                } else {
                    next()
                }
            } else {
                next()
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