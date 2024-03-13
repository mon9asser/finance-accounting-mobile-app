
import { get_lang } from "../languages";
import {generateId} from '../helpers';
import {get_setting} from '../storage/settings'; 
import axios from "axios";
import {config} from '../../settings/config';
import {usr} from '../storage/user';

class A_P_I_S {
    
    constructor(prop) {  
        this.prop = prop;
    }

    
    // HTTP Request 
    axiosRequest = async ({ api, dataObject, method, headers, model_name } = null) => {
       /*
        return {
            is_error: true, 
            data: [], 
            message: ""
        }; */
        
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
        var settings, user_data, param_id, param_id_object, old_data, is_update;
        
        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}

        var language =  get_lang(settings.language);
        
        // getting user data and check for session expiration 
        if( user_data == null || ! Object.keys(user_data).length ) {
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
       
        
        if( typeof parameter_id == 'object' && parameter_id != null ) {
            if( parameter_id.local_id != undefined ) {
                param_id = parameter_id.local_id;
            }
        }
        
        param_id_object = {local_id:  param_id }
        if(parameter_id != null && typeof parameter_id == 'object') {
            param_id_object = {...parameter_id};
        }  
        
       
        // getting the records from storage 
       old_data = await this.get_data_locally(mobject);
        
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
        
        
        // check if it is update or insert process 
        var objectIndex = old_data.findIndex(x => {
                
            if( typeof param_id_object == 'object'  ) {
                var key__ = Object.keys(param_id_object)[0]; 
                return x[key__] == param_id_object[key__]; 
            }

            return x.local_id == param_id;

        });

        
        if( objectIndex == -1 ) {
            
            // check it is not update 
            is_update = false; 

        } else {

            // update an existing object 
            is_update = true; 
        }
        
       
        __object = {...__object, ...obj_data}; 
       
        // case it is update 
        if( (obj_data.local_id != undefined || parameter_id != null) && is_update && objectIndex == -1 ) {
            return {
                message: language.no_records,
                login_redirect: false, 
                data: [], 
                is_error: true 
            };
        } 
        
        // prepare data of remote server 
        var axiosOptions = { 
            api: "api/create_update", 
            dataObject: {
                data_object: __object,
                param_id: param_id_object
            }, 
            method: "post",  
            model_name: key
        };
         
        // send request for remote server 
        var request = await this.axiosRequest(axiosOptions); 
         
        // store data locally 
        if(  objectIndex != -1 ) {

           var updator = {

                ...old_data[objectIndex],
                ...__object,
                remote_updated: request.is_error? false: true,
                _id: request.data._id == undefined? "": request.data._id
           };

           old_data[objectIndex] = updator;

        } else {
            
            old_data.push({
                ...__object, 
                remote_saved: request.is_error? false: true,
                _id: request.data._id == undefined? "": request.data._id
            });

        }

        // update data locally 
        try {

            var is_saved = instance.save({
                key: key,
                data: old_data
            }); 

            return {
                message: language.saved_success,
                data: is_saved,
                is_error: false, 
                login_redirect: false
            }

        } catch (error) {
            
            var message = language.something_error;

            if(error.toString().includes('Quota exceeded')) {
                message = language.quota_exceeded
            } else {
                message = language.unexpected_error 
            }

            return {
                message: message,
                data: [],
                is_error: true, 
                login_redirect: false
            }

        }

        // send response 
        // return __object;
    }

    /**
     * Delete Async: for two sides ( remotely and locally ) 
     */
    async deleteAsync( mobject, parameter_id ) {

        // getting settings and language
        var settings, user_data, param_id;
        param_id = Array.isArray(parameter_id)? parameter_id: [];

        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}
        
        var language =  get_lang(settings.language);
        
        // getting user data and check for session expiration 
        if( user_data == null || ! Object.keys(user_data).length ) {
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
        
        
        // delete data remotely 
        var request = await this.axiosRequest({ 
            api: "api/delete", 
            dataObject: {
                data_object: {},
                param_id: param_id
            }, 
            method: "post",  
            model_name: key
        }); 
        
        /**----------------- */
        var old_data = await this.get_data_locally(mobject);
        
        if( old_data.length == 0 ) {
            return {
                login_redirect: false, 
                message: language.item_doesnt_exists, 
                is_error: true , 
                data: []
            }
        }
         
        var new_updates;
        if(request.is_error == false ) {
            new_updates = old_data.filter( item => {
                var index = param_id.indexOf(item.local_id);
                if( index == -1 ) {
                    return item;
                }
            });
        } else {
            new_updates = old_data.map( item => {

                var index = param_id.indexOf(item.local_id);
                if( index != -1 ) {
                    item.remote_deleted = false;
                    return item;
                } 
                return item;
            });
        }


        try {
        
            await instance.save({
                key: key,
                data: new_updates
            });
            
            return {
                login_redirect: false, 
                message: language.deleted_success, 
                is_error: false , 
                data: []
            }
        } catch (error) {
            return {
                login_redirect: false, 
                message: language.something_error, 
                is_error: true , 
                data: []
            }
        }
        /**----------------- */
         
    }

