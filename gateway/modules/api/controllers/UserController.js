const UserController = function (Validator, rabbitMQ, userRecord) {
    /**
     * @swagger
     * /api/user/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: user list
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
     *      "description": "users list",
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
    async function getAllUsers(req, res, next) {

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
                    let userObject = req.body
                    let userResponse = await rabbitMQ.execute("user.list", userObject, 100)
                    res.respond(JSON.parse(userResponse.toString()))
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
     * /api/user/listLite:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: users list
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
     *      "description": "users list",
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
    async function userListLite(req, res, next) {

        try {
            let userObject = req.body
            let userResponse = await rabbitMQ.execute("user.listLite", userObject, 100)
            res.respond(JSON.parse(userResponse.toString()))

        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/user/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: Add a new user
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New User object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/User"
     *    responses:
     *      '200': {
     *      "description": "user added",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '400': {
     *      "description": "Validation Errors",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     */
    async function addUser(req, res, next) {

        try {
            let rules = {
                "name": "required",
                "email": "required|email",
                "password": "required|min:6",
                "phone": "required|min:10",
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
                    let userObject = {
                        "name": req.body["name"],
                        "email": req.body["email"],
                        "password": req.body["password"],
                        "phone": req.body["phone"],
                        "role": req.body["role"]
                    };
                    let userResponse = await rabbitMQ.execute("user.add", userObject, 100)
                    res.respond(JSON.parse(userResponse.toString()))
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
     * /api/user/view/{user_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: view user
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The user_id of the user whom you want to view the details
     *       name: "user_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "user details",
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
    async function viewUser(req, res, next) {

        try {
            let rules = {
                "user_id": "required|objectId"
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
                    let userObject = {
                        "user_id": req.params.user_id,
                    };
                    let userResponse = await rabbitMQ.execute("user.view", userObject, 100)
                    res.respond(JSON.parse(userResponse.toString()))
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
     * /api/user/delete/{user_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: delete user
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       name: "user_id"
     *       description: The user_id of the user whom you want to delete
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "user deleted",
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
    async function deleteUser(req, res, next) {

        try {
            let rules = {
                "user_id": "required|objectId"
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
                    let userObject = {
                        "user_id": req.params.user_id,
                    };
                    let userResponse = await rabbitMQ.execute("user.delete", userObject, 100)
                    res.respond(JSON.parse(userResponse.toString()))
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
     * /api/user/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: edit user
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
     *           user_id: {
     *             type: "string",
     *             example: "5f32594b25043800133d3437"
     *           },
     *           name: {
     *               type: "string",
     *               example: "jenny"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "user edited",
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
    async function editUser(req, res, next) {

        try {
            let rules = {
                'user_id': 'required',
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
                    let userObject = req.body
                    let userResponse = await rabbitMQ.execute("user.edit", userObject, 100)
                    res.respond(JSON.parse(userResponse.toString()))
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

    /**
     * @swagger
     * /api/user/toggle/{user_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: deactivate user
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       name: "user_id"
     *       description: The user_id of the user to deactivate the account
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "user de_activated",
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
    async function toggleUser(req, res, next) {

        try {
            let rules = {
                "user_id": "required|objectId"
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
                    let userObject = {
                        "user_id": req.params.user_id,
                    };
                    let userResponse = await rabbitMQ.execute("user.toggle", userObject, 100)
                    res.respond(JSON.parse(userResponse.toString()))
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
     * /api/user/uploadImage:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - User
     *    description: uploads an image
     *    consumes:
     *     - "multipart/form-data"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "formData"
     *       name: "user_id"
     *       description: "user_id to which image is being uploaded"
     *       required: true
     *       type: string
     *     - in: "formData"
     *       name: "image"
     *       description: "image to upload"
     *       required: true
     *       type: file
     *    responses:
     *      '200': {
     *      "description": "image uploaded",
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
    async function uploadImage(req, res, next) {

        try {
            let rules = {
                'user_id': 'required|objectId',
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
                    const user_id = req.body.user_id
                    const target_path = './uploads/profile_pics/'
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
                    let userObject = {
                        user_id: user_id,
                        image: image.filename
                    }
                    let userResponse = await rabbitMQ.execute("user.edit", userObject, 100)
                    userResponse = JSON.parse(userResponse.toString())
                    if (userResponse.http_code === 200) {
                        userResponse.msg = "image uploaded"
                    }
                    res.respond(userResponse)
                    res.respond(JSON.parse(userResponse.toString()))
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


    return {
        getAllUsers, addUser, viewUser, deleteUser, editUser, toggleUser, uploadImage, userListLite
    }

}

module.exports = UserController
