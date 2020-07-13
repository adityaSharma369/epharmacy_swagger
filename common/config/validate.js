var ObjectId = require('mongoose').Types.ObjectId;
validator.registerAsync('exists', async (value, attributes, field_name, passes) => {

    let attr_bits = attributes.split(',');
    let model = attr_bits[0].toString();

    if (attr_bits.length > 1) {
        var db_field = attr_bits[1].toString();
    } else {
        db_field = field_name;
    }

    let filter = {};
    filter[db_field] = value;

    fn.model(model)
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

    fn.model(model)
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
        console.log("greater")
        passes(true);
    } else {
        console.log("less")
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

    value = Array.isArray(value);
    if (value) {
        passes(true);
    } else {
        passes(false, 'Given ' + field_name + ' is not a arrayy');
    }

});

