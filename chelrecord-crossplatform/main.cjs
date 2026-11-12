'use strict';
const {app,BrowserWindow,desktopCapturer,dialog,ipcMain,session,shell,systemPreferences,clipboard,screen}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {randomUUID}=require('node:crypto');
const {spawn}=require('node:child_process');
let windowRef=null,selectedSourceId=null,sourceIndex=new Map(),recording=null,lastSavedFile=null,selectionOpen=false,sourceKind='screen',nativeRecording=null,pipRecording=null;
// macOS 15+ supports the native system screen picker. Do not enumerate screen thumbnails there:
// desktopCapturer.getSources may fail even when TCC permission is already granted.
const nativeScreenPicker=process.platform==='darwin' && Number.parseInt(os.release().split('.')[0],10)>=24;
const permitted=(e)=>Boolean(windowRef&&e.sender===windowRef.webContents);
function requireOwner(e){if(!permitted(e))throw new Error('Unauthorized renderer');}
function ffmpegExecutable(){
 let bin=require('ffmpeg-static');
 if(!bin)throw new Error('FFmpeg executable is unavailable');
 if(app.isPackaged)bin=bin.replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep);
 if(!fs.existsSync(bin))throw new Error('FFmpeg was not included in this build: '+bin);
 return bin;
}
const {argsForCameraPiP}=require('./native-pip.cjs');
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
async function sources(kind=sourceKind){
 const list=await desktopCapturer.getSources({types:[kind],thumbnailSize:{width:224,height:126}});
 sourceIndex=new Map(list.map(x=>[x.id,x]));
 if(!sourceIndex.has(selectedSourceId)){
  selectedSourceId=list.find(x=>x.id.startsWith('screen:'))?.id||list[0]?.id||null;
 }
 return list;
}
async function removeTemp(r){if(r)try{await fs.promises.unlink(r.temp)}catch{}}

async function chooseDesktopRegion(){
 if(selectionOpen)throw new Error('A region selection is already in progress');
 selectionOpen=true;
 const display=screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
 return new Promise((resolve,reject)=>{
  let overlay=null,settled=false;
  const validRect=rect=>{
   if(!rect||typeof rect!=='object')return false;
   return ['x','y','w','h'].every(k=>Number.isFinite(rect[k])&&rect[k]>=0&&rect[k]<=1) &&
    rect.w>0.025&&rect.h>0.025&&rect.x+rect.w<=1.001&&rect.y+rect.h<=1.001;
  };
  function finish(result){
   if(settled)return;
   settled=true;selectionOpen=false;
   ipcMain.removeListener('region:done',onDone);
   ipcMain.removeListener('region:cancel',onCancel);
   if(overlay&&!overlay.isDestroyed())overlay.close();
   if(windowRef&&!windowRef.isDestroyed())windowRef.focus();
   resolve(result);
  }
  const onDone=(event,rect)=>{
   if(!overlay||event.sender!==overlay.webContents)return;
   if(!validRect(rect)){finish(null);return}
   finish({region:rect,displayId:display.id,displayBounds:display.bounds});
  };
  const onCancel=event=>{if(overlay&&event.sender===overlay.webContents)finish(null)};
  ipcMain.on('region:done',onDone);
  ipcMain.on('region:cancel',onCancel);
  try{
   overlay=new BrowserWindow({
    x:display.bounds.x,y:display.bounds.y,
    width:display.bounds.width,height:display.bounds.height,
    frame:false,transparent:true,backgroundColor:'#00000000',
    resizable:false,movable:false,alwaysOnTop:true,focusable:true,fullscreenable:false,
    skipTaskbar:true,show:false,hasShadow:false,
    title:'Select capture region',
    webPreferences:{
     preload:path.join(__dirname,'preload.cjs'),
     contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true
    }
   });
   overlay.setAlwaysOnTop(true,'screen-saver');
   overlay.on('closed',()=>finish(null));
   overlay.loadFile('region-picker.html').then(()=>{if(!settled){overlay.show();overlay.focus()}})
   .catch(error=>{console.error('Region overlay failed:',error);finish(null)});
  }catch(error){
   console.error('Region overlay creation failed:',error);
   finish(null);
  }
 });
}


