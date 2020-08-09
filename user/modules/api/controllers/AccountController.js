let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let env = process.env;
let JWT_SECRET = env.JWT_SECRET

const AccountController = function (Validator, rabbitMQ, userRecord, tokenRecord) {

    async function register(req, res, next) {
        try {
            let rules = {
                "name": "required",
                "email": "required|email|unique:users",
                "password": "required|min:6",
                "phone": "required|min:10|unique:users",
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
                    password = bcrypt.hashSync(password, 5);
                    let phone = req.body["phone"]
                    let name = req.body["name"]
                    let userObject = {
                        email: email,
                        phone: phone,
                        password: password,
                        name: name,
                        is_active: true,
                        is_phone_verified: false,
                        is_email_verified: false
                    }
                    if (req.body["age"] !== null) {
                        userObject["age"] = req.body["age"]
                    }
                    if (req.body["description"] !== null) {
                        userObject["description"] = req.body["description"]
                    }
                    if (req.body["gender"] !== null) {
                        userObject["gender"] = req.body["gender"]
                    }
                    let userAddStatus = await userRecord.addUser(userObject);
                    res.respond({http_code: 200, msg: 'user registered', data: userAddStatus})
                } catch (e) {
                    console.log(e);
                    return res.err({
                        error: e.message,
                        http_code: 500
                    });
                }
            });

        } catch (e) {
            console.log(e);
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    async function login(req, res, next) {

        try {
            let rules = {
                "email": "required|email|exists:users",
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
                    let email = req.body["email"]
                    let password = req.body["password"]
                    let data = await userRecord.getUser({"email": email});
                    let userData = data[0]
                    console.log(bcrypt.compareSync(password, userData.password), "-------------------------------")
                    if (!userData || !userData.is_active || !bcrypt.compareSync(password, userData.password)) {
                        return res.respond({
                            http_code: 401,
                            error: 'invalid credentials'
                        });
                    } else {
                        let token = jwt.sign(userData.toObject(), JWT_SECRET, {
                            expiresIn: "2 days"
                        });
                        await tokenRecord.deleteToken({user_id: userData._id})
                        await tokenRecord.addToken({
                            token: token,
                            user_id: userData._id,
                            is_active: true
                        });

                        delete userData.password;
                        return res.respond({
                            http_code: 200,
                            msg: 'login successful',
                            data: {
                                info: userData,
                                token: token
                            }
                        });
                    }
                } catch (e) {
                    console.log(e);
                    return res.err({
                        error: e.message,
                        http_code: 500
                    });
                }
            });

        } catch (e) {
            console.log(e);
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    async function checkLogin(req, res, next) {

        try {
            let rules = {
                "token": "required",
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
                    let token = req.body["token"]
                    let user = jwt.verify(token, env.JWT_SECRET);

                    if (!user) {
                        return res.respond({
                            msg: 'not logged in',
                            http_code: 401
                        });
                    } else {
                        delete user.password
                        return res.respond({
                            http_code: 200,
                            msg: 'user Logged in',
                            data: user
                        });
                    }
                } catch (e) {
                    console.log(e);
                    return res.err({
                        error: e.message,
                        http_code: 500
                    });
                }
            });

        } catch (e) {
            console.log(e);
            return res.err({
                error: e.message,
                http_code: 500
            });
        }
    }

    async function getProfile(req, res, next) {
        try {
            let rules = {
                "user_id": "required|objectId|exists:users,_id",
            };
            let validation = new Validator(req.body, rules);
            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                let user_id = req.body["user_id"]
                let data = await userRecord.getUser({"_id": user_id});
                let userData = data[0]
                delete userData.password
                return res.respond({
                    http_code: 200,
                    msg: 'user details',
                    data: userData
                });
            });
        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            });
        }

    }

    async function editProfile(req, res, next) {
        try {
            let rules = {
                "user_id": "required|objectId|exists:users,_id",
            };
            let validation = new Validator(req.body, rules);
            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                let user_id = req.body["user_id"]
                let userObject = await userRecord.getUser({"_id": user_id})
                userObject = userObject[0]
                if (req.body["name"] !== null) {
                    userObject["name"] = req.body["name"]
                }
                if (req.body["email"] !== null) {
                    userObject["email"] = req.body["email"]
                    if (req.body["email"] !== userObject["email"]) {
                        userObject["is_email_verified"] = false
                    }
                }
                if (req.body["phone"] !== null) {
                    userObject["phone"] = req.body["phone"]
                    if (req.body["phone"] !== userObject["phone"]) {
                        userObject["is_phone_verified"] = false
                    }
                }
                if (req.body["age"] !== null) {
                    userObject["age"] = req.body["age"]
                }
                if (req.body["description"] !== null) {
                    userObject["description"] = req.body["description"]
                }
                if (req.body["gender"] !== null) {
                    userObject["gender"] = req.body["gender"]
                }
                let data = await userRecord.editUser({"_id": user_id},userObject);
                return res.respond({
                    http_code: 200,
                    msg: 'profile edited'
                });
            });
        } catch (e) {
            return res.err({
                error: e.message,
                http_code: 500
            });
        }

    }

    return {
        register, login, checkLogin, getProfile, editProfile
    }

}

module.exports = AccountController
