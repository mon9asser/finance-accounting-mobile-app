
// Default
import React, { PureComponent, useState } from "react";
import NetInfo from '@react-native-community/netinfo'; 
// import Device from 'react-native-device-info';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import _ from "lodash";

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationEvents  } from '@react-navigation/native';    
import DateTimePicker from '@react-native-community/datetimepicker'; 
import * as FileSystem from 'expo-file-system';

import { FlatList, Alert, RefreshControl, TouchableHighlight, Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions, Touchable } from 'react-native';
import { Checkbox, Button, Provider as PaperProvider, DefaultTheme } from "react-native-paper"; 
 
import { LineChart } from "react-native-chart-kit";

// App Files 
import {config} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../../controllers/cores/settings.js";
import {get_lang} from '../../controllers/languages.js'; 

// Controller  
import { ProductInstance } from "../../controllers/storage/products.js";
import { PriceInstance  } from "../../controllers/storage/prices.js";
import { usr } from "../../controllers/storage/user.js";
import { conf } from "../../server/settings/config.js";

class ProductsComponents extends PureComponent {

    constructor( props ){
            
        super(props);

        
        this.state = {
            language: {},               //--  
            isConnected: true, 

            default_color: "#6b5353",   
 
            select_all: false,   

            // load all data 
            all_data: [],

            all_searched_data: [],

            // scroll load new data  
            loaded_data: [], 

            // search and filter
            searched_data: [],
            searched_page_number: 0, 

            // date
            date_from: new Date(),
            date_to: new Date(),
            open_date_from_modal: false,
            open_date_to_modal: false,


            // checked ids 
            checkbox_checked: false, 
            selected_ids: [], 

            // date picker forms 
            expanded: false,
            isFlexed: "none",

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
            data_status: this.props.route.params.langs.no_records_found,
            is_search_mode: false, 
            prices: []
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);
        this.animationHeight = new Animated.Value(0);
        this.animationSlider = new Animated.Value(0);
    }

    setSearchMode = (value) => { 
        this.setState({
            is_search_mode: value,
            no_more_results: value ? this.props.route.params.langs.no_records_found_in_this_search : this.props.route.params.langs.no_more_records
        })
    }

    setLoading = (value) => {
        this.setState({
            is_loading: value
        })
    }

    add_new_items = (items) => {
        
        if( ! this.state.searched_data.length ) {
            var _added = [...this.state.loaded_data, ...items];
            this.setState({
                loaded_data: _added
            });
        } else {
            var _added = [...this.state.searched_data, ...items];
            this.setState({
                searched_data: _added
            });
        }

    }

