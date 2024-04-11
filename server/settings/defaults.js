 
const { create_connection, flat_schema_name } = require("../applications/db.js");
const {get_schema_object} = require("../applications/schema.js"); 
const {language} = require("../localize/language.js");

class Default_Values {

    constructor(database_name, langs) {
        
        (async() => {
            
            // assign database
            this.database = database_name;
            this.language = langs ? langs: "en";


            // Add default branch
            await this.storeDefaultBranch("branches");
            


        })();

    }

    Connect = async ( model ) => {

        var database = this.database; 

        var model_name = flat_schema_name(model);
        var schema_object = get_schema_object(model_name); 
        var db_connection = await create_connection(database, {
            model: model_name, 
            schemaObject:schema_object
        }); 
        
        if( ! db_connection ) {
            return false; 
        }

        return db_connection; 

    } 

    storeDefaultBranch = async (_model) => {
         
        var local_id = {
            local_id: "000000012345_default_branch"
        } 
 
        var connect = await this.Connect( _model );
        if(! connect ) return; 

        var getter = await connect.find(local_id);
        if( getter.length ) return; 

        // assign default value 
        const newPost = new connect({ 
            branch_name: language[this.language].default_branch,
            ...local_id
        });

        await newPost.save();  

    }

}

 
 
module.exports = { Default_Values };