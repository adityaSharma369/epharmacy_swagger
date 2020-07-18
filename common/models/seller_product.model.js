const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let sellerProduct = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    is_active: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: {
        createdAt: '_created',
        updatedAt: '_updated'
    }
});

// Export the model
module.exports = mongoose.model('seller_product', sellerProduct);