const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');  
const { create_connection, flat_schema_name } = require("../applications/db");
const {language} = require("./../localize/language.js");
const { verify_user_tokens_and_keys } = require("./middleware/tokens.js")
const {get_schema_object} = require("../applications/schema.js");

var categoriesRouter = express.Router();

 
 
// getting data according to pages ( pagination )
// delete data + delete bulk data 

 
// add data by one row + update by one row 
categoriesRouter.post("/category/create_update", verify_user_tokens_and_keys, async (req, res) => {
     
    // handling current language
    var current_language = req.body.language == undefined? "en": req.body.language; 
    var localize = language[current_language];
 
    //preparing response object 
    var response = {
        is_error: true, 
        data: [],
        message: localize.something_wrong
    }

    // Basics Of Each API: checking for database name and model 
    var database = req.body.database_name;
    var model = req.body.model_name;
    var param_id = req.body.param_id == undefined? -1: req.body.param_id;

    if( database == undefined || model == undefined ) {
        response.is_error = true;
        response.message = localize.peroperties_required;
        return res.send(response);
    }
     
    var model_name = flat_schema_name(model);
    var schema_object = get_schema_object(model_name);
    
    
    var db_connection = await create_connection(database, {
        model: model_name, 
        schemaObject:schema_object
    }); 
    
    if( ! db_connection ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.services_disabled; 
        return res.send(response); 
    } 

    // checking for data object 
    if( req.body.data_object == undefined ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.data_object_required; 
        return res.send(response); 
    }

    var data_object = req.body.data_object;

    var finderObject = { local_id: param_id };
    if( param_id == -1 ) {
        finderObject.local_id = data_object.local_id == undefined ? -1: data_object.local_id
    }

    if( typeof param_id == 'object' ) {
        finderObject = {...param_id}; 
    } 

    // build data object 
    var finder = await db_connection.findOne(finderObject);

    // insert data 
    if( finder == null ) {

        var insertDoc = await db_connection.create(data_object); 

        if(insertDoc.error) { 
            response["data"] = [];
            response["is_error"] = true;
            response["message"] = localize.insert_error; 
            
            return res.send(response); 
        } else {
            response["data"] = insertDoc;
            response["is_error"] = false;
            response["message"] = localize.add_successfully; 
            
            return res.send(response); 
        }

    } else {
        
        var updatedDocument = await db_connection.findOneAndUpdate(
            {...finderObject},
            { $set: data_object },
            { new: true }
        );

        if (updatedDocument) {
            response["data"] = updatedDocument;
            response["is_error"] = false;
            response["message"] = localize.updated_successfully; 
            
            return res.send(response); 
        } else {
            response["data"] = [];
            response["is_error"] = true;
            response["message"] = localize.update_failed; 
            
            return res.send(response); 
        }

    } 
});
 

// Bulk insert data + bulk update
categoriesRouter.post("/category/bulk_create_update", verify_user_tokens_and_keys, async (req, res) => {
    
    // handling current language
    var current_language = req.body.language == undefined? "en": req.body.language; 
    var localize = language[current_language];
 
    //preparing response object 
    var response = {
        is_error: true, 
        data: [],
        message: localize.something_wrong
    }

    // Basics Of Each API: checking for database name and model 
    var database = req.body.database_name;
    var model = req.body.model_name;
    var param_id = req.body.param_id == undefined? -1: req.body.param_id;

    if( database == undefined || model == undefined ) {
        response.is_error = true;
        response.message = localize.peroperties_required;
        return res.send(response);
    }
     
    var model_name = flat_schema_name(model);
    var schema_object = get_schema_object(model_name);
    
    
    var db_connection = await create_connection(database, {
        model: model_name, 
        schemaObject:schema_object
    }); 
    
    if( ! db_connection ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.services_disabled; 
        return res.send(response); 
    } 

   // checking for data array 
   if( req.body.data_array == undefined ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.data_array_required; 
        return res.send(response); 
    }

    var data_array = req.body.data_array;
    //await db_connection

    const bulkOps = data_array.map(item => ({
        updateOne: {
          filter: { local_id: item.local_id }, // Criteria to find the existing book
          update: { $set: item }, // Update existing book or set new book details
          upsert: true // Insert a new document if one doesn't exist
        }
    }));


    db_connection.bulkWrite(bulkOps)
    .then(result => {

        response["data"] = result;
        response["is_error"] = false;
        response["message"] = localize.updated_successfully; 

        return res.send(response);

    })
    .catch(error => {
        response["data"] = error;
        response["is_error"] = true;
        response["message"] = localize.something_wrong; 
        return res.send(response);
    }); 

});


// getting all data with no parameter + with parameters 
categoriesRouter.post("/category/get", verify_user_tokens_and_keys, async (req, res) => {
    
    // handling current language
    var current_language = req.body.language == undefined? "en": req.body.language; 
    var localize = language[current_language];
 
    //preparing response object 
    var response = {
        is_error: true, 
        data: [],
        message: localize.something_wrong
    }

    // Basics Of Each API: checking for database name and model 
    var database = req.body.database_name;
    var model = req.body.model_name;
    var param_id = req.body.param_id == undefined? -1: req.body.param_id;

    if( database == undefined || model == undefined ) {
        response.is_error = true;
        response.message = localize.peroperties_required;
        return res.send(response);
    }
     
    var model_name = flat_schema_name(model);
    var schema_object = get_schema_object(model_name);
    
    
    var db_connection = await create_connection(database, {
        model: model_name, 
        schemaObject:schema_object
    }); 
    
    if( ! db_connection ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.services_disabled; 
        return res.send(response); 
    } 

    // checking for param id 
    var param_id = req.body.param_id == undefined ? null: req.body.param_id;
    
    if(typeof param_id != 'object' || param_id != null ) {
        param_id = {
            local_id: req.body.param_id
        };
    }else if ( param_id == null ) {
        param_id = {}
    };

    // work with paging query 
    if( req.body.pagination != undefined && typeof req.body.pagination == 'object' ) {
        
        if( ! req.body.pagination.page || ! req.body.pagination.size ) {
            return res.send({
                data: [],
                is_error: true, 
                message: localize.pagination_property_required
            }); 
        }

        var page = parseInt(req.body.pagination.page);
        var size = parseInt(req.body.pagination.size);
        const skip = page > 0 ? ( ( page - 1 ) * size ) : 0;


        try {         
            
            var allData = await db_connection.find(param_id)
                         .skip(skip).limit(size);
            return res.send({
                paging: {
                    current: page,
                    rows: size,
                    skip: skip
                },
                data: allData,
                is_error: false,
                message: localize.data_get_success 
            });
        } catch (error) { 
            console.log(error);
            response["data"] = [];
            response["is_error"] = true;
            response["message"] = localize.no_data_found; 
            return res.send(response); 
        }
    }

    try {         
        var allData = await db_connection.find(param_id);
        response["data"] = allData;
        response["is_error"] = false;
        response["message"] = localize.data_get_success; 
        return res.send(response); 
    } catch (error) { 
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.no_data_found; 
        return res.send(response); 
    }

});


 

module.exports = { categoriesRouter };