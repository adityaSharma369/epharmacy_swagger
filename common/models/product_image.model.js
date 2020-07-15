const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProductImage = new Schema({
	product_id: {
		type: Schema.Types.ObjectId,
		required: true
	},
	image: {
		type: String,
		required: true
	},
    is_primary: {
		type: Boolean,
		required: true
	},
    priority: {
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
module.exports = mongoose.model('product_images', ProductImage);