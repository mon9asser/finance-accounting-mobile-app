import React, {Component} from "react";
import NetInfo from "@react-native-community/netinfo";
import { Text, Image, SafeAreaView, TouchableOpacity, View, ScrollView, TextInput, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { Checkbox } from 'react-native-paper'; 


// App Files 
import {Usr} from './../objects/storage/user.js';

var usr = new Usr();


class HomeComponents extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            isConnected: true
        }
    }

    sessionIsConnected = () => {
        
        const session = usr.get_session();
        if( session !== null ) {
            this.props.navigation.navigate("Dashboard");
        } 

    }

    internetConnectionState = () => {
        this.unsubscribe = NetInfo.addEventListener(state => {
            this.handleConnectivityChange(state.isConnected);
        });
    
        // Initial check for internet connection
        NetInfo.fetch().then(state => {
            this.handleConnectivityChange(state.isConnected);
        });
      
    }

    componentDidMount() {
        this.internetConnectionState()
        this.sessionIsConnected();
    }

    componentWillUnmount() { 
        this.unsubscribe();
    }
    
    handleConnectivityChange = isConnected => {
        this.setState({ isConnected });
        // Here you can also handle connectivity changes, e.g., show an alert
    };
    

    render = () => {
        
        const {navigation} = this.props;

        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems:"center"}}>
               
                <View>
                    <Text>
                        {this.state.isConnected ? 'online' : 'Please check your internet connection to avoid losing any data.'}.
                    </Text>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{backgroundColor: 'tomato', alignItems: 'center', width: 100, marginBottom: 20, padding: 10}}>
                    <Text style={{color: '#fff'}}>
                        Login
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{backgroundColor: 'teal', alignItems: 'center', width: 100, marginBottom: 20, padding: 10}}>
                    <Text style={{color: '#fff'}}>
                        Sign up
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={{backgroundColor: 'tan', alignItems: 'center', width: 100, marginBottom: 20, padding: 10}}>
                    <Text style={{color: '#fff'}}>
                        Language
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

}

export { HomeComponents }