

const conf = {
     
    /* Fake object: it should replaces with storage according to login server */
    user: {
        token: '14254125478558',
        username: 'montasser',
        useremail: 'montasser@gmail.com'
    },

    server: {
        
        port: "3000",
        api: "/api",

        keys: {
            public: "@d#R$t%YY^B&N*)C(V*&b!n@%m9214#^$^&&%NCBVdSDFFLKLK%%LSDSDOO15454",
            secret: "$!@12548#24wcdfghhjOOLLLLEREmmmcxctyyyuufgfgfb8%%!14mmmmmSDSD$%#"
        },
        // for only applications 
        database: {
            url: () => {
                var host = conf.server.database.host;
                var port = conf.server.database.port;
                var name = conf.server.database.name;
               
                return `${host}:${port}/${name}`
            },
            name: "nexycode",
            host: "mongodb://localhost",
            port: "27017",
            options: {
                useMongoClient : true
            }
        }
    },

    localdb: {
        name: "daily-sales-app",

    },

    email: { 
        settings: {
              service: 'gmail',
              auth: {
                user: 'moun2030@gmail.com',
                pass: 'xufikrbklofqvrkb'
              },
        },
        sender: "moun2030@gmail.com"
  },

}   


module.exports = { conf }