// ScreenCaptureKit is the primary whole-desktop recorder on macOS 15+.
// It does not use Chromium's experimental sharing picker.
function nativeMacBinary(){
 if(process.platform!=='darwin'||!app.isPackaged)return null;
 const file=path.join(process.resourcesPath,'native','chelrecord-sck');
 return fs.existsSync(file)?file:null;
}
function validatedNativeRect(rect){
 if(rect==null)return [];
 if(typeof rect!=='object'||!['x','y','w','h'].every(k=>Number.isFinite(rect[k])&&rect[k]>=0&&rect[k]<=1)||
    rect.w<.02||rect.h<.02||rect.x+rect.w>1.001||rect.y+rect.h>1.001)
   throw new Error('Invalid desktop capture region');
 return [rect.x,rect.y,rect.w,rect.h].map(String);
}
async function runNativeSnapshot(rect){
 const binary=nativeMacBinary();
 if(!binary)throw new Error('Native ScreenCaptureKit recorder is not available. Install the macOS build of ChelRecord Studio 2.5 or later.');
 const temp=path.join(app.getPath('temp'),'chelrecord-desktop-'+randomUUID()+'.png');
 const args=['screenshot',temp,...validatedNativeRect(rect)];
 try{
  await new Promise((resolve,reject)=>{
   let stderr='';
   const child=spawn(binary,args,{stdio:['ignore','pipe','pipe']});
   child.stderr.on('data',part=>{stderr=(stderr+part.toString()).slice(-3500)});
   child.once('error',reject);
   child.once('close',code=>code===0?resolve():reject(new Error(stderr||'Desktop preview returned status '+code)));
  });
  const buffer=await fs.promises.readFile(temp);
  if(!buffer.length)throw new Error('Native screenshot was empty');
  return {image:'data:image/png;base64,'+buffer.toString('base64')};
 }finally{await fs.promises.unlink(temp).catch(()=>{})}
}
async function startNativeRecording({region,mic}){
 const bin=nativeMacBinary();
 if(!bin)throw new Error('macOS native desktop capture is not installed');
 if(nativeRecording||recording)throw new Error('Another recording is active');
 const argsRegion=validatedNativeRect(region);
 const choice=await dialog.showSaveDialog(windowRef,{
  title:'Save desktop recording',
  defaultPath:path.join(app.getPath('videos'),'ChelRecord-Desktop-'+new Date().toISOString().replace(/[:.]/g,'-')+'.mp4'),
  filters:[{name:'MP4 video',extensions:['mp4']}],
  properties:['createDirectory','showOverwriteConfirmation']
 });
 if(choice.canceled||!choice.filePath)return null;
 const output=choice.filePath.toLowerCase().endsWith('.mp4')?choice.filePath:choice.filePath+'.mp4';
 const args=['record',output,mic?'1':'0',...argsRegion];
 let child;
 let buffer='';
 let stderr='';
 let settled=false;
 const launched=new Promise((resolve,reject)=>{
  child=spawn(bin,args,{stdio:['pipe','pipe','pipe']});
  nativeRecording={child,output,done:null};
  child.stdout.on('data',part=>{
   buffer+=part.toString();
   if(buffer.includes('READY\n')&&!settled){settled=true;resolve({filePath:output})}
   buffer=buffer.slice(-4000);
  });
  child.stderr.on('data',part=>{stderr=(stderr+part.toString()).slice(-5000)});
  child.once('error',err=>{if(!settled){settled=true;reject(err)}});
  child.once('close',code=>{
   if(!settled){settled=true;reject(new Error(stderr||'Native desktop capture stopped before it was ready: '+code))}
  });
 });
 const done=new Promise((resolve,reject)=>{
  // Created after child spawn synchronously; a single close will resolve even
  // if the application is quit during the recording.
  child.once('close',async code=>{
   const size=await fs.promises.stat(output).then(st=>st.size).catch(()=>0);
   if(code===0&&size>1024)resolve({filePath:output});
   else reject(new Error(stderr||'ScreenCaptureKit exited without a valid MP4 file (exit '+code+')'));
  });
  child.once('error',reject);
 });
 nativeRecording.done=done;
 try{return await launched}
 catch(err){
  if(nativeRecording?.child===child){nativeRecording=null;child.kill()}
  throw err;
 }
}
async function endNativeRecording(discard){
 const current=nativeRecording;
 if(!current)throw new Error('No native screen capture in progress');
 nativeRecording=null;
 if(discard){
  current.child.kill('SIGTERM');
  try{await current.done}catch{}
  await fs.promises.unlink(current.output).catch(()=>{});
  return {discarded:true};
 }
 current.child.stdin.write('stop\n');
 current.child.stdin.end();
 const saved=await current.done;
 lastSavedFile=saved.filePath;
 return saved;
}


