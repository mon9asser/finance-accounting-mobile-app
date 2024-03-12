
import { get_lang } from "../languages";
import {generateId} from '../helpers';
import {get_setting} from './settings'; 
import axios from "axios";
import {config} from './../../settings/config';
import {usr} from './../../objects/storage/user'
class A_P_I_S {
    
    constructor(prop) {  
        this.prop = prop;
    }

    
    // HTTP Request 
    axiosRequest = async ({ api, dataObject, method, headers, model_name } = null) => {
        
        var settings, user_data;
        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}

        var language =  get_lang(settings.language);
        
        
        // if session is expired generate a new one  
        if( ! Object.keys(user_data).length ) { 
            
            return {
                login_redirect: true, 
                message: language.user_session_expired, 
                is_error: true , 
                data: []
            };

        }  

        if( model_name == undefined ) {
            return {
                login_redirect: false, 
                message: language.something_error, 
                is_error: true , 
                data: []
            };
        }


        if( ( dataObject.data_object == undefined || typeof dataObject.data_object != 'object' ) && ( dataObject.data_array == undefined || ! Array.isArray(dataObject.data_array) )  ) {
            return {
                login_redirect: false, 
                message: language.required_data, 
                is_error: true , 
                data: []
            };
        }

         // assign default values for request 
         dataObject['language'] = settings.language;
         dataObject['database_name'] = user_data.database_name;
         dataObject['model_name'] = model_name;
        

        let options = {
            method: method, // Can be 'get', 'put', 'delete', etc.
            url: config.api(api), // 'api/application/login'
            data: dataObject,
            headers: {
                'Content-Type': 'application/json',
                'X-api-public-key': config.keys.public,
                'X-api-secret-key': config.keys.secret,
                'X-api-tokens': user_data.token  
            }
        };  

        if( headers !== undefined ) {
            Object.keys(headers).forEach((element) => {
                var key = element;
                var value = headers[key];
                options.headers[key] = value;
            });
        }


        var error_callback = (error) => {
            
            var message = language.something_error;
             
            if (error.response !== undefined && error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                message = language.api_connection_error;
                
            } else if (error.request !== undefined &&  error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                message = language.api_connection_error; 
                
            } else {
                // Something happened in setting up the request that triggered an Error
                message = language.check_internet_connection
            } 

            return {
                login_redirect: false, 
                message: message,
                is_error: true,
                data: []
            };

        }

        var success_callback = (response) => {
            return response.data; 
        }
 
        try {
            return axios(options)
                .then(success_callback)
                .catch(error => error_callback(error));
        } catch (error) {
            return error_callback(error)
        }
        


        return options;

    }

    /**
     * Core Async: Updates from local device to remote server 
     */
    async coreAsync( mobject, obj_data, parameter_id = null ) {
        
        // getting settings and language
        var settings, user_data, param_id, param_id_object, old_data;
        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}

        var language =  get_lang(settings.language);
        
        // getting user data and check for session expiration 
        if( ! Object.keys(user_data).length ) {
            return {
                login_redirect: true, 
                message: language.user_session_expired, 
                is_error: true , 
                data: []
            };
        }
        
        // checking for instance and key in mobject 
        var {key, instance} = mobject;
        if(key == undefined || instance == undefined) {
            return {
                login_redirect: false, 
                message: language.api_error, 
                is_error: true , 
                data: []
            };
        }
         
        // check if parameter id is not null so store it in given variables
        param_id = obj_data.local_id == undefined ? generateId(): obj_data.local_id; 
        if(parameter_id != null && typeof parameter_id != 'object') {
            param_id = parameter_id;
        }   
        if( typeof parameter_id == 'object' ) {
            if( parameter_id.local_id != undefined ) {
                param_id = parameter_id.local_id;
            }
        }

        param_id_object = {local_id:  param_id }
        if(parameter_id != null && typeof parameter_id == 'object') {
            param_id_object = {...parameter_id};
        } 
        

        // getting the records from storage 
        try {
            old_data = await instance.load({
                key: key
            }); 
        } catch (error) {}
        
        // preparing insertion data 
        var __object = {
            application_id:user_data.application_id,
            local_id: param_id,
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
            }
        }

        // build update object 
        if( obj_data.local_id != undefined || parameter_id != null ) {
            __object = {
                local_id: param_id,
                updated_date: Date.now(),
                updated_by: {
                    id:  user_data.id,
                    name: user_data.name,
                    email: user_data.email 
                },
            }
        }
        return __object;
        // check if it is update or insert process 

        // prepare data of remote server 

        // send request for remote server 

        // store data locally 

        // update data locally 

        // send response 

    }

}
 

export { A_P_I_S }