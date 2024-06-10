
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
            api: "api/create_member", 
            dataObject: {
                data_object: data_object,
                user_id: user_id
            }, 
            method: "post",  
            model_name: ""  
        });

        return request;

    }


}
 
var TeamInstance = new Team(); 
  

(async() => {  
    
    var rs = await TeamInstance.add_update_new_team_member({
        name: "Fahd",
        email: "fahd@gmail.com",
        password: "666"
    });
    console.log(rs);

})();
 
export { Team, TeamInstance };