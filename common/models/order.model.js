let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let OrderSchema = new Schema({
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
        collection: 'orders'
    });

    mongoose.model('orders', OrderSchema);
    return mongoose;
}

module.exports = Model
