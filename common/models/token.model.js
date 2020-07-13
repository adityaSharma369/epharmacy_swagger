const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TokenSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		required: true
	},
	token: {
		type: String,
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
module.exports = mongoose.model('Token', TokenSchema);