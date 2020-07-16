let functions = {

        login: function (req, res) {
            try {
                let rules = {
                    username: 'required',
                    password: 'required'
                };

                let validation = new validator(req.body, rules);

                validation.fails(() => {
                    return res.replyBack({errors: validation.errors.errors, http_code: 400});
                });

                validation.passes(async () => {

                    let email = req.body.username;
                    let password = req.body.password;

                    fn.model('user')
                        .findOne({
                            email: email
                        })
                        .select('email username role is_active password')
                        .then((data) => {
                            console.log(data,"-----------------------------------------")
                            if (data == null) {
                                return res.replyBack({
                                    http_code: 400,
                                    error: 'account not found'
                                });
                            }
                            let user = data.toObject()
                            if (!user || !user.is_active || !bcrypt.compareSync(password, user.password)) {
                                return res.replyBack({
                                    http_code: 401,
                                    error: 'invalid credentials'
                                });
                            } else {
                                delete user['password'];
                                let token = jwt.sign(user, JWT_SECRET, {
                                    expiresIn: "2 days"
                                });
                                let tokenObj = new fn.model('token')({
                                    token: token,
                                    user_id: user._id,
                                    is_active: true
                                });

                                tokenObj.save((err) => {
                                    if (err) {
                                        return res.replyBack({
                                            http_code: 500,
                                            ex: fn.err_format(err)
                                        });
                                    }

                                    return res.replyBack({
                                        http_code: 200,
                                        msg: 'login successful',
                                        data: {
                                            info: user,
                                            token: token
                                        }
                                    });
                                });
                            }
                        });
                });

            } catch (e) {
                return res.replyBack({
                    error: 'something went wrong', http_code: 500
                });

            }
        },

        register: function (req, res) {
            try {
                let rules = {
                    email: 'required|email',
                    username: 'required',
                    password: 'required'
                };

                let validation = new validator(req.body, rules);

                validation.fails(() => {
                    return res.replyBack({errors: validation.errors.errors, http_code: 400});
                });

                validation.passes(async () => {

                    let email = req.body.email;
                    let username = req.body.username;
                    let password = req.body.password;
                    let isEmailVerified = req.body.is_email_verified
                    let isMobileVerified = req.body.is_mobile_verified
                    let registrationType = req.body.registrationType
                    password = bcrypt.hashSync(password, 5);

                    insertUserData = {
                        email: email,
                        password: password,
                        username: username,
                        role: "customer",
                        is_active: true
                    }
                    if (isEmailVerified != null) {
                        insertUserData["is_email_verified"] = isEmailVerified
                    } else {
                        insertUserData["is_email_verified"] = false
                    }
                    if (isMobileVerified != null) {
                        insertUserData["is_mobile_verified"] = isMobileVerified
                    } else {
                        insertUserData["is_mobile_verified"] = false
                    }
                    if (registrationType != null) {
                        insertUserData["registration_type"] = registrationType
                    } else {
                        insertUserData["registrationType"] = "normal"
                    }
                    let user = new fn.model('user')(insertUserData);
                    user.save((err) => {
                        if (err) {
                            return res.replyBack({
                                error: err, http_code: 500
                            });
                        }
                        user = user.toObject();
                        delete user['password'];
                        return res.replyBack({
                            status: 200,
                            msg: 'user registered successfully',
                            data: user
                        });
                    });
                });

            } catch (e) {
                return res.replyBack({
                    error: 'something went wrong', http_code: 500
                });

            }
        },

        checkLogin: function (req, res) {
            try {
                let rules = {
                    token: 'required'
                };

                let validation = new validator(req.body, rules);

                validation.fails(() => {
                    return res.replyBack({
                        msg: 'not logged in',
                        http_code: 401
                    });
                });

                validation.passes(() => {

                    if (req.body.token === "null") {
                        return res.replyBack({
                            msg: 'please login',
                            http_code: 401
                        });
                    }

                    token = req.body.token;

                    try {

                        let user = jwt.verify(token, env.JWT_SECRET);

                        if (!user) {
                            return res.replyBack({
                                msg: 'not logged in',
                                http_code: 401
                            });
                        } else {

                            if (token && token.length > 5) {

                                jwt.verify(token, env.JWT_SECRET, function (err, decoded) {

                                    if (err) {
                                        return res.replyBack({msg: _msg('status_logout'), http_code: 200});
                                    }

                                    // confirm user_id and token with status 1 in tokens table
                                    fn.model('token')
                                        .findOne({
                                            token: token,
                                            user_id: user._id,
                                            is_active: true
                                        }, {password: 0})
                                        .then((token) => {
                                            if (token) {
                                                return res.replyBack({msg: 'logged in', data: user, http_code: 200});
                                            } else {
                                                return res.replyBack({msg: 'not logged in', http_code: 401});
                                            }

                                        }).catch((err) => {
                                        return res.replyBack({ex: fn.err_format(err), http_code: 500});
                                    });

                                });

                            }

                        }

                    } catch (err) {
                        return res.replyBack({
                            msg: 'token expired',
                            http_code: 401
                        });

                    }
                });
            } catch
                (e) {
                return res.replyBack({
                    error: 'something went wrong', http_code: 500
                });
            }
        },

        logout: function (req, res) {

            try {

                let rules = {
                    token: 'required'
                };

                let validation = new validator(req.body, rules);

                validation.fails(() => {
                    return res.replyBack({errors: validation.errors.errors, http_code: 400});
                });

                validation.passes(() => {

                    let token = req.body.token;

                    fn.model('token').deleteOne({
                        token: token
                    }).then((data) => {
                        return res.replyBack({msg: 'logged out', http_code: 200});
                    })
                        .catch((err) => {
                            return res.replyBack({error: "unable to logout", ex: fn.err_format(err), http_code: 500});
                        });

                })

            } catch (e) {
                return res.replyBack({
                    error: 'something went wrong', http_code: 500
                });
            }

        },

        getProfile: function (req, res) {
            try {
                let rules = {
                    "userId": "required|exists:user,_id"
                };

                let validation = new validator(req.body, rules);

                validation.fails(() => {
                    return res.replyBack({errors: validation.errors.errors, http_code: 400});
                });

                validation.passes(() => {
                    user_id = req.body.userId;
                    fn.model('user')
                        .findOne({
                            _id: user_id
                        })
                        .then((user) => {
                            user = user.toObject();
                            delete user["password"];
                            return res.replyBack({
                                http_code: 200,
                                data: user
                            });
                        }).catch((err) => {
                        return res.replyBack({
                            ex: fn.err_format(err)
                        });
                    });
                });
            } catch
                (e) {
                return res.replyBack({
                    error: 'something went wrong', http_code: 500
                });
            }
        },

        editProfile: function (req, res) {
            try {
                let rules = {
                    "userId": "required|exists:user,_id"
                };

                let validation = new validator(req.body, rules);

                validation.fails(() => {
                    return res.replyBack({errors: validation.errors.errors, http_code: 400});
                });

                validation.passes(() => {
                    let user_id = req.body.userId;
                    let username = req.body.username;
                    let email = req.body.email;
                    let mobile = req.body.mobile;
                    let _payload = {}
                    if (username) {
                        _payload['username'] = username;
                    }
                    if (email) {
                        _payload['email'] = email;
                    }
                    if (mobile) {
                        _payload['mobile'] = mobile;
                    }
                    fn.model('user')
                        .findOne({
                            _id: user_id
                        })
                        .then((user) => {
                            user.update(_payload)
                                .then((data) => {
                                    return res.replyBack({
                                        http_code: 200,
                                        msg: 'profile edited'
                                    });
                                })
                                .catch((err) => {
                                    return res.replyBack({
                                        http_code:500,
                                        ex: fn.err_format(err)
                                    });
                                });
                        });
                });
            } catch
                (e) {
                return res.replyBack({
                    error: 'something went wrong', http_code: 500
                });
            }
        },

    }
;


module.exports = functions;