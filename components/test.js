
import { View, Button, Text } from "react-native";
import { ProductsInstance } from "../objects/storage/products";

var TestComponent =  () => {

 
    var addData = async () => {

        var prodInstance = await ProductsInstance.create_product_price(
            '124554411055',
            '30 Pieces',
            '',
            'unit',
            151,
            14.99,
            1,
            true 
        );

        console.log(prodInstance);

    }

    var DeleteData = async () => {
        var prodInstance = await ProductsInstance.delete_product_price({product_local_id: '124554411410'});
        
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.product_local_id, x.name, x.sales_price, x.is_default_price)
        }); 
        console.log(prodInstance, "------------------------------------------")
    }
    
    var loadData = async () => {
        var prodInstance = await ProductsInstance.get_product_prices();
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.product_local_id, x.name, x.sales_price, x.is_default_price)
        }); 
        console.log("------------------------------------------")
    }

    var updateData = async() => {
         
    }

    var getById = async() => {
        
        var prodInstance = await ProductsInstance.get_product_price_by_id("xx94927a5c5ausvfi17098970281071037");
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.product_local_id, x.name, x.sales_price, x.is_default_price)
        }); 

        console.log("------------------------------------------")
        console.log("------------------------------------------")
        console.log("------------------------------------------")
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems:'center', gap: 50}}>
            <Button onPress={DeleteData} title="Delete Row" />
            <Button onPress={addData} title="Insert a new row" />
            <Button onPress={updateData} title="Update Row" />
            <Button onPress={loadData} title="Get All Data" />
            <Button onPress={getById} title="Get By Id" />
        </View>
    );
}

export { TestComponent };