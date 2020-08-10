let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let CategoryProductSchema = new Schema({
        category_id: {
            type: Schema.Types.ObjectId,
        },
        product_id: {
            type: Schema.Types.ObjectId,
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
        collection: 'category_products'
    });

    mongoose.model('category_products', CategoryProductSchema);
    return mongoose;
}

module.exports = Model
