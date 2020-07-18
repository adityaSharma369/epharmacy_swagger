let functions = {
    list: (req, res) => {

        try {
            let rules = {
                user_id: 'required|exists:user,_id'
            };

            let validation = new validator(req.body, rules);

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
        let rules = {
            user_id: 'required|exists:user,_id'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.replyBack({errors: validation.errors.errors, http_code: 400});
        });
        try {
            let filter = {"user_id": req.body.user_id, "is_active": true}
            fn.model('address').find(filter).select('_id title place state city location').then((data) => {
                return res.replyBack({msg: 'user address list', data: data, http_code: 200})
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
            let rules = {
                title: 'required|min:1|max:100',
                location: 'required|array',
                place: 'required',
                city: 'required',
                state: 'required',
                pin_code: 'required',
                user_id: 'required'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(() => {
                let user_id = req.body.user_id
                let title = req.body.title;
                let location = req.body.location;
                let place = req.body.place;
                let city = req.body.city;
                let state = req.body.state;
                let pin_code = req.body.pin_code;

                let _payload = {
                    user_id: user_id,
                    title: title,
                    location: location,
                    place: place,
                    city: city,
                    state: state,
                    pin_code: pin_code,
                    is_active: true,
                    is_primary: true
                };

                fn.model('address')
                    .updateMany({
                            user_id: user_id
                        }, {"is_primary": false}
                    ).then((data) => {
                    let user = new fn.model('address')(_payload);
                    user.save()
                        .then((data) => {
                            data.full_address = undefined;
                            return res.replyBack({msg: 'user address added', data: data, http_code: 201})
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
            let rules = {
                address_id: 'required|exists:address,_id',
                location: 'array',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let address_id = req.body.address_id;

                let _payload = {}

                if (typeof req.body.title != "undefined") {
                    _payload["title"] = req.body.title
                }

                if (typeof req.body.place != "undefined") {
                    _payload["place"] = req.body.place
                }
                if (typeof req.body.city != "undefined") {
                    _payload["city"] = req.body.city
                }
                if (typeof req.body.state != "undefined") {
                    _payload["state"] = req.body.state
                }
                if (typeof req.body.pin_code != "undefined") {
                    _payload["pin_code"] = req.body.pin_code
                }
                if (typeof req.body.location != "undefined") {
                    console.log(req.body.location)
                    _payload["location"] = req.body.location
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
                    .then(async (address) => {
                        await fn.model(address).updateMany({
                            user_id: address.user_id
                        }, {"is_primary": false})
                        address.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'address edited', http_code: 201});
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

            let rules = {
                address_id: 'required|exists:address,_id'
            };

            let validation = new validator(req.body, rules);

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
            let rules = {
                address_id: 'required|exists:address,_id'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let address_id = req.body.address_id;
                let _payload = {
                    "is_active": false
                }
                fn.model('address')
                    .findOne({
                        _id: address_id
                    })
                    .then((address) => {
                        address.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'address deleted', http_code: 201});
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
