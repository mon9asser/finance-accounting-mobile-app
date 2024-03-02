// Default
import React, { Component } from "react";

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { StyleSheet, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput } from 'react-native';
import { Button } from "react-native-paper";
// App Files 
import {config,} from "./../settings/config.js" ;
import {styles} from "./../objects/styles.js"; 
import {get_setting} from "./../objects/storage.js"
import {get_lang} from './../objects/languages.js'

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
            language: "en"
        }
    }

    translate = (key) => {
        return get_lang[this.state.language][key];
    }

    setLanguage = (val) => {
        this.setState({
            language: val
        })
    }
    
    componentDidMount = async () => {
        
        var {language}  = await get_setting();
        this.setLanguage(language)

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

        if( this.state.isPressed ) {
            alert("Please wait while we validate your login access.");
            return;
        }

        var user_email = this.state.user_email.trim();
        var app_name = this.state.app_name.trim();
        var password = this.state.password.trim();
         

        var data = {
            
            email: user_email,
            password: password, 
            app_name: app_name,
            
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
            this.setNotificationMessage("Please make sure that you have filled in all the required information.");

            return;
        }

        if(! this.validateEmail(user_email) ) {
            this.setPressBtn(false);
            this.setUserEmailHlght(true);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage("You have entered an invalid email address.");
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
        
        
        let errorCallback = (res = null) => {

            var message = '';
            if ( res.is_error ) {
                message = res.data;
            }
            
            // unkown reason 
            if( message == '' ) {
                message = 'Something went wrong, please check your internet connection and try again.'
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
                await add_session(
                    res.data.data.application,
                    res.data.data.user
                ); 
                
                var _session = await get_session();
                
                // show successful message
                if( _session !== null ) {
                    this.setNotificationBox("flex")
                    this.setNotificationCssClass(styles.success_message)
                    this.setNotificationCssTextClass(styles.success_text)
                    this.setNotificationMessage("Well done! You have successfully logged in. You will be redirected to the dashboard."); 
                }

                // transfer use to dashboard screen after 5 seconds
                setTimeout(() => {
                    this.setNotificationBox("none");
                    this.redirect_to('Dashboard'); 
                }, 500);

            } else {
                
                errorCallback(res.data)

            }
        }

        let error = (res) => {
            
            errorCallback()
        }

        let request = axios(axConf);
        request.then(success, error);
    }

    render = () => {
        return (
            <SafeAreaView style={styles.screens}>
                <View style={styles.container}>

                    <View style={styles.row}>

                        <View style={{...styles.space_bottom_25}}>
                            <Text style={styles.screen_headline}> {this.translate("login")} </Text>
                            <Text style={styles.screen_subheadline}>Please sign in to continue</Text>
                        </View>
                        
                        <View style={{borderColor:(this.state.user_email_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput onChangeText={(value) => {
                                this.setUserEmail(value);
                                this.setUserEmailHlght(false)
                            }} placeholder="Email" style={{height: 55}} />
                        </View>

                        <View style={{ borderColor:(this.state.password_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput secureTextEntry={true} onChangeText={(value) => {
                                this.setPassword(value);
                                this.setPasswordHlght(false)
                            }} placeholder="Password" style={{height: 55}} />
                        </View> 

                        <View style={{...styles.space_top_15, ...styles.direction_row, ...styles.text_left}}>
                            <Text style={{...styles.label}}>
                                Forget your password? {" "}
                            </Text>
                            <TouchableOpacity>
                                <Text style={{...styles.label_hlgt}}>Reset</Text>
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
                                    <Text style={styles.buttonText}>Login</Text>
                                } 
                        </Button>

                    </View>

                    

                </View>
            </SafeAreaView>
        );
    }

}


export { LoginComponents }