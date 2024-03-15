const mongoose = require('mongoose'); 
const express = require("express");  
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');
const { language } = require("./../localize/language")
var ApplicationRouter = express.Router();
let { User, Application } = require("./confguration");
const { conf } = require("./../settings/config")
const currentTimeStampInSeconds = () => Math.floor(Date.now() / 1000);


const random = (min, max)  => {  
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const charachters = () => {
    return (Math.random()).toString(36).substring(2); 
}

// Helper Functions 
const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// => Localized  !
const sendPassingCodeToEmail = (userObject, lang, callback) => {
     
    var localize = language[lang];

    const transporter = nodemailer.createTransport(conf.email.settings);
    var h1Style = `color: #241c15;
    font-family: Georgia,Times,'Times New Roman',serif;
    font-size: 30px;
    font-style: normal;
    font-weight: 400;
    line-height: 42px;
    letter-spacing: normal;
    margin: 0;
    padding: 0;
    text-align: center;`;
    var pstyle =`color: #6a655f;
    font-family: 'Helvetica Neue',Helvetica,Arial,Verdana,sans-serif;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 42px;
    letter-spacing: normal;
    margin: 0;
    padding: 0;
    text-align: center;`;

    var pStyles = `color: #6a655f;
    font-family: 'Helvetica Neue',Helvetica,Arial,Verdana,sans-serif;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 42px;
    letter-spacing: normal;
    margin: 0;
    padding: 0;
    text-align: center;`;
    var aStyle = `color: white;
    background: #222;
    border-radius: 10px;
    padding: 7px 40px;
    font-weight: bold;
    margin: 0px 0;
    display: inline-block;
    text-decoration: none; 
    white-space: nowrap;`;

    var headline1 = `<h1 style='${h1Style}'>Next Daily Sales</h1>`;
    var paragraph1 = `<p style='${pStyles}'>${localize.hello} ${userObject.email}</p>`;
    var paragraph2 = `<p style='${pStyles}'>${localize.request_passcode_msg}</p>`
    var paragraph3 = `<p style='${pStyles}'>${localize.copy_paste_passcode}</p>`
    var btnlink = `<b>${userObject.passing_code}</b>`;
    var paragraph4 = `<p style='${pStyles}'>${localize.any_concern_text}.</p>`;
    var paragraph5 = `<p style='color:blue;'>${localize.happy_selling}</p>`;

    var body = `${headline1}
                ${paragraph1}
                ${paragraph2}
                ${paragraph3}
                ${btnlink}
                ${paragraph4}
                ${paragraph5}`; 

    var message = {
        from: conf.email.sender,
        to: userObject.email,
        subject: "Next Daily Sales: " + localize.reset_password, 
        html:body
    }; 

    transporter.sendMail(message, async function( error, info ){
        if (error) {
            callback( false );
        } else { 
            callback( true ); 
        }
    }); 
 
}

// => Localized  !
const verify_api_keys = ( req, res, next ) => {

    var current_language = req.body.language? req.body.language: "en";
    var localize = language[current_language];

    var objx = {
        is_error: true,
        data: localize.access_denied,
        success: false
    };

    var publicKey = req.header("X-api-public-key");
    var secretKey = req.header("X-api-secret-key");
    

    if( secretKey === undefined || secretKey === "" || publicKey === undefined || publicKey === "" ) {
        objx.data = localize.access_denied

        return res.send(objx);
    }
 

    if( publicKey === conf.server.keys.public && secretKey === conf.server.keys.secret ) {
        next();
    } else {
        return res.send(objx);
    }
    

}


// => Localized  !
ApplicationRouter.post("/application/create", verify_api_keys, async (req, res) => {

    var current_language = req.body.language? req.body.language: "en";
    var localize = language[current_language];

    var objx = {
        is_error: true,
        data: localize.access_denied,
        success: false
    };

    // Data Validation  
    var name = req.body.name;
    var email = req.body.email; 
    var password= req.body.password;
    var company_name = req.body.company_name; 

    // additional parameters needed 
    var app_name = req.body.app_name;
    var platform = req.body.platform;
    var version = req.body.version;

 
    //- Validate inputs 
    if( name == '' || name == undefined || email == '' || email == undefined || password == '' || password == undefined ) {
        objx.data = localize.provide_fields;

        return res.send(objx); 
       
    }


    //- Validate inputs 
    if( app_name == '' || app_name == undefined || platform == '' || platform == undefined || version == '' || version == undefined ) {
        objx.data = localize.additional_fields;

        return res.send(objx); 
       
    }

    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.invalid_email;
        return res.send(objx); 
    }
    
    var emailExists = await User.findOne({email: email, app_name: app_name  });
    if( emailExists !== null ) {
         
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.email_exists;
        return res.send(objx); 
    }
    
    // Sanitizsation 
    var userObject = {
        name: sanitizer.sanitize(name), 
        password: sanitizer.sanitize(password),
        email: sanitizer.sanitize(email),
        company_name: sanitizer.sanitize(company_name),
        register_date: currentTimeStampInSeconds(),
        last_login: currentTimeStampInSeconds(),
        platform: {
            platform, version
        }
    }
 

    // generate db name 
    var db_slug = "_" +  random(10, 19145488514777751452) + "_" +  charachters();
    var database = company_name.replaceAll(/\s/g,'');
    if( database !== '' ) {
        database += db_slug;
    } else {
        database = email.substring(0, email.indexOf("@")) + db_slug;
    }


    // prepare application
    var app_row = {
        database_name: database ,
        company_name: company_name
    }
   
    // check if database already exists 
    var databaseExists = await Application.findOne({database_name: database});
    if( databaseExists !== null ) {
        objx.data = localize.company_exists;
        return objx; 
    }

    // Create Application
    var _app = await Application.create(app_row);
    
    if( ! _app ) {
        objx.is_error= true;
        objx.data = localize.something_wrong;
        objx.success= false;

        return res.send(objx);
     }

    // assign id to user object
    userObject.application_id = _app._id
    userObject.password = await bcrypt.hash(userObject.password, 10); 
    try {
        
        var build = _app._id + '-' + email + '-' + database + userObject.last_login;
        userObject.token = jwt.sign({token: build}, 'nexy-daily-sales-#1#$%*31&528451^1%^');
        
    } catch (error) { }

    // Create User 
    var _user = await User.create(userObject);
    if( ! _user ) {
       objx.is_error= true;
       objx.data = localize.something_wrong;
       objx.success= false;
    }

    var usr = {
        user: _user,
        application: _app
    }

    objx.data = usr;
    objx.success = true;
    objx.is_error = false; 

    return res.send(objx);
});

