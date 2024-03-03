

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
import {RegisterComponents} from './components/user/register.js';

import {DashboardComponents} from './components/dashboard.js';

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
               
              
              <Stack.Screen name="Dashboard" component={DashboardComponents}/> 

            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
    )
    
}
 
export default App;