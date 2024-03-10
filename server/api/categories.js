const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer'); 
const { create_connection } = require("../applications/db");
const {coreInsertRowByRow} = require("../applications/core")

var categoriesRouter = express.Router();

// getting all data by parameter 
// getting all data 
// getting data according to pages ( pagination )
// add data by one row 
// add bulk data in one time 
// update by one row 
// update bulk data by one request 

 
 
categoriesRouter.post("/category/create", async (req, res) => {
    

    // => verify user token


    // prepare default object 
    var response = {
        is_error:true,
        message: language[lang].something_wrong,
        success: false,
        data: []
    };
    
    // => prepare parameters 
    var database = req.body.database_name;
    var model_name = req.body.model_name;
    var data_object =  req.body.data_object; 

    var param_id =  req.body.param_id; 
    var language =  req.body.language; 


    var core = await coreInsertRowByRow(
        database, 
        model_name, 
        data_object,
        param_id, 
        language
    );

    res.send(core);

});

 

module.exports = { categoriesRouter };