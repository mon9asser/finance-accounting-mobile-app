
import { View, Button, Text } from "react-native";
import { ProductsInstance } from "../objects/storage/products";

var TestComponent =  () => {

 
    var addData = async () => {

        var prodInstance = await ProductsInstance.create_product_price(
            '821458877059',
            '200 Pieces',
            '',
            'unit',
            620,
            25.99,
            1,
            true 
        );

        console.log(prodInstance);

    }

    var DeleteData = async () => {
        var prodInstance = await ProductsInstance.delete_product_price({local_id: '18987bfgxclnbmb17099091055641942'});
        
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
        var prodInstance = await ProductsInstance.update_product_price(
            "987458tyq79a6i7q1709908941269876",
            {
                sales_price: 124, 
                is_default_price: true
            }
        )

        console.log(prodInstance);
        console.log("------------------------------------------")
    }

    var getById = async() => {
        
        var prodInstance = await ProductsInstance.get_product_price_by_id("205839nkhczt9qfd17099090834282213");
        //console.log(prodInstance);
        prodInstance.data.forEach(x => {
            console.log( x.local_id, x.product_local_id, x.name, x.sales_price, x.is_default_price)
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