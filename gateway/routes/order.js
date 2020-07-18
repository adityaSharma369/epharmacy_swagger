let express = require('express');
let router = express.Router();


router.post('/list', function (req, res) {

    try {
        let rules = {
            user_id: 'objectId'
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let user_id = req.body.user_id;
            let search = req.body.search;
            let payment_status = req.body.payment_status
            let payment_type = req.body.payment_type
            let order_status = req.body.order_status
            let agent_id = req.body.agent_id

            let _payload = {
                user_id: user_id,
                search: search,
                payment_status:payment_status,
                payment_type:payment_type,
                order_status:order_status,
                agent_id:agent_id,
            };
            fn.Execute(req, _payload, "ecommerce.order.list", 10000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            }).catch(res.err);
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
            customer_id: 'objectId|required',
            address_id: 'required|objectId',
            payment_status: 'required',
            payment_type: 'required',
            products: "array"
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let customer_id = req.body.customer_id;
            let address_id = req.body.address_id;
            let agent_id = req.body.agent_id;
            let seller_id = req.body.seller_id;
            let payment_type = req.body.payment_type;
            let payment_status = req.body.payment_status;
            let products = req.body.products;
            let _payload = {
                customer_id: customer_id,
                address_id: address_id,
                agent_id: agent_id,
                seller_id: seller_id,
                payment_type: payment_type,
                payment_status: payment_status,
                products: products,
            };
            fn.Execute(req, _payload, "ecommerce.order.add", 10000).then((data, err) => {
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

router.post('/edit', function (req, res) {

    try {

        let rules = {
            order_id: 'objectId|required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let order_id = req.body.order_id;
            let address_id = req.body.address_id;
            let agent_id = req.body.agent_id;
            let seller_id = req.body.seller_id;
            let payment_type = req.body.payment_type;
            let payment_status = req.body.payment_status;
            let _payload = {
                order_id: order_id,
                address_id: address_id,
                agent_id: agent_id,
                seller_id: seller_id,
                payment_type: payment_type,
                payment_status: payment_status,
            };
            fn.Execute(req, _payload, "ecommerce.order.edit", 10000).then((data, err) => {
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
            order_id: 'objectId|required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let order_id = req.body.order_id;
            let _payload = {
                order_id: order_id,
            };
            fn.Execute(req, _payload, "ecommerce.order.view", 10000).then((data, err) => {
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

router.post('/getOrderItems', function (req, res) {

    try {

        let rules = {
            order_id: 'objectId|required',
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let order_id = req.body.order_id;
            let _payload = {
                order_id: order_id,
            };
            fn.Execute(req, _payload, "ecommerce.order.order_items", 10000).then((data, err) => {
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

router.post('/getAdminPendingOrders', function (req, res) {

    try {
        let rules = {
            user_id: 'objectId'
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let user_id = req.body.user_id;
            let search = req.body.search;
            let payment_status = req.body.payment_status
            let payment_type = req.body.payment_type
            let agent_id = req.body.agent_id

            let _payload = {
                user_id: user_id,
                search: search,
                payment_status:payment_status,
                payment_type:payment_type,
                order_status:"pending",
                agent_id:agent_id,
            };
            fn.Execute(req, _payload, "ecommerce.order.list", 10000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            }).catch(res.err);
        });

    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }
});

router.post('/confirmOrder', function (req, res) {

    try {
        let rules = {
            order_id: 'objectId'
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let order_id = req.body.order_id;
            let _payload = {
                order_id: order_id
            };
            fn.Execute(req, _payload, "ecommerce.order.confirmOrder", 10000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            }).catch(res.err);
        });

    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }
});

router.post('/rejectOrder', function (req, res) {

    try {
        let rules = {
            order_id: 'objectId'
        };
        let validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            let order_id = req.body.order_id;
            let _payload = {
                order_id: order_id
            };
            fn.Execute(req, _payload, "ecommerce.order.rejectOrder", 10000).then((data, err) => {
                if (data) {
                    data = JSON.parse(data.toString());
                    return res.respond(data);
                } else {
                    console.log("%%%%%%% timeout", data, err)
                }
            }).catch(res.err);
        });

    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }
});

module.exports = router;
