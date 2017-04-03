'use strict';

module.exports = {
    method : 'GET',
    path   : '/user-profile',
    config : {
        auth : {
            strategy : 'session',
            mode     : 'required'
        }
    },
    handler(request, reply) {
        const { user } = request.auth.credentials;
        const { isAuthenticated } = request.auth;
        // const profile = ;
        reply.view('user-profile', {
            user : JSON.stringify(user, null, 4),
            // TODO: Get dynamically.
            directory:{
                path : '/user-profile',
                },
            isAuthenticated
        });
    }
};