function beginCameraPiP(){
 if(!nativeRecording||pipRecording)throw new Error('Screen recording must be running before the camera overlay starts');
 const temp=path.join(app.getPath('temp'),'chelrecord-camera-'+randomUUID()+'.webm');
 pipRecording={temp,desktop:nativeRecording.output,chain:Promise.resolve(),count:0,closing:false};
 return true;
}
async function appendCameraPiP(bytes){
 const r=pipRecording;
 if(!r||r.closing)throw new Error('Camera recording is not active');
 if(!(bytes instanceof Uint8Array)||bytes.length>32*1024*1024)throw new Error('Invalid camera video chunk');
 if(!bytes.length)return false;
 const buffer=Buffer.from(bytes);
 r.chain=r.chain.then(()=>fs.promises.appendFile(r.temp,buffer));
 r.count+=1;
 await r.chain;
 return true;
}
async function abortCameraPiP(){
 const r=pipRecording;pipRecording=null;
 if(r){await r.chain.catch(()=>{});await fs.promises.unlink(r.temp).catch(()=>{});}
 return true;
}
async function finishCameraPiP(options){
 const r=pipRecording;
 if(!r||r.closing)throw new Error('Camera capture is not available');
 if(nativeRecording)throw new Error('Stop the native screen recorder before merging the camera');
 r.closing=true;
 const temporaryOutput=r.desktop.replace(/\.mp4$/i,'')+'.camera-'+randomUUID()+'.mp4';
 let completed=false;
 try{
  await r.chain;
  if(!r.count)throw new Error('Camera captured zero frames; original desktop MP4 remains intact');
  const stats=await Promise.all([fs.promises.stat(r.desktop),fs.promises.stat(r.temp)]);
  if(stats.some(st=>st.size<1024))throw new Error('The screen or camera file is empty');
  const args=argsForCameraPiP(r.desktop,r.temp,temporaryOutput,options||{});
  await new Promise((resolve,reject)=>{
   let errors='';
   const proc=spawn(ffmpegExecutable(),args,{windowsHide:true,stdio:['ignore','ignore','pipe']});
   proc.stderr.on('data',p=>errors=(errors+p.toString()).slice(-5000));
   proc.once('error',reject);
   proc.once('close',code=>code===0?resolve():reject(new Error('Camera PiP video encoding failed ('+code+'): '+errors)));
  });
  const result=await fs.promises.stat(temporaryOutput);
  if(result.size<1024)throw new Error('Merged video was empty');
  await fs.promises.rename(temporaryOutput,r.desktop);
  lastSavedFile=r.desktop;
  completed=true;
  return {filePath:r.desktop,cameraIncluded:true};
 }finally{
  pipRecording=null;
  await fs.promises.unlink(r.temp).catch(()=>{});
  if(!completed)await fs.promises.unlink(temporaryOutput).catch(()=>{});
 }
}

