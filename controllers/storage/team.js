
import axios from "axios";
import {A_P_I_S} from "../cores/apis.js"; 
import {Models} from "../cores/models.js"; 
import { get_setting} from "../cores/settings.js";
import { get_lang } from "../languages";

 import {usr} from "./user.js";

import _ from 'lodash';
 

class Team extends A_P_I_S {
    
    constructor(props) {
        
        super(props); 

    };


    async add_update_new_team_member({ name, email, password, user_id } = null ) {

        

        /**
         * app_name
         * is_owner
         * application_id
         */
        var settings;
        var session;

        try {
            settings = await get_setting();
            session = await usr.get_session();
        } catch (error) {
            
            return {
                login_redirect: false, 
                is_error: true, 
                data: [], 
                message: `Something went wrong`
            };
        }


        if( session == null ) {
            return {
                login_redirect: true, 
                is_error: true, 
                data: [],  
                message: `login expired, please login again` //user_session_expired
            }; 
        } 

        var data_object = {
            name: name == undefined? "":name,
            email: email == undefined? "":email,
            password: password == undefined? "":password,
            
            access_level_id: -1,
            rule_id: -1,
            app_name: session.company_name,
            is_owner: false, 
            application_id: session.application_id
        };  
        
        
        if( user_id == undefined ) {
            user_id = "";
        }

        var request = await this.axiosRequest({
            api: user_id != undefined ?"api/update_member": "api/create_member", 
            dataObject: {
                data_object: data_object,
                user_id: user_id
            }, 
            method: "post",  
            model_name: ""  
        });

        return request;

    }

    async get_all_my_work_team (){

       
        try {

            var user, settings ;
            try {
                settings = await get_setting();
                user = await usr.get_session();
            } catch (error) {
    
                return {
                    is_error: true, 
                    data: [], 
                    message: 'Unable to fetch users',
                    login_redirect: false 
                };
            }
    
            if( user == null ) {
                return {
                    is_error: true, 
                    data: [], 
                    message: 'Session expired, please login again!',
                    login_redirect: true 
                };
            } 

            const response = await this.axiosRequest({
                api: 'api/work_team',  
                dataObject: { 
                    data_object: {
                        // user.application_id
                        application_id: user.application_id 
                    } 
                },
                method: 'post',  
                model_name: ''  
            });
 
    
            return response;
        } catch (error) {
            return {
                is_error: true, 
                data: error, 
                message: 'Unable to fetch users',
                login_redirect: false 
            };
        }
    }


    async delete_records(ids) {
        try {
            let user, settings;

            try {
                settings = await get_setting();
                user = await usr.get_session();
            } catch (error) {
                return {
                    is_error: true,
                    data: [],
                    message: 'Unable to delete records',
                    login_redirect: false
                };
            }

            if (user == null) {
                return {
                    is_error: true,
                    data: [],
                    message: 'Session expired, please login again!',
                    login_redirect: true
                };
            }

            if (!Array.isArray(ids) || ids.length === 0) {
                return {
                    is_error: true,
                    data: [],
                    message: 'No IDs provided or IDs array is empty',
                    login_redirect: false
                };
            }

            const response = await this.axiosRequest({
                api: 'api/delete_users_by_ids',
                dataObject: {
                    data_array: ids
                },
                method: 'post',
                model_name: ''
            });

            return response;
        } catch (error) {
            return {
                is_error: true,
                data: error,
                message: 'Unable to delete records',
                login_redirect: false
            };
        }
    }
}
 
var TeamInstance = new Team(); 
   
 
export { Team, TeamInstance };