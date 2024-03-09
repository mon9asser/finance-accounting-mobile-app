const mongoose = require('mongoose');

var default_properties = {
    updated_by: {
        id: Number,
        name: String,
        email: String
    },
    created_by: {
        id: Number,
        name: String,
        email: String
    },
    local_id:String,
    updated_date: Date,
    created_date: Date,
    application_id: String,
    _id: mongoose.Schema.Types.ObjectId 
};



var allSchema = {
    
    categories: {
        ...default_properties,     
        category_name: String,
        app_name: Number
    },

    product_prices: {
        ...default_properties,     
        product_local_id:String,
        name:String,
        unit_name:String,
        unit_short:String,
        sales_price:String,
        purchase_price: String,
        factor: Number,
        is_default_price: Boolean
    },

    products: {
        product_name: String,
        category_id: String,
        barcode: String,
        discount: {
            is_percentage: String,
            percentage: String,
            value: String
        },
        thumbnail: String,
        ...default_properties,
    }

}

var get_schema_object = ( schema_key ) => {
    
    if( allSchema[schema_key] == undefined ) {
        return {};
    }
    
    return allSchema[schema_key];
}


module.exports = {get_schema_object};