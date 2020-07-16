const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CategoryScema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    is_visible: {
        type: Boolean,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: false
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    priority: {
        type: Number,
        required: true,
    },
    is_primary: {
        type: Boolean,
        required: true
    },
    is_active: {
        type: Boolean,
        required: true
    }
}, {
    strict: false,
    timestamps: {
        createdAt: '_created',
        updatedAt: '_updated'
    },
    collection: 'category',
});

// Export the model
module.exports = mongoose.model('category', CategoryScema);