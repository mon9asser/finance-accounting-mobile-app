// Default
import React, {Component} from "react";

// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { StyleSheet, Text, Image, View, TouchableOpacity, SafeAreaView, AppState } from 'react-native';

// App Files 
import {config} from "./../settings/config.js" ;
import {styles} from "./../objects/styles.js";



class DashboardComponents extends Component {

    constructor(props){
        
        super(props);

    }
    componentDidMount = () => {
        this.props.navigation.setOptions({
            headerTitle: "Title changed! -",
            headerTitleStyle: {
                color: "red" 
            },
            headerStyle: {
                backgroundColor: "tan"
            }
        }) 
    }
    render = () => {
        
         
        
        return (
            <Text>
                Dashboard
            </Text>
        )
    }

}

export {DashboardComponents}