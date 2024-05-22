 
import {A_P_I_S} from "./cores/apis.js"; 
import {Models} from "./cores/models.js"; 
import { get_setting} from "./cores/settings.js";
import { get_lang } from "./languages";

import _ from 'lodash';

 
/**
 * 
 * 0 for products
 * 1 for expenses 
 * 
 */

class Options extends A_P_I_S {

    constructor(props) {

        super(props); 
        this.Schema =  Models.Options;

    }

    /** Insert and update a record */
    create_update = async ({ company_name, company_city, company_address, selected_currency, selected_language, vat_percentage, tax_percentage, shipping_cost, selected_branch, selected_paper_size_for_receipts, selected_paper_size_for_reports, sales_options, file }) => {
       
          
        var _object =  { 
            company_name: company_name == undefined ? "": company_name, 
            company_city: company_city == undefined ? "": company_city, 
            company_address: company_address == undefined? "": company_address,
            selected_currency: selected_currency == undefined? {}: selected_currency,
            selected_language: selected_language == undefined? {}: selected_language, 
            vat_percentage: vat_percentage == undefined? "0": vat_percentage, 
            tax_percentage: tax_percentage == undefined? "0": tax_percentage, 
            shipping_cost: shipping_cost == undefined ? "0": shipping_cost, 
            selected_branch: selected_branch == undefined ? "" : selected_branch, 
            selected_paper_size_for_receipts: selected_paper_size_for_receipts == undefined ? {}: selected_paper_size_for_receipts, 
            selected_paper_size_for_reports: selected_paper_size_for_reports == undefined? {}: selected_paper_size_for_reports, 
            sales_options: sales_options == undefined ? {
                enable_order_type: true,
                enable_payment_status: true,
                enable_payment_method: true,
                enable_tax: true,
                enable_vat: true,
                enable_shipping_cost: true,
                enable_tracking_number: true,
            }: sales_options 
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
          
        var asynced = await this.coreAsync2(
            this.Schema,
            _object,
            param_value
        );
        
        // await this.bulkCoreAsync( this.Schema );

        return asynced;

    }
     
    
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
 
var OptionInstance = new Options();

export { Options, OptionInstance };