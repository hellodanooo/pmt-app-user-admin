import React from 'react'
import { Component } from 'react';
import App from './App';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

// Make sure 'appName' matches the "name" field in your 'app.json'
AppRegistry.registerComponent(appName, () => App);

console.log(`Registering App: ${appName}`);



