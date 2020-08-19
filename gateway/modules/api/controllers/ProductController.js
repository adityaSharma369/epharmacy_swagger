const ProductController = function (Validator, rabbitMQ, userRecord) {

    /**
     * @swagger
     * /api/product/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: list of products
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
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "products list",
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

    /**
     * @swagger
     * /api/product/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: Add product
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New Product object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/Product"
     *    responses:
     *      '200': {
     *      "description": "product added",
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
     *      "description": "Validation error",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     * definitions:
     *     Product:
     *       type: "object"
     *       required:
     *       - "title"
     *       - "description"
     *       - "tab_notes"
     *       - "price"
     *       - "brand_id"
     *       - "molecule_id"
     *       - "manufacturer_id"
     *       - "type"
     *       properties:
     *        title:
     *          type: "string"
     *          example: "title"
     *        description:
     *          type: "string"
     *          example: "description of product"
     *        tab_notes:
     *          type: "array"
     *          example: [{
     *	            "title":"test",
     *	            "description":"testing"
     *              }]
     *        price:
     *          type: "string"
     *          example: "100"
     *        brand_id:
     *          type: "string"
     *          example: "5f30e733966a3c00be49787a"
     *        molecule_id:
     *          type: "string"
     *          example: "5f30e733966a3c00be49787a"
     *        manufacturer_id:
     *          type: "string"
     *          example: "5f30e733966a3c00be49787a"
     *        type:
     *          type: "string"
     *          example: "otc"
     */
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

    /**
     * @swagger
     * /api/product/view/{product_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: view product
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The product_id  to view the details of product
     *       name: "product_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "product details",
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

    /**
     * @swagger
     * /api/product/delete/{product_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: delete product
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The product_id  to delete the details of product
     *       name: "product_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "product deleted",
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

    /**
     * @swagger
     * /api/product/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: edit product
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
     *           product_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           title: {
     *               type: "string",
     *               example: "edited product"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "product edited",
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
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/product/toggle/{product_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: deactivate product
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The product_id  to deactivate the product
     *       name: "product_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "product de_activated",
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


    /**
     * @swagger
     * /api/product/productImages:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: list of productImages
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
     *           product_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "list of productImages",
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
    async function productImages(req, res, next) {

        try {
            let rules = {
                'product_id': 'required|objectId',
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
                    let payload = {
                        product_id: product_id,
                    }
                    let response = await rabbitMQ.execute("inventory.product.productImages", payload, 100)
                    response = JSON.parse(response.toString())
                    res.respond(response)
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
     * /api/product/uploadProductImage:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: uploads an image
     *    consumes:
     *     - "multipart/form-data"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "formData"
     *       name: "product_id"
     *       description: "product_id to which image is being uploaded"
     *       required: true
     *       type: string
     *     - in: "formData"
     *       name: "image"
     *       description: "image to upload"
     *       required: true
     *       type: file
     *    responses:
     *      '200': {
     *      "description": "product image uploaded",
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
     */
    async function uploadProductImage(req, res, next) {

        try {
            let rules = {
                'product_id': 'required|objectId',
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
                    const image = req.file
                    const product_id = req.body.product_id
                    const target_path = './uploads/products/' + product_id
                    if (!fs.existsSync(target_path)) {
                        fs.mkdirSync(target_path, {recursive: true});
                    }
                    fs.rename("./uploads/" + image.filename, target_path + "/" + image.filename, function (err) {
                        if (err) {
                            return res.err({
                                error: err,
                                http_code: 500
                            });
                        }
                    })
                    let payload = {
                        product_id: product_id,
                        image: image.filename
                    }
                    let response = await rabbitMQ.execute("inventory.product.uploadImage", payload, 100)
                    response = JSON.parse(response.toString())
                    if (response.http_code === 200) {
                        response.msg = "image uploaded"
                    }
                    res.respond(response)
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
     * /api/product/makePrimaryImage/{product_image_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: make primary image of a product
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The product_image_id  to mark as primary
     *       name: "product_image_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "primary image for the product is set",
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
    async function makePrimaryImage(req, res, next) {

        try {
            let rules = {
                'product_image_id': 'required|objectId',
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
                    const product_image_id = req.params.product_image_id
                    let payload = {
                        product_image_id: product_image_id,
                    }
                    let response = await rabbitMQ.execute("inventory.product.makePrimaryImage", payload, 100)
                    response = JSON.parse(response.toString())
                    res.respond(response)
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
     * /api/product/deleteImage/{product_image_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Product
     *    description: delete image of a product
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The product_image_id  to delete the image
     *       name: "product_image_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "image of the product is deleted",
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
    async function deleteImage(req, res, next) {

        try {
            let rules = {
                'product_image_id': 'required|objectId',
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
                    const product_image_id = req.params.product_image_id
                    let payload = {
                        product_image_id: product_image_id,
                    }
                    let response = await rabbitMQ.execute("inventory.product.deleteImage", payload, 100)
                    response = JSON.parse(response.toString())
                    res.respond(response)
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
