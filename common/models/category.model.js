let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let CategorySchema = new Schema({
        title: {
            type: String
        },
        description: {
            type: String
        },
        image: {
            type: String
        },
        parent_id: {
            type: Schema.Types.ObjectId,
        },
        is_active: {
            type: Boolean
        },
        is_deleted: {
            type: Boolean
        }
    }, {
        timestamps: {
            createdAt: '_created',
            updatedAt: '_updated'
        },
        collection: 'categories'
    });

    mongoose.model('categories', CategorySchema);
    return mongoose;
}

module.exports = Model
