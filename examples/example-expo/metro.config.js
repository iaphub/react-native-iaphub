const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const workspaceRoot = path.resolve(projectRoot, '../..');
// Watch the workspace root for changes
config.watchFolders = [workspaceRoot];

// Configure resolver to handle the linked package and its dependencies
config.resolver.extraNodeModules = {
  'react-native-iaphub': workspaceRoot,
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  '@babel/runtime': path.resolve(projectRoot, 'node_modules/@babel/runtime'),
};

// Ignore node_modules from the linked package to avoid conflicts
config.resolver.blockList = [
  new RegExp(`${workspaceRoot}/node_modules/.*`),
];

// Enable symlinks for proper linking
config.resolver.unstable_enableSymlinks = true;

// Add resolver platforms to handle the babel runtime properly
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;