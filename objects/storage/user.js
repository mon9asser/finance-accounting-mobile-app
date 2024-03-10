import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateId } from './../helpers.js';
import {get_lang} from './../languages.js';  


class Usr {

    constructor() {

        // user sessions 
        this.session = new Storage({
            size: 30,
            storageBackend: AsyncStorage,
            defaultExpires: 1000 * 60 * 60 * 24 // 1 day expiration
        }); 

    }

    delete_session = async () => {
        try {
            
            await this.session.save({
                key: 'user',
                data: null
            });
    
            return true; 
    
        } catch(error) {
            return false;
        }
    }

    add_session = async ( application, user ) => { 

        try {
            var userInfo = {
                id: user._id,
                name: user.name,
                email: user.email,  
                subscription: {
                    is_subscribed: application.subscription.is_subscribed,
                    from_date: application.subscription.from_date,
                    to_date: application.subscription.to_date,
                    is_paid: application.subscription.is_paid,
                }, 
                database_name: application.database_name,
                company_name: application.company_name,
                application_id: application._id,
            }
        
            await this.session.save({
                key: 'user',
                data: userInfo
            });
            
            return true; 
        } catch (error) { 
            console.log(error);
            return false;
        }
    }

    get_session = () => {
 
        try {
            
            var userInfo = this.session.load({
                key: 'user',
            });

            return userInfo;

        } catch (error) { 
            return null;

        }
    }

}

var usr = new Usr();

export {usr};