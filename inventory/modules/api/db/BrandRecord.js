let mongoose = require('mongoose');
let async = require('async');
const ObjectId = mongoose.Types.ObjectId

const BrandRecord = function (db) {

    async function addBrand(filterObj) {
        return new Promise((resolve, reject) => {
            try {
                let newBrand = new db.model('brands')(filterObj);
                newBrand.save().then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async function getBrand(filterObj) {
        return new Promise((resolve, reject) => {
            try {
                db.model('brands').findOne(filterObj).then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });

            } catch (e) {
                reject(e);
            }
        });
    }

    async function getBrands(filter) {
        return new Promise((resolve, reject) => {
            try {
                db.model('brands').find(filter).then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async function deleteBrand(id) {
        return new Promise((resolve, reject) => {
            try {
                db.model('brands').remove({_id: ObjectId(id)}).then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async function editBrand(filter, dataObj) {
        return new Promise((resolve, reject) => {
            try {
                db.model('brands').updateOne(filter, {$set: dataObj}).then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async function paginate(filter, select, limit, page, sort) {

        return new Promise((resolve, reject) => {
            try {
                let model = db.model("brands");
                let response_data = {
                    docs: [],
                    page: page,
                    limit: limit,
                    pages: 1,
                    total: 1
                };
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
                async.each(async_tasks, (item, cb) => {
                    item.task.then((data) => {
                        if (data !== undefined) {
                            if (item.key === 'stats') {
                                response_data['total'] = data;
                                response_data['pages'] = Math.ceil(data / limit)
                            } else if (item.key === 'docs') {
                                response_data['docs'] = data
                            }
                        }
                        cb();
                    })
                }, (err2) => {
                    if (err2) {
                        reject(err2);
                    }
                    resolve(response_data);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    return {
        getBrand, addBrand, getBrands, deleteBrand, editBrand, paginate
    }

}

module.exports = BrandRecord
