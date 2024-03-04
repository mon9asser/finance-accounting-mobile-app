

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
            // cardStyleInterpolator: ({ current, layouts }) => this.cardSlideFromLeft({ current, layouts }),
            headerTitle: "",
            headerTransparent: true,
            headerTintColor: '#fff',
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
                <View>
                     
                </View>
                <ScrollView contentContainerStyle={{...styles.container_scroll }}>
                    
                   
                    <View style={{backgroundColor: '#fff', padding: 20, borderRadius: 10}}>
                        
                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20}}>
                            <AnimatedCircularProgress
                                size={100}
                                width={5}
                                fill= {22}
                                tintColor="#9761F7"
                                onAnimationComplete={() => console.log('onAnimationComplete')}
                                backgroundColor="#eee">
                                {
                                    (fill) => (
                                    <Text style={{fontWeight: "bold", color: "#9761F7", fontSize: 15}}>
                                    22%
                                    </Text>
                                    )
                                }
                            </AnimatedCircularProgress>
                            <View>
                                
                                <Text style={{color: "#666", fontSize: 35, marginBottom: 2, fontWeight: 'bold'}}>27MB</Text>
                                <Text style={{...styles.label}}>Total Storage Usage</Text>
                            </View>
                        </View>


                        <View style={{borderTopColor: "#eee", borderTopWidth: 1, marginTop: 10, paddingTop: 10}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_10}}>

                                <Image
                                    source={require('./../assets/icons/subscripe-icon.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{fontWeight:"bold"}}>
                                    Supscription
                                </Text>

                            </TouchableOpacity>
                        </View>

                        
                        
                        <View style={{borderTopColor: "#eee", borderTopWidth: 1, marginTop: 10, paddingTop: 10}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_10}}>

                                <Image
                                    source={require('./../assets/icons/users.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{fontWeight:"bold"}}>
                                    Users
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{borderTopColor: "#eee", borderTopWidth: 1, marginTop: 10, paddingTop: 10}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_10}}>

                                <Image
                                    source={require('./../assets/icons/settings-icon.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{fontWeight:"bold"}}>
                                    Settings
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{borderTopColor: "#eee", borderTopWidth: 1, marginTop: 10, paddingTop: 10}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_10}}>

                                <Image
                                    source={require('./../assets/icons/support.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{fontWeight:"bold"}}>
                                    Support
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{borderTopColor: "#eee", borderTopWidth: 1, marginTop: 10, paddingTop: 10}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_10}}>

                                <Image
                                    source={require('./../assets/icons/privacy.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{fontWeight:"bold"}}>
                                Privacy Policy
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{borderTopColor: "#eee", borderTopWidth: 1, marginTop: 10, paddingTop: 10}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_10}}>

                                <Image
                                    source={require('./../assets/icons/terms.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{fontWeight:"bold"}}>
                                Terms and Conditions
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{borderTopColor: "#eee", borderTopWidth: 1, marginTop: 10, paddingTop: 10}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_10}}>

                                <Image
                                    source={require('./../assets/icons/logout.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{fontWeight:"bold"}}>
                                Logout
                                </Text>

                            </TouchableOpacity>
                        </View>

                        
                        
                    </View>
                    
                    

                </ScrollView>

            </View>
        )
    }

}

export { AppSidebarComponents }