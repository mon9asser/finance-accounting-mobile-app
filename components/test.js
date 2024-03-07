
import { View, Button, Text } from "react-native";
import { CatInstance } from "../objects/storage/categories";

var TestComponent =  () => {

    var addData = () => {
        CatInstance.create_category(
            "Fried Items",
            0
        );
    }

    var loadData = async () => {
       var dataar = await CatInstance.get_categories();
        
       dataar.data.forEach(element => {
            console.log(element.category_name);
       }); 
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems:'center'}}>
            <Button onPress={addData} title="Send Request" />
            <Button onPress={loadData} title="View Data" />
        </View>
    );
}

export { TestComponent };