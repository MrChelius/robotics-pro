'use strict';
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('linguaspireDesktop', Object.freeze({
  isDesktop: true,
  platform: process.platform,
  version: '2.8.0'
}));
