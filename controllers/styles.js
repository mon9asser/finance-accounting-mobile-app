import { StyleSheet, I18nManager, Dimensions } from "react-native"; 
 

//textAlign: I18nManager.isRTL ? 'right' : 'left',
var styles = StyleSheet.create({
    direct: {
        color: {
            white: "#fff"
        }
    },
    field_container: {
        marginBottom: 30
    },
    colors: {
        white: { color: "#fff" }
    },

    min_heigh_500: {
        minHeight: 500 
    },
    min_heigh_650: {
        minHeight: 650 
    },

    min_heigh_680: {
        minHeight: 700 
    },
    inputLabelText: {
        fontWeight: "bold",
        color: "#222",
        marginBottom: 10
    },
    product_price_container: {
        backgroundColor: "transparent",
        borderStyle: "dashed", 
        borderColor: "#dfdfdf",
        borderWidth: 1,
        padding:10,
        marginBottom: 5,
        flex: 1, 
        flexDirection: "row",
        justifyContent:"space-between"
    },

    product_price_text: {
        fontSize: 12,
        color:"#999"
    }, 
    boxStyle: {
        borderWidth: 1,   
        flexDirection: "row", 
        borderColor: "#dfdfdf", 
        borderRadius: 10,  
        flex: 1,
        width: '100%',
        
    },
    inputLabel: {  
        flex: 1,  
        flexDirection: "row",
        justifyContent: "space-between"
    },
    flex: {
        flex: 1
    },

    modalContainer: {
        backgroundColor: "#fff",
        padding:20,
       // borderRadius: 20 
    },

    textInput: {
        borderWidth: 1, 
        justifyContent: "space-between", 
        alignItems: 'center',
        marginBottom: 40, 
        padding: 10, 
        flexDirection: "row", 
        borderColor: "#dfdfdf", 
        borderRadius: 10,  
        marginTop: 10
    },

    textInputNoMargins: {
        borderWidth: 1, 
        justifyContent: "space-between", 
        alignItems: 'center', 
        padding: 10, 
        flexDirection: "row", 
        borderColor: "#dfdfdf", 
        borderRadius: 10
    },
    direction_row: {
        flexDirection: 'row'
    },
    direction_col: {
        flexDirection: 'column' 
    },
    
    conten_center: {
        justifyContent: 'center'
    }, 

    item_center: {
        alignItems: 'center'
    }, 
    gap_15: {
        gap: 15
    },
    gap_10: {
        gap: 10
    },
    gap_5: {
        gap: 5
    },

    text_center: {
        textAlign:'center'
    },

    text_left: {
        textAlign: "left"
    }, 
    bold: {
        fontWeight: "bold"
    }, 
    
    size: {
        small: {
            fontSize: 14
        }, 
    
        medium: {
            fontSize: 16
        },

        large: {
            fontSize: 18
        },
    },

    absolute: {
        position: "absolute"
    },
    
    dashboard_cols: {
        flex: 1, 
        margin: 10, 
        //backgroundColor: "#fff", 
        height:150, 
        borderRadius: 15, 
        padding: 10, 
        justifyContent: "center", 
        alignItems: "center"
    },

    screens: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor:'#fcfcfc' 
    },

    container: {
        justifyContent: 'center',
        paddingLeft: 25,
        paddingRight: 25,
        flex: 1,
        width: '100%'
    },

    container1: {
        justifyContent: 'center',
        paddingLeft: 25,
        paddingRight: 25, 
        width: '100%'
    },


    container_fluid: { 
        width: '100%', 
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        flex: 1, 
    },

    container_top: { 
        width: '100%', 
        flexDirection: 'row',
        justifyContent: 'flex-start', 
        alignItems: 'center',
        flex: 1, 
    },

    container_fluid_bottom: {
        justifyContent: 'flex-end', 
        alignItems: 'stretch',
        flex: 1, 
    },

    header_continaer: {
        position: "absolute", 
        top: 0, 
        left: 0, 
        right: 0,  
        height: 85, 
        paddingBottom: 15,
        paddingLeft: 20, 
        width: '100%'
    },
    
    container_scroll: {
        width:'100%', 
        marginTop: 90, 
        paddingBottom: 110,
        paddingLeft: 15,
        paddingRight: 15,
        overflow: 'hidden',
        position:'relative'
    },

    circle_text: {
        fontWeight: "bold", 
        color: "#9761F7", 
        fontSize: 15
    },

    wrapper: { 
        width: '100%'
    },

    row: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContainer: {
        paddingTop: 100,
        paddingBottom: 75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    input: { 
        backgroundColor:'#f1f1f1', 
        maxHeight: 55, 
        paddingLeft:15, 
        paddingRight:15, 
        width: '100%', 
        borderRadius: 10,  
        borderWidth: 1,   
        flex: 1
    },

    input_color_no_border: {
        backgroundColor:'#fff',  
        maxHeight: 55, 
        paddingLeft:15, 
        paddingRight:15, 
        width: '100%', 
        borderRadius: 10,  
        borderWidth: 1,   
        marginBottom: 5,
        flex: 1 
    }, 


    search_inputs: {
        backgroundColor:'#fff',  
        height: 55, 
        paddingLeft:15, 
        paddingRight:15,  
        borderRadius: 10,  
        borderWidth: 1,    
        flex: 1 , 
        flexDirection: "row",  
        width: "100%", 
    }, 
    space_left_right: {
        marginLeft: 15,
        marginRight: 15
    },
    delete_btn_outlined: {
        container: {
            borderColor:'#fe6464',
            borderWidth: 1,
            borderRadius: 8,
            flex: 1,  
           justifyContent: "center"
        },
        text: {
            color: '#fe6464',
            fontSize: 14, 
            fontWeight: 'bold'
        }
    },

    delete_btn_bg: {
        container: {
            backgroundColor:'#fe6464',
            borderRadius: 8,
            flex: 1,  
           justifyContent: "center"
        },
        text: {
            color: '#fff',
            fontSize: 16, 
            fontWeight: 'bold'
        }
    },   

    add_btn_outlined: {
        container: {
            borderColor:'#399872',
            borderWidth:1,
            borderRadius: 8,
            flex: 1,  
             justifyContent: "center",
        },
        text: {
            color: '#399872',
            fontSize: 14, 
            fontWeight: 'bold'
        }
    },

    add_btn_bg: {
        container: {
            backgroundColor:'#399872',
            borderRadius: 8,
            flex: 1,  
           justifyContent: "center",
        },
        text: {
            color: '#fff',
            fontSize: 14, 
            fontWeight: 'bold'
        }
    },    

    input_color_1: {
        backgroundColor:'#fff', 
        borderColor: "#eee",
        maxHeight: 55, 
        paddingLeft:15, 
        paddingRight:15, 
        width: '100%', 
        borderRadius: 10,  
        borderWidth: 1,   
        marginBottom: 5,
        flex: 1 
    },

    textarea: {
        backgroundColor:'#fff',
        borderWidth: 1, 
        borderColor: "#eee",
        maxHeight: 100, 
        paddingLeft:15, 
        paddingRight:15, 
        width: '100%', 
        borderRadius: 10,  
        borderWidth: 1,   
        flex: 1,
        marginBottom: 5,
        flex: 1 
    }, 

    input_field: {
        textAlign: I18nManager.isRTL ? 'right' : 'left',
        verticalAlign: "middle",
        justifyContent: "center",
        alignItems: "center",
        height: '100%' 
    },

    textarea_field: {
        textAlign: I18nManager.isRTL ? 'right' : 'left',  
        height: "100%", // Set height
        justifyContent: "flex-start", 
        paddingTop: 15,
        width: '100%', // Full width
        textAlignVertical: 'top', // Align text to top
        borderRadius: 5, // Optional: if you want rounded corners
    },

    checkbox_container: {
        flexDirection: "row", 
        alignItems: "center", 
        width: '100%'
    },

    label: {
        fontSize: 14, 
        color: "#5B5B5B", 
        lineHeight: 20
    }, 

    label_hlgt: {
        color: '#FF3952'  
    },
    
    label_right: {
        marginLeft: "auto", 
        fontSize: 12, 
        color:"tomato"
    },

    screen_headline: {
        fontWeight:'normal', 
        textAlign:"center", 
        fontSize: 30
    },

    screen_subheadline: {
        fontSize: 14, 
        color: "#5B5B5B" 
    },
    
    space_bottom_25: {
        marginBottom: 25
    },
    
    space_bottom_10: {
        marginBottom: 10
    },

    space_top_25: {
        marginTop: 25
    },

    space_top_15: {
        marginTop: 15
    },

    space_top_10: {
        marginTop: 10
    },

    space_top_5: {
        marginTop: 5
    },

    space_15_right: {
        marginRight: 15
    },

    space_15_left: {
        marginLeft: 15
    },

    space_5_left: {
        marginLeft: 5
    },
    
    space_5_right: {
        marginRight: 5
    },

    error_message: {
        borderColor: 'red',
        borderWidth: 1,
        backgroundColor: '#ffeded',
        padding: 10,
        borderRadius: 5
    },

    error_text: {
        color: 'red',
        fontSize: 12,
        textAlign:"center"
    },

    success_message: {
        borderColor: 'green',
        borderWidth: 1,
        backgroundColor: '#edfff6',
        padding: 10,
        borderRadius: 5
    },
    success_text: {
        color: 'green',
        fontSize: 12,
        textAlign:"center"
    },

    default_btn: {
        width: '100%', 
        padding: 5, 
        borderRadius: 5
    },

    primary_button: {
        width: '100%', 
        padding: 3, 
        backgroundColor:'#F65F6E'
    },

    header_icon: {
        width: 28,
        height: 28 
    },

    header_icon_md: {
        width: 25,
        height: 25 
    },

    unread_notification: {
        width: 10, 
        height: 10, 
        backgroundColor: 'teal', 
        position: 'absolute', 
        top: 2, 
        right: 0, 
        borderRadius:5
    },
    sidebar_container: {
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 10
    },
    sidebar_header: {
        marginTop: 50, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 20, 
        marginBottom: 10
    },
    chart_container: {  

    },
    sidebar_bg: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    sidebar: {
        backgroundColor: 'green'
    },
    capacity_number: {
        color: "#666", 
        fontSize: 25, 
        marginBottom: 2, 
        fontWeight: 'bold'
    },
    sidebar_list_container : {
        width: "100%", 
        marginTop: 25,
        paddingLeft: 25,
        paddingRight: 25
    },
    sidebar_nav_item:  {
        borderTopColor: "#eee", 
        borderTopWidth: 1, 
        marginTop: 10, 
        paddingTop: 10, 
        width:'100%', 
    },
    internet_state_box: {
        backgroundColor: 'tomato', 
        bottom: -100, 
        minHeight: 50, 
        zIndex: 2000, 
        width: "90%", 
        borderRadius: 10, 
        padding: 16
    },
    intenet_connection_icon: {
        width: 45,
        height: 45,
        marginBottom: 1
    },
    intenet_connection_text: {
        width: '100%',
        overflow: "hidden",
        color: "#fff",
        fontSize: 16,
        overflow: "hidden",
        flexShrink: 1
    },
    dashboard_banner: { 
        marginLeft: 15, 
        marginRight: 15, 
        width:Dimensions.get("window").width - 30, 
        paddingBottom: 10, 
        paddingTop: 30, 
        paddingLeft: 5, 
        paddingRight: 5, 
        borderRadius: 15, 
        marginTop:30, 
        marginBottom:30,

        borderWidth: 5, 
        borderColor: "#eee",  
    }

});


export {styles};

