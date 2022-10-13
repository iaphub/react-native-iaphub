/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');
const rootPath = path.resolve(__dirname, '..');

const exclude = ['react', 'react-native', '@babel/runtime'];

const extraNodeModules = {
  'react': path.resolve(__dirname + '/node_modules/react'),
  'react-native': path.resolve(__dirname + '/node_modules/react-native'),
  'react-native-iaphub': path.resolve(__dirname + '/node_modules/react-native-iaphub'),
  '@babel/runtime': path.resolve(__dirname + '/node_modules/@babel/runtime'),
  'react-native-iaphub-ui': path.resolve(__dirname + '/..'),
};

const watchFolders = [
  path.resolve(__dirname + '/..')
];

module.exports = {
  resolver: {
    blacklistRE: exclusionList(exclude.map((name) => new RegExp(`^${escape(path.join(rootPath, 'node_modules', name))}\\/.*$`))),
    extraNodeModules: extraNodeModules
  },
  watchFolders,
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};