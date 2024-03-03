
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { I18nManager, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput } from 'react-native';
import { Button, Checkbox } from "react-native-paper";

// App Files 
import {config} from "./../settings/config.js" ;
import {styles} from "./../objects/styles.js"; 
import {get_setting} from "./../objects/storage.js"
import {get_lang} from './../objects/languages.js' 
import {add_session, get_session, delete_session } from './../objects/storage.js'



class DashboardComponents extends Component {

    constructor(props){
        
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

    componentDidMount = async () => {
         
        // setup language
        await this.setupLanguage();

        // Apply screen and header options 
        this.screen_options();



    }
    
    headerLeftComponent = () => (
        <View style={{...styles.space_15_left}}>
            <TouchableOpacity onPress={() => {}}>
                <Image
                    source={require('./../assets/icons/burger-icon.png')}
                    style={styles.header_icon}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </View>
    )

    headerRightComponent = () => (
        <View style={{...styles.space_15_right, ...styles.direction_row}}>

            <View style={{...styles.space_15_right}}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("AppNotifications")}>
                    <Image
                        source={require('./../assets/icons/notifications.png')}
                        style={styles.header_icon_md}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View> 

            <View>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("AppSettings")}>
                    <Image
                        source={require('./../assets/icons/settings-icon.png')}
                        style={styles.header_icon_md}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View> 
            
            

            
        </View>
    )

    screen_options = () => {
        
        // Screen Options 
        this.props.navigation.setOptions({

            headerBackground: () => (
                <LinearGradient
                  colors={['#F65F6E', '#9761F7']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 1, y: 0 }} // Start at the top
                  end={{ x: 0, y: 1 }} // End at the bottom
                />
            ),
            
            headerTitleStyle: { color: "#fff" },
            headerTitle: this.state.language.dashboard_title, 
            headerLeft: () => this.headerLeftComponent(), 
            headerRight: () => this.headerRightComponent()
            
        }) 

    }

    render = () => {
        
         
        
        return (
            <Text>
                Dashboard
            </Text>
        )
    }

}

export {DashboardComponents}