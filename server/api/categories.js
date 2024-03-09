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

 
 
categoriesRouter.post("/test", async (req, res) => {
    
    var database = "Shos_18825771782163833000_7foly1ajjie";
    var document = "categories";
    var data_object = "";

    var core = await coreInsertRowByRow(
        database, document, data_object
    );

    res.send("Done +++")
});

 

module.exports = { categoriesRouter };