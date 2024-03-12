const express = require("express"); 
const bodyParser = require('body-parser');
const path = require("path"); 
const {conf} = require("./settings/config.js"); 


// Application Routers 
const {ApplicationRouter} = require("./applications/users.js");

// routers  
const { apiRouters } = require("./api/http.js")

var app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'); // => OPTIONS, PUT,
    res.header('Access-Control-Allow-Headers', 'Content-Type , ct-public-api-key, X-api-keys , X-api-app-name , X-app-token'); // X-Requested-With
    res.header('Access-Control-Allow-Credentials', true);
    next();
});


// => Application Router
app.use( conf.server.api, ApplicationRouter );
 



// => Database apis  
app.use( conf.server.api, apiRouters );




  

app.listen(conf.server.port, () => console.log(`The server is running on port ${conf.server.port}`));

 