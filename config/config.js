module.exports = {
    development: {
        db: {host:'127.0.0.1', port: 6379},
        app: {
			name: 'tutor1'
        },
        port: 8000,
        media: true,
        p2p: true,
        sessionType: 0,
        expressErrorHandlerOptions: {},
        phpUrl:  "http://dev.tutor.vn:28020/api",
        nuves:  [{
				serviceId: "55096554ae6d0ecfc290a641",
				serviceKey: "31519",
				host:"http://27.118.29.245:3000/"
			}],
        baseUrl: "/vsr/",
        optimized: false,
        googleTag: "GTM-KFNXRL"
    },
    staging: {
        db: {host:'localhost', port: 6379},
        app: {
            name: 'tutor2'
        },
        port: 8000,
        media: true,
        p2p: true,
        sessionType: 0,
        expressErrorHandlerOptions: {
            dumpExceptions:true,
            showStack:true
        },
        phpUrl: "http://dev.tutor.vn:28020/api",
        nuves:  [{
            serviceId: "55096554ae6d0ecfc290a641",
            serviceKey: "31519",
            host:"http://27.118.29.245:3000/"

        }],
        baseUrl: "/vsr/",
        optimized: false,
        googleTag: "GTM-KFNXRL"
    },
    production: {
        db: {host:'127.0.0.1', port: 6379},
        app: {
			name: 'tutor'
        },
        port: 8000,
        media: true,
        p2p: true,
        sessionType: 0,
        expressErrorHandlerOptions: {},
        phpUrl:  "http://dev.tutor.vn:28020/api",
        nuves:  [{
				serviceId: "55096554ae6d0ecfc290a641",
				serviceKey: "31519",
				host:"http://27.118.29.245:3000/"
			}],
        baseUrl: "/vsr/",
        optimized: true,
        googleTag: "GTM-KFNXRL"
   }
}
