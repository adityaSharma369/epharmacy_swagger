const BrandController = function (Validator, rabbitMQ, brandsRecord) {

    /**
     * @swagger
     * /api/brand/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Brand
     *    description: list of brands
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
     *      "description": "brands list",
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
                    let productObject = req.body
                    let response = await rabbitMQ.execute("inventory.brand.list", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/brand/listLite:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Brand
     *    description: list of brands
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
     *           search: {
     *               type: "string",
     *               example: ""
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "brands list",
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
    async function brandListLite(req, res, next) {

        try {
            let productObject = req.body
            let response = await rabbitMQ.execute("inventory.brand.listLite", productObject, 100)
            res.respond(JSON.parse(response.toString()))
        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }

    }

    /**
     * @swagger
     * /api/brand/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Brand
     *    description: Add brand
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New Brand object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/Brand"
     *    responses:
     *      '200': {
     *      "description": "brand added",
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
     * definitions:
     *     Brand:
     *       type: "object"
     *       required:
     *       - "title"
     *       - "description"
     *       properties:
     *        title:
     *          type: "string"
     *          example: "title"
     *        description:
     *          type: "string"
     *          example: "description of brand"
     */
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
                    let brandsObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active": true,
                        "is_deleted": false,
                    };
                    let response = await rabbitMQ.execute("inventory.brand.add", brandsObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/brand/view/{brand_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Brand
     *    description: view brand
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The brand_id  to view the details of brand
     *       name: "brand_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "brand details",
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
    async function viewBrand(req, res, next) {
        try {
            let rules = {
                "brand_id": "required|objectId"
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
                    let brandsObject = {
                        "brand_id": req.params.brand_id,
                    };
                    let response = await rabbitMQ.execute("inventory.brand.view", brandsObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/brand/delete/{brand_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Brand
     *    description: delete brand
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The brand_id  to delete the details of brand
     *       name: "brand_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "brand deleted",
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
    async function deleteBrand(req, res, next) {

        try {
            let rules = {
                "brand_id": "required|objectId"
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
                    let brandsObject = {
                        "brand_id": req.params.brand_id,
                    };
                    let response = await rabbitMQ.execute("inventory.brand.delete", brandsObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/brand/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Brand
     *    description: edit brand
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
     *           brand_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           title: {
     *               type: "string",
     *               example: "edited brand"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "brand edited",
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
    async function editBrand(req, res, next) {

        try {
            let rules = {
                'brand_id': 'required|objectId',
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
                    let brandObj = req.body
                    let response = await rabbitMQ.execute("inventory.brand.edit", brandObj, 100)
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

    /**
     * @swagger
     * /api/brand/toggle/{brand_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Brand
     *    description: deactivate brand
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The brand_id  to deactivate the brand
     *       name: "brand_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "brand de_activated",
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
    async function toggleBrand(req, res, next) {

        try {
            let rules = {
                "brand_id": "required|objectId"
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
                    let brandObj = {
                        "brand_id": req.params.brand_id,
                    };
                    let response = await rabbitMQ.execute("inventory.brand.toggle", brandObj, 100)
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
        getAllBrands, addBrand, viewBrand, deleteBrand, editBrand, toggleBrand, brandListLite
    }

}

module.exports = BrandController
