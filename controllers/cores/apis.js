
import axios from "axios";

import { get_lang } from "../languages";
import {generateId} from '../helpers';
import {get_setting, add_setting} from '../cores/settings'; 
import {config} from '../../settings/config';
import {usr} from '../storage/user';
import {Models} from "./models";



class A_P_I_S {
    
    constructor(prop) {  
        this.prop = prop;
    }

    
    // HTTP Request 
    axiosRequest = async ({ api, dataObject, method, headers, model_name, is_media } = null) => {
        
        if( config.disable_remote_server ) { 
            return {
                login_redirect: false, 
                message: "", 
                is_error: true , 
                data: [] 
            }
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
         
      

        if( model_name == undefined && model_name != null ) {
             
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

            // attatch the create object here 
            __object = {
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
        var request = {
            is_error: true,
            data: [],
            message: "data"
        };
        
        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(axiosOptions);
            return request;
        };
        
        
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
            
            if(! config.disable_local_storage) 
               old_data.push(rowData); 

        }

        // assig log history 
        //// await this.assign_log(mobject, rowData.local_id, is_update? "update": "create" );

        // update data locally
        try {

            if(! config.disable_local_storage) { 
                var is_saved = await instance.save({
                    key: key,
                    data: old_data
                }); 
            } 

            if( ! config.disable_local_storage || (! config.disable_remote_server && request.is_error == false )) {
                return {
                    message: language.saved_success,
                    data: rowData,
                    is_error: false, 
                    login_redirect: false
                }
            }

            return {
                message: language.services_disabled_by_app_admin,
                data: [],
                is_error: true, 
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


    async coreAsync2( mobject, obj_data, parameter_id = null ) {
       
        // getting settings and language
        var settings, user_data, param_id, param_id_object, old_data, is_update; 

        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}

        var language = get_lang(settings.language);
        
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
         
        // prepare data of remote server 
        var axiosOptions = { 
            api: "api/update_company_options", 
            dataObject: {
                data_object: obj_data 
            }, 
            method: "post",  
            model_name: key
        };

        // send request for remote server 
        var request = {
            is_error: true,
            data: [],
            message: ""
        };

        /* Store some data in localstorage */ 
        await add_setting({
            branch: obj_data.selected_branch,
            language: obj_data.selected_language.value
        });
        
        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(axiosOptions); 
            return request; 
        }; 

        
        if(! config.disable_local_storage) { 
            await instance.save({
                key: key,
                data: obj_data 
            }); 
        }

         
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

        var axiosOptions = {
            api: "api/update_by_keys",
            dataObject: {
                data_object: data_object,
                param_id: where_keys
            }, 
            method: "post",  
            model_name: key
        } 

        var request = {
            is_error: true, 
            message: "", 
            data: []
        };

        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(axiosOptions);
            return request;
        };

        var is_updated_remotely = false; 
        if( request.is_error == false ) {
            is_updated_remotely = true;
        }

        var old_data = await this.get_data_locally(mobject);
          
        var last_update = old_data.map( item => {
            item.remote_updated = is_updated_remotely;
            var new_item = {...item, ...data_object};
            return new_item;
        });

        

        try {

            if(! config.disable_local_storage) { 
                await instance.save({
                    key: key,
                    data: last_update 
                }); 
            }
            
            if( ! config.disable_local_storage || (! config.disable_remote_server && request.is_error == false )) {
                return {
                    message: language.saved_success,
                    data: last_update,
                    is_error: false, 
                    login_redirect: false
                }
            }

            return {
                message: language.services_disabled_by_app_admin,
                data: [],
                is_error: true, 
                login_redirect: false
            }
            
        } catch (error) {
            return {
                message: language.something_error,
                error: error,
                data: [],
                is_error: true, 
                login_redirect: false
            }
        }
    }


    /**
     * Update + Delete + Insert Bulk Array Data 
     */
    async blk_update_delete_insert( mobject, data_object = [], where_keys = {}  ) {
         
        
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
        
        if( data_object.length == 0 ||  Object.keys(where_keys).length == 0  ) {
            return {
                login_redirect: false, 
                message: language.required_data, 
                is_error: true , 
                data: []
            };
        }

        // assign meta data 
        if( data_object.length ) {

            data_object = data_object.map( item => {
                
                item.updated_by = {
                    email: user_data.email,
                    id: user_data.id,
                    name: user_data.name 
                }
                item.updated_date = Date.now();

                if(item.created_by == undefined ) {
                    item.created_by = {
                        email: user_data.email,
                        id: user_data.id,
                        name: user_data.name 
                    }
                }

                if(item.local_id == undefined ) {
                    item.local_id = generateId();
                }

                if(item.created_date == undefined ) {
                    item.created_date= Date.now();
                }

                if(item.application_id == undefined ) {
                    item.application_id = user_data.application_id
                }

                return item;
            })

        }

        var __keys = Object.keys(where_keys);
        var axiosOptions = {
            api: "api/update_insert_delete_by_keys",
            dataObject: {
                data_object: data_object,
                param_id: where_keys
            }, 
            method: "post",  
            model_name: key
        } 

        var request = {
            is_error: true, 
            message: "", 
            data: []
        };

        if( ! config.disable_remote_server ) { 
            
            request = await this.axiosRequest(axiosOptions);
            return request;   

        }; 

        var is_updated_remotely = false; 
        if( request.is_error == false ) {
            is_updated_remotely = true;
        }
 

        var old_data = await this.get_data_locally(mobject);
        
        var new_data = data_object.filter( item => {
            
            var local_id = item.local_id; 
            var data_db_exists = old_data.findIndex(x => {

                var elm_arr = []; 

                __keys.forEach(el => {
                    if( where_keys[el] == x[el] ) {
                        elm_arr.push(true)
                    } else {
                        elm_arr.push(false)
                    }
                });

                var is_invoice = elm_arr.indexOf(false);

                if( x.local_id == item.local_id && is_invoice == -1 ) {
                    return true;
                }

            }); 
            if( data_db_exists == -1 ) {
                return item
            }
            
        });  

        // => add the new data
        if( new_data.length ) {
            old_data = [...old_data, ...new_data];
        }

        // => delete 
        var deletion_clone = old_data.filter( item => {
            
            var index = data_object.findIndex(x => x.local_id == item.local_id && item[Object.keys(where_keys)[0]] == where_keys[Object.keys(where_keys)[0]]  );
            if( index == -1 ) {
                return item;
            }

        }); 
        old_data = old_data.filter( x => deletion_clone.findIndex( y => y.local_id == x.local_id ) == -1 )
        

        // => update 
        data_object.map(item => {
            
            var _key_ = Object.keys(where_keys)[0];

            var index_in_db = old_data.findIndex(x => x.local_id == item.local_id && x[_key_] ==  where_keys[_key_] )
            
            if( index_in_db != -1 ) {
                old_data[index_in_db] = item;
            }
            
        });
        

        var last_update = old_data.map( item => {
            item.remote_updated = is_updated_remotely;
            var new_item = {...item, ...data_object};
            return new_item;
        }); 
           

        try {

            if(! config.disable_local_storage) { 
                await instance.save({
                    key: key,
                    data: last_update 
                }); 
            }
            
            if( ! config.disable_local_storage || (! config.disable_remote_server && request.is_error == false )) {
                return {
                    message: language.saved_success,
                    data: last_update,
                    is_error: false, 
                    login_redirect: false
                }
            }

            return {
                message: language.services_disabled_by_app_admin,
                data: [],
                is_error: true, 
                login_redirect: false
            }
            
        } catch (error) {
            return {
                message: language.something_error,
                error: error,
                data: [],
                is_error: true, 
                login_redirect: false
            }
        }
    }

    async blk_invoice_details_document ({ doc_item, doc_details } = null , data_object = {}, data_array = [], where_keys = {} ) {
        
        var settings, user_data; 
        
        try{
            settings = await get_setting();
            user_data = await usr.get_session();
        } catch(error){}
        
         
        // getting user data and check for session expiration 
        if( user_data == null || ! Object.keys(user_data).length ) {
            return {
                login_redirect: true, 
                message: language.user_session_expired, 
                is_error: true , 
                data: []
            };
        }
         
        var request = {
            is_error: true, 
            message: "", 
            data: []
        };

        var updated_array = data_array.map(item => {
            
            item.updated_by = {
                email: user_data.email,
                id: user_data.id,
                name: user_data.name 
            }
            item.updated_date = Date.now();

            if(item.created_by == undefined ) {
                item.created_by = {
                    email: user_data.email,
                    id: user_data.id,
                    name: user_data.name 
                }
            }

            if(item.local_id == undefined ) {
                item.local_id = generateId();
            }

            if(item.created_date == undefined ) {
                item.created_date= Date.now();
            }

            if(item.application_id == undefined ) {
                item.application_id = user_data.application_id
            }

            return item;
        })

        var doc_meta_object = { };
        
        doc_meta_object.updated_by = {
            email: user_data.email,
            id: user_data.id,
            name: user_data.name 
        }
        doc_meta_object.updated_date = Date.now();

        if(data_object.created_by == undefined ) {
            doc_meta_object.created_by = {
                email: user_data.email,
                id: user_data.id,
                name: user_data.name 
            }
        }

        if(data_object.local_id == undefined ) {
            doc_meta_object.local_id = generateId();
        }

        if(data_object.created_date == undefined ) {
            doc_meta_object.created_date= Date.now();
        }

        if(data_object.application_id == undefined ) {
            doc_meta_object.application_id = user_data.application_id
        }

        var updated_object = {...data_object, ...doc_meta_object}
        
        var axiosOptions = {
            api: "api/store_full_invoice_document",
            dataObject: {
                data_object: updated_object,
                data_array: updated_array,
                mobject_data: {
                    doc_item: doc_item, 
                    doc_details: doc_details
                },
                param_id: where_keys
            }, 
            method: "post",  
            model_name: null
        };

        // Request -
        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(axiosOptions); 
            return request;
        }

        // Local Storage 
        if( config.disable_local_storage ) { 
            return {
                message: language.services_disabled_by_app_admin,
                data: [],
                is_error: true, 
                login_redirect: false
            }
        }

        if( ! data_array.length ) {
            return;
        } 


        // Working with document details
        var old_data_details = await this.get_data_locally(doc_details);
        

        /* Delete */ 
        old_data_details = old_data_details.filter(x => {
            var _k = Object.keys(where_keys);
            if(_k.length) {
                _k = _k[0];
            }

            if( where_keys[_k] == x[_k] ) {
                var index = data_array.findIndex(xm => xm.local_id == x.local_id)
                
                if( index != -1 ) {
                    return x; 
                }

            } else return x; 
        });
                
        /* Add and Update*/
        data_array.map(x => {
            
            var index = old_data_details.findIndex(it => it.local_id == x.local_id);
            if( index == -1 ) {
                old_data_details.push(x)
            } else {
                old_data_details[index] = x;
            }

        });

        
        
        // working with invoice document 
        var old_data_document = await this.get_data_locally(doc_item);

        var dindex = old_data_document.findIndex( x => {
            
            
            var _k = Object.keys(where_keys); 
             
            if(_k.length) {
                _k = _k[0];
            } 
            
            return x.local_id == where_keys[_k];

        });
       
        if( dindex == -1 ) {
            old_data_document.push(data_object);
        } else {
            old_data_document[dindex] = data_object;
        }

        try {
            
            // Storing Items of Invoices
            await doc_details.instance.save({
                key: doc_details.key,
                data: old_data_details
            }); 

            // storing invoice data
            await doc_item.instance.save({
                key: doc_item.key,
                data: old_data_document
            }); 

            return {
                is_error: false, 
                login_redirect: false, 
                data: [], 
                message: "You added a new sales invoice successfuly!"
            }

        } catch (error) {
            return {
                is_error: false, 
                login_redirect: false, 
                data: [], 
                message: "Something went wrong"
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
        var axiosOptions = { 
            api: "api/delete", 
            dataObject: {
                data_object: {},
                param_id: param_id
            }, 
            method: "post",  
            model_name: key
        }; 


        var request = {
            is_error: true, 
            message: "", 
            data: []
        };

        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(axiosOptions);

            return request;
        };
        
         
        // // await this.assign_log(mobject, "-1", "delete_many" );

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

            /*
            new_updates = old_data.map( item => {

                var index = param_id.indexOf(item.local_id);
                if( index != -1 ) {
                    item.remote_deleted = false;
                    return item;
                } 

                return item;
                
            });*/

            new_updates = old_data.filter( item => {

                var index = param_id.indexOf(item.local_id);
                if( index == -1 ) { 
                    return item;
                }  
                
            });

        }


        try {
            
            console.log(new_updates);

            if(! config.disable_local_storage) { 
                await instance.save({
                    key: key,
                    data: new_updates
                }); 
            }

            if( ! config.disable_local_storage || (! config.disable_remote_server && request.is_error == false ))  {
                return {
                    login_redirect: false, 
                    message: language.deleted_success, 
                    is_error: false , 
                    data: []
                }
            }

            return {
                message: language.services_disabled_by_app_admin,
                data: [],
                is_error: true, 
                login_redirect: false
            }


        } catch (error) {
            return {
                login_redirect: false, 
                message: language.something_error, 
                is_error: true , 
                data: []
            }
        } 
         
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

            var axiosOptions = { 
                api: "api/bulk_create_update", 
                dataObject: {
                    data_array: filtered 
                }, 
                method: "post",  
                model_name: key
            };

            var request = {
                is_error: true, 
                message: "", 
                data: []
            };
    
            if( ! config.disable_remote_server ) { 
                request = await this.axiosRequest(axiosOptions);
                return request;
            };

            
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

            }

            
            try {
                
                if(! config.disable_local_storage) { 

                    if( config.disable_remote_server ) {
                        array_data = array_data.map( x => {
                            x.remote_saved = false;
                            return x;
                        });
                    }

                    await instance.save({
                        key: key, 
                        data: array_data 
                    });  
                }

                if( ! config.disable_local_storage || (! config.disable_remote_server && request.is_error == false )) {
                    return {
                        message: language.saved_success,
                        data: array_data,
                        is_error: false, 
                        login_redirect: false
                    }
                }
    
                return {
                    message: language.services_disabled_by_app_admin,
                    data: [],
                    is_error: true, 
                    login_redirect: false
                }

            } catch (error) {
                console.log(error);
                return {
                    login_redirect: false, 
                    message: language.something_error, 
                    is_error: true , 
                    data: []
                };

            }
            
        }

        return {
            login_redirect: false, 
            message: language.uptodate, 
            is_error: false , 
            data: []
        };

    }

    
    /**
     * [ this function is under review]
     * Bulk Deletion Aync ( delete from remote then send array to delete in locally ) 
     */
    /*
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
         
        console.log("--------------------------------")
        console.log(array_data)
        console.log("--------------------------------")
        
        if( filtered.length ) {

            var axiosOptions = { 
                api: "api/bulk_deletion", 
                dataObject: {
                    data_array: filtered 
                }, 
                method: "post",  
                model_name: key
            };

            var request = {
                is_error: true, 
                message: "", 
                data: []
            };
    
            if( ! config.disable_remote_server ) { 
                request = await this.axiosRequest(axiosOptions);
            };

            if( request.is_error == false && request.ids != undefined ) { 
                array_data = array_data.filter(item => {
                    var index = request.ids.findIndex( x => x.local_id == item.local_id); 
                    if( index == -1 ) {
                        return item;
                    }  
                });
            }
 
            try {
                
                if(! config.disable_local_storage) { 
                    await instance.save({
                        key: key, 
                        data: array_data 
                    });  
                }

                if( ! config.disable_local_storage || (! config.disable_remote_server && request.is_error == false )) {
                    return {
                        message: language.all_records_deleted_succ,
                        data: [],
                        is_error: false, 
                        login_redirect: false
                    }
                }

                return {
                    message: language.services_disabled_by_app_admin,
                    data: [],
                    is_error: true, 
                    login_redirect: false
                }

            } catch (error) {
                
                return {
                    login_redirect: false, 
                    message: language.something_error, 
                    is_error: true , 
                    data: []
                };

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
    */
    
    /**
     * Get all: Getting Updates from remote and store it locally 
     * Optionally: Paingation ( page number and size )
     */
    async bulkGetAsync( mobject, async = false, desc =true, paging_page = null, paging_size= null ){
        
        // config.disable_remote_server

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
        
        
        if( config.disable_local_storage && config.disable_remote_server ) {
            return {
                login_redirect: false, 
                message: "", 
                is_error: true , 
                data: array_data
            };       
        }
        
        if( (  ! config.disable_local_storage && config.disable_remote_server ) ) {
            return {
                data: array_data,
                is_error: false, 
                login_redirect: false, 
                message: ""
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
         /*
        if( ! config.disable_local_storage && ! config.disable_remote_server ) {
            if( ! filtered.length && async == false) {
               return {
                    login_redirect: false, 
                    is_error: false,
                    data: [],
                    message: language.uptodate
                }
            }
        }*/
         
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
        
        

        var request = {
            is_error: true, 
            message: "", 
            data: []
        };
        
        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(__object);
            return request;
        };
        
        if( ! config.disable_remote_server && request.is_error ) {
            
            return {
                login_redirect: false, 
                ...request
            }; 
        }
        
        if( config.disable_local_storage &&  ! config.disable_remote_server ) {
            
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
 
        var __objectxxx = {
            api: "api/update_by_keys", 
            dataObject: {
                data_object: data_object,
                param_id: search_object
            }, 
            method: "post",  
            model_name: key
        };

        var request = {
            is_error: true, 
            message: "", 
            data: []
        };

        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(__objectxxx);
        };


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
    
    async GetAsyncLastRecord( mobject, data_obj ) {
        
         
        // getting settings and language
        var settings, user_data, array_data; 
        
        array_data = await this.get_data_locally(mobject); 


        if( array_data.length ) {
            array_data = array_data.filter( x => {
                var keys = Object.keys(data_obj) 

                if( keys.length == 1 ) {
                    var key1 = keys[0];
                    var value1 = data_obj[key1];

                    return x[key1] == value1;

                }   else if ( keys.length == 2 ) {

                    var key1 = keys[0]
                    var value1 = data_obj[key1];

                    var key2 = keys[1]
                    var value2 = data_obj[key2];

                    return x[key1] == value1 && x[key2] == value2;
                }  else if ( keys.length == 3 ) {
                    var key1 = keys[0]
                    var value1 = data_obj[key1];

                    var key2 = keys[1]
                    var value2 = data_obj[key2];

                    var key3 = keys[2]
                    var value3 = data_obj[key2];

                    return x[key1] == value1 && x[key2] == value2 && x[key3] == value3;
                }              

            });
        }
        
        
        
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

        if( config.disable_local_storage && config.disable_remote_server ) {
            
            return {
                login_redirect: false, 
                message: "", 
                is_error: true , 
                data: ! array_data.length ? []: [array_data[array_data.length - 1 ] ] 
            };       
        }

        if( (  ! config.disable_local_storage && config.disable_remote_server ) ) {
            return {
                data: ! array_data.length ? []: [array_data[array_data.length - 1 ] ],
                is_error: false, 
                login_redirect: false, 
                message: ""
            };
        }

        var {key, instance} = mobject;
        if(key == undefined || instance == undefined) {
            return {
                login_redirect: false, 
                message: language.api_error, 
                is_error: true , 
                data: []
            };
        }

        var __object = {
            api: "api/get_last_record", 
            dataObject: {
                data_object: data_obj
            }, 
            method: "post",  
            model_name: key
        };
        
        var request = {
            is_error: true,  
            message: "", 
            data: []
        };
        
        if( ! config.disable_remote_server ) { 
            request = await this.axiosRequest(__object);
        };
        
        if( ! config.disable_remote_server && request.is_error ) {
            
            return {
                login_redirect: false, 
                ...request
            }; 
        }
        
        if( config.disable_local_storage &&  ! config.disable_remote_server ) {
            
            return {
                login_redirect: false, 
                ...request
            };
        }   
        
        return {
            login_redirect: false, 
            ...request
        };
        
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
 

(async () => {
  var ap = new A_P_I_S(); 
 /*
  var log = await ap.bulkCoreAsync(Models.products, [
    { product_name: "Mada Visa" },
    { product_name: "Master Card" }, 
  ], false);  

  console.log(log);  */

})();

export { A_P_I_S }      