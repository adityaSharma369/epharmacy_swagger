var express = require('express');
var router = express.Router();


router.post('/list', function (req, res) {

    try {

        var category_id = req.body.category_id;

        var _payload = {
            category_id: category_id
        };
        fn.Execute(req, _payload, "inventory.category.list", 10000).then((data, err) => {
            if (data) {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            } else {
                console.log("%%%%%%% timeout", data, err)
            }
        })
            .catch(res.err);

    } catch (e) {
        console.log(e)
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/listLite', function (req, res) {

    try {

        var category_id = req.body.category_id;

        var _payload = {
            category_id: category_id
        };

        fn.Execute(req, _payload, "inventory.category.listLite", 10000).then((data, err) => {
            if (data) {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            } else {
                console.log("%%%%%%% timeout", data, err)
            }
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
            title: 'required|min:1|max:100',
            description: 'required',
            type: 'required',
            parent_id: "objectId"
        };
        var validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            var title = req.body.title;
            var description = req.body.description;
            var parent_id = req.body.parent_id;
            var type = req.body.type;

            var _payload = {
                title: title,
                description: description,
                parent_id: parent_id,
                type: type
            };
            fn.Execute(req, _payload, "inventory.category.add", 10000).then((data, err) => {
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
        console.log(e)
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }
});

router.post('/view', function (req, res) {

    try {

        var rules = {
            category_id: 'required'
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400});
        });

        validation.passes(async () => {
            let category_id = req.body.category_id;

            var _payload = {
                category_id: category_id
            };

            fn.Execute(req, _payload, "inventory.category.view", 1000).then((data, err) => {
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

        var rules = {
            category_id: 'required',
        };
        var validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            var category_id = req.body.category_id
            var title = req.body.title;
            var description = req.body.description;
            var is_primary = req.body.is_primary;
            var is_active = req.body.is_active;
            var priority = req.body.priority;
            var parent_id = req.body.parent_id;

            var _payload = {
                category_id: category_id,
                title: title,
                description: description,
                is_primary: is_primary,
                is_active: is_active,
                priority: priority,
                parent_id: parent_id,

            };

            fn.Execute(req, _payload, "inventory.category.edit", 1000).then((data, err) => {
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
        console.log(e)
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/delete', function (req, res) {

    try {

        var rules = {
            category_id: 'required'
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            var category_id = req.body.category_id;
            var _payload = {
                category_id: category_id,
            };
            fn.Execute(req, _payload, "inventory.category.delete", 1000).then((data, err) => {
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
