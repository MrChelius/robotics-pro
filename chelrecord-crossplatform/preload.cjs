'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('chelrecord',Object.freeze({
 listSources:()=>ipcRenderer.invoke('desktop:list'),
 chooseSource:id=>ipcRenderer.invoke('desktop:select',id),
 begin:()=>ipcRenderer.invoke('record:begin'),
 write:data=>ipcRenderer.invoke('record:chunk',data),
 finish:()=>ipcRenderer.invoke('record:finish'),
 abort:()=>ipcRenderer.invoke('record:abort'),
 showFile:path=>ipcRenderer.invoke('folder:show',path)
}));
