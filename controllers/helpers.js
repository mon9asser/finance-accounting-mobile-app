
// import { get_setting } from "./storage/settings";
import { get_lang } from "./languages";

const random = (min, max)  => {  
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const charachters = () => {
    return (Math.random()).toString(36).substring(2); 
}

const convertToDecimal = (value ) => Math.round( value * 100 ) / 100 ;

const generateId = () => {
    
    let numberOne = random(10, 100000);
    let numberTwo = charachters();
    let numberThree = Date.now();
    let numberFour = random(500, 2850);

    var id = `${numberOne}${numberTwo}${numberThree}${numberFour}`;

    return id;
}

 
var get_response = () => {
    return {
        is_error: true, 
        message: "",
        data: []
    };
}

export { generateId, get_response, convertToDecimal };
