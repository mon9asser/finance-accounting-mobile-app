
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { Animated, I18nManager, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Button, Checkbox } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";

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

    componentDidMount = async () => {
         
        // setup language
        await this.setupLanguage();

        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options(); 

    }
    
    componentDidUpdate(prevProps, prevState) {
        
        this.internetConnectionMessageBox(prevProps, prevState);

    }

    AnimatedBoxforInternetWarning = () => (
            <Animated.View style={[
                    {...styles.flex, ...styles.absolute, ...styles.internet_state_box},
                    { transform: [{ translateY: this.internetStateBox }], },
            ]}>
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
    )

    headerLeftComponent = () => (
        <View style={{...styles.space_15_left}}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("Sidebar")}>
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
                    <View style={{...styles.unread_notification}}></View>
                </TouchableOpacity>
                
            </View> 

            <View>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("AppSettings")}>
                    <Image
                        source={require('./../assets/icons/settings-icon-white.png')}
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

    ChartComponents = () => (
        <View>
          
              <LineChart
                data={data}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                withVerticalLines = {false} 
                // verticalLabelRotation={60}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 0, 
                  backgroundColor: 'transparent',
                  padding:0,
                  margin:0
                }}
              />
          
              
        </View>
    )

    /*{this.AnimatedBoxforInternetWarning()}*/
    render = () => { 

        const chart_by = ["Weekly", "Monthly", "Yearly"];


        return (
           <SafeAreaView style={{...styles.container_fluid}}>

                <ScrollView>
                    
                    <View>
                        
                        <View style={{ flex: 1, alignItems: "center", flexDirection: 'row'}}>
                            
                            <View style={{flex: 1, marginTop: 15}}>
                                <SelectDropdown

                                    buttonStyle={{backgroundColor: '#fff', width: Dimensions.get('window').width - 30, marginLeft: 15, marginRight: 15, flex: 1, left: 0, borderRadius: 10}}
                                    data={chart_by}
                                    defaultButtonText = {"Sales Period"}
                                    renderDropdownIcon={() => {
                                        return (
                                            <Image
                                                source={require('./../assets/icons/arrow-down.png')}
                                                style={{width: 25, height: 25 }}
                                                resizeMode="cover"
                                            />
                                        );
                                    }}
                                    onSelect={(selectedItem, index) => {
                                        console.log(selectedItem, index)
                                    }}
                                    buttonTextAfterSelection={(selectedItem, index) => {
                                        // text represented after item is selected
                                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                                        return selectedItem
                                    }}
                                    rowTextForSelection={(item, index) => {
                                        // text represented for each item in dropdown
                                        // if data array is an array of objects then return item.property to represent item in dropdown
                                        return item
                                    }}
                                />
                            </View>

                            <View style={{flex: 1}}>
                                {this.ChartComponents()}
                            </View>
                        </View>

                    </View>

                </ScrollView>

                {this.AnimatedBoxforInternetWarning()}  
           </SafeAreaView>
        )
    }

}

export {DashboardComponents}