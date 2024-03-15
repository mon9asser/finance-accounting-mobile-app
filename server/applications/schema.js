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

    prices: {
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
    },

    customers: {
        ...default_properties,
        customer_name: { type: String, default: ""},
        phone_number: { type: String, default: ""},
        gender: { type: String, default: ""},
        email_address: { type: String, default: ""},
        user_type: { type: Number, default: 0 }, // 0 => customer, 1 => supplier
        branch_id: { type: String, default: ""}, 
        note: { type: String, default: ""},
        thumbnail: { type: String, default: ""}
    },

    branches: {
        branch_name: { type: String, default: ""},
        branch_city: { type: String, default: ""},
        branch_address: { type: String, default: ""},
        branch_number: { type: String, default: ""},
        user_id: { type: String, default: ""},
        ...default_properties,
    }, 

    payment_methods: {
        payment_name: { type: String, default: "Cash"},
        payment_short_name: { type: String, default: "cash"},
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