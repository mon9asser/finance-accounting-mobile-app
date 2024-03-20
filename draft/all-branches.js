
// Default
import React, { PureComponent } from "react";
import NetInfo from '@react-native-community/netinfo';
// import Device from 'react-native-device-info';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationEvents  } from '@react-navigation/native';   

import { FlatList, RefreshControl, TouchableHighlight, Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Checkbox, Button, Provider as PaperProvider, DefaultTheme } from "react-native-paper"; 
 
import { LineChart } from "react-native-chart-kit";

// App Files 
import {config} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../../controllers/cores/settings.js";
import {get_lang} from '../../controllers/languages.js'; 

// Controller 
import { BranchInstance } from "../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";

class BranchesComponents extends PureComponent {

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
            pageNumber: 1,
            number_of_records: 6,
            last_local_id: null,
            show_text: null 
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);

    }  

    is_duplicate_id = (data) => {

        var value = null 
        
        if( data != undefined && data.length ) {
            var last_record = data.length - 1;
            value = data[last_record].local_id;
        }

        if( value == this.state.last_local_id ) {
            return true; 
        }
        
        this.setState({
            last_local_id: value
        });

        return false;  
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
 
  

     // Setup Language
     setup_params = () => {

         
        var _this_lang = this.props.route.params.langs;

        I18nManager.forceRTL(_this_lang.is_rtl);
        this.setState({
            language: _this_lang
        });
        
        
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

    // get more data every while pages 
    load_more = async( ) => {
        
        if(this.state.loading) return;

        this.setPageNumber( this.state.pageNumber + 1 );  
        this.setLoading(true);

        var reqs = await BranchInstance.get_records([], {
            page: this.state.pageNumber,
            size: this.state.number_of_records
        }, true ); 
 

       
        if(reqs.is_error) {
            this.setLoading(false); 
            return; 
        }
        
        var is_duplicated = this.is_duplicate_id(reqs.data);
        
        if( is_duplicated ) { 

            
            this.setLoading(false); 
            
            this.setState({
                show_text: this.state.language.no_more_records
            });

            return; 
        }
        


        if( reqs.data && reqs.data.length ) {
            this.setState(prevState => {

                // Create a map from the first array, with local_id as the key and the object itself as the value.
                const existingItemsMap = prevState.branches.reduce((acc, current) => {
                    acc[current.local_id] = current;
                    return acc;
                }, {});
                
                // Now, as we filter through reqs.data, we'll check the map to ensure uniqueness
                const uniqueReqsData = reqs.data.filter(item => !existingItemsMap[item.local_id]);
                
                // Since we already have a comprehensive map of existing items, let's also convert it back to an array to combine with uniqueReqsData
                const existingItemsArray = Object.values(existingItemsMap);
                
                // Finally, merge the existing items with the unique ones from reqs.data
                const deduplicatedArray = [...existingItemsArray, ...uniqueReqsData];

                return {
                    branches: deduplicatedArray, // [...prevState.branches, ...reqs.data], 
                    loading: false,  
                };

            });
        } 
         
        console.log("=====", this.state.pageNumber );
    }

    // initial first load
    get_branches = async() => {
        
        
        setTimeout(() => this.setDataLoaded(true), 2000);  

        var reqs = await BranchInstance.get_records([], {
            page: this.state.pageNumber,
            size: this.state.number_of_records
        }, true ); 
          
        
        var reqs = await BranchInstance.get_records( ); 
        // console.log(reqs.data)
 
        if( reqs.login_redirect ) {
            this.props.navigation.navigate( "Login", { redirect_to: "Branches" });
        }

        var is_duplicated = this.is_duplicate_id(reqs.data);
        
        if( is_duplicated ) {
            
            this.setLoading(false); 
            
            this.setState({
                show_text: this.state.language.no_more_records
            });

            return; 
        }
        

        if( reqs.is_error ) {
            return;
        }  

        // get last 5 or whatever size to our local storage from remote 
        this.setBranches(reqs.data); 

        this.setPageNumber( this.state.pageNumber + 1 ); 
        this.setDataLoaded(false);

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
        
        /*
        this.unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
            // This code will be executed when the screen is focused
            
            if( this.props.route.params.last_update  ) {
                var new_data;
                var new_object = this.props.route.params.last_update.data;
                var index = this.state.branches.findIndex( x => x.local_id == new_object.local_id);
                console.log( "xxxxx : " + index, this.state.branches.length)
                if( index == -1 ) {
                    new_data = [new_object, ...this.state.branches];
                } else {
                    
                    this.state.branches[index] = new_object;
                    new_data = this.state.branches;
                }

                this.setBranches(new_data);
            }
            
        }); */
        
    } 

    componentWillUnmount() { 
        // this.unsubscribeFocusListener(); 
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

    add_new = () => {

        this.props.navigation.goBack(null);
        this.props.navigation.navigate("add-new-branch")

    }

    headerRightComponent = () => {
        return (
            <View style={{...styles.space_15_right}}>
                <TouchableOpacity style={{...styles.flex, ...styles.direction_row, ...styles.item_center}} onPress={this.add_new}>
                    <Image
                        source={require('./../../assets/icons/add-new-btn-white.png')}
                        style={styles.header_icon_md}
                        resizeMode="cover"
                    /> 
                   
                </TouchableOpacity>
            </View>
        );
    }


    callback_to = () => {
        this.setState({
            branches: []
        })
    }

    
    Item = (item) => {
        
         
        return (
           <View key={item.data.index} style={{ ...styles.container_top, ...styles.direction_col, ...styles.gap_15}}>
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
                                    <TouchableOpacity onPress={() => {
                                        
                                        this.props.navigation.goBack(null);

                                        this.props.navigation.navigate("edit-branch", {
                                            item: item.data.item 
                                        });

                                    }}>
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
                            keyExtractor={(item, index) => index.toString()} 
                            onEndReached={() => this.load_more()}
                            onEndReachedThreshold={0.2} 
                            ListHeaderComponent={ <this.HeaderComponent /> }
                            ListFooterComponent={ this.state.show_text == null && this.state.loading ? <ActivityIndicator size={"small"} color={this.state.default_color} />: <View style={{justifyContent: "center", alignItems: "center"}}><Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.show_text}</Text></View>}
                            //refreshControl={<RefreshControl/>}  
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
                    
                    <Button mode="contained" onPress={this.add_new} style={{...styles.add_btn_bg.container, backgroundColor: this.state.default_color, ...styles.flex}}>
                        <Text style={{...styles.add_btn_bg.text}}>Add new branch</Text> 
                    </Button> 
                     
                </View>
            </SafeAreaView>
        );
    }

}

export {BranchesComponents}