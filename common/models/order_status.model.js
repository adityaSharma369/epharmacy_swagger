const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrderSchems = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    order_status:{
        type:String,
        required:true
    }
}, {
    strict: false,
    timestamps: {
        createdAt: '_created',
        updatedAt: '_updated'
    },
    collection: 'order_status',
});

// Export the model
module.exports = mongoose.model('order_status', OrderSchems);