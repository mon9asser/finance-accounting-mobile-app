
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
import {config} from "../settings/config.js" ;
import {styles} from "../controllers/styles.js"; 
import {get_setting, add_last_session_form, get_last_session_form, delete_session_form} from "../controllers/cores/settings.js";
import {get_lang} from '../controllers/languages.js'; 
import { SelectList } from 'react-native-dropdown-select-list';
import { decode as atob } from 'base-64';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';


// Controller 
import { BranchInstance } from "../controllers/storage/branches.js"
import { usr } from "../controllers/storage/user.js";

import {CategoryInstance} from "../controllers/storage/categories.js";
import { generateId } from "../controllers/helpers.js";
import { PriceInstance } from "../controllers/storage/prices.js";
import { CustomerInstance } from "../controllers/storage/customers.js";
import { A_P_I_S } from "../controllers/cores/apis.js";
import { Models } from "../controllers/cores/models.js";

 

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

class AppSettingsComponents extends Component {

    constructor(props) {

        super(props);

        this.state = {

            all_languages: [
                {
                    value: "en",
                    label: "English"
                },
                {
                    value: "ar",
                    label: "Arabic"
                }
            ],
            language: {}, 
            default_color: "#82589F",  
            isPressed: false, 

            document_settings_state: false, 

            logo_image: require('./../assets/logo/logo.jpg'),
            company_name: '',
            company_city: '',
            company_address: "",
            company_vat_number: "",
            vat_percentage: 0,
            tax_percentage: 0,
            shipping_cost: 0,
            selected_currency: { value: "$", label: "US Dollar ($)" },
            selected_language:  { value: "en", label: "English" },
            selected_branch: null,
            
            application_id: "",  
            
            file: null,

            branches: [],
            all_currencies: [
                { value: "$", label: "US Dollar ($)" },
                { value: "EGP", label: "Egyptian Pound (EGP)" },
            ],
            
            notificationBox: { display: 'none' },
            notificationCssClass: {},
            notificationTextCssClass: {},
            notificationMessage: "",
 
            
        };

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

    setCompanyLogo = (image) => {
        this.setState({
            logo_image: image == "" ? require('./../assets/icons/customer-placeholder.png'): {uri: image}
        })
    }

   
    setCompanyName = ( value ) => {
        this.setState({
            company_name: value
        })
    }
     

    setCompanyCity = ( value ) => {
        this.setState({
            company_city: value
        })
    }
    
    setCompanyAddress = ( value ) => {
        this.setState({
            company_address: value
        })
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
     
    AllBranchesSelector = () => {

        var branches = this.state.branches.map( item => {
             
            return {
                label: item.branch_name,
                value: item.local_id
            };
            
        }); 
         
        var default_branch_index = branches.findIndex( x => x.value == "000000012345_default_branch" );
        var default_value = branches[default_branch_index] ? branches[default_branch_index].value: -1;
        
        return (
          <RNPickerSelect 
            value={default_value}
            onValueChange={(value) => this.setCategoryObject(value)}
            items={branches}
          />
        );
    };
    
    AllPaperSizeSelector = (objx) => {
        
        var sizes = [
            {
                label: "Roll Paper Size: 80mm",
                value: "80mm"
            },
            {
                label: "Roll Paper Size: 57mm",
                value: "57mm"
            },
            {
                label: "Roll Paper Size: 76mm",
                value: "76mm"
            },
            {
                label: "Paper Size: A4",
                value: "297mm"
            },
            {
                label: "Paper Size: Letter",
                value: "279mm"
            }
        ];

        if( objx.type != undefined && objx.type == "report" ) {
            
            sizes = [
                {
                    label: "Roll Paper Size: 80mm",
                    value: "80mm"
                }, 
                {
                    label: "Paper Size: A4",
                    value: "297mm"
                },
                {
                    label: "Paper Size: Letter",
                    value: "279mm"
                }
            ];
        }

        return (
            <RNPickerSelect 
              value={sizes[0].value}
              onValueChange={(value) => console.log(value)}
              items={sizes}
            />
          );

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
         
        if( this.props.route.params.branches ) {
            await this.fill_all_branches( this.props.route.params.branches );
        } else  {
            await this.fill_all_branches();
        }
        
        var session_ = await get_last_session_form("add-new-customer");  
        if( session_ == null ) {
            return; 
        }  
        
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
            
        }) 

    }
     
