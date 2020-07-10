let tmq = require("./rMQ.js");
let async = require('async');
let allModels = {};

let functions = {

    err_format: function (err) {
        return JSON.stringify(err, Object.getOwnPropertyNames(err))
    },

    model: function (name) {
        if (allModels[name] == undefined) {
            allModels[name] = require('../models/' + name + '.model');
        }
        return allModels[name];
    },

    paginate: function (model_name, filter, select, limit, page, sort) {

        return new Promise((resolve, reject) => {

            model = this.model(model_name);

            page = parseInt(page, 10);
            limit = parseInt(limit, 10);


            let async_tasks = [{
                task: model
                    .find(filter)
                    .select('_id')
                    .countDocuments(),
                key: 'stats'
            }, {
                task: model
                    .find(filter)
                    .limit(limit)
                    .skip((page - 1) * limit)
                    .sort(sort)
                    .select(select)
                    .exec(),
                key: 'docs'
            }];

            response_data = {
                docs: [],
                page: page,
                limit: limit,
                pages: 1,
                total: 1
            };

            async.each(async_tasks, (item, cb) => {
                item.task.then((data) => {
                    if (data != undefined) {
                        if (item.key == 'stats') {
                            response_data['total'] = data;
                            response_data['pages'] = Math.ceil(data / limit)
                        } else if (item.key == 'docs') {
                            response_data['docs'] = data
                        }
                    }
                    cb();
                })
                    .catch(cb);
            }, (err2) => {
                if (err2) {

                    reject(err2);
                }
                resolve(response_data);
            });


            return response_data

        })

    },
};

module.exports = functions;