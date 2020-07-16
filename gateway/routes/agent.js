var express = require('express');
var router = express.Router();


router.post('/list', function (req, res) {

    try {

        var rules = {};

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });


        validation.passes(() => {
            var search = req.body.search;
            var limit = req.body.limit;
            var page = req.body.page;
            var role = "agent";

            var _payload = {
                search: search,
                page: page,
                limit: limit,
                role: role
            };

            fn.Execute(req, _payload, "user.list", 10000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
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
        let _payload = {
            role : "agent"
        }
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

        var rules = {
            username: 'required',
            mobile: 'required',
            email: 'required|email',
            password: 'required',
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            var username = req.body.username;
            var email = req.body.email;
            var mobile = req.body.mobile;
            var password = req.body.password;
            var role = "agent";
            var _payload = {
                username: username,
                email: email,
                mobile: mobile,
                password: password,
                role: role,
            };
            fn.Execute(req, _payload, "user.add", 10000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
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
