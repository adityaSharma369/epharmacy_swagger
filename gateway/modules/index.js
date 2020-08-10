const {makeRouteInvoker, makeMiddlewareInvoker} = require('bottlejs-express');

const middleware = require('../modules/api/middleware')


module.exports.apiRouter = (dependencies, app) => {
    const DefaultController = makeRouteInvoker(dependencies, 'DefaultController');
    const UserInvoker = makeRouteInvoker(dependencies, 'UserController')
    const AccountInvoker = makeRouteInvoker(dependencies, 'AccountController')
    const ProductInvoker = makeRouteInvoker(dependencies, 'ProductController')
    const MoleculeInvoker = makeRouteInvoker(dependencies, 'MoleculeController')
    const ManufacturerInvoker = makeRouteInvoker(dependencies, 'ManufacturerController')
    const SymptomInvoker = makeRouteInvoker(dependencies, 'SymptomController')
    const BrandInvoker = makeRouteInvoker(dependencies, 'BrandController')

    middleware.AttachRequestHelpers(dependencies, app)


    app.post('/api/account/register', AccountInvoker('register'));
    app.post('/api/account/login', AccountInvoker('login'));
    app.get('/api/account/checkLogin', AccountInvoker('checkLogin'));

    middleware.ParseAuthToken(dependencies, app)

    app.get('/api/account/getProfile', AccountInvoker('getProfile'));
    app.post('/api/account/editProfile', AccountInvoker('editProfile'));
    app.post('/api/account/uploadImage',upload.single("image"),AccountInvoker("uploadPic"))

    app.post('/api/user/list', UserInvoker("getAllUsers"));
    app.post('/api/user/add', UserInvoker("addUser"));
    app.get('/api/user/view/:user_id', UserInvoker("viewUser"));
    app.post('/api/user/edit', UserInvoker("editUser"));
    app.get('/api/user/delete/:user_id', UserInvoker("deleteUser"));
    app.get('/api/user/toggle/:user_id', UserInvoker("toggleUser"));
    app.post('/api/user/uploadImage',upload.single("image"),UserInvoker("uploadImage"))

    app.post('/api/product/list', ProductInvoker("getAllProducts"));
    app.post('/api/product/add' , ProductInvoker("addProduct"));
    app.post('/api/product/edit', ProductInvoker("editProduct"));
    app.get('/api/product/delete/:product_id', ProductInvoker("deleteProduct"));
    app.get('/api/product/view/:product_id', ProductInvoker("viewProduct"));
    app.get('/api/product/toggle/:product_id', ProductInvoker("toggleProduct"));
    app.post('/api/product/uploadProductImage',upload.single("image"),ProductInvoker("uploadProductImage"));
    app.get('/api/product/makePrimaryImage/:product_image_id',ProductInvoker("makePrimaryImage"));
    app.get('/api/product/deleteImage/:product_image_id',ProductInvoker("deleteImage"));
    app.post('/api/product/productImages',ProductInvoker("productImages"));


    app.post('/api/molecule/list', MoleculeInvoker("getAllMolecules"));
    app.post('/api/molecule/add', MoleculeInvoker("addMolecule"));
    app.post('/api/molecule/edit', MoleculeInvoker("editMolecule"));
    app.get('/api/molecule/delete/:molecule_id', MoleculeInvoker("deleteMolecule"));
    app.get('/api/molecule/view/:molecule_id', MoleculeInvoker("viewMolecule"));
    app.get('/api/molecule/toggle/:molecule_id', MoleculeInvoker("toggleMolecule"));


    app.post('/api/manufacturer/list', ManufacturerInvoker("getAllManufacturers"));
    app.post('/api/manufacturer/add', ManufacturerInvoker("addManufacturer"));
    app.post('/api/manufacturer/edit', ManufacturerInvoker("editManufacturer"));
    app.get('/api/manufacturer/delete/:manufacturer_id', ManufacturerInvoker("deleteManufacturer"));
    app.get('/api/manufacturer/view/:manufacturer_id', ManufacturerInvoker("viewManufacturer"));
    app.get('/api/manufacturer/toggle/:manufacturer_id', ManufacturerInvoker("toggleManufacturer"));

    app.post('/api/symptom/list', SymptomInvoker("getAllSymptoms"));
    app.post('/api/symptom/add', SymptomInvoker("addSymptom"));
    app.post('/api/symptom/edit', SymptomInvoker("editSymptom"));
    app.get('/api/symptom/delete/:symptom_id', SymptomInvoker("deleteSymptom"));
    app.get('/api/symptom/view/:symptom_id', SymptomInvoker("viewSymptom"));
    app.get('/api/symptom/toggle/:symptom_id', SymptomInvoker("toggleSymptom"));

    app.post('/api/brand/list', BrandInvoker("getAllBrands"));
    app.post('/api/brand/add', BrandInvoker("addBrand"));
    app.post('/api/brand/edit', BrandInvoker("editBrand"));
    app.get('/api/brand/delete/:brand_id', BrandInvoker("deleteBrand"));
    app.get('/api/brand/view/:brand_id', BrandInvoker("viewBrand"));
    app.get('/api/brand/toggle/:brand_id', BrandInvoker("toggleBrand"));

};
