let mg = require('mongoose');
const Schema = mg.Schema;

const Model = function (mongoose) {
    let UserSchema = new Schema({
        name: {
            type: String
        },
        email: {
            type: String
        },
        password:{
            type: String
        },
        phone: {
            type: String
        },
        role:{
            type: String
        },
        description: {
            type: String
        },
        age: {
            type: Number
        },
        gender: {
            type: String
        },
        membership_type:{
            type: String
        },
        is_phone_verified: {
            type: Boolean
        },
        is_email_verified: {
            type: String
        },
        image:{
            type: String
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
        collection: 'users'
    });

    mongoose.model('users', UserSchema);
    return mongoose;
}

module.exports = Model
