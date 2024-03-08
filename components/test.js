
import { View, Button, Text } from "react-native";
import { ProductsInstance } from "../objects/storage/products";

var TestComponent =  () => {

 
    var addData = async () => {

        var prodInstance = await ProductsInstance.create_product(
            {
                product_name: "Nigiri Sushi",
                category_id: 1544,
                barcode: "14584",
                discount: {
                    is_percentage: true,
                    percentage: 10 ,
                    value: 20 
                } 
            }
        );

        
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
        var prodInstance = await ProductsInstance.get_products();
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.product_name, x.barcode)
        }); 
        console.log("------------------------------------------ Count: " + prodInstance.data.length)
    }

    var updateData = async() => {
        var prodInstance = await ProductsInstance.update_product(
            "743969rx4yvx34i17099340526109618",
            {
                product_name: "Bana Sushi", 
                barcode: "14584",
                discount: {
                    is_percentage: true,
                    percentage: 10 ,
                    value: 20 
                } 
            }
        );
 

        console.log(prodInstance);
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
        </View>
    );
}

export { TestComponent };