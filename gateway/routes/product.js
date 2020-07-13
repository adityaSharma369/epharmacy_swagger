var express = require('express');
var router = express.Router();


router.post('/list', function (req, res) {

    try {

        var search = req.body.search;
        var category_id = req.body.category_id;

        var _payload = {
            search: search,
            category_id:category_id
        };
        fn.Execute(req, _payload, "inventory.product.list", 10000).then((data, err) => {
            data = JSON.parse(data.toString());
            return res.respond(data);
        })
            .catch(res.err);

    } catch (e) {
        console.log(e)
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/listLite', function (req, res) {

    try {

        var category_id = req.body.category_id;

        var _payload = {
            category_id: category_id
        };

        fn.Execute(req, _payload, "inventory.category.listLite", 10000).then((data, err) => {
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

router.post('/add', function (req, res) {

    try {

        const rules = {
            title: 'required|min:1|max:100',
            description: 'required',
            price: "required",
            manufacturer: "required",
            categories: "required|array"
        };
        const validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            const title = req.body.title;
            const description = req.body.description;
            const price = req.body.price;
            const manufacturer = req.body.manufacturer;
            const categories = req.body.categories;

            const _payload = {
                title: title,
                description: description,
                price: price,
                manufacturer: manufacturer,
                is_visible: true,
                is_active: true,
                categories: categories
            }
            fn.Execute(req, _payload, "inventory.product.add", 10000).then((data, err) => {
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

router.post('/view', function (req, res) {

    try {

        var rules = {
            category_id: 'required'
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400});
        });

        validation.passes(async () => {
            let category_id = req.body.category_id;

            var _payload = {
                category_id: category_id
            };

            fn.Execute(req, _payload, "inventory.category.view", 1000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
            })
                .catch(res.err);
        });
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/edit', function (req, res) {

    try {

        const rules = {
            product_id:"required",
            categories: "array"
        };
        const validation = new validator(req.body, rules);
        validation.fails(() => {
            return res.respond({errors: validation.errors.errors, http_code: 400})
        });
        validation.passes(() => {
            const product_id = req.body.product_id
            const title = req.body.title;
            const description = req.body.description;
            const price = req.body.price;
            const manufacturer = req.body.manufacturer;
            const categories = req.body.categories;

            const _payload = {
                product_id:product_id,
                title: title,
                description: description,
                price: price,
                manufacturer: manufacturer,
                is_visible: true,
                is_active: true,
                categories: categories
            }
            fn.Execute(req, _payload, "inventory.product.edit", 10000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
            })
                .catch(res.err);
        });
    } catch (e) {
        console.log(e,"---------------------------------------------------")
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});

router.post('/delete', function (req, res) {

    try {

        var rules = {
            category_id: 'required'
        };

        var validation = new validator(req.body, rules);

        validation.fails(() => {
            return res.err({
                errors: validation.errors.errors,
                http_code: 400
            });
        });

        validation.passes(() => {
            var category_id = req.body.category_id;
            var _payload = {
                category_id: category_id,
            };
            fn.Execute(req, _payload, "inventory.category.delete", 1000).then((data, err) => {
                data = JSON.parse(data.toString());
                return res.respond(data);
            })
                .catch(res.err);
        });
    } catch (e) {
        return res.err({
            error: "something went wrong",
            http_code: 500
        });
    }


});


module.exports = router;
