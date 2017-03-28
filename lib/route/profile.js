'use strict';

module.exports = {
    method : 'GET',
    path   : '/profile',
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
        reply.view('profile', {
            user : JSON.stringify(user, null, 4),
            // TODO: Get dynamically.
            directory:{
                path : '/profile',
                },
            isAuthenticated
        });
    }
};
