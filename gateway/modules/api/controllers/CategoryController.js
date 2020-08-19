const CategoryController = function (Validator, rabbitMQ, categoryRecord) {

    /**
     * @swagger
     * /api/category/list:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: list of categories
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           page: {
     *             type: "number",
     *             example: "1"
     *           },
     *           limit: {
     *               type: "number",
     *               example: "10"
     *           },
     *           search: {
     *               type: "string",
     *               example: ""
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "categories list",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
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

    /**
     * @swagger
     * /api/category/listLite:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: list of categories
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           search: {
     *               type: "string",
     *               example: ""
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "categories list",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
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

    /**
     * @swagger
     * /api/category/add:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: Add category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       description: "New Category object to be stored"
     *       required: true
     *       schema:
     *         $ref: "#/definitions/Category"
     *    responses:
     *      '200': {
     *      "description": "category added",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     * definitions:
     *     Category:
     *       type: "object"
     *       required:
     *       - "title"
     *       - "description"
     *       properties:
     *        title:
     *          type: "string"
     *          example: "title"
     *        description:
     *          type: "string"
     *          example: "category"
     */
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

    /**
     * @swagger
     * /api/category/view/{category_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: view category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The category_id  to view the details of category
     *       name: "category_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "category details",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
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

    /**
     * @swagger
     * /api/category/delete/{category_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: delete category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The category_id  to delete the details of category
     *       name: "category_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "category deleted",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
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

    /**
     * @swagger
     * /api/category/edit:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: edit category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           category_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           title: {
     *               type: "string",
     *               example: "ladakh"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "category edited",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
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

    /**
     * @swagger
     * /api/category/toggle/{category_id}:
     *  get:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: deactivate category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "path"
     *       description: The category_id  to deactivate
     *       name: "category_id"
     *       required: true
     *    responses:
     *      '200': {
     *      "description": "category de_activated",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user is not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *    }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */

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

    /**
     * @swagger
     * /api/category/linkProduct:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: link product to category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           category_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           product_id: {
     *               type: "string",
     *               example: "5f32603725043800133d343c"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "product linked",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */

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

    /**
     * @swagger
     * /api/category/unlinkProduct:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: unlink product to category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           category_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           },
     *           product_id: {
     *               type: "string",
     *               example: "5f32603725043800133d343c"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "product unlinked",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
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

    /**
     * @swagger
     * /api/category/getCategoryProducts:
     *  post:
     *    security:
     *    - JWT: []
     *    tags:
     *    - Category
     *    description: get products of category
     *    consumes:
     *     - "application/json"
     *    produces:
     *     - application/json
     *    parameters:
     *     - in: "body"
     *       name: "body"
     *       required: true
     *       schema: {
     *           type: object,
     *          properties: {
     *           category_id: {
     *             type: "string",
     *             example: "5f32603725043800133d343c"
     *           }
     *          }
     *       }
     *    responses:
     *      '200': {
     *      "description": "list of products linked to category",
     *      "content": {
     *          "application/json": {}
     *      },
     *    }
     *      '401': {
     *      "description": "user not logged in",
     *      "content": {
     *          "application/json": {}
     *      }
     *  }
     *      '400': {
     *          "description": "validation errors",
     *      }
     */
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
        linkProduct, unlinkProduct, getCategoryProducts
    }

}

module.exports = CategoryController
