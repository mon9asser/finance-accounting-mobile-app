import { Platform } from 'react-native';

var config = {
    
    disable_local_storage: false,  
    disable_remote_server: true,    
     
    application: {
        name: 'next_daily_sales', 
        platform: Platform.OS,
        version: Platform.Version 
    }, 

    ip: 'http://192.168.8.120', // 'http://192.168.8.125', 'http://192.168.8.120', 'http://192.168.100.7' 
    port: '5000', 
    keys: { 
        public: "@d#R$t%YY^B&N*)C(V*&b!n@%m9214#^$^&&%NCBVdSDFFLKLK%%LSDSDOO15454",
        secret: "$!@12548#24wcdfghhjOOLLLLEREmmmcxctyyyuufgfgfb8%%!14mmmmmSDSD$%#"
    },

    api: ( slug = null ) => { 

        // api.eratags.com/salespoint/

        var root = `${config.ip}`;
        
        if(config.root !== null) {
            root = `${root}:${config.port}`
        }

        if( slug !== null ) {
            root = `${root}/${slug}`
        }

        return root;
    }
};



export {config}