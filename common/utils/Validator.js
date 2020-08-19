let validator = require('validatorjs');
let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Validator = function (MongoDB) {

    try {

        console.log("MongoDB", MongoDB)

        validator.registerAsync('exists', async (value, attributes, field_name, passes) => {

            try {
                let attr_bits = attributes.split(',');
                let model = attr_bits[0].toString();
                let db_field;
                if (attr_bits.length > 1) {
                    db_field = attr_bits[1].toString();
                } else {
                    db_field = field_name;
                }
                let filter = {};
                filter[db_field] = value;
                MongoDB.model(model)
                    .findOne(filter)
                    .exec((err, data) => {
                        if (err) {
                            passes(false, err.message);
                        } else {
                            if (data) {
                                passes(true);
                            } else {
                                passes(false, 'Given ' + db_field + ' does not exists in ' + model + 's list');
                            }
                        }

                    });
            } catch (e) {
                passes(false, e.message);
            }


        });

        validator.registerAsync('unique', async (value, attributes, field_name, passes) => {

            let attr_bits = attributes.split(',');
            let model = attr_bits[0].toString();

            if (attr_bits.length > 1) {
                var db_field = attr_bits[1].toString();
            } else {
                db_field = field_name;
            }

            let filter = {};
            filter[db_field] = value;

            MongoDB.model(model)
                .findOne(filter)
                .exec((err, data) => {
                    if (err) {
                        passes(false, err.message);
                    } else {
                        if (data) {
                            passes(false, 'Given ' + db_field + ' already exists in ' + model + 's list');
                        } else {
                            passes(true);
                        }
                    }

                });

        });

        validator.registerAsync('isPositive', async (value, attributes, field_name, passes) => {

            value = parseInt(value)
            if (value >= 0) {
                passes(true);
            } else {
                passes(false, 'Given ' + field_name + ' must be a positive integer');
            }

        });

        validator.registerAsync('objectId', async (value, attributes, field_name, passes) => {

            value = ObjectId.isValid(value);
            if (value) {
                passes(true);
            } else {
                passes(false, 'Given ' + field_name + ' is not a valid id');
            }

        });

        validator.registerAsync('array', async (value, attributes, field_name, passes) => {
            if (Array.isArray(value)) {
                if (attributes !== undefined) {
                    value.forEach((element) => {
                        if (attributes === "objectId") {
                            let temp = ObjectId.isValid(element)
                            if (!temp) {
                                passes(false, 'array value must be objectId');
                            } else {
                                passes(true)
                            }
                        } else if (attributes === "string") {
                            if (typeof element !== 'string') {
                                passes(false, 'array value must be string ');
                            } else {
                                passes(true)
                            }
                        } else if (attributes === "numeric") {
                            if (!Number.isInteger(element)) {
                                passes(false, 'array value must be numeric ');
                            } else {
                                passes(true)
                            }
                        }
                    });
                } else {
                    passes(true)
                }
            } else {
                passes(false, 'Given ' + field_name + ' is not a array');
            }
        });

    } catch (e) {
        throw e;
    }

    return validator;

}

module.exports = Validator