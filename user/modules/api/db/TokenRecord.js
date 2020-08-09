let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

const TokenRecord = function (db) {

    async function addToken(tokenObject) {
        return new Promise((resolve, reject) => {
            try {
                let newToken = new db.model('tokens')(tokenObject);
                newToken.save().then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async function getToken(filter) {
        return new Promise((resolve, reject) => {
            try {
                db.model('tokens').find(filter).then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });

            } catch (e) {
                reject(e);
            }
        });
    }

    async function getTokens(filter) {
        return new Promise((resolve, reject) => {
            try {
                db.model('tokens').find().then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async function deleteToken(filter) {
        return new Promise((resolve, reject) => {
            try {
                db.model('tokens').remove(filter).then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async function editToken(token_id, userObj) {
        return new Promise((resolve, reject) => {
            try {
                db.model('tokens').update({_id: ObjectId(token_id)}, {$set: userObj}).then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    return {
        getToken, addToken, getTokens, deleteToken, editToken
    }

}

module.exports = TokenRecord
