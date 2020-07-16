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
        email: 'required|email',
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

router.get('/addAddress', function (req, res) {
     try {

        var rules = {
            title: 'required|min:1|max:100',
            lat: 'required',
            lng: 'required',
            full_address: 'required|min:10',
        };
        var validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            var user_id = _currentUser._id
            var title = req.body.title;
            var lat = req.body.lat;
            var lng = req.body.lng;
            var full_address = req.body.full_address;

            var _payload = {
                user_id: user_id,
                title: title,
                lat: lat,
                lng: lng,
                full_address: full_address,
            };
            fn.Execute(req, _payload, "user.address.add", 10000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
            })
                .catch(res.err);
        });
    } catch (e) {
        console.log(e)
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }
});

router.post('/getAddress', function (req, res) {
     try {
            var user_id = _currentUser._id;
            var search = req.body.search();

            var _payload = {
                user_id: user_id,
                search:search
            };

            fn.Execute(req, _payload, "user.address.list", 10000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
            })
                .catch(res.err);
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }
});

module.exports = router;