// => Localized  !
ApplicationRouter.post("/application/login", verify_api_keys, async (req, res) => {

    var current_language = req.body.language? req.body.language: "en";
    var localize = language[current_language];

    var objx = {
        is_error: true,
        data: localize.access_denied,
        success: false
    };

    // Data Validation   
    var email = req.body.email; 
    var password= req.body.password; 
    var app_name = req.body.app_name;
    
    //- Validate inputs 
    if( email == '' || email == undefined || password == '' || password == undefined || app_name == '' || app_name == undefined ) {
        objx.data = localize.provide_fields;

        return res.send(objx); 
       
    }
     
    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.invalid_email; 
        return res.send(objx); 
    }
    
    var useremail = await User.findOne({email: email, app_name: app_name});

    if( useremail === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.email_not_exist;  
        
        return res.send(objx); 
    } 
    
    // check password and email 
    try {
        
        var compare = await bcrypt.compare(password, useremail.password);
        
        if( compare == false ) {
            objx.data = localize.incorrect_data;
            console.log(objx);
            return res.send(objx);
        }

    } catch (e) {
        objx.data = localize.incorrect_data;
        
        return res.send(objx);
    }

    // store last login date
    useremail.last_login = currentTimeStampInSeconds();
    await useremail.save();

    var database = await Application.findOne({_id: useremail.application_id});
     
    if( database === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.resricted_company; 
        return res.send(objx); 
    }
 

    var usr = {
        user: useremail,
        application: database
    }

    objx.data = usr;
    objx.success = true;
    objx.is_error = false; 

    return res.send(objx);
});

