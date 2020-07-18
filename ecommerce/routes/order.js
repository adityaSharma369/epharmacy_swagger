let functions = {
    list: (req, res) => {

        try {
            let rules = {
                customer_id: 'objectId|exists:user,_id',
                address_id: 'objectId|exists:address,_id',
                agent_id: 'objectId|exists:user,_id',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let page = req.body.page ? req.body.page : 1;
                let limit = req.body.limit ? req.body.limit : 10;
                let filter = {};
                if (req.body.search !== undefined && req.body.search !== "") {
                    filter["$or"] = [{total_amount: {$regex: req.body.search, $options: 'si'}}];
                }
                if (req.body.user_id !== undefined && req.body.user_id !== "") {
                    filter["user_id"] = req.body.user_id;
                }
                if (req.body.order_status !== undefined && req.body.order_status !== "") {
                    filter["order_status"] = req.body.order_status;
                }
                if (req.body.payment_status !== undefined && req.body.payment_status !== "") {
                    filter["payment_status"] = req.body.payment_status;
                }
                if (req.body.payment_type !== undefined && req.body.payment_type !== "") {
                    filter["payment_type"] = req.body.payment_type;
                }
                if (req.body.agent_id !== undefined && req.body.agent_id !== "") {
                    filter["agent_id"] = req.body.agent_id;
                }
                fn.paginate("order", filter, "", limit, page, {"_created": -1}).then(async (data) => {
                    for (i = 0; i < data.docs.length; i++) {
                        data.docs[i]['_doc']['items_count'] = await fn.model("order_product").find({
                            "order_id": data.docs[i]._id,
                        }).count();
                        data.docs[i] = {...data.docs[i]['_doc']};
                        if (data.docs[i].agent_id !== undefined) {
                            await fn.model("user").findOne({"_id": data.docs[i].agent_id}).select("_id username email phone").then((agent) => {
                                agent.password = undefined
                                console.log(agent)
                                data.docs[i]["agent_details"] = agent
                            }).catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                        }
                        if (data.docs[i].user_id !== undefined) {
                            await fn.model("user").findOne({"_id": data.docs[i].user_id}).select("_id username email phone").then((user) => {
                                data.docs[i]["user_details"] = user
                            }).catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                        }
                    }
                    return res.replyBack({msg: 'order list', data: data, http_code: 200})
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

    add: (req, res) => {
        try {
            let rules = {
                customer_id: 'required|objectId|exists:user,_id',
                address_id: 'required|objectId|exists:address,_id',
                products: 'required|array',
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
                let products = req.body.products;
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
                if (agent_id !== undefined && agent_id !== "") {
                    orderData["agent_id"] = agent_id
                }
                if (seller_id !== undefined && seller_id !== "") {
                    orderData["seller_id"] = seller_id
                }
                if (payment_status !== undefined && payment_status !== "") {
                    orderData["payment_status"] = payment_status
                }
                let order = new fn.model('order')(orderData);
                order.save()
                    .then(async (data) => {
                        let totalPrice = 0
                        await products.forEach((item) => {
                            fn.model("product").findOne({"_id": item.product_id}).then(async (itemDetails) => {
                                fn.model("product_image").findOne({
                                    "product_id": itemDetails._id,
                                    "is_primary": true
                                }).then(async (image) => {
                                    let tempData = {
                                        order_id: data._id,
                                        product_id: item.product_id,
                                        product_title: itemDetails.title,
                                        manufacturer: itemDetails.manufacturer,
                                        price: itemDetails.price,
                                        description: itemDetails.description,
                                        image: image.image,
                                        qty: item.qty,
                                        final_price: itemDetails.price
                                    }
                                    totalPrice += itemDetails.price * item.qty
                                    await fn.model("order_product")(tempData).save().then().catch((err) => {
                                        return res.replyBack({ex: fn.err_format(err), http_code: 500});
                                    });
                                })
                            }).catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                        })
                        await fn.model("order").update({"_id": data._id}, {"total_price": totalPrice}).then(async () => {
                            return res.replyBack({msg: 'order added', data: data, http_code: 201})
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

                if (typeof req.body.order_status != "undefined" && req.body.order_status !== "") {
                    _payload["order_status"] = req.body.order_status
                }

                if (typeof req.body.agent_id != "undefined" && req.body.agent_id !== "") {
                    _payload["agent_id"] = req.body.agent_id
                }

                if (typeof req.body.seller_id != "undefined" && req.body.seller_id !== "") {
                    _payload["seller_id"] = req.body.seller_id
                }

                if (typeof req.body.payment_status != "undefined" && req.body.payment_status !== "") {
                    _payload["payment_status"] = req.body.payment_status
                }

                if (typeof req.body.payment_type != "undefined" && req.body.payment_type !== "") {
                    _payload["payment_type"] = req.body.payment_type
                }
                if (typeof req.body.address_id != "undefined" && req.body.address_id !== "") {
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
                                return res.replyBack({msg: 'order updated', http_code: 201});
                            })
                            .catch((err) => {
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
                        order['_doc']["products"] = await fn.model("order_product").find({"order_id": order_id});
                        for (i = 0; i < order['_doc']["products"].length; i++) {
                            if (order['_doc']["products"][i]["image"] !== undefined && order['_doc']["products"][i]["image"] !== null) {
                                order['_doc']["products"][i]["image"] = CURRENT_DOMAIN + "/product_images/" + order['_doc']["products"][i].item_id + "/" + order['_doc']["products"][i]["image"]
                            }
                        }
                        if (order.agent_id !== undefined) {
                            await fn.model("user").findOne({"_id": order.agent_id}).select("_id username email phone").then((agent) => {
                                order["_doc"]["agent_details"] = agent
                                order["agent_details"] = order["_doc"]["agent_details"]
                            }).catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                        }
                        if (order.user_id !== undefined) {
                            await fn.model("user").findOne({"_id": order.user_id}).select("_id username email phone").then((user) => {
                                order["_doc"]["user_details"] = user
                                order["user_details"] = order["_doc"]["user_details"]
                            }).catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                        }
                        return res.replyBack({msg: 'order', data: order, http_code: 200});

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
                fn.model("order_product").find({"order_id": order_id}).then((order) => {
                    for (i = 0; i < order.length; i++) {
                        if (order[i]["image"] !== undefined && order[i]["image"] !== null) {
                            order[i]["image"] = CURRENT_DOMAIN + "/product_images/" + order[i].item_id + "/" + order[i]["image"]
                        }
                    }
                    return res.replyBack({msg: 'order_items', data: order, http_code: 200});
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

    confirmOrder: (req, res) => {
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

                let _payload = {
                    "order_status": "confirmed"
                }
                fn.model('order')
                    .findOne({
                        _id: order_id
                    })
                    .then((order) => {
                        order.updateOne(_payload)
                            .then(() => {
                                return res.replyBack({msg: 'order confirmed', http_code: 201});
                            })
                            .catch((err) => {
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

    rejectOrder: (req, res) => {
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

                let _payload = {
                    "order_status": "rejected"
                }
                fn.model('order')
                    .findOne({
                        _id: order_id
                    })
                    .then((order) => {
                        order.updateOne(_payload)
                            .then(() => {
                                return res.replyBack({msg: 'order rejected', http_code: 201});
                            })
                            .catch((err) => {
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

};

module.exports = functions;