    componentDidMount = async () => {
         
         
        // setup language
        this.setup_params();  
        
        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options(); 

        // add data to fields if session already expired before 
        await this.restore_data_to_fields();  


    }

    AnimatedBoxforInternetWarning = () => (
        <View style={{...styles.direction_row, marginTop: 25, backgroundColor: "red", padding:10, borderRadius: 10, ...styles.item_center, ...styles.gap_15}}>
                
            <Image 
                source={require('./../assets/icons/internet-state.png')}
                style={{width: 30, height: 30}} 
                resizeMode="cover"
            />

            <Text style={{...styles.intenet_connection_text}}>
                {this.state.language.internet_msg_box}
            </Text>
            
            
        </View>
    ) 
     
      
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
            aspect: [4, 4],
            quality: 1,
        }); 

        if( reqs.canceled || reqs.assets == null ) {
            return; 
        }

        var file_url = reqs.assets[0].uri; 
        const fileInfo = await FileSystem.getInfoAsync(file_url); 
         
        if( ! fileInfo.exists ) {
            this.setCompanyLogo("");
        } else {
            this.setCompanyLogo(file_url);
            this.setFileObject( reqs.assets[0] );
        }

        
    }
    

    setPressBtn = ( value ) => {
        this.setState({
            isPressed: value
        });
    }

    setCustomerHlght = (value) => {
        this.setState({
            company_name_hlgt: value
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
        
        if( user == null ) {
            return;
        }

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
             

        var new_name = `customers-${dbslug}-${this.state.customer_local_id}${extension}`;
         
        return new_name;

    }

    isUndefined = (value) => {
        return value == undefined ? "": value
    }

    saveData = () => {
        
        if( this.state.isPressed ) {
            Alert.alert(this.state.language.please_wait, this.state.language.btn_clicked_twice);
            return;
        }  
        this.setPressBtn(true);  
        this.setNotificationBox("none")
        this.setCustomerHlght(false);
        

        var company_name = this.state.company_name;
        var gender = this.state.gender;
        var email = this.state.company_city;
        var company_address = this.state.company_address; 
        var customer_address = this.state.address;
        var branch_object = {
            local_id: this.isUndefined(this.state.selected_branch.local_id),
            branch_name: this.isUndefined(this.state.selected_branch.branch_name),
            branch_number: this.isUndefined(this.state.selected_branch.branch_number),
            branch_city: this.isUndefined(this.state.selected_branch.branch_city),
            branch_country: this.isUndefined(this.state.selected_branch.branch_country),
        };

        (async() => {
             

            var productObject = {
                param_id: this.state.customer_local_id,
                company_name: company_name,
                company_address: company_address,
                gender: gender, 
                company_city: email, 
                user_type: this.state.user_type,
                branch: branch_object, 
                address: customer_address, 
                thumbnail: ""
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
                productObject.thumbnail = new_name; 

            }

              

            // required data 
            if( this.state.company_name == "") {
    
                this.setPressBtn(false); 
                this.setCustomerHlght(true)

                this.setNotificationBox("flex")
                this.setNotificationCssClass(styles.error_message);
                this.setNotificationCssTextClass(styles.error_text)
                this.setNotificationMessage(this.state.language.company_name_required);

                return; 
            };

            var customerReq = await CustomerInstance.create_update(productObject);
            console.log(customerReq);

            
            if(customerReq.login_redirect) { 
    
                this.setPressBtn(false);    

                this.setNotificationBox("flex")
                this.setNotificationCssClass(styles.error_message);
                this.setNotificationCssTextClass(styles.error_text)
                this.setNotificationMessage(customerReq.message);

                
                // store data of form in session 
                setTimeout(async () => {
                    
                    await add_last_session_form({
                        name: "add-new-customer",
                        data_object: productObject
                    }); 
    
                    this.props.navigation.navigate("Login", { redirect_to: "add-new-customer" });
                
                }, 1500); 

                return; 
            }

            if( customerReq.is_error ) {
    
                this.setPressBtn(false);  
                this.setNotificationBox("flex")
                this.setNotificationCssClass(styles.error_message);
                this.setNotificationCssTextClass(styles.error_text); 
                this.setNotificationMessage(customerReq.message);
                
                return; 
            }

            // delete restored data 
            await delete_session_form(); 

            this.setPressBtn(false);   
            this.setNotificationBox("flex")
            this.setNotificationCssClass(styles.success_message);
            this.setNotificationCssTextClass(styles.success_text); 
            this.setNotificationMessage(customerReq.message);


        })(); 

    }

    setSelectedLanguage = (value) => {
        var objx = this.state.all_languages.findIndex(x => x.value == value );
        if( objx == -1 ) {
            return; 
        }  

        this.setState({
            selected_language: this.state.all_languages[objx]
        });
    }

    setNewSelectedCurrency = (val) => {
        
        var objx = this.state.all_currencies.findIndex(x => x.value == val );
        if( objx == -1 ) {
            return; 
        } 

        this.setState({
            selected_currency: this.state.all_currencies[objx]
        });
    }

    setVatPercentage = (value) => {
        this.setState({
            vat_percentage: value
        })
    }

    setShippingCost = (val) => {
        this.setState({
            shipping_cost: val
        })
    }
    seTaxPercentage = (value) => {
        this.setState({
            tax_percentage: value
        })
    }

    setCompanyVatNumber = (vatNumber) => {
         
        this.setState({
            company_vat_number: vatNumber
        });
    }

    CurrencySelector = () => {
        return (
            <RNPickerSelect
                value={this.state.selected_currency.value}
                onValueChange={val => this.setNewSelectedCurrency(val)}
                items={this.state.all_currencies}
                style={{...styles.selectorStyle2}}
            />
        );
    }

    LanguageSelector = () => {
        return (
            <RNPickerSelect
                value={this.state.selected_language.value}
                onValueChange={(value) => this.setSelectedLanguage(value)}
                items={this.state.all_languages}
                style={{...styles.selectorStyle2}}
            />
        );
    } 

    ModalDocumentSettings = ({ isVisible, toggleModal }) => {

        return (
        
            <Modal isVisible={isVisible}>
                <View style={styles.modalContainer}>
                    
                    <View style={{...styles.field_container}}>
                        <Text style={{fontWeight: "bold", marginBottom: 10}}>Sales Invoice Options</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{}}>Enable Order Type</Text>
                            <Checkbox />
                        </View> 

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{}}>Enable Payment Status</Text>
                            <Checkbox />
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{}}>Enable Payment Method</Text>
                            <Checkbox />
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{}}>Enable Tax</Text>
                            <Checkbox />
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{}}>Enable Vat</Text>
                            <Checkbox />
                        </View> 

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{}}>Enable Shipping or Delivery Cost</Text>
                            <Checkbox />
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                            <Text style={{}}>Enable Order Tracking Number</Text>
                            <Checkbox />
                        </View>

                    </View> 

                    <Button  style={{...styles.default_btn, backgroundColor: this.state.default_color }} onPress={this.toggleModalOfMoreSettings}>
                        <Text style={{color: "#fff"}}>Close</Text>
                    </Button>
                </View>
            </Modal>
 
        );
    }

    toggleModalOfMoreSettings = () => {
        this.setState({
            document_settings_state: !this.state.document_settings_state
        })
    }
    

    render() {
        return(
            <SafeAreaView style={{...styles.container_fluid, backgroundColor: styles.direct.color.white }}>
                
               
                
                 <ScrollView contentContainerStyle={{...styles.container1}}>
                    {this.state.isConnected? "" : this.AnimatedBoxforInternetWarning()} 

                    <View  style={{...styles.space_bottom_25, flex: 1, flexDirection: "column", gap: 0, marginTop: 35 }}>
                        <View style={{ height: 240, marginBottom: 30 }}>
                            <View style={{...styles.inputLabel}}>
                                <Text style={styles.inputLabelText}>Company Logo</Text>
                            </View>
                            <TouchableOpacity 
                                style={{width: "100%",  marginTop: 5, flexDirection: "row",  justifyContent: "center"}}
                                onPress={this.openGallery}
                                > 
                                <Image
                                    source={this.state.logo_image}
                                    style={{height: 200, width:200, borderRadius: 20, borderWidth: 1, borderColor: "#fff"}}
                                    resizeMode="cover"
                                    PlaceholderContent={<ActivityIndicator />} 
                                />
                            </TouchableOpacity>  
                        </View>

                        <View style={{...styles.field_container}}>
                            
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Company Name</Text>
                            </View>
                            
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:(this.state.company_name_hlgt) ? 'red': '#dfdfdf' }}>
                                <TextInput value={this.state.company_name} onChangeText={text => this.setChangedValue(text, this.setCompanyName)} style={{flex: 1}} placeholder={"Company Name"} />
                            </View>

                        </View>

                        
                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Company City</Text>
                            </View>
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf' }}>
                                <TextInput value={this.state.company_city} onChangeText={text => this.setChangedValue(text, this.setCompanyCity)} style={{flex: 1}} placeholder={'Company City'} />
                            </View>
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>{this.state.language.address}</Text>
                            </View>
                            <View style={{...styles.textarea, ...styles.space_top_15 }}>
                                <TextInput 
                                multiline={true} 
                                numberOfLines={10}  
                                value={this.state.address} 
                                onChangeText={text => this.setChangedValue(text, this.setCompanyAddress)}
                                placeholder={this.state.language.address}
                                style={{...styles.textarea_field}} />
                            </View>
                        </View>

                        <View style={{...styles.field_container}}>
                            
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Currency</Text>
                            </View>
                            
                            <this.CurrencySelector/>

                        </View>

                        <View style={{...styles.field_container}}>
                            
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Language</Text>
                            </View>
                            
                            <this.LanguageSelector/>

                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Vat Number</Text>
                            </View>
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf' }}>
                                <TextInput value={this.state.company_vat_number} onChangeText={text => this.setChangedValue(text, this.setCompanyVatNumber)} style={{flex: 1}} placeholder={'Vat Number'} />
                            </View>
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Vat Percentage (%)</Text>
                            </View>
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf' }}>
                                <TextInput value={this.state.vat_percentage} onChangeText={text => this.setChangedValue(text, this.setVatPercentage)} style={{flex: 1}} placeholder={'Vat Percentage'} keyboardType="numeric" />
                            </View>
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Tax Percentage (%)</Text>
                            </View>
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf' }}>
                                <TextInput value={this.state.tax_percentage} onChangeText={text => this.setChangedValue(text, this.seTaxPercentage)} style={{flex: 1}} placeholder={'Tax Percentage'} keyboardType="numeric" />
                            </View>
                        </View> 

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <Text style={styles.inputLabelText}>Delivery or shipping cost</Text>
                            </View>
                            <View style={{...styles.textInputNoMarginsChanged, borderColor:'#dfdfdf' }}>
                                <TextInput value={this.state.shipping_cost} onChangeText={text => this.setChangedValue(text, this.setShippingCost)} style={{flex: 1}} placeholder={'Delivery or shipping cost'} keyboardType="numeric" />
                            </View>
                        </View> 

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <View><Text style={styles.inputLabelText}>Affiliated to branch</Text></View>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate("add-new-branch")}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>{this.state.language.add_new}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{...styles.textInputNoMarginsPaddingChanged, borderColor: '#dfdfdf' }}>
                                <this.AllBranchesSelector /> 
                            </View>
                        </View>
                        
                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <View><Text style={styles.inputLabelText}>Default paper size for receipts</Text></View> 
                            </View>
                            <View style={{...styles.textInputNoMarginsPaddingChanged, borderColor: '#dfdfdf' }}>
                                <this.AllPaperSizeSelector /> 
                            </View>
                        </View>

                        <View style={{...styles.field_container}}>
                            <View style={styles.inputLabel}>
                                <View><Text style={styles.inputLabelText}>Default paper size for reports</Text></View> 
                            </View>
                            <View style={{...styles.textInputNoMarginsPaddingChanged, borderColor: '#dfdfdf' }}>
                                <this.AllPaperSizeSelector type="report" /> 
                            </View>
                        </View>

                        <this.ModalDocumentSettings isVisible={this.state.document_settings_state} toggleModal={this.toggleModalOfMoreSettings} />
                        
                        <View style={{...styles.field_containerx}}>
                            <View style={styles.inputLabel}>
                                <TouchableOpacity onPress={this.toggleModalOfMoreSettings}>
                                    <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Sales Invoice Settings</Text>
                                </TouchableOpacity>
                            </View> 
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

                    </View> 

                 </ScrollView> 
 
                 
            </SafeAreaView>
        )
    }
}
 
 
 
// alert("get async + falg not assigned in bulk insert + when search on item name and click on edit it get error");
export {AppSettingsComponents}