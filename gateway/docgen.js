const swaggerJsDoc = require("swagger-jsdoc");
var fs = require('fs')

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "E - Pharmacy",
            description: "epharmacy APIs",
            version: "unknown",
            servers: ["https://epharmacyapi.tericsoft.com"],
        },
        host: "epharmacyapi.tericsoft.com",
        schemes: ['https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    apis: ['./modules/api/controllers/*.js'],

};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
let data = JSON.stringify(swaggerDocs)
fs.writeFileSync('swagger.json', data);
