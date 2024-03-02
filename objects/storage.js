import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateId } from './helpers.js';

import { send_update_request_for_row } from './remote.js'; 

const session = new Storage({
    size: 30,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 60 * 60 * 24 // 1 day expiration
}); 

var add_session = async ( application, user ) => {

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
            company_name: application.company_name
        }
    
        await session.save({
            key: 'user',
            data: userInfo
        });
        
        return true; 
    } catch (error) { 
        return false;
    }
}

var delete_session = async () => {
    try {
        
        await session.save({
            key: 'user',
            data: null
        });

        return true; 

    } catch(error) {
        return false;
    }
}

var get_session = async () => {
    try {
        
        const _session = await session.load({
            key: 'user',
        }); 
         
        return _session;
    } catch (error) {
        return null;
    }

}



export {
    get_session,
    delete_session,
    add_session
}



 