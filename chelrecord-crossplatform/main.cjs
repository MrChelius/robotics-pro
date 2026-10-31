'use strict';
const {app,BrowserWindow,desktopCapturer,dialog,ipcMain,session,shell}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {spawn}=require('node:child_process');
let windowRef=null, selectedSourceId=null, sourceIndex=new Map(), recording=null;
function allowed(e){return Boolean(windowRef && e.sender===windowRef.webContents);}
function ffmpegExecutable(){
  let bin=require('ffmpeg-static');
  if(!bin)throw new Error('FFmpeg binary is not installed');
  if(app.isPackaged)bin=bin.replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep);
  if(!fs.existsSync(bin))throw new Error('FFmpeg binary missing: '+bin);
  return bin;
}
function encodeMP4(input,output){
 return new Promise((resolve,reject)=>{
  const args=['-hide_banner','-y','-loglevel','error','-i',input,
    '-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p',
    '-c:a','aac','-b:a','160k','-movflags','+faststart',output];
  let err='';
  const child=spawn(ffmpegExecutable(),args,{windowsHide:true});
  child.stderr.on('data',d=>{err=(err+String(d)).slice(-3500)});
  child.once('error',reject);
  child.once('close',code=>code===0?resolve():reject(new Error('FFmpeg exit '+code+': '+err)));
 });
}
async function cleanup(r){try{await fs.promises.unlink(r.temp)}catch{}}
function registerHandlers(){
 ipcMain.handle('desktop:list',async e=>{
  if(!allowed(e))throw new Error('Unauthorized');
  const ss=await desktopCapturer.getSources({types:['screen','window'],thumbnailSize:{width:225,height:125}});
  sourceIndex=new Map(ss.map(s=>[s.id,s]));
  return ss.map(s=>({id:s.id,name:s.name,thumbnail:s.thumbnail.toDataURL()}));
 });
 ipcMain.handle('desktop:select',(e,id)=>{
  if(!allowed(e)||!sourceIndex.has(id))throw new Error('Choose a capture source first');
  selectedSourceId=id;return true;
 });
 ipcMain.handle('record:begin',async e=>{
  if(!allowed(e))throw new Error('Unauthorized');
  if(recording)throw new Error('Already recording');
  const choice=await dialog.showSaveDialog(windowRef,{
   title:'Save recording as MP4',
   defaultPath:path.join(app.getPath('videos'), 'ChelRecord-'+new Date().toISOString().replace(/[:.]/g,'-')+'.mp4'),
   filters:[{name:'MP4 Video',extensions:['mp4']}],
   properties:['createDirectory','showOverwriteConfirmation']
  });
  if(choice.canceled||!choice.filePath)return null;
  const finalPath=choice.filePath.toLowerCase().endsWith('.mp4')?choice.filePath:choice.filePath+'.mp4';
  const temp=path.join(app.getPath('temp'),'chelrecord-'+randomUUID()+'.webm');
  recording={finalPath,temp,chain:Promise.resolve(),count:0,closing:false};
  return {ok:true,finalPath};
 });
 ipcMain.handle('record:chunk',async(e,data)=>{
  if(!allowed(e)||!recording||recording.closing)throw new Error('No active recording');
  const r=recording;const chunk=Buffer.from(data instanceof Uint8Array?data:new Uint8Array(data));
  if(!chunk.length)return false;
  // Keep chunk ordering deterministic, even when renderer handlers race.
  r.chain=r.chain.then(()=>fs.promises.appendFile(r.temp,chunk));
  r.count++;
  await r.chain;return true;
 });
 ipcMain.handle('record:finish',async e=>{
  if(!allowed(e)||!recording)throw new Error('No active recording');
  const r=recording;r.closing=true;
  try{
   await r.chain;
   if(!r.count)throw new Error('Recording has no video data');
   await encodeMP4(r.temp,r.finalPath);
   return {filePath:r.finalPath};
  }finally{recording=null;await cleanup(r)}
 });
 ipcMain.handle('record:abort',async e=>{
  if(!allowed(e))throw new Error('Unauthorized');
  const r=recording;recording=null;
  if(r){await r.chain.catch(()=>{});await cleanup(r)}
  return true;
 });
 ipcMain.handle('folder:show',async(e,filepath)=>{
  if(!allowed(e)||typeof filepath!=='string')throw new Error('Unauthorized');
  shell.showItemInFolder(filepath);
 });
}
app.whenReady().then(()=>{
 app.setAppUserModelId('com.chelrecord.desktop');
 const ses=session.defaultSession;
 ses.setPermissionRequestHandler((wc,permission,cb)=>{
  cb(Boolean(windowRef&&wc===windowRef.webContents&&['media','display-capture'].includes(permission)));
 });
 ses.setPermissionCheckHandler((wc,permission)=>Boolean(windowRef&&wc===windowRef.webContents&&['media','display-capture'].includes(permission)));
 ses.setDisplayMediaRequestHandler(async(req,cb)=>{
  if(!windowRef||!selectedSourceId||!req.videoRequested){cb(null);return}
  try{
   // Revalidate against current capturable items.
   const sources=await desktopCapturer.getSources({types:['screen','window'],thumbnailSize:{width:0,height:0}});
   const source=sources.find(s=>s.id===selectedSourceId);
   cb(source?{video:source}:null);
  }catch(err){console.error('[capture]',err);cb(null)}
 },{useSystemPicker:false});
 registerHandlers();
 windowRef=new BrowserWindow({width:1300,height:860,minWidth:960,minHeight:720,backgroundColor:'#081020',title:'ChelRecord',
  webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,backgroundThrottling:false}});
 windowRef.loadFile('index.html');
 windowRef.on('closed',()=>{windowRef=null});
}).catch(err=>{console.error(err);app.quit()});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(!windowRef)app.relaunch()});
