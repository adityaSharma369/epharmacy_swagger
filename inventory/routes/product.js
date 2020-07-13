var functions = {
    list: (req, res) => {

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
            if(category_id !== undefined){
                const productsArray = []
                fn.model("product_category").find({"category_id":category_id}).then((data)=>{
                    data.forEach((product)=>{
                        productsArray.push(product._id)
                    })
                })
                filter["_id"]={"$in":productsArray}
            }
            filter["is_active"] = true
            fn.paginate("product", filter, "", limit, page, {"_created": -1}).then((data) => {
                data.docs.forEach(element => {
                    element.password = undefined;
                });
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
            var filter = {"is_active": true}
            fn.model('category').find(filter).select('_id title').then((data) => {
                return res.replyBack({msg: 'category list', data: data, http_code: 200})
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
                categories: "required|array"
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
                                return res.replyBack({msg: 'product added', data: data, http_code: 200});
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
            var validation = new validator(req.body, rules);
            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });
            validation.passes(async () => {

                let product_id = req.body.product_id;
                const categories = req.body.categories;

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

                if (typeof req.body.price != "undefined") {
                    _payload["price"] = req.body.price
                }

                if (typeof req.body.manufacturer != "undefined") {
                    _payload["manufacturer"] = req.body.manufacturer
                }

                if (typeof req.body.is_visible != "undefined") {
                    _payload["is_visible"] = req.body.is_visible
                }

                fn.model('product')
                    .findOne({
                        _id: product_id
                    })
                    .then((product) => {
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
                                            fn.model("product_category").insertMany(categoryArray).then((data23)=>{
                                            }).catch((err) => {
                                                return res.replyBack({ex: fn.err_format(err), http_code: 500});
                                            })
                                        }).catch((err) => {
                                            return res.replyBack({ex: fn.err_format(err), http_code: 500});
                                        });

                                    }
                                }
                                return res.replyBack({msg: 'product edited', data: _payload, http_code: 200});
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

            var rules = {
                category_id: 'required|exists:category,_id'
            };

            var validation = new validator(req.body, rules);

            validation.fails(() => {
                return res.replyBack({errors: validation.errors.errors, http_code: 400});
            });

            validation.passes(async () => {
                let category_id = req.body.category_id;
                fn.model('category').findOne({_id: category_id}).then((data) => {
                    return res.replyBack({msg: 'category view', data: data, http_code: 200})
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
            return res.replyBack({
                error: 'something went wrong', http_code: 500
            });
        }
    },
};

module.exports = functions;
