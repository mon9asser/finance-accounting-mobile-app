
import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet, Modal, Platform } from "react-native";
import { ProductsInstance } from "../controllers/storage/products";
import { NotificationInstance } from "../controllers/storage/notifications";
import DateTimePicker from '@react-native-community/datetimepicker';

import { Camera } from 'expo-camera';

var i = 100;
var TestComponentOld =  ({navigation}) => {

 
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



var TestComponent = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [barcodeData, setBarcodeData] = useState('');
  
    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);
  
    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      setBarcodeData(data);
      alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };
  
    if (hasPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }
  
    return (
      <View style={styles.container}>
        <Camera
          style={[styles.camera, {height: 110, width: 270}]}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
          <View style={styles.barcodeBox}>
            <Text style={styles.barcodeText}>{scanned ? `Scanned: ${barcodeData}` : 'Scan a barcode'}</Text>
          </View>
        </Camera>
        {scanned && <Text onPress={() => setScanned(false)} style={styles.rescanText}>Tap to Scan Again</Text>}
      </View>
    );
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      width: '50%',
        height: 150
    },
    camera: { 
      // aspectRatio: 1,
      flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    barcodeBox: {
      flex: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    barcodeText: {
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 10,
    },
    rescanText: {
      fontSize: 18,
      padding: 15,
      textAlign: 'center',
      color: 'blue',
    },
  });
  






  

export { TestComponent };