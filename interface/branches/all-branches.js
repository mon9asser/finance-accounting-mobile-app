
// Default
import React, { PureComponent } from "react";
import NetInfo from '@react-native-community/netinfo';
// import Device from 'react-native-device-info';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import _ from "lodash";

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationEvents  } from '@react-navigation/native';   

import { FlatList, Alert, RefreshControl, TouchableHighlight, Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
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

    constructor( props ){
            
        super(props);

        
        this.state = {
            language: {},               //--  
            isConnected: true, 

            default_color: "#6c5ce7",   
 
            select_all: false,   

            // load all data 
            all_data: [],

            // scroll load new data  
            loaded_data: [], 

            // checked ids 
            checkbox_checked: false, 
            selected_ids: [], 

            // needed givens 
            page_number: 0,
            records: 10,
            is_loading: false, 
            is_last_page: false,

            // delete counter
            is_pressed: false, 

            // show stats when screen is loaded
            loaded_page: false,
            refreshing: false, 
            data_status: "No records have been found. Please click the button below to add a new one."
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);
    }

    
    setLoading = (value) => {
        this.setState({
            is_loading: value
        })
    }

    add_new_items = (items) => {
        
        var _added = [...this.state.loaded_data, ...items];
        this.setState({
            loaded_data: _added
        });

    }

    performDeletionAction = async (ids) => {

        // send request 
        var reqs = await BranchInstance.delete_records(ids)
        
        if( reqs.is_error ) {
            Alert.alert(reqs.message);
            return;
        }
        
        if( reqs.login_redirect ) {
            Alert.alert(reqs.message);
            this.props.navigation.navigate("Login", {
                redirect_to: "Branches"
            });
            return;
        }

        // return deletion button 
        this.setState({
            is_pressed: false
        }); 

        await this.Get_All_Data();

    }

    deleteConfirmMessage = (ids) => {
        
        Alert.alert(
            "Confirm Deletion Action", // Dialog Title
            "Are you sure you want to delete the selected rows?", // Dialog Message
            [
                {
                    text: "Cancel", 
                    onPress: () => this.setState({
                        is_pressed: false 
                    }), 
                    style: "cancel",
                },
                { 
                    text: "OK", 
                    onPress: async () => await this.performDeletionAction(ids) // The action you want to perform on confirmation
                }
            ]
        );
    }

    
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

    componentDidMount = async () => {

        // Load All data async 
        await this.Get_All_Data(); 

        // setup language
        await this.setup_params();

        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options();   

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

    Get_All_Data = async () => {

        // show loading for 2 secs
        this.setLoading(true);

        // send request to get the data
        var reqs = await BranchInstance.get_records();
         

        // check for error and see error message
        if( reqs.is_error ) {
            
            this.setState({
                loaded_page: true
            })

            this.setState({
                data_status: reqs.message
            })

            return; 
        }  

        // if yes chunk the big array into small pieces 
        var paging = _.chunk(reqs.data, this.state.records);
        this.setState({
            all_data: paging
        });
        
        // by default set page number with 1 
        this.setState({
            page_number: 0
        }) 

        // assign records for page 1
        this.setState({
            loaded_data: paging[0]
        })
        
        // disable loading proccess 
        if( reqs.data ) {
            this.setState({
                loaded_page: true
            })
        }
    }

    Load_More = () => {

        // increase the page with 1 
        var next_page = this.state.page_number + 1;
        
        if( ( this.state.all_data.length - 1  ) >= next_page  ) {
            
            this.setState({
                page_number: next_page 
            });
        } else {

            // show message there is no any new result 
            this.setState({
                is_last_page: true 
            });
            return;
        }

        // => next_page
        var new_data = this.state.all_data[next_page];
        this.add_new_items(new_data);
         
    }

    edit_this_item = (item) => {

        this.props.navigation.goBack(null);

        this.props.navigation.navigate("edit-branch", {
            item: item.data.item 
        });

    }

    select_this_row = (id) => {

        if( id == undefined ) return; 

       this.setState((prevState) => {

            var index = prevState.selected_ids.indexOf(id);
            var array = [];
            if( index == -1 ) {
                array = [...prevState.selected_ids, id];
            } else {
                array = prevState.selected_ids.filter( x => x != id );
            } 

            return {
                selected_ids: array
            }
       })
        
       

    }

    Item_Data = ( item, key ) => {
        return (
            <View key={item.data.index} style={{ ...styles.container_top, ...styles.direction_col, ...styles.gap_15}}>
                 <TouchableOpacity onPress={() => this.select_this_row(item.data.item.local_id)} style={{borderWidth: 1, gap: 15, marginBottom: 15, padding: 15, flexDirection: "row", borderColor: ( this.is_highlighted(item.data.item.local_id)? "red" : "#f9f9f9"), backgroundColor: ( this.is_highlighted(item.data.item.local_id)? "#ffe9e9" : "#f9f9f9"), borderRadius: 10}}>
                     
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
                                    <TouchableOpacity onPress={() => this.edit_this_item(item)}>
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

    is_highlighted = ( item_id ) => {
        
        if( item_id == undefined ) {
            return false;
        }

        var selected = this.state.selected_ids;
 
        if( this.state.checkbox_checked ) {
            return true; 
        }

        if(selected.length && selected.indexOf(item_id) !== -1 ) {
            return true;
        }

        return false; 

    }

    select_all_records = () => { 
        
        this.setState((prevState) => {
            return {
                checkbox_checked: !prevState.checkbox_checked,
            };
        }); 

    }

    HeaderComponent = () => {
        return (
            <View style={{ width: "100%", overflow:"hidden", flexDirection: "column",gap: 15}}>
                

                <View>
                    <TouchableOpacity>
                        <Text>Filters</Text>
                    </TouchableOpacity>

                    <View style={{  borderColor:'#eee',  ...styles.search_inputs, ...styles.space_top_15,justifyContent: "space-between", alignItems: "center", marginBottom: 15}}>
                        <TextInput placeholder={"Filter by name, phone, city"} style={{...styles.input_field}} />
                    </View>
                </View>

                

                <TouchableOpacity onPress={ this.select_all_records } style={{flexDirection: "row", alignItems: "center",  marginBottom: 10, marginLeft:-5}}>
                    <Checkbox status={this.state.checkbox_checked ? 'checked' : 'unchecked'} />
                    <Text style={{color: "#999"}}>Select all branches</Text>                                
                </TouchableOpacity>
                
            </View>
        );
    }

    add_new = () => {
        this.props.navigation.goBack(null);
        this.props.navigation.navigate("add-new-branch");
    }

    setRefreshing = (value) => {
        this.setState({
            refreshing: value
        })
    }

    onRefresh = async () => {

        this.setRefreshing(true);

        await this.Get_All_Data();

        this.setRefreshing(false);

    };

    delete_rows = () => {
         
        var ids = [];
        if( this.state.checkbox_checked ) {
            ids = this.state.all_data.flat().map(item => ( item.local_id !== undefined)? item.local_id: null ).filter(x => x !== null );
        
        } else {
            ids = this.state.selected_ids; 
        }

        if( this.state.is_pressed ) {
            alert( "We already deleting your records, please wait ..." );
            return;
        }

        this.setState({
            is_pressed: true
        }); 


        if( ! ids.length ) {
            this.setState({
                is_pressed: false
            }); 
            alert("You have to select data first then press on the deletion button");
            return;
        }


        // show confirm message 
        this.deleteConfirmMessage(ids); 

    }
    FooterComponent = () => {

        return (

            <View>
                
                { this.state.is_last_page ? <View style={{justifyContent: "center", alignItems: "center"}}><Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.language.no_more_records}</Text></View> : <ActivityIndicator size={"small"} color={this.state.default_color} /> }

                <View style={{flex: 1, marginTop: 15, borderTopColor: "#eee", borderTopWidth: 2, height: 40, alignItems:"center", flexDirection: "row", justifyContent: "space-between"}}>
                    <Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.all_data.flat().length} Branche(s)</Text>
                    <Text style={{color: "#999", textAlign:"center", lineHeight: 22}}> {this.state.all_data.length} Page(s)</Text>
                </View>

            </View>
        )
    }
    render (){ 

        return (
            <SafeAreaView style={{...styles.container_top, ...styles.direction_col, backgroundColor: styles.direct.color.white }}>
                
                 
                <View style={{ flex: 1, width: "100%", padding:15}}>

                    {
                        ( ! this.state.loaded_page ) ?
                        <View style={{width: "100%",  alignContent: "center", alignItems: "center", padding: 10, borderRadius: 3, flex: 1, justifyContent: "center"}}><ActivityIndicator color={this.state.default_color} size={"large"}></ActivityIndicator></View> :
                        ( this.state.all_data.length ) ?
                            <FlatList
                                data={this.state.loaded_data}
                                renderItem={ (item) => <this.Item_Data data={item}/>}
                                keyExtractor={(item, index) => item.local_id.toString()} 
                                onEndReached={() => this.Load_More()} 
                                onEndReachedThreshold={0.2} 
                                refreshControl={
                                    <RefreshControl 
                                        titleColor="#fff" 
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.onRefresh}
                                        colors={[this.state.default_color]}
                                    />
                                }
                                ListHeaderComponent={ <this.HeaderComponent /> }
                                ListFooterComponent={ <this.FooterComponent /> }
                            /> :<View style={{width: "100%",  alignContent: "center", alignItems: "center", padding: 10, borderRadius: 3, flex: 1, justifyContent: "center"}}><Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.data_status}</Text></View>
                    }
                    


                    

                </View>

                <View style={{ width: "100%", flexDirection: "row", height:80, paddingBottom: 30,paddingTop: 0, paddingLeft: 15,paddingRight: 15, gap: 15}}>
                    
                    {
                        this.state.loaded_data && this.state.loaded_data.length ?
                        <Button onPress={this.delete_rows} mode="outlined" style={{...styles.delete_btn_outlined.container, ...styles.flex, opacity:(this.state.checkbox_checked || this.state.selected_ids.length )? 1: 0.5}}>
                            <Text style={{...styles.delete_btn_outlined.text}}>Delete</Text> 
                        </Button> 
                        : "" 
                    }
                    
                    <Button onPress={this.add_new}  mode="contained" style={{...styles.add_btn_bg.container, backgroundColor: this.state.default_color, ...styles.flex}}>
                        <Text style={{...styles.add_btn_bg.text}}>Add new branch</Text> 
                    </Button> 
                     
                </View>
            </SafeAreaView>
        );
    }     

}

export {BranchesComponents}