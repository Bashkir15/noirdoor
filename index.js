'use strict';

const fs = require('fs');
const path = require('path');
const portType = require('port-type');
const { Server } = require('hapi');
const hi = require('hapi-hi');
const perm = require('hapi-perm');
const zebra = require('hapi-zebra');
const errorPage = require('hapi-error-page');
const doorkeeper = require('hapi-doorkeeper');
const cookie = require('hapi-auth-cookie');
const bell = require('bell');
const inert = require('inert');
const vision = require('vision');
const handlebars = require('handlebars');

/* eslint-disable global-require */
const routes = [
    require('./lib/route/static'),
    require('./lib/route/home'),
    require('./lib/route/charge'),
    require('./lib/route/profile'),
    require('./lib/route/faq')
];
/* eslint-enable global-require */

class AppServer extends Server {
    constructor(option) {
        const privileged = portType.haveRights(80);
        const config = Object.assign(
            {
                insecurePort : privileged ? 80 : 3001,
                port         : privileged ? 443 : 3000,
                tls          : {
                    /* eslint-disable no-sync */
                    key  : fs.readFileSync(path.join(__dirname, 'lib', 'key', 'localhost.key')),
                    cert : fs.readFileSync(path.join(__dirname, 'lib', 'cert', 'localhost-chain.cert'))
                    /* eslint-enable no-sync */
                }
            },
            option
        );

        super({
            connections : {
                routes : {
                    files : {
                        relativeTo : path.join(__dirname, 'lib', 'static')
                    }
                }
            }
        });

        Object.assign(this.app, config);

        super.connection({
            labels : ['web', 'tls'],
            host   : 'localhost',
            port   : config.port,
            tls    : config.tls
        });
    }

    async start() {
        await super.register([
            {
                register : hi,
                options  : {
                    cwd : __dirname
                }
            },
            {
                register : zebra,
                options  : {
                    secretKey : this.app.stripeSecretKey
                }
            },
            {
                register : perm,
                options  : {
                    db       : this.app.dbName,
                    user     : this.app.dbUser,
                    password : this.app.dbPassword,
                    host     : this.app.dbHostname,
                    port     : this.app.dbPort,
                    ssl      : this.app.dbHostname && this.app.dbHostname !== 'localhost' && {
                        // eslint-disable-next-line no-sync
                        ca : fs.readFileSync(path.join(__dirname, 'lib', 'cert', 'database.cert'))
                    }
                }
            },
            cookie,
            bell,
            {
                register : doorkeeper,
                options  : {
                    sessionSecretKey : this.app.sessionSecretKey,
                    auth0Domain      : this.app.auth0Domain,
                    auth0PublicKey   : this.app.auth0PublicKey,
                    auth0SecretKey   : this.app.auth0SecretKey
                }
            },
            inert,
            vision,
            errorPage
        ]);

        // Template rendering configuration using "vision" plugin.
        this.views({
            engines : {
                html : handlebars
            },
            relativeTo   : path.join(__dirname, 'lib', 'view'),
            // Directories for views, helpers, partials, and layouts.
            path         : '.',
            helpersPath  : 'helper',
            partialsPath : 'partial',
            layoutPath   : 'layout',
            // Name of the default layout file. Can be overriden in routes.
            layout       : 'default-layout'
        });

        super.route(routes);

        // Sadly, we cannot just return the start() promise because of:
        // https://github.com/hapijs/hapi/issues/3217
        return new Promise((resolve, reject) => {
            super.start((err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }
}

module.exports = AppServer;
