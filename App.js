

// Default
import React from "react";

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import {createDrawerNavigator, DrawerItemList} from '@react-navigation/drawer';
import { AnimatedCircularProgress, Circle } from 'react-native-circular-progress';
import { Dimensions, StyleSheet, Button, Text, Image, View, TouchableOpacity, SafeAreaView, AppState } from 'react-native';

// App Files 
import {config} from "./settings/config.js" ;
import {styles} from "./controllers/styles.js"; 


// ---------------------------------
// App Screens 
// ---------------------------------
import {HomeComponents} from './interface/home.js';

import {LoginComponents} from './interface/user/login.js';
import {ResetPasswordComponents} from './interface/user/password-reset.js';
import {RegisterComponents} from './interface/user/register.js';
import { ChangePasswordComponents } from "./interface/user/password-change.js";

import {DashboardComponents} from './interface/dashboard.js';
import { AppSettingsComponents } from './interface/settings.js';
import { AppNotificationsComponents } from './interface/notifications.js';

import {AppSidebarComponents}  from './interface/sidebar.js';
import { SubscriptionComponents } from './interface/subscription.js';

import { TestComponent } from "./interface/test.js";

// Functions 
const Stack = createStackNavigator(); 
const Drawer = createDrawerNavigator();


var CustomDrawerContent = (props) => {
  
  return (
    <SafeAreaView style={{...styles.chart_container, ...styles.flex, alignItems:"center" }}>
        <View style={{...styles.sidebar_header}}>
            <AnimatedCircularProgress
                size={100}
                width={5}
                fill= {22}
                tintColor="#9761F7"
                onAnimationComplete={() => console.log('onAnimationComplete')}
                backgroundColor="#eee">
                {
                    (fill) => (
                      <Text style={{...styles.circle_text}}>
                        22%
                      </Text>
                    )
                }
            </AnimatedCircularProgress>
            <View>
                
                <Text style={{...styles.capacity_number}}>
                    27GB
                </Text>
                <Text style={{...styles.label}}>{this.state.language.total_storage_usage}</Text>
            </View>
        </View>
    </SafeAreaView>
  );

}

var DrawerDashboardComponents = () => {
  return (
    <Drawer.Navigator initialRouteName="DashboardMain" drawerContent={props => <CustomDrawerContent {...props} />} >
        <Drawer.Screen name="Dashboard" component={DashboardComponents}/> 
    </Drawer.Navigator>
  );
}



const App = () => {
   
    return (
        <SafeAreaView style={styles.flex}>
          <NavigationContainer> 
            <Stack.Navigator initialRouteName='MainPage'>

              <Stack.Screen name="MainPage" options={{ headerShown: false }}   component={DrawerDashboardComponents}  />

            </Stack.Navigator> 
          </NavigationContainer> 
        </SafeAreaView>
    )
    
}
 
export default App;