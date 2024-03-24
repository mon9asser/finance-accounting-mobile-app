
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import Modal from "react-native-modal"; 

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Button, Checkbox } from "react-native-paper"; 
import { LineChart } from "react-native-chart-kit";

// App Files 
import {config} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../../controllers/cores/settings.js";
import {get_lang} from '../../controllers/languages.js'; 
import { SelectList } from 'react-native-dropdown-select-list';

// Controller 
import { BranchInstance } from "../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";


class AddNewProductComponents extends Component {

    constructor(props) {
        super(props);
        
        this.state = {

            language: {}, 
            default_color: "#6b5353",

        };

    }

    setLanguage = async (lang ) => {
 
        I18nManager.forceRTL(lang.is_rtl);
        
        this.setState({
            language:lang
        });

    }

    setup_params = () => {

        // var {language}  = await get_setting(); 
        // this.setCurrentLanguage(language); 
        this.setLanguage(this.props.route.params.langs); 
        
    }

    restore_data_to_fields = async () => {


        var session_ = await get_last_session_form("add-new-product"); 
        if( session_ == null ) {
            return; 
        }

        /*
        this.setBranchName(session_.branch_name);
        this.setBranchCountry(session_.branch_country);
        this.setBranchCity(session_.branch_city);
        this.setBranchAddress(session_.branch_address);
        this.setBranchNumber(session_.branch_number);
        this.setBranchNote(session_.note);*/

    }

    // internet connection
    internetConnectionStatus = () => {
        this.internetState = NetInfo.addEventListener(state => {
            this.setState({ isConnected: state.isConnected });
        });
    }
    
    screen_options = () => { 
        
        
        // Screen Options 
        this.props.navigation.setOptions({
           // headerTitle: this.state.language.add_new_branch, 
            headerStyle: {backgroundColor: this.state.default_color}, 
            headerTitleStyle: { color: "#fff" },
            headerTintColor: '#fff',
            
            // headerLeft: () => this.headerLeftComponent(), 
            // headerRight: () => this.headerRightComponent()
            
        }) 

    }

    componentDidMount = async () => {
         
        // setup language
        this.setup_params();  
        
        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options(); 

        // add data to fields if session already expired before 
        this.restore_data_to_fields();

    }

    AnimatedBoxforInternetWarning = () => (
        <View style={{...styles.direction_row, marginTop: 25, backgroundColor: "red", padding:10, borderRadius: 10, ...styles.item_center, ...styles.gap_15}}>
                
            <Image 
                source={require('./../../assets/icons/internet-state.png')}
                style={{width: 30, height: 30}} 
                resizeMode="cover"
            />

            <Text style={{...styles.intenet_connection_text}}>
                {this.state.language.internet_msg_box}
            </Text>
            
        </View>
    )

    render() {
        return(
            <SafeAreaView style={{...styles.container_fluid, backgroundColor: styles.direct.color.white }}>
                
               
                
                 <ScrollView contentContainerStyle={{...styles.container,  ...styles.min_heigh_680}}>
                    {this.state.isConnected? "" : this.AnimatedBoxforInternetWarning()} 

                    <KeyboardAvoidingView  style={{...styles.space_bottom_25, flex: 1, flexDirection: "column", gap: 30, marginTop: 35 }}>
                        
                        <View style={{ height: 200, width: "100%" }}>
                            <TouchableOpacity 
                                style={{flex: 1, flexDirection: "row",  justifyContent: "center"}}
                                onPress={() => console.log( "Upload Product Image ..." )}
                                > 
                                <Image
                                    source={require('./../../assets/icons/product-placeholder.png')}
                                    style={{height: 200, width:200, borderRadius: 25, width: "100%"}}
                                    resizeMode="cover"
                                    PlaceholderContent={<ActivityIndicator />} 
                                />
                            </TouchableOpacity> 
                        </View>

                        <View>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Product Name</Text>
                            </View>
                            <View style={styles.textInput}>
                                <TextInput style={{flex: 1}} placeholder='Product Name' />
                            </View>
                        </View>
                        
                    </KeyboardAvoidingView >
                

                    <View style={{...styles.space_bottom_25}}>
                        <Button onPress={this.saveData} style={{...styles.default_btn, backgroundColor: this.state.default_color }}>
                            {
                                this.state.isPressed ?
                                <ActivityIndicator color={styles.direct.color.white} />
                                :
                                <Text style={{color:styles.direct.color.white, ...styles.size.medium}}> {this.state.language.save} </Text> 
                            }
                        </Button>
                    </View>
                     
                 </ScrollView> 
 
                 
            </SafeAreaView>
        )
    }
}

export {AddNewProductComponents}