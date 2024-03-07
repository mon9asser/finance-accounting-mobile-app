
import { get_lang } from "../languages";
import {generateId} from '../helpers';
import {get_setting} from './settings';
import {usr} from './user';

class A_P_I_S {
    
    constructor(prop) {  
        this.prop = prop;
    }
    
    sendRequest = async (database, document, data_object, id = null ) => {

         
        var objx = {
            is_error: true, 
            message: "",
            data: []
        }
        


        // check internet connection before requestion




        return objx;
    }

    getRequest = async () => {

        // check internet connection before requestion

    }

    /**
     * Update and insert data per one object 
     * locally and remotely
     */
    async coreAsync (  mobject, obj_data,  param_id = null ) {

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
            user_data = await usr.get_session();
            settings = await get_setting();
        } catch (error) {   }
         

        // Calling language object  
        var language = get_lang(settings.language); 
         
        
  
        /**
         * Build reponse object with default error 
         * case: 1 => uses session has expired 
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
            response.message = language.user_session_expired; 
            return response;
        }

        // Check if object property is not defined 
        if(mobject.key == undefined || mobject.instance == undefined) {
            response.message = language.api_error
            return response;
        } 

        // getting the records from storage 
        try {
            data = await mobject.instance.load({
                key: mobject.key
            }); 
        } catch (error) {}

         
        // send request to server for this record
        var remote = await this.sendRequest( user_data.database_name, mobject.key, obj_data,  param_id);
         
        // case it update 
        if( is_update_request && param_id != null ) {
            var objectIndex = data.findIndex( x => x.local_id == id );
            if( objectIndex != -1 ) {
                data[objectIndex] = {
                    ...obj_data,  
                    updated_date: Date.now(),
                    updated_by: {
                        id:  user_data.id,
                        name: user_data.name,
                        email: user_data.email 
                    },
                    remote_updated: remote.is_error? false: true
                }
            }
        } else {
            // push object data 
            var build = {
                ...obj_data,  
                local_id: id,
                updated_date: Date.now(),
                created_date: Date.now(),
                updated_by: {
                    id:  user_data.id,
                    name: user_data.name,
                    email: user_data.email 
                },
                created_by: {
                    id:  user_data.id,
                    name: user_data.name,
                    email: user_data.email 
                },
                remote_saved: remote.is_error? false: true
            };

            data.push(build);
        }

        // storing data in local storage 
        try {

            var is_saved = await mobject.instance.save({
                key: mobject.key,
                data: data
            }); 

            response.message = language.saved_success;
            response.case = 0;
            response.status = 1;
            response.data = is_saved;

            return response;

        } catch (error) {

            response.status = 1;
            response.case = 0;
            response.data = [];

            if(error.toString().includes('Quota exceeded')) {
                response.message = language.quota_exceeded
            } else {
                response.message = language.unexpected_error 
            }

            return response;
        }  

    } 

    /**
     * Getting new data from server and merge it 
     * with the local data according to exsitence
     */
    async getAllAsyncs ( mobject, obj_data ) {
        // getting data from remote server 
    }

    /**
     * Getting data from 
     */
    async getData( mobject ) {
 
        try { 

            var get_all = await mobject.instance.load({
                key: mobject.key
            });

            var response = {
                message: "",
                case: 0,
                status: 1, // 0 => error, 1 => success 
                data: get_all
            };

            return response;

        } catch (error) { 

            var response = {
                message: "",
                case: 0,
                status: 1, // 0 => error, 1 => success 
                data: []
            };

            return response;
            
        }

    }

}
 

export { A_P_I_S }