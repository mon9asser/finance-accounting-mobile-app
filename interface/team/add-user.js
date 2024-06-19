import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import Modal from "react-native-modal"; 
import RNPickerSelect from 'react-native-picker-select';

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Animated, Alert, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Button, Checkbox } from "react-native-paper"; 
import { LineChart } from "react-native-chart-kit";
import { Camera } from 'expo-camera';

// App Files 
import {config} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../../controllers/cores/settings.js";
import {get_lang} from '../../controllers/languages.js'; 
import { SelectList } from 'react-native-dropdown-select-list';
import { decode as atob } from 'base-64';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';


// Controller 
import { BranchInstance } from "../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";

import {CategoryInstance} from "../../controllers/storage/categories.js";
import { generateId } from "../../controllers/helpers.js";
import { PriceInstance } from "../../controllers/storage/prices.js"; 
import { TeamInstance } from "../../controllers/storage/team.js";
import { A_P_I_S } from "../../controllers/cores/apis.js";
import { Models } from "../../controllers/cores/models.js";

 

var RadioBox = (props) => {
    return (
        <View style={{...styles.radioBox}}>
            <View style={props.selected ? {...styles.radioBoxSelected}: {}}></View>
        </View>
    );
}

var cls = { 
    
    // Delete Button 
    btnDeleteBg: '#fe6464',
    btnDeleteColor: '#fff',
    btnDeleteBorderColor: '#fe6464',
    btnDeleteBorderTextColor:  '#fe6464',

    // Primary Button 
    btnPrimaryBg: '#399872',
    btnPrimaryColor: '#fff',
    btnPrimaryBorderColor: '#399872',
    btnPrimaryBorderTextColor: '#222'

}

class AddNewTeamMemberComponents extends Component {

