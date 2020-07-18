let express = require('express');
let router = express.Router();


router.post('/list', function (req, res) {

    try {

        let search = req.body.search;

        let _payload = {
            search: search
        };
        fn.Execute(req, _payload, "ecommerce.seller.list", 10000).then((data, err) => {
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

        let search = req.body.search;

        let _payload = {
            search: search
        };

        fn.Execute(req, _payload, "ecommerce.seller.listLite", 10000).then((data, err) => {
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
        let rules = {
            user_id: 'required|objectId',
            location: 'required|array',
            place: 'required',
            city: 'required',
            state: 'required',
            pin_code: 'required',
            name: 'required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(async () => {
            let user_id = req.body.user_id
            let name = req.body.name;
            let location = req.body.location;
            let place = req.body.place;
            let city = req.body.city;
            let state = req.body.state;
            let description = req.body.description;
            let pin_code = req.body.pin_code;
            let _payload = {
                user_id: user_id,
                name: name,
                location: location,
                place: place,
                city: city,
                state: state,
                description: description,
                pin_code: pin_code,

            };
            fn.Execute(req, _payload, "ecommerce.seller.add", 10000).then((data, err) => {
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

        let rules = {
            seller_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let seller_id = req.body.seller_id;
            let _payload = {
                seller_id: seller_id,
            };
            fn.Execute(req, _payload, "ecommerce.seller.view", 1000).then((data, err) => {
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
            seller_id: 'required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let seller_id = req.body.seller_id
            let user_id = req.body.user_id
            let name = req.body.name;
            let location = req.body.location;
            let place = req.body.place;
            let city = req.body.city;
            let state = req.body.state;
            let description = req.body.description;
            let pin_code = req.body.pin_code;
            let is_active = req.body.is_active;
            let _payload = {
                seller_id: seller_id,
                user_id: user_id,
                name: name,
                location: location,
                place: place,
                city: city,
                state: state,
                description: description,
                pin_code: pin_code,
                is_active: is_active
            };
            fn.Execute(req, _payload, "ecommerce.seller.edit", 10000).then((data, err) => {
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

        let rules = {
            seller_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let seller_id = req.body.seller_id;
            let _payload = {
                seller_id: seller_id,
            };
            fn.Execute(req, _payload, "ecommerce.seller.delete", 1000).then((data, err) => {
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

router.post('/linkProduct', function (req, res) {

    try {

        let rules = {
            seller_id: 'required',
            product_id: 'required',
            qty: 'required',
            price: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let seller_id = req.body.seller_id;
            let product_id = req.body.product_id;
            let qty = req.body.qty;
            let price = req.body.price;
            let _payload = {
                seller_id: seller_id,
                product_id: product_id,
                qty: qty,
                price: price,
            };
            fn.Execute(req, _payload, "ecommerce.seller.linkProduct", 1000).then((data, err) => {
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

router.post('/unlinkProduct', function (req, res) {

    try {
        let rules = {
            seller_id: 'required',
            product_id: 'required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let seller_id = req.body.seller_id;
            let product_id = req.body.product_id;
            let _payload = {
                seller_id: seller_id,
                product_id: product_id,
            };
            fn.Execute(req, _payload, "ecommerce.seller.unlinkProduct", 1000).then((data, err) => {
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

router.post('/sellerProducts', function (req, res) {

    try {

        let rules = {
            seller_id: 'required'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let seller_id = req.body.seller_id;
            let _payload = {
                seller_id: seller_id,
            };
            fn.Execute(req, _payload, "ecommerce.seller.sellerProducts", 1000).then((data, err) => {
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

router.post('/sellerProductsEdit', function (req, res) {

    try {
        let rules = {
            seller_id: 'required',
            product_id: 'required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let seller_id = req.body.seller_id;
            let product_id = req.body.product_id;
            let qty = req.body.qty;
            let price = req.body.price;
            let _payload = {
                seller_id: seller_id,
                product_id: product_id,
                qty: qty,
                price: price,
            };
            fn.Execute(req, _payload, "ecommerce.seller.sellerProductsEdit", 1000).then((data, err) => {
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
