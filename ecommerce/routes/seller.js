let functions = {
    list: (req, res) => {

        try {
            let rules = {};
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let page = req.body.page ? req.body.page : 1;
                let limit = req.body.limit ? req.body.limit : 10;
                let filter = {
                    "is_deleted": false
                };
                if (req.body.search !== undefined && req.body.search !== "") {
                    filter["$or"] = [{total_amount: {$regex: req.body.search, $options: 'si'}}];
                }
                fn.paginate("seller", filter, "", limit, page, {"_created": -1}).then(async (data) => {
                    return res.replyBack({msg: 'seller list', data: data, http_code: 200})
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

    listLite: (req, res) => {
        try {
            let rules = {};
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let filter = {
                    "is_active": true,
                    "is_deleted": false
                };
                if (req.body.search !== undefined && req.body.search !== "") {
                    filter["$or"] = [{total_amount: {$regex: req.body.search, $options: 'si'}}];
                }
                fn.model("seller").find(filter).select("_id name").then(async (data) => {
                    return res.replyBack({msg: 'seller list', data: data, http_code: 200})
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
                user_id: 'required|objectId|exists:user,_id',
                location: 'required|array',
                place: 'required',
                city: 'required',
                state: 'required',
                pin_code: 'required',
                name: 'required',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
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
                let address = {}
                if (location !== "undefine" || location !== "") {
                    address["location"] = location
                }
                if (place !== "undefine" || place !== "") {
                    address["place"] = place
                }
                if (city !== "undefine" || city !== "") {
                    address["city"] = city
                }
                if (state !== "undefine" || state !== "") {
                    address["state"] = state
                }
                if (pin_code !== "undefine" || pin_code !== "") {
                    address["pin_code"] = pin_code
                }
                let _payload = {
                    user_id: user_id,
                    name: name,
                    address: address,
                    is_active: true,
                    is_deleted: false,
                };
                if (description !== "undefine" && description !== "") {
                    _payload["description"] = description
                }
                await new fn.model('seller')(_payload).save().then(async (data) => {
                    return res.replyBack({msg: 'new seller added', data: data, http_code: 201});
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
                seller_id: 'required|objectId|exists:seller,_id',
                location: 'array',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let seller_id = req.body.seller_id
                let user_id = req.body.user_id
                let name = req.body.name;
                let location = req.body.location;
                let place = req.body.place;
                let city = req.body.city;
                let state = req.body.state;
                let description = req.body.description;
                let is_active = req.body.is_active;
                let pin_code = req.body.pin_code;


                fn.model('seller')
                    .findOne({
                        _id: seller_id
                    })
                    .then((seller) => {

                        let _payload = seller

                        if (location !== "undefine" || location !== "") {
                            _payload["address"]["location"] = location
                        }
                        if (place !== "undefine" || place !== "") {
                            _payload["address"]["place"] = place
                        }
                        if (city !== "undefine" || city !== "") {
                            _payload["address"]["city"] = city
                        }
                        if (state !== "undefine" || state !== "") {
                            _payload["address"]["state"] = state
                        }
                        if (pin_code !== "undefine" || pin_code !== "") {
                            _payload["address"]["pin_code"] = pin_code
                        }

                        if (user_id !== "undefine" || user_id !== "") {
                            _payload["user_id"] = user_id
                        }
                        if (name !== "undefine" || name !== "") {
                            _payload["name"] = name
                        }
                        if (description !== "undefine" && description !== "") {
                            _payload["description"] = description
                        }
                        if (is_active !== "undefine" && is_active !== "") {
                            _payload["is_active"] = is_active
                        }
                        seller.updateOne(_payload)
                            .then((seller) => {
                                return res.replyBack({msg: 'seller edited', data: seller, http_code: 201});
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
                seller_id: 'required|exists:seller,_id'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let seller_id = req.body.seller_id;
                fn.model('seller')
                    .findOne({
                        _id: seller_id
                    })
                    .then(async (seller) => {
                        if (seller["is_deleted"] === true) {
                            return res.replyBack({error: "seller account not found", http_code: 500});
                        }
                        seller["_doc"]["seller_products"] = await fn.model("seller_product").find({"seller_id": seller_id})
                        console.log(seller["_doc"]["seller_products"].length)
                        for (let i = 0; i < seller["_doc"]["seller_products"].length; i++) {
                            await fn.model("product").findOne(
                                {
                                    "_id": seller["_doc"]["seller_products"][i]["product_id"],
                                }).then((data) => {
                                seller["_doc"]["seller_products"][i]["_doc"]["product_details"] = data
                            }).catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                            // seller["_doc"]["seller_products"][i]["_doc"]["product_details"] = seller["_doc"]["seller_products"][i]["_doc"]["product_details"]
                        }
                        return res.replyBack({msg: "seller view", data: seller, http_code: 200})
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

    delete: (req, res) => {
        try {
            let rules = {
                seller_id: 'required|objectId|exists:seller,_id'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let seller_id = req.body.seller_id

                fn.model('seller')
                    .findOne({
                        _id: seller_id
                    })
                    .then((seller) => {
                        let _payload = seller
                        _payload["is_deleted"] = true
                        seller.updateOne(_payload)
                            .then((seller) => {
                                return res.replyBack({msg: 'seller deleted', data: seller, http_code: 201});
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

    linkProduct: (req, res) => {
        try {
            let rules = {
                seller_id: 'required|objectId|exists:seller,_id',
                product_id: 'required|objectId|exists:product,_id',
                qty: 'required|numeric',
                price: 'required|numeric',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let seller_id = req.body.seller_id
                let product_id = req.body.product_id
                let qty = req.body.qty
                let price = req.body.price
                await fn.model('seller_product').findOne({
                    "seller_id": seller_id,
                    "product_id": product_id
                }).then(async (seller_product) => {
                    if (seller_product) {
                        return res.replyBack({error: "product already linked to the seller", http_code: 500})
                    }
                    await fn.model('seller_product')({
                        "seller_id": seller_id,
                        "product_id": product_id,
                        "qty": qty,
                        "price": price,
                        "is_active": true,
                    }).save().then((seller_product) => {
                        return res.replyBack({msg: 'product added under seller', data: seller_product, http_code: 201});
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

    unlinkProduct: (req, res) => {
        try {
            let rules = {
                seller_id: 'required|objectId|exists:seller,_id',
                product_id: 'required|objectId|exists:product,_id',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let seller_id = req.body.seller_id
                let product_id = req.body.product_id

                await fn.model('seller_product').findOne({
                    "seller_id": seller_id,
                    "product_id": product_id
                }).then(async (seller_product) => {
                    if (!seller_product) {
                        return res.replyBack({error: "product not linked to the seller", http_code: 500})
                    }
                    fn.model('seller_product').deleteOne({
                        "seller_id": seller_id,
                        "product_id": product_id,
                    }).then((seller_product) => {
                        return res.replyBack({msg: 'product unlinked to seller', data: seller_product, http_code: 201});
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

    sellerProducts: (req, res) => {
        try {
            let rules = {
                seller_id: 'required|objectId|exists:seller,_id',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let seller_id = req.body.seller_id
                console.log(seller_id)
                fn.model('seller_product').find({"seller_id": seller_id}).then(async (seller_product) => {
                    for (i = 0; i < seller_product.length; i++) {
                        seller_product[i]['_doc']['product_details'] = await fn.model("product").findOne(
                            {
                                "_id": seller_product[i]["product_id"],
                            }
                        );
                        seller_product[i]["product_details"] = {...seller_product[i]['_doc']["product_details"]};
                    }
                    return res.replyBack({msg: 'seller products', data: seller_product, http_code: 200});
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

    sellerProductsEdit: (req, res) => {
        try {
            let rules = {
                seller_id: 'required|objectId|exists:seller,_id',
                product_id: 'required|objectId|exists:product,_id',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(async () => {
                let product_id = req.body.product_id
                let seller_id = req.body.seller_id
                let qty = req.body.qty
                let price = req.body.price
                console.log(qty, price)
                fn.model('seller_product').findOne({
                    "seller_id": seller_id,
                    "product_id": product_id
                }).then(async (seller_product) => {
                    console.log(seller_product)
                    let _payload = seller_product
                    if (qty !== "undefine" && qty !== "") {
                        _payload["qty"] = qty
                    }
                    if (price !== "undefine" && price !== "") {
                        _payload["price"] = price
                    }
                    seller_product.updateOne(_payload).then(() => {
                        return res.replyBack({msg: 'seller products edit', data: seller_product, http_code: 200});
                    })
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
