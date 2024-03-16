import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateId } from './../helpers.js';
import {get_lang} from './../languages.js'  


import { Models } from './models.js';

const settings = new Storage({
    size: 30,
    storageBackend: AsyncStorage,
    defaultExpires: null
}); 

var add_setting = async(options) => {

    try {
        var options = {
            language: options.language ? options.language: "en",
            theme: options.theme ? options.theme: "light",
            calculate_inventory: options.calculate_inventory ? options.calculate_inventory: true 
        };
    
        await settings.save({
            key: 'settings',
            data: options
        });
    
        return true; 
    } catch {}

}

var get_setting = async() => {

    var default_object = {
        language: "en",
        theme: "light",
        calculate_inventory: true
    }

    try {
        
        const _settings = await settings.load({
            key: 'settings',
        });  
        
        if( _settings == null ) {
            
            _settings = {
                ...default_object
            }; 
 
        } 

        return _settings;

    } catch (error) {
        return  default_object; 
    }

}

var localization = async () => {
 
    var {language} = await get_setting();
    
    var get_all = get_lang(language);     
     
    return get_all;
}

var add_last_session_form = async({name, data_object} = null) => {

    if( name == undefined || data_object == undefined ) {
        return false ;
    }

    try {


        await Models.expired_at.instance.save({
            key: Models.expired_at.key,
            data: {
                data_object: data_object,
                name: name 
            }
        });

        return true;
    } catch (error) {
        return false;
    }

}


var get_last_session_form = async(name) => {

    try {

        var form_data = await Models.expired_at.instance.load({
            key: Models.expired_at.key
        });

        if( ! Object.key(form_data).length || form_data[name] == undefined ) {
            return null; 
        }
        
        return form_data[name]; 

    } catch (error) {
        return null;
    }
}

var delete_session_form = async() => {
    try {


        await Models.expired_at.instance.save({
            key: Models.expired_at.key,
            data: {}
        });

        return true;
    } catch (error) {
        return false;
    }
}
 
export {
    get_setting, 
    add_setting, 
    localization,

    get_last_session_form,
    add_last_session_form,
    delete_session_form
};