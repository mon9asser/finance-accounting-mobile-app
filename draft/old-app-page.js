

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

const App = () => {
  alert( "Event of once internet connected, upload data" );
    return (
        <SafeAreaView style={styles.flex}>
          <NavigationContainer>

            <Stack.Navigator initialRouteName='Tester'> 
               
            </Stack.Navigator> 
          </NavigationContainer> 
            
        </SafeAreaView>
    )
    
}
 
export default App;