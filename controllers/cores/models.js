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

    customers: {
        key: "customers",
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    branches: {
        key: "branches",
        instance: new Storage({
            size: 100,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    payment_methods: {
        key: "payment-methods",
        instance: new Storage({
            size: 100,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    expenses: {
        key: "expenses",
        instance: new Storage({
            size: 300,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    }
 
};

module.exports = {Models};