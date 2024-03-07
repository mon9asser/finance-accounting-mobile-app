
// Default
import React, { Component } from "react";
import NetInfo from '@react-native-community/netinfo';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { Animated, I18nManager, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput, Dimensions } from 'react-native';
import { Button, Checkbox } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";

// App Files 
import {config} from "./../settings/config.js" ;
import {styles} from "./../objects/styles.js"; 
import {get_setting} from "./../objects/storage/settings.js";
import {get_lang} from './../objects/languages.js'; 
// import {add_session, get_session, delete_session } from './../objects/storage.js'


// apis 
import {products} from "./../objects/storage/products.js";

/*products.test(function(data){
    console.log(data);
});*/

class DashboardComponents extends Component {

    constructor(props){
        
        super(props);

        this.state = {
            language: {},
            current_language: "en",
            isConnected: true,
            chartContainerWidth: 0
        }

        this.internetState = null;
        this.internetStateBox = new Animated.Value(0);

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

    internetConnectionMessageBox = ( prevProps, prevState ) => {
        // Equivalent to useEffect, checks for state changes in isConnected
        if (prevState.isConnected !== this.state.isConnected) {
            Animated.timing(this.internetStateBox, {
              toValue: this.state.isConnected ? 0 : -125, // Slide up to 0 or slide down to -100
              duration: 300, // This can be adjusted to make the animation slower or faster
              useNativeDriver: true,
            }).start();
        }
    }

    componentDidMount = async () => {
         
        // setup language
        await this.setupLanguage();

        // internet connection status
        this.internetConnectionStatus();

        // Apply screen and header options 
        this.screen_options(); 

    }
    
    componentDidUpdate(prevProps, prevState) {
        
        this.internetConnectionMessageBox(prevProps, prevState);

    }

    AnimatedBoxforInternetWarning = () => (
            <Animated.View style={[
                    {...styles.flex, ...styles.absolute, ...styles.internet_state_box},
                    { transform: [{ translateY: this.internetStateBox }], },
            ]}>
                    <View style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>
                    
                        <Image 
                            source={require('./../assets/icons/internet-state.png')}
                            style={{...styles.intenet_connection_icon}}
                            resizeMode="cover"
                        />
                        <Text style={{...styles.intenet_connection_text}}>
                            {this.state.language.internet_msg_box}
                        </Text>
                    </View>
            </Animated.View>
    )

    headerLeftComponent = () => (
        <View style={{...styles.space_15_left}}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("Sidebar")}>
                <Image
                    source={require('./../assets/icons/burger-icon.png')}
                    style={styles.header_icon}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </View>
    )

    headerRightComponent = () => (
        <View style={{...styles.space_15_right, ...styles.direction_row}}>

            <View style={{...styles.space_15_right}}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("AppNotifications")}>
                    <Image
                        source={require('./../assets/icons/notifications.png')}
                        style={styles.header_icon_md}
                        resizeMode="cover"
                    />
                    <View style={{...styles.unread_notification}}></View>
                </TouchableOpacity>
                
            </View> 

