

// Default
import React from "react";

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { StyleSheet, Text, Image, View, TouchableOpacity, SafeAreaView, AppState } from 'react-native';

// App Components 
import {config} from "./components/settings/config.js" ;

// Functions 
const Stack = createStackNavigator();

const App = () => {

    return (
        <SafeAreaView style={{flex: 1}}>
          
        </SafeAreaView>
    )
    
}
 
export default App;