    /**
     * Upload and update the remote server with the local change
     */
    async bulkCoreAsync( mobject, array_data = [], consider_flags = true ) {

        if(array_data.length == 0 ) {
            array_data = await this.get_data_locally(mobject);
        }
        
        // getting settings and language
        var settings, user_data;

        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}
        
        var language =  get_lang(settings.language);
        
        // getting user data and check for session expiration 
        if( user_data == null || ! Object.keys(user_data).length ) {
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

        var filtered = array_data; 
        if( consider_flags ) {
            filtered = array_data.filter( item => {
                if( item.remote_updated == false || item.remote_saved == false ) {
                    return item;
                }
            });
        }

        if( filtered.length ) {

            var request = await this.axiosRequest({ 
                api: "api/bulk_create_update", 
                dataObject: {
                    data_array: filtered 
                }, 
                method: "post",  
                model_name: key
            });

            if( request.is_error == false && request.ids != undefined ) { 
                
                array_data = array_data.map(item => {
                    var index = request.ids.findIndex( x => x.local_id == item.local_id); 
                    if( index != -1 ) {
                        return {
                            ...item, ...request.ids[index]
                        }
                    }

                    return item;
                });

                try {
                    
                    await instance.save({
                        key: key, 
                        data: array_data 
                    });  

                } catch (error) {
                    
                    return {
                        login_redirect: false, 
                        message: language.something_error, 
                        is_error: true , 
                        data: []
                    };

                } 

                // update the sent data with remote ids and 
                // replace remote_saved, remote_updated with true value
            }

            return request;
        }

        return {
            login_redirect: false, 
            message: language.uptodate, 
            is_error: false , 
            data: []
        };

    }

    /**
     * Bulk Deletion Aync ( delete from remote then send array to delete in locally ) 
     */
    async bulkDeletionAsync(mobject, array_data = [], consider_flags = true) {
        
        if(array_data.length == 0 ) {
            array_data = await this.get_data_locally(mobject);
        }
        
        // getting settings and language
        var settings, user_data;

        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}
        
        var language =  get_lang(settings.language);
        
        // getting user data and check for session expiration 
        if( user_data == null || ! Object.keys(user_data).length ) {
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

        var filtered = array_data; 
        if( consider_flags ) {
            filtered = array_data.filter( item => {
                if( item.remote_deleted == false ) {
                    return item;
                }
            });
        }

        if( filtered.length ) {

            var request = await this.axiosRequest({ 
                api: "api/bulk_deletion", 
                dataObject: {
                    data_array: filtered 
                }, 
                method: "post",  
                model_name: key
            });

            if( request.is_error == false && request.ids != undefined ) { 
                
                array_data = array_data.filter(item => {
                    var index = request.ids.findIndex( x => x.local_id == item.local_id); 
                    if( index == -1 ) {
                        return item;
                    } 
                    
                });

                try {
                    
                    await instance.save({
                        key: key, 
                        data: array_data 
                    });  

                } catch (error) {
                    
                    return {
                        login_redirect: false, 
                        message: language.something_error, 
                        is_error: true , 
                        data: []
                    };

                }  
            }

            return request;
        }

        return {
            login_redirect: false, 
            message: language.uptodate, 
            is_error: false , 
            data: []
        };
    }
     
    
    /**
     * Get all: Getting Updates from remote and store it locally 
     * Optionally: Paingation ( page number and size )
     */
    async bulkGetAsync( mobject, paging_page = null, paging_size= null ){
        
        // getting settings and language
        var settings, user_data, array_data, pagination, filtered;

        if( paging_page != null && paging_size != null ) {
            pagination = { page: paging_page, size: paging_size };
        }

        array_data = await this.get_data_locally(mobject);

        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}
        
        var language =  get_lang(settings.language);
        
        // getting user data and check for session expiration 
        if( user_data == null || ! Object.keys(user_data).length ) {
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

        filtered = array_data.filter( item => {
            if( item.remote_updated == false || item.remote_saved == false || item.remote_deleted== false ) {
                return item;
            }
        }); 

        if( ! filtered.length ) {
            return {
                login_redirect: false, 
                is_error: false,
                data: [],
                message: language.uptodate
            }
        }
        
        var __object = {
            api: "api/get", 
            dataObject: {
                data_object: {} 
            }, 
            method: "post",  
            model_name: key
        };

        if( pagination != undefined ) {
            __object.dataObject["pagination"] = pagination; 
        }
        

        var request = await this.axiosRequest(__object); 

        if( request.is_error ) {
            return {
                login_redirect: false, 
                ...request
            }; 
        }

        var asynced = [ ...filtered, ...request.data];

        try {
            
            await instance.save({
                key: key,
                data: asynced
            });

            var response = {
                data: asynced,
                is_error: false,
                login_redirect: false, 
                message: language.synchronized_data
            };
    
            return response; 

        } catch (error) {
            var response = {
                data: [],
                is_error: true,
                login_redirect: false, 
                message: language.something_error
            };
            return response;
        } 

    }
     

    /**
     * Getting Data Locally
     */
    async get_data_locally ( mobject ) {

        var array_data = []; 

        try {
            array_data = await mobject.instance.load({
                key: mobject.key
            }); 
        } catch (error) {}

        return array_data;
    }
}
 

export { A_P_I_S }