import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateId } from '../helpers.js';
import {get_lang} from '../languages.js' 
import { send_update_request_for_row } from '../remote.js'; 
import {apis} from "./apis.js"

class Products extends A_P_I_S {

    constructor (pair) {
        
        super(pair);
        
        this.products = new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        }); 

        this.productPrices = new Storage({
            size: 220,
            storageBackend: AsyncStorage,
            defaultExpires: null
        }); 

        this.categories = new Storage({
            size: 220,
            storageBackend: AsyncStorage,
            defaultExpires: null
        });

    } 

}

var products = new Products();


export { products };