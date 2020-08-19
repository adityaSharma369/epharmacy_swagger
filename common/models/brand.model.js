let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let BrandSchema = new Schema({
        title: {
            type: String
        },
        description: {
            type: String
        },
        image: {
            type: Boolean
        },
        is_active: {
            type: Boolean
        },
        is_deleted: {
            type: Boolean
        }
    }, {
        timestamps: {
            createdAt: '_created',
            updatedAt: '_updated'
        },
        collection: 'brands'
    });

    mongoose.model('brands', BrandSchema);
    return mongoose;
}

module.exports = Model
