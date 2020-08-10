const CategoryController = function (Validator, rabbitMQ, categoryRecord) {

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
                    let productObject = req.body
                    let response = await rabbitMQ.execute("inventory.category.list", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
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
            try {
                let productObject = {
                    "search": req.body.search
                }
                let response = await rabbitMQ.execute("inventory.category.listLite", productObject, 100)
                res.respond(JSON.parse(response.toString()))
            } catch (e) {
                res.respond({http_code: 500, error: e.message})
            }
        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addCategory(req, res, next) {

        try {
            let rules = {
                "title": "required",
                "description": "required",
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
                    let categoriesObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active": true,
                        "is_deleted": false,
                    };
                    if (req.file !== null && req.file !== undefined) {
                        const image = req.file
                        const target_path = './uploads/categories/'
                        if (!fs.existsSync(target_path)) {
                            fs.mkdirSync(target_path, {recursive: true});
                        }
                        fs.rename("./uploads/" + image.filename, target_path + "/" + image.filename, function (err) {
                            if (err) {
                                return res.err({
                                    error: err,
                                    http_code: 500
                                });
                            }
                        })
                        categoriesObject["image"] = image.filename

                    }
                    let response = await rabbitMQ.execute("inventory.category.add", categoriesObject, 100)
                    res.respond(JSON.parse(response.toString()))
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
                "category_id": "required|objectId"
            };
            let validation = new Validator(req.params, rules);
            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });
            validation.passes(async () => {
                try {
                    let categoriesObject = {
                        "category_id": req.params.category_id,
                    };
                    let response = await rabbitMQ.execute("inventory.category.view", categoriesObject, 100)
                    res.respond(JSON.parse(response.toString()))
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
                "category_id": "required|objectId"
            };

            let validation = new Validator(req.params, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let categoriesObject = {
                        "category_id": req.params.category_id,
                    };
                    let response = await rabbitMQ.execute("inventory.category.delete", categoriesObject, 100)
                    res.respond(JSON.parse(response.toString()))
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
                'category_id': 'required|objectId',
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
                    let categoryObj = req.body
                    let response = await rabbitMQ.execute("inventory.category.edit", categoryObj, 100)
                    res.respond(JSON.parse(response.toString()))
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
                "category_id": "required|objectId"
            };

            let validation = new Validator(req.params, rules);

            validation.fails(() => {
                return res.err({
                    errors: validation.errors.errors,
                    http_code: 400
                });
            });

            validation.passes(async () => {
                try {
                    let categoryObj = {
                        "category_id": req.params.category_id,
                    };
                    let response = await rabbitMQ.execute("inventory.category.toggle", categoryObj, 100)
                    res.respond(JSON.parse(response.toString()))
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
                "category_id": "required|objectId",
                "product_id": "required|objectId",
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
                    let categoriesObject = {
                        "category_id": req.body["category_id"],
                        "product_id": req.body["product_id"],
                    };
                    let response = await rabbitMQ.execute("inventory.category.linkProduct", categoriesObject, 100)
                    res.respond(JSON.parse(response.toString()))
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
                "category_id": "required|objectId",
                "product_id": "required|objectId",
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
                    let categoriesObject = {
                        "category_id": req.body["category_id"],
                        "product_id": req.body["product_id"],
                    };
                    let response = await rabbitMQ.execute("inventory.category.unlinkProduct", categoriesObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function getCategoryProducts(req, res, next) {

        try {
            let rules = {
                "category_id": "required|objectId"
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
                    let categoriesObject = {
                        "category_id": req.body["category_id"],
                    };
                    let response = await rabbitMQ.execute("inventory.category.getCategoryProducts", categoriesObject, 100)
                    res.respond(JSON.parse(response.toString()))
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
