const CategoryController = function (Validator, rabbitMQ, categoryRecord, categoryProductRecord) {

    async function getAllCategories(req, res, next) {

        try {
            let rules = {
                page: 'required|numeric',
                limit: 'required|numeric'
            };
            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let page = req.body["page"] ? parseInt(req.body["page"]) : 1;
                    let limit = req.body["limit"] ? parseInt(req.body["limit"]) : 10;

                    let filter = {};
                    if (typeof req.body.search != "undefined") {
                        filter = {
                            $or: [{title: {$regex: req.body.search, $options: 'si'}}]
                        }
                    }
                    filter["is_deleted"] = false
                    let response = await categoryRecord.paginate(filter, "", limit, page, "");
                    response["docs"].forEach(function (category) {
                            if (category.image !== null && category.image !== undefined) {
                                category.image = CURRENT_DOMAIN + "/categories/" + category.image
                            }
                        }
                    );
                    res.respond({http_code: 200, msg: 'list', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function categoryListLite(req, res, next) {

        try {
            let filter = {};
            if (typeof req.body.search != "undefined") {
                filter = {
                    $or: [{title: {$regex: req.body.search, $options: 'si'}}]
                }
            }
            filter["is_deleted"] = false
            let response = await categoryRecord.getCategories(filter);
            res.respond({http_code: 200, msg: 'list', data: response})
        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addCategory(req, res, next) {

        try {
            let rules = {
                "title": "required",
                "description": "required",
                "parent_id": "exists:categories._id"
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let categoryObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active": true,
                        "is_deleted": false,
                    };
                    if (req.body["image"] !== null && req.body["image"] !== undefined) {
                        categoryObject["image"] = req.body["image"]
                    }
                    if (req.body["parent_id"] !== null && req.body["parent_id"] !== undefined) {
                        categoryObject["parent_id"] = req.body["parent_id"]
                    }
                    let response = await categoryRecord.addCategory(categoryObject);
                    res.respond({http_code: 200, msg: 'category added', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function viewCategory(req, res, next) {

        try {
            let rules = {
                "category_id": "required|objectId|exists:categories,_id"
            };
            let validation = new Validator(req.body, rules);
            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });
            validation.passes(async () => {
                try {
                    let categoryObject = {
                        "_id": req.body.category_id,
                    };
                    let category = await categoryRecord.getCategory(categoryObject);
                    if (category.image !== null && category.image !== undefined) {
                        category.image = CURRENT_DOMAIN + "/categories/" + category.image
                    }
                    res.respond({http_code: 200, msg: 'category details', data: category})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function deleteCategory(req, res, next) {

        try {
            let rules = {
                "category_id": "required|objectId|exists:categories,_id"
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let categoryObject = {
                        "_id": req.body.category_id,
                    };
                    let response = await categoryRecord.editCategory(categoryObject, {"is_deleted": true});
                    res.respond({http_code: 200, msg: 'category deleted', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function editCategory(req, res, next) {

        try {
            let rules = {
                'category_id': 'required|objectId|exists:categories,_id',
            };
            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let category_id = req.body["category_id"]
                    let category = await categoryRecord.getCategory({"_id": category_id})
                    if (req.body["title"] !== null) {
                        category["title"] = req.body["title"]
                    }
                    if (req.body["description"] !== null) {
                        category["description"] = req.body["description"]
                    }
                    let data = await categoryRecord.editCategory({"_id": category_id}, category);
                    return res.respond({
                        http_code: 200,
                        msg: 'category edited',
                        data: data
                    });
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            console.log(e);
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function toggleCategory(req, res, next) {

        try {
            let rules = {
                "category_id": "required|objectId|exists:categories,_id"
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let category_id = req.body.category_id
                    let msg = ""
                    let category = await categoryRecord.getCategory({"_id": category_id})
                    if (category["is_active"] === false) {
                        msg = "category activated"
                        category["is_active"] = true
                    } else {
                        msg = "category de_activated"
                        category["is_active"] = false
                    }
                    let data = await categoryRecord.editCategory({"_id": category_id}, category);
                    return res.respond({
                        http_code: 200,
                        msg: msg,
                        data: data
                    });
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function getCategoryProducts(req, res, next){
        try {
            let rules = {
                "category_id": "required|objectId|exists:categories,_id",
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let categoryProduct = [{
                        "$lookup": {
                            from:"products",
                            localField:"product_id",
                            foreignField:"_id",
                            as:"products"
                        }
                    },
                    {
                        "$lookup": {
                            from:"categories",
                            localField:"category_id",
                            foreignField:"_id",
                            as:"category"
                        }
                    }]
                    let data = await categoryProductRecord.aggregate(categoryProduct);
                    return res.respond({
                        http_code: 200,
                        msg: "product linked",
                        data: data
                    });
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function linkProduct(req, res, next) {

        try {
            let rules = {
                "category_id": "required|objectId|exists:categories,_id",
                "product_id": "required|objectId|exists:products,_id"
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let categoryProduct = {
                        category_id: req.body.category_id,
                        product_id: req.body.product_id
                    }
                    let data = await categoryProductRecord.addCategoryProduct(categoryProduct);
                    return res.respond({
                        http_code: 200,
                        msg: "product linked",
                        data: data
                    });
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function unlinkProduct(req, res, next) {

        try {
            let rules = {
                "category_id": "required|objectId|exists:categories,_id",
                "product_id": "required|objectId|exists:products,_id"
            };

            let validation = new Validator(req.body, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let categoryProduct = {
                        category_id: req.body.category_id,
                        product_id: req.body.product_id
                    }
                    let data = await categoryProductRecord.deleteCategoryProduct(categoryProduct);
                    return res.respond({
                        http_code: 200,
                        msg: "product unlinked",
                        data: data
                    });
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    return {
        getAllCategories, addCategory, viewCategory, deleteCategory, editCategory, toggleCategory, categoryListLite,
        linkProduct,unlinkProduct,getCategoryProducts
    }

}

module.exports = CategoryController
