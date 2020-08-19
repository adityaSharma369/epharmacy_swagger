let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let ProductImageSchema = new Schema({
        product_id: {
            type: Schema.Types.ObjectId,
        },
        image: {
            type: String,
        },
        is_primary: {
            type: Boolean
        },
        sort_order: {
            type: Boolean
        }
    }, {
        timestamps: {
            createdAt: '_created',
            updatedAt: '_updated'
        },
        collection: 'product_images'
    });

    mongoose.model('product_images', ProductImageSchema);
    return mongoose;
}

module.exports = Model
