var functions = {
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
            filter["is_active"] = true
            fn.paginate("category", filter, "", limit, page, {"_created": -1}).then(async (data) => {
                for (i = 0; i < data.docs.length; i++) {
                    data.docs[i]['_doc']['products_count'] = await fn.model("product_category").find({
                        "category_id": data.docs[i]._id,
                    }).count();
                    data.docs[i] = {...data.docs[i]['_doc']};
                }
                return res.replyBack({msg: 'category list', data: data, http_code: 200})
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

    listLite: (req, res) => {
        try {
            var filter = {"is_active": true}
             if (typeof req.body.search != "undefined") {
                filter = {
                    $or: [{title: {$regex: req.body.search, $options: 'si'}}]
                }
            }
            fn.model('category').find(filter).select('_id title').then((data) => {
                return res.replyBack({msg: 'category list', data: data, http_code: 200})
            })
                .catch((err) => {
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
            var rules = {
                title: 'required|min:1|max:100',
                description: 'required',
                parent_id: "objectId|exists:category,_id"
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400})
            });
            validation.passes(() => {
                var title = req.body.title;
                var description = req.body.description;
                var parent_id = req.body.parent_id;

                var categoryData = {
                    title: title,
                    description: description,
                    is_visible: true,
                    is_active: true,
                    is_primary: true,
                    priority: 1
                }
                if (parent_id !== undefined) {
                    categoryData["parent_id"] = parent_id
                }

                var category = new fn.model('category')(categoryData);
                category.save()
                    .then((data) => {
                        return res.replyBack({msg: 'category added', data: data, http_code: 200})
                    })
                    .catch((err) => {
                        return res.replyBack({ex: fn.err_format(err), http_code: 500});
                    });
            });
        } catch
            (e) {
            console.log("error", e)
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },

    edit: (req, res) => {
        try {
            var rules = {
                category_id: 'required|exists:category,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let category_id = req.body.category_id;

                var _payload = {}

                if (typeof req.body.title != "undefined") {
                    _payload["title"] = req.body.title
                }

                if (typeof req.body.description != "undefined") {
                    _payload["description"] = req.body.description
                }

                if (typeof req.body.is_active != "undefined") {
                    _payload["is_active"] = req.body.is_active
                }

                if (typeof req.body.is_primary != "undefined") {
                    _payload["is_primary"] = req.body.is_primary
                }

                fn.model('category')
                    .findOne({
                        _id: category_id
                    })
                    .then((category) => {
                        category.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'category edited', http_code: 200});
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

            var rules = {
                category_id: 'required|exists:category,_id'
            };

            var validation = new validator(req.body, rules);

            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });

            validation.passes(async () => {
                let category_id = req.body.category_id;
                fn.model('category').findOne({_id: category_id}).then(async (data) => {

                    const tempData = await fn.model("product_category").find({"category_id": category_id});
                    const product_ids = []
                    tempData.forEach(category => {
                        product_ids.push(category.product_id)
                    })

                    data['_doc']["products"] = await fn.model("product").find({"_id": {"$in": product_ids}});
                    for (i = 0; i < data['_doc']["products"].length; i++) {
                        data['_doc']["products"][i]["_doc"]["image"] = await fn.model("product_image").findOne({
                            "product_id": data['_doc']["products"][i]._id,
                            "is_primary": true,
                        });
                        if( data['_doc']["products"][i]["_doc"]["image"] !== undefined && data['_doc']["products"][i]["_doc"]["image"] !== null){
                            data['_doc']["products"][i]["_doc"]["image"]["image"] = CURRENT_DOMAIN + "/product_images/" + data['_doc']["products"][i]._id + "/" + data['_doc']["products"][i]["_doc"]["image"]["image"]
                            data['_doc']["products"][i]["image"] = {...data['_doc']["products"][i]["_doc"]["image"]};
                        }
                    }
                    data["products"] = {...data['_doc']};

                    return res.replyBack({msg: 'category view', data: data, http_code: 200})
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
            var rules = {
                category_id: 'required|exists:category,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let category_id = req.body.category_id;
                var _payload = {
                    "is_active": false
                }
                fn.model('category')
                    .findOne({
                        _id: category_id
                    })
                    .then((category) => {
                        category.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'category deleted', http_code: 200});
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

    listTree: (req, res) => {
        try {
            var rules = {
                category_id: 'required|exists:category,_id'
            };
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {
                let category_id = req.body.category_id;
                var _payload = {
                    "is_active": false
                }
                fn.model('category')
                    .findOne({
                        _id: category_id
                    })
                    .then((category) => {
                        category.updateOne(_payload)
                            .then((data) => {
                                return res.replyBack({msg: 'category deleted', http_code: 200});
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
};

module.exports = functions;
