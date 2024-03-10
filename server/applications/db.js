

const {conf} = require("../settings/config");
const {Application} = require("./confguration");
const mongoose = require('mongoose'); 

const flat_schema_name = ( modelName ) => {
    
    var model_name = modelName;
    var hyphen_index = modelName.indexOf("-")
    
    if( hyphen_index != -1 ) {
        model_name = modelName.replace(new RegExp("-", 'g'), "_")
    }

    return model_name;
}
// Connection pool to manage multiple connections
const connectionPool = {}; 

const create_connection = async (dbname, { model, schemaObject }) => {
   
    const model_name = flat_schema_name(model);

    // Check for the existence of the database in your application logic
    try {
        const dbExistence = await Application.find({ database_name: dbname });
        if (!dbExistence.length) return false;
    } catch (error) {
        console.error(error);
        return false;
    }

    // Check if a connection for this DB already exists in the pool
    if (connectionPool[dbname]) {
        // console.log(`Using existing connection for database: ${dbname}`);
        return connectionPool[dbname].model(model_name, new mongoose.Schema(schemaObject));
    }

    // Prepare the URL for a new connection
    const url = conf.server.database.dynamicUrl(dbname);

    // Create a new database connection
    const dbConnection = await mongoose.createConnection(url);

    // console.log(`New connection established to ${dbname}.`);

    // Store the connection in the pool
    connectionPool[dbname] = dbConnection;

    // Create and return the model
    return mongoose.models[model_name] || dbConnection.model(model_name, new mongoose.Schema(schemaObject));
};

module.exports = { create_connection, flat_schema_name };