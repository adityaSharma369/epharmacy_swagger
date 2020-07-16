const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Address = new Schema({
    title: {
        type: String,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    location :{
        type: Array,
        required:false,
    },
    place:{
      type: String,
      required:false
    },
    city:{
        type: String,
        required: false,
    },
    state:{
        type: String,
        required:false
    },
    pin_code:{
        type: Number,
        required:false
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