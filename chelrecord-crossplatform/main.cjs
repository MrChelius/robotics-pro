'use strict';
const {app,BrowserWindow,desktopCapturer,dialog,ipcMain,session,shell,systemPreferences}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {spawn}=require('node:child_process');
let windowRef=null,selectedSourceId=null,sourceIndex=new Map(),recording=null,lastSavedFile=null;
const permitted=(e)=>Boolean(windowRef&&e.sender===windowRef.webContents);
function requireOwner(e){if(!permitted(e))throw new Error('Unauthorized renderer');}
function ffmpegExecutable(){
 let bin=require('ffmpeg-static');
 if(!bin)throw new Error('FFmpeg executable is unavailable');
 if(app.isPackaged)bin=bin.replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep);
 if(!fs.existsSync(bin))throw new Error('FFmpeg was not included in this build: '+bin);
 return bin;
}
function encodeMP4(input,output){
 return new Promise((resolve,reject)=>{
  const args=['-hide_banner','-y','-loglevel','error','-i',input,'-c:v','libx264',
   '-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k',
   '-movflags','+faststart',output];
  let err='';
  const p=spawn(ffmpegExecutable(),args,{windowsHide:true});
  p.stderr.on('data',chunk=>err=(err+chunk.toString()).slice(-4000));
  p.once('error',reject);
  p.once('close',code=>code===0?resolve():reject(new Error('FFmpeg exit '+code+': '+err)));
 });
}
function status(kind){
 if(process.platform!=='darwin')return 'managed-by-windows';
 try{return systemPreferences.getMediaAccessStatus(kind)}catch(err){return 'unavailable: '+err.message}
}
async function sources(){
 const list=await desktopCapturer.getSources({types:['screen','window'],thumbnailSize:{width:224,height:126}});
 sourceIndex=new Map(list.map(x=>[x.id,x]));
 if(!sourceIndex.has(selectedSourceId)){
  selectedSourceId=list.find(x=>x.id.startsWith('screen:'))?.id||list[0]?.id||null;
 }
 return list;
}
async function removeTemp(r){if(r)try{await fs.promises.unlink(r.temp)}catch{}}
function register(){
 ipcMain.handle('app:diagnostics',async e=>{
  requireOwner(e);
  return {platform:process.platform,camera:status('camera'),microphone:status('microphone'),
   screen:status('screen'),chosenSource:selectedSourceId,packaged:app.isPackaged};
 });
 ipcMain.handle('permissions:request',async(e,kind)=>{
  requireOwner(e);
  if(!['camera','microphone'].includes(kind))throw new Error('Invalid permission');
  if(process.platform!=='darwin')return 'managed-by-windows';
  const value=await systemPreferences.askForMediaAccess(kind);
  return value?'granted':'denied';
 });
 ipcMain.handle('permissions:settings',async(e,kind)=>{
  requireOwner(e);
  if(!['screen','camera','microphone'].includes(kind))throw new Error('Invalid permission');
  if(process.platform==='darwin'){
   const pane={screen:'Privacy_ScreenCapture',camera:'Privacy_Camera',microphone:'Privacy_Microphone'}[kind];
   await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?'+pane);
  }else{
   const pane={screen:'ms-settings:privacy-graphicscaptureprogrammatic',camera:'ms-settings:privacy-webcam',microphone:'ms-settings:privacy-microphone'}[kind];
   await shell.openExternal(pane);
  }
  return true;
 });
 ipcMain.handle('desktop:list',async e=>{
  requireOwner(e);
  const list=await sources();
  return {selectedId:selectedSourceId,items:list.map(s=>({id:s.id,name:s.name,
   thumbnail:s.thumbnail.isEmpty()?'':s.thumbnail.toDataURL()}))};
 });
 ipcMain.handle('desktop:select',async(e,id)=>{
  requireOwner(e);
  if(typeof id!=='string'||!sourceIndex.has(id))throw new Error('Select a valid screen/window from the list');
  selectedSourceId=id;return true;
 });
 ipcMain.handle('record:begin',async e=>{
  requireOwner(e);
  if(recording)throw new Error('Already recording');
  const choice=await dialog.showSaveDialog(windowRef,{
   title:'Save ChelRecord recording as MP4',
   defaultPath:path.join(app.getPath('videos'),'ChelRecord-'+new Date().toISOString().replace(/[:.]/g,'-')+'.mp4'),
   filters:[{name:'MP4 video',extensions:['mp4']}],properties:['createDirectory','showOverwriteConfirmation']});
  if(choice.canceled||!choice.filePath)return null;
  const finalPath=choice.filePath.toLowerCase().endsWith('.mp4')?choice.filePath:choice.filePath+'.mp4';
  const temp=path.join(app.getPath('temp'),'chelrecord-'+randomUUID()+'.webm');
  recording={finalPath,temp,chain:Promise.resolve(),count:0,closing:false};
  return {filePath:finalPath};
 });
 ipcMain.handle('record:chunk',async(e,data)=>{
  requireOwner(e);
  if(!recording||recording.closing)throw new Error('Not recording');
  const r=recording;
  if(!(data instanceof Uint8Array)||data.byteLength>32*1024*1024)throw new Error('Invalid recording chunk');
  const buffer=Buffer.from(data);
  if(!buffer.length)return false;
  r.chain=r.chain.then(()=>fs.promises.appendFile(r.temp,buffer));
  r.count++;
  await r.chain;
  return true;
 });
 ipcMain.handle('record:finish',async e=>{
  requireOwner(e);
  const r=recording;
  if(!r)throw new Error('Not recording');
  r.closing=true;
  try{
   await r.chain;
   if(!r.count)throw new Error('No video captured');
   await encodeMP4(r.temp,r.finalPath);
   lastSavedFile=r.finalPath;
   return {filePath:r.finalPath};
  }finally{recording=null;await removeTemp(r)}
 });
 ipcMain.handle('record:abort',async e=>{
  requireOwner(e);
  const r=recording;recording=null;
  if(r){await r.chain.catch(()=>{});await removeTemp(r)}
  return true;
 });
 ipcMain.handle('folder:show',async(e,file)=>{
  requireOwner(e);
  if(typeof file!=='string'||file!==lastSavedFile)throw new Error('Invalid output path');
  shell.showItemInFolder(file);return true;
 });
}
app.whenReady().then(()=>{
 app.setAppUserModelId('com.chelrecord.desktop');
 const ses=session.defaultSession;
 const allowedMedia=new Set(['media','display-capture']);
 ses.setPermissionRequestHandler((wc,permission,cb)=>{
  cb(Boolean(windowRef&&wc===windowRef.webContents&&allowedMedia.has(permission)));
 });
 ses.setPermissionCheckHandler((wc,permission)=>{
  return Boolean(windowRef&&wc===windowRef.webContents&&allowedMedia.has(permission));
 });
 ses.setDisplayMediaRequestHandler(async(req,cb)=>{
  try{
   if(!windowRef||!req.videoRequested||!req.frame||req.frame!==windowRef.webContents.mainFrame){cb(null);return}
   // Electron may not provide videoRequested consistently; getDisplayMedia is called after a user click.
   const list=await desktopCapturer.getSources({types:['screen','window'],thumbnailSize:{width:0,height:0}});
   const item=list.find(s=>s.id===selectedSourceId)||list.find(s=>s.id.startsWith('screen:'));
   if(!item){cb(null);return}
   cb({video:item});
  }catch(err){console.error('[display-media]',err);cb(null)}
 },{useSystemPicker:false});
 register();
 windowRef=new BrowserWindow({width:1350,height:920,minWidth:980,minHeight:720,
  title:'ChelRecord',backgroundColor:'#081020',
  webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,
   sandbox:true,webSecurity:true,backgroundThrottling:false}});
 windowRef.loadFile('index.html');
 windowRef.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 windowRef.webContents.on('will-navigate',event=>event.preventDefault());
 windowRef.on('closed',()=>{windowRef=null});
}).catch(err=>{console.error('ChelRecord startup failed:',err);app.quit()});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(!windowRef){app.relaunch();app.quit()}});
