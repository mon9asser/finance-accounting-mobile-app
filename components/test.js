
import { View, Button, Text } from "react-native";
import { ProductsInstance } from "../objects/storage/products";
import { PriceInstance } from "../objects/storage/prices";

var i = 100;
var TestComponent =  ({navigation}) => {

 
    var addData = async () => {
        
        i++;
        var prodInstance = await ProductsInstance.create_product_price(
            "141212df1d2f1", "mmprice",
            "man price", "kgm", 1.25, 55.11, 1, true
        )

        console.log(prodInstance);
    }

    var DeleteData = async () => {

        var prodInstance = await ProductsInstance.delete_product({
            local_id: '363329zhl367wex17099339394402122'
        });
        
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.product_local_id, x.name, x.sales_price, x.is_default_price)
        }); 
        console.log(prodInstance, "------------------------------------------")
    }
    
    var loadData = async () => {
        var prodInstance = await ProductsInstance.get_categories();
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.category_name, x.remote_saved)
        }); 
        console.log("------------------------------------------ Count: " + prodInstance.data.length)
    }

    var updateData = async() => {
        var prodInstance = await ProductsInstance.update_category(
            "61230m23fi64i22m17101166074951727",
            {
                category_name: "Rice Tepenyaki Sushi" 
            }
        );
 

        //console.log(prodInstance);
        console.log("------------------------------------------")
    }

    var getById = async() => {
        
        var prodInstance = await ProductsInstance.get_product_by_id({
            local_id: "743969rx4yvx34i1709934052609618"
        });
        
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.product_name)
        }); 
        console.log("------------------------------------------ Totals:" + prodInstance.data.length) 
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems:'center', gap: 50}}>
            <Button onPress={DeleteData} title="Delete Row" />
            <Button onPress={addData} title="Insert a new row" />
            <Button onPress={updateData} title="Update Row" />
            <Button onPress={loadData} title="Get All Data" />
            <Button onPress={getById} title="Get By Id" />
            <Button onPress={() => {navigation.navigate("Login")}} title="Login" />
        </View>
    );
}

export { TestComponent };