const AddressController = function (Validator, rabbitMQ, addressRecord) {

    /**
     * @swagger
     * /api/address/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Address
     *    description: list of addresses
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           page: {
     *             type: "number",
     *             example: "1"
     *           },
     *           limit: {
     *               type: "number",
     *               example: "10"
     *           },
     *           search: {
     *               type: "string",
     *               example: ""
     *           },
     *           user_id: {
     *               type: "string",
     *               example: "5f32594b25043800133d3437"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "addresses list",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
    async function getAllAddresses(req, res, next) {

        try {
            let rules = {
                page: 'required|numeric',
                limit: 'required|numeric'
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
                    let addressObject = req.body
                    let addressResponse = await rabbitMQ.execute("user.address.list", addressObject, 100)
                    res.respond(JSON.parse(addressResponse.toString()))
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

    /**
     * @swagger
     * /api/address/listLite:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Address
     *    description: list of addresses
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           user_id: {
     *               type: "string",
     *               example: "5f32594b25043800133d3437"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "addresses list",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
    async function addressListLite(req, res, next) {

        try {
            let addressObject = req.body
            let addressResponse = await rabbitMQ.execute("user.address.listLite", addressObject, 100)
            res.respond(JSON.parse(addressResponse.toString()))

        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/address/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Address
     *    description: Add Address of the user
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New Address object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/Address"
     *    responses:
     *      '200': {
     *      "description": "address added",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
    async function addAddress(req, res, next) {

        try {
            let rules = {
                title: 'required|min:1|max:100',
                location: 'required',
                place: 'required',
                city: 'required',
                state: 'required',
                pin_code: 'required',
                user_id: 'required'
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
                        pin_code: pin_code
                    };
                    let addressResponse = await rabbitMQ.execute("user.address.add", _payload, 100)
                    res.respond(JSON.parse(addressResponse.toString()))
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

    /**
     * @swagger
     * /api/address/view/{address_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Address
     *    description: view address
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The address_id  to view the details of address
     *       name: "address_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "address details",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
    async function viewAddress(req, res, next) {

        try {
            let rules = {
                "address_id": "required|objectId"
            };
            let validation = new Validator(req.params, rules);
            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });
            validation.passes(async () => {
                try {
                    let addressObject = {
                        "address_id": req.params.address_id,
                    };
                    let addressResponse = await rabbitMQ.execute("user.address.view", addressObject, 100)
                    res.respond(JSON.parse(addressResponse.toString()))
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

    /**
     * @swagger
     * /api/address/delete/{address_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Address
     *    description: delete address
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The address_id  to delete the details of address
     *       name: "address_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "address deleted",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
    async function deleteAddress(req, res, next) {

        try {
            let rules = {
                "address_id": "required|objectId"
            };

            let validation = new Validator(req.params, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let addressObject = {
                        "address_id": req.params.address_id,
                    };
                    let addressResponse = await rabbitMQ.execute("user.address.delete", addressObject, 100)
                    res.respond(JSON.parse(addressResponse.toString()))
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

    /**
     * @swagger
     * /api/address/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Address
     *    description: edit address
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           address_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           place: {
     *               type: "string",
     *               example: "ladakh"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "address edited",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
    async function editAddress(req, res, next) {

        try {
            let rules = {
                'address_id': 'required|objectId',
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
                    let address_id = req.body.address_id
                    let title = req.body.title;
                    let location = req.body.location;
                    let place = req.body.place;
                    let city = req.body.city;
                    let state = req.body.state;
                    let pin_code = req.body.pin_code

                    let is_primary = req.body.is_primary;

                    let _payload = {
                        address_id: address_id,
                        title: title,
                        location: location,
                        place: place,
                        city: city,
                        state: state,
                        pin_code: pin_code,
                        is_primary: is_primary
                    };
                    let addressResponse = await rabbitMQ.execute("user.address.edit", _payload, 100)
                    res.respond(JSON.parse(addressResponse.toString()))
                } catch (e) {
                    // input validation was successful
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            // error is unknown
            console.log(e);
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/address/toggle/{address_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Address
     *    description: toggle address
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The address_id  to deactivate the address
     *       name: "address_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "address de_activated",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
    async function toggleAddress(req, res, next) {

        try {
            let rules = {
                "address_id": "required|objectId"
            };

            let validation = new Validator(req.params, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let addressObject = {
                        "address_id": req.params.address_id,
                    };
                    let addressResponse = await rabbitMQ.execute("user.address.toggle", addressObject, 100)
                    res.respond(JSON.parse(addressResponse.toString()))
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

    return {
        getAllAddresses,
        addAddress,
        viewAddress,
        deleteAddress,
        editAddress,
        toggleAddress,
        addressListLite
    }

}

module.exports = AddressController
