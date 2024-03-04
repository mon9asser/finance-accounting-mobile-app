

// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';  


// Distruct 
import { Ionicons } from '@expo/vector-icons';
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
import { AnimatedCircularProgress, Circle } from 'react-native-circular-progress';

class AppSidebarComponents extends Component {
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

    cardSlideFromLeft = ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-layouts.screen.width, 0],
              }),
            },
          ],
        },
    })

    screen_options = () => {
        
        this.props.navigation.setOptions({  
            cardStyleInterpolator: ({ current, layouts }) => this.cardSlideFromLeft({ current, layouts }),
            headerShown: false
        })

    }
     

    componentDidMount = async () => {
        
        // setup language
        await this.setupLanguage(); 

        // Screen Option
        this.screen_options();

    }
    render = () => {
        return (
            <View style={{...styles.container_fluid }}> 

                <LinearGradient
                    // Array of colors to create the gradient from
                    colors={['#F65F6E', '#9761F7']} 
                    style={{...styles.sidebar_bg}}
                    start={{ x: 1, y: 0 }} // Start at the top
                     end={{ x: 0, y: 1 }} // End at the bottom
                />
                <View style={{...styles.header_continaer}}>
                    <View style={{...styles.container_fluid_bottom }}> 
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()} >
                            <Ionicons name="arrow-back" size={24} color="white"/>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={{...styles.container_scroll }}>
                    <View>
                    <AnimatedCircularProgress
                        size={100}
                        width={5}
                        fill= {22}
                        tintColor="red"
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#fff">
                        {
                            (fill) => (
                            <Text style={{fontWeight: "bold", color: "#fff", fontSize: 15}}>
                               22%
                            </Text>
                            )
                        }
                        </AnimatedCircularProgress>
                    </View>
                </ScrollView>

            </View>
        )
    }

}

export { AppSidebarComponents }