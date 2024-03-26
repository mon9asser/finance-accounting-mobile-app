
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import Modal from "react-native-modal"; 

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Animated, I18nManager, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Button, Checkbox } from "react-native-paper"; 
import { LineChart } from "react-native-chart-kit";
import { Camera } from 'expo-camera';

// App Files 
import {config} from "../../settings/config.js" ;
import {styles} from "../../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../../controllers/cores/settings.js";
import {get_lang} from '../../controllers/languages.js'; 
import { SelectList } from 'react-native-dropdown-select-list';

// Controller 
import { BranchInstance } from "../../controllers/storage/branches.js"
import { usr } from "../../controllers/storage/user.js";

import {CategoryInstance} from "./../../controllers/storage/categories.js";
import { generateId } from "../../controllers/helpers.js";
 
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

class AddNewProductComponents extends Component {

    constructor(props) {
        super(props);
        
        this.state = {

            language: {}, 
            default_color: "#6b5353", 

            isCategoryModalOpen: false,
            isBarcodeScannerOpen: false, 

            isPricesPackageModalOpen: false,
            isPercentageDiscount: false,
            isModificationPrice: false,
            validatedTextEnabled: false, 
            currentIndex: -1,

            requiredFields: {
                unit:  "#dfdfdf",
                price:  "#dfdfdf"
            },

            db_categories: {
                expenses: [], 
                products: []
            }, 
            selected_category: null, 

            product_local_id: generateId(),
            local_id: generateId(),
            unitName: '',
            shortUnitName: '',
            unitValue: '',
            salePrice: '',
            purchasePrice: '',
            defaultPrice: false,

            barcode_data: '',
            product_name: '',

            enabled_discount_percentage: false, 
            PricePackageButtonText: "Add",

            is_pressed_category_save: false, 
            
            hasPermission: null,
            scanned: false, 
            scanText: "Not scanned yet", 
            
            prices_list: [],
            discountValue: '', 
            discountPercentage: ''
        };

    }

    setBtnPriceEditText= ( value ) => {
        this.setState({
            PricePackageButtonText: value
        })
    }
    setProductName = ( value ) => {
        this.setState({
            product_name: value
        })
    }
 
    setBarcodeNumber = (value) => {
        this.setState({
            barcode_data: value
        })
    }

    setHasPermission = (value) => {
       this.setState({
            hasPermission: value
       }); 
    } 

    setScanned = (value) => {
        this.setState({
            scanned: value
       }); 
    }

    setscanText = (value) => {
        this.setState({
            scanText: value
       }); 
    }

    setPressedBtnCategorySave = (value) => {
        this.setState({
            is_pressed_category_save: value
        });
    }

    toggleModalOfPricesPackage = () => {
        
        this.setState({
            isPricesPackageModalOpen: !this.state.isPricesPackageModalOpen
        })
    }

    
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


        var session_ = await get_last_session_form("add-new-product"); 
        if( session_ == null ) {
            return; 
        }

