#!/usr/bin/env node

// TODO: Use port-drop when it becomes viable.
// https://github.com/hapijs/hapi/issues/3204

'use strict';

// Fail fast if a rejected promise is not caught.
require('throw-rejects')();

const path = require('path');
const { bold } = require('chalk');
const open = require('opn');
const rootCheck = require('root-check');
const handleQuit = require('handle-quit');
const cli = require('meow')(`
    Usage
      $ noirdoor

    Option
      --port           Listen on a specific HTTPS port for requests.
      --insecure-port  Listen on a specific HTTP port for requests.
      --page           Open a specific page in your browser.
      --open           Open the server root in your browser.

    Example
      $ noirdoor
      ${bold.cyan('Noirdoor ready')} ${bold.grey('at')} ${bold.yellow('https://localhost/')}
      $ noirdoor --port=7000
      ${bold.cyan('Noirdoor ready')} ${bold.grey('at')} ${bold.yellow('https://localhost:7000/')}
`);

const { SecurityError } = require('./lib/error');
const AppServer = require('.');

require('dotenv-safe').load({
    sample : path.join(__dirname, '.env.example'),
    path   : path.join(__dirname, '.env')
});

const { env } = process;
const serverOption = Object.assign(
    {
        sessionSecretKey : env.SESSION_SECRET_KEY,
        auth0Domain      : env.AUTH0_DOMAIN,
        auth0PublicKey   : env.AUTH0_PUBLIC_KEY,
        auth0SecretKey   : env.AUTH0_SECRET_KEY,
        stripePublicKey  : env.STRIPE_PUBLIC_KEY,
        stripeSecretKey  : env.STRIPE_SECRET_KEY,
        dbName           : env.RETHINK_DB_NAME,
        dbUser           : env.RETHINK_DB_USER,
        dbPassword       : env.RETHINK_DB_PASSWORD,
        dbHostname       : env.RETHINK_DB_HOSTNAME,
        dbPort           : env.RETHINK_DB_PORT
    },
    cli.flags
);
delete serverOption.target;
delete serverOption.open;

const server = new AppServer(serverOption);

handleQuit(() => {
    server.stop();
});

server.start().then(() => {
    // Attempt to set UID to a normal user now that we definitely
    // do not need elevated privileges.
    rootCheck(
        bold.red('I died trying to save you from yourself.\n') +
        (new SecurityError('Unable to let go of root privileges.')).stack
    );

    console.log(
        bold.cyan('Noirdoor ready'),
        bold.grey('at'),
        bold.yellow(server.info.uri)
    );

    const { page } = cli.flags;
    if (page || cli.flags.open) {
        open(server.info.uri + '/' + (page || ''));
    }
});
