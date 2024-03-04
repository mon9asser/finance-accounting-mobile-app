import { StyleSheet, I18nManager } from "react-native"; 
 

//textAlign: I18nManager.isRTL ? 'right' : 'left',
var styles = StyleSheet.create({
    direct: {
        color: {
            white: "#fff"
        }
    },

    flex: {
        flex: 1
    },

    direction_row: {
        flexDirection: 'row'
    },
    
    conten_center: {
        justifyContent: 'center'
    }, 

    item_center: {
        alignItems: 'center'
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

    container_fluid: {
        width: '100%', 
        flexDirection: 'row',
        justifyContent: 'center', 
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
        backgroundColor: '#f1f1f1',
        flex: 1
    },

    input_field: {
        textAlign: I18nManager.isRTL ? 'right' : 'left',
        verticalAlign: "middle",
        justifyContent: "center",
        alignItems: "center",
        height: '100%' 
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
        width: 20,
        height: 20 
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
    sidebar_bg: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    sidebar: {
        backgroundColor: 'green'
    }

});


export {styles};

