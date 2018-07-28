#!/usr/bin/env node

/* eslint no-sync:0 */
/* eslint no-empty:0 */

import path from 'path';
import {startVerdaccio, listenDefaultCallback} from './bootstrap';
import findConfigFile from './config-path';

if (process.getuid && process.getuid() === 0) {
  global.console.error('Verdaccio doesn\'t need superuser privileges. Don\'t run it under root.');
}

process.title = 'verdaccio';

try {
  // for debugging memory leaks
  // totally optional
  require('heapdump');
} catch (err) { }

const logger = require('./logger');
logger.setup(); // default setup

const commander = require('commander');
const Utils = require('./utils');
const pkginfo = require('pkginfo')(module); // eslint-disable-line no-unused-vars
const pkgVersion = module.exports.version;
const pkgName = module.exports.name;

commander
  .option('-l, --listen <[host:]port>', 'host:port number to listen on (default: localhost:4873)')
  .option('-c, --config <config.yaml>', 'use this configuration file (default: ./config.yaml)')
  .version(pkgVersion)
  .parse(process.argv);

if (commander.args.length == 1 && !commander.config) {
  // handling "verdaccio [config]" case if "-c" is missing in commandline
  commander.config = commander.args.pop();
}

if (commander.args.length !== 0) {
  commander.help();
}
let verdaccioConfiguration;
let configPathLocation;
const cliListner = commander.listen;

try {
  configPathLocation = findConfigFile(commander.config);
  verdaccioConfiguration = Utils.parseConfigFile(configPathLocation);
  process.title = verdaccioConfiguration.web && verdaccioConfiguration.web.title || 'verdaccio';

  if (!verdaccioConfiguration.self_path) {
    verdaccioConfiguration.self_path = path.resolve(configPathLocation);
  }
  if (!verdaccioConfiguration.https) {
    verdaccioConfiguration.https = {enable: false};
  }

  logger.logger.warn({file: configPathLocation}, 'config file  - @{file}');

  startVerdaccio(verdaccioConfiguration, cliListner, configPathLocation, pkgVersion, pkgName, listenDefaultCallback);
} catch (err) {
  logger.logger.fatal({file: configPathLocation, err: err}, 'cannot open config file @{file}: @{!err.message}');
  process.exit(1);
}

process.on('uncaughtException', function(err) {
  logger.logger.fatal( {
      err: err,
    },
  'uncaught exception, please report this\n@{err.stack}' );
  process.exit(255);
});
