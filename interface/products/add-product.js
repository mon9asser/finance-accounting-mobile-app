
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


class AddProductComponents extends Component {
    
    constructor(props){
        
        super(props);

        this.state = {
             // Product Category  
             dyntamicCategories: [{ key: '', value: '', enabled: false }],

             // Package Prices
             packagePrices: [],
 
             isPricesPackageModalOpen: false,
             isPercentageDiscount: false,
             isModificationPrice: false,
             currentIndex: -1,
 
             isCategoryModalOpen: false,
             
             // Object of modal
             requiredFields: {
                 unit:  "#dfdfdf",
                 price:  "#dfdfdf"
             },
             unitName: '',
             shortUnitName: '',
             unitValue: '',
             salePrice: '',
             purchasePrice: '',
 
             PricePackageButtonText: "Add"
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);

    } 

    removeDyntamicCategory = (indexToRemove) => {
        this.setState(prevState => ({
            dyntamicCategories: prevState.dyntamicCategories.filter((_, index) => index !== indexToRemove)
        }));
    };

    enableAllCategories = () => {
        let {dyntamicCategories} = this.state;
        dyntamicCategories.map(x => {
            x.enabled = true 
            return x;
        });
        this.toggleCategoryModalOpen();
    }

    setDyntamicCategory = () => { 

        let {dyntamicCategories} = this.state;

        this.setState({
            dyntamicCategories: dyntamicCategories.concat([{ key: `input-${dyntamicCategories.length}`, value: '', enabled: false }])
        })
 
    }

    handleInputChange = (text, index) => {
        const newInputs = this.state.dyntamicCategories.map((input, i) => {
          if (i === index) {
            return { ...input, value: text, enabled: false };
          }
          return input;
        });
        this.setState({ dyntamicCategories: newInputs });
    };


    setModificationPrice = (val, index = -1) => {
        this.setState({
            isModificationPrice: val,
            currentIndex: index
        })
    }
    
    setRequiredFields = (val) => {
        
        this.setState({
            requiredFields: {...val}
        })

    }

    setPercentageDiscount = (val) => {
        this.setState({
            isPercentageDiscount: val
        })
    }
    
    setPackagePrices = (val) => {
        this.setState({
            packagePrices: val
        })
    }

    deleteFromPricesPackage = (itemIndex) => {

        var list = this.state.packagePrices.filter( (item, index) => ( itemIndex !== index ) );
        this.setPackagePrices(list); 
         
    }

    toggleModalOfPricesPackage = () => {
        
        this.setState({
            isPricesPackageModalOpen: !this.state.isPricesPackageModalOpen
        })
    }

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

    setButtonPricePackage = (val) => {
        this.setState({
            PricePackageButtonText: val
        })
    }

    editPackagePrice = (index) => {
        
        this.setModificationPrice(true, index);

        var price = this.state.packagePrices[index]; 
        this.setButtonPricePackage('Update');
        this.setUnitName(price.unit_name);
        this.setShortUnitName(price.short_unit_name);
        this.setUnitValue(price.unit_value.toString());
        this.setSalePrice(price.sale_price.toString());
        this.setPurchasePrice(price.purchase_price.toString());
        
        this.toggleModalOfPricesPackage();
    }

    setModificaionAdd = () => {
        
        this.setUnitName('');
        this.setShortUnitName('');
        this.setUnitValue('');
        this.setSalePrice('');
        this.setPurchasePrice('');
        this.setButtonPricePackage('Add');
        this.toggleModalOfPricesPackage();

    }
     

    
    StoreModalPricesPackage = () => {

        var sales_Price = parseFloat(this.state.salePrice);
        var purchase_Price = parseFloat(this.state.purchasePrice);
        var un_it = parseFloat(this.state.unitValue);

        // convert string, numbers, and decimals 
        this.setRequiredFields({price: "#dfdfdf"});
        if( sales_Price <= 0 || this.state.salePrice == "") { 
            this.setRequiredFields({price: "red"});
            return false;
        }  

        // Unit 
        this.setRequiredFields({unit: "#dfdfdf"});
        if( un_it <= 0 || this.state.unitValue == "") { 
            this.setRequiredFields({unit: 'red'});
            return false;
        }  

        var prcPckg = {
            unit_name: this.state.unitName,
            short_unit_name: this.state.shortUnitName,
            unit_value: un_it,
            sale_price: sales_Price,
            purchase_price: purchase_Price
        };

        if(this.state.currentIndex == -1 ) {
            this.state.packagePrices.push(prcPckg);
        } else {
            this.state.packagePrices[this.state.currentIndex] = prcPckg;
        }
        
        this.setModificationPrice(false, -1);
        this.toggleModalOfPricesPackage();

    }

