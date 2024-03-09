

const {conf} = require("./../settings/config");
const {Application} = require("./../applications/confguration");
const mongoose = require('mongoose'); 

const create_connection = async (dbname, {model, schemaObject}) => {

    // generate hyphens with model name
    var model_name = model;
    var hyphen_index = model.indexOf("-")
    if( hyphen_index != -1 ) {
        model_name = model.replace(new RegExp("-", 'g'), "_")
    }
    
    // check if this database already exists in our application 
    var db_existence = [];
    
    try {
        db_existence = await Application.find({
            database_name: dbname     
        });
    } catch( error ) {}

    if(!db_existence.length) {
        return false;
    }

    // prepare options of database
    const url = conf.server.database.dynamicUrl(dbname);
    
    // create database connection 
    const dbConnection = await mongoose.createConnection(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Create Model Schema
    const MaSchema = new mongoose.Schema(schemaObject);

    // connect the model to database 
    var modelObject = dbConnection.model( model_name, MaSchema);

    // return the model
    return modelObject;
}

module.exports = { create_connection }