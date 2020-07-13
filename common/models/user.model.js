const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = Schema({
        username: {
            type: String
        },
        email: {
            type: String
        },
        password: {
            type: String
        },
        contact: {
            type: String
        },
        role: {
            type: String
        },
        isActive: {
            type: Boolean
        },
        profilePic: {
            type: String
        },
        oAuthId: {
            type: String
        },
        registrationType: {
            type: String
        },
        isMobileVerified: {
            type: Boolean
        },
        isEmailVerified: {
            type: Boolean
        },
    },
    {
        strict: false,
        timestamps: {
            createdAt: '_created',
            updatedAt: '_updated'
        },
        collection: 'user',
    })


UserSchema.plugin(paginator);
module.exports = mongoose.model('user', UserSchema);