// Default
import React from "react";

// Destruct
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';   
import { createDrawerNavigator } from '@react-navigation/drawer';

import { StyleSheet, Text, Image, View, TouchableOpacity, SafeAreaView, AppState } from 'react-native';

// App Files 
import {config} from "./settings/config.js" ;
import {styles} from "./controllers/styles.js"; 

// App Screens 
import {HomeComponents} from './interface/home.js';
import {LoginComponents} from './interface/user/login.js';
import {ResetPasswordComponents} from './interface/user/password-reset.js';
import {RegisterComponents} from './interface/user/register.js';
import {ChangePasswordComponents} from "./interface/user/password-change.js";
import {DashboardComponents} from './interface/dashboard.js';
import {AppSettingsComponents} from './interface/settings.js';
import {AppNotificationsComponents} from './interface/notifications.js';
import {SubscriptionComponents} from './interface/subscription.js';
import {TestComponent} from "./interface/test.js";

// Navigator Functions 
const Stack = createStackNavigator(); 
const Drawer = createDrawerNavigator();

// Define your Drawer Navigator here, which we'll use inside the Dashboard screen
function DashboardDrawer() {
  return (
    <Drawer.Navigator initialRouteName="DashboardMain">
      <Drawer.Screen name="DashboardMain" component={DashboardComponents} options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="AppSettings" component={AppSettingsComponents} options={{ title: 'Settings' }} />
      <Drawer.Screen name="AppNotifications" component={AppNotificationsComponents} options={{ title: 'Notifications' }} />
      {/* Add any other screens you want in the Drawer here */}
    </Drawer.Navigator>
  );
}

// Define the main Stack Navigator of the app
function MainStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeComponents} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginComponents} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterComponents} options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordComponents} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordComponents} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={DashboardDrawer} options={{ headerShown: false }} />
      {/* Note: No direct Stack.Screen for AppSettings or AppNotifications as they are part of DashboardDrawer */}
      <Stack.Screen name="Subscription" component={SubscriptionComponents} />
      <Stack.Screen name="Test" component={TestComponent} />
      {/* Add any other screens not part of the Drawer here */}
    </Stack.Navigator>
  );
}

// App component
const App = () => {
  return (
    <SafeAreaView style={styles.flex}>
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;