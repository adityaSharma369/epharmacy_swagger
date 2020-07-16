let functions = {
    list: (req, res) => {

        try {

            let page = req.body.page ? req.body.page : 1;
            let limit = req.body.limit ? req.body.limit : 10;
            let filter = {};
            if (typeof req.body.search != "undefined") {
                filter = {
                    $or: [{title: {$regex: req.body.search, $options: 'si'}}]
                }
            }
            if (typeof req.body.user_id != "undefined") {
                filter = {
                    "user_id": req.body.user_id,
                }
            }
            fn.paginate("order", filter, "", limit, page, {"_created": -1}).then(async (data) => {
                for (i = 0; i < data.docs.length; i++) {
                    data.docs[i]['_doc']['items_count'] = await fn.model("order_item").find({
                        "order_id": data.docs[i]._id,
                    }).count();
                    data.docs[i] = {...data.docs[i]['_doc']};
                }
                return res.replyBack({msg: 'order list', data: data, http_code: 200})
            }).catch((err) => {
                return res.replyBack({ex: fn.err_format(err), http_code: 500});
            });
        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    add: (req, res) => {
        try {
            let rules = {
                customer_id: 'required|objectId|exists:user,_id',
                address_id: 'required|objectId|exists:address,_id',
                items: 'required|array',
                payment_type: 'required',
                payment_status: 'required',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let customer_id = req.body.customer_id;
                let address_id = req.body.address_id;
                let agent_id = req.body.agent_id;
                let seller_id = req.body.seller_id;
                let payment_type = req.body.payment_type;
                let payment_status = req.body.payment_status;
                let items = req.body.items;
                let address = {}
                await fn.model('address').findOne({"_id": address_id}).select('place state city location pin_code').then((data) => {
                    address = data
                })
                let orderData = {
                    user_id: customer_id,
                    address: address,
                    is_active: true,
                    is_primary: true,
                    order_status: "pending",
                    payment_type: payment_type,
                    delivery_charge: 0,
                    promo_code_discount: 0,
                    tax: 0,
                }
                if (agent_id !== undefined) {
                    orderData["agent_id"] = agent_id
                }
                if (seller_id !== undefined) {
                    orderData["seller_id"] = seller_id
                }
                if (payment_status !== undefined) {
                    orderData["payment_status"] = payment_status
                }
                let order = new fn.model('order')(orderData);
                order.save()
                    .then(async (data) => {
                        let totalPrice = 0
                        await items.forEach((item) => {
                            fn.model("product").findOne({"_id": item.item_id}).then(async (itemDetails) => {
                                fn.model("product_image").findOne({
                                    "product_id": itemDetails._id,
                                    "is_primary": true
                                }).then(async (image) => {
                                    let tempData = {
                                        order_id: data._id,
                                        item_id: item.item_id,
                                        item_title: itemDetails.title,
                                        manufacturer: itemDetails.manufacturer,
                                        price: itemDetails.price,
                                        description: itemDetails.description,
                                        image: image.image,
                                        qty: item.qty,
                                        final_price: itemDetails.price
                                    }
                                    totalPrice += itemDetails.price * item.qty
                                    await fn.model("order_item")(tempData).save().then().catch((err) => {
                                        return res.replyBack({ex: fn.err_format(err), http_code: 500});
                                    });
                                })
                            }).catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                        })
                        await fn.model("order").update({"_id": data._id}, {"total_price": totalPrice}).then(async () => {
                            return res.replyBack({msg: 'order added', data: data, http_code: 200})
                        }).catch((err) => {
                            return res.replyBack({ex: fn.err_format(err), http_code: 500});
                        });
                    }).catch((err) => {
                    return res.replyBack({ex: fn.err_format(err), http_code: 500});
                });
            });
        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    edit: (req, res) => {
        try {
            let rules = {
                order_id: 'required|exists:order,_id'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let order_id = req.body.order_id;

                let _payload = {}

                if (typeof req.body.order_status != "undefined") {
                    _payload["order_status"] = req.body.order_status
                }

                if (typeof req.body.agent_id != "undefined") {
                    _payload["agent_id"] = req.body.agent_id
                }

                if (typeof req.body.seller_id != "undefined") {
                    _payload["seller_id"] = req.body.seller_id
                }

                if (typeof req.body.payment_status != "undefined") {
                    _payload["payment_status"] = req.body.payment_status
                }

                if (typeof req.body.payment_type != "undefined") {
                    _payload["payment_type"] = req.body.payment_type
                }
                if (typeof req.body.address_id != "undefined") {
                    let address = {}
                    await fn.model('address').findOne({"_id": address_id}).select('place state city location pin_code').then((data) => {
                        address = data
                    })
                    _payload["address"] = address
                }
                fn.model('order')
                    .findOne({
                        _id: order_id
                    })
                    .then((category) => {
                        category.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'order updated', http_code: 200});
                            })
                            .catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                    });
            });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    view: (req, res) => {
        try {
            let rules = {
                order_id: 'required|exists:order,_id'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let order_id = req.body.order_id;
                fn.model('order')
                    .findOne({
                        _id: order_id
                    })
                    .then(async (order) => {
                        order['_doc']["items"] = await fn.model("order_item").find({"order_id": order_id});
                        for (i = 0; i < order['_doc']["items"].length; i++) {
                            if (order['_doc']["items"][i]["image"] !== undefined && order['_doc']["items"][i]["image"] !== null) {
                                order['_doc']["items"][i]["image"] = CURRENT_DOMAIN + "/product_images/" + order['_doc']["items"][i].item_id + "/" + order['_doc']["items"][i]["image"]
                            }
                        }
                        return res.replyBack({msg: 'order', data: order, http_code: 200});

                    });
            });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    order_items: (req, res) => {
        try {
            let rules = {
                order_id: 'required|exists:order,_id'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let order_id = req.body.order_id;
                fn.model("order_item").find({"order_id": order_id}).then((order) => {
                    for (i = 0; i < order.length; i++) {
                        if (order[i]["image"] !== undefined && order[i]["image"] !== null) {
                            order[i]["image"] = CURRENT_DOMAIN + "/product_images/" + order[i].item_id + "/" + order[i]["image"]
                        }
                    }
                    return res.replyBack({msg: 'order_items', data: order, http_code: 200});
                });
            });

        } catch (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },
};

module.exports = functions;
