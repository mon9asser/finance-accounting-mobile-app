
import { get_lang } from "../languages";
import {generateId} from '../helpers';
import {get_setting} from './settings';
import {get_session} from './user';

class A_P_I_S {
    
    constructor(prop) {  
        this.prop = prop;
    }
    
    /**
     * Update and insert data per one object 
     * locally and remotely
     */
    async coreAsync ( database_name, mobject, obj_data,  param_id = null ) {

        var id = param_id;
        var is_update_request = true; 
        var data = [];
        var user_data = {};
        var settings = {};

        // Generate an id 
        if( id == null ) {
            is_update_request = false;
            id = generateId();
        }
        
        // getting user data object from session 
        try {
            user_data = await get_session();
            settings = await get_setting();
        } catch (error) { }
 
        // Calling language object  
        var language = get_lang(settings.language); 
         
  
        /**
         * Build reponse object with default error 
         * case: 1 => uses session not found 
         */
        var response = {
            message: language.something_error,
            case: 0,
            status: 0, // 0 => error, 1 => success 
            data: []
        };

        // case user session is empty should return error 
        if( ! Object.keys(user_data).length ) {
            response.case = 1; 
            response.message = language.xxxxxxxx; 
            return response;
        }

        // Check if object property is not defined 
        if(mobject.key == undefined || mobject.instance == undefined) {
            response.message = language.api_error
            return response;
        } 

        // getting the last array from stoage 
        try {
            data = await mobject.instance.load({
                key: mobject.key
            }); 
        } catch (error) {}

        // case it update 
        if( is_update_request && param_id != null ) {
            var objectIndex = data.findIndex( x => x.local_id );
            if( objectIndex != -1 ) {
                data[objectIndex] = {
                    ...obj_data,  
                    date_update: Date.now(),
                    updated_by: {},
                    remote_updated: false
                }
            }
        } else {
            // push object data 
        }

        // case it save 

    }

}
 

export { A_P_I_S }