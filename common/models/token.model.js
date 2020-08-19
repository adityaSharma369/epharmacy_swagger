let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let TokenSchema = new Schema({
        user_id: {
            type: Schema.Types.ObjectId,
        },
        token: {
            type: String
        }
    }, {
        timestamps: {
            createdAt: '_created',
            updatedAt: '_updated'
        },
        collection: 'tokens'
    });

    mongoose.model('tokens', TokenSchema);
    return mongoose;
}

module.exports = Model
