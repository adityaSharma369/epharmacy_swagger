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
                    let page = req.body["page"] ? parseInt(req.body["page"]) : 1;
                    let limit = req.body["limit"] ? parseInt(req.body["limit"]) : 10;

                    let filter = {};
                    if (typeof req.body.search != "undefined") {
                        filter = {
                            $or: [{title: {$regex: req.body.search, $options: 'si'}}]
                        }
                    }
                    filter["is_deleted"] = false
                    let response = await symptomsRecord.paginate(filter, "", limit, page, "");
                    res.respond({http_code: 200, msg: 'list', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

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
                    let response = await symptomsRecord.addSymptom(symptomsObject);
                    res.respond({http_code: 200, msg: 'symptoms added', data: response})
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
                "symptom_id": "required|objectId|exists:symptoms,_id"
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
                        "_id": req.body.symptom_id,
                    };
                    let response = await symptomsRecord.getSymptom(symptomsObject);
                    res.respond({http_code: 200, msg: 'symptoms details', data: response})
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
                "symptom_id": "required|objectId|exists:symptoms,_id"
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
                        "_id": req.body.symptom_id,
                    };
                    let response = await symptomsRecord.editSymptom(symptomsObject, {"is_deleted": true});
                    res.respond({http_code: 200, msg: 'symptoms deleted', data: response})
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
                'symptom_id': 'required|objectId|exists:symptoms,_id',
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
                    let symptom_id = req.body["symptom_id"]
                    let symptoms = await symptomsRecord.getSymptom({"_id": symptom_id})
                    if(req.body["title"] !== null){
                        symptoms["title"] = req.body["title"]
                    }
                    if(req.body["description"] !== null){
                        symptoms["description"] = req.body["description"]
                    }
                    let data = await symptomsRecord.editSymptom({"_id": symptom_id},symptoms);
                    return res.respond({
                        http_code: 200,
                        msg: 'symptoms edited',
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

    async function toggleSymptom(req, res, next) {

        try {
            let rules = {
                "symptom_id": "required|objectId|exists:symptoms,_id"
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
                    let symptom_id = req.body.symptom_id
                    let msg = ""
                    let symptoms = await symptomsRecord.getSymptom({"_id": symptom_id})
                    if(symptoms["is_active"] === false){
                        msg = "symptoms activated"
                        symptoms["is_active"] = true
                    }else{
                        msg = "symptoms de_activated"
                        symptoms["is_active"] = false
                    }
                    let data = await symptomsRecord.editSymptom({"_id": symptom_id},symptoms);
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

    return {
        getAllSymptoms, addSymptom, viewSymptom, deleteSymptom, editSymptom, toggleSymptom
    }

}

module.exports = SymptomController
