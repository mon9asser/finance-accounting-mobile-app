

// Default
import React from "react";

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   

import { StyleSheet, Text, Image, View, TouchableOpacity, SafeAreaView, AppState } from 'react-native';

// App Files 
import {config} from "./settings/config.js" ;
import {styles} from "./objects/styles.js"; 


// ---------------------------------
// App Screens 
// ---------------------------------
import {HomeComponents} from './components/home.js';

import {LoginComponents} from './components/user/login.js';
import {ResetPasswordComponents} from './components/user/password-reset.js';
import {RegisterComponents} from './components/user/register.js';
import { ChangePasswordComponents } from "./components/user/password-change.js";

import {DashboardComponents} from './components/dashboard.js';
import { AppSettingsComponents } from './components/settings.js';
import { AppNotificationsComponents } from './components/notifications.js';

import {AppSidebarComponents}  from './components/sidebar.js';
import { SubscriptionComponents } from './components/subscription.js';

// Functions 
const Stack = createStackNavigator(); 

const App = () => {

    return (
        <SafeAreaView style={styles.flex}>
          <NavigationContainer>

            <Stack.Navigator initialRouteName='Register'>
      
              <Stack.Screen name="Home" component={HomeComponents} options={{ headerShown: false }}  />
              <Stack.Screen name="Register" component={RegisterComponents} options={{ headerShown: false }}  />
              <Stack.Screen name="Login" component={LoginComponents} options={{ headerShown: false }}  />
              <Stack.Screen name="ResetPassword" component={ResetPasswordComponents} options={{ headerShown: false }}  />
              <Stack.Screen name="ChangePassword" component={ChangePasswordComponents} options={{ headerShown: false }}  />
              
              <Stack.Screen name="Dashboard" component={DashboardComponents} /> 
              <Stack.Screen name="AppSettings" component={AppSettingsComponents} /> 
              <Stack.Screen name="AppNotifications" component={AppNotificationsComponents} /> 
              
              <Stack.Screen name="Sidebar" component={AppSidebarComponents} /> 
               
            </Stack.Navigator> 
          </NavigationContainer> 
            
        </SafeAreaView>
    )
    
}
 
export default App;