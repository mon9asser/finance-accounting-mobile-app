 
import {A_P_I_S} from "../cores/apis.js"; 
import {Models} from "../cores/models.js"; 
import { get_setting} from "../cores/settings.js";
import { get_lang } from "../languages";

import _ from 'lodash';

 
/**
 * 
 * 0 for products
 * 1 for expenses 
 * 
 */

class Customers extends A_P_I_S {

    constructor(props) {

        super(props); 
        this.Schema =  Models.customers;

    }

    /** Insert and update a record */
    create_update = async ({customer_name, phone_number,gender,email_address,user_type ,branch,address,thumbnail, file, param_id} = null ) => {
       
         console.log(branch);
        var _object =  { 
            customer_name: customer_name == undefined? "": customer_name ,
            phone_number: phone_number == undefined? "": phone_number ,
            gender: gender == undefined? "": gender ,
            email_address: email_address == undefined? "": email_address ,
            user_type : user_type == undefined? 0: user_type ,
            branch: branch == undefined? {}: branch ,
            address: address == undefined? "": address ,
            thumbnail: thumbnail == undefined? "": thumbnail ,
        };

        if( file != undefined ) {
            _object.file = file;
        }
        
        var param_value = null;

        if( typeof param_id != 'object' && param_id != null ) {
            _object = {
                ..._object,
                local_id: param_id
            }
            param_value = {
                local_id: param_id
            }
        }

        if( typeof param_id == 'object' && param_id != null ) {
            param_value = {...param_id};
        }  
          
        var asynced = await this.coreAsync(
            this.Schema,
            _object,
            param_value
        );
        
        // await this.bulkCoreAsync( this.Schema );

        return asynced;

    }
    
    // array data shouln't include meta data such as create by , updated by etc
    // use array data only and keep conside_flags as a false
    // case need to bulk insert from locally just do this:-
    /**
     * array_data = []; keep empty array 
     * consider_flags = true 
     */
    bulk_create_update = async(array_data, consider_flags = false) => {

        // getting settings and language
        var settings;

        try{
            settings = await get_setting(); 
        } catch(error){}
        
        var language =  get_lang(settings.language);

        if( ! Array.isArray(array_data) ) {
            return {
                login_redirect: false, 
                is_error: true, 
                data: [],
                message: language.array_data_required
            }
        }

        var core = await this.bulkCoreAsync(this.Schema, array_data, consider_flags )
        return core;

    }
    

    /**
     * Delete all records in database based on array of ids remotely and locally
     */
    delete_records = async (param_id = [] ) => {

        var param_value = Array.isArray(param_id) ? param_id : [];
 
        // getting all data 
        var reqs = await this.deleteAsync(this.Schema,param_value );

        return reqs; 

    }
    
    /**
     * paging = { page, size }
     * async: case true it will get data from remote and store it in locally
     */
    get_records = async(param_id = [], paging = {}, async = false, desc = true ) => {
 
        
        // getting settings and language
        var settings;

        try{
            settings = await get_setting(); 
        } catch(error){}
        
        var language =  get_lang(settings.language);


        var param_value = Array.isArray(param_id) ? param_id : []; 
        
        // get data from remote
        var async_data = await this.bulkGetAsync(this.Schema, async);
        var array_data = async_data.data;
        
        //var array_data = await this.get_data_locally(this.Schema);

        if( desc ) {
            // updated_date ( Desc Asc )
            // created_date ( Desc Asc )
            //  
            var filter_by = 'updated_date'
            if( desc !== true && typeof desc == 'string' ) {
                filter_by = desc;
            }
            
            array_data.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b[filter_by]) - new Date(a[filter_by]);
            });
              
        }

        //return _.chunk(array_data, 4 );
        if(param_id.length) {
            array_data = array_data.filter( x => {
                var index = param_id.indexOf(x.local_id);
                if( index != -1 ) {
                    return x;
                }
            });
        }
         
        if( paging.size !== undefined &&  paging.page !== undefined ) {

            if( paging.size < 1 ) {
                paging.size = 1;
            }

            paging.page = paging.page - 1;
            
            if(paging.page < 0 ) {
                paging.page = 0; 
            }
             
            var new_data = _.chunk(array_data, paging.size);
            

            var _return = (new_data[paging.page] == undefined) ?new_data[new_data.length - 1]: new_data[paging.page];
             
            if( _return == undefined ) {
                _return = [];
            }

            return {
                paging: {
                    page_number: paging.page + 1,
                    number_of_records: paging.size
                },
                login_redirect: false, 
                is_error: false, 
                data: _return,
                message: _return.length == 0? language.no_records: ""
            }

        }  

        return {
            login_redirect: false, 
            is_error: false, 
            data: array_data,
            message: array_data.length == 0 ? language.no_records: ""
        }
    }

     

}
 
var CustomerInstance = new Customers(); 
  

export { Customers, CustomerInstance };