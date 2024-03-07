import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateId } from './../helpers.js';
import {get_lang} from './../languages.js'  


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
 
export {get_setting, add_setting, localization}