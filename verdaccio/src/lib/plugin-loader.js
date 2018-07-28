// @flow

import Path from 'path';
import _ from 'lodash';
import logger from './logger';
import type {Config} from '@verdaccio/types';
import {MODULE_NOT_FOUND} from './constants';

/**
 * Requires a module.
 * @param {*} path the module's path
 * @return {Object}
 */
function tryLoad(path: string) {
  try {
    return require(path);
  } catch (err) {
    if (err.code === MODULE_NOT_FOUND) {
      return null;
    }
    throw err;
  }
}

function mergeConfig(appConfig, pluginConfig) {
  return _.merge(appConfig, pluginConfig);
}

function isValid(plugin) {
  return (_.isFunction(plugin) || _.isFunction(plugin.default));
}

function isES6(plugin) {
  return Object.keys(plugin).includes('default');
}

/**
 * Load a plugin following the rules
 * - First try to load from the internal directory plugins (which will disappear soon or later).
 * - A second attempt from the external plugin directory
 * - A third attempt from node_modules, in case to have multiple match as for instance verdaccio-ldap
 * and sinopia-ldap. All verdaccio prefix will have preferences.
 * @param {*} config a reference of the configuration settings
 * @param {*} pluginConfigs
 * @param {*} params a set of params to initialise the plugin
 * @param {*} sanityCheck callback that check the shape that should fulfill the plugin
 * @return {Array} list of plugins
 */
export default function loadPlugin<T>(
        config: Config,
        pluginConfigs: any = {},
        params: any,
        sanityCheck: Function): T[] {
  return Object.keys(pluginConfigs).map((pluginId: string) => {
    let plugin;

    // try local plugins first
    plugin = tryLoad(Path.resolve(__dirname + '/../plugins', pluginId));

    // try the external plugin directory
    if (plugin === null && config.plugins) {
      const pluginDir = config.plugins;
      plugin = tryLoad(Path.resolve(pluginDir, pluginId));

      // npm package
      if (plugin === null && pluginId.match(/^[^\.\/]/)) {
        plugin = tryLoad(Path.resolve(pluginDir, `verdaccio-${pluginId}`));
        // compatibility for old sinopia plugins
        if (!plugin) {
          plugin = tryLoad(Path.resolve(pluginDir, `sinopia-${pluginId}`));
        }
      }
    }

    // npm package
    if (plugin === null && pluginId.match(/^[^\.\/]/)) {
      plugin = tryLoad(`verdaccio-${pluginId}`);
      // compatibility for old sinopia plugins
      if (!plugin) {
        plugin = tryLoad(`sinopia-${pluginId}`);
      }
    }

    if (plugin === null) {
      plugin = tryLoad(pluginId);
    }

    // relative to config path
    if (plugin === null && pluginId.match(/^\.\.?($|\/)/)) {
      plugin = tryLoad(Path.resolve(Path.dirname(config.self_path), pluginId));
    }

    if (plugin === null) {
      logger.logger.error({content: pluginId}, 'plugin not found. try npm install verdaccio-@{content}');
      throw Error('"' + pluginId + '" plugin not found\ntry "npm install verdaccio-' + pluginId + '"');
    }

    if (!isValid(plugin)) {
      logger.logger.error({content: pluginId}, '@{content} doesn\'t look like a valid plugin');
      throw Error('"' + pluginId + '" doesn\'t look like a valid plugin');
    }
    /* eslint new-cap:off */
    plugin = isES6(plugin)
      ? new plugin.default(mergeConfig(config, pluginConfigs[pluginId]), params)
      : plugin(pluginConfigs[pluginId], params);
    /* eslint new-cap:off */

    if (plugin === null || !sanityCheck(plugin)) {
      logger.logger.error({content: pluginId}, '@{content} doesn\'t look like a valid plugin');
      throw Error('"' + pluginId + '" doesn\'t look like a valid plugin');
    }
    logger.logger.warn({content: pluginId}, 'Plugin successfully loaded: @{content}');
    return plugin;
  });
}
