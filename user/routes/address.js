var functions = {
    list: (req, res) => {

        try {
            var rules = {
                user_id: 'required|exists:user,_id'
            };

            var validation = new validator(req.body, rules);

            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });

            let page = req.body.page ? req.body.page : 1;
            let limit = req.body.limit ? req.body.limit : 10;
            let user_id = req.body.user_id
            let filter = {};
            if (typeof req.body.search != "undefined") {
                filter = {
                    $or: [{title: {$regex: req.body.search, $options: 'si'}}, {
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

            filter["is_active"] = true
            filter["user_id"] = user_id
            fn.paginate("address", filter, "", limit, page, "").then((data) => {
                data.docs.forEach(element => {
                    element.password = undefined;
                });
                return res.replyBack({msg: 'address list', data: data, http_code: 200})
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
        var rules = {
            user_id: 'required|exists:user,_id'
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.replyBack({errors: validation.errors.errors, http_code: 400});
        });
        try {
            var filter = {"user_id": req.body.user_id, "is_active": true}
            fn.model('address').find(filter).select('_id title fulladdress').then((data) => {
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
                title: 'required|min:1|max:100',
                lat: 'required|numeric',
                lng: 'required|numeric',
                full_address: 'required|min:10',
                user_id:'required|exists:user,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(() => {
                var user_id = req.body.user_id
                var title = req.body.title;
                var lat = req.body.lat;
                var lng = req.body.lng;
                var full_address = req.body.full_address;


                fn.model('address')
                    .updateMany({
                            user_id: user_id
                        }, {"is_primary": false}
                    ).then((data) => {
                    var user = new fn.model('address')(
                        {
                            user_id: user_id,
                            title: title,
                            lat: lat,
                            lng: lng,
                            full_address: full_address,
                            is_active: true,
                            is_primary:true
                        });
                    user.save()
                        .then((data) => {
                            data.full_address = undefined;
                            return res.replyBack({msg: 'user address added', data: data, http_code: 200})
                        })
                        .catch((err) => {
                            return res.replyBack({ex: fn.err_format(err), http_code: 500});
                        });
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
                address_id: 'required|exists:address,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let address_id = req.body.address_id;

                var _payload = {}

                if (typeof req.body.title != "undefined") {
                    _payload["title"] = req.body.title
                }

                if (typeof req.body.full_address != "undefined") {
                    _payload["full_address"] = req.body.full_address
                }

                if (typeof req.body.lat != "undefined") {
                    _payload["lat"] = req.body.lat
                }

                if (typeof req.body.lng != "undefined") {
                    _payload["lng"] = req.body.lng
                }

                if (typeof req.body.is_active != "undefined") {
                    _payload["is_active"] = req.body.is_active
                }

                if (typeof req.body.is_primary != "undefined") {
                    _payload["is_primary"] = req.body.is_primary
                }

                fn.model('address')
                    .findOne({
                        _id: address_id
                    })
                    .then((address) => {
                        address.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'address edited', http_code: 200});
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

    view: (req, res) => {
        try {

            var rules = {
                address_id: 'required|exists:address,_id'
            };

            var validation = new validator(req.body, rules);

            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });

            validation.passes(async () => {
                let address_id = req.body.address_id;
                fn.model('address').findOne({_id: address_id}).then((data) => {
                    return res.replyBack({msg: 'address view', data: data, http_code: 200})
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

    delete: (req, res) => {
        try {
            var rules = {
                address_id: 'required|exists:address,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let address_id = req.body.address_id;
                var _payload = {
                    "is_active": false
                }
                fn.model('address')
                    .findOne({
                        _id: address_id
                    })
                    .then((address) => {
                        address.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'address deleted', http_code: 200});
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
};

module.exports = functions;
