let bcrypt = require('bcryptjs');

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
                let page = req.body["page"] ? parseInt(req.body["page"]) : 1;
                let limit = req.body["limit"] ? parseInt(req.body["limit"]) : 10;

                let filter = {};
                if (typeof req.body.search != "undefined") {
                    filter = {
                        $or: [{name: {$regex: req.body.search, $options: 'si'}}, {
                            email: {
                                $regex: req.body.search,
                                $options: 'si'
                            },
                        }, {
                            mobile: {
                                $regex: req.body.search,
                                $options: 'si'
                            },
                        }]
                    }
                }
                filter["is_deleted"]=false
                let userDetails = await userRecord.paginate(filter, "", limit, page, "");
                res.respond({http_code: 200, msg: 'users list', data: userDetails})
            })
        } catch (e) {
            // error is unknown
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addUser(req, res, next) {

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
                    let password = req.body["password"]
                    password = bcrypt.hashSync(password, 5);
                    let userObject = await userRecord.addUser({
                        "name": req.body["name"],
                        "email": req.body["email"],
                        "password": password,
                        "phone": req.body["phone"],
                        "role": req.body["role"],
                        "is_active": true,
                        "is_deleted":false,
                        "is_phone_verified": false,
                        "is_email_verified": false
                    });
                    delete userObject.password
                    res.respond({http_code: 200, msg: 'user added', data: userObject})
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
                "user_id":"required|objectId|exists:users,_id"
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
                        "_id":req.body["user_id"],
                    }
                    let userDetails = await userRecord.getUser(userObject);
                    res.respond({http_code: 200, msg: 'user details', data: userDetails})
                } catch (e) {
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
                "user_id":"required|objectId|exists:users,_id"
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
                        "_id": req.body.user_id
                    }
                    let userDetails = await userRecord.editUser(userObject,{"is_deleted":true});
                    res.respond({http_code: 200, msg: 'user deleted', data: userDetails})
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
                // userObject = userObject[0]
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
                if (req.body["membership_type"] !== null) {
                    userObject["membership_type"] = req.body["membership_type"]
                }
                let data = await userRecord.editUser({"_id": user_id},userObject);
                return res.respond({
                    http_code: 200,
                    msg: 'profile edited',
                    data: data
                });
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
                let user_id = req.body.user_id
                let msg = ""
                let userObject = await userRecord.getUser({"_id": user_id})
                if(userObject["is_active"] === false){
                    msg = "user activated"
                    userObject["is_active"] = true
                }else{
                    msg = "user de_activated"
                    userObject["is_active"] = false
                }
                let data = await userRecord.editUser({"_id": user_id},userObject);
                return res.respond({
                    http_code: 200,
                    msg: msg,
                    data: data
                });
            });

        } catch (e) {
            // error is unknown
            console.log(e);
            res.respond({http_code: 500, error: e.message})
        }
    }


    return {
        getAllUsers, addUser, viewUser, deleteUser, editUser, toggleUser
    }

}

module.exports = UserController
