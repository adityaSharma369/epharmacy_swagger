var functions = {


    list: (req, res) => {

        try {

            let page = req.body.page ? req.body.page : 1;
            let limit = req.body.limit ? req.body.limit : 10;

            let filter = {};
            if (typeof req.body.search != "undefined") {
                filter = {
                    $or: [{name: {$regex: req.body.search, $options: 'si'}}, {
                        email: {
                            $regex: req.body.search,
                            $options: 'si'
                        },
                    }, {
                        mobile: {
                            $regex: req.body.search,
                            $options: 'si'
                        },
                    }]
                }
            }
            filter["is_deleted"] = false
            if (typeof req.body.role != "undefined") {
                filter["role"] = req.body.role
                if (req.body.role !== "agent") {
                    filter["role"] = {
                        "$ne": "agent"
                    }
                }
            }
            fn.paginate("user", filter, "", limit, page, "").then((data) => {
                data.docs.forEach(element => {
                    element.password = undefined;
                });
                return res.replyBack({msg: 'user list', data: data, http_code: 200})
            }).catch((err) => {
                return res.replyBack({ex: fn.err_format(err), http_code: 500});
            });
        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }

    },

    listLite: (req, res) => {

        try {
            let filter = {}
            if (typeof req.body.role != "undefined") {
                filter["role"] = req.body.role
            }
            filter["is_deleted"] = false
            fn.model('user').find(filter).select('_id username email').then((data) => {
                return res.replyBack({msg: 'user list', data: data, http_code: 200})
            })
                .catch((err) => {
                    return res.replyBack({ex: fn.err_format(err), http_code: 500});
                });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }

    },

    add: (req, res) => {
        try {
            var rules = {
                username: 'required|min:3|max:100',
                email: 'required|email|unique:user',
                mobile: 'required|min:10|max:11',
                password: 'required|min:6',
                role: 'required',
            };
            var validation = new validator(req.body, rules);

            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(() => {
                var username = req.body.username;
                var email = req.body.email;
                var mobile = req.body.mobile;
                var password = req.body.password;
                var role = req.body.role;

                hash = bcrypt.hashSync(password, 5);

                var user = new fn.model('user')(
                    {
                        username: username,
                        email: email,
                        mobile: mobile,
                        password: hash,
                        role: role,
                        is_active: true,
                        is_deleted: false,
                    });
                user.save()
                    .then((data) => {
                        data.password = undefined;
                        return res.replyBack({msg: 'user added', data: data, http_code: 201})
                    })
                    .catch((err) => {
                        return res.replyBack({ex: fn.err_format(err), http_code: 500});
                    });

            });
        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    view: (req, res) => {

        try {

            var rules = {
                user_id: 'required|exists:user,_id'
            };

            var validation = new validator(req.body, rules);

            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });

            validation.passes(async () => {

                let user_id = req.body.user_id;
                let customer_id = req.body.customer_id;

                fn.model('user').findOne({_id: user_id, customer: customer_id}).then((data) => {
                    data.password = undefined
                    return res.replyBack({msg: 'user view', data: data, http_code: 200})
                }).catch((err) => {
                    return res.replyBack({ex: fn.err_format(err), http_code: 500});
                });

            });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }


    },

    edit: (req, res) => {
        try {
            var rules = {
                user_id: 'required|exists:user,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let user_id = req.body.user_id;
                var _payload = {}
                if (typeof req.body.username !== "undefined") {
                    _payload["username"] = req.body.username
                }

                if (typeof req.body.mobile !== "undefined") {
                    _payload["mobile"] = req.body.mobile
                }

                if (typeof req.body.email !== "undefined") {
                    _payload["email"] = req.body.email
                }
                if (typeof req.body.password !== "undefined") {
                    const hash = bcrypt.hashSync(req.body.password, 5);
                    _payload["password"] = hash
                }
                fn.model('user')
                    .findOne({
                        _id: user_id
                    })
                    .then((driver) => {
                        driver.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'user edited', http_code: 201});
                            })
                            .catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                    });
            });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    editAll: (req, res) => {
        try {
            var rules = {
                user_id: 'required|exists:user,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                fn.model('user')
                    .updateMany({}, {"is_deleted": false})
                    .then((driver) => {

                        return res.replyBack({msg: 'user edited', http_code: 200});

                    });
            });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    delete: (req, res) => {
        try {
            var rules = {
                user_id: 'required|exists:user,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let user_id = req.body.user_id;
                var _payload = {
                    "is_deleted": true
                }
                fn.model('user')
                    .findOne({
                        _id: user_id
                    })
                    .then((user) => {
                        user.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'user deleted', http_code: 201});
                            })
                            .catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                    });
            });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    toggleStatus: (req, res) => {
        try {
            const rules = {
                user_id: 'required|exists:user,_id',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let user_id = req.body.user_id;
                fn.model('user')
                    .findOne({
                        _id: user_id
                    })
                    .then((user) => {
                        let _payload = user
                        let msg = ""
                        console.log(user.is_active, "============================")
                        if (user["is_active"] === true) {
                            console.log(user["is_active"], "=--------------")
                            _payload["is_active"] = false
                            msg = "user is not active"
                        } else {
                            console.log(user["is_active"])
                            _payload["is_active"] = true
                            msg = "user is active"
                        }
                        user.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: msg, data: data, http_code: 201});
                            })
                            .catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                    });
            });

        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },
};

module.exports = functions;