            <View>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("AppSettings")}>
                    <Image
                        source={require('./../assets/icons/settings-icon-white.png')}
                        style={styles.header_icon_md}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View> 
            
            

            
        </View>
    )

    screen_options = () => {
        
        // Screen Options 
        this.props.navigation.setOptions({

            headerBackground: () => (
                <LinearGradient
                  colors={['#F65F6E', '#9761F7']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 1, y: 0 }} // Start at the top
                  end={{ x: 0, y: 1 }} // End at the bottom
                />
            ),
            
            headerTitleStyle: { color: "#fff" },
            headerTitle: this.state.language.dashboard_title, 
            headerLeft: () => this.headerLeftComponent(), 
            headerRight: () => this.headerRightComponent()
            
        }) 

    }

    ChartComponents = () => {
        
        const data = {
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43, 50],
                screen: "xxxxxxxxxxxxxxxxxxx",
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
                  strokeWidth: 1
                }
            ]
        };

        const chartConfig = {
            backgroundGradientFrom: "#ffffff",
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "#ffffff",
            backgroundGradientToOpacity: 0.1,
            color: (opacity = 1) => `rgba(0, 0, 0, 0.25)`,  
            strokeWidth: 1, // optional, default 3
            barPercentage: 0.1, 
            fillShadowGradientTo: "#ffffff",
            fillShadowGradientFrom: "#ffffff",
            useShadowColorFromDataset: false, // optional
            propsForDots: {
              r: "3",
              strokeWidth: "0",
              stroke: "#F65F6E",
              fill: '#F65F6E'
            }
          };

        return (
        <LineChart
            data={data}
            width={this.state.chartContainerWidth - 30}
            height={220}
            chartConfig={chartConfig}
            withVerticalLines={false}
            // verticalLabelRotation={60}
            bezier
            style={{
                flex: 1, // Added flex: 1 to fill the available space
                marginVertical: 8,
                borderRadius: 0, 
                backgroundColor: 'transparent'          
            }}
          />
    )}

    setChartContainerWidth = (value) => {
        this.setState({
            chartContainerWidth: value
        })
    }

    onLayoutChartContainer = ( event ) => {
        const { width } = event.nativeEvent.layout;
        this.setChartContainerWidth(width);

    }

    /*{this.AnimatedBoxforInternetWarning()}*/
    render = () => { 

        const chart_by = ["Weekly", "Monthly", "Yearly"];


        return (
           <SafeAreaView style={{...styles.container_fluid}}>

                <ScrollView>
                    
                    <View onLayout={this.onLayoutChartContainer} style={{...styles.dashboard_banner}}>
                        
                        <View style={{ ...styles.row, ...styles.direction_row}}>
                             
                                <SelectDropdown

                                    buttonStyle={{backgroundColor: '#efefef', marginBottom: 15, width: this.state.chartContainerWidth - 20, marginLeft: 15, marginRight: 15, flex: 1, left: 0, borderRadius: 10}}
                                    buttonTextStyle = {{color: "#999"}}
                                    data={chart_by}
                                    defaultButtonText = {"Sales Period"}
                                    renderDropdownIcon={() => {
                                        return (
                                            <Image
                                                source={require('./../assets/icons/arrow-down.png')}
                                                style={{width: 25, height: 25 }}
                                                resizeMode="cover"
                                            />
                                        );
                                    }}
                                    onSelect={(selectedItem, index) => {
                                        console.log(selectedItem, index)
                                    }}
                                    buttonTextAfterSelection={(selectedItem, index) => {
                                        // text represented after item is selected
                                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                                        return selectedItem
                                    }}
                                    rowTextForSelection={(item, index) => {
                                        // text represented for each item in dropdown
                                        // if data array is an array of objects then return item.property to represent item in dropdown
                                        return item
                                    }}
                                /> 

                        </View>

                        <View style={{ ...styles.flex }}>
                            {this.ChartComponents()}
                        </View>

                    </View>

                    <View style={{...styles.flex, ...styles.space_5_left, ...styles.space_5_right}}>

                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Branch</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Product </Text>
                            </TouchableOpacity>
                        </View> 


                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Sales Invoice</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Purchase Invoice </Text>
                            </TouchableOpacity>
                        </View> 



                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Purchase Return Invoice</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Sales Return Invoice </Text>
                            </TouchableOpacity>
                        </View> 



                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Balance</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add New Customer</Text>
                            </TouchableOpacity>
                        </View> 



                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add New Supplier</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add New Expense</Text>
                            </TouchableOpacity>
                        </View> 



                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Branch</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Category </Text>
                            </TouchableOpacity>
                        </View> 



                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Branch</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Category </Text>
                            </TouchableOpacity>
                        </View> 



                        <View style={{...styles.flex, ...styles.direction_row}}>
                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Branch</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{backgroundColor: "tomato", ...styles.dashboard_cols}}>
                                <View style={{...styles.space_bottom_10}}>
                                    <Image 
                                        source={require('./../assets/icons/users.png')}
                                        style={{...styles.intenet_connection_icon}}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={{...styles.bold, ...styles.colors.white}}>Add Category </Text>
                            </TouchableOpacity>
                        </View> 

                    </View>
                     

                </ScrollView>

                {this.AnimatedBoxforInternetWarning()}  
           </SafeAreaView>
        )
    }

}

export {DashboardComponents}