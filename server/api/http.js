const mongoose = require('mongoose'); 
const express = require("express"); 
var sanitizer = require('sanitizer');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');  
const { create_connection, flat_schema_name } = require("../applications/db.js");
const {language} = require("../localize/language.js");
const { verify_user_tokens_and_keys } = require("./middleware/tokens.js")
const {get_schema_object} = require("../applications/schema.js");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Files will be saved in the 'uploads' directory. Make sure it exists!
      const uploadsDir = "./uploads";
      if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir);
      }
      cb(null, uploadsDir);
    }, 
    filename: function (req, file, cb) {    
      // Name the file uniquely to avoid overwriting existing files
        req.body.exten = path.extname(file.originalname);

      // file.fieldname + '-' + Date.now() + path.extname(file.originalname)
      cb(null, req.body.name + path.extname(file.originalname) );
    } 
});

const upload = multer({ storage: storage });

  

var apiRouters = express.Router(); 

// upload.single('photo')
apiRouters.post("/upload_media", [upload.single('file'), verify_user_tokens_and_keys], async (req, res ) =>{
    
    
    var file_extension = req.body.exten || ".jpg";
    var image_name = req.body.name; 
    
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

    
    // stored image name 
    var image_name = `${image_name}${file_extension}`;
    var local_id = req.body.post_id;
    var pname = req.body.property_name;

    var updater = {};
    updater[pname] = image_name;
    var uptodate = await db_connection.findOneAndUpdate({local_id}, updater );
    res.send(uptodate);   

}); 
  



// add data by one row + update by one row 
apiRouters.post("/create_update", verify_user_tokens_and_keys, async (req, res ) => {
     

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
apiRouters.post("/bulk_create_update", verify_user_tokens_and_keys, async (req, res) => {
    
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

    var local_ids = data_array.map(item => {
        return {
            local_id: item.local_id
        }
    });
 

    //await db_connection

    const bulkOps = data_array.map(item => {
        
        // delete object _id to prevent errors or conflict 
        if(item._id != undefined ) {
            delete item._id
        } 

        return {
            updateOne: {
              filter: { local_id: item.local_id }, // Criteria to find the existing book
              update: { $set: item }, // Update existing book or set new book details
              upsert: true // Insert a new document if one doesn't exist
            }
        }
    });

  


    db_connection.bulkWrite(bulkOps)
    .then(async result => {

        // var inserted_ids = result.insertedIds == undefined? [] : Object.keys( result.insertedIds );
        var updated = await db_connection.find({
            $or: local_ids
        });
        
        var needed_ids = updated.map( item => {
            return {
                id: item._id,
                local_id: item.local_id,
                remote_updated: true, 
                remote_saved: true
            };
        });

         
        response["ids"] = needed_ids;
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

// Bulk deletion 
apiRouters.post("/bulk_deletion", verify_user_tokens_and_keys, async (req, res) =>{

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

    if( ! data_array.length ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.something_wrong; 
        return res.send(response); 
    }

    const deleteOps = data_array.map(item => ({
        deleteOne: {
          filter: { local_id: item.local_id } // Specify the criteria for deletion
        }
    }));

    db_connection.bulkWrite(deleteOps)
    .then(async result => {
 
        var needed_ids = data_array.map( item => {
            return { 
                local_id: item.local_id 
            };
        });

         
        response["ids"] = needed_ids;
        response["data"] = result;
        response["is_error"] = false;
        response["message"] = localize.deleted_successfully; 

        return res.send(response);

    })
    .catch(error => {
        response["data"] = error;
        response["is_error"] = true;
        response["message"] = localize.something_wrong; 
        return res.send(response);
    }); 

});

// getting all data with no parameter + with parameters + paging
apiRouters.post("/get", verify_user_tokens_and_keys, async (req, res) => {
   
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
    
    if(typeof param_id != 'object' && param_id != null ) {
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

// delete a record + bulk deletion 
apiRouters.post("/delete", verify_user_tokens_and_keys, async (req, res) => {
    
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

    if(req.body.param_id == undefined) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.param_id_is_required; 
        return res.send(response); 
    }
    
    // checking for param id 
    var param_id = req.body.param_id == undefined ? []: req.body.param_id;
    if(!Array.isArray(param_id)) {
        return {
            message: localize.array_data_required,
            is_error: true,
            data: [] 
        };
    }

    var parameters = { local_id: {$in: param_id} };
    /*
    if(typeof param_id != 'object' && param_id != null ) {
        param_id = {
            local_id: req.body.param_id
        };
    }else if ( param_id == null ) {
        param_id = {}
    }; */

    // check if data id is already exists 
    /*
    var finder = await db_connection.find(param_id);
    
    if( finder && finder.length == 0 ) {
        return res.send({
            is_error: false, 
            data: [], 
            message: localize.doesnt_exists 
        }); 
    }
    */
    db_connection.deleteMany(parameters)
    .then((obRes)=> {
         
        return res.send({
            is_error: false, 
            data: [], 
            message: localize.deletion_success
        });

    }).catch(error => {
        
        return res.send({
            is_error: true, 
            data: [], 
            message: localize.not_able_delete
        });

    });
    
});



// update all records based on keys 
apiRouters.post("/update_by_keys", verify_user_tokens_and_keys, async (req, res) => {
     
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
    if( req.body.param_id == undefined) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.param_id_is_required; 
        return res.send(response); 
    }

    var param_id = req.body.param_id;
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
    if( typeof param_id == 'string'  ) {
        param_id = { local_id: param_id };
    }
    
    let search = {};
    let keys = Object.keys(param_id);
    keys.forEach(key => {
        search[key] = { $gte: param_id[key] };
    });

    let new_update = {
        $set: data_object
    };
    
    try {

        var response = await db_connection.updateMany(search, new_update);
        if( response.acknowledged != undefined && response.acknowledged ) {
            return res.send({
                data: response ,
                message: localize.updated_successfully, 
                is_error: false 
            });
        } else {
            return res.send({
                data: "" ,
                message: localize.insert_error, 
                is_error: false 
            });
        }
         
    } catch(error) {
        return res.send({
            data: "" ,
            message: localize.insert_error, 
            is_error: false 
        });
     }
});
  


apiRouters.get("/", (req, res) => {
    res.send("Its working !")
})

module.exports = { apiRouters };