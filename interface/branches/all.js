
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
// import Device from 'react-native-device-info';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Button, Checkbox } from "react-native-paper"; 
import { LineChart } from "react-native-chart-kit";

// App Files 
import {config} from "./../../settings/config.js" ;
import {styles} from "./../../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "./../../controllers/cores/settings.js";
import {get_lang} from './../../controllers/languages.js'; 

// Controller 
import { BranchInstance } from "./../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";

class BranchesComponents extends Component {

    constructor(props){
        
        super(props);

        this.state = {
            language: {},
            current_language: "en",
            isConnected: true, 

            default_color: "#6c5ce7",  

            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",

            isPressed: false,

            // scroll load new data 
            branches: [],
            loading: false, 
            pageNumber: 1
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);

    } 

    setBranches = (value) => {
        this.setState({
            branches: value
        })
    }

    setLoading = (value) => {
        this.setState({
            loading: value
        })
    }

    setPageNumber = (value) => {
        this.setState({
            pageNumber: value
        })
    }


    setPressBtn = (value) => {
        this.setState({
            isPressed: value
        })
    }
 
    setLanguage = ( lang ) => {

        I18nManager.forceRTL(lang.is_rtl);
        this.setState({
            language: {...lang.branches_screen, ...lang.labels}
        });

    }

     // Setup Language
     setup_params = () => {

        // var {language}  = await get_setting(); 
        // this.setCurrentLanguage(language); 
        this.setLanguage(this.props.route.params.langs); 
        
    }


    setCurrentLanguage = (lang = "en") => {
        this.setState({
            current_language: lang
        })
    } 

    setupLanguage = async() => {
        var {language}  = await get_setting(); 
        this.setCurrentLanguage(language);
        this.setLanguage(language);
    }

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
        await this.setup_params();

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
                            source={require('./../../assets/icons/internet-state.png')}
                            style={{...styles.intenet_connection_icon}}
                            resizeMode="cover"
                        />
                        <Text style={{...styles.intenet_connection_text}}>
                            {this.state.language.internet_msg_box}
                        </Text>
                    </View>
            </Animated.View>
    )

    screen_options = () => {
        
        // Screen Options 
        this.props.navigation.setOptions({

            headerStyle: {backgroundColor: this.state.default_color}, 
            headerTitleStyle: { color: "#fff" },
            headerTintColor: '#fff',
            headerTitle: this.state.language.title, 
            // headerLeft: () => this.headerLeftComponent(), 
            headerRight: () => this.headerRightComponent()
            
        }) 

    }

    headerRightComponent = () => {
        return (
            <View style={{...styles.space_15_right}}>
                <TouchableOpacity style={{...styles.flex, ...styles.direction_row, ...styles.item_center}} onPress={() => this.props.navigation.navigate("add-new-branch")}>
                    <Image
                        source={require('./../../assets/icons/add-new-btn-white.png')}
                        style={styles.header_icon_md}
                        resizeMode="cover"
                    /> 
                   
                </TouchableOpacity>
            </View>
        );
    }

    Item = () => {
        
        return (
           <View style={{ ...styles.container_fluid, ...styles.direction_col, ...styles.gap_15, ...styles.container_scroll}}>
                 <TouchableOpacity onPress={() => this.selectThisItem(key)}  style={{borderWidth: 1, gap: 15, marginBottom: 20, padding: 15, flexDirection: "row", borderColor: ( false? "red" : "#dfdfdf"), backgroundColor: ( false? "#ffe9e9" : "transparent"), borderRadius: 10}}>
                     
                    <View style={{flexDirection: 'column', height: 100, justifyContent: 'center',  flex: 1}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 18, fontWeight: "bold"}}>
                                Teppanyaki Sushi
                            </Text> 
                        </View>

                        <View style={{flex: 1}}>
                            <Text style={{color:"grey"}}>
                                Sales: 12,500
                            </Text> 
                        </View>
                        <View style={{flex: 1, flexDirection:'row', justifyContent: 'space-between'}}>
                            <Text style={{color:"grey", marginTop: 5, flexShrink: 0}}>
                            Tel: 0544040915
                            </Text>
                            <View style={{...styles.direction_row, ...styles.gap_15}}>
                                <TouchableOpacity  onPress={() => this.editThisItem(55)}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>
                                        View Details
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity  onPress={() => this.editThisItem(55)}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>
                                        Edit
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                    </View>
                </TouchableOpacity>
           </View>
        );

    }

    render (){ 
        return (
            <SafeAreaView style={{...styles.container_fluid, backgroundColor: styles.direct.color.white }}>
                <this.Item /> 
            </SafeAreaView>
        );
    }

}

export {BranchesComponents}