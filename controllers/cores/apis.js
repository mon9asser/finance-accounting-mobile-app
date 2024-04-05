
import axios from "axios";

import { get_lang } from "../languages";
import {generateId} from '../helpers';
import {get_setting} from '../cores/settings'; 
import {config} from '../../settings/config';
import {usr} from '../storage/user';
import {Models} from "./models";



class A_P_I_S {
    
    constructor(prop) {  
        this.prop = prop;
    }

    
    // HTTP Request 
    axiosRequest = async ({ api, dataObject, method, headers, model_name, is_media } = null) => {
        

        // disable internet    
        if( ! config.enable_remote_server_apis ) {

            return {
                is_error: true, 
                data: [], 
                message: ""
            };  
        
        }
        
        var settings, user_data;
        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){
            console.log(error);
        }

        var language =  get_lang(settings.language);
         
        // if session is expired generate a new one  
        if( !user_data || ! Object.keys(user_data).length ) { 
            
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


        if( ! is_media && ( dataObject.data_object == undefined || typeof dataObject.data_object != 'object' ) && ( dataObject.data_array == undefined || ! Array.isArray(dataObject.data_array) )  ) {
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
        
        var content_type = {
            'Content-Type': 'application/json'
        }

        var formData = new FormData();

        
        
        if( is_media ) {

            // attach basic info to form data 
            Object.keys(dataObject).forEach(key => {
                
                if (key === 'file') { 
                    const file = dataObject[key];
                     
                    formData.append(key, {
                        uri: file.uri,
                        type: file.type || 'image/jpeg', // Ensure the type is correctly set
                        name: file.name || 'upload.jpg'
                    });

                } else {
                    formData.append(key, dataObject[key]);
                }
            });  
            dataObject = formData; 

            content_type = {
                'Content-Type': 'multipart/form-data'
            };

        }
        
        let options = {
            method: method, // Can be 'get', 'put', 'delete', etc.
            url: config.api(api), // 'api/application/login'
            data: dataObject,
            headers: {
                ...content_type, 
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

    }


    /**
     * Upload media, remotely and locally 
     */
    async upload_media (mobject, {new_name, file, property_name, post_id} ) {
        
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


        var modal_name = mobject.key;   
        

        if( mobject.key.indexOf("-") != -1 ) {
            modal_name = mobject.key.replaceAll(new RegExp("-", 'g'), "_");
        } 
       
        var new_file_name = `${user_data.database_name}-${modal_name}-${post_id}`;
        var dataObject = { 
            name: new_file_name,
            file,  
            property_name, 
            post_id
        }; 
       
        var axiosOptions = { 
            api: "api/upload_media", 
            dataObject, 
            method: "post",  
            model_name: modal_name,  
            is_media: true 
        }
 
        
        var request = await this.axiosRequest(axiosOptions); 
        
        // storing image in local storage 
        console.log( request );
        

        return request;
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
        
        

        var rowData = {};

        // store data locally 
        if(  objectIndex !== -1 ) {
             
           var updator = {

                ...old_data[objectIndex],
                ...__object,
                remote_updated: request.is_error? false: true,
                _id: request.data._id == undefined? "": request.data._id
           };
            rowData = updator;
            
            if( updator.file !=undefined && updator.file.base_64 != undefined ) {
                delete updator.file.base_64;
            }

            old_data[objectIndex] = updator;

             
        } 
        
        if( objectIndex === -1) {
             
            rowData = {
                ...__object, 
                remote_saved: request.is_error? false: true,
                _id: request.data._id == undefined? "": request.data._id
            };

            if( rowData.file !=undefined && rowData.file.base_64 != undefined ) {
                delete rowData.file.base_64;
            }

            old_data.push(rowData); 

        }

        // assig log history 
        await this.assign_log(mobject, rowData.local_id, is_update? "update": "create" );

        // update data locally 
        try {

            var is_saved = instance.save({
                key: key,
                data: old_data
            }); 

            
            return {
                message: language.saved_success,
                data: rowData,
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
     * Update Async based on parameters 
     * update a spesific key with more than one row
     */
    async updateAsync( mobject, data_object = {}, where_keys = {}  ) {
        
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
        
        if( Object.keys(data_object).length == 0 ||  Object.keys(where_keys).length == 0  ) {
            return {
                login_redirect: false, 
                message: language.required_data, 
                is_error: true , 
                data: []
            };
        }

        // update in remote first 
        var request = this.axiosRequest({
            api: "api/update_by_keys",
            dataObject: {
                data_object: data_object,
                param_id: where_keys
            }, 
            method: "post",  
            model_name: key
        });

        var is_updated_remotely = false; 
        if( request.is_error == false ) {
            is_updated_remotely = true;
        }

        var old_data = this.get_data_locally(mobject);
        var last_update = old_data.map( item => {
            item.remote_updated = is_updated_remotely;
            var new_item = {...item, ...data_object};
            return new_item;
        });

        

        try {

            await instance.save({
                key: key,
                data: last_update 
            }); 
            
            return {
                message: language.saved_success,
                data: is_saved,
                is_error: false, 
                login_redirect: false
            }
            
        } catch (error) {
            return {
                message: language.something_error,
                data: is_saved,
                is_error: true, 
                login_redirect: false
            }
        }
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
        
         
        await this.assign_log(mobject, "-1", "delete_many" );

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

        var old_data = await this.get_data_locally(mobject);
         
        if(array_data.length == 0 ) {
            array_data = old_data;
        } else {
            
            // add default properties to array 
            var mapped = array_data.map( item => {
                
                if( item.local_id === undefined ) {
                    item.local_id = generateId();
                }

                if( item.application_id === undefined ) {
                    item.application_id = user_data.application_id
                }

                if( item.updated_date === undefined ) {
                    item.updated_date= Date.now();
                }

                if( item.created_date === undefined ) {
                    item.created_date= Date.now();
                }
                 
                if(item.created_by === undefined) {
                    item.created_by = {
                        email: user_data.email,
                        id: user_data.id,
                        name: user_data.name 
                    };
                }

                if(item.updated_by === undefined) {
                    item.updated_by = {
                        email: user_data.email,
                        id: user_data.id,
                        name: user_data.name 
                    };
                } 

                return item;

            });

            array_data = [...old_data, ...mapped];
            
            // => delete duplicated data in local storage
            const uniqueMap = new Map(array_data.map(item => [item.local_id, item]));
            array_data = Array.from(uniqueMap.values()); 
            
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
    async bulkGetAsync( mobject, async = false, desc =true, paging_page = null, paging_size= null ){
        
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

        if( ! filtered.length && async == false) {
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


        // check if filter data already on the remote server so delete the filter
        filtered = filtered.filter(item => {
            var local_id = item.local_id;
            var remoted = request.data.findIndex( x => x.local_id == local_id);
            if( remoted === -1 ) {
                return item;
            }
        })

        var asynced = [ ...filtered, ...request.data];

        // filter data desc and asc 
        
        if( desc ) {
            // updated_date ( Desc Asc )
            // created_date ( Desc Asc )
            //  
            var filter_by = 'updated_date'
            if( desc !== true && typeof desc == 'string' ) {
                filter_by = desc;
            }
            
            asynced.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b[filter_by]) - new Date(a[filter_by]);
            });
              
        }

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
     * Update all records based in keys 
     */
    async async_update_all_by_keys( mobject, data_object, search_object ) {

        // getting settings and language
        var settings, user_data, array_data; 
        
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

        // update remotely 
        var request = await this.axiosRequest({
            api: "api/update_by_keys", 
            dataObject: {
                data_object: data_object,
                param_id: search_object
            }, 
            method: "post",  
            model_name: key
        });

        var remote_updated = false;
        if( request.is_error == false ) {
            remote_updated = true; 
        }


        var data_object_new = {
            ...data_object,  
            updated_date: Date.now(),
            updated_by: {
                id:  user_data.id,
                name: user_data.name,
                email: user_data.email 
            }
        }

        // update locally 
        var updated_array = array_data.map(item => {
            // Check if the item matches all criteria in 'search_object'
            const isMatch = Object.keys(search_object).every(key => item[key] === search_object[key]);
            
            // If it matches, return an updated item
            if (isMatch) {
                return {...item, ...data_object_new , remote_updated: ! request.is_error}; // Update the 'field' to "updated"
            }
            
            // Otherwise, return the item unchanged
            return item;
        });

        try {
            var is_saved = instance.save({
                key: key,
                data: updated_array
            }); 

            return {
                message: language.saved_success,
                data: is_saved,
                is_error: false, 
                login_redirect: false
            }
        } catch (error) {
            return {
                message: language.something_error,
                data: [],
                is_error: true, 
                login_redirect: false
            }
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

    /**
     * register logs for user 
     */
    async assign_log( mobject, doc_local_id, type  ) {
        
        // to store data 
        var log_key = Models.log_history.key;
        var log_instance = Models.log_history.instance;

        
        // => Model data 
        if( type != "login" && mobject != null ) {
             
            var {key} = mobject; 
            var {doc_type} = mobject; 
            
            if( doc_type == undefined ) {
                return;
            }
        
            var localize_obj_key = key; 
            if( key.indexOf("-") != -1 ) {
                localize_obj_key = key.replaceAll("-", "_");
            } // localize_obj_key
            
            var vowels = ['a','i','o','u','e']; // ies 
            var first_char = localize_obj_key[0];
            var selector = "_a";
            if( vowels.indexOf(first_char) != -1 ) {
                selector = "_an"
            }

            if( type == "create" ) {
                selector = `__created${selector}`;
            }  
            
            if( type == "update" ) { 
                selector = `__updated${selector}`;
            } 
            
            if ( type == "delete" ) {
                selector = `__deleted${selector}`;
            }

            if( type  == 'delete_many' ) {
                selector = `__deleted_a`;
            }


        }

        if( type == "login" ) {
            selector = "__logged_in";
            doc_type = "-1";
            doc_name = "login"; 
        }


        var res = await this.coreAsync(Models.log_history, {
            doc_type: doc_type,
            doc_local_id: doc_local_id,
            doc_name: localize_obj_key, 
            describe_obj_key: selector
        });

        return res;
    }

}
 

export { A_P_I_S }