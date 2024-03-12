const mongoose = require('mongoose');

var default_properties = {
    updated_by: {
        id: { type: String, default: ""},
        name: { type: String, default: ""},
        email: { type: String, default: ""},
    },
    created_by: {
        id: { type: String, default: ""},
        name: { type: String, default: ""},
        email: { type: String, default: ""},
    },
    local_id:{ type: String, default: ""},
    updated_date: { type: Date, default: ""},
    created_date: { type: Date, default: ""},
    application_id: { type: String, default: ""},
   // _id: mongoose.Schema.Types.ObjectId 
};



var allSchema = {
    
    categories: {
        ...default_properties,     
        category_name:  { type: String, default: ""},
        app_name:  { type: Number, default: ""},
    },

    product_prices: {
        ...default_properties,     
        product_local_id:{ type: String, default: ""},
        name:{ type: String, default: ""},
        unit_name:{ type: String, default: ""},
        unit_short:{ type: String, default: ""},
        sales_price:{ type: String, default: ""},
        purchase_price: { type: String, default: ""},
        factor: { type: Number, default: ""},
        is_default_price: { type: Boolean, default: false},
    },

    products: {
        product_name: { type: String, default: ""},
        category_id: { type: String, default: ""},
        barcode: { type: String, default: ""},
        discount: {
            is_percentage: { type: String, default: ""},
            percentage: { type: String, default: ""},
            value: { type: String, default: ""}
        },
        thumbnail: { type: String, default: ""},
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