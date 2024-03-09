const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer'); 
const {language} = require("./../localize/language.js");
const { create_connection, flat_schema_name } = require("../applications/db");
const {get_schema_object} = require("../applications/schema.js");
 
var coreInsertRowByRow = async (database, model_schema_name, data_object, id = null, lang = "en") => {
    
    // handling response 
    var response = {}; 

    // Replace dash or hyphen with underscore 
    var schema_name = flat_schema_name(model_schema_name);

    // get the schema object of each table ( model )
    var schema_object = get_schema_object(schema_name);
    
    // create database connection with user database 
    var db_connection = await create_connection(database, {
        model: schema_name, schemaObject:schema_object
    });
    
    // return false if connection error 
    if( ! db_connection ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = language[lang].services_disabled; 
        return response; 
    }
    
    // checking for document id 
    var finderObject = { local_id: data_object.local_id };
    if( id !== null ) {

        if( typeof id == 'object' ) {
            finderObject = {...id}; 
        }

        finderObject = { local_id: id };
    } 

    try {
        
        // check if document is already exists 
        var finder = await db_connection.findOne(finderObject);
        if( finder != null ) {
            // Update the document based on last updated date  
            if( finder.updated_date != data_object.updated_date ) {
                
                var updatedDocument = await db_connection.findOneAndUpdate(
                    {...finderObject},
                    { $set: data_object },
                    { new: true }
                );

                if (updatedDocument) {
                    response["data"] = [];
                    response["is_error"] = false;
                    response["message"] = language[lang].updated_successfully; 
                    return response; 
                } else {
                    response["data"] = [];
                    response["is_error"] = true;
                    response["message"] = language[lang].update_failed; 
                    return response; 
                }

            }

        } else {
            // insert a new document 
            var insertDoc = await db_connection.create(data_object);
            if(insertDoc.error) {
                response["data"] = [];
                response["is_error"] = true;
                response["message"] = language[lang].insert_error; 
                return response; 
            } else {
                response["data"] = insertDoc;
                response["is_error"] = false;
                response["message"] = language[lang].add_successfully; 
                return response; 
            }
        }

    } catch (error) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = language[lang].something_wrong; 
        return response; 
    }
    
    
}


module.exports = {coreInsertRowByRow};