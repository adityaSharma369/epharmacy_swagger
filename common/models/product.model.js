let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let ProductSchema = new Schema({
        title: {
            type: String
        },
        price: {
            type: String
        },
        selling_price:{
            type: String
        },
        molecule_id: {
            type: Schema.Types.ObjectId
        },
        brand_id:{
            type: Schema.Types.ObjectId
        },
        manufacturer_id:{
            type: Schema.Types.ObjectId
        },
        description: {
            type: String
        },
        short_description: {
            type: String
        },
        tab_notes: [{
            title: String,
            description: String
        }],
        type: {
            type: String
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
        collection: 'products'
    });

    mongoose.model('products', ProductSchema);
    return mongoose;
}

module.exports = Model
