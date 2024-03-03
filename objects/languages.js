
import {en} from './languages/en.js'

const language = {

    define: [
        {
            name: "English",
            extention: "en"
        } 
    ],

    // => Languages
    en: { ...en } 

};


let get_lang = ( name = "en" )  => {
    return language[name];
}



export {get_lang};