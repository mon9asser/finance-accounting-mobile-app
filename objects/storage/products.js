import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get_response } from './../helpers.js';
import {A_P_I_S} from "./apis.js";
import {localization} from "./../storage/settings.js"; 
import {Categories} from "./categories"; // it already exended from A_P_I_S class 

class Products extends Categories {

    constructor (props) {
        
        super(props);
        
        this.products = {
            key: "products",
            instance: new Storage({
                size: 350,
                storageBackend: AsyncStorage,
                defaultExpires: null
            })
        } 

        this.product_prices = {
            key: "product-prices",
            instance:  new Storage({
                size: 220,
                storageBackend: AsyncStorage,
                defaultExpires: null
            })
        };   

    }

    create_product_price = async(
        product_local_id,
        name,
        unit_name,
        unit_short,
        sales_price,
        purchase_price,
        factor,
        is_default_price 
    ) => {

        // getting language
        var language = await localization();

        var objectdata = {
            product_local_id: product_local_id,
            name:name,
            unit_name:unit_name,
            unit_short:unit_short,
            sales_price: parseFloat(sales_price),
            purchase_price: parseFloat(purchase_price),
            factor: parseFloat(factor),
            is_default_price: is_default_price
        };

        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;

        var { data }  = await this.getData(this.product_prices); 
        var collected_string = `${product_local_id}${unit_name}${sales_price}${unit_short}`;
        var index = data.findIndex( x => {

            var to_be_checked = `${x.product_local_id}${x.unit_name}${x.sales_price}${x.unit_short}`;
            if( to_be_checked == collected_string ) {
                return x;
            }

        });

        // change primary state for other prices
        
        if( is_default_price && data.length ) {
            data.map(async item => {

                if( item.product_local_id == product_local_id ) {
                    if( item.is_default_price ) {
                        item.is_default_price = false;
                    }

                    await this.coreAsync(this.product_prices, item, {
                        product_local_id: item.product_local_id
                    });
                } 
                
            });
        }  

        if( index != -1 ) {
            response.message = language.price_exists;
            response.is_error= true; 
            response.data = data[index];
            return response;
        }

        var asyncRes = await this.coreAsync(this.product_prices, objectdata );
        if( asyncRes.status == 0 ) {
            response.data = asyncRes.case;
            response.message = asyncRes.message;
            response.is_error = true;
            return response; 
        }

        response.data = asyncRes.data;
        response.message = asyncRes.message;
        response.is_error = false;

        return response;

    }
    
    get_product_prices = async() => {
         
        // getting language
        var language = await localization(); 
        
        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;
        
        var {data}  = await this.getData(this.product_prices);   
        
        if( ! data.length ) {
            response.message = language.no_records; 
        } else {
            response.message = "";
        }

        response.is_error= false; 
        response.data = data;
        return response;   
    }
    
    delete_product_price = async( param_id /* {key:value}*/ ) => {
        
  
         // delete from all 
         var response = await this.deleteAsync(this.product_prices, param_id );
         
         return {
             is_error: response.status,
             data: response.data,
             message: response.message
         }



    }

    get_product_price_by_id = async(param_id) => {
        xxxxxxxxxxxxxxxx
        // getting language
        var language = await localization(); 
        
        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;
        response.data = [];

        var {data}  = await this.getData(this.product_prices, param_id);   
        
        if( ! data.length ) {
            response.message = language.no_records; 
            return;
        } 
        
        response.is_error = false; 
        response.message = "";
        response.data = data;
        return response;

    }
    
    update_product_price = async() => {} 
    get_products = async() => {}
    create_product = async() => {}
    delete_product = async() => {}
    get_product_by_id = async() => {}
    update_product = async() => {}
    
     

}

var ProductsInstance = new Products();

export { ProductsInstance };