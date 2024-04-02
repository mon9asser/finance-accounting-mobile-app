
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
import DateTimePicker from '@react-native-community/datetimepicker'; 

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
import { usr } from "../../controllers/storage/user.js";

class ProductsComponents extends PureComponent {

    constructor( props ){
            
        super(props);

        
        this.state = {
            language: {},               //--  
            isConnected: true, 

            default_color: "#6c5ce7",   
 
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

            thumbnails: []
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);
        this.animationHeight = new Animated.Value(0);
        this.animationSlider = new Animated.Value(0);
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

    checkImageOnServer = async (imageUrl) => {
        const response = await fetch(imageUrl, { method: 'HEAD' });
            const exists = response.ok; // true if the status code is 200-299
            console.log(exists); 
    };

    setImageData = (slugName, index) => {

        var img = {uri: config.api(`uploads/${slugName}`)}

        this.setState((prevState) => {
            
            var new_ = this.state.thumbnails[index] = img;

            return {
                thumbnails: new_
            };
            
        });
    }

    setImagePlaceHolder = (index) => {
        this.setState((prevState) => {
            
            var new_ = this.state.thumbnails[index] = require('./../../assets/icons/product-placeholder.png');

            return {
                thumbnails: new_
            };
            
        });
    }

    Item_Data = ({item, index}) => {
        
        return (
            <View key={item.local_id} style={{ ...styles.container_top, ...styles.direction_col, ...styles.gap_15 }}>
                <TouchableOpacity onPress={() => this.selectThisItem(key)}  style={{borderWidth: 1, gap: 15, marginBottom: 20, padding: 15, flexDirection: "row", borderColor: ( item.is_selected? "red" : "#dfdfdf"), backgroundColor: ( item.is_selected? "#ffe9e9" : "transparent"), borderRadius: 10}}>
                    <View>
                        <Image
                            source={""}
                            style={{width: 80, height: 80, objectFit: 'cover', borderRadius: 5}}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={{flexDirection: 'column', justifyContent: 'center',  flex: 1}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 18, fontWeight: "bold"}}>
                                {item.product_name}
                            </Text>
                            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>
                                    Sale: ${item.sale_price}
                                </Text>
                                <Text style={{color: "grey", fontWeight: "400", marginTop: 5}}>
                                    Purchase: ${item.purchase_price}
                                </Text>
                            </View>
                        </View>
                        <View style={{flex: 1, flexDirection:'row', justifyContent: 'space-between'}}>
                            <Text style={{color:"grey", marginTop: 5}}>
                                #{item.category} 
                            </Text>
                            <TouchableOpacity onPress={() => this.editThisItem(item.id)}>
                                <Text style={{color: "#0B4BAA", fontWeight: "bold", marginTop: 5}}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
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
       
        var all = this.state.all_data.flat();
        if( text == "" ) {

            this.setState({
                searched_data: []
            }); 
            
            return; 
        }

        var searched_items = all.filter( item => {
            
            var index1 = item.branch_name.indexOf(text);
            var index2 = item.branch_city.indexOf(text);
            var index3 = item.branch_number.indexOf(text);

            if(index1 !== -1 || index2 !== -1 || index3 !== -1 ) {
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

        var flats = this.state.all_data.flat();
        var values = flats.filter(obj => {
            
            if( obj.created_date != null ) {

                var from = new Date(this.state.date_from.setHours(0, 0, 0, 0)).getTime();
                var to = new Date(this.state.date_to.setHours(23, 59, 59, 999)).getTime();
                var created_date = new Date(obj.created_date).getTime();
                
                return created_date >= from && created_date <= to;
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

                        <TouchableHighlight onPress={this.searchOnDataByDate} style={{borderColor: this.state.default_color, borderWidth: 1, marginTop: 15, borderRadius: 8, backgroundColor: "#fff", flex: 1, justifyContent: 'center', alignItems: "center" }}>
                            <Text style={{color: this.state.default_color}}>{this.state.language.search_by_date}</Text>
                        </TouchableHighlight>
                    </Animated.View>

                </View>

                

                <TouchableOpacity onPress={ this.select_all_records } style={{flexDirection: "row", alignItems: "center",  marginBottom: 10, marginLeft:-5}}>
                    <Checkbox status={this.state.checkbox_checked ? 'checked' : 'unchecked'} />
                    <Text style={{color: "#999"}}>{this.state.language.select_all_branches}</Text>                                
                </TouchableOpacity>
                
                 
                
            </View>

            
            </>
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
                
                { this.state.is_last_page ? <View style={{justifyContent: "center", alignItems: "center"}}><Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.language.no_more_records}</Text></View> : <ActivityIndicator size={"small"} color={this.state.default_color} /> }

                <View style={{flex: 1, marginTop: 15, borderTopColor: "#eee", borderTopWidth: 2, height: 40, alignItems:"center", flexDirection: "row", justifyContent: "space-between"}}>
                    <Text style={{color: "#999", textAlign:"center", lineHeight: 22}}>{this.state.all_data.flat().length} {this.state.all_data.flat().length > 1? this.state.language.branches: this.state.language.branch}</Text>
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
                                data={this.state.searched_data.length? this.state.searched_data: this.state.loaded_data}
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
                        <Text style={{...styles.add_btn_bg.text}}>{this.state.language.add_new_branch}</Text> 
                    </Button> 
                     
                </View>
            </SafeAreaView>
        );
    }     

}

export {ProductsComponents}