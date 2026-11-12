'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('cameraFloat',Object.freeze({
 onFrame:callback=>{
  if(typeof callback!=='function')return;
  ipcRenderer.on('camera:frame',(_event,data)=>{
   if(typeof data==='string'&&data.startsWith('data:image/jpeg;base64,')&&data.length<850000)callback(data);
  });
 }
}));
