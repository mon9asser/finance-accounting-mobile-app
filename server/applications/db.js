









const {conf} = require("../settings/config");
const {Application} = require("./confguration");
const mongoose = require('mongoose'); 

const flat_schema_name = ( modelName ) => {
    
    var model_name = modelName;
    var hyphen_index = modelName.indexOf("-")
    
    if( hyphen_index != -1 ) {
        model_name = modelName.replace(new RegExp("-", 'g'), "_")
    }

    return model_name.toLowerCase();
}
// Connection pool to manage multiple connections
const connectionPool = {}; 

const create_connection = async (dbname, { model, schemaObject }) => {
    
    const model_name = flat_schema_name(model);

    // convert database to lower case 
    var database_name = dbname.toLowerCase();
    
    // Attempt to use an existing model if it's already been defined
    if (mongoose.models[model_name]) {
        console.log(`Reusing the model for: ${model_name}`);
        return mongoose.models[model_name];
    }

    // Verify database existence and handle errors accordingly
    try {
        const dbExistence = await Application.find({ database_name: database_name });
        if (!dbExistence.length) return false;
    } catch (error) {
        console.error(error);
        return false;
    }

    console.log(database_name);

    // Reuse existing database connection if available
    if (connectionPool[database_name]) {
        return connectionPool[database_name].model(model_name, new mongoose.Schema(schemaObject), model_name);
    }

    // Establish a new connection for the database
    const url = conf.server.database.dynamicUrl(database_name);
    const dbConnection = await mongoose.createConnection(url);
    connectionPool[database_name] = dbConnection;

    // Create and return the new model
    return dbConnection.model(model_name, new mongoose.Schema(schemaObject), model_name);
};

module.exports = { create_connection, flat_schema_name };