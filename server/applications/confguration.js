const mongoose = require('mongoose');
const { conf } = require('./../settings/config');

// ${conf.database.host}:${conf.database.port}/${conf.database.name}
mongoose.connect(conf.server.database.url());
  
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// Add schema of (users and application )
let usersSchema = new Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    application_id: { type : String , default: ""}, 
    name: { type : String ,trim: true, default: "" },
    job: { type : String ,trim: true, default: "" },
    email: { type : String ,trim: true, default: "" },
    password: { type : String ,trim: true, default: "" },
    login_type: { type : String ,trim: true, default: "" },
    access_level_id: { type : Number , default: 1 },
    rule_id: { type : Number , default: -1 },
    registration_date: { type : Date ,trim: true, default: Date.now },
    last_login: { type : Date ,trim: true, default: Date.now },
    token: { type : String ,trim: true, default: "" },
    passing_code: { type : String ,trim: true, default: "" },
    app_name: { type : String , default: 'next_daily_sales' },
    platform: {
        platform:  { type : String , default: '' },
        version:  { type : String , default: '' }
    },

    branch_local_id:  {type : String , default: '*'}, // * all branches
    is_owner: { type : Boolean , default: true },
    // device_info: {type: Object, default: {}},  // for next update
    // country_information: {type: Object, default: {}}, // for next update
});


let applicationSchema = new Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    subscription: {
        is_subscribed:  { type : Boolean , default: false }, 
        is_expired:  { type : Boolean , default: true }, 
        payment_id: { type : String , default: '' },  // google api
        from_date:  { type : Date, default: ''  },
        to_date:  { type : Date, default: ''  },
        is_paid: { type : Boolean , default: false },  
        package: {
            package_id: { type : String , default: '' },  // google api
            value: { type : String , default: '' },  
            currency: { type : String , default: '' },  
        },
        api_key: { type : String , default: '' },   
        api_private: { type : String , default: '' },  
    },
    database_name: { type : String , default: '' },  
    company_name: { type : String , default: '' },  

    settings: {
        vat_management: {
            enable: { type : Boolean , default: false },
            tax_number: { type : String , default: "" },
            vat_percentage: { type : String , default: "" },
        },
        currency: {
            name: { type : String , default: "US Dollar" },
            short: { type : String , default: "USD" },
            flag: { type : String , default: "$" }
        },
        tracking_balance: { type : Boolean , default: true },
        tracking_inventory: { type : Boolean , default: true },
    }
});


var User = mongoose.model("users" , usersSchema );
var Application = mongoose.model("applications" , applicationSchema );

module.exports = {User, Application};