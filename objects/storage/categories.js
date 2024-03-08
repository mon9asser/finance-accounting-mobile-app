import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get_response } from './../helpers.js';
import {A_P_I_S} from "./apis.js";
import {localization} from "./../storage/settings.js"; 


class Categories extends A_P_I_S {

    constructor(props) {

        super(props)
        
        this.categories = {
            key: "categories",
            instance: new Storage({
                size: 220,
                storageBackend: AsyncStorage,
                defaultExpires: null
            })
        } 

    }

    /**
     * 
     * 0 for products
     * 1 for expenses 
     * 
     */
    create_category = async (category_name, app_number) => {

        // getting language
        var language = await localization();

       
        var data = {
            category_name: category_name, 
            app_name: app_number
        };

        /**
         * prepare response object 
         *      is_error  
         *      message
         *      data
         */
        var response = get_response(); 
        response.is_error = true; 
        response.message = language.something_error;
        
        // check if this catgory already exists before saving and that 
        var isFound = await this.getData(this.categories); 
        if(!isFound.status) {
            response.message = language.category_doesnt_exists;
            response.is_error= true; 
            response.data = isFound[index];
            return response;
        }

        // getting current index 
        var index = isFound.data.findIndex( x => x.category_name == data.category_name && x.app_name == data.app_name );
         
        if( index != -1 ) {
            response.message = language.category_exists;
            response.is_error= true; 
            response.data = isFound[index];
            return response;
        }

        // create async
        /**
         * message:  
            case: 0,
            status: 0, // 0 => error, 1 => success 
            data: 
         */
        var asyncRes = await this.coreAsync(this.categories, data );
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

    update_category = async( category_name, app_number, local_id ) => {
        
        // getting language
        var language = await localization();

        var data = {
            category_name: category_name, 
            app_name: app_number
        };

        var response = get_response();
        var categories = await this.getData(this.categories);
        
        if(!categories.data.length) {
            response.message = language.category_doesnt_exists;
            response.is_error= true; 
            response.data = [];
            return response;
        }

        // search by id 
        var index =  categories.data.findIndex( x => x.local_id == local_id )
        if( index == -1 ) {
            response.message = language.category_doesnt_exists;
            response.is_error= true; 
            response.data = [];
            return response;
        }

        var asyncRes = await this.coreAsync(this.categories, data, local_id );
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

    delete_category = async ( local_id ) => {
        
        // getting language
        var language = await localization();

        var response = get_response(); 

        // check if this catgory already exists before saving and that 
        var d_a_t_a = await this.getData(this.categories);
        if( ! d_a_t_a.data.length ) {
            response.message = language.category_doesnt_exists;
            response.is_error= true; 
            response.data = [];
            return response;
        }

        var index = d_a_t_a.data.findIndex( x => x.local_id == local_id );
        if( index == -1 ) {
            response.message = language.category_doesnt_exists;
            response.is_error= true; 
            response.data = [];
            return response;
        } 

        // delete from all 
        var response = await this.deleteAsync(this.categories, local_id );
         
        return {
            is_error: response.status,
            data: response.data,
            message: response.message
        }

    }

    get_category_by_id = async (local_id) => {

       // getting language
       var language = await localization();
         
       var response = get_response(); 

       // check if this catgory already exists before saving and that 
       var d_a_t_a = await this.getData(this.categories);

       if( !d_a_t_a.data.length ) {
            response.message = language.category_doesnt_exists;
            response.is_error= true; 
            response.data = [];
            return response;
       }
        
       // getting current index 
        var index = d_a_t_a.data.findIndex( x => x.local_id == local_id );
         
        if( index == -1 ) {
            response.message = language.category_doesnt_exists;
            response.is_error= true; 
            response.data = [];
            return response;
        }  
        
        response.message = "";
        response.is_error= false; 
        response.data = d_a_t_a.data[index];
        return response;

    }

    get_categories = async( desc = false ) => {
        // getting language
        var language = await localization();
                
        var response = get_response(); 

        // check if this catgory already exists before saving and that 
        var d_a_t_a = await this.getData(this.categories);

        if( desc ) {
            d_a_t_a.data.sort((a,b) => {
                return new Date(b.created_date) - new Date(a.created_date);
            });
        }

        response.message = "";
        response.is_error= false; 
        response.data = d_a_t_a.data;
        return response;

    }
    

   

}
 
var CatInstance = new Categories();

export { Categories, CatInstance };