    performDeletionAction = async (ids) => {

        // send request 
        var reqs = await ProductInstance.delete_records(ids)
        
        if( reqs.is_error ) {
            Alert.alert(reqs.message);
            return;
        }
        
        if( reqs.login_redirect ) {
            Alert.alert(reqs.message);
            this.props.navigation.navigate("Login", {
                redirect_to: "Products"
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
            this.state.language.deletion_dialog_title, // Dialog Title
            this.state.language.sure_to_delete_row, // Dialog Message
            [
                {
                    text: this.state.language.cancel, 
                    onPress: () => this.setState({
                        is_pressed: false 
                    }), 
                    style: "cancel",
                },
                { 
                    text: this.state.language.ok, 
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

    load_all_prices = async() => {
        
        var prc = await PriceInstance.get_records();

        if( prc.is_error || ! prc.data.length ) return ;
        this.setState({
            prices: prc.data
        });
 
    }

    componentDidMount = async () => { 
        /*
        alert("https://www.npmjs.com/package/react-slidedown")
        alert("https://www.npmjs.com/package/react-native-swipe-up-down")
        alert("https://www.npmjs.com/package/react-native-date-picker")
        */
        // Load All data async 
        await this.Get_All_Data(); 

        // setup language
        await this.setup_params();

        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options();  

        // getting all prices 
        await this.load_all_prices();
        
         /*
        await ProductInstance.Schema.instance.save({
            key: ProductInstance.Schema.key,
            data: []
        })*/

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
        var reqs = await ProductInstance.get_records();
         

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

        // storing images in state 
        /*reqs.data.map(it, index => {
            if( it.file == undefined ||  )
            this.setImageData( it.file.thumbnail, index);
        })*/
        // this.setImageData( item.file.thumbnail, index);

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
         

        var new_data;
        var next_page

        if( ! this.state.searched_data.length ) {

            // increase the page with 1 
            next_page = this.state.page_number + 1;
            
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
            new_data = this.state.all_data[next_page];

        } else {

            // increase the page with 1 
            next_page = this.state.searched_page_number + 1;
            
            if( ( this.state.all_searched_data.length - 1  ) >= next_page  ) {
                
                this.setState({
                    searched_page_number: next_page 
                });
            } else {

                // show message there is no any new result 
                this.setState({
                    is_last_page: true 
                });
                return;
            }

            

            // => next_page
            new_data = this.state.all_searched_data[next_page]; 
             
        }

        this.add_new_items(new_data);
         
    }

    edit_this_item = (item) => {

        this.props.navigation.goBack(null);

        this.props.navigation.navigate("edit-product", {
            item: item.item 
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
    
    gettingImage = (item, setImageUri, placeholderOrLocalImage) => {

        setImageUri(placeholderOrLocalImage)

    }

    formatTimestamp = (timestamp) => {
        const differenceInSeconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        const differenceInMinutes = Math.floor(differenceInSeconds / 60);
        const differenceInHours = Math.floor(differenceInMinutes / 60);
        const differenceInDays = Math.floor(differenceInHours / 24);
        const differenceInWeeks = Math.floor(differenceInDays / 7);
        const differenceInYears = Math.floor(differenceInDays / 365);
        
        if (differenceInSeconds < 60) {
            return (<Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>{this.state.language.just_now}</Text>);
        } else if (differenceInMinutes < 60) {
            return (<Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>{differenceInMinutes} {this.state.language.mins_ago}</Text>);
        } else if (differenceInHours < 24) {
            return (<Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>{differenceInHours} {this.state.language.hrs_ago}</Text>);
        } else if (differenceInDays < 7) {
            return (<Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>{differenceInDays} {this.state.language.days_ago}</Text>);
        } else if (differenceInWeeks < 4) {
            // Handling weeks specifically, up to 4 weeks
            return (<Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>{differenceInWeeks} {this.state.language.weeks_ago}</Text>);
        } else if (differenceInYears >= 5) {
            const date = new Date(timestamp);
            return (<Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>{date.getDate().toString().padStart(2, '0')}/{(date.getMonth() + 1).toString().padStart(2, '0')}/{date.getFullYear()}</Text>);
        } else {
            // For months, now that weeks fill the gap between days and months, this becomes more accurate
            const differenceInMonths = Math.floor(differenceInDays / 30);
            return (<Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>{differenceInMonths} {this.state.language.month_ago}</Text>);
        }


    }
    
    editThisItem = (item, prc_list) => { 
        this.props.navigation.goBack(null);
        this.props.navigation.navigate("edit-product", {
            prices: prc_list,
            item: item 
        });
    }

    Item_Data = ({item, index}) => {
        
        // Getting Image from local storage or server 
        var inseatedImage = require("./../../assets/icons/product-placeholder.png");
        var api_img_uri = item.file == undefined || item.file.thumbnail_url == undefined ? "": item.file.thumbnail_url 

        var imageApi = config.api(`uploads/${api_img_uri}?timestamp=${new Date().getTime()}`);
 
        var [image, setImage] = useState({uri: imageApi });
         
        if( item.file != undefined &&  item.file.uri != undefined && (item.file.uri != "") ) {
            
            inseatedImage = {uri: item.file.uri };
             
            FileSystem.getInfoAsync(item.file.uri).then( x => {
                
                if( ! x.exists ) {
                    inseatedImage = require("./../../assets/icons/product-placeholder.png");
                }

            }) 
            
        } 

        // product price
        var prices = this.state.prices;
        var prc_list = [];
        var price_object = {sale: 0, purchase: 0 };
        if( prices.length) {
            
            prc_list = prices.filter( x => x.product_local_id == item.local_id );
            var primary_prc = prc_list.filter( x => x.is_default_price == true );

            if( primary_prc.length ) {
                price_object.sale = primary_prc[0].sales_price;
                price_object.purchase = primary_prc[0].purchase_price;
            } else if (prc_list.length) {
                price_object.sale = prc_list[0].sales_price;
                price_object.purchase = prc_list[0].purchase_price;
            }
            
        }
        
        var __name = "";
        
        if( item.created_by != undefined && item.created_by.name != undefined ) {
            __name = item.created_by.name.indexOf(" ") != -1 ? item.created_by.name.split(" ")[0]: item.created_by.name;
            console.log(__name);
        } else if( item.updated_by != undefined && item.updated_by.name != undefined ) {
            __name = item.updated_by.name.indexOf(" ") != -1 ? item.updated_by.name.split(" ")[0]: item.updated_by.name;
        } 
         
        return (
            <View key={item.local_id} style={{ ...styles.container_top, ...styles.direction_col, ...styles.gap_15 }}>
                <TouchableOpacity onPress={() => this.select_this_row(item.local_id)}  style={{borderWidth: 1, gap: 15, marginBottom: 20, padding: 15, flexDirection: "row", borderColor:( this.is_highlighted(item.local_id)? "red" : "#eee"), backgroundColor: ( this.is_highlighted(item.local_id)? "#ffe9e9" : "#fff"), borderRadius: 10}}>
                    <View>
                        <Image
                            source={image}
                            style={{width: 80, height: 80, objectFit: 'cover', borderRadius: 5}}
                            resizeMode="cover" 
                            onError={() => this.gettingImage(item, setImage, inseatedImage)}
                        />
                    </View>
                    <View style={{flexDirection: 'column', justifyContent: 'center',  flex: 1}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 16, color: "#444", fontWeight: "bold"}}>
                                {item.product_name}
                            </Text>
                            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>
                                    Price: {price_object.sale}
                                </Text>

                                {this.formatTimestamp(item.updated_date)}
                               
                            </View>
                        </View>
                        <View style={{flex: 1, flexDirection:'row', justifyContent: 'space-between'}}>
                            <Text style={{color:"grey", marginTop: 5}}>
                                By: {__name}
                            </Text>
                            <View style={{flexDirection: "row", gap: 10}}>
                                <TouchableOpacity onPress={() => this.editThisItem(item, prc_list)}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold", marginTop: 5}}>
                                        Edit
                                    </Text> 
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.editThisItem(item.id)}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold", marginTop: 5}}>
                                        View
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

    filter_by_texts = (text) => {
       
        if( text == "" ) {
            this.setSearchMode(false);
        } else {
            this.setSearchMode(true);
        }

        var all = this.state.all_data.flat();
        if( text == "" ) {

            this.setState({
                searched_data: []
            }); 
            
            return; 
        }

        var searched_items = all.filter( item => {
            
            var index1 = item.product_name.indexOf(text); 

            if(index1 !== -1 ) {
                return item; 
            }

        });
        
        var chunked =  searched_items.length ? _.chunk(searched_items, this.state.records): [];
       
        this.setState({
            all_searched_data:chunked,
            searched_data: chunked.length? chunked[0]: []
        }); 


    }
    
    toggleExpansion = () => {
        const { expanded } = this.state; 

        this.setState({ isFlexed: expanded ? "none" : "flex" }, () => {
            // Start the animation
            Animated.timing(this.animationSlider, {
                toValue: expanded ? "none" : "flex", // Change 300 to the desired expanded height or dynamically calculate it
                duration: 500, // Animation speed in milliseconds
                useNativeDriver: false
            }).start();
        });

        // Toggle the expanded state
        this.setState({ expanded: !expanded }, () => {
            // Start the animation
            Animated.timing(this.animationHeight, {
                toValue: expanded ? 0 : 295, // Change 300 to the desired expanded height or dynamically calculate it
                duration: 295, // Animation speed in milliseconds
                useNativeDriver: false, // Since we're animating height, we cannot use native driver
            }).start();
        });
    };

    change_date_from_value = ( event, selectedDate) => {
        
        var date_from_value = selectedDate || this.state.date_from;

        this.setState({ 
            date_from: date_from_value,
            open_date_from_modal: false
        });
        
    }

    change_date_to_value = ( event, selectedDate) => {
        
        var date_to_value = selectedDate || this.state.date_to;

        this.setState({ 
            date_to: date_to_value,
            open_date_to_modal: false
        });
        
    }

    open_date_from_picker_model = (value) => {
        this.setState({
            open_date_from_modal: value 
        })
    }

    open_date_to_picker_model = (value) => {
        this.setState({
            open_date_to_modal: value
        })
    }

    formatDate = (date) => {
        let day = date.getDate();
        let month = date.getMonth() + 1; // Months are zero indexed
        let year = date.getFullYear();
        
        // Ensuring day and month are in two digits format
        day = day < 10 ? `0${day}` : day;
        month = month < 10 ? `0${month}` : month;
    
        return `${day}/${month}/${year}`;
    };
    
    
    searchOnDataByDate = () => {
        this.setSearchMode(true);
        var flats = this.state.all_data.flat();
        
        var values = flats.filter(obj => {
            
            var target_date = obj.created_date == undefined ? obj.updated_date: obj.created_date;

            if( target_date != null ) {

                var from = new Date(this.state.date_from.setHours(0, 0, 0, 0)).getTime();
                var to = new Date(this.state.date_to.setHours(23, 59, 59, 999)).getTime();
                var the_date = new Date(target_date).getTime();
                
                return the_date >= from && the_date <= to;
            }
            
        });

        
        // increase the page with 1 
        var chunked =  values.length ? _.chunk(values, this.state.records): [];
        
        this.setState({
            all_searched_data:chunked,
            searched_data: chunked.length? chunked[0]: []
        }); 

    }

    AnimatedBoxforInternetWarning = () => (
        <View style={{...styles.direction_row, backgroundColor: "red", padding:10, borderRadius: 10, ...styles.item_center, ...styles.gap_15}}>
                
            <Image 
                source={require('./../../assets/icons/internet-state.png')}
                style={{width: 30, height: 30}} 
                resizeMode="cover"
            />
            <Text style={{...styles.intenet_connection_text}}>
                {this.state.language.internet_msg_box}
            </Text>
        </View>
    )

    HeaderComponent = () => {
        return (
            <>
            <View style={{ width: "100%", overflow:"hidden", flexDirection: "column",gap: 15}}>
                
                {this.state.isConnected? "" : this.AnimatedBoxforInternetWarning()} 

                <View style={{backgroundColor:"#f9f9f9", padding: 20, borderWidth: 1, borderColor:"#eee", borderRadius: 10}}>

                    <TouchableOpacity style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center"}} onPress={this.toggleExpansion}>
                        <Text style={{fontWeight:"bold"}}>{this.state.language.filters}</Text>
                        <Image 
                            source={require("./../../assets/icons/filters.png")}
                            style={{width: 22, height: 22}} 
                        /> 
                    </TouchableOpacity> 

                    <Animated.View style={{ 
                        overflow: 'hidden',
                        display: this.state.isFlexed,
                        height: this.animationHeight, // Bind the animated height value
                        marginTop: 20 
                    }}>
                        <View style={{height: 85, borderBottomColor: "#ddd", borderBottomWidth: 1, paddingBottom: 15}}>
                            <Text style={{color: "#999"}}>{this.state.language.search_name_phone_city}</Text>
                            <View style={{  borderColor:'#eee',  ...styles.search_inputs,justifyContent: "space-between", alignItems: "center", marginTop: 8}}>
                                <TextInput onChangeText={text => this.filter_by_texts(text)} placeholder={this.state.language.search_name_phone_city} style={{...styles.input_field}} />
                            </View>
                        </View>

                        <View style={{marginTop: 20}}>
                            <Text style={{color: "#999"}}>{this.state.language.search_by_date}</Text>
                            <View style={{marginTop: 5, height: 50}}> 
                                <TouchableHighlight onPress={() => this.open_date_from_picker_model(true)} underlayColor={"#fff"} style={{ borderColor:'#eee',  ...styles.search_inputs,justifyContent: "space-between", alignItems: "center", marginTop: 8}}>
                                    <TextInput readOnly={true} placeholder={"From date"} style={{...styles.input_field}} value={this.formatDate(this.state.date_from)} />
                                </TouchableHighlight>  

                                { this.state.open_date_from_modal && (
                                    <DateTimePicker
                                        value={this.state.date_from}
                                        mode={'date'}
                                        display="default"
                                        onChange={this.change_date_from_value}
                                    />
                                )}
                                
                                
                            </View>

                            <View style={{marginTop: 5, height: 50}}>
                                <TouchableHighlight onPress={() => this.open_date_to_picker_model(true)} underlayColor={"#fff"} style={{ borderColor:'#eee',  ...styles.search_inputs,justifyContent: "space-between", alignItems: "center", marginTop: 5}}>
                                    <TextInput readOnly={true} placeholder={"To date"} style={{...styles.input_field}} value={this.formatDate(this.state.date_to)}/>
                                </TouchableHighlight> 

                                { this.state.open_date_to_modal && (
                                    <DateTimePicker
                                        value={this.state.date_to}
                                        mode={'date'}
                                        display="default"
                                        onChange={this.change_date_to_value}
                                    />
                                )}
                            </View> 
                        </View> 

                        <View style={{flexDirection: "row", height: 60, gap: 10}}>
                            <TouchableHighlight onPress={() => this.setSearchMode(false)} style={{borderColor: this.state.default_color, borderWidth: 1, marginTop: 15, borderRadius: 8, backgroundColor: "#fff", flex: 1, justifyContent: 'center', alignItems: "center" }}>
                                <Text style={{color: this.state.default_color}}>{this.state.language.cancel}</Text>
                            </TouchableHighlight>
                            <TouchableHighlight onPress={this.searchOnDataByDate} style={{borderColor: this.state.default_color, borderWidth: 1, marginTop: 15, borderRadius: 8, backgroundColor: "#fff", flex: 1, justifyContent: 'center', alignItems: "center" }}>
                                <Text style={{color: this.state.default_color}}>{this.state.language.search_by_date}</Text>
                            </TouchableHighlight>
                        </View>
                    </Animated.View>

                </View>

                

                <TouchableOpacity onPress={ this.select_all_records } style={{flexDirection: "row", alignItems: "center",  marginBottom: 10, marginLeft:-5}}>
                    <Checkbox status={this.state.checkbox_checked ? 'checked' : 'unchecked'} />
                    <Text style={{color: "#999"}}>{this.state.language.select_all_products}</Text>                                
                </TouchableOpacity>
                
                 
                
            </View>

            
            </>
        );
    }

    add_new = () => {
        this.props.navigation.goBack(null);
        this.props.navigation.navigate("add-new-product");
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
            // this.state.language
            alert( this.state.language.press_two_times_deletion );
            return;
        }

        this.setState({
            is_pressed: true
        }); 


        if( ! ids.length ) {
            this.setState({
                is_pressed: false
            }); 
            alert(this.state.language.select_rows_to_delete);
            return;
        }


        // show confirm message 
        this.deleteConfirmMessage(ids); 

    }
    FooterComponent = () => {

        return (

            <View>
                
                { this.state.is_last_page ? <View style={{justifyContent: "center", alignItems: "center"}}><Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.no_more_results}</Text></View> : <ActivityIndicator size={"small"} color={this.state.default_color} /> }

                <View style={{flex: 1, marginTop: 15, borderTopColor: "#eee", borderTopWidth: 2, height: 40, alignItems:"center", flexDirection: "row", justifyContent: "space-between"}}>
                    <Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.all_data.flat().length} {this.state.all_data.flat().length > 1? this.state.language.products: this.state.language.product}</Text>
                    <Text style={{color: "#999", textAlign:"center", lineHeight: 22}}> {this.state.all_data.length} {this.state.all_data.length > 1? this.state.language.screens: this.state.language.screen}</Text>
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
                                // data={this.state.searched_data.length? this.state.searched_data: this.state.loaded_data}
                                data={this.state.is_search_mode? this.state.searched_data: this.state.loaded_data}
                                renderItem={({item, index}) => <this.Item_Data item={item} index={index} />}
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
                            <Text style={{...styles.delete_btn_outlined.text}}>{this.state.language.delete}</Text> 
                        </Button> 
                        : "" 
                    }
                    
                    <Button onPress={this.add_new}  mode="contained" style={{...styles.add_btn_bg.container, backgroundColor: this.state.default_color, ...styles.flex}}>
                        <Text style={{...styles.add_btn_bg.text}}>{this.state.language.add_new_product}</Text> 
                    </Button> 
                     
                </View>
            </SafeAreaView>
        );
    }     

}

export {ProductsComponents}