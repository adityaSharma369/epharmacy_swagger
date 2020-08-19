const AccountController = function (Validator, rabbitMQ, userRecord) {

    /**
     * @swagger
     * /api/account/register:
     *  post:
     *    tags:
     *    - Authentication
     *    description: Registers a new user
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
     * definitions:
     *     User:
     *       type: "object"
     *       required:
     *       - "name"
     *       - "phone"
     *       - "email"
     *       - "password"
     *       - "username"
     *       properties:
     *        name:
     *          type: "string"
     *          example: "Jenny"
     *        email:
     *          type: "string"
     *          example: "jenny@gmail.com"
     *        phone:
     *          type: "string"
     *          example: "7089088905"
     *        password:
     *          type: "string"
     *          example: "123456"
     *        username:
     *          type: "string"
     *          example: "jenny"
     */
    async function register(req, res, next) {

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
                    let email = req.body["email"]
                    let password = req.body["password"]
                    let phone = req.body["phone"]
                    let name = req.body["name"]
                    let role = "customer"
                    let userObject = {
                        email: email,
                        phone: phone,
                        password: password,
                        name: name,
                        role: role,
                        is_active: true,
                        is_phone_verified: false,
                        is_email_verified: false
                    }
                    let userResponse = await rabbitMQ.execute("user.account.register", userObject, 100)
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
     * /api/account/login:
     *  post:
     *    tags:
     *    - Authentication
     *    description: login
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "Login credentials"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           email: {
     *             type: "string",
     *             example: "jenny@gmail.com"
     *           },
     *           password: {
     *             type: "string",
     *             example: "123456"
     *           }
     *         }
     *       }
     *    responses:
     *      '200': {
     *      "description": "login successful",
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
     */
    async function login(req, res, next) {

        try {
            let rules = {
                "email": "required|email",
                "password": "required|min:6",
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
                    const userObject = {
                        email: req.body["email"],
                        password: req.body["password"]
                    }
                    let userResponse = await rabbitMQ.execute("user.account.login", userObject, 100)
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
     * /api/account/logout:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
     *    description: logout
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    responses:
     *      '200': {
     *      "description": "logout successful",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     */
    async function logout(req, res, next) {
        try {
            let token;
            token = req.headers['authorization'];
            let userObject = {"user_id": req.decoded["_id"], "token": token.split(" ")[1]}
            let userResponse = await rabbitMQ.execute("user.account.logout", userObject, 100)
            res.respond(JSON.parse(userResponse.toString()))

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/account/checkLogin:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
     *    description: check login
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    responses:
     *      '200': {
     *      "description": "logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     */
    async function checkLogin(req, res, next) {
        try {
            let token;
            token = req.headers['authorization'];
            if (token === undefined) {
                return res.respond({"http_code": 400, "error": "Token invalid"});
            }
            const userObject = {
                token: token.split(" ")[1]
            }
            let userResponse = await rabbitMQ.execute("user.account.checkLogin", userObject, 100)
            res.respond(JSON.parse(userResponse.toString()))
        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    /**
     * @swagger
     * /api/account/getProfile:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
     *    description: get logged in user details
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
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
     */
    async function getProfile(req, res, next) {
        try {
            let userObject = {"user_id": req.decoded["_id"]}
            let userResponse = await rabbitMQ.execute("user.account.getProfile", userObject, 100)
            res.respond(JSON.parse(userResponse.toString()))

        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    /**
     * @swagger
     * /api/account/editProfile:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
     *    description: edit profile
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "Details of user"
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
     *      "description": "profile edited",
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
    async function editProfile(req, res, next) {
        try {
            let userObject = req.body
            let userResponse = await rabbitMQ.execute("user.account.editProfile", userObject, 100)
            res.respond(JSON.parse(userResponse.toString()))

        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    /**
     * @swagger
     * /api/account/uploadImage:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
     *    description: uploads an image
     *    consumes:
     *     - "multipart/form-data"
     *    produces:
     *     - application/json
     *    parameters:
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
    async function uploadPic(req, res, next) {
        try {
            const image = req.file
            const user_id = req.decoded["_id"]
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
        } catch (e) {
            // error is unknown
            console.log(e);
            res.respond({http_code: 500, error: e.message})
        }
    }

    /**
     * @swagger
     * /api/account/addAddress:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
     *    description: Add Address of the user
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
     *         $ref: "#/definitions/Address"
     *    responses:
     *      '200': {
     *      "description": "address added",
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
     *     Address:
     *       type: "object"
     *       required:
     *       - "title"
     *       - "location"
     *       - "place"
     *       - "city"
     *       - "pin_code"
     *       - "state"
     *       properties:
     *        title:
     *          type: "string"
     *          example: "title"
     *        place:
     *          type: "string"
     *          example: "place"
     *        location:
     *          type: "array"
     *          example: [12,12]
     *        city:
     *          type: "string"
     *          example: "city"
     *        state:
     *          type: "string"
     *          example: "state"
     *        pin_code:
     *          type: "number"
     *          example: "5000907"
     */
    async function addAddress(req, res, next) {
        try {
            let rules = {
                title: 'required|min:1|max:100',
                location: 'required',
                place: 'required',
                city: 'required',
                state: 'required',
                pin_code: 'required',
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
                    let title = req.body.title;
                    let location = req.body.location;
                    let place = req.body.place;
                    let city = req.body.city;
                    let state = req.body.state;
                    let pin_code = req.body.pin_code;

                    let _payload = {
                        user_id: req.decoded["_id"],
                        title: title,
                        location: location,
                        place: place,
                        city: city,
                        state: state,
                        pin_code: pin_code
                    };
                    let addressResponse = await rabbitMQ.execute("user.address.add", _payload, 100)
                    res.respond(JSON.parse(addressResponse.toString()))
                } catch (e) {
                    // input validation was successful
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    /**
     * @swagger
     * /api/account/getAddress:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
     *    description: get address
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
     *      "description": "addresses list",
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
    async function getAddress(req, res, next) {
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
                let userObject = {
                    user_id: req.decoded["_id"],
                    page: req.body.page,
                    limit: req.body.limit,
                    search: req.body.search,
                }
                let userResponse = await rabbitMQ.execute("user.address.list", userObject, 100)
                res.respond(JSON.parse(userResponse.toString()))
            });

        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    /**
     * @swagger
     * /api/account/makeAddressPrimary:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Authentication
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
     *           address_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "primary address updated",
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
    async function makeAddressPrimary(req, res, next) {
        try {
            const address_id = req.body.address_id
            let payload = {
                address_id: address_id,
            }
            let response = await rabbitMQ.execute("user.address.makePrimaryAddress", payload, 100)
            response = JSON.parse(response.toString())
            res.respond(response)
        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            })
        }
    }

    return {
        register,
        login,
        checkLogin,
        getProfile,
        editProfile,
        uploadPic,
        logout,
        addAddress,
        getAddress,
        makeAddressPrimary
    }

}

module.exports = AccountController
