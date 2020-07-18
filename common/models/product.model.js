const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProductSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    manufacturer: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    is_visible: {
        type: Boolean,
        required: true
    },
    is_active: {
        type: Boolean,
        required: true
    },
    is_deleted: {
        type: Boolean,
        required: true
    }
}, {
    strict: false,
    timestamps: {
        createdAt: '_created',
        updatedAt: '_updated'
    },
    collection: 'product',
});

// Export the model
module.exports = mongoose.model('product', ProductSchema);