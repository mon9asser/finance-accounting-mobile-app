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
import {styles} from "../../objects/styles.js"; 
import {get_setting} from "./../../objects/storage/settings.js"
import {get_lang} from '../../objects/languages.js' 
import {Usr} from './../../objects/storage/user.js';

var usr = new Usr();

class LoginComponents extends Component {

    constructor(props) {

        super(props);

        this.state = {

            app_name: config.application.name,
            user_email: '',
            password: '',

            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",

            isPressed: false,

            user_email_hlght: false,
            password_hlght: false, 
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

    setUserEmailHlght = (value) => {
        this.setState({
            user_email_hlght: value
        })
    }

    setPasswordHlght = (value) => {
        this.setState({
            password_hlght: value
        })
    }

    setPressBtn = (value) => {
        this.setState({
            isPressed: value
        })
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
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

    setUserEmail = (value) => {
        this.setState({
            user_email: value
        })
    }

    setPassword = (value) => {
        this.setState({
            password: value
        })
    }

    loginUser = () => {

        this.setNotificationBox("none")
        this.setPressBtn(true); 

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

        var user_email = this.state.user_email.trim();
        var app_name = this.state.app_name.trim();
        var password = this.state.password.trim();
        var language = this.state.current_language;

        var data = { 
            email: user_email,
            password: password, 
            app_name: app_name,
            language: language
        }; 
        if( user_email == '' ) {
            this.setUserEmailHlght(true);
        }

        if( password == '' ) {
            this.setPasswordHlght(true);
        }
 

        if ( 
            user_email == '' ||
            password == ''  
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
            this.setUserEmailHlght(true);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.invalid_email);
            return;
        }  

        var axConf = {
            method: 'post', // Can be 'get', 'put', 'delete', etc.
            url: config.api('api/application/login'),
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'X-api-public-key': config.keys.public,
                'X-api-secret-key': config.keys.secret
            }
        };
        
        
        let errorCallback = (error = null) => {


            var message = '';

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

                // store app and user in session
                await usr.add_session(
                    res.data.data.application,
                    res.data.data.user
                ); 
                
                var _session = await usr.get_session();
                
                // show successful message
                if( _session !== null ) {
                    this.setNotificationBox("flex")
                    this.setNotificationCssClass(styles.success_message)
                    this.setNotificationCssTextClass(styles.success_text)
                    this.setNotificationMessage(this.state.language.successful_login); 
                }

                // transfer use to dashboard screen after 5 seconds
                setTimeout(() => {
                    this.setNotificationBox("none");
                    this.redirect_to('Dashboard'); 
                }, 500);

            } else {
                
                errorCallback(res)

            }
        }

        let error = (res) => {
            errorCallback(res)
        }

        let request = axios(axConf);
        request.then(success, error);
    }

    render = () => {

        var { navigation } = this.props;
        var localizer  = this.state.language; 

        return (
            <SafeAreaView style={styles.screens}>
                <View style={styles.container}>

                    <View style={styles.row}>

                        <View style={{...styles.space_bottom_25}}>
                            <Text style={styles.screen_headline}> {localizer.login} </Text>
                            <Text style={styles.screen_subheadline}> {localizer.login_subtitle} </Text>
                        </View>
                        
                        <View style={{borderColor:(this.state.user_email_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput onChangeText={(value) => {
                                this.setUserEmail(value);
                                this.setUserEmailHlght(false)
                            }} placeholder={localizer.email}  style={{...styles.input_field}} />
                        </View>

                        <View style={{ borderColor:(this.state.password_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput secureTextEntry={I18nManager.isRTL? false: true} onChangeText={(value) => {
                                this.setPassword(value);
                                this.setPasswordHlght(false)
                            }} placeholder={this.state.language.password} style={{...styles.input_field}} />
                        </View>  

                        <View style={{...styles.space_top_15, ...styles.direction_row, ...styles.text_left}}>
                            <Text style={{...styles.label}}>
                                {localizer.forget_password} {" "}
                            </Text>
                            <TouchableOpacity onPress={() => this.redirect_to("ResetPassword")}>
                                <Text style={{...styles.label_hlgt}}>{localizer.reset}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ ...styles.wrapper, ...this.state.notificationBox, ...this.state.notificationCssClass, ...styles.space_top_25}}>
                            <Text style={this.state.notificationTextCssClass}>{this.state.notificationMessage}</Text>
                        </View> 

                        <Button mode="contained" onPress={() => this.loginUser() } style={{ ...styles.primary_button, ...styles.space_top_25 }}>
                                {
                                    this.state.isPressed ?
                                    <ActivityIndicator color={styles.direct.color.white} />
                                    :
                                    <Text style={styles.buttonText}>{localizer.login}</Text>
                                } 
                        </Button>

                        <TouchableOpacity style={{...styles.space_top_10, ...styles.checkbox_container }}>
                             
                            <View style={{ ...styles.row, ...styles.direction_row }}>
                                <Text style={{ ...styles.label }}>
                                    { localizer.do_not_have_an_account }{" "}
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ ...styles.label_hlgt }}>
                                    <Text style={{...styles.label_hlgt}}> {localizer.register}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>    

                    </View>

                    

                </View>
            </SafeAreaView>
        );
    }

}


export { LoginComponents }