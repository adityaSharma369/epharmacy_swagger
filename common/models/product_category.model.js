const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TokenSchema = new Schema({
	product_id: {
		type: Schema.Types.ObjectId,
		required: true
	},
	category_id: {
		type: Schema.Types.ObjectId,
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
module.exports = mongoose.model('product_category', TokenSchema);