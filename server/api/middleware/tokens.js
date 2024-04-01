const { language } = require("./../../localize/language");
const { conf } = require("./../../settings/config");
const jwt = require('jsonwebtoken');
let { User, Application } = require("./../../applications/confguration");

var verify_user_tokens_and_keys = async (req, res, next) => {
    
    // checking for language property 
    if( req.body.language == undefined ) {

        return res.send({
            is_error: true, 
            message: "language property is required!",
            data: [] 
        }); 

    }

    var current_language = req.body.language == undefined? "en": req.body.language; 
    var localize = language[current_language];

    var objx = {
        is_error: true,
        data: localize.access_denied,
        message: localize.something_error
    }; 
    

    // Verifying API Keys 
    var publicKey = req.header("X-api-public-key");
    var secretKey = req.header("X-api-secret-key");
    var user_token = req.header("X-api-tokens");

    if( secretKey === undefined || secretKey === "" || publicKey === undefined || publicKey === "" ) {
        
        objx.message = localize.access_denied
        return res.send(objx);
    } 
    
    if( publicKey !== conf.server.keys.public || secretKey !== conf.server.keys.secret ) {
        return res.send(objx);
    }   
    
    // Verify User Token 
    if( user_token === undefined ) {
        
        objx.message = localize.missing_token
        return res.send(objx);
    }   
    
    var isToken = await User.findOne({token: user_token});
     
    if( isToken == null ) {
        objx.message = localize.missing_token
        return res.send(objx);
    } 


    next(); 
}




 
module.exports = { verify_user_tokens_and_keys};