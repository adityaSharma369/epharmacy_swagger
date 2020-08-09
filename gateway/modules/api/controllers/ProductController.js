const ProductController = function (Validator, rabbitMQ, userRecord) {

    async function getAllProducts(req, res, next) {

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
                    let response = await rabbitMQ.execute("inventory.product.list", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
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

    async function addProduct(req, res, next) {

        try {
            let rules = {
                "title": "required",
                "description": "required",
                "tab_notes": "required",
                "price": "required",
                "brand_id": "required|objectId",
                "molecule_id": "required|objectId",
                "manufacturer_id": "required|objectId",
                "type": "required|in:rx,otc",
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
                    let productObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "tab_notes": req.body["tab_notes"],
                        "price": req.body["price"],
                        "selling_price": req.body["selling_price"],
                        "brand_id": req.body["brand_id"],
                        "molecule_id": req.body["molecule_id"],
                        "manufacturer_id": req.body["manufacturer_id"],
                        "type": req.body["type"],
                    };
                    let response = await rabbitMQ.execute("inventory.product.add", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
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

    async function viewProduct(req, res, next) {

        try {
            let rules = {
                "product_id": "required|objectId"
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
                    let productObject = {
                        "product_id": req.params.product_id,
                    };
                    let response = await rabbitMQ.execute("inventory.product.view", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
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

    async function deleteProduct(req, res, next) {

        try {
            let rules = {
                "product_id": "required|objectId"
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
                    let productObject = {
                        "product_id": req.params.product_id,
                    };
                    let response = await rabbitMQ.execute("inventory.product.delete", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
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

    async function editProduct(req, res, next) {

        try {
            let rules = {
                'product_id': 'required',
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
                    let response = await rabbitMQ.execute("inventory.product.edit", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
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

    async function toggleProduct(req, res, next) {

        try {
            let rules = {
                "product_id": "required|objectId"
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
                    let productObject = {
                        "product_id": req.params.product_id,
                    };
                    let response = await rabbitMQ.execute("inventory.product.toggle", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
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
        getAllProducts, addProduct, viewProduct, deleteProduct, editProduct, toggleProduct
    }

}

module.exports = ProductController
