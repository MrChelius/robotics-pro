'use strict';
const {contextBridge,ipcRenderer}=require('electron');
// No Node APIs are exposed to the untrusted rendering context.
contextBridge.exposeInMainWorld('chelrecord',Object.freeze({
 diagnostics:()=>ipcRenderer.invoke('app:diagnostics'),
 copyDiagnostics:content=>ipcRenderer.invoke('diagnostics:copy',content),
 requestPermission:kind=>ipcRenderer.invoke('permissions:request',kind),
 openSettings:kind=>ipcRenderer.invoke('permissions:settings',kind),
 selectRegion:()=>ipcRenderer.invoke('desktop:pick-region'),
 finishRegion:rect=>ipcRenderer.send('region:done',rect),
 cancelRegion:()=>ipcRenderer.send('region:cancel'),
 listSources:()=>ipcRenderer.invoke('desktop:list'),
 chooseSource:id=>ipcRenderer.invoke('desktop:select',id),
 begin:()=>ipcRenderer.invoke('record:begin'),
 write:data=>ipcRenderer.invoke('record:chunk',data),
 finish:()=>ipcRenderer.invoke('record:finish'),
 abort:()=>ipcRenderer.invoke('record:abort'),
 showFile:file=>ipcRenderer.invoke('folder:show',file)
}));
