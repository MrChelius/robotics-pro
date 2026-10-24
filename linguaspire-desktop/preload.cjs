'use strict';
const {contextBridge}=require('electron');
contextBridge.exposeInMainWorld('linguaspireDesktop',{version:'2.9.2',platform:process.platform});