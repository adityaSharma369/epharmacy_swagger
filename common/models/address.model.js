const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Address = new Schema({
    "title": {
        type: String,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    lng: {
        type: String,
        required: true
    },
    full_address: {
        type: String,
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
    collection: 'address',
});

// Export the model
module.exports = mongoose.model('address', Address);