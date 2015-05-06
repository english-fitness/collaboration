module.exports = {
    development: {
        db: {host:'localhost', port: 6379},
        app: {
            name: 'Daykem123'
        },
        port: 8000,
        media: true,
        p2p: true,
        sessionType: 0,
        expressErrorHandlerOptions: {
            dumpExceptions:true,
            showStack:true
        },
        phpUrl: "http://daykem11.local/api",
        nuves:  [{          
	 serviceId: "539bb13a9af7a9ebbc72abf5",
         serviceKey: "31770",
         host: "http://123.30.151.88:3000/"

        }, {
            serviceId: "53edb4a977ab06dceedcbdd4",
            serviceKey: "553",
            host: "http://123.30.42.241:3000/"
        }],
        baseUrl: "/",
        optimized: false,
        googleTag: "GTM-KN8TPZ"
    },
    staging: {
        db: {host:'localhost', port: 6379},
        app: {
            name: 'Daykem123'
        },
        port: 8000,
        media: true,
        p2p: true,
        sessionType: 0,
        expressErrorHandlerOptions: {
            dumpExceptions:true,
            showStack:true
        },
        phpUrl: "http://daykem11.com/api",
        nuves:  [{
            serviceId: "539bb13a9af7a9ebbc72abf5",
            serviceKey: "31770",
            host: "http://123.30.151.88:3000/"

        }, {
            serviceId: "53edb4a977ab06dceedcbdd4",
            serviceKey: "553",
            host: "http://123.30.42.241:3000/"
        }],
        baseUrl: "/vsr/",
        optimized: false,
        googleTag: "GTM-KN8TPZ"
    },
    production: {
        db: {host:'127.0.0.1', port: 6379},
        app: {
          name: 'Onschool'
        },
        port: 8000,
        media: true,
        p2p: false,
        sessionType: 0,
        expressErrorHandlerOptions: {},
        phpUrl: "https://tutor.vn/api",
        nuves:  [{
	   serviceId: "549b862eab56d37a88e03c8e",
           serviceKey: "23143",
           host: "http://123.30.172.36:3000/"

        }, {
            serviceId: "549b862eab56d37a88e03c8e",
            serviceKey: "23143",
            host: "http://123.30.172.36:3000/"
        }],
        baseUrl: "/vsr/",
        optimized: true,
        googleTag: "GTM-KFNXRL"
   }
}
