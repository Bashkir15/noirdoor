#!/usr/bin/env node

// TODO: Use port-drop when it becomes viable.
// https://github.com/hapijs/hapi/issues/3204

'use strict';

// Fail fast if a rejected promise is not caught.
require('throw-rejects')();

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

const serverOptions = Object.assign({}, cli.flags);
delete serverOptions.target;
delete serverOptions.open;

const server = new AppServer(serverOptions);

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
