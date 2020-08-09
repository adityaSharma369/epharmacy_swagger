let mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserModel = require('../models/user.model')
const TokenModel = require('../models/token.model')
const BrandModel = require('../models/brand.model')
const CategoryModel = require('../models/category.model')
const ManufacturerModel = require('../models/manufacturer.model')
const MoleculeModel = require('../models/molecule.model')
const ProductModel = require('../models/product.model')
const ProductImageModel = require('../models/product_image.model')
const SymptomModel = require('../models/symptom.model')

const MongoDB = function () {

    try {
        let db_uri = "mongodb";
        let db_name = "bhannu_pharmacy";
        let mongoDbUrl = "mongodb://" + db_uri + "/" + db_name

        mongoose = UserModel(mongoose);
        mongoose = TokenModel(mongoose);
        mongoose = BrandModel(mongoose);
        mongoose = CategoryModel(mongoose);
        mongoose = ManufacturerModel(mongoose);
        mongoose = MoleculeModel(mongoose);
        mongoose = ProductModel(mongoose);
        mongoose = ProductImageModel(mongoose);
        mongoose = SymptomModel(mongoose);

        mongoose.connect(mongoDbUrl, {useNewUrlParser: true, useUnifiedTopology: true}).then(result => {
            console.log("database connection successful .. ")
        });

    } catch (e) {
        throw e;
    }

    function model(name) {
        try {
            return mongoose.model(name);
        } catch (e) {
            throw e;
        }
    }

    return {
        model
    }

}

module.exports = MongoDB
