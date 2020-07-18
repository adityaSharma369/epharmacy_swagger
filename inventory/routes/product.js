let functions = {
    list: async (req, res) => {

        try {

            let page = req.body.page ? req.body.page : 1;
            let limit = req.body.limit ? req.body.limit : 10;
            let category_id = req.body.category_id;

            let filter = {};
            if (typeof req.body.search != "undefined") {
                filter = {
                    $or: [{title: {$regex: req.body.search, $options: 'si'}}, {
                        title: {
                            $regex: req.body.search,
                            $options: 'si'
                        },
                    }]
                }
            }
            if (category_id !== undefined) {
                let productsArray = []
                await fn.model("product_category").find({"category_id": category_id}).then((data) => {
                    data.forEach((product) => {
                        productsArray.push(product.product_id)
                    })
                })
                filter["_id"] = {"$in": productsArray}
            }
            filter["is_deleted"] = false
            fn.paginate("product", filter, "", limit, page, {"_created": -1}).then(async (data) => {
                for (i = 0; i < data.docs.length; i++) {
                    data.docs[i]['_doc']['image'] = await fn.model("product_image").findOne({
                        "product_id": data.docs[i]._id,
                        "is_primary": true
                    });
                    if (data.docs[i]['_doc']['image'] !== undefined && data.docs[i]['_doc']['image'] !== null) {

                        data.docs[i]['_doc']['image']["image"] = CURRENT_DOMAIN + "/product_images/" + data.docs[i]._id + "/" + data.docs[i]['_doc']['image']["image"]
                        data.docs[i] = {...data.docs[i]['_doc']};
                    }
                    let categoryIds = []
                    await fn.model("product_category").find({"product_id": data.docs[i]._id}).then(temp => {
                        for (let j = 0; j < temp.length; j++) {
                            categoryIds.push(temp[j].category_id)
                        }
                    })

                    data.docs[i]['categories'] = await fn.model("category").find({"_id": {"$in": categoryIds}});
                    data.docs[i]["category_ids"] = categoryIds;
                }
                return res.replyBack({msg: 'product list', data: data, http_code: 200})
            }).catch((err) => {
                return res.replyBack({ex: fn.err_format(err), http_code: 500});
            });
        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }

    },

    listLite: (req, res) => {
        try {
            let filter = {"is_deleted": false}
            if (typeof req.body.search != "undefined") {
                filter = {
                    $or: [{title: {$regex: req.body.search, $options: 'si'}}, {
                        title: {
                            $regex: req.body.search,
                            $options: 'si'
                        },
                    }]
                }
            }
            fn.model('product').find(filter).select('_id title').then((data) => {
                return res.replyBack({msg: 'product list', data: data, http_code: 200})
            })
                .catch((err) => {
                    return res.replyBack({ex: fn.err_format(err), http_code: 500});
                });

        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }

    },

    add: (req, res) => {
        try {
            const rules = {
                title: 'required|min:1|max:100',
                description: 'required',
                price: "required",
                manufacturer: "required",
                categories: "required|array:string"
            };
            const validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(() => {
                const title = req.body.title;
                const description = req.body.description;
                const price = req.body.price;
                const manufacturer = req.body.manufacturer;
                const categories = req.body.categories;

                const productData = {
                    title: title,
                    description: description,
                    price: price,
                    manufacturer: manufacturer,
                    is_visible: true,
                    is_active: true,
                    is_deleted: false,
                }
                const product = new fn.model('product')(productData);
                product.save()
                    .then((data) => {
                        const categoryArray = []
                        categories.forEach(function (c_id) {
                                const linkData = {
                                    product_id: data._id,
                                    category_id: c_id,
                                    is_active: true
                                }
                                categoryArray.push(linkData)
                            }
                        );
                        fn.model("product_category").insertMany(categoryArray).then(() => {
                                return res.replyBack({msg: 'product added', data: data, http_code: 201});
                            }
                        ).catch((err) => {
                            return res.replyBack({ex: fn.err_format(err), http_code: 500});
                        })
                    }).catch((err) => {
                    return res.replyBack({ex: fn.err_format(err), http_code: 500});
                });
            });
        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    edit: (req, res) => {
        try {
            const rules = {
                product_id: 'required|exists:product,_id',
                categories: 'array'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {

                let product_id = req.body.product_id;
                const categories = req.body.categories;
                fn.model('product')
                    .findOne({
                        _id: product_id
                    })
                    .then((product) => {
                        let _payload = product

                        if (typeof req.body.title != "undefined") {
                            _payload["title"] = req.body.title
                        }

                        if (typeof req.body.description != "undefined") {
                            _payload["description"] = req.body.description
                        }

                        if (typeof req.body.is_active != "undefined") {
                            _payload["is_active"] = req.body.is_active
                        }

                        if (typeof req.body.price != "undefined") {
                            _payload["price"] = req.body.price
                        }

                        if (typeof req.body.manufacturer != "undefined") {
                            _payload["manufacturer"] = req.body.manufacturer
                        }

                        if (typeof req.body.is_visible != "undefined") {
                            _payload["is_visible"] = req.body.is_visible
                        }

                        product.updateOne(_payload)
                            .then((data) => {
                                const categoryArray = []
                                if (categories !== undefined) {
                                    if (categories.length > 0) {
                                        fn.model("product_category").deleteMany({"product_id": product_id}).then(() => {
                                            categories.forEach(function (c_id) {
                                                    const linkData = {
                                                        product_id: product_id,
                                                        category_id: c_id,
                                                        is_active: true
                                                    }
                                                    categoryArray.push(linkData)
                                                }
                                            );
                                            fn.model("product_category").insertMany(categoryArray).then((data23) => {
                                            }).catch((err) => {
                                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                                            })
                                        }).catch((err) => {
                                            return res.replyBack({ex: fn.err_format(err), http_code: 500});
                                        });

                                    }
                                }
                                return res.replyBack({msg: 'product edited', data: _payload, http_code: 201});
                            })
                            .catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                    });
            });

        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },


    toggleStatus: (req, res) => {
        try {
            const rules = {
                product_id: 'required|exists:product,_id',
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {

                let product_id = req.body.product_id;
                fn.model('product')
                    .findOne({
                        _id: product_id
                    })
                    .then((product) => {
                        let _payload = product
                        let msg = ""
                        if (_payload.is_active === true) {
                            _payload["is_active"] = false
                            msg = "product is not active"
                        } else {
                            _payload["is_active"] = true
                            msg = "product is active"
                        }
                        product.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: msg, data: _payload, http_code: 201});
                            })
                            .catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                    });
            });

        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    view: (req, res) => {
        try {

            const rules = {
                product_id: 'required|exists:product,_id'
            };

            const validation = new validator(req.body, rules);

            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });

            validation.passes(async () => {
                let product_id = req.body.product_id;
                fn.model('product').findOne({_id: product_id}).then(async (data) => {
                    if (data.is_deleted === true) {
                        return res.replyBack({error: "product was deleted or not found", http_code: 500});
                    }
                    data['_doc']["image"] = await fn.model("product_image").find({"product_id": product_id});
                    for (let i = 0; i < data["_doc"]["image"].length; i++) {
                        data["_doc"]["image"][i]["image"] = CURRENT_DOMAIN + "/product_images/" + product_id + "/" + data["_doc"]["image"][i]["image"]
                    }
                    data["image"] = {...data['_doc']};

                    let tempData = await fn.model("product_category").find({"product_id": product_id});
                    let category_ids = []
                    await tempData.forEach(category => {
                        category_ids.push(category.category_id)
                    })

                    data['_doc']["categories"] = await fn.model("category").find({"_id": {"$in": category_ids}});
                    let categoryIds = []
                    for (let i = 0; i < data["_doc"]["categories"].length; i++) {
                        categoryIds.push(data["_doc"]["categories"][i]._id)
                    }
                    data["categories"] = {...data['_doc']["categories"]};
                    data['_doc']["category_ids"] = category_ids;
                    data["category_ids"] = data['_doc']["category_ids"]
                    return res.replyBack({msg: 'product view', data: data, http_code: 200})
                }).catch((err) => {
                    return res.replyBack({ex: fn.err_format(err), http_code: 500});
                });
            });

        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }

    },

    delete: (req, res) => {
        try {
            let rules = {
                product_id: 'required|exists:product,_id'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let product_id = req.body.product_id;
                let _payload = {
                    "is_deleted": true
                }
                fn.model('product')
                    .findOne({
                        _id: product_id
                    })
                    .then((category) => {
                        category.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'product deleted', http_code: 201});
                            })
                            .catch((err) => {
                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                            });
                    });
            });

        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    linkCategory: (req, res) => {
        let rules = {
            product_id: "required|exists:product,_id",
            category_id: 'required|exists:category,_id'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let category_id = req.body.category_id;
            let product_id = req.body.product_id;
            const linkData = {
                product_id: product_id,
                category_id: category_id,
                is_active: true
            }
            fn.model("product_category")(linkData).save().then(() => {
                    return res.replyBack({msg: 'product linked', data: linkData, http_code: 201});
                }
            ).catch((err) => {
                return res.replyBack({ex: fn.err_format(err), http_code: 500});
            })
        });
    },

    unlinkCategory: (req, res) => {
        let rules = {
            product_id: "required|exists:product,_id",
            category_id: 'required|exists:category,_id'
        };

        let validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            let category_id = req.body.category_id;
            let product_id = req.body.product_id;
            fn.model("product_category").deleteMany({"product_id": product_id, "category_id": category_id}).then(() => {
                    return res.replyBack({msg: 'product unlinked', data: linkData, http_code: 201});
                }
            ).catch((err) => {
                return res.replyBack({ex: fn.err_format(err), http_code: 500});
            })
        });
    },

    uploadImage: (req, res) => {
        try {
            let rules = {
                product_id: 'required|exists:product,_id',
                image: 'required'
            };
            let validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                const product_id = req.body.product_id;
                const image = req.body.image.filename;
                const product_image = {
                    product_id: product_id,
                    image: image,
                    is_primary: true,
                    is_active: true,
                    priority: 1
                }
                fn.model('product_image')(product_image).save()
                    .then(() => {
                        return res.replyBack({msg: 'product  image uploaded', data: product_image, http_code: 201});

                    })
                    .catch((err) => {
                        return res.replyBack({ex: fn.err_format(err), http_code: 500});
                    });
                ;
            });

        } catch (e) {
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

};

module.exports = functions;
