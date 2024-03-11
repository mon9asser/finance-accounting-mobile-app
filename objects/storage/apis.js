
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


    axiosRequest = async ({ api, dataObject, method, headers } = null) => {
        console.log(dataObject);
        var settings, userInfo;
        try{
            settings = await get_setting();
            userInfo = await usr.get_session();
        } catch(error){}

        

        var language =  get_lang(settings.language);
        dataObject['language'] = settings.language;
        
        let options = {
            method: method, // Can be 'get', 'put', 'delete', etc.
            url: config.api(api), // 'api/application/login'
            data: dataObject,
            headers: {
                'Content-Type': 'application/json',
                'X-api-public-key': config.keys.public,
                'X-api-secret-key': config.keys.secret,
                'X-api-tokens': userInfo.token  
            }
        };  

        
        if( headers !== undefined ) {
            Object.keys(headers).forEach((element) => {
                var key = element;
                var value = headers[key];
                options.headers[key] = value;
            });
        }
       
        var success_callback = (res) => { 
            return res.data;
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
                message: message,
                is_error: true,
                data: []
            };

        }
        
        try {
            return axios(options)
                .then(success_callback)
                .catch(error => error_callback(error));
        } catch (error) {
            return error_callback(error)
        }
        

    }
    
    sendRequest = async (database, document, data_object, id = null, apiUrl = null /* or {key: value} */ ) => {
        
 
         
        var request = await this.axiosRequest({
            api: apiUrl, // "api/category/create", 
            dataObject: {
                database_name:database,
                model_name:document,
                data_object:data_object
            },
            method: "post" 
        });  

        console.log(request);
         
        return {
            is_error: request.is_error, 
            data: request.data,
            message: request.message
        };

    }

    getRequest = async () => {

        // check internet connection before requestion

    }

    async deleteRequest(dbname, document, param_id){

        // check internet connection before requestion

        var objx = {
            is_error: false, 
            message: "",
            data: []
        }  

        return objx;
    }

    async deleteAsync( mobject, local_id ) {

        var user_data, settings;
 

        try{
            settings = await get_setting();
        } catch(error){}

        var language =  get_lang(settings.language);

        // getting user data object from session 
        try {
            user_data = await usr.get_session();
        } catch (error) {    
            return {
                message: language.user_session_expired,
                case: 1,
                status: 0, // 0 => error, 1 => success 
                data: []
            };
        }
        
       
        
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
            row_data = await mobject.instance.load({
                key: mobject.key
            }); 
        } catch (error) {
            row_data = [];
        }

        

        if( ! row_data.length ) {
 
            return {
                message: "",
                case: 0,
                status: 1, // 0 => error, 1 => success 
                data: row_data
            };

        }
         
        // delete from server
        var remote = await this.deleteRequest( user_data.database_name, mobject.key, local_id);
        
        if( remote.is_error ) {
        
            return {
                message: language.check_internet_connection,
                case: 0,
                status: 0, // 0 => error, 1 => success 
                data: []
            }; 
        }

       
        // check if the price is already exists by object or id 
        var index = row_data.findIndex( item => {
            if( typeof local_id == 'object' ) {
                var key = Object.keys(local_id)[0];
                var vaue = local_id[key];

                if( item[key] == vaue ) {
                    return true;
                }

            }

            if(item.local_id == local_id ) {
                return true;
            }   
        });

        if( index == -1 ) {
            var response = {};
            response.message = language.item_doesnt_exists; 
            response.data = []; 
            response.case = 0; 
            response.status = 0; 
            return response;
        }


        // delete from storage
        // var data_new = row_data.filter(x => x.local_id != local_id); 
        
        // filter and delete unneeded price 
        var data_new = row_data.filter( item => {

            if( typeof local_id == 'object' ) {
                var key = Object.keys(local_id)[0];
                var vaue = local_id[key]; 
                if( item[key] != vaue ) { 
                    return item;
                }

            }

            if(item.local_id != local_id && typeof local_id != 'object' ) {
                return item;
            }   

        });

        try {
             
            await mobject.instance.save({
                key: mobject.key,
                data: data_new
            });
            
            
            return {
                message: language.deleted_success,
                case: 0,
                status: 1, // 0 => error, 1 => success 
                data: data_new
            }; 

        } catch (error) { 
            return {
                message: language.something_error,
                case: 0,
                status: 0, // 0 => error, 1 => success 
                data: []
            };
        }

    }

    /**
     * Update and insert data per one object 
     * locally and remotely
     */
    async coreAsync (  mobject, obj_data,  param_id = null, api_url = null ) {

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

        
        // assign new properies into the main object 
        var updateObject = {
            application_id:user_data.application_id,
            updated_date: Date.now(),
            updated_by: {
                id:  user_data.id,
                name: user_data.name,
                email: user_data.email 
            },
            param_id: id
        };

        var insertObject = {
            application_id:user_data.application_id,
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
            }
        };
        
        var updateRemoteObject = {...obj_data, ...insertObject};
        if( param_id != null ) {
            updateRemoteObject = {...obj_data, ...updateObject};
        }

        // send request to server for this record
        var remote = await this.sendRequest( user_data.database_name, mobject.key, updateRemoteObject,  param_id, api_url);

        
        
        // case it update - if( typeof id == 'object'  ) 
        if( is_update_request && param_id != null ) {

            
            //var objectIndex = data.findIndex( x => x.local_id == id );
            var objectIndex = data.findIndex(x => {
                
                if( typeof id == 'object'  ) {
                    var key = Object.keys(id)[0]; 
                    return x[key] == id[key]; 
                }

                return x.local_id == id;

            });
            
            if( objectIndex == -1 ) {
                response.message = language.no_records;
                response.case = 0;
                response.status = 0;
                response.data = [];

                return response;
            }
            
            if( objectIndex != -1 ) {
                
                Object.keys(obj_data).forEach((keyName) => {
                    var value = obj_data[keyName];
                    var key  = keyName;

                    data[objectIndex][key] = value;
                });

                data[objectIndex] = {
                    ...data[objectIndex], 
                    ...updateObject,
                    remote_updated: remote.is_error? false: true
                }  

                
            }
        } else {
            // push object data 
            var build = {
                ...obj_data,  
                ...insertObject,
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
    async getData( mobject, param_id = null ) {
         
        var response = {
            message: "",
            case: 0,
            status: 0, // 0 => error, 1 => success 
            data: []
        };
        
        try { 

            var get_all = await mobject.instance.load({
                key: mobject.key
            });

            if( param_id !== null ) {
                
                // checking exists
                var index = get_all.findIndex( item => {
                    if( typeof param_id == 'object' ) {
                        var key = Object.keys(param_id)[0];
                        var vaue = param_id[key];
        
                        if( item[key] == vaue ) {
                            return true;
                        }
        
                    }
        
                    if(item.local_id == param_id ) {
                        return true;
                    }   
                });
                
                if( index == -1 ) {
                    response.message = language.no_records; 
                    response.data = []; 
                    response.case = 0; 
                    response.status = 1; 
                    return response;
                }

                var new_data = get_all.filter( item => {

                    if( typeof param_id == 'object' ) {
                        var key = Object.keys(param_id)[0];
                        var vaue = param_id[key]; 
                        if( item[key] == vaue ) { 
                            return item;
                        }
        
                    }
        
                    if(item.local_id == param_id && typeof param_id != 'object' ) {
                        return item;
                    }   
        
                });
                
                // get by object 
                response = {
                    message: "",
                    case: 0,
                    status: 1, // 0 => error, 1 => success 
                    data: new_data
                };

                return response;
            }

            response = {
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
                status: 0, // 0 => error, 1 => success 
                data: []
            };

            return response;
            
        }

    }

}
 

export { A_P_I_S }