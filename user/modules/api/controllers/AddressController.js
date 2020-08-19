let bcrypt = require('bcryptjs');

const AddressController = function (Validator, rabbitMQ, addressRecord, userRecord) {

    async function getAllAddresses(req, res, next) {
        try {
            let rules = {
                page: 'required|numeric',
                limit: 'required|numeric',
                user_id: 'required|objectId|exists:users,_id'
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                let page = req.body.page ? req.body.page : 1;
                let limit = req.body.limit ? req.body.limit : 10;
                let user_id = req.body.user_id
                let filter = {};
                if (typeof req.body.search != "undefined") {
                    filter = {
                        $or: [{
                            title: {
                                $regex: req.body.search,
                                $options: 'si'
                            },
                        }, {
                            place: {
                                $regex: req.body.search,
                                $options: 'si'
                            },
                        }]
                    }
                }
                filter["user_id"] = user_id
                let addressDetails = await addressRecord.paginate(filter, "", limit, page, "");
                res.respond({http_code: 200, msg: 'addresses list', data: addressDetails})
            });
        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addressListLite(req, res, next) {
        try {
            let rules = {
                user_id: 'required|objectId|exists:users,_id'
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                let filter = {};
                if (typeof req.body.search != "undefined") {
                    filter = {
                        $or: [{
                            title: {
                                $regex: req.body.search,
                                $options: 'si'
                            },
                        }, {
                            place: {
                                $regex: req.body.search,
                                $options: 'si'
                            },
                        }]
                    }
                }
                filter["user_id"] = req.body.user_id
                let addressDetails = await addressRecord.getAddresses(filter);
                res.respond({http_code: 200, msg: 'addresses list', data: addressDetails})
            });
        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addAddress(req, res, next) {

        try {
            let rules = {
                title: 'required|min:1|max:100',
                location: 'required|array',
                place: 'required',
                city: 'required',
                state: 'required',
                pin_code: 'required',
                user_id: 'required|objectId|exists:users,_id'
            };
            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
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
                    let a = await addressRecord.editAddress({
                        "user_id": user_id,
                        "is_primary": true
                    }, {"is_primary": false});
                    let addressObject = await addressRecord.addAddress(_payload);
                    res.respond({http_code: 200, msg: 'address added', data: addressObject})
                } catch (e) {
                    // input validation was successful
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function viewAddress(req, res, next) {

        try {
            let rules = {
                "address_id": "required|objectId|exists:addresses,_id"
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let addressObject = {
                        "_id": req.body["address_id"],
                    }
                    let addressDetails = await addressRecord.getAddress(addressObject);
                    res.respond({http_code: 200, msg: 'address details', data: addressDetails})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function deleteAddress(req, res, next) {

        try {
            let rules = {
                "address_id": "required|objectId|exists:addresses,_id"
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let addressObject = {
                        "_id": req.body.address_id
                    }
                    let addressDetails = await addressRecord.deleteAddress(addressObject);
                    res.respond({http_code: 200, msg: 'address deleted', data: addressDetails})
                } catch (e) {
                    // input validation was successful
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function editAddress(req, res, next) {
        try {
            let rules = {
                address_id: 'required|exists:addresses,_id',
                location: 'array',
            };
            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                let address_id = req.body.address_id;

                let _payload = await addressRecord.getAddress({"_id": address_id})

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
                let data = await addressRecord.editAddress({"_id": address_id}, _payload);
                return res.respond({
                    http_code: 200,
                    msg: 'profile edited',
                    data: data
                });
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function toggleAddress(req, res, next) {
        try {
            let rules = {
                "address_id": "required|objectId|exists:addresses,_id",
            };
            let validation = new Validator(req.body, rules);
            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });
            validation.passes(async () => {
                let address_id = req.body.address_id
                let msg = ""
                let addressObject = await addressRecord.getAddress({"_id": address_id})
                if (addressObject["is_active"] === false) {
                    msg = "address activated"
                    addressObject["is_active"] = true
                } else {
                    msg = "address de_activated"
                    addressObject["is_active"] = false
                }
                let data = await addressRecord.editAddress({"_id": address_id}, addressObject);
                return res.respond({
                    http_code: 200,
                    msg: msg,
                    data: data
                });
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function makePrimaryAddress(req, res, next) {

        try {
            let rules = {
                'address_id': 'required|objectId|exists:addresses,_id',
            };
            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let address_id = req.body["address_id"]
                    let address = await addressRecord.getAddress({"_id": address_id})
                    let a = await addressRecord.editAddress({
                        "user_id": address["user_id"],
                        "is_primary": true
                    }, {"is_primary": false});
                    address["is_primary"] = true
                    let data = await addressRecord.editAddress({"_id": address_id}, address);
                    return res.respond({
                        http_code: 200,
                        msg: 'primary address updated',
                        // data: data
                    });
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            console.log(e);
            res.respond({http_code: 500, error: e.message})
        }
    }

    return {
        getAllAddresses, addAddress, viewAddress, deleteAddress, editAddress, toggleAddress, addressListLite, makePrimaryAddress
    }

}

module.exports = AddressController
