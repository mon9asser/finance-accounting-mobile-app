

// Default
import React, { useState } from "react";

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
import {get_setting, localization} from "./controllers/cores/settings.js"; 

// ---------------------------------
// App Screens 
// ---------------------------------
import { AddNewBranchComponents } from "./interface/branches/add-branch.js";
import { EditCurrentBranchComponents } from "./interface/branches/edit-branch.js";
import { BranchesComponents } from "./interface/branches/all-branches.js";



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

import { usr } from "./controllers/storage/user.js";

// Functions 
const Stack = createStackNavigator(); 
const Drawer = createDrawerNavigator();


var logout_user = async (navigation) => {

    var delete_sess = await usr.delete_session();
    if( delete_sess ) {
        navigation.navigate("Login");
    }

};

var CustomDrawerContent = (props) => {
 
  var [language, setLanguage] = useState({});
  localization().then(res => setLanguage(res));

  return ( 
    <SafeAreaView style={{...styles.chart_container, ...styles.flex, alignItems:"center" }}>
        <View style={{...styles.sidebar_header}}>
            <AnimatedCircularProgress
                size={80}
                width={3}
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
                <Text style={{...styles.label}}>{language.total_storage_usage}</Text>
            </View>
        </View>
        <View style={{...styles.sidebar_list_container}}>

            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/subscripe-icon.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                    {language.supscription}
                    </Text>

                </TouchableOpacity>
            </View> 
            
            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/users.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                    {language.mywork_team}
                    </Text>

                    <Text style={{...styles.label_right}}>
                        {language.add_new_user}
                    </Text>

                </TouchableOpacity>
            </View>

            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/settings-icon.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                    {language.settings}
                    </Text>

                </TouchableOpacity>
            </View>

            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/log-history.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                        {language.team_log_history}
                    </Text>

                </TouchableOpacity>
            </View>

            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/support.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                        {language.support} 
                    </Text>

                </TouchableOpacity>
            </View>


            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/privacy.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                    {language.privacypolicy} 
                    </Text>

                </TouchableOpacity>
            </View>

            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/terms.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                    {language.terms_condition} 
                    </Text>

                </TouchableOpacity>
            </View>

            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/trash.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                        {language.delete_account} 
                    </Text>

                </TouchableOpacity>
            </View>

            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity onPress={( ) => logout_user( props.navigation )} style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

                    <Image
                        source={require('./assets/icons/logout.png')}
                        style={styles.header_icon}
                        resizeMode="cover"
                    />

                    <Text style={{...styles.bold}}>
                        {language.logout}  
                    </Text>

                </TouchableOpacity>
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
   
    var [language, setLanguage] = useState({});
    localization().then(res => setLanguage(res));
    
    
    return (
        <SafeAreaView style={styles.flex}>
          <NavigationContainer> 
            <Stack.Navigator initialRouteName='MainPage'>

             <Stack.Screen name="test" component={TestComponent}/>

              {/* Dashboard with its sidebar */}
              <Stack.Screen name="MainPage" options={{ headerShown: false }}   component={DrawerDashboardComponents}  />
              
              {/* Screen */}
              <Stack.Screen name="add-new-branch"  component={AddNewBranchComponents} initialParams={{ langs: language }} />
              <Stack.Screen name="edit-branch"  component={EditCurrentBranchComponents} initialParams={{ langs: language }} />
              
              <Stack.Screen name="Branches"  component={BranchesComponents} initialParams={{ langs: language }}/>
              <Stack.Screen name="Login" component={LoginComponents}/>
              <Stack.Screen name="Register" component={RegisterComponents} />
              
            </Stack.Navigator> 
          </NavigationContainer> 
        </SafeAreaView>
    )
    
}
 
export default App;