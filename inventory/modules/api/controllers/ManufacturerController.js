const ManufacturerController = function (Validator, rabbitMQ, manufacturerRecord) {

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
                    let page = req.body["page"] ? parseInt(req.body["page"]) : 1;
                    let limit = req.body["limit"] ? parseInt(req.body["limit"]) : 10;

                    let filter = {};
                    if (typeof req.body.search != "undefined") {
                        filter = {
                            $or: [{title: {$regex: req.body.search, $options: 'si'}}]
                        }
                    }
                    filter["is_deleted"] = false
                    let response = await manufacturerRecord.paginate(filter, "", limit, page, "");
                    res.respond({http_code: 200, msg: 'list', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

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
                    let manufacturerObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active":true,
                        "is_deleted":false,
                    };
                    let response = await manufacturerRecord.addManufacturer(manufacturerObject);
                    res.respond({http_code: 200, msg: 'manufacturer added', data: response})
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
                "manufacturer_id": "required|objectId|exists:manufacturers,_id"
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
                    let manufacturerObject = {
                        "_id": req.body.manufacturer_id,
                    };
                    let response = await manufacturerRecord.getManufacturer(manufacturerObject);
                    res.respond({http_code: 200, msg: 'manufacturer details', data: response})
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
                "manufacturer_id": "required|objectId|exists:manufacturers,_id"
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
                    let manufacturerObject = {
                        "_id": req.body.manufacturer_id,
                    };
                    let response = await manufacturerRecord.editManufacturer(manufacturerObject, {"is_deleted": true});
                    res.respond({http_code: 200, msg: 'manufacturer deleted', data: response})
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
                'manufacturer_id': 'required|objectId|exists:manufacturers,_id',
                'type':"in:rx,otc"
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
                    let manufacturer_id = req.body["manufacturer_id"]
                    let manufacturer = await manufacturerRecord.getManufacturer({"_id": manufacturer_id})
                    if(req.body["title"] !== null){
                        manufacturer["title"] = req.body["title"]
                    }
                    if(req.body["description"] !== null){
                        manufacturer["description"] = req.body["description"]
                    }
                    let data = await manufacturerRecord.editManufacturer({"_id": manufacturer_id},manufacturer);
                    return res.respond({
                        http_code: 200,
                        msg: 'manufacturer edited',
                        data: data
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

    async function toggleManufacturer(req, res, next) {

        try {
            let rules = {
                "manufacturer_id": "required|objectId|exists:manufacturers,_id"
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
                    let manufacturer_id = req.body.manufacturer_id
                    let msg = ""
                    let manufacturer = await manufacturerRecord.getManufacturer({"_id": manufacturer_id})
                    if(manufacturer["is_active"] === false){
                        msg = "manufacturer activated"
                        manufacturer["is_active"] = true
                    }else{
                        msg = "manufacturer de_activated"
                        manufacturer["is_active"] = false
                    }
                    let data = await manufacturerRecord.editManufacturer({"_id": manufacturer_id},manufacturer);
                    return res.respond({
                        http_code: 200,
                        msg: msg,
                        data: data
                    });
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    return {
        getAllManufacturers, addManufacturer, viewManufacturer, deleteManufacturer, editManufacturer, toggleManufacturer
    }

}

module.exports = ManufacturerController
