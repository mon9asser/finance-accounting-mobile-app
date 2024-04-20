
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import Modal from "react-native-modal"; 
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker'; 

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
import { update } from "lodash";

 

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
            single_choosed: false,  // handle double click on item 

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

            // models
            open_date_time_picker: false, 
            customer_modal_open: false, 
            item_modal_open: false, 
            quantity_modal_open: false, 
            in_search_mode: false, 
            multiple_items: false, 

            // all data
            last_recorded: null,
            branches: [],
            prices: [], 
            products: [],  
            customers: [],
            
            customers_search: [],
            products_search: [],
            
            is_out: true, 
            doc_type: 0,
            doc_id: generateId(), // param_id
            doc_number: null, // invoice_number 
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
            selected_products: null,
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
            

            index_in_update: -1,
            object_in_update: null,
            invoices_details: [], // Document Details 
            
            quantity_number: 1,
            
            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",  

            
        };

    } 

     

    setDefaultQuantity = (increase = true) => {
   
        this.setState(prevState => {
            // Parse the current state to a float, then adjust by 1 based on 'increase'
            let newQuantity = parseFloat(prevState.quantity_number);
            newQuantity = increase ? newQuantity + 1 : newQuantity - 1;

            // Prevent the quantity from dropping below 1
            newQuantity = Math.max(newQuantity, 1);

            // Return the new state
            return { quantity_number: newQuantity.toString() }; // Convert to string for TextInput compatibility
        });
        
    }

    setMultipleItems = () => {
        
        var objectx = {
            multiple_items: ! this.state.multiple_items
        }
         

        this.setState((prevState) => {
            
            if( objectx.multiple_items == false ) {

                if( prevState.selected_products != null && prevState.selected_products.length ) {
                    var objx = [];
                    objx.push(prevState.selected_products[prevState.selected_products.length - 1]);
                    objectx.selected_products = objx;
                }
            }

            return objectx;
        });

        if( objectx.multiple_items == false && this.state.selected_products != null && this.state.selected_products.length ) {
            this.setOpenItemModal();
        }

    }

    setOpenCustomerModal = () => {
        
        this.setState({
            customer_modal_open: ! this.state.customer_modal_open
        });

        
    }

    setOpenItemModal = () => {
        this.setState({
            item_modal_open: ! this.state.item_modal_open
        });
    }

    setOpenQuantityModal = () => {
        this.setState({
            quantity_modal_open: ! this.state.quantity_modal_open
        });
    }

    add_new_item = () => {

        this.setState({
            selected_products: []
        }); 

        this.setOpenItemModal();

    }

    oddoreven = ( index ) => {
        
        var bg = "#fff"

        if( index % 2 == 0 ) {
            bg = "#f9f9f9";
        }

        return bg; 

    }

     
    filter_customers_in_search = (text) => {
        
 
        var copy = this.state.customers.filter(customer => { 
 

            
            // search by cutomer name 
            var name = customer.customer_name.indexOf(text) !== -1;

            // search by branch name  
 

            // search by phone number 

            // search by address 


            if( name ) {
                return customer;
            }

        });
        
        var in_search_mode = false; 

        if( text != "" && ! copy.length ) {
            in_search_mode = true
        } 
        
        if ( text != "" && copy.length  ) {
            in_search_mode = true
        }

        if( text == "" ) {
            in_search_mode = false; 
        }

        this.setState({
            in_search_mode: in_search_mode, 
            customers_search: text == "" ? []: copy 
        }); 

    }

    filter_products_in_search = (text) => {

    }

    calculate_object = (selectedArray, qty = 1, prce = null, discount_obj = {} ) => {
       
        // prepare needed object 
        var calcs = selectedArray.map(itemObject => {

            var quantity = qty;
            var total_qty = ( quantity * parseFloat( itemObject.default_price.factor ));
            var calculate_cost = quantity * parseFloat( itemObject.default_price.purchase_price )
            var subtotal = ( quantity * parseFloat( prce == null ? itemObject.default_price.sales_price: prce ) )
            
            var discount_value = 0;
            var discount_percentage = 0;
            
            // discount comes with product  
            if( discount_obj.is_percentage == undefined ) {
                if( itemObject.discount.is_percentage ) {
                    discount_percentage = parseFloat( itemObject.discount.percentage );
                    discount_value = Math.round( subtotal * discount_percentage / 100 );
                } else {
                    discount_value = parseFloat( itemObject.discount.value );
                }
            } else {
                if( discount_obj.is_percentage ) {
                    discount_percentage = parseFloat( discount_obj.percentage );
                    discount_value = Math.round( subtotal * discount_percentage / 100 );
                } else {
                    discount_value = parseFloat( discount_obj.value );
                }
            }
            

            var calculate_total_price = subtotal - discount_value;


            var objx = {
                doc_id: this.state.doc_id,
                doc_type: this.state.doc_type,
                is_out: this.state.is_out, 
                product: {
                    local_id: itemObject.local_id, 
                    name: itemObject.product_name, 
                    default_discount: itemObject.discount
                },
                branch: this.state.selected_branch,
                price: {
                    local_id: itemObject.default_price.local_id,
                    name: itemObject.default_price.name,
                    sale: itemObject.default_price.sales_price,
                    cost: itemObject.default_price.purchase_price,
                    unit_name: itemObject.default_price.unit_name,
                    unit_short: itemObject.default_price.unit_short,
                    factor: itemObject.default_price.factor
                },
                updated_discount: {
                    is_percentage: false,
                    percentage: discount_percentage,
                    value: discount_value
                },
                updated_price: {
                    local_id: itemObject.default_price.local_id,
                    name: itemObject.default_price.name,
                    sale: itemObject.default_price.sales_price,
                    cost: itemObject.default_price.purchase_price,
                    unit_name: itemObject.default_price.unit_name,
                    unit_short: itemObject.default_price.unit_short,
                    factor: itemObject.default_price.factor
                },
                quantity: quantity,
                total_quantity: total_qty,
                total_cost: calculate_cost,
                subtotal: subtotal,
                total_price: calculate_total_price
            };
            
            return objx;
        });
        
        var old = this.state.invoices_details;

        this.setState({
            invoices_details: [...old, ...calcs]
        }); 

        
    }
    
    singleItemIsChecked = (value) => {
        this.setState({
            single_choosed: value 
        });
    }

    selectMulitipleObject = (productObject) => {
        alert("select mulitple objects")
    }

    calculateInvoiceData = () => {
        
        if( ! this.state.invoices_details.length ) {
            return; 
        }

        const totalSum = this.state.invoices_details.reduce((accumulator, item) => {
            return accumulator + parseFloat(item.total_price);
        }, 0);
        
        this.setState({
            subtotal: totalSum
        });

    }

    openQuantityModal = (productObject) => {
         
        var id = productObject.local_id;
        if( id == undefined ) {
            return; 
        }

        
        if( ! this.state.invoices_details.length ) {
            return ;
        } 
        
        var index = this.state.invoices_details.length - 1;
         
        this.setState({
            index_in_update: index,
            object_in_update: this.state.invoices_details[index]
        });
        
        this.setOpenQuantityModal();

    }

    selectProductObject = (productObject ) => {
        this.calculate_object([productObject]);
        this.setOpenItemModal();
        
        setTimeout(() => this.openQuantityModal(productObject), 500)
    } 

    selectCustomerObject = (customerObject ) => {
        this.setState({
            selected_customer: customerObject
        });
        this.setOpenCustomerModal();
    }

    CustomerModal = ({ isVisible, toggleModal }) => {
        
        return (
            <Modal isVisible={isVisible} animationType="slide">
                 <View style={{...styles.modalContainer, flex: 1}}>
                    <ScrollView style={{flex: 1}}>
                        <View>
                            <Text style={{fontWeight:"bold", fontSize: 18}}>Add Customer</Text>
                        </View>
                        {
                             this.state.customers.length ?
                            <View style={{marginTop: 10, borderColor:"#eee", borderWidth: 1, padding: 10, borderRadius: 8}}>
                                <TextInput onChangeText={(text) => this.filter_customers_in_search(text)}  style={{flex: 1, color:"#999"}} placeholder="Search for customer by name" />
                            </View>: ""
                        }
                        
                        <View style={{padding: 0, gap: 5, marginTop: 15}}>
                            {
                                

                                ( this.state.customers.length ) ? 
                                
                                ( this.state.in_search_mode && ! this.state.customers_search.length ) ?
                                    <View>
                                        <View style={{padding: 10, borderWidth: 1, borderColor: "#eee"}}><Text style={{color: "#999"}}>{this.state.language.no_customer_found}</Text></View> 
                                    </View>
                                :
                                (this.state.in_search_mode ? this.state.customers_search: this.state.customers).map( ( customerObject, index ) => {
                                    var is_selected = false; 
                                     
                                    if( this.state.selected_customer != null ) {
                                        if( this.state.selected_customer.local_id == customerObject.local_id ) {
                                            is_selected = true; 
                                        }
                                    }

                                    return (
                                        <TouchableOpacity key={index} onPress={() => this.selectCustomerObject(customerObject)} style={{ padding: 10, marginTop: 0, borderStyle: "dashed", backgroundColor: this.oddoreven(index), borderWidth: ( is_selected )? 1: 0, borderColor: ( is_selected )? this.state.default_color: "white" }}>
                                            <Text style={{fontWeight: "bold", color: "#222"}}>{customerObject.customer_name}</Text>
                                            <Text style={{color:"#666"}}>
                                                {customerObject.address}
                                            </Text>
                                            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                                                <Text style={{color:"#666"}}>
                                                    {customerObject.phone_number}
                                                </Text> 
                                                <Text style={{color:"#666"}}>
                                                    {customerObject.branch.branch_name}
                                                </Text> 
                                            </View>
                                        </TouchableOpacity> 
                                    );
                                }): <View style={{color: "#999", marginTop: 15, flexDirection: "row", alignItems: "center", justifyContent:"center", borderWidth: 1, borderColor: "#eee", padding: 10, flex: 1}}><Text style={{color: "#999"}}>No Customers found</Text><TouchableOpacity onPress={() => this.props.navigation.navigate("add-new-customer")}><Text style={{color: "blue", fontWeight: "bold", marginLeft: 9}}>Add New Customer</Text></TouchableOpacity></View>
                            }
                            
                        </View>
                    </ScrollView>
                    <Button onPress={this.setOpenCustomerModal} style={{backgroundColor: this.state.default_color, color: "#fff", borderRadius: 3}} mode="contained">
                        <Text>Cancel</Text>
                    </Button>
                </View>
                
            </Modal>
        );
    }

    addSelectedItems = () => { 
       // this.selectProductObject(this.state.selected_products);
        //this.setOpenItemModal();
    }

    setQuantity = (vlx) => {
        this.setState({
            quantity_number: vlx
        })
    }

    validateInput = (text) => {
        // Regex to check if the input is a valid number (integer or float)
        if (/^\d*\.?\d*$/.test(text)) {
            this.setState({ quantity_number: text });
        }
    }
 

 
    calculate_object_per_data_change = (index, quantity ) => {
        
        var all = this.state.invoices_details;
        var item = all[index];

        var discount = item.updated_discount;
         

        var discount_value = discount.is_percentage? ( parseFloat(discount.percentage) * parseFloat(item.subtotal)) / 100: discount.value;
        var total_cost = parseFloat(item.updated_price.cost) *  parseFloat( quantity )
        var total_quantity = ( parseFloat( quantity ) * parseFloat( item.updated_price.factor ));
        var subtotal = ( parseFloat( quantity )  * parseFloat( item.updated_price.sale ) );
        var calculate_total_price = subtotal - ( discount_value * parseFloat( quantity ) );
        // console.log(this.state.invoices_details[index], quantity);

        // assign items to details 
        item.total_cost = total_cost;
        item.total_quantity = total_quantity;
        item.subtotal = subtotal;
        item.total_price = calculate_total_price;

        all[index] = item; 

        this.setState({
            invoices_details: all
        });

        this.calculateInvoiceData();
    }; 

    storeQuantityToArray = () => {

        // qty 
        var quantity = this.state.quantity_number;

        // index of item in the array 
        var index = this.state.index_in_update;
        if( index == -1 ) {
            return; 
        }

        this.setState(( prevState ) => {

            if( ! prevState.invoices_details.length ) {
                return; 
            }
            
            var itemObject = prevState.invoices_details[index];
            prevState.invoices_details[index].quantity = quantity ;


            // calculate row
            this.calculate_object_per_data_change(index, quantity );  

            return {
                invoices_details: prevState.invoices_details,
                index_in_update: -1,
                quantity_modal_open: false,
                object_in_update: null,
                quantity_number: 1
            };

        });

        
        this.calculateInvoiceData();
    }

    QuantityModal = ({ isVisible, toggleModal }) => {

        var productName = (  this.state.object_in_update != null && this.state.object_in_update.product.name )?  this.state.object_in_update.product.name: "";
        var quantity = this.state.object_in_update == null ? 1: this.state.object_in_update.quantity;
        // this.setQuantity(quantity)

        return (
            <Modal isVisible={isVisible} animationType="slide">
                <View style={{...styles.modalContainerHalf, flex: 1}}>
                    
                    <View>
                        <Text style={{textAlign: "center"}}> 
                            <Text style={{fontWeight:"bold"}}>{productName}</Text>
                            {" "} Quantity
                        </Text>
                    </View>
                    
                    <View style={{...styles.textInputQty, marginTop: 20}}> 
                        <Button onPress={() => this.setDefaultQuantity(false)} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 4, padding: 2}}>
                            <Text>-</Text>
                        </Button>
                        
                        <TextInput style={{ flexGrow: 1, textAlign: "center"}} 
                           keyboardType="numeric" // Use 'numeric' for better compatibility
                           placeholder="1" 
                           value={this.state.quantity_number.toString()} // Ensure value is a string
                           onChangeText={(text) => this.validateInput(text)} // Update state on change
                        />

                        <Button onPress={() => this.setDefaultQuantity(true)} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 4, padding: 2}}>
                            <Text>+</Text>
                        </Button>
                    </View>

                    <View style={{flex: 1, marginTop: 0}}>
                        <Button onPress={this.storeQuantityToArray} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 4, padding: 2}}>Close</Button>
                    </View>

                </View>
            </Modal>
        );
    }

    ItemModal = ({ isVisible, toggleModal }) => {
        
        // isVisible = true;
 
        return (
            <Modal isVisible={isVisible} animationType="slide">
                <View style={{...styles.modalContainer, flex: 1}}>

                    <View>
                        <View style={{justifyContent:"space-between", flexDirection: "row", alignItems: "center"}}>
                            <Text style={{fontWeight: "bold", fontSize: 18}}>
                                Products
                            </Text> 
                            <TouchableOpacity onPress={this.setMultipleItems} style={{flexDirection:"row", alignItems: "center"}}>
                                <Checkbox status={this.state.multiple_items ? "checked": ""} />
                                <Text>Multiple Items</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{color:"#999"}}>You can select more than one item once you mark the "Multiple Items".</Text>
                        </View>
                    </View>

                    <View style={{marginTop: 10, borderColor:"#eee", borderWidth: 1, borderRadius: 8, padding: 5}}>
                        <TextInput onChangeText={(text) => this.filter_products_in_search(text)}  style={{color:"#999"}} placeholder="Search for products by name" />
                    </View> 

                    <ScrollView style={{padding: 0, gap: 5, marginTop: 15}}>
                        <View style={{flexGrow: 1, flex: 1}}>
                        {
                            ( ! this.state.products.length ) ?
                            <View><Text style={{color: "#999"}}>You don't have products</Text></View>:
                            this.state.products.map((productObject, index) => {

                                // check if current row is highlighted
                                var is_selected = false; 
                                if( this.state.selected_products != null ) {

                                    var index = this.state.selected_products.findIndex( x => x.local_id == productObject.local_id );

                                    if( index !== -1 ) {
                                        is_selected = true; 
                                    }
                                }

                                // handling prices of each product 
                                var prices = !this.state.prices.length? []: this.state.prices.filter( x => x.product_local_id == productObject.local_id );
                                var selected_price = null;

                                if( prices.length ) {
                                    
                                    // default price is the first one 
                                    selected_price = prices[0];

                                    // default price by selected props 
                                    var filtered = prices.filter( x => x.is_default_price == true ); 
                                    if( filtered.length ) {
                                        selected_price = filtered[0];
                                    }
                                }

                                // add needed properties to object object 
                                productObject.default_price = selected_price;
                                productObject.prices = prices;

                                return (
                                    <TouchableOpacity key={productObject.local_id} onPress={() => ( ! this.state.multiple_items) ? this.selectProductObject(productObject): this.selectMulitipleObject(productObject)} style={{ padding: 10, marginTop: 0, borderStyle: "dashed", backgroundColor: this.oddoreven(index), borderWidth: ( is_selected )? 1: 0, borderColor: ( is_selected )? this.state.default_color: "white", justifyContent: "space-between", flexDirection:"row", alignItems: "center" }}>
                                        <Text style={{fontWeight: "bold", color: "#222"}}>
                                            {productObject.product_name}
                                        </Text> 
                                        {
                                            ( selected_price != null ) ?
                                            <Text style={{ color: "#999", flexDirection: "row"}}>
                                                {"EGP "}
                                                {selected_price.sales_price}
                                                {".00"}
                                            </Text> : ""
                                        }
                                        
                                    </TouchableOpacity>
                                );
                            })
                        }
                        </View>
                        
                    </ScrollView> 
                    <View style={{marginTop: 10, justifyContent: "center", gap: 10, flexDirection: "row"}}>
                        <Button onPress={this.setOpenItemModal} mode="contained" style={{borderRadius: 0, flexGrow: 1, backgroundColor: this.state.default_color}}>Cancel</Button>
                        <Button onPress={this.addSelectedItems} mode="contained" style={{borderRadius: 0, flexGrow: 1, backgroundColor: this.state.default_color}}>Add</Button>
                    </View>

                </View>
            </Modal>
        );
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
        var index = this.state.branches.findIndex( x => x.value == local_id );
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
                style={styles.selectorStyle}
            />
        );
    };

    AllOrdersTypesSelector = () => { 
        return (
            <RNPickerSelect 
                value={this.state.selected_order_type.value}
                onValueChange={(value) => this.setIOrderTypeObject(value)}
                items={this.state.order_type}
                style={styles.selectorStyle}
            />
        );
    };

    AllPaymentMethodSelector = () => { 
        return (
            <RNPickerSelect 
                value={this.state.selected_payment_method.value}
                onValueChange={(value) => this.setIPaymentMethodObject(value)}
                items={this.state.payment_methods}
                style={styles.selectorStyle}
            />
        );
    };
    
    AllInvoiceStatusSelector = () => { 
        return (
            <RNPickerSelect 
                value={this.state.selected_invoice_status.value}
                onValueChange={(value) => this.setInvoiceStatusObject(value)}
                items={this.state.invoice_status} 
                style={styles.selectorStyle}
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
            style={styles.selectorStyle}
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

    change_date_from_value = ( event, selectedDate) => {
        
        var date_picker_value = selectedDate || this.state.date;

        this.setState({ 
            date: date_picker_value, 
            open_date_time_picker: false
        });
        
    }

    openDatePicker = (value) => {
        
        this.setState({
            open_date_time_picker: value
        });
        
    }

    render() {

        var formatted_date = americanDateCalendar(this.state.date);

        return (
            <SafeAreaView style={{...styles.container_fluid,   backgroundColor: styles.direct.color.white, flexDirection:"row" }}>
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
                                            {
                                                this.state.doc_number == null ?
                                                <ActivityIndicator color={this.state.default_color} />
                                                : `#${this.state.doc_number}`
                                            } 
                                        </Text>

                                    </View> 
                                </View>  
                                
                                <View style={{...styles.field_container, flexDirection: "row", gap: 10, marginTop: 20, marginBottom:0}}> 
                                    <TouchableOpacity onPress={() => this.openDatePicker(true)} style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf', flexGrow: 1 }}>
                                        <Image 
                                            style={{
                                                width:22,
                                                height:22,
                                                marginRight: 5
                                            }}
                                            source={require("./../../assets/icons/calendar.png")}
                                        />
                                        <TextInput value={formatted_date}  style={{flex: 1, color:"#999"}} readOnly={true} placeholder="dd/mm/yyyy" />
                                        {
                                            this.state.open_date_time_picker && (
                                                <DateTimePicker
                                                    value={new Date(this.state.date)}
                                                    mode={'date'}
                                                    display="default"
                                                    onChange={this.change_date_from_value}
                                                />
                                            ) 
                                        }
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={this.setOpenCustomerModal} style={{...styles.textInputNoMarginsChanged, borderColor:(this.state.customer_name_hlgt) ? 'red': '#dfdfdf', flexGrow: 2 }}>
                                        <Image 
                                            style={{
                                                width:22,
                                                height:22, 
                                                marginRight: 5
                                            }}
                                            source={require("./../../assets/icons/customer-icon.png")}
                                        />
                                        <TextInput readOnly={true} value={this.state.selected_customer != null ? this.state.selected_customer.customer_name: ""} style={{flex: 1}} placeholder={this.state.language.no_customer_selected} />
                                    </TouchableOpacity>

                                    <this.CustomerModal isVisible={this.state.customer_modal_open} toggleModal={this.setOpenCustomerModal} />
                                </View>

                                <View style={{ gap: 10, marginTop: 20, flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden"}}> 
                                    <Text style={{fontWeight: "bold"}}>Order Status</Text>
                                    <View style={{ flexGrow: 1, borderRadius:15, maxWidth: 230}}>
                                        <this.AllInvoiceStatusSelector/>
                                    </View> 
                                </View>

                                <View style={{ gap: 10, marginTop: 20, flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden"}}> 
                                    <Text style={{fontWeight: "bold"}}>Order Type</Text>
                                    <View style={{ flexGrow: 1, borderRadius:15, maxWidth: 230}}>
                                        <this.AllOrdersTypesSelector/>
                                    </View> 
                                </View>

                                <View style={{ gap: 10, marginTop: 20, flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden"}}> 
                                    <Text style={{fontWeight: "bold"}}>Branch</Text>
                                    <View style={{ flexGrow: 1, borderRadius:15, maxWidth: 230}}>
                                        <this.AllBranchesSelector/>
                                    </View> 
                                </View>

                                <View style={{ gap: 10, marginTop: 20, flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden"}}> 
                                    <Text style={{fontWeight: "bold"}}>Payment Status</Text>
                                    <View style={{ flexGrow: 1, borderRadius:15, maxWidth: 230}}>
                                        <this.AllPaymentStatusSelector/>
                                    </View> 
                                </View>

                                <View style={{ gap: 10, marginTop: 20, flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden"}}> 
                                    <Text style={{fontWeight: "bold"}}>Payment Method</Text>
                                    <View style={{ flexGrow: 1, borderRadius:15, maxWidth: 230}}>
                                        <this.AllPaymentMethodSelector/>
                                    </View> 
                                </View>


                                <View>
                                    <View style={{flexDirection: "row", gap: 10, marginTop: 20, alignItems: "center"}}> 
                                        <Text style={{fontWeight: "bold"}}>
                                            Items
                                        </Text>
                                        <TouchableOpacity onPress={this.add_new_item} style={{backgroundColor: this.state.default_color, marginLeft:"auto", flexDirection: "row", alignItems: "center", paddingTop: 5,paddingBottom: 5,paddingLeft: 10,paddingRight: 15,  borderRadius: 5, height: 35,}}>
                                            <Image
                                                style={{width: 20, height: 20, marginRight: 3}}
                                                source={require('./../../assets/icons/add-new-prdouct.png')}
                                            />
                                            <Text style={{color: "#fff"}}>Add New Item</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <this.QuantityModal isVisible={this.state.quantity_modal_open} toggleModal={this.setOpenQuantityModal} />
                                    <this.ItemModal isVisible={this.state.item_modal_open} toggleModal={this.setOpenItemModal} />
                                    

                                    <View style={{borderWidth: 1, borderColor: this.state.default_color, marginTop: 10}}>
                                        <View>
                                            <View style={{flex: 1, flexDirection: "row", backgroundColor: this.state.default_color, padding: 5, gap: 10, borderRadius: 0 , paddingBottom:5, paddingTop:5}}>
                                                <View style={{flex: 3}}>
                                                    <Text style={{color: "#fff", textAlign: "center"}}>
                                                        Items
                                                    </Text>
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text style={{color: "#fff", textAlign: "center"}}>
                                                        QTY
                                                    </Text>
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text style={{color: "#fff", textAlign: "center"}}>
                                                        Price
                                                    </Text>
                                                </View> 
                                                <View style={{flex: 1}}>
                                                    <Text style={{color: "#fff", textAlign: "center"}}>
                                                        Total
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        {
                                            ( ! this.state.invoices_details.length ) ?
                                            <View style={{padding: 10, justifyContent: "center", alignItems: "center"}}>
                                                <Text style={{color: "#999", textAlign: "center"}}>There are no items on this invoice. Click on the "Add New Item"</Text>
                                            </View>:
                                            this.state.invoices_details.map( (item, index) => {
                                                 
                                                return (
                                                    <View key={index} style={{ marginTop: 0, borderBottomColor: "#ddd", backgroundColor: "#fff", borderBottomWidth: 1, paddingLeft: 10, paddingRight: 10, paddingBottom:5, paddingTop:5}}>
                                                        <View style={{flex: 1, flexDirection: "row",  padding: 5, gap: 10, borderRadius: 2}}>
                                                            <View style={{flex: 3, flexDirection: "row", gap: 10, alignItems: "center"}}>
                                                                <TouchableOpacity style={{marginLeft: -10, marginRight: -10}}>
                                                                    <Image  
                                                                        source={require('./../../assets/icons/trash.png')}
                                                                        style={{width: 18, height: 18}} 
                                                                        resizeMode="cover"
                                                                    />
                                                                </TouchableOpacity>
                                                                <Text style={{color: "#000", paddingLeft: 5, paddingRight: 5}}>
                                                                    {item.product.name}
                                                                </Text>
                                                            </View>
                                                            <View style={{flex: 1}}>
                                                               <TouchableOpacity style={{borderRadius: 3, backgroundColor: this.state.default_color}}>
                                                                <Text style={{color: "#000", fontWeight: "bold", textAlign: "center", color: "#fff"}}>
                                                                        {item.quantity}
                                                                    </Text>
                                                               </TouchableOpacity>
                                                            </View>
                                                            <View style={{flex: 1}}>
                                                                <TouchableOpacity style={{borderRadius: 3, backgroundColor: this.state.default_color}}>
                                                                <Text style={{color: "#000", fontWeight: "bold", textAlign: "center", color: "#fff"}}>
                                                                    {item.updated_price.sale}
                                                                </Text>
                                                                </TouchableOpacity>
                                                            </View> 
                                                            <View style={{flex: 1, justifyContent: "center", flexDirection: "row", gap: 10, alignItems: "center"}}>
                                                                <Text style={{color: "#000"}}>
                                                                    {item.total_price}
                                                                </Text>
                                                            </View> 
                                                        </View>
                                                    </View>
                                                );
                                            })
                                        }

                                         
                                    </View>
                                </View>
                                
                                <View style={{borderWidth: 1,borderStyle: "dashed", borderColor: "#dfdfdf", padding: 5, backgroundColor: "#fff", marginTop: 25}}>
                                    
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#dfdfdf", borderStyle: "dashed", borderBottomWidth: 1, padding: 10}}>
                                        <Text>Subtotal</Text>
                                        <Text style={{fontWeight: "bold"}}>${this.state.subtotal}</Text>
                                    </View>
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#dfdfdf", borderStyle: "dashed", borderBottomWidth: 1, padding: 10}}>
                                        <Text>Discount</Text>
                                        <Text style={{fontWeight: "bold"}}>$500.00</Text>
                                    </View>
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#dfdfdf", borderStyle: "dashed", borderBottomWidth: 1, padding: 10}}>
                                        <Text>Tax</Text>
                                        <Text style={{fontWeight: "bold"}}>$500.00</Text>
                                    </View>
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#dfdfdf", borderStyle: "dashed", borderBottomWidth: 1, padding: 10}}>
                                        <Text>Vat</Text>
                                        <Text style={{fontWeight: "bold"}}>$500.00</Text>
                                    </View>
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10}}>
                                        <Text>Shipping or Delivery Cost</Text>
                                        <Text style={{fontWeight: "bold"}}>$500.00</Text>
                                    </View>

                                </View>



                                <View style={{borderWidth: 1,borderStyle: "dashed", borderColor: "#dfdfdf", padding: 5, backgroundColor: "#f9f9f9", marginTop: 25}}>
                                    
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10}}>
                                        <Text style={{fontWeight: "bold"}}>Total</Text> 
                                        <Text style={{fontWeight: "bold", fontSize: 18, color:this.state.default_color}}>$500.00</Text>
                                    </View> 

                                </View>
                                 

                                <View style={{ gap: 10, marginTop: 30, flex: 1, flexDirection: "column", overflow: "hidden"}}> 
                                    <Text style={{fontWeight: "bold"}}>Order Tracking Number</Text>
                                    <View style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf' }}>
                                        <TextInput value={this.state.customer_name} onChangeText={text => this.setChangedValue(text, this.setCustomerName)} style={{flex: 1}} placeholder={this.state.language.tracking_number} />
                                    </View>
                                </View>
                                
                                
                            </View> 

                            <View style={{ gap: 10, marginTop: 30, flex: 1, flexDirection: "column", overflow: "hidden"}}> 
                                <TouchableOpacity style={{marginBottom: 5}} onPress={() => alert("print , export, etc")}>
                                    <Text style={{fontWeight:"bold", color: this.state.default_color}}>
                                        More Options
                                    </Text> 
                                </TouchableOpacity>
                                <Button onPress={this.saveData} style={{...styles.default_btn, backgroundColor: this.state.default_color }}>
                                    {
                                        this.state.isPressed ?
                                        <ActivityIndicator color={styles.direct.color.white} />
                                        :
                                        <Text style={{color:styles.direct.color.white, ...styles.size.medium}}> {this.state.language.save} </Text> 
                                    }
                                </Button>  
                            </View>
                        </View> 
                        
                 </ScrollView>
                 
            </SafeAreaView>
        );

    } 

}


export {  AddNewSalesInvoiceComponents }