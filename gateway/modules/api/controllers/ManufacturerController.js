const ManufacturerController = function (Validator, rabbitMQ, manufacturersRecord) {

    async function getAllManufacturers(req, res, next) {

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
                    let productObject = req.body
                    let response = await rabbitMQ.execute("inventory.manufacturer.list", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function manufacturerListLite(req, res, next) {

        try {

            let productObject = req.body
            let response = await rabbitMQ.execute("inventory.manufacturer.listLite", productObject, 100)
            res.respond(JSON.parse(response.toString()))

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addManufacturer(req, res, next) {

        try {
            let rules = {
                "title": "required",
                "description": "required",
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
                    let manufacturersObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active": true,
                        "is_deleted": false,
                    };
                    let response = await rabbitMQ.execute("inventory.manufacturer.add", manufacturersObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function viewManufacturer(req, res, next) {
        try {
            let rules = {
                "manufacturer_id": "required|objectId"
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
                    let manufacturersObject = {
                        "manufacturer_id": req.params.manufacturer_id,
                    };
                    let response = await rabbitMQ.execute("inventory.manufacturer.view", manufacturersObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function deleteManufacturer(req, res, next) {

        try {
            let rules = {
                "manufacturer_id": "required|objectId"
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
                    let manufacturersObject = {
                        "manufacturer_id": req.params.manufacturer_id,
                    };
                    let response = await rabbitMQ.execute("inventory.manufacturer.delete", manufacturersObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function editManufacturer(req, res, next) {

        try {
            let rules = {
                'manufacturer_id': 'required|objectId',
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
                    let manufacturerObj = req.body
                    let response = await rabbitMQ.execute("inventory.manufacturer.edit", manufacturerObj, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            console.log(e);
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function toggleManufacturer(req, res, next) {

        try {
            let rules = {
                "manufacturer_id": "required|objectId"
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
                    let manufacturerObj = {
                        "manufacturer_id": req.params.manufacturer_id,
                    };
                    let response = await rabbitMQ.execute("inventory.manufacturer.toggle", manufacturerObj, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    return {
        getAllManufacturers,
        addManufacturer,
        viewManufacturer,
        deleteManufacturer,
        editManufacturer,
        toggleManufacturer,
        manufacturerListLite
    }

}

module.exports = ManufacturerController
