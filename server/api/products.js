const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer'); 
const { create_connection } = require("../applications/db");


var productsRouter = express.Router();

 
productsRouter.post("/category/add", async (req, res) => {
    
     
});
  


module.exports = { productsRouter };