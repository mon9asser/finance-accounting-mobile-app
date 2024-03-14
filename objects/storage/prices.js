 
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

class Prices extends A_P_I_S {

    constructor(props) {

        super(props); 
        this.Schema =  Models.prices;

    }

    /** Insert and update a record */
    create_update = async ({product_local_id, name, unit_name, unit_short, sales_price, purchase_price, factor, is_default_price, param_id} = null ) => {
       
         
        var _object =  {
            product_local_id: product_local_id == undefined? -1: product_local_id ,
            name: name == undefined? "": name, 
            unit_name: unit_name == undefined? "": unit_name, 
            unit_short: unit_short == undefined? "": unit_short, 
            sales_price: sales_price == undefined? "": sales_price, 

            purchase_price: purchase_price == undefined? "": purchase_price, 
            factor: factor == undefined? 1: factor, 
            is_default_price: is_default_price == undefined? false: is_default_price, 
        };

        if(_object.product_local_id != -1 && _object.is_default_price ) {
            // change old data to be false
            var old_data = await this.get_records();
            
            if( old_data.length ) {
                old_data.map(async item => {
                    
                    if( item.product_local_id ==  _object.product_local_id ) {
                        item.is_default_price = false

                        await this.coreAsync(
                            this.Schema,
                            item,
                            item.local_id
                        ); 
                    } 
                });


            }
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
    get_records = async(param_id = [], paging = {}, async = false ) => {
 
        
        // getting settings and language
        var settings;

        try{
            settings = await get_setting(); 
        } catch(error){}
        
        var language =  get_lang(settings.language);
        
        
        // get data from remote
        await this.bulkGetAsync(this.Schema, async);

        var array_data = await this.get_data_locally(this.Schema);

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
                message: _return.length == 0? language.no_prices: ""
            }

        }  

        return {
            login_redirect: false, 
            is_error: false, 
            data: array_data,
            message: language.length == 0? language.no_prices: ""
        }
    }
 
}
 
var PriceInstance = new Prices(); 
  
 var callback = async() => {
    /* 
    var ii = await PriceInstance.create_update({
        product_local_id: "1452114",
        name: "Price 3",
        unit_name: "Killo",
        unit_short: "KG",
        sales_price: 230.00,
        purchase_price: 110.00,
        factor: 1,
        is_default_price: true
    })
    console.log(ii); */
    // alert("the problem is saving only ids in remote server, also didnt update old is_default_price")
    var records = await PriceInstance.get_records();
    console.log(records.data);
 };

 callback();

export { Prices, PriceInstance };



