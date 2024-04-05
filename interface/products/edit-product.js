
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  
import Modal from "react-native-modal"; 

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
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../../controllers/cores/settings.js";
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
import { A_P_I_S } from "../../controllers/cores/apis.js";
import { Models } from "../../controllers/cores/models.js";

 


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

class EditProductComponents extends Component {

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
            isPressed: false, 

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
            PricePackageButtonText: this.props.route.params.langs.add,

            is_pressed_category_save: false, 
            
            hasPermission: null,
            scanned: false,
            
            prices_list: [],
            discountValue: '', 
            discountPercentage: '',
            product_thumbnail: require('./../../assets/icons/product-placeholder.png'),

            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",

            product_name_hlgt: "",
            price_list_hlgt: "",
            blob_image: "",
            file: null 
        };

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

    setProductThumbnail = (image) => {
        this.setState({
            product_thumbnail: image == "" ? require('./../../assets/icons/product-placeholder.png'): {uri: image}
        })
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
        

        var prices = this.props.route.params.prices;
        var product = this.props.route.params.item;

          

        this.setPricesList( prices );

        if( product.file != undefined ) {

            var url; 
            if( product.file.uri != undefined ) {
                 
                var fileInfo = await FileSystem.getInfoAsync(product.file.uri); 
                if( fileInfo.exists ) {
                    url = product.file.uri;
                } else if (product.file.thumbnail_url != undefined) {
                    url = config.api("uploads/" + product.file.thumbnail_url )
                }

            }
             

            this.setProductThumbnail(url);
        }
        
        this.setProductParamId(product.local_id);
         
        this.setProductName(product.product_name);
        this.setCategoryOjbect(product.category_id);
        this.setBarcodeDataField(product.barcode);
        this.setPercentageDiscount(product.discount.is_percentage);
        this.setDiscountPercentage(product.discount.percentage);
        this.setDiscountValue(product.discount.value);
        

    }
    setProductParamId = (id) => {
        this.setState({
            product_local_id: id
        })
    }
    setPricesList = ( val ) => {
        this.setState({
            prices_list: val
        })
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
                        placeholder={this.state.language.category_name}
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
                                {this.state.language.barcode_scanner}
                            </Text>  
                            <Text style={{color:"#666", textAlign: "center"}}>{this.state.language.ensure_to_scan_barcode}</Text> 
                        </View>

                        {this.state.validatedTextEnabled ? <Text style={{backgroundColor: "red", borderRadius: 5, color: "#fff", padding: 7, textAlign: "center"}}>{this.state.language.invalid_barcode}</Text> :"" }

                        <TouchableOpacity style={{marginTop: 10, textAlign:"center", width: "100%", justifyContent: "center", alignItems: "center"}} onPress={this.toggleBarcodeScannerOpen}><Text>{this.state.language.cancel}</Text></TouchableOpacity>
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
     

    setFileObject = async (value) => { 
        this.setState({
            file: value
        }) 
    }
    
    openGallery = async () => {
        
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert(this.state.language.photo_permission_required, this.state.language.photo_perm_open);
            return;
        } 

        /// this.toggleBrowseImagesOpen(); 
        var reqs = await ImagePicker.launchImageLibraryAsync({ 
            mediaType: 'photo',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,

        }); 

        if( reqs.canceled || reqs.assets == null ) {
            return; 
        }

        var file_url = reqs.assets[0].uri; 
        const fileInfo = await FileSystem.getInfoAsync(file_url); 
         
        if( ! fileInfo.exists ) {
            this.setProductThumbnail("");
        } else {
            this.setProductThumbnail(file_url);
            this.setFileObject( reqs.assets[0] );
        }

        
    }

     
    CategoriesModal = ({ isVisible, toggleModal }) => (
        <Modal isVisible={isVisible}>
            <View style={{...styles.modalContainer, flex: 1}}>
                <ScrollView style={{maxHeight: 600, flex: 1}}>

                    <View style={{flex:1, flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', marginBottom:5}}>
                        <Text style={{fontWeight: 'bold', flex:1, alignItems: 'center', fontSize: 22}}>
                            {this.state.language.categorie_s}
                        </Text> 

                        <TouchableOpacity onPress={this.add_new_category}>
                            <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>{this.state.language.add_new_field}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{flex: 1, marginTop: 5}}>

                        {
                            this.state.db_categories.products.length ?
                                this.state.db_categories.products.map(item => this.RenderDBCategories(item))
                            : 
                                <View style={{flex: 1, backgroundColor: '#ffffff', padding: 10, marginTop: 20}}>
                                    <Text style={{color: '#999', lineHeight:20, textAlign:"center"}}>{this.state.language.no_categories_found}</Text>
                                </View>
                        } 

                    </View> 
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 10}}>
                        <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                           

                            <TouchableOpacity style={{ height: 50, marginTop: 10, borderWidth:1, borderColor:cls.btnDeleteBorderColor, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }} onPress={this.toggleCategoryModalOpen}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnDeleteBorderTextColor}}>{this.state.language.cancel}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ height: 50, marginTop: 10, backgroundColor:cls.btnPrimaryBg, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }} onPress={this.store_categories}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnPrimaryColor}}>
                                    {
                                        this.state.is_pressed_category_save?
                                        <ActivityIndicator color={'#fff'} />: 
                                        this.state.language.save
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

        if( sales_price== "" || purchase_price== "" ) {
            Alert.alert(this.state.language.required_fields, this.state.language.sale_purch_price_required)
            return;
        }

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
                            {this.state.language.price_package}
                        </Text>
                    </View>
    
                    
                        <View style={{flex: 1}}>
                            <TouchableOpacity onPress={() => this.isDefaultPrice(!this.state.defaultPrice)} style={{flexDirection: "row", alignItems: "center", alignContent: "center", marginBottom: 20, justifyContent: "space-between"}}>
                                <View>
                                    <Text style={{fontWeight: "bold"}}>{this.state.language.mark_default_price}</Text>
                                </View> 

                                <Checkbox status={this.state.defaultPrice ? "checked": "unchecked"}/>
                                
                            </TouchableOpacity> 
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>{this.state.language.unit_name}</Text>
                            </View>
                            <View style={styles.textInput}>
                                <TextInput onChangeText={(value) => {this.setUnitName(value)}} style={{flex: 1}} placeholder={this.state.language.example_gram} value={this.state.unitName} />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>{this.state.language.unit_short_name}</Text>
                            </View>
                            <View style={styles.textInput}>
                                <TextInput onChangeText={(value) => {this.setShortUnitName(value)}} style={{flex: 1}} placeholder={this.state.language.example_gm} value={this.state.shortUnitName}  />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>{this.state.language.unit_value}</Text>
                                <Text style={styles.inputLabelText}>( {this.state.language.based_in_unit} )</Text>
                            </View>
                            <View style={{...styles.textInput, borderColor: this.state.requiredFields.unit}}> 
                            
                                <TextInput value={this.state.unitValue.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setUnitValue, text)} style={{flex: 1}} placeholder={`${this.state.language.example} :- 1`} />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>{this.state.language.sale_price}</Text>
                                <Text style={styles.inputLabelText}>( {this.state.language.per_unit} )</Text>
                            </View>
                            <View style={{...styles.textInput, borderColor: this.state.requiredFields.price}}>
                                <TextInput value={this.state.salePrice.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setSalePrice, text)} style={{flex: 1}} placeholder={`${this.state.language.example} :- 15`} />
                            </View>
                        </View>
                        <View style={{flex: 1}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>{this.state.language.purchase_price}</Text>
                                <Text style={styles.inputLabelText}>( {this.state.language.per_unit} )</Text>
                            </View>
                            <View style={styles.textInput}>
                                <TextInput keyboardType="numeric" onChangeText={(text) => this.validateInput(this.setPurchasePrice, text)} style={{flex: 1}}  value={this.state.purchasePrice.toString()}  placeholder={`${this.state.language.example} :- 8.5`}/>
                            </View> 
                            <View style={{flex:1,  marginBottom: 30, marginTop: -30}}>
                                <Text style={{...styles.product_price_text}}>{this.state.language.note_of_no_purchase_price}</Text>
                            </View>
                        </View>
                        <View style={{flex: 1, flexDirection: "row", height: 80, gap: 10}}>
                        
                            <TouchableOpacity style={{ height: 50, marginTop: 10, borderWidth:1, borderColor:cls.btnDeleteBorderColor, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }} onPress={this.toggleModalOfPricesPackage}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnDeleteBorderTextColor}}>{this.state.language.cancel}</Text>
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

    setCategoryOjbect = ( value ) => {
        this.setState({
            selected_category: value
        })
    }

    selecte_category_object( val  ) {
         
        var index = this.state.db_categories.products.findIndex( x => x.category_name == val );
        if( index == -1 ) {
            return;
        }
        this.setCategoryOjbect(this.state.db_categories.products[index]);


    }

    assignPermissionStatus = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        this.setHasPermission(status === 'granted');
    }

    checkCameraPermission = () => {
        
        if( this.state.hasPermission == false || this.state.hasPermission == null ) {
            Alert.alert(this.state.language.camera_permission_required, this.state.language.camera_perm_barcode);
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
    
    setBarcodeDataField = (val) => {
        this.setState({
            barcode_data: val
        });
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
        this.setBtnPriceEditText(this.state.language.update);  
        
        this.toggleModalOfPricesPackage();

    }

    ListOfPricesComponents = (item) => {
          
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

    setPressBtn = ( value ) => {
        this.setState({
            isPressed: value
        });
    }

    setProductHlght = (value) => {
        this.setState({
            product_name_hlgt: value
        })
    }

    setPricesHlght = (value) => {
        this.setState({
            price_list_hlgt: value
        })
    } 


    generate_base64_data = async ( uri ) => {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            return `data:image/jpeg;base64,${base64}`;
        } catch (e) {
            return false; 
        }
    }

    geneate_image_name = async() => {
         
        var user = await usr.get_session();
         
        const position = user.database_name.indexOf('_'); 
        var dbslug  = user.database_name;
        if ( position !== -1 ) 
            dbslug = user.database_name.substring(position + 1); 

             
        var uri = this.state.file.uri;
        var extension = ".jpg";
        if( uri.indexOf(".jpeg") != -1 )
            extension = ".jpg";
        else if ( uri.indexOf(".png") != -1  )
            extension = ".png";
             

        var new_name = `products-${dbslug}-${this.state.product_local_id}${extension}`;
         
        return new_name;

    }

    saveData = () => {
        try {
            if( this.state.isPressed ) {
                Alert.alert(this.state.language.please_wait, this.state.language.btn_clicked_twice);
                return;
            } 
    
            this.setPressBtn(true);
             
            (async() => {
                
                  
    
                this.setPricesHlght(false);
                this.setProductHlght(false);
                this.setNotificationBox("none") 
    
                // price list 
                var prices = this.state.prices_list; 
                  
                // product  
                var productObject = {
                    product_name: this.state.product_name, 
                    category_id: this.state.selected_category, 
                    barcode: this.state.barcode_data, 
                    discount: {
                        is_percentage: this.state.enabled_discount_percentage,
                        percentage: this.state.discountPercentage,
                        value: this.state.discountValue
                    },
                    param_id: this.state.product_local_id,
                    thumbnail: "",
                    thumbnail_url: ""
                }; 
    
                // case is there image 
                if( this.state.file != null ) {
                     
    
                    // Base 64
                    var base64 = await this.generate_base64_data( this.state.file.uri );
                   
                    if(!base64) {
                        this.setPressBtn(false); 
                        this.setNotificationBox("flex")
                        this.setNotificationCssClass(styles.error_message);
                        this.setNotificationCssTextClass(styles.error_text)
                        this.setNotificationMessage(this.state.language.failed_to_save_image);
                        return; 
                    }
    
                    // generate image name which saved on server  
                    var new_name = await this.geneate_image_name();
                      
                    // storing file object 
                    productObject.file = {
                        base_64: base64,
                        thumbnail_url: new_name, 
                        uri: this.state.file.uri,
                        property_name: "thumbnail"
                    };
    
                }
                
                // required data 
                if( ! prices.length ||  this.state.product_name == "") {
    
                    this.setPressBtn(false); 
    
                    if( ! prices.length ) {
                        this.setPricesHlght(true)
                    } 
    
                    if( this.state.product_name == "" ) {
                        this.setProductHlght(true)
                    }
    
                    this.setNotificationBox("flex")
                    this.setNotificationCssClass(styles.error_message);
                    this.setNotificationCssTextClass(styles.error_text)
                    this.setNotificationMessage(this.state.language.ensure_last_price_field);
    
                    return; 
                }
    
                // insert data 
                var priceReqs = await PriceInstance.bulk_create_update(prices); 
                var ProcReqs = await ProductInstance.create_update(productObject);
                 
                
                if(priceReqs.login_redirect || ProcReqs.login_redirect) { 
    
                    this.setPressBtn(false);    
    
                    this.setNotificationBox("flex")
                    this.setNotificationCssClass(styles.error_message);
                    this.setNotificationCssTextClass(styles.error_text)
                    this.setNotificationMessage(priceReqs.message);
    
                    
                    // store data of form in session 
                    setTimeout(async () => {
                        
                        await add_last_session_form({
                            name: "add-new-product",
                            data_object: {
                                prices: prices,
                                product: productObject
                            }
                        }); 
        
                        this.props.navigation.navigate("Login", { redirect_to: "add-new-product" });
                    
                    }, 1500);
    
                    return; 
                }
                
                if( priceReqs.is_error || ProcReqs.is_error ) {
    
                    this.setPressBtn(false);  
                    this.setNotificationBox("flex")
                    this.setNotificationCssClass(styles.error_message);
                    this.setNotificationCssTextClass(styles.error_text); 
                    this.setNotificationMessage(priceReqs.is_error ? priceReqs.message: ProcReqs.message);
                    
                    return; 
                }
    
                // delete restored data 
                await delete_session_form();
    
                this.setPressBtn(false);   
                this.setNotificationBox("flex")
                this.setNotificationCssClass(styles.success_message);
                this.setNotificationCssTextClass(styles.success_text); 
                this.setNotificationMessage(ProcReqs.message);
    
            })()
        } catch (error) {
            this.props.navigation.navigate("Login", { redirect_to: "add-new-product" });
        }
    }

    setDefaultImage = () => {
        this.setState({
            product_thumbnail: require('./../../assets/icons/product-placeholder.png')
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
                                onPress={this.openGallery}
                                > 
                                <Image
                                    source={this.state.product_thumbnail}
                                    style={{height: 200, width:"100%", borderRadius: 25, width: "100%"}}
                                    resizeMode="cover"
                                    onError={this.setDefaultImage}
                                    PlaceholderContent={<ActivityIndicator />} 
                                />
                            </TouchableOpacity>  
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>{this.state.language.product_name}</Text>
                            </View>
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:(this.state.product_name_hlgt) ? 'red': '#dfdfdf' }}>
                                <TextInput value={this.state.product_name} onChangeText={text => this.setProductName(text)} style={{flex: 1}} placeholder={this.state.language.product_name} />
                            </View>
                        </View> 
            

                        <View style={{...styles.field_container}}>
                            <View style={{...styles.inputLabel, flexDirection: "row", justifyContent:"space-between"}}> 
                                <View><Text style={styles.inputLabelText}>{this.state.language.category}</Text></View>
                                <TouchableOpacity onPress={this.toggleCategoryModalOpen}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>{this.state.language.add_new}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection: "column", marginTop: 5}}> 
                                <SelectList 
                                    boxStyles={styles.boxStyle} 
                                    inputStyles={{color: '#999',  flex: 1}}
                                    dropdownStyles={{flex: 1, width: '100%', borderColor:'#eee'}}
                                    placeholder={this.state.language.select_category}
                                    setSelected={(val) => this.selecte_category_object(val)}   
                                    defaultOption={ this.state.selected_category == null? undefined: {key: this.state.selected_category.key, value: this.state.selected_category.value}} 
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
                                <Text style={styles.inputLabelText}>{this.state.language.barcode}</Text>

                                 <TouchableOpacity onPress={this.checkCameraPermission}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>{this.state.language.scan_barcode}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{...styles.textInputNoMargins}}>
                                <TextInput value={this.state.barcode_data.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setBarcodeDataField, text)} style={{flex: 1}} placeholder={this.state.language.barcode} />
                            </View>

                            <this.BarcodeScannerModal isVisible={this.state.isBarcodeScannerOpen} toggleModal={this.toggleBarcodeScannerOpen} />
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                <Text style={styles.inputLabelText}>{this.state.language.discount}</Text>

                                <TouchableOpacity onPress={() => { this.setPercentageDiscount(!this.state.enabled_discount_percentage); }} style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                                    <Checkbox status={this.state.enabled_discount_percentage ? 'checked' : 'unchecked'} />
                                    <Text style={{fontSize: 12}}>{this.state.language.enable_percentage}</Text>                                
                                </TouchableOpacity>
                            </View>
                            <View style={styles.textInputNoMargins}>
                                <TextInput value={this.state.discountValue.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setDiscountValue, text)} style={{flex: 2}} placeholder={this.state.language.discount_value} />
                                {
                                    this.state.enabled_discount_percentage ?
                                    <TextInput status='checked' value={this.state.discountPercentage.toString()} keyboardType="numeric" onChangeText={text => this.validateInput(this.setDiscountPercentage, text)} style={{flex: 1, borderLeftWidth: 1, borderLeftColor: "#ddd", paddingLeft: 10}} placeholder='%' />
                                    : ""
                                }
                                
                            </View> 
                        </View>

                        <View style={{...styles.field_container}}>

                            <View style={styles.inputLabel}>
                                <View><Text style={styles.inputLabelText}>{this.state.language.prices_list}</Text></View>
                                <TouchableOpacity onPress={this.setModificaionAdd}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>{this.state.language.add_new}</Text>
                                </TouchableOpacity>
                            </View>

                            
                            {
                                this.state.prices_list.length ? 
                                    this.state.prices_list.map( x => this.ListOfPricesComponents(x) ) :
                                    <View style={{justifyContent: "center", flexDirection: "row", flex: 1, borderColor:(this.state.price_list_hlgt) ? 'red': '#dfdfdf', marginTop: 5, borderWidth: 1, padding: 10}}><Text style={{color: "#999"}}>{this.state.language.no_prices_found}</Text></View>
                            }
                             
                            <this.PricesPackagesModal isVisible={this.state.isPricesPackageModalOpen} toggleModal={this.toggleModalOfPricesPackage} />
                        </View>

                        <View style={{ ...styles.wrapper, ...this.state.notificationBox, ...this.state.notificationCssClass, ...styles.space_top_25}}>
                            <Text style={this.state.notificationTextCssClass}>{this.state.notificationMessage}</Text>
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
 
 
export {EditProductComponents}