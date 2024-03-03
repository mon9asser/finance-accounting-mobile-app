
// Default
import React, { Component } from "react";
import axios from 'axios';  


// Distruct 
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { I18nManager, ActivityIndicator, Text, Image, View, TouchableOpacity, SafeAreaView, AppState, TextInput } from 'react-native';
import { Button } from "react-native-paper";

// App Files 
import {config,} from "./../settings/config.js" ;
import {styles} from "./../objects/styles.js"; 
import {get_setting} from "./../objects/storage.js"
import {get_lang} from './../objects/languages.js'


class RegisterComponents extends Component {
    
    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            <Text>
                Hello Register 
            </Text>
        );
    }

}

export {RegisterComponents};