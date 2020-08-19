const {makeRouteInvoker} = require('bottlejs-express');

module.exports.apiRouter = (dependencies, rmq) => {
    const productInvoker = makeRouteInvoker(dependencies, 'ProductController')
    const moleculeInvoker = makeRouteInvoker(dependencies, 'MoleculeController')
    const manufacturerInvoker = makeRouteInvoker(dependencies, 'ManufacturerController')
    const symptomInvoker = makeRouteInvoker(dependencies, 'SymptomController')
    const brandInvoker = makeRouteInvoker(dependencies, 'BrandController')
    const categoryInvoker = makeRouteInvoker(dependencies, 'CategoryController')

    rmq.routes = {
        'inventory.product.list': productInvoker('getAllProducts'),
        'inventory.product.add': productInvoker('addProduct'),
        'inventory.product.view': productInvoker('viewProduct'),
        'inventory.product.edit': productInvoker('editProduct'),
        'inventory.product.delete': productInvoker('deleteProduct'),
        'inventory.product.toggle': productInvoker('toggleProduct'),
        'inventory.product.uploadImage': productInvoker("uploadProductImage"),
        'inventory.product.makePrimaryImage': productInvoker("makePrimaryImage"),
        'inventory.product.productImages': productInvoker("productImages"),
        'inventory.product.deleteImage': productInvoker("deleteImage"),

        'inventory.molecule.list': moleculeInvoker('getAllMolecules'),
        'inventory.molecule.listLite': moleculeInvoker('moleculeListLite'),
        'inventory.molecule.add': moleculeInvoker('addMolecule'),
        'inventory.molecule.view': moleculeInvoker('viewMolecule'),
        'inventory.molecule.edit': moleculeInvoker('editMolecule'),
        'inventory.molecule.delete': moleculeInvoker('deleteMolecule'),
        'inventory.molecule.toggle': moleculeInvoker('toggleMolecule'),


        'inventory.manufacturer.list': manufacturerInvoker('getAllManufacturers'),
        'inventory.manufacturer.listLite': manufacturerInvoker('manufacturerListLite'),
        'inventory.manufacturer.add': manufacturerInvoker('addManufacturer'),
        'inventory.manufacturer.view': manufacturerInvoker('viewManufacturer'),
        'inventory.manufacturer.edit': manufacturerInvoker('editManufacturer'),
        'inventory.manufacturer.delete': manufacturerInvoker('deleteManufacturer'),
        'inventory.manufacturer.toggle': manufacturerInvoker('toggleManufacturer'),

        'inventory.symptom.list': symptomInvoker('getAllSymptoms'),
        'inventory.symptom.listLite': symptomInvoker('symptomListLite'),
        'inventory.symptom.add': symptomInvoker('addSymptom'),
        'inventory.symptom.view': symptomInvoker('viewSymptom'),
        'inventory.symptom.edit': symptomInvoker('editSymptom'),
        'inventory.symptom.delete': symptomInvoker('deleteSymptom'),
        'inventory.symptom.toggle': symptomInvoker('toggleSymptom'),

        'inventory.brand.list': brandInvoker('getAllBrands'),
        'inventory.brand.listLite': brandInvoker('brandListLite'),
        'inventory.brand.add': brandInvoker('addBrand'),
        'inventory.brand.view': brandInvoker('viewBrand'),
        'inventory.brand.edit': brandInvoker('editBrand'),
        'inventory.brand.delete': brandInvoker('deleteBrand'),
        'inventory.brand.toggle': brandInvoker('toggleBrand'),


        'inventory.category.list': categoryInvoker('getAllCategories'),
        'inventory.category.listLite': categoryInvoker('categoryListLite'),
        'inventory.category.add': categoryInvoker('addCategory'),
        'inventory.category.view': categoryInvoker('viewCategory'),
        'inventory.category.edit': categoryInvoker('editCategory'),
        'inventory.category.delete': categoryInvoker('deleteCategory'),
        'inventory.category.toggle': categoryInvoker('toggleCategory'),
        'inventory.category.linkProduct': categoryInvoker('linkProduct'),
        'inventory.category.unlinkProduct': categoryInvoker('unlinkProduct'),
        'inventory.category.getCategoryProducts': categoryInvoker('getCategoryProducts'),

    };

};
