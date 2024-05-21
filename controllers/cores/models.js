import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

var Models = {

    categories: {
        key: "categories",
        doc_type: 0,
        instance: new Storage({
            size: 220,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    products: {
        key: "products",
        doc_type: 1,
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    prices: {
        key: "prices",
        doc_type: 2,
        instance: new Storage({
            size: 250,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    customers: {
        key: "customers",
        doc_type: 3,
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    

    last_recorded: {
        key: "last-recorded",
        doc_type: -1,
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    branches: {
        key: "branches",
        doc_type: 4,
        instance: new Storage({
            size: 100,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    payment_methods: {
        key: "payment-methods",
        doc_type: 5,
        instance: new Storage({
            size: 100,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    expenses: {
        key: "expenses",
        doc_type: 6,
        instance: new Storage({
            size: 300,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    balances: {
        key: "balances",
        doc_type: 7,
        instance: new Storage({
            size: 200,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },
    
    document_status: {
        key: "document-status",
        doc_type: 8,
        instance: new Storage({
            size: 70,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },


    
    sales_doc: {
        key: "sales-doc",
        doc_type: 9,
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    doc_details: {
        key: "doc-details",
        doc_type: 10,
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    options: {
        key: "options",
        doc_type: 10,
        instance: new Storage({
            size: 120,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },


    log_history: {
        key: "log-history",
        instance: new Storage({
            size: 350,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    notifications: {
        key: "notifications",
        instance: new Storage({
            size: 300,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    expired_at: { // when user go to fill form and the session expired it should store data once he logging again he can see his data in form 
        key: "expired-at",
        instance: new Storage({
            size: 50,
            storageBackend: AsyncStorage,
            defaultExpires: null
        })
    },

    
    
};

export {Models};
