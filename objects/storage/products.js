import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateId } from '../helpers.js';
import {get_lang} from '../languages.js' 
import { send_update_request_for_row } from '../remote.js'; 
import {A_P_I_S} from "./apis.js";

class Products extends A_P_I_S {

    constructor (parnent_constructor) {
        
        super(parnent_constructor);
        
        this.products = {
            key: "products",
            instance: new Storage({
                size: 350,
                storageBackend: AsyncStorage,
                defaultExpires: null
            })
        }
        

        this.product_prices = {
            key: "product_prices",
            instance:  new Storage({
                size: 220,
                storageBackend: AsyncStorage,
                defaultExpires: null
            })
        }; 

        this.categories = {
            key: "categories",
            instance: new Storage({
                size: 220,
                storageBackend: AsyncStorage,
                defaultExpires: null
            })
        } 

    }
    
    
    test = async (callback) => {
        var response = await super.coreAsync(
            "anydatabase",
            this.categories,
            {
                local_id: "local id",
                app_name: "app name"
            } 
        ); 

        callback(response)
    }

}

var products = new Products();

export { products };