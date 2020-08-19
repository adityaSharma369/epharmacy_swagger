const ManufacturerController = function (Validator, rabbitMQ, manufacturersRecord) {

    /**
     * @swagger
     * /api/manufacturer/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Manufacturer
     *    description: list of manufacturers
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
     *      "description": "manufacturers list",
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

    /**
     * @swagger
     * /api/manufacturer/listLite:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Manufacturer
     *    description: list of manufacturers
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
     *      "description": "manufacturers list",
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
    async function manufacturerListLite(req, res, next) {

        try {

            let productObject = req.body
            let response = await rabbitMQ.execute("inventory.manufacturer.listLite", productObject, 100)
            res.respond(JSON.parse(response.toString()))

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/manufacturer/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Manufacturer
     *    description: Add manufacturer
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New Manufacturer object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/Manufacturer"
     *    responses:
     *      '200': {
     *      "description": "manufacturer added",
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
     *     Manufacturer:
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
     *          example: "manufacture"
     */
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

    /**
     * @swagger
     * /api/manufacturer/view/{manufacturer_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Manufacturer
     *    description: view manufacturer
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The manufacturer_id  to view the details of manufacturer
     *       name: "manufacturer_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "manufacturer details",
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

    /**
     * @swagger
     * /api/manufacturer/delete/{manufacturer_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Manufacturer
     *    description: delete manufacturer
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The manufacturer_id  to delete the details of manufacturer
     *       name: "manufacturer_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "manufacturer deleted",
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

    /**
     * @swagger
     * /api/manufacturer/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Manufacturer
     *    description: edit manufacturer
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
     *           manufacturer_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           title: {
     *               type: "string",
     *               example: "edited manufacture"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "manufacturer edited",
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

    /**
     * @swagger
     * /api/manufacturer/toggle/{manufacturer_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Manufacturer
     *    description: deactivate manufacturer
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The manufacturer_id  to deactivate the manufacturer
     *       name: "manufacturer_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "manufacturer de_activated",
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
