const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let sellerSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    address:{
        location: {
            type: Array,
            required: false,
        },
        place: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false
        },
        pin_code: {
            type: Number,
            required: false
        }
    },
    description: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
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
    collection: 'seller',
});

// Export the model
module.exports = mongoose.model('seller', sellerSchema);