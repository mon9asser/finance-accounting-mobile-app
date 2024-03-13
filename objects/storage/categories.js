 
import {A_P_I_S} from "../cores/apis.js"; 
import {Models} from "../cores/models.js"; 
 
/**
 * 
 * 0 for products
 * 1 for expenses 
 * 
 */

class Categories extends A_P_I_S {

    constructor(props) {

        super(props); 
        this.Schema =  Models.categories;

    }


    create_update_category = async ({category_name, app_name, param_id} = null ) => {
       
         
        var _object =  {
            category_name: category_name == undefined? "": category_name ,
            app_name: app_name == undefined? 0: app_name 
        };

        var param_value = null;

        if( typeof param_id != 'object' && param_id != null ) {
            _object = {
                ..._object,
                local_id: param_id
            }
            param_value = {
                local_id: param_id
            }
        }

        if( typeof param_id == 'object' && param_id != null ) {
            param_value = {...param_id};
        }  
          
        var asynced = await this.coreAsync(
            this.Schema,
            _object,
            param_value
        );
        
        return asynced;

    }
    

    delete_categories = async (param_id = [] ) => {

        var param_value = Array.isArray(param_id) ? param_id : [];
 
        // getting all data 
        var reqs = await this.deleteAsync(this.Schema,param_value );

        return reqs; 

    }

}
 
var CategoryInstance = new Categories(); 

export { Categories, CategoryInstance };