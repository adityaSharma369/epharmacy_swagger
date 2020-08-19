const MoleculeController = function (Validator, rabbitMQ, moleculesRecord) {


    /**
     * @swagger
     * /api/molecule/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Molecule
     *    description: list of molecules
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
     *      "description": "molecules list",
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
    async function getAllMolecules(req, res, next) {

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
                    let response = await rabbitMQ.execute("inventory.molecule.list", productObject, 100)
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
     * /api/molecule/listLite:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Molecule
     *    description: list of molecules
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
     *      "description": "molecules list",
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
    async function moleculeListLite(req, res, next) {

        try {

            let productObject = req.body
            let response = await rabbitMQ.execute("inventory.molecule.listLite", productObject, 100)
            res.respond(JSON.parse(response.toString()))


        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/molecule/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Molecule
     *    description: Add molecule
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New Molecule object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/Molecule"
     *    responses:
     *      '200': {
     *      "description": "molecule added",
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
     *     Molecule:
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
     *          example: "molecule"
     */
    async function addMolecule(req, res, next) {

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
                    let moleculesObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active": true,
                        "is_deleted": false,
                    };
                    let response = await rabbitMQ.execute("inventory.molecule.add", moleculesObject, 100)
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
     * /api/molecule/view/{molecule_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Molecule
     *    description: view molecule
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The molecule_id  to view the details of molecule
     *       name: "molecule_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "molecule details",
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

    async function viewMolecule(req, res, next) {
        try {
            let rules = {
                "molecule_id": "required|objectId"
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
                    let moleculesObject = {
                        "molecule_id": req.params.molecule_id,
                    };
                    let response = await rabbitMQ.execute("inventory.molecule.view", moleculesObject, 100)
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
     * /api/molecule/delete/{molecule_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Molecule
     *    description: delete molecule
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The molecule_id  to delete the details of molecule
     *       name: "molecule_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "molecule deleted",
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
    async function deleteMolecule(req, res, next) {

        try {
            let rules = {
                "molecule_id": "required|objectId"
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
                    let moleculesObject = {
                        "molecule_id": req.params.molecule_id,
                    };
                    let response = await rabbitMQ.execute("inventory.molecule.delete", moleculesObject, 100)
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
     * /api/molecule/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Molecule
     *    description: edit molecule
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
     *           molecule_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           title: {
     *               type: "string",
     *               example: "ladakh"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "molecule edited",
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

    async function editMolecule(req, res, next) {

        try {
            let rules = {
                'molecule_id': 'required|objectId',
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
                    let moleculeObj = req.body
                    let response = await rabbitMQ.execute("inventory.molecule.edit", moleculeObj, 100)
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
     * /api/molecule/toggle/{molecule_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Molecule
     *    description: deactivate molecule
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The molecule_id  to deactivate the molecule
     *       name: "molecule_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "molecule de_activated",
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
    async function toggleMolecule(req, res, next) {

        try {
            let rules = {
                "molecule_id": "required|objectId"
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
                    let moleculeObj = {
                        "molecule_id": req.params.molecule_id,
                    };
                    let response = await rabbitMQ.execute("inventory.molecule.toggle", moleculeObj, 100)
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
        getAllMolecules, addMolecule, viewMolecule, deleteMolecule, editMolecule, toggleMolecule, moleculeListLite
    }

}

module.exports = MoleculeController
