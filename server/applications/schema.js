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
        category_id: {},
        barcode: { type: String, default: ""},
        discount: {
            is_percentage: { type: Boolean, default: false},
            percentage: { type: String, default: ""},
            value: { type: String, default: ""}
        },
        thumbnail: { type: String, default: ""}, 
        file: {type: {}, default: {}}, 
        ...default_properties,
    },

    customers: {
        ...default_properties,
        customer_name: { type: String, default: ""},
        phone_number: { type: String, default: ""},
        gender: { type: String, default: ""},
        email_address: { type: String, default: ""},
        user_type: { type: Number, default: 0 }, // 0 => customer, 1 => supplier
        branch_local_id: { type: {}, default: {}}, // => local id, id, name, country name, number  
        note: { type: String, default: ""},
        thumbnail: { type: String, default: ""}
    },

    branches: {
        branch_name: { type: String, default: ""},
        branch_country: { type: String, default: ""},
        branch_city: { type: String, default: ""},
        branch_address: { type: String, default: ""},
        branch_number: { type: String, default: ""}, 
        note: { type: String, default: ""}, 
        ...default_properties,
    }, 

    payment_methods: {
        payment_name: { type: String, default: "Cash"},
        payment_short_name: { type: String, default: "cash"},
        ...default_properties,
    },

    expenses: {
        name: { type: String, default: ""},
        category_local_id: { type: String, default: ""},
        branch_local_id: { type: String, branch_local_id: ""},
        cost: { type: String, default: ""},
        details: { type: String, default: ""}, 
        ...default_properties,
    },

    balances: {
        total_balance: { type: String, default: ""},
        payment_type_local_id: { type: String, default: ""},
        branch_local_id: { type: String, default: ""},
        ...default_properties,
    },

    /**
     * doc type => doc name
     * -1        => login
     * 1-        => register
     * 0        => branch
     * 3        => branch
     * 4        => branch
     * 5        => branch
     */
    log_history: {
        doc_type: { type: Number, default: -1}, // login  
        doc_local_id : { type: String, default: ""},  
        user_local_id: { type: String, default: ""}, 
        doc_name: { type: String, default: ""}, // Branch => branch as key in language object 
        describe_obj_key: { type: String, default: ""}, // language object key 
        ...default_properties,
    },

    notifications: {
        doc_type: { type: Number, default: -1}, 
        doc_local_id : { type: String, default: ""},
        doc_name: { type: String, default: ""},
        details: { type: String, default: ""},
        user_local_id: { type: String, default: ""},
        read_ids: { type: Array, default: []},
        ...default_properties,
    },

    document_status: {
        status_name: { type: String, default: -1}, 
        status_short_name : { type: String, default: ""}, 
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