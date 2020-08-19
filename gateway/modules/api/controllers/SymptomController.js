const SymptomController = function (Validator, rabbitMQ, symptomsRecord) {

    /**
     * @swagger
     * /api/symptom/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Symptom
     *    description: list of symptoms
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
     *      "description": "symptoms list",
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
    async function getAllSymptoms(req, res, next) {

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
                    let response = await rabbitMQ.execute("inventory.symptom.list", productObject, 100)
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
     * /api/symptom/listLite:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Symptom
     *    description: list of symptoms
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
     *      "description": "symptoms list",
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
    async function symptomListLite(req, res, next) {
        try {
            try {
                let productObject = {
                    "search": req.body.search
                }
                let response = await rabbitMQ.execute("inventory.symptom.listLite", productObject, 100)
                res.respond(JSON.parse(response.toString()))
            } catch (e) {
                res.respond({http_code: 500, error: e.message})
            }
        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }


    /**
     * @swagger
     * /api/symptom/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Symptom
     *    description: Add symptom
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New Symptom object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/Symptom"
     *    responses:
     *      '200': {
     *      "description": "symptom added",
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
     *     Symptom:
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
     *          example: "symptom"
     */
    async function addSymptom(req, res, next) {

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
                    let symptomsObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active": true,
                        "is_deleted": false,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.add", symptomsObject, 100)
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
     * /api/symptom/view/{symptom_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Symptom
     *    description: view symptom
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The symptom_id  to view the details of symptom
     *       name: "symptom_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "symptom details",
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
    async function viewSymptom(req, res, next) {
        try {
            let rules = {
                "symptom_id": "required|objectId"
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
                    let symptomsObject = {
                        "symptom_id": req.params.symptom_id,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.view", symptomsObject, 100)
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
     * /api/symptom/delete/{symptom_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Symptom
     *    description: delete symptom
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The symptom_id  to delete the details of symptom
     *       name: "symptom_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "symptom deleted",
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
    async function deleteSymptom(req, res, next) {

        try {
            let rules = {
                "symptom_id": "required|objectId"
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
                    let symptomsObject = {
                        "symptom_id": req.params.symptom_id,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.delete", symptomsObject, 100)
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
     * /api/symptom/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Symptom
     *    description: edit symptom
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
     *           symptom_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           title: {
     *               type: "string",
     *               example: "edited symptom"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "symptom edited",
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
    async function editSymptom(req, res, next) {

        try {
            let rules = {
                'symptom_id': 'required|objectId',
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
                    let symptomObj = req.body
                    let response = await rabbitMQ.execute("inventory.symptom.edit", symptomObj, 100)
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
     * /api/symptom/toggle/{symptom_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Symptom
     *    description: deactivate symptom
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The symptom_id  to deactivate the symptom
     *       name: "symptom_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "symptom de_activated",
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
    async function toggleSymptom(req, res, next) {

        try {
            let rules = {
                "symptom_id": "required|objectId"
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
                    let symptomObj = {
                        "symptom_id": req.params.symptom_id,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.toggle", symptomObj, 100)
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
        getAllSymptoms, addSymptom, viewSymptom, deleteSymptom, editSymptom, toggleSymptom, symptomListLite
    }

}

module.exports = SymptomController
