const SymptomController = function (Validator, rabbitMQ, symptomsRecord) {

    async function getAllSymptoms(req, res, next) {

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
                    let response = await rabbitMQ.execute("inventory.symptom.list", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

     async function symptomListLite(req, res, next) {
        try {
                try {
                    let productObject = {
                        "search":req.body.search
                    }
                    let response = await rabbitMQ.execute("inventory.symptom.listLite", productObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }


    async function addSymptom(req, res, next) {

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
                    let symptomsObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active":true,
                        "is_deleted":false,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.add", symptomsObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function viewSymptom(req, res, next) {
        try {
            let rules = {
                "symptom_id": "required|objectId"
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
                    let symptomsObject = {
                        "symptom_id": req.params.symptom_id,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.view", symptomsObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function deleteSymptom(req, res, next) {

        try {
            let rules = {
                "symptom_id": "required|objectId"
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
                    let symptomsObject = {
                        "symptom_id": req.params.symptom_id,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.delete", symptomsObject, 100)
                    res.respond(JSON.parse(response.toString()))
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function editSymptom(req, res, next) {

        try {
            let rules = {
                'symptom_id': 'required|objectId',
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
                   let symptomObj = req.body
                    let response = await rabbitMQ.execute("inventory.symptom.edit", symptomObj, 100)
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

    async function toggleSymptom(req, res, next) {

        try {
            let rules = {
                "symptom_id": "required|objectId"
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
                    let symptomObj = {
                        "symptom_id": req.params.symptom_id,
                    };
                    let response = await rabbitMQ.execute("inventory.symptom.toggle", symptomObj, 100)
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
        getAllSymptoms, addSymptom, viewSymptom, deleteSymptom, editSymptom, toggleSymptom,symptomListLite
    }

}

module.exports = SymptomController
