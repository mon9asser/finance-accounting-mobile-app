
// Default
import React, { PureComponent } from "react";
import NetInfo from '@react-native-community/netinfo';
// import Device from 'react-native-device-info';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationEvents  } from '@react-navigation/native';   

import { FlatList, RefreshControl, TouchableHighlight, Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Checkbox, Button, Provider as PaperProvider, DefaultTheme } from "react-native-paper"; 
 
import { LineChart } from "react-native-chart-kit";

// App Files 
import {config} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../../controllers/cores/settings.js";
import {get_lang} from '../../controllers/languages.js'; 

// Controller 
import { BranchInstance } from "../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";

class BranchesComponents extends PureComponent {

    constructor( props ){
            
        super(props);

        
        this.state = {
            language: {},               //--  
            isConnected: true, 

            default_color: "#6c5ce7",   
 
            select_all: false,   

            // load all data 
            all_data: [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],

            // scroll load new data  
            loaded_data: [{},{},{},{},{},{}], 
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);
    }

    setup_params = () => {

         
        var _this_lang = this.props.route.params.langs; 
        I18nManager.forceRTL(_this_lang.is_rtl);
        this.setState({
            language: _this_lang
        });
        
    }

    internetConnectionStatus = () => {
        this.internetState = NetInfo.addEventListener(state => {
            this.setState({ isConnected: state.isConnected });
        });
    }

    screen_options = () => {
        
        // Screen Options 
        this.props.navigation.setOptions({

            headerStyle: {backgroundColor: this.state.default_color}, 
            headerTitleStyle: { color: "#fff" },
            headerTintColor: '#fff',
            headerTitle: this.state.language.title, 
            // headerLeft: () => this.headerLeftComponent(), 
            headerRight: () => this.headerRightComponent()
            
        }) 

    }

    componentDidMount = async () => {

        // Load All data async 
        await this.Get_All_Data(); 

        // setup language
        await this.setup_params();

        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options();  

    }

    headerRightComponent = () => {
        return (
            <View style={{...styles.space_15_right}}>
                <TouchableOpacity style={{...styles.flex, ...styles.direction_row, ...styles.item_center}} onPress={this.add_new}>
                    <Image
                        source={require('./../../assets/icons/add-new-btn-white.png')}
                        style={styles.header_icon_md}
                        resizeMode="cover"
                    /> 
                </TouchableOpacity>
            </View>
        );
    }

    Get_All_Data = () => {

    }

    Load_More = () => {

        // Getting all data with one array

        // Devide it into parts 

        // give the main part

        console.log("data")
    }

    Item_Data = ( item ) => {
        return (
            <View style={{height: 100, backgroundColor: "blue", marginBottom: 10, justifyContent: "center"}}><Text style={{color:"#fff", textAlign:"center"}}>Items</Text></View>
        );
    }

    render (){ 

        return (
            <SafeAreaView style={{...styles.container_top, ...styles.direction_col, backgroundColor: styles.direct.color.white }}>
                
                 
                <View style={{ flex: 1, width: "100%", padding:15}}>
                    <FlatList
                        data={this.state.loaded_data}
                        renderItem={ (item) => <this.Item_Data data={item}/>}
                        keyExtractor={(item, index) => index.toString()} 
                        onEndReached={() => this.Load_More()} 
                    />
                </View>

                <View style={{ width: "100%", flexDirection: "row", height:50, paddingLeft: 15,paddingRight: 15, gap: 15}}>
                    
                    {
                        this.state.loaded_data.length ?
                        <Button mode="outlined" style={{...styles.delete_btn_outlined.container, ...styles.flex}}>
                            <Text style={{...styles.delete_btn_outlined.text}}>Delete</Text> 
                        </Button> 
                        : "" 
                    }
                    
                    <Button mode="contained" onPress={this.add_new} style={{...styles.add_btn_bg.container, backgroundColor: this.state.default_color, ...styles.flex}}>
                        <Text style={{...styles.add_btn_bg.text}}>Add new branch</Text> 
                    </Button> 
                     
                </View>
            </SafeAreaView>
        );
    }     

}

export {BranchesComponents}