        /*
        this.setBranchName(session_.branch_name);
        this.setBranchCountry(session_.branch_country);
        this.setBranchCity(session_.branch_city);
        this.setBranchAddress(session_.branch_address);
        this.setBranchNumber(session_.branch_number);
        this.setBranchNote(session_.note);*/

    }

    // internet connection
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
            
            // headerLeft: () => this.headerLeftComponent(), 
            // headerRight: () => this.headerRightComponent()
            
        }) 

    }
    
    get_categories_async = async() => {
        
        //await CategoryInstance.Schema.instance.save({key: "categories", data: []})

        var categories = await CategoryInstance.get_records();
        
        
        
        if( categories.is_error ) return; 
        if( ! categories.data.length ) return; 

        this.setState({
            db_categories: {
                expenses: categories.data.filter( x => x.app_name == 1),
                products: categories.data.filter( x => x.app_name == 0),
            }
        });  
    }

    componentDidMount = async () => {
         
        // setup language
        this.setup_params();  
        
        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options(); 

        // add data to fields if session already expired before 
        this.restore_data_to_fields();

        // getting all products async 
        await this.get_categories_async();

        // camera permission 
        await this.assignPermissionStatus();

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

   
    
    toggleCategoryModalOpen = () => {
        this.setState({
            isCategoryModalOpen: !this.state.isCategoryModalOpen
        })
    }
    
    toggleBarcodeScannerOpen = () => { 

        // this.enableValidMessage(false);
        // this.setScanned(false);

        this.setState(prevState => ({
            isBarcodeScannerOpen: !prevState.isBarcodeScannerOpen
        }));

        

    }
    
    setLocalId = ( value = null ) => {
        this.setState({
            local_id: value == null ? generateId(): value 
        })
    }
 
    setUnitName = (val) => {
        this.setState({
            unitName: val
        })
    }

    setShortUnitName = (val) => {
        this.setState({
            shortUnitName: val
        })
    }

    setUnitValue = (val) => {
        this.setState({
            unitValue: val
        })
    }

    setSalePrice = (val) => {
        this.setState({
            salePrice: val
        })
    }

    setPurchasePrice = (val) => {
        this.setState({
            purchasePrice: val
        })
    }

    setModificaionAdd = () => {
        
        
        this.isDefaultPrice(false);
        this.setUnitName('');
        this.setShortUnitName('');
        this.setUnitValue('');
        this.setSalePrice('');
        this.setPurchasePrice(''); 
        this.toggleModalOfPricesPackage();

    }

    isDefaultPrice = ( value ) => {
        this.setState({
            defaultPrice: value
        })
    }
    
    handleInputChange = ( text, id ) => {
         
        var index = this.state.db_categories.products.findIndex(x => x.local_id == id)
        
        if(index == -1 ) {
            return; 
        } 
        
        
        this.setState( (prevState) => {
            
            let updatedProductsCats = [...prevState.db_categories.products];
            updatedProductsCats[index].category_name = text;

            return {
                db_categories: {
                    ...prevState.db_categories,
                    products: updatedProductsCats,
                },
            };
        

        });
        
    }

    removeDyntamicCategory = async (item_local_id) => {
        
        // remove it from list first 
        var index = this.state.db_categories.products.findIndex( x => x.local_id == item_local_id);
        if( index == -1 ) return; 

        var updates = this.state.db_categories.products.filter( x => x.local_id != item_local_id );
      
        this.setState( (prevState) => {
             

            return {
                db_categories: {
                    ...prevState.db_categories,
                    products: updates,
                },
            };
        

        });

        // send request to remote it from database async 
        var _bulk = [item_local_id];
        await CategoryInstance.delete_records(_bulk);
    }

    RenderDBCategories = (item) => { 
        


        return (
            <View key={item.local_id}  style={{...styles.textInputNoMargins, marginBottom: 10}}>
                <TextInput
                        style={{flex: 1}} 
                        placeholder='Category Name' 
                        value={item.category_name} 
                        onChangeText={(text) => this.handleInputChange(text, item.local_id)}
                    />

                <TouchableOpacity onPress={() => this.removeDyntamicCategory(item.local_id)}>
                    <Image
                        source={require('./../../assets/icons/trash-icon.png')}
                        style={{height: 25, width:25, borderRadius: 25, flex: 1}}
                        resizeMode="cover"
                        PlaceholderContent={<ActivityIndicator />}
                    />
                </TouchableOpacity>
            </View> 
        );
    }

    add_new_category = () => {

        var new_id = generateId();
        var objex = {
            app_name: 0, 
            category_name: '', 
            local_id: new_id, 
        };

        var old = this.state.db_categories.products;
        old.push(objex);

        this.setState((prevState) => {
            
            return {
                db_categories: {
                    ...prevState.db_categories,
                    products: old 
                } 
            };
        });

    }

    store_categories = async () => {

        this.setPressedBtnCategorySave(true);
        
        // use bulk insert into database 
        var _bulk = [...this.state.db_categories.expenses, ...this.state.db_categories.products]


        // get the stored data to category fields 
        var reqs = await CategoryInstance.bulk_create_update(_bulk);
        
        if( reqs.login_redirect ) {
            this.toggleCategoryModalOpen();
            this.props.navigation.navigate("Login", {redirect_to: "add-new-product"});
            return;  
        }

        if( reqs.is_error ) {
            this.toggleCategoryModalOpen();
            return; 
        }

        // load data with new 
        await this.get_categories_async(); 
        this.setPressedBtnCategorySave(false);
        this.toggleCategoryModalOpen();

    }

    isValidBarcode = (data) => {
        const barcodePattern = /^\d{12,13}$/; // Adjust pattern based on expected barcode type
        return barcodePattern.test(data);
    }

    enableValidMessage = (value) => {
        this.setState({
            validatedTextEnabled: value
        })
    }
    // Invalid barcode. Please scan a valid barcode
    handleBarCodeScanned = ({ type, data }) => {

        if (!this.isValidBarcode(data)) {
            this.enableValidMessage(true);
            this.setScanned(false);
            return;
        } 

        this.setBarcodeNumber(data)
        this.setScanned(true);
        this.toggleBarcodeScannerOpen();
    }

    BarcodeScannerModal = ({ isVisible, toggleModal }) => {
         
        return (
            <Modal isVisible={isVisible}>
                <View style={{...styles.modalContainer, height: 500, borderRadius: 5}}>
                    <View style={{maxHeight: 500, flex: 1}}>
                        <View style={{flexDirection: "column", justifyContent: 'space-between', alignItems: 'center', marginBottom:5}}>
                            <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 22}}>
                                Barcode Scanner
                            </Text>  
                            <Text style={{color:"#666", textAlign: "center"}}>Please ensure to scan the barcode present on the box.</Text> 
                        </View>

                        {this.state.validatedTextEnabled ? <Text style={{backgroundColor: "red", borderRadius: 5, color: "#fff", padding: 7, textAlign: "center"}}>Invalid barcode. Please scan a valid barcode.</Text> :"" }

                        <TouchableOpacity style={{marginTop: 10, textAlign:"center", width: "100%", justifyContent: "center", alignItems: "center"}} onPress={this.toggleBarcodeScannerOpen}><Text>Cancel</Text></TouchableOpacity>
                        <View style={{marginTop: 10, height: 250, justifyContent: 'center', alignItems: 'center'}}> 
                            <Camera style={{height: "100%", width: "100%", aspectRatio: 1}} onBarCodeScanned={this.state.scanned ? undefined : this.handleBarCodeScanned}></Camera>
                        </View> 

                        <View>  
                            <ActivityIndicator style={{marginTop: 15}}  color={this.state.default_color} size={'large'}/>
                        </View> 
                    </View> 
                </View>
            </Modal>
        );
    };
    

    CategoriesModal = ({ isVisible, toggleModal }) => (
        <Modal isVisible={isVisible}>
            <View style={{...styles.modalContainer, flex: 1}}>
                <ScrollView style={{maxHeight: 600, flex: 1}}>

                    <View style={{flex:1, flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', marginBottom:5}}>
                        <Text style={{fontWeight: 'bold', flex:1, alignItems: 'center', fontSize: 22}}>
                            Categories
                        </Text> 

                        <TouchableOpacity onPress={this.add_new_category}>
                            <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Add New Field</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{flex: 1, marginTop: 5}}>

                        {
                            this.state.db_categories.products.length ?
                                this.state.db_categories.products.map(item => this.RenderDBCategories(item))
                            : 
                                <View style={{flex: 1, backgroundColor: '#ffffff', padding: 10, marginTop: 20}}>
                                    <Text style={{color: '#999', lineHeight:20, textAlign:"center"}}>No categories were found. Please click the 'Add New Field' button to create a new category.</Text>
                                </View>
                        } 

                    </View> 
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 10}}>
                        <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                           

                            <TouchableOpacity style={{ height: 50, marginTop: 10, borderWidth:1, borderColor:cls.btnDeleteBorderColor, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }} onPress={this.toggleCategoryModalOpen}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnDeleteBorderTextColor}}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ height: 50, marginTop: 10, backgroundColor:cls.btnPrimaryBg, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }} onPress={this.store_categories}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnPrimaryColor}}>
                                    {
                                        this.state.is_pressed_category_save?
                                        <ActivityIndicator color={'#fff'} />: 
                                        'Save'
                                    }
                                </Text>
                            </TouchableOpacity>
                        </View>
                </View> 
            </View>
        </Modal>
    )   


    setButtonPricePackage = (val) => {
        this.setState({
            PricePackageButtonText: val
        })
    }

    

    StoreModalPricesPackage = () => {
        
       // var product_local_id, name, unit_name, unit_short, sales_price, purchase_price, factor, is_default_price
        
        var product_local_id = this.state.product_local_id;
        var local_id = this.state.local_id;
        var is_default_price = this.state.defaultPrice;  
        var unit_name = this.state.unitName;
        var unit_short = this.state.shortUnitName;
        var factor = this.state.unitValue;
        var sales_price = this.state.salePrice;
        var purchase_price = this.state.purchasePrice; 

        // push to the array
        this.setState((prevState) => {
            
            var updates = {
                local_id,
                product_local_id,
                unit_name,
                unit_short,
                is_default_price,
                factor,
                sales_price,
                purchase_price
            }
            

            // new list 
            var old_list = prevState.prices_list; 

            if( is_default_price == true ) {
                old_list = old_list.map( x => {
                    x.is_default_price = false; 
                    return x;
                });
            }

            // check data exists 
            var index = old_list.findIndex( x => x.local_id == local_id );
            if( index == -1 ) {
                old_list.push(updates);
            } else {
                old_list[index].local_id = local_id
                old_list[index].product_local_id = product_local_id
                old_list[index].unit_name = unit_name
                old_list[index].unit_short = unit_short
                old_list[index].is_default_price = is_default_price
                old_list[index].factor = factor
                old_list[index].sales_price = sales_price
                old_list[index].purchase_price = purchase_price
            }

            return {
                prices_list: old_list
            };
            
        });

        this.setLocalId()
        this.setUnitName('')
        this.setShortUnitName('')
        this.setUnitValue('')
        this.setSalePrice('')
        this.setPurchasePrice('')
        this.isDefaultPrice(false);  
        
        this.toggleModalOfPricesPackage();
    }

    validateInput = (setValue, value) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value)) {
          setValue(value);
        }
    }
    
    PricesPackagesModal = ({ isVisible, toggleModal }) => {

        // isVisible = true; 
        return (
        
            <Modal isVisible={isVisible}>
                <View style={styles.modalContainer}>
                    <ScrollView style={{maxHeight: 600}}>
                    <View style={{flex:1, marginBottom:20}}>
                        <Text style={{fontWeight: 'bold', fontSize: 22}}>
                            Price Package
                        </Text>
                    </View>
    
                    
                        <View style={{flex: 1}}>
                            <TouchableOpacity onPress={() => this.isDefaultPrice(!this.state.defaultPrice)} style={{flexDirection: "row", alignItems: "center", alignContent: "center", marginBottom: 20, justifyContent: "space-between"}}>
                                <View>
                                    <Text style={{fontWeight: "bold"}}>Mark as a default price</Text>
                                </View> 

                                <Checkbox status={this.state.defaultPrice ? "checked": "unchecked"}/>
                                
                            </TouchableOpacity> 
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Unit Name</Text>
                            </View>
                            <View style={styles.textInput}>
                                <TextInput onChangeText={(value) => {this.setUnitName(value)}} style={{flex: 1}} placeholder='Example:- Gram' value={this.state.unitName} />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Unit Short Name</Text>
                            </View>
                            <View style={styles.textInput}>
                                <TextInput onChangeText={(value) => {this.setShortUnitName(value)}} style={{flex: 1}} placeholder='Example:- gm' value={this.state.shortUnitName}  />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Unit Value</Text>
                                <Text style={styles.inputLabelText}>( Based on the Unit Name )</Text>
                            </View>
                            <View style={{...styles.textInput, borderColor: this.state.requiredFields.unit}}> 
                            
                                <TextInput value={this.state.unitValue.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setUnitValue, text)} style={{flex: 1}} placeholder='Example:- 1' />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Sale Price</Text>
                                <Text style={styles.inputLabelText}>( Per Unit )</Text>
                            </View>
                            <View style={{...styles.textInput, borderColor: this.state.requiredFields.price}}>
                                <TextInput value={this.state.salePrice.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setSalePrice, text)} style={{flex: 1}} placeholder='Example:- 15' />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Purchase Price</Text>
                                <Text style={styles.inputLabelText}>( Per Unit )</Text>
                            </View>
                            <View style={styles.textInput}>
                                <TextInput keyboardType="numeric" onChangeText={(text) => this.validateInput(this.setPurchasePrice, text)} style={{flex: 1}}  value={this.state.purchasePrice.toString()}  placeholder='Example:- 8.5'/>
                            </View> 
                            <View style={{flex:1,  marginBottom: 30, marginTop: -30}}>
                                <Text style={{...styles.product_price_text}}>Note: You don't have a purchase price? We are planning to add a calculator for raw materials in the next update.</Text>
                            </View>
                        </View>
                        <View style={{flex: 1, flexDirection: "row", height: 80, gap: 10}}>
                        
                            <TouchableOpacity style={{ height: 50, marginTop: 10, borderWidth:1, borderColor:cls.btnDeleteBorderColor, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }} onPress={this.toggleModalOfPricesPackage}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnDeleteBorderTextColor}}>Cancel</Text>
                            </TouchableOpacity>
    
                            <TouchableOpacity style={{ height: 50, marginTop: 10, backgroundColor:cls.btnPrimaryBg, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }} onPress={this.StoreModalPricesPackage}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnPrimaryColor}}>{this.state.PricePackageButtonText}</Text>
                            </TouchableOpacity>
    
                        </View>
                    </ScrollView>
                </View>
            </Modal>    
        )
    }

    selecte_category_object( val ) {
        
        var index = this.state.db_categories.products.findIndex( x => x.category_name == val );
        if( index == -1 ) {
            return;
        }
        this.state.selected_category = this.state.db_categories.products[index];


    }

    assignPermissionStatus = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        this.setHasPermission(status === 'granted');
    }

    checkCameraPermission = () => {

       
        if( this.state.hasPermission == false || this.state.hasPermission == null ) {
            alert("To scan the barcode, you need to let the app use your camera. Please turn on camera permission.")
            return;
        }    
        
        // open the scanner 
        this.enableValidMessage(false);
        this.setScanned(false);
        this.toggleBarcodeScannerOpen();
    }


    setPercentageDiscount = (val) => {
        this.setState({
            enabled_discount_percentage: val
        })
    }
    
    trash_price_list = (id) => {
        this.setState((prevState) => {

            var update = prevState.prices_list.filter( x => x.local_id != id );

            return {
                prices_list: update
            }

        })
    }

    edit_price_package = (item) => {

        this.setLocalId(item.local_id)
        this.setUnitName(item.unit_name)
        this.setShortUnitName(item.unit_short)
        this.setUnitValue(item.factor)
        this.setSalePrice(item.sales_price)
        this.setPurchasePrice(item.purchase_price)
        this.isDefaultPrice(item.is_default_price);  
        this.setBtnPriceEditText("Update");  
        
        this.toggleModalOfPricesPackage();

    }

    ListOfPricesComponents = ({item}) => {
          
        return (
            <TouchableOpacity key={item.local_id} onPress={() => this.edit_price_package(item)} style={{...styles.product_price_container}}>
                <View style={{alignItems: "center", ...styles.direction_row}}> 
                    <Text style={{...styles.product_price_text}}>{item.unit_name}</Text>
                </View>
                <View style={{...styles.direction_row, ...styles.gap_15, alignItems: "center"}}>
                    <Text style={{...styles.product_price_text}}>{item.purchase_price}</Text>
                    <Text style={{...styles.product_price_text}}>{item.sales_price}</Text>
                </View>
                <TouchableOpacity onPress={() => this.trash_price_list(item.local_id)}>
                    <Image
                        source={require('./../../assets/icons/trash-icon.png')}
                        style={{height: 25, width:25}}
                        resizeMode="cover"
                        PlaceholderContent={<ActivityIndicator />}
                    />
                </TouchableOpacity>
            </TouchableOpacity> 
        );
    }

    setDiscountValue = (value) => {
        this.setState({
            discountValue: value
        })
    }

    setDiscountPercentage = (value) => {
        this.setState({
            discountPercentage: value
        })
    }

    render() {
        return(
            <SafeAreaView style={{...styles.container_fluid, backgroundColor: styles.direct.color.white }}>
                
               
                
                 <ScrollView contentContainerStyle={{...styles.container1}}>
                    {this.state.isConnected? "" : this.AnimatedBoxforInternetWarning()} 

                    <View  style={{...styles.space_bottom_25, flex: 1, flexDirection: "column", gap: 0, marginTop: 35 }}>
                        <View style={{ height: 230, marginBottom: 10 }}>
                            
                            <TouchableOpacity 
                                style={{width: "100%",  marginTop: 5, flexDirection: "row",  justifyContent: "center"}}
                                onPress={() => console.log( "Upload Product Image ..." )}
                                > 
                                <Image
                                    source={require('./../../assets/icons/product-placeholder.png')}
                                    style={{height: 200, width:"100%", borderRadius: 25, width: "100%"}}
                                    resizeMode="cover"
                                    PlaceholderContent={<ActivityIndicator />} 
                                />
                            </TouchableOpacity> 
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Product Name</Text>
                            </View>
                            <View style={{...styles.textInputNoMargins}}>
                                <TextInput value={this.state.product_name} onChangeText={text => this.setProductName(text)} style={{flex: 1}} placeholder='Product Name' />
                            </View>
                        </View> 
            

                        <View style={{...styles.field_container}}>
                            <View style={{...styles.inputLabel, flexDirection: "row", justifyContent:"space-between"}}> 
                                <View><Text style={styles.inputLabelText}>Category</Text></View>
                                <TouchableOpacity onPress={this.toggleCategoryModalOpen}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Add New</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection: "column", marginTop: 5}}> 
                                <SelectList 
                                    boxStyles={styles.boxStyle} 
                                    inputStyles={{color: '#999',  flex: 1}}
                                    dropdownStyles={{flex: 1, width: '100%', borderColor:'#eee'}}
                                    placeholder="Select Category" 
                                    setSelected={(val) => this.selecte_category_object(val)}   
                                    onSelect={() => console.log(this.state.selected_category)}
                                    data={this.state.db_categories.products.map( item => {
                                        item.key = item.local_id;
                                        item.value = item.category_name
                                        return item;
                                    })} 
                                    save="value"
                                />
                            </View>

                            <this.CategoriesModal isVisible={this.state.isCategoryModalOpen} toggleModal={this.toggleCategoryModalOpen} />
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Barcode</Text>

                                 <TouchableOpacity onPress={this.checkCameraPermission}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Scan Barcode</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{...styles.textInputNoMargins}}>
                                <TextInput onChangeText={(text) => this.setState({barcode_data: text})} style={{flex: 1}} value={this.state.barcode_data} placeholder='Barcode' />
                            </View>

                            <this.BarcodeScannerModal isVisible={this.state.isBarcodeScannerOpen} toggleModal={this.toggleBarcodeScannerOpen} />
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                <Text style={styles.inputLabelText}>Discount</Text>

                                <TouchableOpacity onPress={() => { this.setPercentageDiscount(!this.state.enabled_discount_percentage); }} style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                                    <Checkbox status={this.state.enabled_discount_percentage ? 'checked' : 'unchecked'} />
                                    <Text style={{fontSize: 12}}>Enable Percentage (%)</Text>                                
                                </TouchableOpacity>
                            </View>
                            <View style={styles.textInputNoMargins}>
                                <TextInput value={this.state.discountValue.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setDiscountValue, text)} status='checked' style={{flex: 2}} placeholder='Discount Value' />
                                {
                                    this.state.enabled_discount_percentage ?
                                    <TextInput status='checked' value={this.state.discountPercentage.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setDiscountPercentage, text)} style={{flex: 1, borderLeftWidth: 1, borderLeftColor: "#ddd", paddingLeft: 10}} placeholder='%' />
                                    : ""
                                }
                                
                            </View> 
                        </View>

                        <View style={{...styles.field_container}}>

                            <View style={styles.inputLabel}>
                                <View><Text style={styles.inputLabelText}>Prices List</Text></View>
                                <TouchableOpacity onPress={this.setModificaionAdd}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Add New</Text>
                                </TouchableOpacity>
                            </View>

                            
                            {
                                this.state.prices_list.length ?
                                    this.state.prices_list.map( x => <this.ListOfPricesComponents item={x}/> ) :
                                    <View style={{justifyContent: "center", flexDirection: "row", flex: 1, borderColor: "#eee", marginTop: 5, borderWidth: 1, padding: 10}}><Text style={{color: "#999"}}>No prices found, click on "add new"</Text></View>
                            }
                            


                            <this.PricesPackagesModal isVisible={this.state.isPricesPackageModalOpen} toggleModal={this.toggleModalOfPricesPackage} />
                        </View>

                        <View style={{...styles.space_bottom_10, ...styles.space_top_25}}>
                            <Button onPress={this.saveData} style={{...styles.default_btn, backgroundColor: this.state.default_color }}>
                                {
                                    this.state.isPressed ?
                                    <ActivityIndicator color={styles.direct.color.white} />
                                    :
                                    <Text style={{color:styles.direct.color.white, ...styles.size.medium}}> {this.state.language.save} </Text> 
                                }
                            </Button>
                        </View>                      
                    </View >
                

                    
                     
                 </ScrollView> 
 
                 
            </SafeAreaView>
        )
    }
}

export {AddNewProductComponents}