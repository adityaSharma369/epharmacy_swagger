const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrderSchems = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    agent_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    address: {
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
    total_price: {
        type: Number,
        required: false
    },
    delivery_charge: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    promo_code_discount: {
        type: Number,
        required: true
    },
    payment_status: {
        type: String,
        required: true
    },
    payment_type: {
        type: String,
        required: true
    },
    order_status: {
        type: String,
        required: true
    }
}, {
    strict: false,
    timestamps: {
        createdAt: '_created',
        updatedAt: '_updated'
    },
    collection: 'order',
});

// Address = {
//     location: {
//         type: Array,
//         required: false,
//     },
//     place: {
//         type: String,
//         required: false
//     },
//     city: {
//         type: String,
//         required: false,
//     },
//     state: {
//         type: String,
//         required: false
//     },
//     pin_code: {
//         type: Number,
//         required: false
//     }
// }

// Export the model
module.exports = mongoose.model('order', OrderSchems);