    constructor(props) {

        super(props);

        this.state = {

            language: {}, 
            default_color: "#222",   
            isPressed: false, 
            
            team_member_name: "",
            user_email: "",
            password: "",
            confirm_password: "",
            user_id: "" , 

            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",

            team_member_name_hlgt: "",  
            file: null,

            branches: []
        };

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
        console.log("load user data case update") 
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
            
        }) 

    }
     
    componentDidMount = async () => {
         
        var user = await usr.get_session();
        if( user == null ) {

            this.props.navigation.navigate("Login"); 
            return;

        }
         
        // setup language
        this.setup_params();  
        
        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options(); 

        // add data to fields if session already expired before 
        await this.restore_data_to_fields();  


    } 
       
    

    setPressBtn = ( value ) => {
        this.setState({
            isPressed: value
        });
    }
    

    saveData = () => {
        
        if( this.state.isPressed ) {
            Alert.alert(this.state.language.please_wait, this.state.language.btn_clicked_twice);
            return;
        }  
        this.setPressBtn(true);  
        this.setNotificationBox("none") 
        
        var _this = this;
        (async() => {
              

            // required data 
            if( _this.state.team_member_name == "" || _this.state.user_email == "") {
    
                _this.setPressBtn(false);  

                _this.setNotificationBox("flex")
                _this.setNotificationCssClass(styles.error_message);
                _this.setNotificationCssTextClass(styles.error_text)
                _this.setNotificationMessage(this.state.language.team_member_name_required);

                return; 
            };


            if( _this.state.password !== _this.state.confirm_password) {
    
                t_thishis.setPressBtn(false);  

                _this.setNotificationBox("flex")
                _this.setNotificationCssClass(styles.error_message);
                _this.setNotificationCssTextClass(styles.error_text)
                _this.setNotificationMessage(_this.state.language.passwords_dont_match);

                return; 
            };

            
            var customerReq = await TeamInstance.add_update_new_team_member({
                name: _this.state.team_member_name,
                email: _this.state.user_email,
                password: _this.state.password
            });
            // console.log(customerReq);
            if(customerReq.login_redirect) { 
    
                _this.setPressBtn(false);    

                _this.setNotificationBox("flex")
                _this.setNotificationCssClass(styles.error_message);
                _this.setNotificationCssTextClass(styles.error_text)
                _this.setNotificationMessage(customerReq.message);

                
                // store data of form in session 
                setTimeout(async () => { 
    
                    _this.props.navigation.navigate("Login", { redirect_to: "add-new-team-member" });
                
                }, 1500); 

                return; 
            }

            if( customerReq.is_error ) {
    
                _this.setPressBtn(false);  
                _this.setNotificationBox("flex")
                _this.setNotificationCssClass(styles.error_message);
                _this.setNotificationCssTextClass(styles.error_text); 
                _this.setNotificationMessage(customerReq.data);
                
                return; 
            }
 

            _this.setPressBtn(false);   
            _this.setNotificationBox("flex")
            _this.setNotificationCssClass(styles.success_message);
            _this.setNotificationCssTextClass(styles.success_text); 
            _this.setNotificationMessage("Saved successfully");


        })(); 

    }

    render() {
        return(
            <SafeAreaView style={{...styles.container_fluid, backgroundColor: styles.direct.color.white }}>
                
               
                
                 <ScrollView contentContainerStyle={{...styles.container1}}>
                    

                    <View  style={{...styles.space_bottom_25, flex: 1, flexDirection: "column", gap: 0, marginTop: 35 }}>
                         
                        <View style={{...styles.field_container}}>
                            
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Name</Text>
                            </View>
                            
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:(this.state.team_member_name_hlgt) ? 'red': '#dfdfdf' }}>
                                <TextInput value={this.state.team_member_name} onChangeText={text => this.setState({team_member_name: text })} style={{flex: 1}} placeholder={this.state.language.user_name} />
                            </View>

                        </View>
 
                        <View style={{...styles.field_container}}>
                            
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Email</Text>
                            </View>
                            
                            <View style={{...styles.textInputNoMarginsChanged, borderColor: '#dfdfdf' }}>
                                <TextInput value={this.state.user_email} onChangeText={text => this.setState({user_email: text })} style={{flex: 1}} placeholder={this.state.language.email} />
                            </View>

                        </View>

                        <View style={{...styles.field_container}}>
                            
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Password</Text>
                            </View>
                            
                            <View style={{...styles.textInputNoMarginsChanged, borderColor: '#dfdfdf' }}>
                                <TextInput value={this.state.password} onChangeText={text => this.setState({password: text })} style={{flex: 1}} placeholder={this.state.language.password} />
                            </View>

                        </View>

                        <View style={{...styles.field_container}}>
                            
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Confirm Password</Text>
                            </View>
                            
                            <View style={{...styles.textInputNoMarginsChanged, borderColor: '#dfdfdf' }}>
                                <TextInput value={this.state.confirm_password} onChangeText={text => this.setState({confirm_password: text })} style={{flex: 1}} placeholder={this.state.language.confirm_password} />
                            </View>

                        </View>
                         
                    </View> 

                    <View style={{ ...styles.wrapper, ...this.state.notificationBox, ...this.state.notificationCssClass, ...styles.space_top_25, marginBottom: 25}}>
                         
                       <Text style={this.state.notificationTextCssClass}>{this.state.notificationMessage}</Text>
                         
                    </View> 
                        

                    <Button onPress={this.saveData}  mode="contained" style={{height: 50, marginBottom: 10, justifyContent: "center", backgroundColor: this.state.default_color}}> 
                        {
                            this.state.isPressed ?
                            <ActivityIndicator color={styles.direct.color.white} />
                            :
                            <Text style={{...styles.add_btn_bg.text}}>{this.state.language.save}</Text> 
                        }
                    </Button> 

                 </ScrollView> 
                
            </SafeAreaView>
        )
    }
}
 
 
 
// alert("get async + falg not assigned in bulk insert + when search on item name and click on edit it get error");
export {AddNewTeamMemberComponents}