
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

            isPricesPackageModalOpen: false,
            isPercentageDiscount: false,
            isModificationPrice: false,
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

            unitName: '',
            shortUnitName: '',
            unitValue: '',
            salePrice: '',
            purchasePrice: '',

            PricePackageButtonText: "Add",

            is_pressed_category_save: false 

        };

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
        
        this.setUnitName('');
        this.setShortUnitName('');
        this.setUnitValue('');
        this.setSalePrice('');
        this.setPurchasePrice(''); 
        this.toggleModalOfPricesPackage();

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
    
    PricesPackagesModal = ({ isVisible, toggleModal }) => (
        <Modal isVisible={isVisible}>
            <View style={styles.modalContainer}>
                <ScrollView style={{maxHeight: 600}}>
                <View style={{flex:1, marginBottom:20}}>
                    <Text style={{fontWeight: 'bold', fontSize: 22}}>
                        Price Package
                    </Text>
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
                            <TextInput onChangeText={(value) => {this.setUnitValue(value)}} style={{flex: 1}} placeholder='Example:- 1' value={this.state.unitValue} />
                        </View>
                    </View>
                    <View style={{flex: 1}}>
                        <View style={styles.inputLabel}>
                            <Text style={styles.inputLabelText}>Sale Price</Text>
                            <Text style={styles.inputLabelText}>( Per Unit )</Text>
                        </View>
                        <View style={{...styles.textInput, borderColor: this.state.requiredFields.price}}>
                            <TextInput onChangeText={(value) => {this.setSalePrice(value)}} style={{flex: 1}} placeholder='Example:- 8.5' value={this.state.salePrice} />
                        </View>
                    </View>
                    <View style={{flex: 1}}>
                        <View style={styles.inputLabel}>
                            <Text style={styles.inputLabelText}>Purchase Price</Text>
                            <Text style={styles.inputLabelText}>( Per Unit )</Text>
                        </View>
                        <View style={styles.textInput}>
                            <TextInput onChangeText={(text) => this.setPurchasePrice(text)} style={{flex: 1}} placeholder='Example:- 15' value={this.state.purchasePrice} />
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

    selecte_category_object( val ) {
        
        var index = this.state.db_categories.products.findIndex( x => x.category_name == val );
        if( index == -1 ) {
            return;
        }
        this.state.selected_category = this.state.db_categories.products[index];


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
                                <TextInput style={{flex: 1}} placeholder='Product Name' />
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

                                 <TouchableOpacity onPress={this.setModificaionAdd}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Scan Barcode</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{...styles.textInputNoMargins}}>
                                <TextInput style={{flex: 1}} placeholder='Barcode' />
                            </View>
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                <Text style={styles.inputLabelText}>Discount</Text>

                                <TouchableOpacity onPress={() => { this.setPercentageDiscount(!this.state.isPercentageDiscount); }} style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                                    <Checkbox status={this.state.isPercentageDiscount ? 'checked' : 'unchecked'} />
                                    <Text style={{fontSize: 12}}>Enable Percentage (%)</Text>                                
                                </TouchableOpacity>
                            </View>
                            <View style={styles.textInputNoMargins}>
                                <TextInput status='checked' style={{flex: 2}} placeholder='Discount Value' />
                                <TextInput status='checked' style={{flex: 1, borderLeftWidth: 1, borderLeftColor: "#ddd", paddingLeft: 10}} placeholder='%' />
                            </View> 
                        </View>

                        <View style={{...styles.field_container}}>

                            <View style={styles.inputLabel}>
                                <View><Text style={styles.inputLabelText}>Prices List</Text></View>
                                <TouchableOpacity onPress={this.setModificaionAdd}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Add New</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={{...styles.product_price_container}}>
                                <View style={{alignItems: "center", ...styles.direction_row}}> 
                                    <Text style={{...styles.product_price_text}}>Hello world</Text>
                                </View>
                                <View style={{...styles.direction_row, ...styles.gap_15, alignItems: "center"}}>
                                    <Text style={{...styles.product_price_text}}>$95.00</Text>
                                    <Text style={{...styles.product_price_text}}>$1000.00</Text>
                                </View>
                                <TouchableOpacity>
                                    <Image
                                        source={require('./../../assets/icons/trash-icon.png')}
                                        style={{height: 25, width:25}}
                                        resizeMode="cover"
                                        PlaceholderContent={<ActivityIndicator />}
                                    />
                                </TouchableOpacity>
                            </TouchableOpacity> 
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