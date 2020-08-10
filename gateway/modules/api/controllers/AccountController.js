const AccountController = function (Validator, rabbitMQ, userRecord) {

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
            if(userResponse.http_code === 200){
                userResponse.msg = "image uploaded"
            }
            res.respond(userResponse)
        } catch (e) {
            // error is unknown
            console.log(e);
            res.respond({http_code: 500, error: e.message})
        }
    }


    return {
        register, login, checkLogin, getProfile, editProfile, uploadPic
    }

}

module.exports = AccountController
