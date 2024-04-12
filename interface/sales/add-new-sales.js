
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import Modal from "react-native-modal"; 
import RNPickerSelect from 'react-native-picker-select';

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Animated, Alert, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Button, Checkbox } from "react-native-paper"; 
import { LineChart } from "react-native-chart-kit";
import { Camera } from 'expo-camera';

// App Files 
import {config} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js";  
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form, americanDateCalendar} from "../../controllers/cores/settings.js";
import {get_lang} from '../../controllers/languages.js'; 
import { SelectList } from 'react-native-dropdown-select-list';
import { decode as atob } from 'base-64';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';


// Controller 
import { BranchInstance } from "../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";

import {CategoryInstance} from "../../controllers/storage/categories.js";
import { generateId } from "../../controllers/helpers.js";
import { PriceInstance } from "../../controllers/storage/prices.js";
import { ProductInstance } from "../../controllers/storage/products.js";

import { CustomerInstance } from "../../controllers/storage/customers.js";
import { RecordedInstance } from "../../controllers/storage/last-recorded.js";
import { SalesInvoiceInstance } from "../../controllers/storage/sales.js";
import { DocDetailsInstance } from "../../controllers/storage/document-details.js";
import { A_P_I_S } from "../../controllers/cores/apis.js";
import { Models } from "../../controllers/cores/models.js";

 

var RadioBox = (props) => {
    return (
        <View style={{...styles.radioBox}}>
            <View style={props.selected ? {...styles.radioBoxSelected}: {}}></View>
        </View>
    );
}

var cls = { 
    
    // Delete Button 
    btnDeleteBg: '#fe6464',
    btnDeleteColor: '#fff',
    btnDeleteBorderColor: '#fe6464',
    btnDeleteBorderTextColor:  '#fe6464',

    // Primary Button 
    btnPrimaryBg: '#399872',
    btnPrimaryColor: '#fff',
    btnPrimaryBorderColor: '#399872',
    btnPrimaryBorderTextColor: '#222'

}


class AddNewSalesInvoiceComponents extends Component {

    constructor(props) {

        super(props);

        this.state = {

            language: {}, 
            default_color: "#EF6C00",  
             
            isPressed: false, 
            
            // givens 
            invoice_status: [
                {
                    value: 0,
                    label: "Completed"
                },
                {
                    value: 1,
                    label: "Pending"
                },
                {
                    value: 2,
                    label: "Awaiting Payment"
                },
                {
                    value: 3,
                    label: "Awaiting Shipment"
                },
                {
                    value: 4,
                    label: "Awaiting Pickup"
                },
                {
                    value: 5,
                    label: "Shipped"
                },
                {
                    value: 5,
                    label: "Delivered"
                },   
            ],

            payment_status: [
                {
                    value: 0,
                    label: "Paid"
                },
                {
                    value: 1,
                    label: "Unpaid"
                },
                {
                    value: 2,
                    label: "Partially Paid"
                },
                {
                    value: 3,
                    label: "On Account - On Credit"
                },
                {
                    value: 4,
                    label: "Overdue"
                },
                {
                    value: 5,
                    label: "Pending"
                } 
            ],

            payment_methods: [
                {
                    value: 0,
                    label: "Cash"
                },
                {
                    value: 1,
                    label: "Pos Terminal Machine" // card by network
                },
                {
                    value: 2,
                    label: "Bank Transfer"
                },
                {
                    value: 3,
                    label: "Checks"
                },
                {
                    value: 4,
                    label: "Credit Card"
                },
                {
                    value: 5,
                    label: "Debit Card"
                },
                {
                    value: 6,
                    label: "Electoronic Bank Transfers"
                },
                {
                    value: 7,
                    label: "Mobile Payment"
                },
                {
                    value: 8,
                    label: "Cryptocurrency"
                } 
            ],
 
            order_type: [
                {
                    value: 0,
                    label: "Dine-In"
                },
                {
                    value: 1,
                    label: "Takeaway"
                }, 
                {
                    value: 2,
                    label: "Drive-Thru"
                }, 
                {
                    value: 3,
                    label: "Home Delivery"
                }, 
                {
                    value: 4,
                    label: "Curbside Pickup"
                } 
            ],

            last_recorded: null,
            branches: [],
            prices: [], 
            products: [],  
            customers: [],
            
            doc_type: 0,
            doc_id: generateId(), // param_id
            doc_number: "01", // invoice_number 
            selected_invoice_status: {
                label: "Pending",
                value: 1
            },  // invoice_status          
            selected_payment_method: {
                label: "Cash",
                value: 0
            }, // payment_method
            selected_order_type: {
                label: "Takeaway",
                value: 1
            },  // order_type
            selected_customer: null,  // customer
            selected_branch: {label: "Main Branch", value: "000000012345_default_branch"}, // branch
            date: Date.now(), //date  
            total: "0.00", // total
            selected_payment_status: {
                label: "Paid",
                value: 0
            },  // payment_status
            subtotal: "0.00", // subtotal
            discount: {
                is_percentage: false,
                percentage: 0,
                value:"0.00"
            }, // discount
            tax: {
                is_percentage: false,
                percentage: 0,
                value:"0.00"
            }, // tax
            vat: {
                is_percentage: false,
                percentage: 0,
                value:"0.00"
            }, // vat
            shipping_or_delivery_cost: "0.00", // shipping_or_delivery_cost
            
            invoices_details: [], // Document Details 
            
            
            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",  

            
        };

    } 


