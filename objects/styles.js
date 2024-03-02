import { StyleSheet } from "react-native"; 

var styles = StyleSheet.create({
    
    flex: {
        flex: 1
    },

    direction_row: {
        flexDirection: 'row'
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

    wrapper: { 
        width: '100%'
    },

    row: {
        flex: 1,
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
    }

});


export {styles};

