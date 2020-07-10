var express = require('express');
var router = express.Router();

router.post('/login', function (req, res) {
    var rules = {
        username: 'required',
        password: 'required'
    };

    var validation = new validator(req.body, rules);

    validation.fails(() => {
        return res.respond({
            http_code: 500,
            errors: validation.errors.errors,
        });
    });
    var payload = {
        "username": req.body.username,
        "password": req.body.password
    }
    fn.Execute(req, payload, 'user.account.login', 10000).then((data, err) => {
        data = JSON.parse(data);
        return res.respond(data);
    }).catch(res.err);
});

router.post('/register', function (req, res) {
    var rules = {
        email: 'required|email|unique:user',
        username: 'required',
        password: 'required'
    };

    var validation = new validator(req.body, rules);

    validation.fails(() => {
        return res.respond({http_code: 400, errors: validation.errors.errors, status: false});
    });
    var payload = {
        "email": req.body.email,
        "username": req.body.username,
        "password": req.body.password
    }
    fn.Execute(req, payload, 'user.account.register', 10000).then((data, err) => {
        data = JSON.parse(data);
        return res.respond(data);
    }).catch(res.err);
});

router.get('/checkLogin', function (req, res) {
    token = req.headers['authorization'];
    if (token === undefined) {
        return res.respond({"http_code": 400, "error": "Token invalid"});
    }
    fn.Execute(req, payload = {token: token.split(" ")[1]}, 'user.account.checkLogin', 10000).then((data, err) => {
        data = JSON.parse(data);
        return res.respond(data);
    }).catch(res.err);
});

router.get('/logout', function (req, res) {
    token = req.headers['authorization'];
    if (token === undefined) {
        return res.respond({"http_code": 400, "error": "Token invalid"});
    }
    fn.Execute(req, payload = {token: token.split(" ")[1]}, 'user.account.logout', 10000).then((data, err) => {
        data = JSON.parse(data);
        return res.respond(data);
    }).catch(res.err);
});


router.get('/getProfile', function (req, res) {
    userId = _currentUser._id;
    fn.Execute(req, payload = {userId: userId}, 'user.account.getProfile', 10000).then((data, err) => {
        data = JSON.parse(data);
        return res.respond(data);
    }).catch(res.err);
});

router.post('/editProfile', function (req, res) {
    userId = _currentUser._id;
    var payload = {
        userId: userId,
        username: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile,
    }
    fn.Execute(req, payload, 'user.account.editProfile', 10000).then((data, err) => {
        data = JSON.parse(data);
        return res.respond(data);
    }).catch(res.err);
});

module.exports = router;