    generateDocNumber = async () => {
        
        // get last records for this document 
        var generate = await RecordedInstance.get_last_record_number(this.state.doc_type); 
        
        if( generate.login_redirect ) {
            this.props.navigation.navigate("Login"); 
            return;
        }

        var _number = 1;
        var _zero_left = "000000";
        var invoice_number = _zero_left+_number;
        if( generate.is_error ) {
            
            this.setState({
                last_recorded: {
                    number: _number.toString(),
                    zero_left: _zero_left,
                    type: this.state.doc_type
                }
            })

            return; 
        }
         

        if( generate.data != null && generate.data.length ) {

            var data = generate.data[0];

            _zero_left = data.zero_left; 
            _number = parseInt( data.number ) + 1; 

            _at_indext = _number.toString().length - 1; 
             
            if( _at_indext >= _zero_left.length - 1 ) {
                _zero_left = "00" + "0".repeat(parseInt(_number.toString().length))
            } else {
                _zero_left =_zero_left;
            }   

            var new_index = ( ( _zero_left.length - 1 ) - _at_indext ) ;

            _zero_left = _zero_left.slice(0, new_index).toString();
            invoice_number = _zero_left + _number.toString(); 

        }
        
        this.setState({
            last_recorded: {
                number: _number.toString(),
                zero_left: _zero_left,
                type: this.state.doc_type
            },
            doc_number: invoice_number
        });

         
    }

    fill_all_branches = async ( branches = null ) => {
        
        var _branches = []; 

        if( branches  != null ) {
            _branches = branches;
        } else {
            
            var records = await BranchInstance.get_records();
            if( records.is_error ) {
                return; 
            }

            _branches = records.data; 

        }

        this.setState({
            branches: _branches
        })

    }

    setNotificationMessage = (text) => {
        this.setState({
            notificationMessage: text
        })
    }

    setNotificationBox = (value) => {
        this.setState({
            notificationBox: {
                display: value
            }
        })
    }
    
    setNotificationCssClass = (cssObject) => {
        this.setState({
            notificationCssClass: cssObject
        })
    }

    setNotificationCssTextClass = (cssObject) => {
        this.setState({
            notificationTextCssClass: cssObject
        })
    }
    
    
    setIPaymentStatusObject = (value) => {
 
        var object_data = {};
        var index = this.state.payment_status.findIndex( x => x.value == value );
        if( index != -1 ) {
            object_data =  this.state.payment_status[index]; 
        }

        this.setState({
            selected_payment_status: object_data
        });
 
    }

    setIOrderTypeObject = (value) => {
 
        var object_data = {};
        var index = this.state.order_type.findIndex( x => x.value == value );
        if( index != -1 ) {
            object_data =  this.state.order_type[index]; 
        }

        this.setState({
            selected_order_type: object_data
        });
 
    }
    
    setIPaymentMethodObject = (value) => {
 
        var object_data = {};
        var index = this.state.payment_methods.findIndex( x => x.value == value );
        if( index != -1 ) {
            object_data =  this.state.payment_methods[index]; 
        }

        this.setState({
            selected_payment_method: object_data
        });
 
    }

    setInvoiceStatusObject = (value) => {
 
        var object_data = {};
        var index = this.state.invoice_status.findIndex( x => x.value == value );
        if( index != -1 ) {
            object_data =  this.state.invoice_status[index]; 
        }

        this.setState({
            selected_invoice_status: object_data
        });
 
    }

