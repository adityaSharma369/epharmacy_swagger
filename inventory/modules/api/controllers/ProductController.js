const ProductController = function (Validator, rabbitMQ, productRecord, productImageRecord,
                                    brandRecord, manufacturerRecord, moleculeRecord) {

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
                             $or: [{title: {$regex: req.body.search, $options: 'si'}}]
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
                "brand_id": "required|objectId|exists:brands,_id",
                "molecule_id": "required|objectId|exists:molecules,_id",
                "manufacturer_id": "required|objectId|exists:manufacturers,_id",
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
                        "is_active": true,
                        "is_deleted": false,
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
                    const product_id = req.body.product_id
                    let productObject = {
                        "_id": product_id,
                    };
                    let data = await productRecord.getProduct(productObject);
                    if (data.is_deleted === true) {
                        return res.respond({error: "product was deleted or not found", http_code: 500});
                    }
                    data['_doc']["image"] = await productImageRecord.getProductImages({"product_id": product_id});
                    for (let i = 0; i < data["_doc"]["image"].length; i++) {
                        data["_doc"]["image"][i]["image"] = CURRENT_DOMAIN + "/products/" + product_id + "/" + data["_doc"]["image"][i]["image"]
                    }
                    data["_doc"]["brand"] = await brandRecord.getBrand({_id: data["brand_id"]})
                    data["_doc"]["molecule"] = await moleculeRecord.getMolecule({_id: data["molecule_id"]})
                    data["_doc"]["manufacturer"] = await manufacturerRecord.getManufacturer({_id: data["manufacturer_id"]})
                    return res.respond({
                        http_code: 200,
                        msg: 'product',
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
                'type': "in:rx,otc"
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
                    if (req.body["title"] !== null) {
                        product["title"] = req.body["title"]
                    }
                    if (req.body["description"] !== null) {
                        product["description"] = req.body["description"]
                    }
                    if (req.body["tab_notes"] !== null) {
                        product["tab_notes"] = req.body["tab_notes"]
                    }
                    if (req.body["price"] !== null) {
                        product["price"] = req.body["price"]
                    }
                    if (req.body["selling_price"] !== null) {
                        product["selling_price"] = req.body["selling_price"]
                    }
                    if (req.body["brand_id"] !== null) {
                        product["brand_id"] = req.body["brand_id"]
                    }
                    if (req.body["molecule_id"] !== null) {
                        product["molecule_id"] = req.body["molecule_id"]
                    }
                    if (req.body["manufacturer_id"] !== null) {
                        product["manufacturer_id"] = req.body["manufacturer_id"]
                    }
                    if (req.body["type"] !== null) {
                        product["type"] = req.body["type"]
                    }
                    let data = await productRecord.editProduct({"_id": product_id}, product);
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
                    if (product["is_active"] === false) {
                        msg = "product activated"
                        product["is_active"] = true
                    } else {
                        msg = "product de_activated"
                        product["is_active"] = false
                    }
                    let data = await productRecord.editProduct({"_id": product_id}, product);
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

    async function productImages(req, res, next) {

        try {
            let rules = {
                'product_id': 'required|objectId|exists:products,_id',
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
                    let product_images = await productImageRecord.getProductImages({"product_id": product_id})
                    product_images.forEach(function (product_image) {
                            if (product_image.image !== null && product_image.image !== undefined) {
                                product_image.image = CURRENT_DOMAIN + "/products/" + product_id + "/" + product_image.image
                            }
                        }
                    );
                    return res.respond({
                        http_code: 200,
                        msg: 'images',
                        data: product_images
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

    async function uploadProductImage(req, res, next) {

        try {
            let rules = {
                "image": "required",
                "product_id": "required|exists:products,_id",
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
                        "product_id": req.body["product_id"],
                        "image": req.body["image"],
                        "sort_order": 1,
                        "is_primary": true
                    };
                    let response = await productImageRecord.addProductImage(productObject);
                    res.respond({http_code: 200, msg: 'product image added', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function makePrimaryImage(req, res, next) {

        try {
            let rules = {
                'product_image_id': 'required|objectId|exists:product_images,_id',
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
                    let product_image_id = req.body["product_image_id"]
                    let product = await productImageRecord.getProductImage({"_id": product_image_id})
                    let product_id = product["product_id"]
                    let a = await productImageRecord.editProductImage({
                        "product_id": product_id,
                        "is_primary": true
                    }, {"is_primary": false});
                    product["is_primary"] = true
                    let data = await productImageRecord.editProductImage({"_id": product_image_id}, product);
                    return res.respond({
                        http_code: 200,
                        msg: 'primary image updated',
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

    async function deleteImage(req, res, next) {

        try {
            let rules = {
                'product_image_id': 'required|objectId|exists:product_images,_id',
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
                    let product_image_id = req.body["product_image_id"]
                    let data = await productImageRecord.deleteProductImage({"_id": product_image_id})
                    return res.respond({
                        http_code: 200,
                        msg: 'image deleted',
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
        getAllProducts,
        addProduct,
        viewProduct,
        deleteProduct,
        editProduct,
        toggleProduct,
        uploadProductImage,
        makePrimaryImage,
        productImages,
        deleteImage
    }

}

module.exports = ProductController