    CategoriesModal = ({ isVisible, toggleModal }) => (
        <Modal isVisible={isVisible}>
            <View style={{...styles.modalContainer, flex: 1}}>
                <ScrollView style={{maxHeight: 600, flex: 1}}>

                    <View style={{flex:1, flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', marginBottom:20}}>
                        <Text style={{fontWeight: 'bold', flex:1, alignItems: 'center', fontSize: 22}}>
                            Categories
                        </Text> 

                        <TouchableOpacity onPress={this.setDyntamicCategory}>
                            <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Add New Field</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{flex: 1, marginTop: 20, marginLeft: -20, marginRight: -20}}>
                        {
                            (this.state.dyntamicCategories.length) ?
                            this.state.dyntamicCategories.map((item, index) => (
                            <View key={index} style={{...styles.textInput, marginBottom: 10}}>
                                <TextInput
                                        style={{flex: 1}} 
                                        placeholder='Category Name' 
                                        value={item.value} 
                                        onChangeText={(text) => this.handleInputChange(text, index)}
                                    />
                                <TouchableOpacity onPress={() => this.removeDyntamicCategory(index)}>
                                    <Image
                                        source={require('./../../assets/icons/trash-icon.png')}
                                        style={{height: 25, width:25, borderRadius: 25, flex: 1}}
                                        resizeMode="cover"
                                        PlaceholderContent={<ActivityIndicator />}
                                    />
                                </TouchableOpacity>

                            </View> 
                            ))
                            :
                            <View style={{flex: 1, backgroundColor: '#ffffff', borderColor: '#999', borderRadius: 10, borderWidth:1, padding: 10, marginTop: 20, marginLeft: 20, marginRight: 20}}>
                            <Text style={{color: '#999'}}>No categories were found. Please click the 'Add New Field' button to create a new category.</Text>
                            </View>
                        }
                    </View> 
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 10}}>
                        <View style={{flex: 1, flexDirection: 'row', gap: 10}}>
                        <TouchableOpacity style={{ height: 50, marginTop: 10, backgroundColor:cls.btnDeleteBg, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}} onPress={this.toggleCategoryModalOpen}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnPrimaryColor}}>Close</Text>
                            </TouchableOpacity> 
                            <TouchableOpacity style={{ height: 50, marginTop: 10, backgroundColor:cls.btnPrimaryBg, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }} onPress={this.enableAllCategories}>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnPrimaryColor}}>Add</Text>
                            </TouchableOpacity>
                        </View>
                </View> 
            </View>
        </Modal>
    )

    PricesPackagesModal = ({ isVisible, toggleModal }) => (
        <Modal isVisible={isVisible}>
            <View style={stylesx.modalContainer}>
                <ScrollView style={{maxHeight: 600}}>
                <View style={{flex:1, marginBottom:20}}>
                    <Text style={{fontWeight: 'bold', fontSize: 22}}>
                        Price Package
                    </Text>
                </View>
                <View style={{flex: 1, marginLeft: -20, marginRight: -20}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Unit Name</Text>
                        </View>
                        <View style={stylesx.textInput}>
                            <TextInput onChangeText={(value) => {this.setUnitName(value)}} style={{flex: 1}} placeholder='Example:- Gram' value={this.state.unitName} />
                        </View>
                    </View>
                    <View style={{flex: 1, marginLeft: -20, marginRight: -20}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Unit Short Name</Text>
                        </View>
                        <View style={stylesx.textInput}>
                            <TextInput onChangeText={(value) => {this.setShortUnitName(value)}} style={{flex: 1}} placeholder='Example:- gm' value={this.state.shortUnitName}  />
                        </View>
                    </View>
                    <View style={{flex: 1, marginLeft: -20, marginRight: -20}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Unit</Text>
                            <Text style={stylesx.inputLabelText}>( Based on the Unit Name )</Text>
                        </View>
                        <View style={{...styles.textInput, borderColor: this.state.requiredFields.unit}}> 
                            <TextInput onChangeText={(value) => {this.setUnitValue(value)}} style={{flex: 1}} placeholder='Example:- 1' value={this.state.unitValue} />
                        </View>
                    </View>
                    <View style={{flex: 1, marginLeft: -20, marginRight: -20}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Sale Price</Text>
                            <Text style={stylesx.inputLabelText}>( Per Unit )</Text>
                        </View>
                        <View style={{...styles.textInput, borderColor: this.state.requiredFields.price}}>
                            <TextInput onChangeText={(value) => {this.setSalePrice(value)}} style={{flex: 1}} placeholder='Example:- 8.5' value={this.state.salePrice} />
                        </View>
                    </View>
                    <View style={{flex: 1, marginLeft: -20, marginRight: -20}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Purchase Price</Text>
                            <Text style={stylesx.inputLabelText}>( Per Unit )</Text>
                        </View>
                        <View style={stylesx.textInput}>
                            <TextInput onChangeText={(text) => this.setPurchasePrice(text)} style={{flex: 1}} placeholder='Example:- 15' value={this.state.purchasePrice} />
                        </View> 
                        <View style={{flex:1, marginLeft: 20, marginRight: 20, marginBottom: 30, marginTop: -30}}>
                            <Text>Note: You don't have a purchase price? We are planning to add a calculator for raw materials in the next update.</Text>
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

    render() {
         

        return  (
            <SafeAreaView style={{flex: 1}}>
                <ScrollView style={{flex: 1}}>
                    <View>

                        <TouchableOpacity 
                            style={{flex: 1, flexDirection: "row",  justifyContent: "center", marginBottom: 50, marginTop: 50 }}
                            onPress={() => console.log( "Upload Product Image ..." )}
                            > 
                            <Image
                                source={require('./../../assets/icons/product-placeholder.png')}
                                style={{height: 200, width:200, borderRadius: 25, flex: 1}}
                                resizeMode="cover"
                                PlaceholderContent={<ActivityIndicator />} 
                            />
                        </TouchableOpacity> 

                    </View>

                    <View style={{flex: 1}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Product Name</Text>
                        </View>
                        <View style={stylesx.textInput}>
                            <TextInput style={{flex: 1}} placeholder='Product Name' />
                        </View>
                    </View>
                    
                    <View style={{flex: 1}}>
                        <View style={stylesx.inputLabel}> 
                            <View><Text style={stylesx.inputLabelText}>Category</Text></View>
                            <TouchableOpacity onPress={this.toggleCategoryModalOpen}>
                                <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Add New</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: "column", marginLeft: 20, marginRight: 20}}> 
                            <SelectList 
                                boxStyles={stylesx.boxStyle} 
                                inputStyles={{color: '#999', flex: 1}}
                                dropdownStyles={{flex: 1, width: '100%', borderColor:'#dfdfdf'}}
                                placeholder="Select Category" 
                                setSelected={(val) => setSelected(val)} 
                                data={this.state.dyntamicCategories.filter(x => x.enabled == true )} 
                                save="value"
                            />
                        </View>

                        <this.CategoriesModal isVisible={this.state.isCategoryModalOpen} toggleModal={this.toggleCategoryModalOpen} />
                    </View>

                    <View style={{flex: 1, marginTop: 40}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Barcode</Text>
                        </View>
                        <View style={stylesx.textInput}>
                            <TextInput style={{flex: 1}} placeholder='Barcode' />
                        </View>
                    </View>

                    <View style={{flex: 1}}>
                        <View style={stylesx.inputLabel}>
                            <Text style={stylesx.inputLabelText}>Discount</Text>
                        </View>
                        <View style={stylesx.textInput}>

                            <TextInput status='checked' style={{flex: 2}} placeholder='Value' />
                             
                            <TouchableOpacity onPress={() => { this.setPercentageDiscount(!this.state.isPercentageDiscount); }} style={{flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: '#e9e9e9', borderRadius: 5, paddingRight: 10}}>
                                <Checkbox status={this.state.isPercentageDiscount ? 'checked' : 'unchecked'} />
                                <Text>Perc(%)</Text>                                
                            </TouchableOpacity>
                        </View> 
                    </View>

                    <View style={{flex: 1}}>

                        <View style={stylesx.inputLabel}>
                            <View><Text style={stylesx.inputLabelText}>Prices List</Text></View>
                            <TouchableOpacity onPress={this.setModificaionAdd}>
                                <Text style={{color: "#0B4BAA", fontWeight: "bold"}}>Add New</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'column' }}>
                            <View style={{ borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: '#222', padding: 8, flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
                                <View style={{flex: 3}}><Text style={{color: '#fff', textAlign: 'center', fontSize: 12}}>Unit Name</Text></View> 
                                <View style={{flex: 2}}><Text style={{color: '#fff', textAlign: 'center', fontSize: 12}}>Unit</Text></View> 
                                <View style={{flex: 3}}><Text style={{color: '#fff', textAlign: 'center', fontSize: 12}}>Sale Price</Text></View>  
                                <View style={{flex: 2}}><Text style={{color: '#fff', textAlign: 'center', fontSize: 12}}></Text></View> 
                            </View>
                            {
                                ( this.state.packagePrices.length  ) ? 
                                this.state.packagePrices.map(( item, index) => (
                                    <View key={index} style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#dfdfdf', borderLeftWidth: 1, borderLeftColor: '#dfdfdf', borderRightWidth: 1, borderRightColor: '#dfdfdf', padding: 8, flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
                                        <View style={{flex: 3}}><Text style={{color:'#222', fontSize: 14, backgroundColor: '#fff', padding: 5, margin: 1, textAlign: 'center'}}>{item.short_unit_name}</Text></View> 
                                        <View style={{flex: 2}}><Text style={{color:'#222', fontSize: 14, backgroundColor: '#fff', padding: 5, margin: 1, textAlign: 'center'}}>{item.unit_value}</Text></View> 
                                        <View style={{flex: 3}}><Text style={{color:'#222', fontSize: 14, backgroundColor: '#fff', padding: 5, margin: 1, textAlign: 'center'}}>{item.sale_price}</Text></View>  
                                        <View style={{flex: 2, flexDirection: 'row', marginLeft: 5, gap: 5, alignItems: 'center'}}>
                                            <TouchableOpacity onPress={() => this.deleteFromPricesPackage(index) } style={stylesx.rounded}>
                                                <Image   
                                                    source={require('./../../assets/icons/trash-icon.png')}
                                                    style={{height: 20, width:20}}
                                                    resizeMode="cover" 
                                                    PlaceholderContent={<ActivityIndicator />}
                                                />
                                            </TouchableOpacity>     
                                            <TouchableOpacity  onPress={() => this.editPackagePrice(index) } style={stylesx.rounded}>
                                                <Image  
                                                    source={require('./../../assets/icons/edit.png')}
                                                    style={{height: 20, width:20}}
                                                    resizeMode="cover"
                                                    PlaceholderContent={<ActivityIndicator />}
                                                />
                                            </TouchableOpacity>    
                                        </View> 
                                    </View>
                                ))
                                :
                                <View style={{ borderWidth: 1, borderColor: '#dfdfdf', backgroundColor: '#fff', padding: 8, flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
                                    <View style={{flex: 1}}><TouchableOpacity onPress={this.setModificaionAdd}><Text style={{color: '#222', textAlign: 'center', fontSize: 12}}>No prices are found for this item. Click here to add new one</Text></TouchableOpacity></View>  
                                </View>
                            }
                        </View>
                        
                        <this.PricesPackagesModal isVisible={this.state.isPricesPackageModalOpen} toggleModal={this.toggleModalOfPricesPackage} />
                        
                    </View>

                    

                </ScrollView>
                <View style={{height: 80, marginBottom:10, marginTop:10, paddingLeft: 15, paddingRight: 15}}>
                    <View style={{flex: 1, flexDirection: "row", gap: 10}}>
                        
                        {/*
                        <TouchableOpacity style={{ height: 50, marginTop: 10, borderWidth:1, borderColor:cls.btnDeleteBorderColor, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnDeleteBorderTextColor}}>Delete</Text>
                        </TouchableOpacity>
                        */}
                        <TouchableOpacity style={{ height: 50, marginTop: 10, backgroundColor:cls.btnPrimaryBg, flex:1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color:cls.btnPrimaryColor}}>Save</Text>
                        </TouchableOpacity>
                        
                    </View>
                </View>
            </SafeAreaView>
        ); 
    }
}

var stylesx = StyleSheet.create({
    rounded: {
        backgroundColor:'#fff',
        padding: 2,
        borderRadius: 15,
        borderStyle: 'dashed',
        width: 28, 
        height: 28,
        justifyContent: 'center',
        alignItems: 'center', 
        borderColor: '#999',
        borderWidth: 1
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 5,
        flex: 1,
        maxHeight: 600,
        flexDirection: 'column'
    },
    inputLabel: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
        flex: 1,  
        flexDirection: "row",
        justifyContent: "space-between"
    },
    inputLabelText: {
        fontWeight: "bold",
        color: "#222"
    },
    textInput: {
        borderWidth: 1, 
        justifyContent: "space-between", 
        alignItems: 'center',
        marginBottom: 40, 
        padding: 10, 
        flexDirection: "row", 
        borderColor: "#dfdfdf", 
        borderRadius: 10, 
        marginLeft: 20,
        marginRight: 20
    },
    boxStyle: {
        borderWidth: 1,   
        flexDirection: "row", 
        borderColor: "#dfdfdf", 
        borderRadius: 10,  
        flex: 1,
        width: '100%',
        
    }
})


export {AddProductComponents}