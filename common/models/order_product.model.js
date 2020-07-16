const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrderItemSchems = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    product_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    product_title: {
        type: String,
        required: false
    },
    manufacturer: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    qty:{
        type: Number,
        required:true
    },
    price:{
        type: Number,
        required:true
    },
    discount:{
        type: Number,
        required:false
    },
    final_price:{
        type: Number,
        required:true
    }
}, {
    strict: false,
    timestamps: {
        createdAt: '_created',
        updatedAt: '_updated'
    },
    collection: 'order_item',
});

// Export the model
module.exports = mongoose.model('order_item', OrderItemSchems);