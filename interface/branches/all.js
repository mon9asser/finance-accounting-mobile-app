
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
// import Device from 'react-native-device-info';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationEvents  } from '@react-navigation/native';   

import { FlatList,TouchableHighlight, Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Checkbox, Button, Provider as PaperProvider, DefaultTheme } from "react-native-paper"; 
 
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
            select_all: false, 

            loaded_for_first_time: false, 

            // scroll load new data 
            branches: [],
            loading: false, 
            pageNumber: 1
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);

    } 

    setDataLoaded = (value) => {
        this.setState({
            loaded_for_first_time: value
        })
    }

    setCheckOnBox = () => {
         
        this.setState({
            select_all: ! this.state.select_all
        });
        
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

    get_branches = async() => {
        
        var reqs = await BranchInstance.get_records([], {
            page: 1,
            size: 5
        }, true );


        if( reqs.login_redirect ) {
            this.props.navigation.navigate( "Login", { redirect_to: "Branches" });
        }

        if( reqs.is_error ) {
            return;
        }

        this.setDataLoaded(true); 

        // get last 5 or whatever size to our local storage from remote 
        this.setBranches(reqs.data); 

    }

    componentDidMount = async () => {
         
        // setup language
        await this.setup_params();

        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options();  

        // getting a data
        
        await this.get_branches(); 
        this.focusListener = this.props.navigation.addListener('focus', async () => {
            // This code will be executed when the screen is focused
            await this.get_branches(); 
        });
      

    }

    componentWillUnmount() {
        if (this.focusListener) {
            this.focusListener.remove();
        }
      
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

    Item = (item) => {
        
        return (
           <View key={item.data.index } style={{ ...styles.container_top, ...styles.direction_col, ...styles.gap_15}}>
                 <TouchableOpacity onPress={() => this.selectThisItem(key)}  style={{borderWidth: 1, gap: 15, marginBottom: 15, padding: 15, flexDirection: "row", borderColor: ( false? "red" : "#f9f9f9"), backgroundColor: ( false? "#ffe9e9" : "#f9f9f9"), borderRadius: 10}}>
                     
                    <View style={{flexDirection: 'column', height: 60, justifyContent: 'center',  flex: 1}}>
                            <View style={{flex: 1, flexDirection: "row", gap: 5, alignItems: "center"}}>
                                <Image 
                                    source={require("./../../assets/icons/location.png")}
                                    style={{width: 22, height: 22}}
                                /> 
                                <Text style={{fontSize: 16, color: "#222", fontWeight: "normal"}}>
                                    {item.data.item.branch_name}
                                </Text> 
                            </View>

                            <View style={{ flexDirection:'row', justifyContent: 'space-between'}}>
                                <Text style={{color:"grey"}}>
                                {item.data.item.branch_city}
                                </Text>  
                                <View style={{...styles.direction_row, ...styles.gap_15}}>
                                    <TouchableOpacity>
                                        <Text style={{color: "#666", fontWeight: "normal"}}> 
                                            View Details
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Text style={{color: "#666", fontWeight: "normal"}}>
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


    HeaderComponent = () => {
        return (
            <View style={{ width: "100%", overflow:"hidden", flexDirection: "column",gap: 15}}>
                
                <View style={{  borderColor:'#eee',  ...styles.search_inputs, ...styles.space_top_15,justifyContent: "space-between", alignItems: "center", marginBottom: 15}}>
                    <TextInput placeholder={"Filter by name, phone number"} style={{...styles.input_field}} />
                    <Button>
                        <Text>Filter</Text>
                    </Button>
                </View>

                <TouchableOpacity onPress={ this.setCheckOnBox } style={{flexDirection: "row", justifyContent: "left", alignItems: "center", backgroundColor: '#f9f9f9', borderRadius: 5, padding: 5, marginBottom: 15}}>
                    <Checkbox status={this.state.select_all ? 'checked' : 'unchecked'} />
                    <Text>Select all branches</Text>                                
                </TouchableOpacity>
                
            </View>
        );
    }

    render (){ 
 

        return (
            <SafeAreaView style={{...styles.container_top, ...styles.direction_col, backgroundColor: styles.direct.color.white }}>
                
                 
                <View style={{ flex: 1, width: "100%", padding:15}}>
                    {
                        this.state.branches.length ?
                        <FlatList
                            data={this.state.branches}
                            renderItem={ (item) => <this.Item data={item}/>}
                            keyExtractor={item => item.id}
                            ListHeaderComponent={()=><this.HeaderComponent/>}
                            //ListFooterComponent={()=><Text>1231312</Text>}
                        />
                        : 
                        <View style={{width: "100%",  alignContent: "center", alignItems: "center", padding: 10, borderRadius: 3, flex: 1, justifyContent: "center"}}>
                            {
                                ( this.state.loaded_for_first_time )?
                                <Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>No records have been found. Please click the button below to add a new one.</Text>
                                :
                                <ActivityIndicator color={this.state.default_color} size={"large"}></ActivityIndicator>
                            }                            
                        </View>
                    }
                </View>

                <View style={{ width: "100%", flexDirection: "row", height:50, paddingLeft: 15,paddingRight: 15, gap: 15}}>
                    
                    {
                        this.state.branches.length ?
                        <Button mode="outlined" style={{...styles.delete_btn_outlined.container, ...styles.flex}}>
                            <Text style={{...styles.delete_btn_outlined.text}}>Delete</Text> 
                        </Button> 
                        : "" 
                    }
                    
                    <Button mode="contained" onPress={() => this.props.navigation.navigate("add-new-branch")} style={{...styles.add_btn_bg.container, backgroundColor: this.state.default_color, ...styles.flex}}>
                        <Text style={{...styles.add_btn_bg.text}}>Add new branch</Text> 
                    </Button> 
                     
                </View>
            </SafeAreaView>
        );
    }

}

export {BranchesComponents}