

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

import { AddNewProductComponents } from "./interface/products/add-new-product.js";
import { EditProductComponents } from "./interface/products/edit-product.js";
import { ProductsComponents } from "./interface/products/all-products.js";

import { AddNewCustomerComponents } from "./interface/customers/add-new-customer.js";
import { EditCustomerComponents} from "./interface/customers/edit-customer.js";
import { CustomersComponents } from "./interface/customers/all-customers.js";

import {AddNewSalesInvoiceComponents} from "./interface/sales/add-new-sales.js";
import { SalesInvoicesComponents } from "./interface/sales/all-sales.js";
import { EditSalesInvoice } from "./interface/sales/edit-sales.js";

import {HomeComponents} from './interface/home.js';
import {LoginComponents} from './interface/user/login.js';
import {ResetPasswordComponents} from './interface/user/password-reset.js';
import {RegisterComponents} from './interface/user/register.js';
import { ChangePasswordComponents } from "./interface/user/password-change.js";
 
import {DashboardComponents} from './interface/dashboard.js';
import { AppSettingsComponents } from './interface/settings.js';
import { TeamComponents } from './interface/team/all-team.js'; 
import { AddNewTeamMemberComponents} from './interface/team/add-user.js'; 
import { EditNewTeamMemberComponents } from './interface/team/edit-user.js'; 
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
        {/* 
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
        */}

        <View style={{...styles.sidebar_header}}> 
            <View> 
                <Text style={{...styles.capacity_number}}>
                    Invoice Generator
                </Text>
                <Text style={{...styles.label}}>See Your Sales, Achieve Success.</Text>
            </View>
        </View>
       
        <View style={{...styles.sidebar_list_container}}>
            {/* 
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
            */}
            
            <View style={{...styles.sidebar_nav_item}}>
                <TouchableOpacity onPress={() => props.navigation.navigate("WorkTeam")} style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

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
                <TouchableOpacity onPress={() => props.navigation.navigate("Settings")} style={{...styles.direction_row, ...styles.item_center, ...styles.gap_15}}>

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
            {/*     
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

            */}
             
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
                
                {/* Branches Screens */}
                <Stack.Screen name="Branches" options={{headerTitle: language.branches}} component={BranchesComponents} initialParams={{ langs: language }}/>
                <Stack.Screen name="add-new-branch" options={{headerTitle: language.add_new_branch}}  component={AddNewBranchComponents} initialParams={{ langs: language }} />
                <Stack.Screen name="edit-branch" options={{headerTitle: language.edit_branch}}  component={EditCurrentBranchComponents} initialParams={{ langs: language }} />
                
                {/* Products Screens */}
                <Stack.Screen name="Products" options={{headerTitle: language.products}} component={ProductsComponents} initialParams={{ langs: language }}/>
                <Stack.Screen name="add-new-product" options={{headerTitle: language.add_new_product}} component={AddNewProductComponents} initialParams={{ langs: language }}/>
                <Stack.Screen name="edit-product" options={{headerTitle: language.edit_product}} component={EditProductComponents} initialParams={{ langs: language }}/>

                {/* Customers Screens */}
                <Stack.Screen name="Customers" options={{headerTitle: language.customer_s}} component={CustomersComponents} initialParams={{ langs: language }}/>
                <Stack.Screen name="add-new-customer" options={{headerTitle: language.add_new_customer}} component={AddNewCustomerComponents} initialParams={{ langs: language }}/>
                <Stack.Screen name="edit-customer" options={{headerTitle: language.edit_customer}} component={EditCustomerComponents} initialParams={{ langs: language }}/>

                {/* Sales Invoices Screens */}
                <Stack.Screen name="SalesInvoices" options={{headerTitle: language.sales_invoice}} component={SalesInvoicesComponents} initialParams={{ langs: language }}/>
                <Stack.Screen name="add-new-sales-invoice" options={{headerTitle: language.add_new_sales}} component={AddNewSalesInvoiceComponents} initialParams={{ langs: language }}/>
                <Stack.Screen name="edit-sales-invoice" options={{headerTitle: language.edit_sales}} component={EditSalesInvoice} initialParams={{ langs: language }}/>

                <Stack.Screen name="Login" component={LoginComponents}/>
                <Stack.Screen name="Register" component={RegisterComponents} />
                <Stack.Screen name="Settings" component={AppSettingsComponents} initialParams={{ langs: language }} />
                
               <Stack.Screen name="WorkTeam"  component={TeamComponents} options={{headerTitle: language.my_work_team}} initialParams={{ langs: language }} />
               <Stack.Screen name="add-new-team-member" component={AddNewTeamMemberComponents} options={{headerTitle: language.add_team_member}} initialParams={{ langs: language }} />
               <Stack.Screen name="edit-team-member" component={EditNewTeamMemberComponents} options={{headerTitle: language.edit_team_member}} initialParams={{ langs: language }} />
                
            </Stack.Navigator> 
          </NavigationContainer> 
        </SafeAreaView>
    )
    
}
 
export default App;