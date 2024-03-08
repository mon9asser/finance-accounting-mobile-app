
import { get_lang } from "../languages";
import {generateId} from '../helpers';
import {get_setting} from './settings';
import {usr} from './user';

class A_P_I_S {
    
    constructor(prop) {  
        this.prop = prop;
    }
    
    sendRequest = async (database, document, data_object, id = null /* or {key: value} */ ) => {

         
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
        var remote = await this.deleteRequest( user_data.database_name, mobject.key,  local_id);
        
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