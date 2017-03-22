'use strict';

module.exports = {
    method : 'GET',
    path   : '/',
    config : {
        plugins : {
            'hapi-auth-cookie' : {
                redirectTo : false
            }
        },
        auth : {
            strategy : 'session',
            mode     : 'optional'
        }
    },
    handler(request, reply) {
        const { isAuthenticated } = request.auth;
        if (!isAuthenticated) {
            reply.view('public-home', {
                stripePublicKey : request.server.app.stripePublicKey
            });
            return;
        }

        const { user } = request.auth.credentials;

        reply.view('user-home', Object.assign({}, user, {
            isAuthenticated,
            shortName : (user.name && user.name.first) || user.displayName,
            avatarUrl : user.raw.picture
        }));
    }
};
