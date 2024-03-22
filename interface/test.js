
import React, { useState} from "react";
import { View, Button, Text, StyleSheet, Modal, Platform } from "react-native";
import { ProductsInstance } from "../controllers/storage/products";
import { NotificationInstance } from "../controllers/storage/notifications";
import DateTimePicker from '@react-native-community/datetimepicker';

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

    const [isPickerShow, setIsPickerShow] = useState(false);
  const [date, setDate] = useState(new Date());

  // Shows or hides the date picker based on the current state
  const showPicker = () => {
    setIsPickerShow(true);
  };

  // Updates the selected date and controls the picker visibility
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setIsPickerShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

    return (
        <View>
        <View style={{flex: 1, justifyContent: 'center', alignItems:'center', gap: 50}}>
            <Button onPress={DeleteData} title="Delete Row" />
            <Button onPress={addData} title="Insert a new row" />
            <Button onPress={updateData} title="Update Row" />
            <Button onPress={loadData} title="Get All Data" />
            <Button onPress={getById} title="Get By Id" />
            <Button onPress={() => {navigation.navigate("Login")}} title="Login" />
        </View>

        <Button title="Show Date Picker" onPress={showPicker} />
        {isPickerShow && (
        <Modal
            transparent={true}
            visible={isPickerShow}
            animationType="slide"
            onRequestClose={() => setIsPickerShow(false)}>
            <View style={styles.modalView}>
            <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={'date'}
                is24Hour={true}
                display="default"
                onChange={onChange}
            />
            {Platform.OS === 'ios' && (
                <Button onPress={() => setIsPickerShow(false)} title="Done" />
            )}
            </View>
        </Modal>
        )}
        <Text style={styles.dateText}>Selected Date: {date.toDateString()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      margin: 20,
    },
    dateText: {
      marginTop: 20,
    },
  });
  

export { TestComponent };