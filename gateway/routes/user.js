let express = require('express');
let router = express.Router();


router.post('/list', function (req, res) {

    try {

        let rules = {};

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });


        validation.passes(() => {
            let search = req.body.search;
            let limit = req.body.limit;
            let page = req.body.page;
            let role = req.body.role;

            let _payload = {
                search: search,
                page: page,
                limit: limit,
                role: role
            };

            fn.Execute(req, _payload, "user.list", 10000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            })
                .catch(res.err);
        });
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/listLite', function (req, res) {

    try {
        let role = req.body.role;
        let search = req.body.search;
        let _payload = {
            role: role,
            search: search
        };
        fn.Execute(req, _payload, "user.listLite", 10000).then((data, err) => {
            data = JSON.parse(data.toString());
            return res.respond(data);
        })
            .catch(res.err);
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/add', function (req, res) {

    try {

        let rules = {
            username: 'required',
            mobile: 'required',
            email: 'required|email',
            password: 'required',
            role: 'required',
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let username = req.body.username;
            let email = req.body.email;
            let mobile = req.body.mobile;
            let password = req.body.password;
            let role = req.body.role;
            let _payload = {
                username: username,
                email: email,
                mobile: mobile,
                password: password,
                role: role,
            };
            fn.Execute(req, _payload, "user.add", 10000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            })
                .catch(res.err);
        });
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }
});

router.post('/view', function (req, res) {

    try {

        let rules = {
            user_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let user_id = req.body.user_id;

            let _payload = {
                user_id: user_id
            };

            fn.Execute(req, _payload, "user.view", 1000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            })
                .catch(res.err);
        });
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/edit', function (req, res) {

    try {

        let rules = {
            user_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let user_id = req.body.user_id;
            let email = req.body.email;
            let mobile = req.body.mobile;
            let role = req.body.role;
            let password = req.body.password;

            let _payload = {
                user_id: user_id,
                email: email,
                mobile: mobile,
                role: role,
                password: password
            };

            fn.Execute(req, _payload, "user.edit", 1000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            })
                .catch(res.err);
        });
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/delete', function (req, res) {

    try {

        let rules = {
            user_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let user_id = req.body.user_id;
            let _payload = {
                user_id: user_id,
            };
            fn.Execute(req, _payload, "user.delete", 1000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            })
                .catch(res.err);
        });
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});


module.exports = router;
