

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
import { I18nManager, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Animated } from 'react-native';
import { Button, Checkbox } from "react-native-paper";

// App Files 
import {config} from "./../settings/config.js" ;
import {styles} from "./../controllers/styles.js"; 
import {get_setting} from "./../controllers/cores/settings.js"
import {get_lang} from './../controllers/languages.js' 
 import { AnimatedCircularProgress, Circle } from 'react-native-circular-progress';

class AppSidebarComponents extends Component {
    constructor(props) {
        
        super(props);

        this.state = {
            language: {},
            current_language: "en",
            isConnected: true 
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);

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

        // internet connection status
        this.internetConnectionStatus();

        // Screen Option
        this.screen_options();
         
        
    }

    componentDidUpdate(prevProps, prevState) {
        
        this.internetConnectionMessageBox(prevProps, prevState);

    }
    
    render = () => {

        

        return (
            <SafeAreaView style={{...styles.chart_container, ...styles.flex, alignItems:"center" }}>
                
                <LinearGradient

                    // Array of colors to create the gradient from
                    colors={['#F65F6E', '#9761F7']} 
                    style={{...styles.sidebar_bg, flex: 1}}
                    start={{ x: 1, y: 0 }} // Start at the top
                    end={{ x: 0, y: 1 }} // End at the bottom
                />  

                <ScrollView contentContainerStyle={{...styles.container_scroll}}>
                 
                   
                    <View style={{...styles.sidebar_container}}>
                        
                        <View style={{...styles.sidebar_header}}>
                            <AnimatedCircularProgress
                                size={100}
                                width={5}
                                fill= {22}
                                tintColor="#9761F7"
                                onAnimationComplete={() => console.log('onAnimationComplete')}
                                backgroundColor="#eee">
                                {
                                    (fill) => (
                                    <Text style={{...styles.circle_text}}>
                                    22%
                                    </Text>
                                    )
                                }
                            </AnimatedCircularProgress>
                            <View>
                                
                                <Text style={{...styles.capacity_number}}>
                                    27GB
                                </Text>
                                <Text style={{...styles.label}}>{this.state.language.total_storage_usage}</Text>
                            </View>
                        </View>


                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/subscripe-icon.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                {this.state.language.supscription}
                                </Text>

                            </TouchableOpacity>
                        </View>

                        
                        
                       <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/users.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                {this.state.language.mywork_team}
                                </Text>

                                <Text style={{...styles.label_right}}>
                                    {this.state.language.add_new_user}
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/settings-icon.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                    {this.state.language.settings}
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/log-history.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                    {this.state.language.team_log_history}
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/support.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                    {this.state.language.support} 
                                </Text>

                            </TouchableOpacity>
                        </View>
 

                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/privacy.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                {this.state.language.privacypolicy} 
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/terms.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                {this.state.language.terms_condition} 
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/trash.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                    {this.state.language.delete_account} 
                                </Text>

                            </TouchableOpacity>
                        </View>

                        <View style={{...styles.sidebar_nav_item}}>
                            <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                                <Image
                                    source={require('./../assets/icons/logout.png')}
                                    style={styles.header_icon}
                                    resizeMode="cover"
                                />

                                <Text style={{...styles.bold}}>
                                    {this.state.language.logout}  
                                </Text>

                            </TouchableOpacity>
                        </View>

                        

                        
                        
                    </View>
                    
                    

                </ScrollView>
                                

                <Animated.View
                style={[
                    {...styles.flex, ...styles.absolute, ...styles.internet_state_box},
                    { transform: [{ translateY: this.internetStateBox }], },
                ]}
                >
                    <View style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>
                    
                        <Image 
                            source={require('./../assets/icons/internet-state.png')}
                            style={{...styles.intenet_connection_icon}}
                            resizeMode="cover"
                        />
                        <Text style={{...styles.intenet_connection_text}}>
                            {this.state.language.internet_msg_box}
                        </Text>
                    </View>
                </Animated.View>
 
            </SafeAreaView>
        )
    }

}

export { AppSidebarComponents }