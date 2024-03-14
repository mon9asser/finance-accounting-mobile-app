import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

var Models = {

    categories: {
        key: "categories",
        instance: new Storage({
            size: 220,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    products: {
        key: "products",
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    prices: {
        key: "prices",
        instance: new Storage({
            size: 250,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },
 
};

module.exports = {Models};