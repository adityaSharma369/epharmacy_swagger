const MoleculeController = function (Validator, rabbitMQ, moleculesRecord) {

    async function getAllMolecules(req, res, next) {

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
                    let response = await moleculesRecord.paginate(filter, "", limit, page, "");
                    res.respond({http_code: 200, msg: 'list', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function addMolecule(req, res, next) {

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
                    let moleculesObject = {
                        "title": req.body["title"],
                        "description": req.body["description"],
                        "is_active":true,
                        "is_deleted":false,
                    };
                    let response = await moleculesRecord.addMolecule(moleculesObject);
                    res.respond({http_code: 200, msg: 'molecules added', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function viewMolecule(req, res, next) {

        try {
            let rules = {
                "molecule_id": "required|objectId|exists:molecules,_id"
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
                    let moleculesObject = {
                        "_id": req.body.molecule_id,
                    };
                    let response = await moleculesRecord.getMolecule(moleculesObject);
                    res.respond({http_code: 200, msg: 'molecules details', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function deleteMolecule(req, res, next) {

        try {
            let rules = {
                "molecule_id": "required|objectId|exists:molecules,_id"
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
                    let moleculesObject = {
                        "_id": req.body.molecule_id,
                    };
                    let response = await moleculesRecord.editMolecule(moleculesObject, {"is_deleted": true});
                    res.respond({http_code: 200, msg: 'molecules deleted', data: response})
                } catch (e) {
                    res.respond({http_code: 500, error: e.message})
                }
            });

        } catch (e) {
            res.respond({http_code: 500, error: e.message})
        }
    }

    async function editMolecule(req, res, next) {

        try {
            let rules = {
                'molecule_id': 'required|objectId|exists:molecules,_id',
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
                    let molecule_id = req.body["molecule_id"]
                    let molecules = await moleculesRecord.getMolecule({"_id": molecule_id})
                    if(req.body["title"] !== null){
                        molecules["title"] = req.body["title"]
                    }
                    if(req.body["description"] !== null){
                        molecules["description"] = req.body["description"]
                    }
                    let data = await moleculesRecord.editMolecule({"_id": molecule_id},molecules);
                    return res.respond({
                        http_code: 200,
                        msg: 'molecules edited',
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

    async function toggleMolecule(req, res, next) {

        try {
            let rules = {
                "molecule_id": "required|objectId|exists:molecules,_id"
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
                    let molecule_id = req.body.molecule_id
                    let msg = ""
                    let molecules = await moleculesRecord.getMolecule({"_id": molecule_id})
                    if(molecules["is_active"] === false){
                        msg = "molecules activated"
                        molecules["is_active"] = true
                    }else{
                        msg = "molecules de_activated"
                        molecules["is_active"] = false
                    }
                    let data = await moleculesRecord.editMolecule({"_id": molecule_id},molecules);
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
        getAllMolecules, addMolecule, viewMolecule, deleteMolecule, editMolecule, toggleMolecule
    }

}

module.exports = MoleculeController
