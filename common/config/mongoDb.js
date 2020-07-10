mongoose = require('mongoose');

const InItMongoDb = (db_name) => {
    mongoDbUrl = env.MONGO_BD_USER+"://"+env.MONGO_BD_HOST+"/"+db_name
    mongoose.connect(mongoDbUrl, {useNewUrlParser: true}).then(result => {
        console.log("======================================")
        console.log("DB CONNECTED")
        console.log("======================================")
    }).catch(err => console.log(err));
}

module.exports.InItMongoDb = InItMongoDb;