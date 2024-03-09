
var allSchema = {

}

var get_schema_object = ( schema_key ) => {
    
    if( allSchema[schema_key] == undefined ) {
        return {};
    }
    
    return allSchema[schema_key]
}


module.exports = {get_schema_object};