const {makeRouteInvoker} = require('bottlejs-express');

module.exports.apiRouter = (dependencies, rmq) => {
    const UserInvoker = makeRouteInvoker(dependencies, 'UserController')
    const AccountInvoker = makeRouteInvoker(dependencies, 'AccountController')
    const AddressInvoker = makeRouteInvoker(dependencies, 'AddressController')

    rmq.routes = {
        'user.account.register': AccountInvoker('register'),
        'user.account.login': AccountInvoker('login'),
        'user.account.logout': AccountInvoker('logout'),
        'user.account.checkLogin': AccountInvoker('checkLogin'),
        'user.account.getProfile': AccountInvoker('getProfile'),
        'user.account.editProfile': AccountInvoker('editProfile'),
        'user.account.getAddress': AccountInvoker('getAddress'),
        'user.account.addAddress': AccountInvoker('addAddress'),
        'user.account.editAddress': AccountInvoker('editAddress'),


        'user.list': UserInvoker('getAllUsers'),
        'user.listLite': UserInvoker('userListLite'),
        'user.add': UserInvoker('addUser'),
        'user.view': UserInvoker('viewUser'),
        'user.edit': UserInvoker('editUser'),
        'user.delete': UserInvoker('deleteUser'),
        'user.toggle': UserInvoker('toggleUser'),
        'user.uploadImage': UserInvoker('uploadImage'),

        'user.address.list': AddressInvoker('getAllAddresses'),
        'user.address.listLite': AddressInvoker('addressListLite'),
        'user.address.add': AddressInvoker('addAddress'),
        'user.address.view': AddressInvoker('viewAddress'),
        'user.address.edit': AddressInvoker('editAddress'),
        'user.address.delete': AddressInvoker('deleteAddress'),
        'user.address.toggle': AddressInvoker('toggleAddress'),
        'user.address.makePrimaryAddress': AddressInvoker('makePrimaryAddress'),

    };

};
