let express = require('express');
let router = express.Router();


router.post('/list', function (req, res) {

    try {

        let rules = {
            "user_id": "required"
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
        let rules = {
            "user_id": "required"
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

        let rules = {
            title: 'required|min:1|max:100',
            location: 'required',
            place: 'required',
            city:'required',
            state:'required',
            pin_code:'required',
            user_id:'required'
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let user_id = req.body.user_id
            let title = req.body.title;
            let location = req.body.location;
            let place = req.body.place;
            let city = req.body.city;
            let state = req.body.state;
            let pin_code = req.body.pin_code;

            let _payload = {
                user_id: user_id,
                title: title,
                location: location,
                place: place,
                city: city,
                state: state,
                pin_code:pin_code
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

        let rules = {
            address_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400});
        });

        validation.passes(async () => {
            let address_id = req.body.address_id;

            let _payload = {
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

        let rules = {
            address_id: 'required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let address_id = req.body.address_id
            let title = req.body.title;
            let location = req.body.location;
            let place = req.body.place;
            let city = req.body.city;
            let state = req.body.state;
            let pin_code = req.body.pin_code

            let is_primary = req.body.is_primary;

            let _payload = {
                address_id: address_id,
                title: title,
                location: location,
                place: place,
                city: city,
                state: state,
                pin_code:pin_code,
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

        let rules = {
            address_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let address_id = req.body.address_id;
            let _payload = {
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