    setCategoryObject = ( local_id ) => {

        var object_data = {};
        var index = this.state.branches.findIndex( x => x.local_id == local_id );
        if( index != -1 ) {
            object_data =  this.state.branches[index]; 
        }
      
        this.setState({
            selected_branch: object_data
        });

    }
    

    setChangedValue = ( value, setValue ) => {
        setValue(value);
    }
    
    
    AllPaymentStatusSelector = () => { 
        return (
            <RNPickerSelect 
                value={this.state.selected_payment_status.value}
                onValueChange={(value) => this.setIPaymentStatusObject(value)}
                items={this.state.payment_status}
            />
        );
    };

    AllOrdersTypesSelector = () => { 
        return (
            <RNPickerSelect 
                value={this.state.selected_order_type.value}
                onValueChange={(value) => this.setIOrderTypeObject(value)}
                items={this.state.order_type}
            />
        );
    };

    AllPaymentMethodSelector = () => { 
        return (
            <RNPickerSelect 
                value={this.state.selected_payment_method.value}
                onValueChange={(value) => this.setIPaymentMethodObject(value)}
                items={this.state.payment_methods}
            />
        );
    };
    
    AllInvoiceStatusSelector = () => { 
        return (
            <RNPickerSelect 
                value={this.state.selected_invoice_status.value}
                onValueChange={(value) => this.setInvoiceStatusObject(value)}
                items={this.state.invoice_status}
            />
        );
    };
    
    AllBranchesSelector = () => {

        var branches = this.state.branches.map( item => {
             
            return {
                label: item.branch_name,
                value: item.local_id,
                branch_country: item.branch_country,
                branch_city: item.branch_city,
                branch_address: item.branch_address,
                branch_number: item.branch_number 
            };
            
        });
          
        return (
          <RNPickerSelect 
            value={this.state.selected_branch.value}
            onValueChange={(value) => this.setCategoryObject(value)}
            items={branches}
          />
        );
    };

    setLanguage = async (lang ) => {
 
        I18nManager.forceRTL(lang.is_rtl);
        
        this.setState({
            language:lang
        });

    }

    setup_params = () => {

        // var {language}  = await get_setting(); 
        // this.setCurrentLanguage(language); 
        this.setLanguage(this.props.route.params.langs); 
        
    }

    restore_data_to_fields = async () => {
         
        if( this.props.route.params.branches ) {
            await this.fill_all_branches( this.props.route.params.branches );
        } else  {
            await this.fill_all_branches();
        }
        
        // getting all invoice data by local id ( doc_id ) 
        
        
    }

    internetConnectionStatus = () => {
        this.internetState = NetInfo.addEventListener(state => {
            this.setState({ isConnected: state.isConnected });
        });
    }
    
    screen_options = () => { 
        
        
        // Screen Options 
        this.props.navigation.setOptions({
           // headerTitle: this.state.language.add_new_branch, 
            headerStyle: {backgroundColor: this.state.default_color}, 
            headerTitleStyle: { color: "#fff" },
            headerTintColor: '#fff', 
            
        }) 

    }

    get_all_customers = async (customer_type) => {

        var customers = await CustomerInstance.get_records();

        if( customers.is_error) {
            return; 
        }

        customers = customers.data.filter( x => x.user_type == customer_type )
         
        this.setState({
            customers: customers
        }); 

    }

    get_all_prices = async () => {

        var prices = await PriceInstance.get_records();

        if( prices.is_error ) {
            return; 
        }

        this.setState({
            prices: prices.data
        }); 
    }

    find_price_object_of_product = ( local_id ) => {
        
        var price_object = null ;
        if( ! this.state.prices.length || local_id == undefined  ) {
            return price_object;
        }
        
        var filter = this.state.prices.filter( price => price.product_local_id == local_id );
        if( filter.length ) { 
            var defaultx = filter.filter( prc => prc.is_default_price == true ) 
            price_object = defaultx.length ? defaultx[defaultx.length - 1]: filter[filter.length - 1];
        }

        return price_object;

    }

    get_all_products = async () => {

        var prods = await ProductInstance.get_records();

        if( prods.is_error ) {
            return; 
        }

        this.setState({
            products: prods.data
        }); 
    }

