const PORT = process.env.PORT;
const express = require('express');
const app = express();
const debug = require('debug')("api:index");
const dependencies = require('./dependencies')();
const modules = require('./modules');
const uuid = require('uuid');
const cors = require('cors');
multer = require('multer');
mime = require("mime");
path = require('path');
fs = require('fs');

app.use(cors());
app.use(express.json());
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        let ext = file.mimetype.split("/")[1]
        if(["jpeg","jpg","png","JPEG","JPG"].indexOf(ext) === -1){
            ext = "jpeg"
        }
        cb(null, uuid.v4() + '.' + ext);
    }
});

upload = multer({storage: storage});
app.use('/api/static', express.static(path.join(__dirname, 'uploads')));
modules.apiRouter(dependencies, app);
app.listen(PORT, () => debug(`Listening on ${PORT}!`));
