
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';   
import { I18nManager, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput } from 'react-native';
import { Button, Checkbox } from "react-native-paper";

// App Files 
import {config} from "./../settings/config.js" ;
import {styles} from "./../objects/styles.js"; 
import {get_setting} from "./../objects/storage.js"
import {get_lang} from './../objects/languages.js' 
import {add_session, get_session, delete_session } from './../objects/storage.js'


class AppSettingsComponents extends Component {

    constructor(props) {
        
        super(props);

        this.state = {
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

    cardSlideFromRight = ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
    })

    screen_options = () => {
        
        this.props.navigation.setOptions({  
            headerStyle: {backgroundColor: "#82589F"},
            headerTitleStyle: { color: "#fff" },
            headerTintColor: "#fff",
            headerTitle: this.state.language.app_settings, 
            cardStyleInterpolator: ({ current, layouts }) => this.cardSlideFromRight({ current, layouts })
        })

    }
     

    componentDidMount = async () => {
        
        // setup language
        await this.setupLanguage(); 

        // Screen Option
        this.screen_options();

    }

    render = () => {
        
    }

}

export { AppSettingsComponents }