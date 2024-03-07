import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Categories} from "./categories"; // it already exended from A_P_I_S class 

class Products extends Categories {

    constructor (props) {
        
        super(props);
        
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

    }

    add_new_category = async ( pname, ) => {

    }
    
    
    test = async (callback) => {
       /* var response = await super.coreAsync( 
            this.categories,
            {
                app_name: 0,
                category_name: "Salamon Items"
            }  
        ); */

        var response = await this.categories.instance.load({
            key: this.categories.key
        })

        callback(response);  
    }

}

var products = new Products();

export { products };