


// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { I18nManager, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput } from 'react-native';
import { Button } from "react-native-paper";

// App Files 
import {config,} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js"; 
import {get_setting} from "./../../controllers/cores/settings.js"
import {get_lang} from '../../controllers/languages.js'
 

class ChangePasswordComponents extends Component {

    constructor(props) {

        super(props);

        this.state = { 
             
            email:  (this.props.route.params && this.props.route.params.email)? this.props.route.params.email: "",
            password: '',
            confirm_password: '',

            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",

            isPressed: false, //

            password_hlght: false, //
            confirm_password_hlght: false, //

            language: {},
            current_language: "en",

            isConnected: false
        }

        this.internetState = null;
    }

     
    setCurrentLanguage = (lang = "en") => {
        this.setState({
            current_language: lang
        })
    } 

    setLanguage = (val = "en" ) => {

        var lang = get_lang(val);
        I18nManager.forceRTL(lang.is_rtl);
        this.setState({
            language: lang
        })
    }
    
    // Setup Language
    setupLanguage = async() => {
        var {language}  = await get_setting(); 
        this.setCurrentLanguage(language);
        this.setLanguage(language);
    }

    // internet connection
    internetConnectionStatus = () => {
        this.internetState = NetInfo.addEventListener(state => {
            this.setState({ isConnected: state.isConnected });
        }); 
    }

    // Assign application language
    componentDidMount = async () => {
        
        // setup language
        await this.setupLanguage();
        
        // internet connection
        this.internetConnectionStatus();

    } 
    
    componentWillUnmount() {
        // internetState to network state updates
        if (this.internetState) { 
            this.internetState();
        }
    }
    

    redirect_to = (screen) => {
        this.props.navigation.navigate(screen);
    }

 

    setPressBtn = (value) => {
        this.setState({
            isPressed: value
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

    setPassword = (value) => {
        this.setState({
            password: value
        })
    }

    setConfirmPassword = (value) => {
        this.setState({
            confirm_password: value
        })
    }

    setPasswordHlght = (value) => {
        this.setState({
            password_hlght: value
        })
    }

    setConfirmPasswordHlght = (value) => {
        this.setState({
            confirm_password_hlght: value
        })
    } 

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    submitRequest  = () => {
         
        this.setNotificationBox("none")
        this.setPressBtn(true); 
        
        if( this.state.email == '') {
            setTimeout(() => this.props.navigation.navigate("Login"), 1200)
        }

        if(! this.state.isConnected) {
            
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message);
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.connection_status);

            this.setPressBtn(false); 
            return;
        }

        if( this.state.isPressed ) {
            alert(this.state.language.validate_login_access);
            return;
        }
        var user_email = this.state.email.trim();
        var password = this.state.password.trim();
        var confirm_password = this.state.confirm_password.trim(); 
        var language = this.state.current_language

        var data = { 
            email: user_email,
            password: password,
            language: language
        }; 
 

        if( password == '' ) {
            this.setPasswordHlght(true);
        }

        if( confirm_password == '' ) {
            this.setConfirmPasswordHlght(true);
        }



        if ( 
            user_email == '' ||
            password == '' ||
            confirm_password == ''

        ) {

            this.setPressBtn(false);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message);
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.required_inputs);

            return;
        }

        if(! this.validateEmail(user_email) ) {
            this.setPressBtn(false); 
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.invalid_email);
            return;
        }  

        if( password !== confirm_password ) {
            this.setPasswordHlght(true);
            this.setConfirmPasswordHlght(true);
            this.setPressBtn(false);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.passwords_dont_match);
            return;
        }


        var axConf = {
            method: 'post', // Can be 'get', 'put', 'delete', etc.
            url: config.api('api/application/change-password'),
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'X-api-public-key': config.keys.public,
                'X-api-secret-key': config.keys.secret
            }
        };     
        
        let errorCallback = (error = null) => {
 
              
            var message = '';
            if( error.message != undefined ) {
                message = error.message;
            } else {

                if( error.response != undefined ) {
                    message = this.state.language.api_connection_error;
                    
                } else if( error.request != undefined ) {
                    message = this.state.language.api_connection_error;
                    
                    if( error.request._response ) {
                        var ob_response = JSON.parse(error.request._response);
                        if( ob_response.is_error) {
                            message = ob_response.data;
                        } 
                    }

                } else {
                    message = this.state.language.check_internet_connection
                }
            }
            
            // stop activator indicator
            this.setPressBtn(false);

            // show message on the server
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(message); 
        };

        let success = async (res) => {
            if(res.data.success) {

                // stop activator indicator
                this.setPressBtn(false);  
                
                // show successful message 
                this.setNotificationBox("flex")
                this.setNotificationCssClass(styles.success_message)
                this.setNotificationCssTextClass(styles.success_text)
                this.setNotificationMessage(res.data.data); 
                
                setTimeout(() => {
                    this.redirect_to('Login'); 
                }, 1000);


            } else {
                
                errorCallback(res)

            }
        }

        try {

            let error = (res) => {
                errorCallback(res)
            }
            
            axios(axConf).then(success).catch(err => error(err)); 

        } catch (error) {
            errorCallback(error);
        }
    }

    render = () => {

        var { navigation } = this.props;
        var localizer  = this.state.language; 

        return (
            <SafeAreaView style={styles.screens}>
                <View style={styles.container}>

                    <View style={styles.row}>

                        <View style={{...styles.space_bottom_25}}>
                            <Text style={styles.screen_headline}> {localizer.change_password} </Text>
                            <Text style={{...styles.screen_subheadline, ...styles.text_center}}>{localizer.change_password_label}</Text>
                        </View>
                        
                        <View style={{borderColor:(this.state.password_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput onChangeText={(value) => {
                                this.setPassword(value);
                                this.setPasswordHlght(false);
                            }} placeholder={localizer.password}  style={{...styles.input_field}} />
                        </View> 

                        <View style={{borderColor:(this.state.confirm_password_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput onChangeText={(value) => {
                                this.setConfirmPassword(value);
                                this.setConfirmPasswordHlght(false);
                            }} placeholder={localizer.confirm_password}  style={{...styles.input_field}} />
                        </View>  

                        <View style={{ ...styles.wrapper, ...this.state.notificationBox, ...this.state.notificationCssClass, ...styles.space_top_25}}>
                            <Text style={this.state.notificationTextCssClass}>{this.state.notificationMessage}</Text>
                        </View> 

                        <Button mode="contained" onPress={() => this.submitRequest () } style={{ ...styles.primary_button, ...styles.space_top_25 }}>
                                {
                                    this.state.isPressed ?
                                    <ActivityIndicator color={styles.direct.color.white} />
                                    :
                                    <Text style={styles.buttonText}>{localizer.save_new_password}</Text>
                                } 
                        </Button>   

                    </View>

                    

                </View>
            </SafeAreaView>
        );
    }

}


export { ChangePasswordComponents }
 