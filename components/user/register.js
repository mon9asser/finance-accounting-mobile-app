
// Default
import React, { Component } from "react";
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { I18nManager, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput } from 'react-native';
import { Button, Checkbox } from "react-native-paper";

// App Files 
import {config,} from "../../settings/config.js" ;
import {styles} from "../../objects/styles.js"; 
import {get_setting} from "../../objects/storage.js"
import {get_lang} from '../../objects/languages.js' 


class RegisterComponents extends Component {
    
    constructor(props) {

        super(props);

        this.state = {
            app_name: config.application.name,
            company_name: '',
            user_name: '',
            user_email: '',
            password: '',
            confirm_password: '',
            agree_checkbox: false,
            platform: config.application.platform,
            version: config.application.version,

            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",

            isPressed: false,

            company_name_hlght: false,
            user_name_hlght: false,
            user_email_hlght: false,
            password_hlght: false,
            confirm_password_hlght: false,

            language: {},
            current_language: "en"

        };
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
    
    
    // Assign application language
    componentDidMount = async () => {
        
        var {language}  = await get_setting(); 
        this.setCurrentLanguage(language);
        this.setLanguage(language);
        
    }

    setCompanyNameHlght = (value) => {
        this.setState({
            company_name_hlght: value
        })
    }

    setUserNameHlght = (value) => {
        this.setState({
            user_name_hlght: value
        })
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

    setConfirmPasswordHlght = (value) => {
        this.setState({
            confirm_password_hlght: value
        })
    } 

    setPressBtn = (value) => {
        this.setState({
            isPressed: value
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
     
    setNotificationMessage = (text) => {
        this.setState({
            notificationMessage: text
        })
    }


    setCompanyName = (value) => {
        this.setState({
            company_name: value
        })
    }

    setUserName = (value) => {
        this.setState({
            user_name: value
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

    setConfirmPassword = (value) => {
        this.setState({
            confirm_password: value
        })
    }

    setAgreeCheckbox = (value) => {
        this.setState({
            agree_checkbox: value
        })
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    redirect_to = (screen) => {
        this.props.navigation.navigate(screen);
    }

    setAcceptTermsConditions = ( ) => {
        this.setState({
            agree_checkbox: ! this.state.agree_checkbox
        })
    }

    registerNewUser = () => {

        this.setNotificationBox("none")
        this.setPressBtn(true);

        if( this.state.isPressed ) {
            alert(this.state.language.complete_application);
            return;
        }

        var company = this.state.company_name.trim();
        var user_name = this.state.user_name.trim();
        var user_email = this.state.user_email.trim();
        var password = this.state.password.trim();
        var confirm_password = this.state.confirm_password.trim();
        var platform = this.state.platform.trim();
        var version = this.state.version;
        var app_name = this.state.app_name.trim();
        var agree_checkbox = this.state.agree_checkbox;

        var data = {
            name: user_name,
            email: user_email,
            password: password,
            company_name: company,
            app_name: app_name,
            platform: platform,
            version: version
        };

        
        if( company == '' ) {
            this.setCompanyNameHlght(true);
        }

        if( user_name == '' ) {
            this.setUserNameHlght(true);
        }

        if( user_email == '' ) {
            this.setUserEmailHlght(true);
        }

        if( password == '' ) {
            this.setPasswordHlght(true);
        }

        if( confirm_password == '' ) {
            this.setConfirmPasswordHlght(true);
        }

        if (
            company == '' ||
            user_name == '' ||
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
            this.setUserEmailHlght(true);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.invalid_email);
            return;
        }

        if( password !== confirm_password ) {
            this.setPressBtn(false);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.passwords_dont_match);
            return;
        }
        
        if( agree_checkbox === false ) { 
            this.setPressBtn(false);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message)
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage(this.state.language.check_agree_checkbox);
            return;
        }

        var axConf = {
            method: 'post', // Can be 'get', 'put', 'delete', etc.
            url: config.api('api/application/create'),
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
                message = this.state.language.check_internet_connection
            } else if( error.request != undefined ) {
                message = this.state.language.api_connection_error;
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
                    this.setNotificationMessage(this.state.language.successful_login); 
                }

                // transfer use to dashboard screen after 5 seconds
                setTimeout(() => {
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
                    <ScrollView contentContainerStyle={styles.scrollContainer}>

                        <View style={{...styles.space_bottom_25}}>
                            <Text style={styles.screen_headline}> {localizer.get_started} </Text>
                            <Text style={styles.screen_subheadline}> {localizer.register_subtitle} </Text>
                        </View>

                        <View style={{borderColor:(this.state.company_name_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput onChangeText={(value) => {  
                                this.setCompanyName(value);
                                this.setCompanyNameHlght(false)
                            }} placeholder={localizer.company_name} style={{...styles.input_field}} />
                        </View>   

                        <View style={{borderColor:(this.state.user_name_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput onChangeText={(value) => {
                                this.setUserName(value);
                                this.setUserNameHlght(false)
                            }} placeholder={localizer.full_name} style={{...styles.input_field}} />
                        </View> 

                        <View style={{borderColor:(this.state.user_email_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput onChangeText={(value) => {
                                this.setUserEmail(value);
                                this.setUserEmailHlght(false)
                            }} placeholder={localizer.email} style={{...styles.input_field}} />
                        </View>    

                        <View style={{borderColor:(this.state.password_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput secureTextEntry={true} onChangeText={(value) => {
                                this.setPassword(value);
                                this.setPasswordHlght(false)
                            }} placeholder={localizer.password}  style={{...styles.input_field}} />
                        </View>   

                        <View style={{borderColor:(this.state.confirm_password_hlght) ? 'red': '#eee', ...styles.input, ...styles.space_top_15}}>
                            <TextInput secureTextEntry={true} onChangeText={(value) => {
                                this.setConfirmPassword(value);
                                this.setConfirmPasswordHlght(false)
                            }} placeholder={localizer.confirm_password} style={{...styles.input_field}} />
                        </View>    

                        <TouchableOpacity onPress={() => this.setAcceptTermsConditions()} style={{...styles.space_top_15, ...styles.checkbox_container }}>
                            <Checkbox status={ this.state.agree_checkbox ? 'checked' : 'unchecked'} /> 
                            <Text style={{ ...styles.label }}>
                                { localizer.i_agree_to }{" "}
                                <Text style={{ ...styles.label_hlgt }} onPress={() => {/* Handle Terms press */}}>
                                    {localizer.terms}
                                </Text>
                                {" "}{ localizer.and }{" "}
                                <Text style={{ ...styles.label_hlgt }} onPress={() => {/* Handle Conditions press */}}>
                                    {localizer.condition}
                                </Text>.
                            </Text>
                        </TouchableOpacity>    

                        <View style={{ ...styles.wrapper, ...this.state.notificationBox, ...this.state.notificationCssClass, ...styles.space_top_25}}>
                            <Text style={this.state.notificationTextCssClass}>{this.state.notificationMessage}</Text>
                        </View> 

                        <Button mode="contained" onPress={() => this.registerNewUser() } style={{ ...styles.primary_button, ...styles.space_top_25 }}>
                                {
                                    this.state.isPressed ?
                                    <ActivityIndicator color={styles.direct.color.white} />
                                    :
                                    <Text style={styles.buttonText}>{localizer.register}</Text>
                                } 
                        </Button>

                        <TouchableOpacity style={{...styles.space_top_10, ...styles.checkbox_container }}>
                             
                            <View style={{ ...styles.row, ...styles.direction_row }}>
                                <Text style={{ ...styles.label }}>
                                    { localizer.do_have_an_account }{" "}
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ ...styles.label_hlgt }}>
                                    <Text style={{...styles.label_hlgt}}> {localizer.login}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>    

                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }

}

export {RegisterComponents};