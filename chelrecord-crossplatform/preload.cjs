'use strict';
const {contextBridge,ipcRenderer}=require('electron');
// No Node APIs are exposed to the untrusted rendering context.
contextBridge.exposeInMainWorld('chelrecord',Object.freeze({
 diagnostics:()=>ipcRenderer.invoke('app:diagnostics'),
 requestPermission:kind=>ipcRenderer.invoke('permissions:request',kind),
 openSettings:kind=>ipcRenderer.invoke('permissions:settings',kind),
 listSources:()=>ipcRenderer.invoke('desktop:list'),
 chooseSource:id=>ipcRenderer.invoke('desktop:select',id),
 begin:()=>ipcRenderer.invoke('record:begin'),
 write:data=>ipcRenderer.invoke('record:chunk',data),
 finish:()=>ipcRenderer.invoke('record:finish'),
 abort:()=>ipcRenderer.invoke('record:abort'),
 showFile:file=>ipcRenderer.invoke('folder:show',file)
}));
