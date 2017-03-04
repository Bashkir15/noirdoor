'use strict';

const fs = require('fs');
const path = require('path');
const portType = require('port-type');
const { Server } = require('hapi');
const hi = require('hapi-hi');
// const perm = require('hapi-perm');
const errorPage = require('hapi-error-page');
const doorkeeper = require('hapi-doorkeeper');
const cookie = require('hapi-auth-cookie');
const bell = require('bell');
const inert = require('inert');
const vision = require('vision');
const handlebars = require('handlebars');
require('dotenv-safe').load({
    sample : path.join(__dirname, '.env.example'),
    path   : path.join(__dirname, '.env')
});

/* eslint-disable global-require */
const routes = [
    require('./lib/route/static'),
    require('./lib/route/home'),
    require('./lib/route/profile')
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
            // {
            //     register : perm,
            //     options  : {
            //         db       : 'noirdoor',
            //         user     : process.env.NOIRDOOR_DB_USER,
            //         password : process.env.NOIRDOOR_DB_PASSWORD,
            //         host     : process.env.NOIRDOOR_DB_HOSTNAME,
            //         port     : process.env.NOIRDOOR_DB_PORT
            //     }
            // },
            cookie,
            bell,
            doorkeeper,
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
