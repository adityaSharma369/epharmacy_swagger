const {makeRouteInvoker} = require('bottlejs-express');

module.exports.apiRouter = (dependencies, rmq) => {
    const UserInvoker = makeRouteInvoker(dependencies, 'UserController')
    const AccountInvoker = makeRouteInvoker(dependencies, 'AccountController')

    rmq.routes = {
        'user.account.register': AccountInvoker('register'),
        'user.account.login': AccountInvoker('login'),
        'user.account.checkLogin': AccountInvoker('checkLogin'),
        'user.account.getProfile': AccountInvoker('getProfile'),
        'user.account.editProfile': AccountInvoker('editProfile'),
        'user.list': UserInvoker('getAllUsers'),
        'user.add': UserInvoker('addUser'),
        'user.view': UserInvoker('viewUser'),
        'user.edit': UserInvoker('editUser'),
        'user.delete': UserInvoker('deleteUser'),
        'user.toggle': UserInvoker('toggleUser'),
        'user.uploadImage': UserInvoker('uploadImage'),
    };

};
