const ProductController = function (Validator, rabbitMQ, productRecord) {

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
                    let page = req.body["page"] ? parseInt(req.body["page"]) : 1;
                    let limit = req.body["limit"] ? parseInt(req.body["limit"]) : 10;

                    let filter = {};
                    if (typeof req.body.search != "undefined") {
                        filter = {
                            $or: [{name: {$regex: req.body.search, $options: 'si'}}, {
                                title: {
                                    $regex: req.body.search,
                                    $options: 'si'
                                },
                            }]
                        }
                    }
                    filter["is_deleted"] = false
                    let response = await productRecord.paginate(filter, "", limit, page, "");
                    res.respond({http_code: 200, msg: 'list', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
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
                        "is_active":true,
                        "is_deleted":false,
                    };
                    let response = await productRecord.addProduct(productObject);
                    res.respond({http_code: 200, msg: 'product added', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function viewProduct(req, res, next) {

        try {
            let rules = {
                "product_id": "required|objectId|exists:products,_id"
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
                        "_id": req.body.product_id,
                    };
                    let response = await productRecord.getProduct(productObject);
                    res.respond({http_code: 200, msg: 'product details', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function deleteProduct(req, res, next) {

        try {
            let rules = {
                "product_id": "required|objectId|exists:products,_id"
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
                        "_id": req.body.product_id,
                    };
                    let response = await productRecord.editProduct(productObject, {"is_deleted": true});
                    res.respond({http_code: 200, msg: 'user deleted', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function editProduct(req, res, next) {

        try {
            let rules = {
                'product_id': 'required|objectId|exists:products,_id',
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
                    let product_id = req.body["product_id"]
                    let product = await productRecord.getProduct({"_id": product_id})
                    if(req.body["title"] !== null){
                        product["title"] = req.body["title"]
                    }
                    if(req.body["description"] !== null){
                        product["description"] = req.body["description"]
                    }
                    if(req.body["tab_notes"] !== null){
                        product["tab_notes"] = req.body["tab_notes"]
                    }
                    if(req.body["price"]!==null){
                        product["price"] = req.body["price"]
                    }
                    if(req.body["selling_price"] !== null){
                        product["selling_price"] = req.body["selling_price"]
                    }
                    if(req.body["brand_id"] !== null){
                        product["brand_id"] = req.body["brand_id"]
                    }
                    if(req.body["molecule_id"] !== null){
                        product["molecule_id"] = req.body["molecule_id"]
                    }
                    if(req.body["manufacturer_id"] !== null){
                        product["manufacturer_id"] = req.body["manufacturer_id"]
                    }
                    if(req.body["type"] !== null){
                        product["type"] = req.body["type"]
                    }
                    let data = await productRecord.editProduct({"_id": product_id},product);
                    return res.respond({
                        http_code: 200,
                        msg: 'product edited',
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

    async function toggleProduct(req, res, next) {

        try {
            let rules = {
                "product_id": "required|objectId|exists:products,_id"
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
                    let product_id = req.body.product_id
                    let msg = ""
                    let product = await productRecord.getProduct({"_id": product_id})
                    if(product["is_active"] === false){
                        msg = "product activated"
                        product["is_active"] = true
                    }else{
                        msg = "product de_activated"
                        product["is_active"] = false
                    }
                    let data = await productRecord.editProduct({"_id": product_id},product);
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
        getAllProducts, addProduct, viewProduct, deleteProduct, editProduct, toggleProduct
    }

}

module.exports = ProductController
