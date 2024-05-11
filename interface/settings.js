
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';  
import RNPickerSelect from 'react-native-picker-select';
 

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';   
import { I18nManager, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput } from 'react-native';
import { Button, Checkbox } from "react-native-paper";

// App Files 
import {config} from "./../settings/config.js" ;
import {styles} from "./../controllers/styles.js"; 
import {get_setting} from "./../controllers/cores/settings.js"
import {get_lang} from './../controllers/languages.js'  
import { Input } from "react-native-elements";

const CurrenciesComboBox = ({ value, onValueChange, items, style }) => (
    <RNPickerSelect 
        value={value}
        onValueChange={onValueChange}
        items={items}
        style={style}
    />
);


class AppSettingsComponents extends Component {

    constructor(props) {
        
        super(props);

        this.state = {
            language: {},
            current_language: "en",
            isConnected: false,
            default_color: "#82589F",
            languages: [
                {
                    value: "en",
                    label: "English"
                } 
            ],
            selected_language: {
                label: "English",
                value: "en"
            }
        }

        this.internetState = null;

    }

    setCurrentLanguage = (lang = "en") => {
        this.setState({
            current_language: lang
        })
    } 

    setLanguage = (val = "en" ) => {

        
        var lang = get_lang(val);
        I18nManager.forceRTL(lang.is_rtl);
        this.setState({
            language: lang
        })
    }
    
    
    // Setup Language
    setupLanguage = async() => {
        var {language}  = await get_setting(); 
        this.setCurrentLanguage(language);
        this.setLanguage(language);
    }

    // internet connection
    internetConnectionStatus = () => {
        this.internetState = NetInfo.addEventListener(state => {
            this.setState({ isConnected: state.isConnected });
        });
    }

    cardSlideFromRight = ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
    })

    screen_options = () => {
        
        this.props.navigation.setOptions({  
            headerStyle: {backgroundColor: "#82589F"},
            headerTitleStyle: { color: "#fff" },
            headerTintColor: "#fff",
            headerTitle: this.state.language.app_settings, 
            cardStyleInterpolator: ({ current, layouts }) => this.cardSlideFromRight({ current, layouts })
        })

    }
     

    componentDidMount = async () => {
        
        // setup language
        await this.setupLanguage(); 

        // Screen Option
        this.screen_options();

    } 

    setSelectedLanguage = (value) => {
        console.log(value);
    }
 

    LanguagesComboBox () { 
        
        return (
            <RNPickerSelect 
                value={"en"}
                onValueChange={(value) => this.setSelectedLanguage(value)}
                items={[
                    {
                        value: "en",
                        label: "English"
                    } 
                ]} 
                style={{...styles.selectorStyle2}}
            />
        );
    };

    render = () => {
         
        return ( 
            <View style={{...styles.flex}}>
                <ScrollView style={{padding: 20}}>
                    <View style={{borderBottomWidth: 1, borderBottomColor: "#ddd", padding: 10}}>
                        <Text style={{fontWeight: "bold", fontSize: 14}}>General Settings</Text> 
                        <View style={{marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                            <Text style={{flexGrow: 1}}>Language</Text>
                            <View style={{ flexGrow: 2, borderRadius:15, maxWidth: 230}}>
                                <this.LanguagesComboBox />
                            </View>
                        </View> 

                    </View>
                    <View style={{borderBottomWidth: 1, borderBottomColor: "#ddd", padding: 10}}>
                        <Text style={{fontWeight: "bold", fontSize: 14}}>User Settings</Text>
                    </View>
                    
                    <View style={{borderBottomWidth: 1, borderBottomColor: "#ddd", padding: 10}}>
                        <Text style={{fontWeight: "bold", fontSize: 14}}>Company Settings</Text>
                        
                        

                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Company Name:</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}}  placeholder="Company name" />
                        </View>

                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Company Logo:</Text>
                            <TouchableOpacity>
                            <Image
                                    source={require('./../assets/logo/logo.jpg')}
                                    style={{
                                        width: 130,
                                        height: 130,
                                        borderRadius: 5
                                    }}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Company City:</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}}  placeholder="City name" />
                        </View>

                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Company Address:</Text>
                            <TextInput multiline={true}   style={{ justifyContent:"flex-start", backgroundColor:'red', color:"#999", backgroundColor: '#f9f9f9', padding: 5, alignItems:"flex-start"}} numberOfLines={5} placeholder="Full address" />
                        </View>

                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Vat Number:</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}}  placeholder="Vat Number" />
                        </View>

                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Vat Percentage (%):</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}}  placeholder="Vat Number" />
                        </View>

                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Tax Percentage (%):</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}}  placeholder="Vat Number" />
                        </View>
                        
                        <View style={{marginTop: 30, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Delivery or shipping cost:</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}}  placeholder="Vat Number" />
                        </View>

                        <View style={{marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                            <Text style={{flexGrow: 1}}>Currency</Text>
                            <View style={{ flexGrow: 2, borderRadius:15, maxWidth: 230}}>
                                <CurrenciesComboBox 
                                    value={"en"}
                                    onValueChange={val => console.log(val)}
                                    items={[
                                        { value: "$", label: "US Dollar ($)" },
                                        { value: "EGP", label: "Egyptian Pound (EGP)" },
                                    ]}
                                    style={{ ...styles.selectorStyle2 }}
                                />
                            </View>
                        </View>

                        <View style={{marginTop: 10, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Invoice Document Width (print):</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}} keyboardType="numeric" placeholder="280" />
                        </View>
                        
                        <View style={{marginTop: 10, flexDirection: "column"}}>
                            <Text style={{flexGrow: 1, marginBottom: 10}}>Font Size:</Text>
                            <TextInput  style={{flex: 1, color:"#999", backgroundColor: '#f9f9f9', padding: 5}} keyboardType="numeric" placeholder="12" />
                        </View>

                    </View>
                </ScrollView>

                <View style={{marginLeft: 20,marginRight: 20, marginBottom: 20}}>
                    <TouchableOpacity onPress={this.saveData} style={{...styles.default_btnx, backgroundColor: this.state.default_color}}>
                        <Text style={{color:styles.direct.color.white, ...styles.size.medium}}> {this.state.language.save} </Text> 
                    </TouchableOpacity> 
                </View>

            </View>
        );
    }

}

export { AppSettingsComponents }