    componentDidMount = async () => {
         
         
        // setup language
        this.setup_params();  
        
        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options(); 

        // create invoice number 
        await this.generateDocNumber();
        
        // getting all prices 
        await this.get_all_prices();

        // gettings all customers 
        await this.get_all_customers(0); 

        // getting all products 
        await this.get_all_products(); 

        // add data to fields if session already expired before 
        await this.restore_data_to_fields();  


    }

    AnimatedBoxforInternetWarning = () => (
        <View style={{...styles.direction_row, marginTop: 25, backgroundColor: "red", padding:10, borderRadius: 10, ...styles.item_center, ...styles.gap_15}}>
                
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

    setPressBtn = ( value ) => {
        this.setState({
            isPressed: value
        });
    }

    saveData = async () => {

        // generate invoice number by this.state.last_recorded object if it is not null
        if( this.state.last_recorded == null ) {
            Alert.alert(this.state.language.error, this.state.language.something_error);
            return;
        }



    }

    render() {

        var formatted_date = americanDateCalendar(this.state.date);

        return (
            <SafeAreaView style={{...styles.container_fluid, backgroundColor: styles.direct.color.white }}>
                 <ScrollView contentContainerStyle={{...styles.container2}}>
                    {this.state.isConnected? "" : this.AnimatedBoxforInternetWarning()}
                        
                        <View style={{...styles.space_bottom_25, flex: 1, flexDirection: "column", gap: 0, marginTop: 35 }}>
                            <View style={{...styles.field_container}}> 
                                
                                <View style={styles.inputLabel}>    
                                    <View style={{flexDirection:"row", gap: 15, justifyContent:'center', flex: 1}}>
                                        <Text style={styles.inputLabelText}>
                                            {this.state.language.invoice_number}
                                        </Text>
                                        <Text style={{color:this.state.default_color, fontWeight: "bold"}}>
                                            #{this.state.doc_number} 
                                        </Text>
                                    </View> 
                                </View>  
                                
                                <View style={{...styles.field_container, flexDirection: "row", gap: 10, marginTop: 10}}> 
                                    <View style={{...styles.textInputNoMarginsChanged, borderColor:(this.state.customer_name_hlgt) ? 'red': '#dfdfdf', flexGrow: 1 }}>
                                        <Image 
                                            style={{
                                                width:22,
                                                height:22,
                                                marginRight: 5
                                            }}
                                            source={require("./../../assets/icons/calendar.png")}
                                        />
                                        <TextInput value={formatted_date} onChangeText={text => this.setChangedValue(text, this.setCustomerName)} style={{flex: 1, color:"#999"}} readOnly={true} placeholder="dd/mm/yyyy" />
                                    </View>

                                    <View style={{...styles.textInputNoMarginsChanged, borderColor:(this.state.customer_name_hlgt) ? 'red': '#dfdfdf', flexGrow: 2 }}>
                                        <Image 
                                            style={{
                                                width:22,
                                                height:22,
                                                marginRight: 5
                                            }}
                                            source={require("./../../assets/icons/customer-icon.png")}
                                        />
                                        <TextInput readOnly={true} value={this.state.customer_name} onChangeText={text => this.setChangedValue(text, this.setCustomerName)} style={{flex: 1}} placeholder={this.state.language.no_customer_selected} />
                                    </View>
                                </View>

                                <View style={{...styles.field_container, flexDirection: "row", gap: 10}}> 
                                    <Text>Value</Text>
                                </View> 

                            </View>
                        </View> 
                 </ScrollView>
            </SafeAreaView>
        );

    }
    render_old () {
        return (<View>
            <this.AllBranchesSelector/>
            <this.AllInvoiceStatusSelector/> 
            <this.AllPaymentMethodSelector/>
            <this.AllOrdersTypesSelector/>
            <this.AllPaymentStatusSelector/> 

            <Button onPress= {() => {
                var mm = this.find_price_object_of_product("6647cin5z2a93v17127838906821040")
                console.log("==========================================")
                console.log("Get Price of product by product local id")
                console.log(mm)
                console.log("==========================================")
                
            }}>Get Price of product by product local id</Button>
            <Text>
               
            </Text>
            <Text>
                Sales Invoice number #{this.state.doc_number}
            </Text>
            <Text>
                Number of Products {this.state.products.length}
            </Text>
            <Text>
                Number of Prices {this.state.prices.length}
            </Text>
        </View>);
    }

}


export {  AddNewSalesInvoiceComponents }