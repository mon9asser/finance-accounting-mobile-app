const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer'); 
const { create_connection, flat_schema_name } = require("../applications/db");
const {get_schema_object} = require("../applications/schema.js");
 
var coreInsertRowByRow = (database, model_schema_name, data_object, id = null) => {
    
    var schema_name = flat_schema_name(model_schema_name);
    var schema_object = get_schema_object(schema_name);
    
    console.log(schema_name);
    
}


module.exports = {coreInsertRowByRow};