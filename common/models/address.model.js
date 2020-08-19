const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = function (mongoose) {
    let Address = new Schema({
        title: {
            type: String,
            required: true
        },
        user_id: {
            type: Schema.Types.ObjectId,
            required: true
        },
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
        timestamps: {
            createdAt: '_created',
            updatedAt: '_updated'
        },
        collection: 'addresses',
    });
    mongoose.model('addresses', Address);
    return mongoose;
}

module.exports = Model
// Export the model
