var express = require('express');
var router = express.Router();


router.post('/list', function (req, res) {

    try {

        var rules = {
            "user_id": "required"
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });


        validation.passes(() => {
            var user_id = req.body.user_id;

            var _payload = {
                user_id: user_id
            };

            fn.Execute(req, _payload, "user.address.list", 10000).then((data, err) => {
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
        var rules = {
            "user_id": "required"
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });


        validation.passes(() => {
            var user_id = _currentUser._id;

            var _payload = {
                user_id: user_id
            };

            fn.Execute(req, _payload, "user.address.listLite", 10000).then((data, err) => {
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

router.post('/add', function (req, res) {

    try {

        var rules = {
            title: 'required|min:1|max:100',
            lat: 'required',
            lng: 'required',
            full_address: 'required|min:10',
            user_id:'required'
        };
        var validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            var user_id = req.body.user_id
            var title = req.body.title;
            var lat = req.body.lat;
            var lng = req.body.lng;
            var full_address = req.body.full_address;

            var _payload = {
                user_id: user_id,
                title: title,
                lat: lat,
                lng: lng,
                full_address: full_address,
            };
            fn.Execute(req, _payload, "user.address.add", 10000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
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
            address_id: 'required'
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400});
        });

        validation.passes(async () => {
            let address_id = req.body.address_id;

            var _payload = {
                address_id: address_id
            };

            fn.Execute(req, _payload, "user.address.view", 1000).then((data, err) => {
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

router.post('/edit', function (req, res) {

    try {

        var rules = {
            address_id: 'required',
        };
        var validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            var address_id = req.body.address_id
            var title = req.body.title;
            var lat = req.body.lat;
            var lng = req.body.lng;
            var full_address = req.body.full_address;

            var is_primary = req.body.is_primary;

            var _payload = {
                address_id: address_id,
                title: title,
                lat: lat,
                lng: lng,
                full_address: full_address,
                is_primary: is_primary
            };

            fn.Execute(req, _payload, "user.address.edit", 1000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
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
            address_id: 'required'
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            var address_id = req.body.address_id;
            var _payload = {
                address_id: address_id,
            };
            fn.Execute(req, _payload, "user.address.delete", 1000).then((data, err) => {
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
