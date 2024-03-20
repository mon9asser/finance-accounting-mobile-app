
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  


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

// Controller 
import { BranchInstance } from "../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";


class EditCurrentBranchComponents extends Component {
    
    constructor(props){
        
        super(props);

        this.state = {
            language: {},
            current_language: "en",
            isConnected: true, 

            default_color: "#6c5ce7",

            branch_name: "", 
            branch_country:"", 
            branch_city: "", 
            branch_address: "", 
            branch_number: "", 
            note: "", 
            local_id: "", 

            branch_name_hlgt: false, 

            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",

            isPressed: false 
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);

    } 
    
    setLocalId = (value) => {
         
        this.setState({
            local_id: value
        })
    }

    setColorDefault = (value) => {
         
        this.setState({
            default_color: value
        })
    }

    setNotificationMessage = (text) => {
        this.setState({
            notificationMessage: text
        })
    }

    setNotificationBox = (value) => {
        this.setState({
            notificationBox: {
                display: value
            }
        })
    }
    
    setNotificationCssClass = (cssObject) => {
        this.setState({
            notificationCssClass: cssObject
        })
    }

    setNotificationCssTextClass = (cssObject) => {
        this.setState({
            notificationTextCssClass: cssObject
        })
    }

    setCurrentLanguage = (lang = "en") => {
        this.setState({
            current_language: lang
        })
    } 

    setPressBtn = (value) => {
        this.setState({
            isPressed: value
        })
    }

    setLanguage = (lang ) => {
 
        I18nManager.forceRTL(lang.is_rtl);
        this.setState({
            language: {...lang.add_branch_screen, ...lang.labels}
        });

    }
    
    
    // Setup Language
    setup_params = () => {

        // var {language}  = await get_setting(); 
        // this.setCurrentLanguage(language); 
        this.setLanguage(this.props.route.params.langs); 
        
        if( this.props.route.params.item ) {

            this.setBranchName(this.props.route.params.item.branch_name);
            this.setBranchCountry(this.props.route.params.item.branch_country);
            this.setBranchCity(this.props.route.params.item.branch_city);
            this.setBranchAddress(this.props.route.params.item.branch_address);
            this.setBranchNumber(this.props.route.params.item.branch_number);
            this.setBranchNote(this.props.route.params.item.note);
            this.setLocalId(this.props.route.params.item.local_id);
        }
         
        
    } 

    // internet connection
    internetConnectionStatus = () => {
        this.internetState = NetInfo.addEventListener(state => {
            this.setState({ isConnected: state.isConnected });
        });
    }

    internetConnectionMessageBox = ( prevProps, prevState ) => {
        // Equivalent to useEffect, checks for state changes in isConnected
        if (prevState.isConnected !== this.state.isConnected) {
            Animated.timing(this.internetStateBox, {
              toValue: this.state.isConnected ? 0 : -125, // Slide up to 0 or slide down to -100
              duration: 300, // This can be adjusted to make the animation slower or faster
              useNativeDriver: true,
            }).start();
        }
    }

    restore_data_to_fields = async () => {


        var session_ = await get_last_session_form("add-new-branch"); 
        if( session_ == null ) {
            return; 
        }

        this.setBranchName(session_.branch_name);
        this.setBranchCountry(session_.branch_country);
        this.setBranchCity(session_.branch_city);
        this.setBranchAddress(session_.branch_address);
        this.setBranchNumber(session_.branch_number);
        this.setBranchNote(session_.note);

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
    
    componentDidUpdate(prevProps, prevState) {
        
        this.internetConnectionMessageBox(prevProps, prevState);

    }

    AnimatedBoxforInternetWarning = () => (
            <Animated.View style={[
                    {...styles.flex, ...styles.absolute, ...styles.internet_state_box},
                    { transform: [{ translateY: this.internetStateBox }], },
            ]}>
                    <View style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>
                    
                        <Image 
                            source={require('./../../assets/icons/internet-state.png')}
                            style={{...styles.intenet_connection_icon}}
                            resizeMode="cover"
                        />
                        <Text style={{...styles.intenet_connection_text}}>
                            {this.state.language.internet_msg_box}
                        </Text>
                    </View>
            </Animated.View>
    )

    screen_options = () => { 
         
        // Screen Options 
        this.props.navigation.setOptions({
            headerTitle: this.state.language.title, 
            headerStyle: {backgroundColor: this.state.default_color}, 
            headerTitleStyle: { color: "#fff" },
            headerTintColor: '#fff',
            
            // headerLeft: () => this.headerLeftComponent(), 
            // headerRight: () => this.headerRightComponent()
            
        }) 

    }

    setBranchName (value) {
        this.setState({
            branch_name: value
        })
    } 

    setBranchCountry (value) {
        this.setState({
            branch_country: value
        })
    } 

    setBranchCity (value) {
        this.setState({
            branch_city: value
        })
    } 

    setBranchNumber (value) {
        this.setState({
            branch_number: value
        })
    } 
    
    setBranchAddress (value) {
        this.setState({
            branch_address: value
        })
    } 

    setBranchNote (value) {
        this.setState({
            note: value
        })
    }  

    deleteSession = async () => {
        await usr.delete_session();
    }

    saveData = async () => {

        this.setNotificationBox("none")
        this.setPressBtn(true); 
        

        if( this.state.isPressed ) {
            alert(this.state.language.btn_clicked_twice);
            return;
        }

         
        var obj_data = { 
            branch_name: this.state.branch_name, 
            branch_country: this.state.branch_country, 
            branch_city: this.state.branch_city, 
            branch_address: this.state.branch_address, 
            branch_number: this.state.branch_number,  
            note: this.state.note,
            param_id: this.state.local_id
        }; 
 
        
        if ( this.state.branch_name == '') {
            this.setPressBtn(false);
            this.setNameHlght(true);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message);
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.branch_name_required);

            return;
        }

