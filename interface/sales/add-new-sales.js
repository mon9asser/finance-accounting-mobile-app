
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
import { generateId, convertToDecimal } from "../../controllers/helpers.js";
import { PriceInstance } from "../../controllers/storage/prices.js";
import { ProductInstance } from "../../controllers/storage/products.js";

import { CustomerInstance } from "../../controllers/storage/customers.js";
import { Last_Recorded, RecordedInstance } from "../../controllers/storage/last-recorded.js";
import { SalesInvoiceInstance } from "../../controllers/storage/sales.js";
import { DocDetailsInstance, Document_Details } from "../../controllers/storage/document-details.js";
import { A_P_I_S } from "../../controllers/cores/apis.js";
import { Models } from "../../controllers/cores/models.js";
import { head, isArray, update, values } from "lodash";
import { parse } from "react-native-svg";


 

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

            // custom discount
            discountValue: '', 
            discountPercentage: '',
            enabled_discount_percentage: false, 
            customPrice: '',

            language: {}, 
            default_color: "#EF6C00",  
            item_name: "Item",
            isPressed: false, 
            single_choosed: false,  // handle double click on item 
            
            selected_product_prices: [], 
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
            open_prices_modal: false,
            invoice_discount_modal: false,
            invoice_tax_modal: false, 
            invoice_vat_modal: false, 
            item_modal_open: false, 
            quantity_modal_open: false, 
            in_search_mode: false, 
            multiple_items: false, 
            invoice_shipping_delivery: false,

            // all data
            last_recorded: null,
            branches: [],
            prices: [], 
            products: [],  
            customers: [],
            
            customers_search: [],
            products_search: [],
            
            isPressed: false,
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
            total: "", // total
            selected_payment_status: {
                label: "Paid",
                value: 0
            },  // payment_status
            subtotal: "", // subtotal
            discount: {
                is_percentage: false,
                percentage: 0,
                value:""
            }, // discount
            tax: {
                is_percentage: false,
                percentage: 0,
                value:""
            }, // tax
            vat: {
                is_percentage: false,
                total_including_vat: false,
                percentage: 0,
                value:""
            }, // vat
            shipping_or_delivery_cost: "", // shipping_or_delivery_cost
            tracking_number: "",

            index_in_update: -1,
            object_in_update: null,
            invoices_details: [], // Document Details 
            
            quantity_number: 1,
            
            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",  

            
            // for test only 
            doc_id: "69896zv352484fio17147248055962716",
            invoices_details: [{
                "application_id": "65f96525c88ba7e90685fe5d",
                "branch": {
                    "__v": 0,
                    "_id": "661700e1fd998b58f6c5065b",
                    "application_id": "65f96525c88ba7e90685fe5d",
                    "branch_address": "",
                    "branch_city": "",
                    "branch_country": "",
                    "branch_name": "Hato",
                    "branch_number": "",
                    "created_by": [Object],
                    "created_date": "2024-04-10T21:13:04.252Z",
                    "local_id": "900600h7cn3uwngpr17127835842522026",
                    "note": "",
                    "updated_by": [Object],
                    "updated_date": "2024-04-10T21:13:04.252Z"
                },
                "created_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "created_date": 1714724967648,
                "doc_id": "69896zv352484fio17147248055962716",
                "doc_type": 0,
                "is_out": true,
                "local_id": "9300pltj4lnxom17147249676481266",
                "price": {
                    "cost": "99",
                    "factor": 1,
                    "local_id": "22561jxmvfrbpnzo17131765363702541",
                    "name": "",
                    "sale": "150",
                    "unit_name": "Small", 
                    "unit_short": "Sml"
                },
                "product": {
                    "default_discount": [Object],
                    "local_id": "96367lrpbvuevyoc17131765363702393",
                    "name": "Tepinyakei sushi"
                },
                "quantity": "2",
                "subtotal": 300,
                "total_cost": 198,
                "total_price": 270,
                "total_quantity": 2,
                "updated_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "updated_date": 1714724967648,
                "updated_discount": {
                    "is_percentage": false,
                    "percentage": 10,
                    "value": 15
                },
                "updated_price": {
                    "cost": "99",
                    "factor": 1,
                    "local_id": "22561jxmvfrbpnzo17131765363702541",
                    "name": "",
                    "sale": "150",
                    "unit_name": "Small",
                    "unit_short": "Sml"
                }
            }, {
                "application_id": "65f96525c88ba7e90685fe5d",
                "branch": {
                    "__v": 0,
                    "_id": "661700e1fd998b58f6c5065b",
                    "application_id": "65f96525c88ba7e90685fe5d",
                    "branch_address": "",
                    "branch_city": "",
                    "branch_country": "",
                    "branch_name": "Hato",
                    "branch_number": "",
                    "created_by": [Object],
                    "created_date": "2024-04-10T21:13:04.252Z",
                    "local_id": "900600h7cn3uwngpr17127835842522026",
                    "note": "",
                    "updated_by": [Object],
                    "updated_date": "2024-04-10T21:13:04.252Z"
                },
                "created_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "created_date": 1714724967648,
                "doc_id": "69896zv352484fio17147248055962716",
                "doc_type": 0,
                "is_out": true,
                "local_id": "546357blytibgev17147249676482770",
                "price": {
                    "cost": "10",
                    "factor": 1,
                    "local_id": "45879xl9b0jakjx1713176852386600",
                    "name": "",
                    "sale": "20",
                    "unit_name": "Gram",
                    "unit_short": "Gm"
                },
                "product": {
                    "default_discount": [Object],
                    "local_id": "56497t56684ix1d17131767947161851",
                    "name": "Chicken salad"
                },
                "quantity": "4",
                "subtotal": 1800,
                "total_cost": 960,
                "total_price": 1800,
                "total_quantity": 4000,
                "updated_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "updated_date": 1714724967648,
                "updated_discount": {
                    "is_percentage": false,
                    "percentage": 0,
                    "value": 0
                },
                "updated_price": {
                    "cost": "240",
                    "factor": 1000,
                    "local_id": "48185xvfva0u90717131767947162004",
                    "name": "",
                    "sale": "450",
                    "unit_name": "Kill gram",
                    "unit_short": "Kg"
                }
            }, {
                "application_id": "65f96525c88ba7e90685fe5d",
                "branch": {
                    "__v": 0,
                    "_id": "661700e1fd998b58f6c5065b",
                    "application_id": "65f96525c88ba7e90685fe5d",
                    "branch_address": "",
                    "branch_city": "",
                    "branch_country": "",
                    "branch_name": "Hato",
                    "branch_number": "",
                    "created_by": [Object],
                    "created_date": "2024-04-10T21:13:04.252Z",
                    "local_id": "900600h7cn3uwngpr17127835842522026",
                    "note": "",
                    "updated_by": [Object],
                    "updated_date": "2024-04-10T21:13:04.252Z"
                },
                "created_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "created_date": 1714724967648,
                "doc_id": "69896zv352484fio17147248055962716",
                "doc_type": 0,
                "is_out": true,
                "local_id": "22059fpx8dkf0b8n17147249676481570",
                "price": {
                    "cost": "99",
                    "factor": 1,
                    "local_id": "22561jxmvfrbpnzo17131765363702541",
                    "name": "",
                    "sale": "150",
                    "unit_name": "Small",
                    "unit_short": "Sml"
                },
                "product": {
                    "default_discount": [Object],
                    "local_id": "96367lrpbvuevyoc17131765363702393",
                    "name": "Tepinyakei sushi"
                },
                "quantity": 1,
                "subtotal": 150,
                "total_cost": 99,
                "total_price": 135,
                "total_quantity": 1,
                "updated_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "updated_date": 1714724967648,
                "updated_discount": {
                    "is_percentage": false,
                    "percentage": 10,
                    "value": 15
                },
                "updated_price": {
                    "cost": "99",
                    "factor": 1,
                    "local_id": "22561jxmvfrbpnzo17131765363702541",
                    "name": "",
                    "sale": "150",
                    "unit_name": "Small",
                    "unit_short": "Sml"
                }
            }, {
                "application_id": "65f96525c88ba7e90685fe5d",
                "branch": {
                    "__v": 0,
                    "_id": "661700e1fd998b58f6c5065b",
                    "application_id": "65f96525c88ba7e90685fe5d",
                    "branch_address": "",
                    "branch_city": "",
                    "branch_country": "",
                    "branch_name": "Hato",
                    "branch_number": "",
                    "created_by": [Object],
                    "created_date": "2024-04-10T21:13:04.252Z",
                    "local_id": "900600h7cn3uwngpr17127835842522026",
                    "note": "",
                    "updated_by": [Object],
                    "updated_date": "2024-04-10T21:13:04.252Z"
                },
                "created_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "created_date": 1714724967648,
                "doc_id": "69896zv352484fio17147248055962716",
                "doc_type": 0,
                "is_out": true,
                "local_id": "72256w0hv9alzxq17147249676482168",
                "price": {
                    "cost": "10",
                    "factor": 1,
                    "local_id": "45879xl9b0jakjx1713176852386600",
                    "name": "",
                    "sale": "20",
                    "unit_name": "Gram",
                    "unit_short": "Gm"
                },
                "product": {
                    "default_discount": [Object],
                    "local_id": "56497t56684ix1d17131767947161851",
                    "name": "Chicken salad"
                },
                "quantity": "7",
                "subtotal": 140,
                "total_cost": 70,
                "total_price": 140,
                "total_quantity": 7,
                "updated_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "updated_date": 1714724967648,
                "updated_discount": {
                    "is_percentage": false,
                    "percentage": 0,
                    "value": 0
                },
                "updated_price": {
                    "cost": "10",
                    "factor": 1,
                    "local_id": "45879xl9b0jakjx1713176852386600",
                    "name": "",
                    "sale": "20",
                    "unit_name": "Gram",
                    "unit_short": "Gm"
                }
            }, {
                "application_id": "65f96525c88ba7e90685fe5d",
                "branch": {
                    "__v": 0,
                    "_id": "661700e1fd998b58f6c5065b",
                    "application_id": "65f96525c88ba7e90685fe5d",
                    "branch_address": "",
                    "branch_city": "",
                    "branch_country": "",
                    "branch_name": "Hato",
                    "branch_number": "",
                    "created_by": [Object],
                    "created_date": "2024-04-10T21:13:04.252Z",
                    "local_id": "900600h7cn3uwngpr17127835842522026",
                    "note": "",
                    "updated_by": [Object],
                    "updated_date": "2024-04-10T21:13:04.252Z"
                },
                "created_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "created_date": 1714724967648,
                "doc_id": "69896zv352484fio17147248055962716",
                "doc_type": 0,
                "is_out": true,
                "local_id": "90900jnw5vh8xob1714724967648660",
                "price": {
                    "cost": "99",
                    "factor": 1,
                    "local_id": "22561jxmvfrbpnzo17131765363702541",
                    "name": "",
                    "sale": "150",
                    "unit_name": "Small",
                    "unit_short": "Sml"
                },
                "product": {
                    "default_discount": [Object],
                    "local_id": "96367lrpbvuevyoc17131765363702393",
                    "name": "Tepinyakei sushi"
                },
                "quantity": "1",
                "subtotal": 128,
                "total_cost": 99,
                "total_price": 113,
                "total_quantity": 1,
                "updated_by": {
                    "email": "moun2030@gmail.com",
                    "id": "65f96525c88ba7e90685fe5f",
                    "name": "Montasser Mossallem"
                },
                "updated_date": 1714724967648,
                "updated_discount": {
                    "is_percentage": false,
                    "percentage": 10,
                    "value": 15
                },
                "updated_price": {
                    "cost": "99",
                    "factor": 1,
                    "local_id": "22561jxmvfrbpnzo17131765363702541",
                    "name": "",
                    "sale": "128",
                    "unit_name": "Small",
                    "unit_short": "Sml"
                }
            }]
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

    setOpenPricesModal = () => {
        //this.state.prices
        this.setState({
            open_prices_modal: ! this.state.open_prices_modal
        });
    } 

    setOpenDiscountInvoiceModal = () => {
        //this.state.prices
        this.setState({
            invoice_discount_modal: ! this.state.invoice_discount_modal
        });
    }

    setOpenTaxInvoiceModal = () => {
        //this.state.prices
        this.setState({
            invoice_tax_modal: ! this.state.invoice_tax_modal
        });
    }

    setOpenVatInvoiceModal = () => {
        //this.state.prices
        this.setState({
            invoice_vat_modal: ! this.state.invoice_vat_modal
        });
    }

    setOpenShippingInvoiceModal = () => {
        //this.state.prices
        this.setState({
            invoice_shipping_delivery: ! this.state.invoice_shipping_delivery
        });
    }

    

    setOpenPricesModalHandler = (item, index) => {

        var product_prices = this.state.prices.filter( x => x.product_local_id == item.product.local_id );
        

        this.setState({
            selected_product_prices: product_prices,
            item_name: item.product.name,
            index_in_update: index
        }, () => { this.setOpenPricesModal(); });
        
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
        }, () => { this.setOpenItemModal(); }); 
        

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
                    discount_value = convertToDecimal( (subtotal * discount_percentage) / 100 );
                } else { 

                    discount_value = parseFloat( itemObject.discount.value ); 
                }
            } else {
                if( discount_obj.is_percentage ) {
                    discount_percentage = parseFloat( discount_obj.percentage );
                    discount_value = convertToDecimal( (subtotal * discount_percentage) / 100 );
                    
                } else {
                    discount_value = parseFloat( discount_obj.value );
                    
                }
            }
            
            if ( isNaN( discount_value ) ) {
                discount_value = 0;
            }
            
            var calculate_total_price = parseFloat(subtotal) - parseFloat(discount_value);


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
        
        /*
        if( ! this.state.invoices_details.length ) {
            this.setState({
                subtotal: "",
                total: ""
            });
            return; 
        }*/

        // subtotal 
        const totalSum = this.state.invoices_details.reduce((accumulator, item) => {
            return parseFloat(accumulator) + parseFloat(item.total_price);
        }, 0);

        // discount + vat + tax case percentage  
        var discount = this.state.discount;
        var vat = this.state.vat;
        var tax = this.state.tax;
        var subtotal = parseFloat(totalSum); 
        if(isNaN(subtotal)) {
            subtotal = 0;
        }

        var object_to_update = {
            subtotal: subtotal,
            total: subtotal
        }

        if(discount.is_percentage) {
            var percentage = parseFloat(discount.percentage);
            if(percentage > 0 ) {
                var percentage_value = ( percentage * subtotal / 100 ) 
                    percentage_value = convertToDecimal(percentage_value); 
                    object_to_update.discount = {
                        ...discount,
                        value: percentage_value.toString()
                    }
            }
        } else {
            object_to_update.discount = {
                ...discount,
                value: this.state.discount.value
            }
        }

        if(tax.is_percentage) {
            var percentage = parseFloat(tax.percentage);
            if(percentage > 0 ) {
                var percentage_value = ( percentage * subtotal / 100 ) 
                    percentage_value = convertToDecimal( percentage_value ); 
                    object_to_update.tax = {
                        ...tax,
                        value: percentage_value.toString()
                    }
            }
        }else {
            object_to_update.tax = {
                ...tax,
                value: this.state.tax.value
            }
        }


        // discount 
        if( object_to_update.discount != undefined && object_to_update.discount.value != "" )
            object_to_update.total = parseFloat(object_to_update.total) - parseFloat(object_to_update.discount.value);

        // Tax 
        if( object_to_update.tax != undefined && object_to_update.tax.value != "" )
            object_to_update.total = parseFloat(object_to_update.total) + parseFloat(object_to_update.tax.value);

         
        
        // Shipping Cost 
        if( this.state.shipping_or_delivery_cost != "" )
            object_to_update.total = parseFloat(object_to_update.total) + parseFloat(this.state.shipping_or_delivery_cost);
            
        // vat 
        if(vat.is_percentage) {
            var percentage = parseFloat(vat.percentage);
            var s_total = parseFloat(object_to_update.total); 

            if(percentage > 0 ) {
                var percentage_value = ( percentage * s_total / 100 ) 
                    percentage_value = convertToDecimal ( percentage_value ); 
                    
                    if( vat.total_including_vat ) {
                        
                        var decimal_point = percentage.toString().indexOf(".")
                        if( decimal_point !== -1 ) {
                            percentage = parseFloat( `1.${percentage.toString().replace(".", "")}` );
                        }

                        percentage = parseFloat( `1.${percentage.toString().replace(".", "")}` );

                        var new_value = s_total - (s_total / percentage);
                        percentage_value = convertToDecimal( new_value );
                        
                    }

                    object_to_update.vat = {
                        ...vat,
                        value: percentage_value.toString()
                    }
            }
        }else {
            object_to_update.vat = {
                ...vat,
                value: this.state.vat.value
            }
        }

        // Vat 
        if( object_to_update.vat != undefined && object_to_update.vat.value != "" ) {
            
            if( ! object_to_update.vat.total_including_vat )
                object_to_update.total = parseFloat(object_to_update.total) + parseFloat(object_to_update.vat.value);
            
        }

        this.setState(object_to_update);

    }

    openQuantityModal = (productObject, this_index = -1) => {
         
        var id = productObject.local_id;

        if( this_index != -1 ) {
            id = productObject.product.local_id;
        }

        if( id == undefined ) {
            return; 
        }

        
        if( ! this.state.invoices_details.length ) {
            return ;
        } 
        
        var index = this.state.invoices_details.length - 1;
        
        if( this_index != -1 ) {
            index = this_index;
        }

        var prcQuantity = this.state.invoices_details[index].quantity == "" ? 1: parseFloat( this.state.invoices_details[index].quantity );
        
        this.setState({
            index_in_update: index,
            object_in_update: this.state.invoices_details[index],
            quantity_number: prcQuantity
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

    /*
    discount: {
                is_percentage: false,
                percentage: 0,
                value:"0.00"
            }
            */
    setInvoicePercentageDiscount = (val) => {
        this.setState((prevState) => ({
            discount: {...prevState.discount, is_percentage: val}
        }))
    }

    setInvoiceTaxDiscount  = (val) => {
        this.setState((prevState) => ({
            tax: {...prevState.tax, is_percentage: val}
        }))
    }

    setInvoiceVatDiscount  = (val) => {
        this.setState((prevState) => ({
            vat: {...prevState.vat, is_percentage: val}
        }))
    }

    setInvoiceVatIncludingTotal  = (val) => {
        this.setState((prevState) => ({
            vat: {...prevState.vat, total_including_vat: val}
        }))
    }

    setTaxValueInvoice  = (val) => {
        this.setState(( prevState ) => {

            return {
                tax: { ...prevState.tax, percentage: "0", value: val}  
            }
            
        });
    }

    setVatValueInvoice  = (val) => {
        this.setState(( prevState ) => {

            return {
                vat: { ...prevState.vat, percentage: "0", value: val}  
            }
            
        });
    }

    setShippingDeliveryValueInvoice =  (val) => {
        this.setState({ 
            shipping_or_delivery_cost: val            
        });
    }

    setDiscountValueInvoice = (val) => {
        this.setState(( prevState ) => {

            return {
                discount: { ...prevState.discount, percentage: "0", value: val}  
            }
            
        });
    }

    closeInvoiceDiscountModal = () => {
        this.setOpenDiscountInvoiceModal();
    }

    closeInvoiceTaxModal = () => {
        this.setOpenTaxInvoiceModal();
    }

    closeInvoiceVatModal = () => {
        this.setOpenVatInvoiceModal();
    }

    closeInvoiceShippingOrDeliveryModal = () => {

        this.setState({
            shipping_or_delivery_cost: "",
        }, () => { 
            this.calculateInvoiceData();
            this.setOpenShippingInvoiceModal();
        });
        
    }

    applyChangesTaxOnInvoice = () => {

        var objectToUpdate = {...this.state.tax};

        var tax = this.state.tax;
        var subtotal = parseFloat(this.state.subtotal);
        if(isNaN(subtotal)) {
            subtotal = 0;
        }
        if(tax.is_percentage) {

            var percentage = parseFloat(objectToUpdate.percentage);
            objectToUpdate.value = convertToDecimal( (subtotal * percentage) / 100 ); 

            

        }

        this.setState({
            tax: objectToUpdate 
        }, () => { 
            this.calculateInvoiceData();
            this.setOpenTaxInvoiceModal();
        });

    }

    applyChangesShippingOrDeliveryOnInvoice = () => {
        this.calculateInvoiceData();
        this.setOpenShippingInvoiceModal();
    }

    applyChangesVatOnInvoice = () => {

        var objectToUpdate = {...this.state.vat};
        
        if( objectToUpdate.value != "") {
            objectToUpdate.value = parseFloat(objectToUpdate.value);
        }

        var vat = this.state.vat;
        var subtotal = parseFloat(this.state.subtotal);
        if(isNaN(subtotal)) {
            subtotal = 0;
        }
        if(vat.is_percentage) {

            var percentage = parseFloat(objectToUpdate.percentage);
            objectToUpdate.value = convertToDecimal(subtotal * percentage); 
            
        } else {
            objectToUpdate.value = this.state.vat.value;
        }

        if(vat.total_including_vat) {

            if( vat.is_percentage ) {
                var defaultPerc = parseFloat(objectToUpdate.percentage);
                
                if( defaultPerc.toString().indexOf( "." ) !== -1 ) {
                    defaultPerc = defaultPerc.toString().replace(".", "")
                }

                var buildVat = `1.${defaultPerc}` 
                var new_percentage_value = parseFloat(buildVat);

                var remain = ( subtotal / new_percentage_value )  
            

                objectToUpdate.value = convertToDecimal(subtotal - remain); 
            } else {
                objectToUpdate.value = this.state.vat.value;
            }
        }   

        
        this.setState((prevState) => ({
            vat: {...prevState.vat, ...objectToUpdate}  
        }), () => { 
            this.calculateInvoiceData();
            this.setOpenVatInvoiceModal();
        });

    }

    applyChangesDiscountOnInvoice = () => {

        var objectToUpdate = {...this.state.discount};

        var discount = this.state.discount;
        var subtotal = parseFloat(this.state.subtotal);
        if(isNaN(subtotal)) {
            subtotal = 0;
        }
        if(discount.is_percentage) {

            var percentage = parseFloat(objectToUpdate.percentage);
            objectToUpdate.value = convertToDecimal ( ( subtotal * percentage ) / 100); 
            
        }

        this.setState({
            discount: objectToUpdate 
        }, () => { 
            this.calculateInvoiceData();
            this.setOpenDiscountInvoiceModal();
        });

    }

    ShippingDeliveryModal = ({isVisible, toggleModal}) => {

        return (
            <Modal isVisible={isVisible} animationType="slide">
                <View style={{...styles.modalContainer}}>
                    <Text style={{fontWeight: "bold"}}>Shipping or Delivery Cost</Text>

                    <View style={{marginTop: 10, color: "#999"}}>       
                        
                        <View style={styles.textInputNoMargins}>
                            <TextInput value={this.state.shipping_or_delivery_cost.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setShippingDeliveryValueInvoice, text)} style={{flex: 2}} placeholder={this.state.shipping_or_delivery_cost} />       
                        </View> 

                    </View>

                    <View style={{flexDirection: "row", gap: 10, marginTop: 20}}>
                        <Button onPress={this.closeInvoiceShippingOrDeliveryModal} mode="contained" style={{borderColor: this.state.default_color, borderWidth: 1, borderRadius: 0, backgroundColor: "transparent"}}>
                            <Text style={{color: this.state.default_color}}>Cancel</Text>
                        </Button>
                        <Button onPress={this.applyChangesShippingOrDeliveryOnInvoice} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 0, flexGrow: 1}}>
                            <Text style={{color: "#fff"}}>Apply Changes</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        );
    }

    InvoiceVatModal  = ({isVisible, toggleModal}) => {

        return (
            <Modal isVisible={isVisible} animationType="slide">
                 <View style={{...styles.modalContainer}}>
                    
                    <View style={{marginBottom: 15, width: "100%"}}>
                        <Text style={{ fontWeight: "bold", textAlign: "center", }}>Invoice Vat</Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => { this.setInvoiceVatDiscount(!this.state.vat.is_percentage); }} style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                        <Checkbox status={this.state.vat.is_percentage ? 'checked' : 'unchecked'} />
                        <Text>Enable Percentage</Text>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => { this.setInvoiceVatIncludingTotal(!this.state.vat.total_including_vat); }} style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                        <Checkbox status={this.state.vat.total_including_vat ? 'checked' : 'unchecked'} />
                        <Text>Total Including Vat</Text>
                    </TouchableOpacity>

                    
                    <View style={{marginTop: 10, color: "#999"}}>       
                        
                        <View style={styles.textInputNoMargins}>
                            <TextInput value={this.state.vat.value.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setVatValueInvoice, text)} style={{flex: 2}} placeholder={this.state.language.discount_value} />
                            {
                                this.state.vat.is_percentage ?
                                <TextInput status='checked' value={this.state.vat.percentage.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setVatPercentageInvoice, text)} style={{flex: 1, borderLeftWidth: 1, borderLeftColor: "#ddd", paddingLeft: 10}} placeholder='%' />
                                : ""
                            }            
                        </View> 

                    </View>

                    <View style={{flexDirection: "row", gap: 10, marginTop: 20}}>
                        <Button onPress={this.closeInvoiceVatModal} mode="contained" style={{borderColor: this.state.default_color, borderWidth: 1, borderRadius: 0, backgroundColor: "transparent"}}>
                            <Text style={{color: this.state.default_color}}>Cancel</Text>
                        </Button>
                        <Button onPress={this.applyChangesVatOnInvoice} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 0, flexGrow: 1}}>
                            <Text style={{color: "#fff"}}>Apply Changes</Text>
                        </Button>
                    </View>
                 </View>
            </Modal>
        );

    }

    InvoiceTaxModal = ({isVisible, toggleModal}) => {

        return (
            <Modal isVisible={isVisible} animationType="slide">
                 <View style={{...styles.modalContainer}}>
                    
                    <View style={{marginBottom: 15, width: "100%"}}>
                        <Text style={{ fontWeight: "bold", textAlign: "center", }}>Invoice Tax</Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => { this.setInvoiceTaxDiscount(!this.state.tax.is_percentage); }} style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                        <Checkbox status={this.state.tax.is_percentage ? 'checked' : 'unchecked'} />
                        <Text>Enable Percentage</Text>
                    </TouchableOpacity>

                    <View style={{marginTop: 10, color: "#999"}}>       
                        
                        <View style={styles.textInputNoMargins}>
                            <TextInput value={this.state.tax.value.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setTaxValueInvoice, text)} style={{flex: 2}} placeholder={this.state.language.discount_value} />
                            {
                                this.state.tax.is_percentage ?
                                <TextInput status='checked' value={this.state.tax.percentage.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setTaxPercentageInvoice, text)} style={{flex: 1, borderLeftWidth: 1, borderLeftColor: "#ddd", paddingLeft: 10}} placeholder='%' />
                                : ""
                            }            
                        </View> 

                    </View>

                    <View style={{flexDirection: "row", gap: 10, marginTop: 20}}>
                        <Button onPress={this.closeInvoiceTaxModal} mode="contained" style={{borderColor: this.state.default_color, borderWidth: 1, borderRadius: 0, backgroundColor: "transparent"}}>
                            <Text style={{color: this.state.default_color}}>Cancel</Text>
                        </Button>
                        <Button onPress={this.applyChangesTaxOnInvoice} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 0, flexGrow: 1}}>
                            <Text style={{color: "#fff"}}>Apply Changes</Text>
                        </Button>
                    </View>
                 </View>
            </Modal>
        );

    }

    InvoiceDicountModal = ({isVisible, toggleModal}) => {
        
        return (
            <Modal isVisible={isVisible} animationType="slide">
                 <View style={{...styles.modalContainer}}>
                    
                    <View style={{marginBottom: 15, width: "100%"}}>
                        <Text style={{ fontWeight: "bold", textAlign: "center", }}>Discount on Invoice Total</Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => { this.setInvoicePercentageDiscount(!this.state.discount.is_percentage); }} style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                        <Checkbox status={this.state.discount.is_percentage ? 'checked' : 'unchecked'} />
                        <Text>Enable Percentage</Text>
                    </TouchableOpacity>

                    <View style={{marginTop: 10, color: "#999"}}>       
                        
                        <View style={styles.textInputNoMargins}>
                            <TextInput value={this.state.discount.value.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setDiscountValueInvoice, text)} style={{flex: 2}} placeholder={this.state.language.discount_value} />
                            {
                                this.state.discount.is_percentage ?
                                <TextInput status='checked' value={this.state.discount.percentage.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setDiscountPercentageInvoice, text)} style={{flex: 1, borderLeftWidth: 1, borderLeftColor: "#ddd", paddingLeft: 10}} placeholder='%' />
                                : ""
                            }            
                        </View> 

                    </View>

                    <View style={{flexDirection: "row", gap: 10, marginTop: 20}}>
                        <Button onPress={this.closeInvoiceDiscountModal} mode="contained" style={{borderColor: this.state.default_color, borderWidth: 1, borderRadius: 0, backgroundColor: "transparent"}}>
                            <Text style={{color: this.state.default_color}}>Cancel</Text>
                        </Button>
                        <Button onPress={this.applyChangesDiscountOnInvoice} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 0, flexGrow: 1}}>
                            <Text style={{color: "#fff"}}>Apply Changes</Text>
                        </Button>
                    </View>
                 </View>
            </Modal>
        );

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

    validateInputNumeric = (setValue, value) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value)) {
          setValue(value);
        }
    }
 

 
    calculate_object_per_data_change = (index, quantity ) => {
        
        this.setState(prevState => {

            // Cloning data for immutability
            const all = [...prevState.invoices_details];
            const item = {...all[index]};
    
           
            var discount = item.updated_discount; 
            var discount_value = discount.value;
          
            if( discount.is_percentage ) {
                discount_value = (parseFloat(discount.percentage) * parseFloat(item.subtotal)) / 100;
            }
            
            
            const total_cost = parseFloat(item.updated_price.cost) * parseFloat(quantity);
            const total_quantity = parseFloat(quantity) * parseFloat(item.updated_price.factor);
            const subtotal = parseFloat(quantity) * parseFloat(item.updated_price.sale);
            if(isNaN(subtotal)) {
                subtotal = 0;
            }
            const calculate_total_price = parseFloat(subtotal) - ( parseFloat(discount_value) * parseFloat(quantity));
            
            // Updating the item with calculated values
            item.total_cost = total_cost;
            item.total_quantity = total_quantity;
            item.subtotal = subtotal;
            item.total_price = calculate_total_price;
    
            all[index] = item;
    
            // Return the new state
            return {invoices_details: all};
        }, () => {
            // Callback function to handle further actions after state update
            setTimeout(() => { this.calculateInvoiceData();}, 50)
        });
        
    }; 

    storeQuantityToArray = () => {

        const quantity = this.state.quantity_number;
        const index = this.state.index_in_update;

        if (index === -1) {
            return;
        }

        this.setState((prevState) => {
            if (!prevState.invoices_details.length) {
                return null;  // It's good practice to return null if no updates should occur
            }

            // Cloning the invoices details to maintain immutability
            const invoices_details = [...prevState.invoices_details];
            invoices_details[index] = {
                ...invoices_details[index],
                quantity: quantity
            };

            // Return the updated state
            return {
                invoices_details,
                index_in_update: -1,
                quantity_modal_open: false,
                object_in_update: null,
                quantity_number: 1
            };
        }, () => {
            // After state is updated, then call these functions
            this.calculate_object_per_data_change(index, quantity);
            this.calculateInvoiceData();
        });
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

    setPercentageDiscount = (val) => {
        this.setState({
            enabled_discount_percentage: val
        })
    }

    choose_from_default_price = (objectex) => {

        var itemIndex = this.state.index_in_update;
        if( itemIndex == -1 ) {
            return;
        }

        var items = [ ...this.state.invoices_details]; 
        var update_price = {...items[itemIndex].updated_price};
            update_price.cost = objectex.purchase_price;
            update_price.factor = parseFloat(objectex.factor);
            update_price.local_id = objectex.local_id;
            update_price.name = objectex.name;
            update_price.sale = objectex.sales_price;
            update_price.unit_name = objectex.unit_name;
            update_price.unit_short = objectex.unit_short;
        
        // update items
        items[itemIndex].updated_price = update_price;
        this.setState({
            invoices_details: items,
            index_in_update: -1, 
            open_prices_modal: false
        }, () => { 

            if( itemIndex == -1 ) {
                return; 
            }

            var quantity = this.state.invoices_details[itemIndex].quantity
            this.calculate_object_per_data_change(itemIndex, quantity);
            this.calculateInvoiceData();

        }); 
        // //console.log(objectex);
    }

    close_price_modal = () => {
        this.setOpenPricesModal();
    }

    setCustomPrice = (value) => {
        this.setState({
            customPrice: value
        })
    }

    setDiscountValue = (value) => {
        this.setState({
            discountValue: value
        })
    }

    setDiscountPercentage = (value) => {

        var updates = {
            discountPercentage: value
        };

        if( value != '' ) {
            updates.discountValue = '';
        }

        this.setState(updates);

    }

    setTaxPercentageInvoice = (value) => {

        this.setState((prevState) => {

            var old = prevState.tax;

            return {
                tax: {
                    ...old, 
                    value: "0.00",
                    percentage: value
                }
            };
        });

    }

    setVatPercentageInvoice = (value) => {

        this.setState((prevState) => {

            var old = prevState.vat;

            return {
                vat: {
                    ...old, 
                    value: "0.00",
                    percentage: value
                }
            };
        });

    }




    setDiscountPercentageInvoice = (value) => {

        this.setState((prevState) => {

            var old = prevState.discount;

            return {
                discount: {
                    ...old, 
                    value: "0.00",
                    percentage: value
                }
            };
        });

    }

    applyPriceOptionsChange = () => {
        
        if( this.state.index_in_update == -1 ) {
            return; 
        }
        
        var itemIndex = this.state.index_in_update;

        var new_discount_perc_enable = this.state.enabled_discount_percentage;

        var new_discount_value = this.state.discountValue;
        var new_discount_percentage = this.state.discountPercentage;
        var new_price = this.state.customPrice;

        var item = [...this.state.invoices_details];
        var item_object = { ...item[this.state.index_in_update] };

        // custom new price 
        if( new_price != "" ) {
            item_object.updated_price.sale = new_price;
        }

        // custom discount value or percentage 
        if( new_discount_value != "" ) {
            item_object.updated_discount.value = parseFloat(new_discount_value);
        }
        if( new_discount_percentage != "" ) {
            item_object.updated_discount.percentage = parseFloat(new_discount_percentage);
            
            var salePrice = parseFloat(item_object.updated_price.sale);
            item_object.updated_discount.value = ( parseFloat(new_discount_percentage) * salePrice ) / 100;

        }
        
        // update changes 
        item[this.state.index_in_update] = item_object;

        this.setState({
            invoices_details: item, 
            open_prices_modal: false,
            discountPercentage: '',  
            discountValue: '',
            customPrice: ''
        }, () => {
            if( itemIndex == -1 ) {
                return; 
            }

            var quantity = this.state.invoices_details[itemIndex].quantity
            this.calculate_object_per_data_change(itemIndex, quantity);
            this.calculateInvoiceData();
        });
    }

    PriceModal = ({ isVisible, toggleModal }) => {

        
        return (
            <Modal isVisible={isVisible} animationType="slide">
                <View style={{...styles.modalContainer, flex: 1}}>
                
                    <Text style={{fontWeight:"bold", marginBottom: 20, justifyContent: "center", textAlign:"center", fontSize: 20}}>Custom {this.state.item_name} Options</Text>
                    <ScrollView>
                    <Text style={{fontWeight:"bold", marginBottom: 10}}>Default Prices</Text>
                    <Text style={{marginBottom: 20, color: "#999"}}>Select your price by clicking on one of the options from the list below, according to the unit name.</Text>
                    
                    {
                        this.state.selected_product_prices.map( (x, i) => { 
                            return (
                                <TouchableOpacity onPress={() => this.choose_from_default_price(x)} key={i} style={{flexDirection: "row", justifyContent: "space-between", backgroundColor: this.oddoreven(i), padding: 10}}>
                                    { x.name == "" ? "" : <Text>Data</Text>}
                                    { x.unit_name == "" ? "" : <Text>{x.unit_name}</Text>}

                                    {
                                        x.name == "" && x.unit_name == "" ?
                                         <Text>Unit</Text>: ""
                                    }

                                    { x.sales_price == "" ? "" : <Text>{x.sales_price}</Text>}
                                </TouchableOpacity>
                            )
                        }) 
                    }

                    <View style={{marginTop: 20, color: "#999"}}>
                        <Text style={{fontWeight:"bold"}}>Custom Price</Text>
                        <Text style={{marginTop: 5, color: "#999"}}>The new price will only apply for this invoice according to the latest selected unit.</Text>
                        <View style={{borderWidth: 1, borderColor: '#eee', height: 35, marginTop: 8, padding: 8}}>
                            <TextInput style={{ flexGrow: 1, textAlign: "left"}} 
                                keyboardType="numeric" // Use 'numeric' for better compatibility
                                placeholder="write your new price here."  // Ensure value is a string
                                value={this.state.customPrice.toString()} 
                                onChangeText={text => this.validateInputNumeric(this.setCustomPrice, text)}
                            />
                        </View>
                    </View>

                    <View style={{marginTop: 20, color: "#999"}}> 
                         
                        <View style={{...styles.field_container}}>
                            <View style={{flexDirection: "row", height: 40, flex: 1, justifyContent: "space-between", alignItems: "center"}}>
                                <Text style={styles.inputLabelTextSales}>Custom Discount</Text>
                                
                                <TouchableOpacity onPress={() => { this.setPercentageDiscount(!this.state.enabled_discount_percentage); }} style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                                    <Checkbox status={this.state.enabled_discount_percentage ? 'checked' : 'unchecked'} />
                                    <Text style={{fontSize: 12}}>Percentage(%)</Text>                                
                                </TouchableOpacity>
                            </View> 
                            <Text style={{marginBottom: 20, color: "#999", flexGrow: 1}}>The discount will be applied to each individual unit, rather than to the total number of units purchased.</Text>
                            <View style={styles.textInputNoMargins}>
                                <TextInput value={this.state.discountValue.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setDiscountValue, text)} style={{flex: 2}} placeholder={this.state.language.discount_value} />
                                {
                                    this.state.enabled_discount_percentage ?
                                    <TextInput status='checked' value={this.state.discountPercentage.toString()} keyboardType="numeric" onChangeText={text => this.validateInputNumeric(this.setDiscountPercentage, text)} style={{flex: 1, borderLeftWidth: 1, borderLeftColor: "#ddd", paddingLeft: 10}} placeholder='%' />
                                    : ""
                                }
                                
                            </View> 
                        </View>
                    </View>
                    
                    

                    </ScrollView>
                    <View style={{flexDirection: "row", gap: 10}}>
                        <Button onPress={this.close_price_modal} mode="contained" style={{borderColor: this.state.default_color, borderWidth: 1, borderRadius: 0, backgroundColor: "transparent"}}>
                            <Text style={{color: this.state.default_color}}>Cancel</Text>
                        </Button>
                        <Button onPress={this.applyPriceOptionsChange} mode="contained" style={{backgroundColor: this.state.default_color, borderRadius: 0, flexGrow: 1}}>
                            <Text style={{color: "#fff"}}>Apply Changes</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        );
    };

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
                            {/*<TouchableOpacity onPress={this.setMultipleItems} style={{flexDirection:"row", alignItems: "center"}}>
                                <Checkbox status={this.state.multiple_items ? "checked": ""} />
                                <Text>Multiple Items</Text>
                            </TouchableOpacity>*/}
                        </View>
                        {/*<View>
                            <Text style={{color:"#999"}}>You can select more than one item once you mark the "Multiple Items".</Text>
                        </View> */}
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
        var _zero_left = "000";
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

        
         
        
        if( generate.data != null && Object.keys(generate.data).length ) {
            
            var data = generate.data;
            if( isArray( data )) {
                data = data[0];
            }

            _zero_left = "000";
            _number = parseInt( data.number ) + 1;             
            invoice_number = "000" + _number.toString(); 

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

        this.setPressBtn(true);

        // generate invoice number by this.state.last_recorded object if it is not null
        if( this.state.last_recorded == null ) {
            Alert.alert(this.state.language.error, this.state.language.something_error);
            return;
        } 
        var { number } = this.state.last_recorded;
        var { zero_left } = this.state.last_recorded;
        var { type } = this.state.last_recorded;

        var response = await RecordedInstance.create_update({
            number, zero_left, type
        });
         
        if( response.is_error ) {
            this.setPressBtn(false);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message);
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage("Cannot save invoice, something went wrong"); 
            return;
        }

        // store bulk invoice details
        if(!this.state.invoices_details.length) {
            this.setPressBtn(false);
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.error_message);
            this.setNotificationCssTextClass(styles.error_text)
            this.setNotificationMessage("There are no items added to this invoice"); 
            return;
        }

                
        // store invoice data  updateAsync
        var res = await DocDetailsInstance.updateBasedOnKeys(this.state.invoices_details, {
            doc_id: this.state.doc_id
        });

        this.setPressBtn(false); 

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

    openQuantityUpdator = (item, index) => { 
       this.openQuantityModal(item, index); 
    }

    setOrderTrackingNumber = (text) => {
        this.setState({
            tracking_number: text
        })
    }
    deleteItemFromInvoice = (index) => {
        
        if( index == -1 )  {
            return; 
        }

        var items = [...this.state.invoices_details];
        items.splice(index, 1); 

        this.setState({
            invoices_details: items
        }, () => {
            this.calculateInvoiceData();
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
                                    <this.PriceModal isVisible={this.state.open_prices_modal} toggleModal={this.setOpenPricesModal} />
                                    <this.InvoiceDicountModal isVisible={this.state.invoice_discount_modal} toggleModal={this.setOpenDiscountInvoiceModal} />
                                    <this.InvoiceTaxModal isVisible={this.state.invoice_tax_modal} toggleModal={this.setOpenTaxInvoiceModal} />
                                    <this.InvoiceVatModal isVisible={this.state.invoice_vat_modal} toggleModal={this.setOpenVatInvoiceModal} />
                                    <this.ShippingDeliveryModal isVisible={this.state.invoice_shipping_delivery} toggleModal={this.setOpenShippingInvoiceModal} />

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
                                                                <TouchableOpacity onPress={() => this.deleteItemFromInvoice(index)} style={{marginLeft: -10, marginRight: -10}}>
                                                                    <Image  
                                                                        source={require('./../../assets/icons/trash.png')}
                                                                        style={{width: 18, height: 18}} 
                                                                        resizeMode="cover"
                                                                    />
                                                                </TouchableOpacity>
                                                                <View style={{paddingLeft: 5, paddingRight: 5, flexDirection: "row", gap: 10}}>
                                                                    
                                                                    <Text style={{color: "#000"}}>
                                                                        {item.product.name}
                                                                    </Text>
                                                                    {item.updated_discount.value != "" ? 
                                                                    <Image
                                                                        source={require("./../../assets/icons/discount-9685.png")}
                                                                        style={{width:20, height:20}}
                                                                    />
                                                                    : ""}

                                                                </View>
                                                            </View>
                                                            <View style={{flex: 1}}>
                                                               <TouchableOpacity onPress={() => this.openQuantityUpdator(item, index)} style={{borderRadius: 3, backgroundColor: this.state.default_color}}>
                                                                    <Text style={{color: "#000", fontWeight: "bold", textAlign: "center", color: "#fff"}}>
                                                                        {item.quantity}
                                                                    </Text>
                                                               </TouchableOpacity>
                                                            </View>
                                                            <View style={{flex: 1}}>
                                                                <TouchableOpacity onPress={() => this.setOpenPricesModalHandler(item, index)} style={{borderRadius: 3, backgroundColor: this.state.default_color}}>
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
                                        <Text style={{fontWeight: "bold"}}>${this.state.subtotal == "" ? "0.00" : this.state.subtotal}</Text>
                                    </View>
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#dfdfdf", borderStyle: "dashed", borderBottomWidth: 1, padding: 10}}>
                                        <Text>Discount</Text>
                                        <TouchableOpacity onPress={this.setOpenDiscountInvoiceModal}>
                                            <Text style={{fontWeight: "bold", backgroundColor: this.state.default_color, padding:5, color: "#fff", borderRadius:3}}>${this.state.discount.value == ""? "0.00": this.state.discount.value }</Text>
                                        </TouchableOpacity> 
                                    </View>
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#dfdfdf", borderStyle: "dashed", borderBottomWidth: 1, padding: 10}}>
                                        <Text>Tax</Text>
                                        <TouchableOpacity onPress={this.setOpenTaxInvoiceModal}>
                                            <Text style={{fontWeight: "bold", backgroundColor: this.state.default_color, padding:5, color: "#fff", borderRadius:3}}>${this.state.tax.value ==""? "0.00": this.state.tax.value}</Text>
                                        </TouchableOpacity> 
                                    </View>

                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#dfdfdf", borderStyle: "dashed", borderBottomWidth: 1, padding: 10}}>
                                        <Text>Vat</Text>
                                        <TouchableOpacity onPress={this.setOpenVatInvoiceModal}>
                                            <Text style={{fontWeight: "bold", backgroundColor: this.state.default_color, padding:5, color: "#fff", borderRadius:3}}>${this.state.vat.value == "" ?"0.00": this.state.vat.value}</Text>
                                        </TouchableOpacity> 
                                    </View>  

                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10}}>
                                        <Text>Shipping or Delivery Cost</Text>
                                        <TouchableOpacity onPress={this.setOpenShippingInvoiceModal}>
                                            <Text style={{fontWeight: "bold", backgroundColor: this.state.default_color, padding:5, color: "#fff", borderRadius:3}}>${this.state.shipping_or_delivery_cost == ""? "0.00": this.state.shipping_or_delivery_cost}</Text>
                                        </TouchableOpacity> 
                                    </View>  

                                </View>



                                <View style={{borderWidth: 1,borderStyle: "dashed", borderColor: "#dfdfdf", padding: 5, backgroundColor: "#f9f9f9", marginTop: 25}}>
                                    
                                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10}}>
                                        <Text style={{fontWeight: "bold"}}>Total</Text> 
                                        <Text style={{fontWeight: "bold", fontSize: 18, color:this.state.default_color}}>${this.state.total == "" ?"0.00": this.state.total}</Text>
                                    </View> 

                                </View>
                                 

                                <View style={{ gap: 10, marginTop: 30, flex: 1, flexDirection: "column", overflow: "hidden"}}> 
                                    <Text style={{fontWeight: "bold"}}>Order Tracking Number</Text>
                                    <View style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf' }}>
                                        <TextInput value={this.state.tracking_number} onChangeText={text => this.setChangedValue(text, this.setOrderTrackingNumber)} style={{flex: 1}} placeholder={this.state.language.tracking_number} />
                                    </View>
                                </View>
                            </View> 

                            <View style={{ ...styles.wrapper, ...this.state.notificationBox, ...this.state.notificationCssClass, ...styles.space_top_25}}>
                                <Text style={this.state.notificationTextCssClass}>{this.state.notificationMessage}</Text>
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