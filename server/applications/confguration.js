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
    } 
    // device_info: {type: Object, default: {}},  // for next update
    // country_information: {type: Object, default: {}}, // for next update
});


let applicationSchema = new Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    subscription: {
        is_subscribed:  { type : Boolean , default: false }, 
        from_date:  { type : Date, default: ''  },
        to_date:  { type : Date, default: ''  },
        is_paid: { type : Boolean , default: false },  
        package: {
            value: { type : String , default: '' },  
            currency: { type : String , default: '' },  
        },
        api_key: { type : String , default: '' },   
        api_private: { type : String , default: '' },  
    },
    database_name: { type : String , default: '' },  
    company_name: { type : String , default: '' }  
});


var User = mongoose.model("users" , usersSchema );
var Application = mongoose.model("applications" , applicationSchema );

module.exports = {User, Application};