        var response = await BranchInstance.create_update({ ...obj_data });
        
        // case redirect order 
        if( response.login_redirect ) {
            this.setPressBtn(false);
            
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message);
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(response.message);

            setTimeout(async () => {  
                this.props.navigation.navigate("Login", { redirect_to: "edit-branch" });
            }, 1500);
            return;
        }

        // show error 
        if( response.is_error ) {
            this.setPressBtn(false); 
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message);
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(response.message);

            return;
        }

        // it is saved successfully 
        this.setPressBtn(false); 
        this.setNotificationBox("flex")
        this.setNotificationCssClass(styles.success_message);
        this.setNotificationCssTextClass(styles.success_text)
        this.setNotificationMessage(response.message);
        await delete_session_form();

        setTimeout(() => {
            this.setBranchName("");
            this.setBranchCountry("");
            this.setBranchCity("");
            this.setBranchAddress("");
            this.setBranchNumber("");
            this.setBranchNote("");

                this.props.navigation.goBack(null);
                this.props.navigation.navigate("Branches");

        }, 1500);
    }

    setNameHlght = (value) => {
        this.setState({
            branch_name_hlgt: value
        })
    }

    render() {
        

         

        return  (
            <SafeAreaView style={{...styles.container_fluid, backgroundColor: styles.direct.color.white }}>
 
                 <ScrollView contentContainerStyle={{...styles.container,  ...styles.min_heigh_680}}>
                    <KeyboardAvoidingView  style={{ ...styles.flex, ...styles.space_top_15 , ...styles.space_bottom_25 }}>
                        <View style={{ borderColor:(this.state.branch_name_hlgt) ? 'red': '#eee', ...styles.input_color_no_border, ...styles.space_top_15}}>
                            <TextInput 
                            onChangeText={(value) => {
                                this.setBranchName(value); 
                                this.setNameHlght(false);
                            }} 
                            value={this.state.branch_name}
                            placeholder={this.state.language.branch_name}  
                            style={{...styles.input_field}} />
                        </View>
                         
                        <View style={{...styles.input_color_1, ...styles.space_top_15}}>
                            <TextInput 
                            onChangeText={async (value) => {
                                this.setBranchCountry(value); 
                                //await this.deleteSession();
                            }} 
                            value={this.state.branch_country}
                            placeholder={this.state.language.branch_country_name}  
                            style={{...styles.input_field}} />
                        </View>

                        <View style={{...styles.input_color_1, ...styles.space_top_15}}>
                            <TextInput 
                            onChangeText={(value) => {
                                this.setBranchCity(value); 
                            }} 
                            value={this.state.branch_city}
                            placeholder={this.state.language.branch_city_name}  
                            style={{...styles.input_field}} />
                        </View>

                        <View style={{...styles.input_color_1, ...styles.space_top_15}}>
                            <TextInput 
                            onChangeText={(value) => {
                                this.setBranchAddress(value); 
                            }} 
                            value={this.state.branch_address}
                            placeholder={this.state.language.branch_address_name}  
                            style={{...styles.input_field}} />
                        </View>

                        <View style={{...styles.input_color_1, ...styles.space_top_15}}>
                            <TextInput 
                            onChangeText={(value) => {
                                this.setBranchNumber(value); 
                            }} 
                            value={this.state.branch_number}
                            placeholder={this.state.language.branch_number}  
                            style={{...styles.input_field}} />
                        </View>
                        <View style={{...styles.textarea, ...styles.space_top_15 }}>
                            <TextInput 
                            multiline={true} 
                            numberOfLines={10} 
                            onChangeText={(value) => {
                                this.setBranchNote(value);  
                            }} 
                            value={this.state.note}
                            placeholder={this.state.language.branch_note}  
                            style={{...styles.textarea_field}} />
                        </View>
                        
                        <View style={{ ...styles.wrapper, ...this.state.notificationBox, ...this.state.notificationCssClass, ...styles.space_top_25}}>
                            <Text style={this.state.notificationTextCssClass}>{this.state.notificationMessage}</Text>
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
 
                 {this.AnimatedBoxforInternetWarning()}  
 
                 
            </SafeAreaView> ); 
    }
}


export {EditCurrentBranchComponents}