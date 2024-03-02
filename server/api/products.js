const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');




var productsRouter = express.Router();

 
 

productsRouter.get("/products/10 records", async (req, res) => {

});


module.exports = { productsRouter };