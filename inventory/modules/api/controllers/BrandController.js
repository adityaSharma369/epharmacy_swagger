const BrandController = function (Validator, rabbitMQ, brandRecord) {

    async function getAllBrands(req, res, next) {

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
                    let response = await brandRecord.paginate(filter, "", limit, page, "");
                    res.respond({http_code: 200, msg: 'list', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addBrand(req, res, next) {

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
                    let brandObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active":true,
                        "is_deleted":false,
                    };
                    let response = await brandRecord.addBrand(brandObject);
                    res.respond({http_code: 200, msg: 'brand added', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function viewBrand(req, res, next) {

        try {
            let rules = {
                "brand_id": "required|objectId|exists:brands,_id"
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
                    let brandObject = {
                        "_id": req.body.brand_id,
                    };
                    let response = await brandRecord.getBrand(brandObject);
                    res.respond({http_code: 200, msg: 'brand details', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function deleteBrand(req, res, next) {

        try {
            let rules = {
                "brand_id": "required|objectId|exists:brands,_id"
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
                    let brandObject = {
                        "_id": req.body.brand_id,
                    };
                    let response = await brandRecord.editBrand(brandObject, {"is_deleted": true});
                    res.respond({http_code: 200, msg: 'brand deleted', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function editBrand(req, res, next) {

        try {
            let rules = {
                'brand_id': 'required|objectId|exists:brands,_id',
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
                    let brand_id = req.body["brand_id"]
                    let brand = await brandRecord.getBrand({"_id": brand_id})
                    if(req.body["title"] !== null){
                        brand["title"] = req.body["title"]
                    }
                    if(req.body["description"] !== null){
                        brand["description"] = req.body["description"]
                    }
                    let data = await brandRecord.editBrand({"_id": brand_id},brand);
                    return res.respond({
                        http_code: 200,
                        msg: 'brand edited',
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

    async function toggleBrand(req, res, next) {

        try {
            let rules = {
                "brand_id": "required|objectId|exists:brands,_id"
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
                    let brand_id = req.body.brand_id
                    let msg = ""
                    let brand = await brandRecord.getBrand({"_id": brand_id})
                    if(brand["is_active"] === false){
                        msg = "brand activated"
                        brand["is_active"] = true
                    }else{
                        msg = "brand de_activated"
                        brand["is_active"] = false
                    }
                    let data = await brandRecord.editBrand({"_id": brand_id},brand);
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
        getAllBrands, addBrand, viewBrand, deleteBrand, editBrand, toggleBrand
    }

}

module.exports = BrandController
