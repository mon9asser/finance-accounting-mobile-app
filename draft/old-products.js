import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get_response } from './../helpers.js';
import {A_P_I_S} from "./../cores/apis.js";
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
        {
            product_local_id,
            name,
            unit_name,
            unit_short,
            sales_price,
            purchase_price,
            factor,
            is_default_price 
        } = null
    ) => {

        // getting language
        var language = await localization();

        var objectdata = { };

        if( product_local_id != undefined && product_local_id != '' ) {
            objectdata["product_local_id"] = product_local_id
        }

        if( name != undefined && name != '' ) {
            objectdata["name"] = name
        }

        if( unit_name != undefined && unit_name != '' ) {
            objectdata["unit_name"] = unit_name
        }

        if( unit_short != undefined && unit_short != '' ) {
            objectdata["unit_short"] = unit_short
        }

        if( sales_price != undefined && sales_price != '' ) {
            objectdata["sales_price"] = parseFloat(sales_price)
        }

        if( purchase_price != undefined && purchase_price != '' ) {
            objectdata["purchase_price"] = parseFloat(purchase_price)
        }

        if( factor != undefined && factor != '' ) {
            objectdata["factor"] = parseFloat(factor)
        }

        if( is_default_price != undefined && is_default_price != '' ) {
            objectdata["is_default_price"] = is_default_price
        }

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
                
        // getting language
        var language = await localization(); 
        
        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;
        response.data = [];

        var reqs  = await this.getData(this.product_prices, param_id);   
         
        if(  !reqs.data.length ) { 
            response.message = language.no_records;  
        } 
        
        response.is_error = false;  
        response.data = reqs.data;
        return response;

    }
    
    update_product_price = async(
        param_id, 
        {
            name,
            unit_name,
            unit_short,
            sales_price,
            purchase_price,
            factor,
            is_default_price,
        } = null
    ) => {

        var param_data = {};
        var response = get_response();
        if( name != undefined && name != '') {
            param_data["name"] = name;
        }

        if( unit_name != undefined && unit_name != '') {
            param_data["unit_name"] = unit_name;
        }

        if( unit_short != undefined && unit_short != '') {
            param_data["unit_short"] = unit_short;
        }

        if( sales_price != undefined && sales_price != '') {
            param_data["sales_price"] = sales_price;
        }

        if( purchase_price != undefined && purchase_price != '') {
            param_data["purchase_price"] = purchase_price;
        }

        if( factor != undefined && factor != '') {
            param_data["factor"] = factor;
        }

        if( is_default_price != undefined && is_default_price != '') {
            param_data["is_default_price"] = is_default_price;
        }

        // make all other prices as no primary price 
        if(param_data.is_default_price) {

            // getting the product id from this id;
            var product_price = await this.get_product_price_by_id(param_id)
            if(product_price.data.length) {
                var product_id = product_price.data[0].product_local_id;
                var all_product_prices = await await this.getData(this.product_prices, { product_local_id: product_id });   
                if( all_product_prices.data.length ) {
                    all_product_prices.data.map(async item => {

                        if( item.is_default_price ) {
                            item.is_default_price = false;
                        }
    
                        await this.coreAsync(this.product_prices, item, {
                            product_local_id: item.product_local_id
                        });
                        
                    });
                }
            }
        }

        
        var asyncRes = await this.coreAsync(this.product_prices, param_data, param_id );
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


    get_products = async() => {

        // getting language
        var language = await localization(); 
    
        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;
        
        var {data}  = await this.getData(this.products);   
        
        if( ! data.length ) {
            response.message = language.no_records; 
        } else {
            response.message = "";
        }

        response.is_error= false; 
        response.data = data;
        return response; 

    }


    create_product = async({
        product_name,
        category_id,
        barcode,
        discount,
        thumbnail
    } = null ) => {

        // getting language
        var language = await localization();

        var pro_data = {};

        if(thumbnail != undefined && thumbnail != '' ) {
            pro_data["thumbnail"] = thumbnail;
        }

        if(product_name != undefined && product_name != '' ) {
            pro_data["product_name"] = product_name;
        }

        if(category_id != undefined && category_id != '' ) {
            pro_data["category_id"] = category_id;
        }
        
        if(barcode != undefined && barcode != '' ) {
            pro_data["barcode"] = barcode;
        }

        if(discount != undefined && discount != '' ) {
            pro_data["discount"] = {};
            if(discount.is_percentage != undefined && discount.is_percentage != '') {
                pro_data["discount"]['is_percentage'] = discount.is_percentage
            }
            if(discount.percentage != undefined && discount.percentage != '') {
                pro_data["discount"]['percentage'] = discount.percentage
            }
            if(discount.value != undefined && discount.value != '') {
                pro_data["discount"]['value'] = discount.value
            }
        }

        // Existing data values  
        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;

        var { data }  = await this.getData(this.products); 
        var collected_string = `${pro_data.product_name}${pro_data.category_id}`;
        var index = data.findIndex( x => `${x.product_name}${x.category_id}` == collected_string);
         
        if( index != -1 ) {
            response.message = language.product_exists;
            response.is_error= true; 
            response.data = data[index];
            return response;
        } 
        var asyncRes = await this.coreAsync(this.products, pro_data );
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

    delete_product = async( param_id /* {key:value}*/ ) => {
        

        // delete from all 
        var response = await this.deleteAsync(this.products, param_id );
        
        return {
            is_error: response.status,
            data: response.data,
            message: response.message
        }



    }

    get_product_by_id = async(param_id) => {
                
        // getting language
        var language = await localization(); 
        
        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;
        response.data = [];

        var reqs  = await this.getData(this.products, param_id);   
         
        if(  !reqs.data.length ) { 
            response.message = language.no_records;  
        } 
        
        response.is_error = false;  
        response.data = reqs.data;
        return response;

    }

    update_product = async(
            param_id, 
            {
                product_name,
                barcode,
                discount,
                thumbnail
            } = null
        ) => {
            
        var response = get_response();
         // getting language
         var language = await localization();

         var pro_data = {};
 
         if(thumbnail != undefined && thumbnail != '' ) {
            pro_data["thumbnail"] = thumbnail;
        }

        if(product_name != undefined && product_name != '' ) {
            pro_data["product_name"] = product_name;
        }
         
         if(barcode != undefined && barcode != '' ) {
             pro_data["barcode"] = barcode;
         }
 
         if(discount != undefined && discount != '' ) {
             pro_data["discount"] = {};
             if(discount.is_percentage != undefined && discount.is_percentage != '') {
                 pro_data["discount"]['is_percentage'] = discount.is_percentage
             }
             if(discount.percentage != undefined && discount.percentage != '') {
                 pro_data["discount"]['percentage'] = discount.percentage
             }
             if(discount.value != undefined && discount.value != '') {
                 pro_data["discount"]['value'] = discount.value
             }
         }

         
        
        var asyncRes = await this.coreAsync(this.products, pro_data, param_id );
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
    
     

}

var ProductsInstance = new Products();

export { ProductsInstance };
