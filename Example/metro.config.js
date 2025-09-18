const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const {default: exclusionList} = require('metro-config/private/defaults/exclusionList');
const escape = require('escape-string-regexp');
const rootPath = path.resolve(__dirname, '..');

const exclude = ['react', 'react-native', '@babel/runtime'];

const extraNodeModules = {
  'react': path.resolve(__dirname + '/node_modules/react'),
  'react-native': path.resolve(__dirname + '/node_modules/react-native'),
  '@babel/runtime': path.resolve(__dirname + '/node_modules/@babel/runtime'),
  'react-native-iaphub': path.resolve(__dirname + '/..'),
  'react-native-iaphub-ui': path.resolve(__dirname + '/..')
};

const watchFolders = [
  path.resolve(__dirname + '/..')
];

const config = {
  resolver: {
    blockList: exclusionList(exclude.map((name) => new RegExp(`^${escape(path.join(rootPath, 'node_modules', name))}\\/.*$`))),
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

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
