const UserController = function (Validator, rabbitMQ, userRecord) {

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
