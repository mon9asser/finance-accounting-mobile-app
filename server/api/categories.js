const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer'); 
const { create_connection } = require("../applications/db");


var categoriesRouter = express.Router();

// getting all data by parameter 
// getting all data 
// getting data according to pages ( pagination )
// add data by one row 
// add bulk data in one time 
// update by one row 
// update bulk data by one request 
 

categoriesRouter.post("/category/update", verify_user_token, async (req, res) => {
    
     
});
categoriesRouter.post("/category/bulck-update", verify_user_token, async (req, res) => {
    
     
});

categoriesRouter.post("/category/insert", verify_user_token, async (req, res) => {
    
     
});

categoriesRouter.post("/category/bulck-insert", verify_user_token, async (req, res) => {
    
     
});

categoriesRouter.post("/category/:category_param", verify_user_token, async (req, res) => {
    
     
});

categoriesRouter.post("/category/page/:page_number/:nubmer_of_records", verify_user_token, async (req, res) => {
    
     
});

categoriesRouter.post("/category/all", verify_user_token, async (req, res) => {
    
     
});
  


module.exports = { categoriesRouter };