// => Localized !
ApplicationRouter.post("/application/reset", verify_api_keys, async (req, res) => {

    var current_language = req.body.language? req.body.language: "en";
    var localize = language[current_language];

    var objx = {
        is_error: true,
        data: localize.access_denied,
        success: false
    };

    // Data Validation    
    var email = req.body.email; 
    
    
    //- Validate inputs 
    if( email == '' || email == undefined ) {
        objx.data = localize.provide_fields;

        return res.send(objx); 
       
    }

    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.invalid_email; 
        return res.send(objx); 
    }
    
    var useremail = await User.findOne({email: email});

    if( useremail === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.email_not_exist; 
        return res.send(objx); 
    } 
    
    // generate the passing code 
    var passing_code = charachters();
     
    // set the passing code into our database 
    useremail.passing_code = passing_code;
    var passing_code_sent = await useremail.save();

    // Sending passing code to user email 
    sendPassingCodeToEmail(passing_code_sent, current_language, function(isSent){
        // send the response here 
        if( isSent ) {
            objx.success= true;
            objx.is_error = false;
            objx.data = {
                message: localize.passcode_msg,
                object: passing_code_sent,
            } 
             
        } else {
            objx.success= false
            objx.is_error = true;
            objx.data =  localize.something_wrong;
        }

        return res.send(objx);
    });

    
});
 
// => Localized !
ApplicationRouter.post("/application/passcode-verify", verify_api_keys, async (req, res) => {

    var current_language = req.body.language? req.body.language: "en";
    var localize = language[current_language];

    var objx = {
        is_error: true,
        data: localize.access_denied,
        success: false
    };

    // Data Validation    
    var email = req.body.email; 
    var passcode = req.body.passcode; 

    //- Validate inputs 
    if( email == '' || email == undefined || passcode == '' || passcode == undefined ) {
        objx.data = localize.provide_fields;

        return res.send(objx); 
       
    }

    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.invalid_email;
        return res.send(objx); 
    }
    
    var useremail = await User.findOne({email: email});

    if( useremail === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.email_not_exist;
        return res.send(objx); 
    } 
    
    // verify the passcode
    if( passcode !== useremail.passing_code ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = localize.wrong_passcode;
        return res.send(objx); 
    }

    var app = await Application.findOne({_id: useremail.application_id});

    objx.is_error = false; 
    objx.success = true; 
    objx.message = localize.passcode_verificated_success;
    objx.data = {
        user: useremail,
        application: app
    }
    return res.send(objx); 

    
});

//=> Localized !
 ApplicationRouter.post("/application/change-password", verify_api_keys, async(req, res) => {
    
    var current_language = req.body.language? req.body.language: "en";
    var localize = language[current_language];

    var objx = {
        is_error: true,
        data: localize.something_wrong,
        success: false
    };


    if( !req.body.email || req.body.email == '' || !req.body.password || req.body.password == '' ) {
        objx.data = localize.provide_fields;
        return res.send(objx);
    }
    
    var email = req.body.email;
    var newPass = req.body.password;

    var user = await User.findOne({email: email});

    if( user === null ) {
        objx.data = localize.user_not_found;
        return res.send(objx);
    } else { 
        user.password = await bcrypt.hash(newPass, 10);
        user.passing_code = '';
        try {
            var responsed = await user.save(); 
            objx.is_error = false; 
            objx.data = localize.password_changed;
            objx.success = true; 
        } catch (error) {
            objx.data = localize.something_wrong;
            objx.is_error = true;
            objx.success = false;     
        }
        return res.send(objx);
    } 
    
});

// subscripe api ( google api and apple store api )


module.exports =  { ApplicationRouter };