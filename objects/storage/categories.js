import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get_response } from './../helpers.js';
import {A_P_I_S} from "./apis.js";
import {localization} from "./../storage/settings.js"; 



/**
 * 
 * 0 for products
 * 1 for expenses 
 * 
 */

class Categories extends A_P_I_S {

    constructor(props) {

        super(props)
        
        this.categories = {
            key: "categories",
            instance: new Storage({
                size: 220,
                storageBackend: AsyncStorage,
                defaultExpires: null
            })
        } 

    }


    create_update_category = async ({category_name, app_name, param_id} = null ) => {

        var language = await localization();
        
        return this.coreAsync(
            this.categories,
            {
                
            }
        );

    }
  

}
 
var CatInstance = new Categories();

var callback = async() => {
    var asynced = await CatInstance.create_update_category({
        category_name: "My Updated Category", 
        app_name: 999
    }, "34721poe7cbhtg9p17102065587751403");

    console.log(asynced);
}

callback();

export { Categories, CatInstance };