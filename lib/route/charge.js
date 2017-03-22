'use strict';

module.exports = {
    method : 'POST',
    path   : '/user/charge',
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
        const { stripe } = request;

        (async () => {
            const customer = await stripe.customers.create({
                description : 'Artist',
                email       : request.payload.stripeEmail
            });
            await stripe.subscriptions.create({
                plan        : 'fan-monthly',
                customer    : customer.id,
                source      : request.payload.stripeToken
            });
            reply.view('paid');
        })().catch(reply);
    }
};