function register(){
 ipcMain.handle('app:diagnostics',async e=>{
  requireOwner(e);
  return {platform:process.platform,camera:status('camera'),microphone:status('microphone'),
   screen:status('screen'),chosenSource:selectedSourceId,packaged:app.isPackaged,
   systemPicker:nativeScreenPicker,sourceKind,nativeDesktopCapture:Boolean(nativeMacBinary())};
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
 ipcMain.handle('native:preview',async(e,rect)=>{requireOwner(e);return runNativeSnapshot(rect)});
 ipcMain.handle('native:start',async(e,config)=>{requireOwner(e);return startNativeRecording(config||{})});
 ipcMain.handle('native:stop',async e=>{requireOwner(e);return endNativeRecording(false)});
 ipcMain.handle('native:abort',async e=>{requireOwner(e);return endNativeRecording(true)});
 ipcMain.handle('pip:begin',async e=>{requireOwner(e);return beginCameraPiP()});
 ipcMain.handle('pip:chunk',async(e,bytes)=>{requireOwner(e);return appendCameraPiP(bytes)});
 ipcMain.handle('pip:finish',async(e,options)=>{requireOwner(e);return finishCameraPiP(options)});
 ipcMain.handle('pip:abort',async e=>{requireOwner(e);return abortCameraPiP()});
 ipcMain.handle('desktop:pick-region',async e=>{requireOwner(e);return chooseDesktopRegion()});
 ipcMain.handle('desktop:list',async(e,kind='screen')=>{
  requireOwner(e);
  if(!['screen','window'].includes(kind))throw new Error('Invalid capture source kind');
  if(recording)throw new Error('Cannot switch capture type while recording');
  sourceKind=kind;
  if(nativeScreenPicker){
   // The user selects screen or window after pressing Start preview.
   // Avoid getSources altogether on supported macOS versions.
   return {selectedId:null,items:[],systemPicker:true};
  }
  const list=await sources(sourceKind);
  return {selectedId:selectedSourceId,items:list.map(s=>({id:s.id,name:s.name,
   thumbnail:s.thumbnail.isEmpty()?'':s.thumbnail.toDataURL()})),systemPicker:false};
 });
 ipcMain.handle('desktop:select',async(e,id)=>{
  requireOwner(e);
  if(nativeScreenPicker)throw new Error('Choose a screen using the macOS system picker after Start preview');
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
 ipcMain.handle('diagnostics:copy',async(e,content)=>{
  requireOwner(e);
  if(typeof content!=='string'||content.length>16000)throw new Error('Invalid diagnostic report');
  clipboard.writeText(content);return true;
 });
 ipcMain.handle('folder:show',async(e,file)=>{
  requireOwner(e);
  if(typeof file!=='string'||file!==lastSavedFile)throw new Error('Invalid output path');
  shell.showItemInFolder(file);return true;
 });
}
app.whenReady().then(()=>{
 app.setAppUserModelId('com.chelrecord.studio');
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
   if(!windowRef||!req.frame||req.frame!==windowRef.webContents.mainFrame){cb(null);return}
   // Electron may not provide videoRequested consistently; getDisplayMedia is called after a user click.
   // Fallback for Windows and macOS earlier than 15. On macOS 15+ the handler
   // is never invoked when the native picker is available.
   const list=await desktopCapturer.getSources({types:[sourceKind],thumbnailSize:{width:0,height:0}});
   const item=list.find(s=>s.id===selectedSourceId)||list[0];
   if(!item){cb(null);return}
   cb({video:item});
  }catch(err){console.error('[display-media]',err);cb(null)}
 },{useSystemPicker:nativeScreenPicker});
 register();
 windowRef=new BrowserWindow({width:1350,height:920,minWidth:980,minHeight:720,
  title:'ChelRecord',backgroundColor:'#081020',
  webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,
   sandbox:true,webSecurity:true,backgroundThrottling:false}});
 windowRef.loadFile('index.html');
 windowRef.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 windowRef.webContents.on('will-navigate',event=>event.preventDefault());
 windowRef.on('closed',()=>{if(nativeRecording){nativeRecording.child.stdin.write('stop\n');nativeRecording.child.stdin.end()}void abortCameraPiP();windowRef=null});
}).catch(err=>{console.error('ChelRecord startup failed:',err);app.quit()});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(!windowRef){app.relaunch();app.quit()}});
