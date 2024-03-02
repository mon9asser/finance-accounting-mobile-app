const mongoose = require('mongoose'); 
const express = require("express");  
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');

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

const sendPassingCodeToEmail = (userObject, callback) => {
     

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
    var paragraph1 = `<p style='${pStyles}'>Hello ${userObject.email}</p>`;
    var paragraph2 = `<p style='${pStyles}'>Thank you for requesting the passcode to recover your account on Next Daily Sales™.</p>`
    var paragraph3 = `<p style='${pStyles}'>You simply need to copy and paste the passcode provided below into the next daily sales application</p>`
    var btnlink = `<b>${userObject.passing_code}</b>`;
    var paragraph4 = `<p style='${pStyles}'>Should you have any concerns, please do not hesitate to contact our support team. Thank you.</p>`;
    var paragraph5 = `<p style='color:blue;'>Happy Selling!</p>`;

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
        subject: "Next Daily Sales: Reset password", 
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

const verify_api_keys = ( req, res, next ) => {

    var objx = {
        is_error: true,
        data: "Access Denied !",
        success: false
    };

    var publicKey = req.header("X-api-public-key");
    var secretKey = req.header("X-api-secret-key");
    

    if( secretKey === undefined || secretKey === "" || publicKey === undefined || publicKey === "" ) {
        objx.data = "Access Denied !";

        return res.status(401).send(objx);
    }
 

    if( publicKey === conf.server.keys.public && secretKey === conf.server.keys.secret ) {
        next();
    } else {
        return res.status(401).send(objx);
    }
    

}



ApplicationRouter.post("/application/create", verify_api_keys, async (req, res) => {

    var objx = {
        is_error: true,
        data: "Access Denied !",
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
        objx.data = "Ensure you provide your name, email, and password for your account";

        return res.send(objx); 
       
    }


    //- Validate inputs 
    if( app_name == '' || app_name == undefined || platform == '' || platform == undefined || version == '' || version == undefined ) {
        objx.data = "Additional fields are needed such as app name, platform, and version";

        return res.send(objx); 
       
    }

    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "Invalid Email"; 
        return res.send(objx); 
    }
    
    var emailExists = await User.findOne({email: email, app_name: app_name  });
    if( emailExists !== null ) {
         
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "Your email already exists!"; 
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
        objx.data = "Your company name already exists, please login"; 
        return objx; 
    }

    // Create Application
    var _app = await Application.create(app_row);
    
    if( ! _app ) {
        objx.is_error= true,
        objx.data = "Something went wrong!",
        objx.success= false

        return res.send(objx);
     }

    // assign id to user object
    userObject.application_id = _app._id
    userObject.password = await bcrypt.hash(userObject.password, 10); 
    try {
        
        var build = _app._id + '-' + email + '-' + database;
        userObject.token = jwt.sign({token: build}, 'user-token-159752');
        
    } catch (error) { }

    // Create User 
    var _user = await User.create(userObject);
    if( ! _user ) {
       objx.is_error= true,
       objx.data = "Something went wrong!",
       objx.success= false
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


ApplicationRouter.post("/application/login", verify_api_keys, async (req, res) => {

    var objx = {
        is_error: true,
        data: "Access Denied !",
        success: false
    };

    // Data Validation   
    var email = req.body.email; 
    var password= req.body.password; 
    var app_name = req.body.app_name;
    console.log(email)
    console.log(password)
    console.log(app_name)
    //- Validate inputs 
    if( email == '' || email == undefined || password == '' || password == undefined || app_name == '' || app_name == undefined ) {
        objx.data = "Ensure you provide your email, and password for your account";

        return res.send(objx); 
       
    }
     
    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "Invalid Email"; 
        return res.send(objx); 
    }
    
    var useremail = await User.findOne({email: email, app_name: app_name});

    if( useremail === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "The email address you have entered does not exist in our records. Please proceed to create a new account!"; 
        return res.send(objx); 
    } 
    
    // check password and email 
    try {
        
        var compare = await bcrypt.compare(password, useremail.password);
        
        if( compare == false ) {
            objx.data = "The username or password entered is incorrect. Please check the information you entered and try again!";
            return res.send(objx);
        }

    } catch (e) {
        objx.data = "The username or password entered is incorrect. Please check the information you entered and try again!";
        return res.send(objx);
    }

    // store last login date
    useremail.last_login = currentTimeStampInSeconds();
    await useremail.save();

    var database = await Application.findOne({_id: useremail.application_id});
     
    if( database === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "Access to your company has been restricted; please reach out to our support team for assistance."; 
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


ApplicationRouter.post("/application/reset", verify_api_keys, async (req, res) => {

    var objx = {
        is_error: true,
        data: "Access Denied !",
        success: false
    };

    // Data Validation    
    var email = req.body.email; 
    console.log(email);
    //- Validate inputs 
    if( email == '' || email == undefined ) {
        objx.data = "Please ensure you provide your email address.";

        return res.send(objx); 
       
    }

    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "Invalid Email"; 
        return res.send(objx); 
    }
    
    var useremail = await User.findOne({email: email});

    if( useremail === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "The email address you have entered does not exist in our records. Please proceed to create a new account!"; 
        return res.send(objx); 
    } 
    
    // generate the passing code 
    var passing_code = charachters();
     
    // set the passing code into our database 
    useremail.passing_code = passing_code;
    var passing_code_sent = await useremail.save();

    // Sending passing code to user email 
    sendPassingCodeToEmail(passing_code_sent, function(isSent){
        // send the response here 
        if( isSent ) {
            objx.success= true;
            objx.is_error = false;
            objx.data = {
                message: "Please check your email inbox and copy-paste the passcode into the newly appeared field.",
                object: passing_code_sent,
            } 
             
        } else {
            objx.success= false
            objx.is_error = true;
            objx.data = "Something went wrong";
        }

        return res.send(objx);
    });

    
});
 
ApplicationRouter.post("/application/passcode-verify", verify_api_keys, async (req, res) => {

    var objx = {
        is_error: true,
        data: "Access Denied !",
        success: false
    };

    // Data Validation    
    var email = req.body.email; 
    var passcode = req.body.passcode; 

    //- Validate inputs 
    if( email == '' || email == undefined || passcode == '' || passcode == undefined ) {
        objx.data = "Ensure you provide the passcode and email";

        return res.send(objx); 
       
    }

    var validate = validateEmail(email); 
    if( !validate ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "Invalid Email"; 
        return res.send(objx); 
    }
    
    var useremail = await User.findOne({email: email});

    if( useremail === null ) { 
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "The email address you have entered does not exist in our records. Please proceed to create a new account!"; 
        return res.send(objx); 
    } 
    
    // verify the passcode
    if( passcode !== useremail.passing_code ) {
        objx.is_error = true; 
        objx.success = false; 
        objx.data = "It appears you have entered an incorrect passcode. Please provide the correct passcode."; 
        return res.send(objx); 
    }

    var app = await Application.findOne({_id: useremail.application_id});

    objx.is_error = false; 
    objx.success = true; 
    objx.message = "You have successfully verified the passcode."
    objx.data = {
        user: useremail,
        application: app
    }
    return res.send(objx); 

    
});

 ApplicationRouter.post("/application/change-password", verify_api_keys, async(req, res) => {
    
    var objx = {
        is_error: true,
        data: "Something Went Wrong!",
        success: false
    };


    if( !req.body.email || req.body.email == '' || !req.body.password || req.body.password == '' ) {
        objx.data = "It appears there is an unauthorized request. To address this issue, please follow the designated authentication process or contact support for assistance.";
        return res.send(objx);
    }
    
    var email = req.body.email;
    var newPass = req.body.password;

    var user = await User.findOne({email: email});

    if( user === null ) {
        objx.data = "This is an unauthorized request!, please follow the designated authentication process or contact support for assistance.";
        return res.send(objx);
    } else { 
        user.password = await bcrypt.hash(newPass, 10);
        user.passing_code = '';
        try {
            var responsed = await user.save(); 
            objx.is_error = false; 
            objx.data = "You have successfully saved your new password, you can use it to log into your account";
            objx.success = true; 
        } catch (error) {
            objx.data = "Something went wrong, please try later !";
            objx.is_error = true;
            objx.success = false;     
        }
        return res.send(objx);
    } 
    
});

module.exports =  { ApplicationRouter };