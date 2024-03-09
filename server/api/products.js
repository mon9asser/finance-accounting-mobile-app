const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer'); 
const { create_connection } = require("./db");


var productsRouter = express.Router();

 
productsRouter.post("/category/add", async (req, res) => {
 
    var databaseModel = await create_connection(
        "M9n_15586516001317382000_c0xszhe3kyw", 
        {
            model:"model-name-and-go-there",
            schemaObject: {
                name: String,
                age: Number
            }
        }    
    )

    if(!databaseModel) {
       return res.send("you are not connected");
    }
    
    res.send("Connected");

});
 

productsRouter.get("/products/10 records", async (req, res) => {

});


module.exports = { productsRouter };