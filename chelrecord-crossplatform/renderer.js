'use strict';
const $=id=>document.getElementById(id),api=window.chelrecord;
const canvas=$('screen'),ctx=canvas.getContext('2d',{alpha:false});
const screenVideo=$('captureVideo'),cameraVideo=$('cameraTest'),overlay=$('cameraOverlay');
let sources=[],chosen=null,nativePicker=false,screenStream=null,camStream=null,micStream=null,testMicStream=null;
let renderToken=0,region=null,anchor=null,preview=false,recorder=null,busy=false;
let writing=Promise.resolve(),recordingStart=0,ticker=null,lastFile=null,meterContext=null,meterStream=null,meterRaf=0,meterTimer=null;
const sourceIsReady=()=>Boolean(screenStream?.active&&screenVideo.readyState>=2);
const cameraIsReady=()=>Boolean(camStream?.active&&cameraVideo.readyState>=2);
const mode=()=>$('mode').value;
function info(msg,isError=false){$('status').textContent=msg;$('status').classList.toggle('warning',isError)}
function explain(error,kind='device'){
 const name=error?.name||'Error',message=error?.message||String(error);
 if(name==='NotAllowedError'||name==='PermissionDeniedError')return kind+' permission was denied. Open the corresponding system settings, grant access, then restart ChelRecord if necessary. ('+message+')';
 if(name==='NotFoundError'||name==='DevicesNotFoundError')return 'No '+kind+' device was found. Check connection and select another device.';
 if(name==='NotReadableError'||name==='TrackStartError')return 'The '+kind+' is busy or unavailable. Close FaceTime, Zoom and other apps using it. ('+message+')';
 return kind+' error: '+message;
}
function stopStream(stream){stream?.getTracks().forEach(track=>track.stop())}
function showMode(){
 $('desktopControls').classList.toggle('hidden',mode()==='camera');
 $('region').classList.toggle('hidden',!(mode()==='region'&&sourceIsReady()));
 if(mode()!=='region')resetRegion();
 syncButtons();
}
function syncButtons(){
 const isRecording=Boolean(recorder);
 const ready=preview&&(mode()==='camera'?cameraIsReady():sourceIsReady())&&(mode()!=='region'||Boolean(region&&region.w>.025&&region.h>.025));
 $('recordBtn').disabled=isRecording||busy||!ready;
 $('stopBtn').disabled=!isRecording||busy;
 $('cancelBtn').disabled=!isRecording||busy;
 $('previewBtn').disabled=isRecording||busy;
 $('mode').disabled=isRecording||busy;
 $('refresh').disabled=isRecording||busy;
 $('camera').disabled=isRecording||busy;
 $('mic').disabled=isRecording||busy;
 $('testCam').disabled=isRecording||busy;
 $('stopCam').disabled=isRecording||busy;
 $('testMic').disabled=isRecording||busy;
 $('stopMic').disabled=isRecording||busy;
 $('sourceList').style.pointerEvents=isRecording?'none':'auto';
}
function resetRegion(){region=null;$('selection').style.display='none'}
function formatStatus(x){return String(x||'unknown').replace(/-/g,' ')}
async function diagnostics(){
 try{
  const d=await api.diagnostics();
  $('permissionStatus').textContent='Screen: '+formatStatus(d.screen)+' · Camera: '+formatStatus(d.camera)+' · Microphone: '+formatStatus(d.microphone)+
   (d.platform==='darwin'?"\nFor screen permissions use System Settings → Privacy & Security → Screen & System Audio Recording.":"");
  // The OS permission snapshot can be stale (especially after reinstalling an ad-hoc signed build).
  // Report it in the diagnostics panel, but only the actual getDisplayMedia result determines capture readiness.
  if(d.platform==='darwin'&&d.screen==='denied'){
   $('permissionStatus').textContent+='\nmacOS reports denied here. If Start preview fails, review Screen settings and fully quit/reopen ChelRecord. The OS status alone does not confirm capture failure.';
  }
  return d;
 }catch(err){$('permissionStatus').textContent='Unable to inspect OS permissions: '+err.message}
}
async function listScreens(){
 try{
  const data=await api.listSources();nativePicker=Boolean(data.systemPicker);
  sources=data.items||[];chosen=data.selectedId;
  $('sourceList').replaceChildren();
  if(nativePicker){
   $('refresh').textContent='Apple system screen picker';
   $('sourceHint').textContent='macOS will ask which screen or window to share when you click Start preview. No manual source list is required.';
   info('Click Start preview and choose a screen or window in the macOS picker.');
   return;
  }
  if(!sources.length){
   $('sourceHint').textContent='No screens/windows returned. Check screen recording permission, then restart this app.';
   info('No desktop sources available. Use Screen settings to grant access.',true);
   return;
  }
  for(const src of sources){
   const btn=document.createElement('button');btn.title=src.name;
   if(src.thumbnail){const im=document.createElement('img');im.src=src.thumbnail;btn.append(im)}
   else {const placeholder=document.createElement('div');placeholder.textContent='▣';placeholder.style.cssText='height:65px;font-size:32px';btn.append(placeholder)}
   const name=document.createElement('div');name.textContent=src.name;btn.append(name);
   btn.classList.toggle('active',src.id===chosen);
   btn.addEventListener('click',async()=>{
    if(recorder||busy)return;
    try{
     chosen=src.id;await api.chooseSource(src.id);
     for(const b of $('sourceList').children)b.classList.toggle('active',b===btn);
     $('sourceHint').textContent='Selected: '+src.name;
     info('Selected '+src.name+'. Click Start preview.');
     if(screenStream)await startPreview();
    }catch(err){info(explain(err,'screen'),true)}
   });
   $('sourceList').append(btn);
  }
  $('sourceHint').textContent='Selected: '+(sources.find(s=>s.id===chosen)?.name||'Choose a source')+'. Click Start preview.';
 }catch(err){$('sourceHint').textContent=explain(err,'screen');info(explain(err,'screen'),true)}
}
async function listMedia(){
 try{
  const devices=await navigator.mediaDevices.enumerateDevices();
  for(const [id,kind] of [['camera','videoinput'],['mic','audioinput']]){
   const sel=$(id),old=sel.value,defaultName=id==='camera'?'Default camera':'Default microphone';
   sel.replaceChildren();
   let opt=new Option(id==='camera'?'Camera off':'Microphone off','');sel.add(opt);
   sel.add(new Option(defaultName,'auto'));
   devices.filter(d=>d.kind===kind).forEach((d,i)=>sel.add(new Option(d.label||defaultName+' '+(i+1),d.deviceId||'auto')));
   if(Array.from(sel.options).some(o=>o.value===old))sel.value=old;
  }
 }catch(err){info('Device discovery failed: '+err.message,true)}
}
async function grant(kind){
 if(!['camera','microphone'].includes(kind))return;
 try{const state=await api.requestPermission(kind);if(state==='denied')info(kind+' access denied in macOS. Use settings buttons below.',true)}
 catch(err){info(explain(err,kind),true)}
}
function connectCamera(){
 if(!camStream)return;
 cameraVideo.srcObject=camStream;overlay.srcObject=camStream;
 cameraVideo.play().catch(e=>{$('cameraStatus').textContent='Video playback error: '+e.message});
 overlay.play().catch(()=>{});
 overlay.classList.toggle('hidden',!sourceIsReady()||mode()==='camera');
}
async function testCamera(){
 if(busy||recorder)return;
 const selection=$('camera').value;
 if(!selection){$('camera').value='auto'}
 stopStream(camStream);camStream=null;
 cameraVideo.srcObject=null;overlay.srcObject=null;overlay.classList.add('hidden');
 $('cameraStatus').textContent='Requesting camera permission…';
 try{
  await grant('camera');
  const id=$('camera').value;
  const videoConstraints=id&&id!=='auto'?{deviceId:{exact:id},width:{ideal:1280},height:{ideal:720}}:{width:{ideal:1280},height:{ideal:720}};
  camStream=await navigator.mediaDevices.getUserMedia({video:videoConstraints,audio:false});
  connectCamera();
  await cameraVideo.play();
  $('cameraStatus').textContent='Camera active: '+(camStream.getVideoTracks()[0]?.label||'video');
  info('Camera works. '+(mode()==='camera'?'Click Start preview to record camera only.':'You can use it as an overlay on screen recordings.'));
  await listMedia();syncButtons();
  camStream.getVideoTracks()[0].addEventListener('ended',()=>{camStream=null;$('cameraStatus').textContent='Camera disconnected';syncButtons()},{once:true});
 }catch(err){stopStream(camStream);camStream=null;cameraVideo.srcObject=null;overlay.srcObject=null;overlay.classList.add('hidden');$('cameraStatus').textContent=explain(err,'camera');info(explain(err,'camera'),true);syncButtons()}
}
function stopCamera(){
 if(recorder)return;
 stopStream(camStream);camStream=null;cameraVideo.srcObject=null;overlay.srcObject=null;
 overlay.classList.add('hidden');$('cameraStatus').textContent='Camera stopped';syncButtons();
}
function stopMicTest(){
 clearTimeout(meterTimer);cancelAnimationFrame(meterRaf);
 if(meterContext){meterContext.close().catch(()=>{});meterContext=null}
 stopStream(testMicStream);testMicStream=null;$('meterBar').style.width='0%';
}
async function testMicrophone(){
 if(recorder||busy)return;
 stopMicTest();
 if(!$('mic').value)$('mic').value='auto';
 $('micStatus').textContent='Requesting microphone…';
 try{
  await grant('microphone');
  const id=$('mic').value;
  testMicStream=await navigator.mediaDevices.getUserMedia({audio:id&&id!=='auto'?{deviceId:{exact:id}}:{echoCancellation:true},video:false});
  const Ctx=window.AudioContext||window.webkitAudioContext;
  meterContext=new Ctx();await meterContext.resume();
  const src=meterContext.createMediaStreamSource(testMicStream),analyser=meterContext.createAnalyser();
  analyser.fftSize=256;src.connect(analyser);
  const bins=new Uint8Array(analyser.fftSize);
  const poll=()=>{
   if(!testMicStream)return;
   analyser.getByteTimeDomainData(bins);
   let sum=0;for(const n of bins){const v=(n-128)/128;sum+=v*v}
   const rms=Math.sqrt(sum/bins.length);
   $('meterBar').style.width=Math.min(100,Math.round(rms*550))+'%';
   meterRaf=requestAnimationFrame(poll);
  };
  poll();$('micStatus').textContent='Microphone active for 5 seconds. Speak to test the green meter.';
  meterTimer=setTimeout(()=>{stopMicTest();$('micStatus').textContent='Microphone test finished'},5000);
  await listMedia();
 }catch(err){stopMicTest();$('micStatus').textContent=explain(err,'microphone');info(explain(err,'microphone'),true)}
}
async function closeScreen(){
 ++renderToken;stopStream(screenStream);screenStream=null;screenVideo.srcObject=null;
 preview=false;
 overlay.classList.add('hidden');resetRegion();showMode();syncButtons();
}
async function startPreview(){
 if(busy||recorder)return;
 if(mode()==='camera'){
  if(!cameraIsReady())await testCamera();
  if(!cameraIsReady()){info('Camera-only preview requires a working camera.',true);return}
  stopStream(screenStream);screenStream=null;screenVideo.srcObject=null;
  canvas.width=1280;canvas.height=720;$('stage').style.aspectRatio='16 / 9';
  preview=true;++renderToken;draw(renderToken);showMode();
  info('Camera-only preview is active. Click Record to save camera video.');return;
 }
 if(!chosen&&!nativePicker){await listScreens()}
 if(!chosen&&!nativePicker){info('No screen selected. Select a screen or enable macOS screen recording permission.',true);return}
 await closeScreen();
 try{
  info(nativePicker?'Opening macOS screen/window picker…':'Requesting screen capture…');
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:false});
  const track=stream.getVideoTracks()[0];
  if(!track)throw new Error('Screen capture returned no video track');
  screenStream=stream;screenVideo.srcObject=screenStream;
  await screenVideo.play();
  const settings=track.getSettings();
  let width=Math.max(320,settings.width||screenVideo.videoWidth||1280);
  let height=Math.max(240,settings.height||screenVideo.videoHeight||720);
  const scale=Math.min(1,1920/width,1080/height);
  width=Math.max(2,Math.round(width*scale/2)*2);
  height=Math.max(2,Math.round(height*scale/2)*2);
  canvas.width=width;canvas.height=height;$('stage').style.aspectRatio=width+' / '+height;
  preview=true;++renderToken;draw(renderToken);showMode();
  if($('camera').value && !cameraIsReady())await testCamera();
  overlay.classList.toggle('hidden',!cameraIsReady());
  syncButtons();
  info('Screen preview active. '+(mode()==='region'?'Drag to select a region, then click Record.':'Click Record to begin.')+(cameraIsReady()?' Camera is active.':''));
  track.addEventListener('ended',async()=>{
   if(screenStream!==stream)return;
   if(recorder)await stopRecord(false);
   await closeScreen();info('Screen share stopped. Start preview again.',true)
  },{once:true});
  await diagnostics();
 }catch(err){
  await closeScreen();
  // Only an actual capture rejection should present a blocking error.
  const wasCancelled=err?.name==='AbortError'||(err?.name==='NotAllowedError'&&/cancel|dismiss/i.test(String(err?.message||'')));
  const hint=wasCancelled?'Screen selection was cancelled. Click Start preview to try again.':
   explain(err,'screen')+'\nIf permission was just granted, fully quit (⌘Q) and reopen ChelRecord.';
  info(hint,!wasCancelled);
 }
}
function draw(token){
 if(!preview||token!==renderToken)return;
 const width=canvas.width,height=canvas.height;
 ctx.fillStyle='#03070e';ctx.fillRect(0,0,width,height);
 if(mode()==='camera'){
  if(cameraVideo.readyState>=2)ctx.drawImage(cameraVideo,0,0,width,height);
 }else if(sourceIsReady()){
  try{
   if(region&&region.w>0.01&&region.h>0.01){
    const vw=screenVideo.videoWidth||width,vh=screenVideo.videoHeight||height;
    const sx=Math.floor(region.x*vw),sy=Math.floor(region.y*vh);
    const sw=Math.max(2,Math.min(vw-sx,Math.floor(region.w*vw)));
    const sh=Math.max(2,Math.min(vh-sy,Math.floor(region.h*vh)));
    const scale=Math.min(width/sw,height/sh);
    const dw=Math.max(1,Math.round(sw*scale)),dh=Math.max(1,Math.round(sh*scale));
    ctx.drawImage(screenVideo,sx,sy,sw,sh,Math.round((width-dw)/2),Math.round((height-dh)/2),dw,dh);
   }else ctx.drawImage(screenVideo,0,0,width,height);
  }catch(err){console.warn('[draw-screen]',err)}
  if(cameraIsReady()){
   const cw=Math.round(width*.25),ch=Math.round(cw*.68),pad=Math.max(12,Math.round(width*.015));
   ctx.drawImage(cameraVideo,width-cw-pad,height-ch-pad,cw,ch);
  }
 }
 requestAnimationFrame(()=>draw(token));
}
function normPoint(ev){
 const el=$('region'),r=el.getBoundingClientRect();
 return {x:Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),
  y:Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height))};
}
$('region').addEventListener('pointerdown',e=>{
 if(recorder||!sourceIsReady())return;
 anchor=normPoint(e);
 $('region').setPointerCapture(e.pointerId);
});
$('region').addEventListener('pointermove',e=>{
 if(!anchor)return;
 const p=normPoint(e);
 region={x:Math.min(anchor.x,p.x),y:Math.min(anchor.y,p.y),w:Math.abs(p.x-anchor.x),h:Math.abs(p.y-anchor.y)};
 const el=$('selection');el.style.display='block';
 Object.assign(el.style,{left:region.x*100+'%',top:region.y*100+'%',
  width:region.w*100+'%',height:region.h*100+'%'});
});
$('region').addEventListener('pointerup',()=>{
 anchor=null;
 if(region&&(region.w<.025||region.h<.025))resetRegion();
 syncButtons();
});
$('region').addEventListener('pointercancel',()=>anchor=null);
async function startRecord(){
 if(busy||recorder)return;
 const ready=preview&&(mode()==='camera'?cameraIsReady():sourceIsReady())&&(mode()!=='region'||Boolean(region&&region.w>.025&&region.h>.025));
 if(!ready){info('Start preview and, for region mode, draw an area before recording.',true);return}
 busy=true;syncButtons();
 try{
  const destination=await api.begin();
  if(!destination){info('Save location not selected');return}
  try{
   stopMicTest();
   const selected=$('mic').value;
   if(selected){
    await grant('microphone');
    micStream=await navigator.mediaDevices.getUserMedia({audio:selected==='auto'?{echoCancellation:true,noiseSuppression:true}:{deviceId:{exact:selected},echoCancellation:true,noiseSuppression:true},video:false});
   }
   if(!window.MediaRecorder)throw new Error('MediaRecorder is not supported in this Electron build');
   const mime=['video/webm;codecs=vp8,opus','video/webm;codecs=vp9,opus','video/webm']
    .find(type=>MediaRecorder.isTypeSupported(type));
   if(!mime)throw new Error('WebM encoder unavailable in this Electron build');
   const stream=canvas.captureStream(30);
   if(micStream)for(const track of micStream.getAudioTracks())stream.addTrack(track);
   writing=Promise.resolve();
   const r=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5_000_000});
   recorder=r;
   r.addEventListener('dataavailable',event=>{
    if(!event.data?.size)return;
    writing=writing.then(async()=>api.write(new Uint8Array(await event.data.arrayBuffer())));
   });
   r.addEventListener('error',event=>info('Recording error: '+(event.error?.message||'Unknown MediaRecorder error'),true));
   r.start(750);
   recordingStart=Date.now();
   ticker=setInterval(()=>{
    const seconds=Math.floor((Date.now()-recordingStart)/1000);
    $('timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
   },250);
   $('state').textContent='● Recording';info('Recording started. Saving to '+destination.filePath);
   lastFile=null;$('openFile').classList.add('hidden');
  }catch(err){stopStream(micStream);micStream=null;recorder=null;await api.abort();throw err}
 }catch(err){info(explain(err,'recording'),true)}
 finally{busy=false;syncButtons()}
}
async function stopRecord(discard=false){
 if(!recorder||busy)return;
 busy=true;syncButtons();clearInterval(ticker);
 const r=recorder;recorder=null;
 try{
  if(r.state!=='inactive'){
   await new Promise((resolve,reject)=>{
    r.addEventListener('stop',resolve,{once:true});
    try{r.stop()}catch(err){reject(err)}
   });
  }
  await writing;
  if(discard){await api.abort();info('Recording discarded')}
  else{
   info('Encoding MP4 via FFmpeg…');
   const result=await api.finish();lastFile=result.filePath;
   info('Video saved: '+lastFile);$('openFile').classList.remove('hidden');
  }
 }catch(err){info('Could not export MP4: '+(err?.message||err),true);await api.abort().catch(()=>{})}
 finally{
  stopStream(micStream);micStream=null;
  busy=false;$('state').textContent='Ready';syncButtons();
 }
}
async function settings(kind){
 try{await api.openSettings(kind);info('System settings opened. Grant permission to ChelRecord, then restart the app if screen permission was changed.')}
 catch(err){info('Could not open settings: '+err.message,true)}
}
$('mode').addEventListener('change',async()=>{await closeScreen();resetRegion();showMode();info('Capture mode changed. Click Start preview.')});
$('refresh').onclick=listScreens;
$('testCam').onclick=testCamera;$('stopCam').onclick=stopCamera;
$('camera').onchange=async()=>{if(camStream)stopCamera();if($('camera').value)await testCamera();else $('cameraStatus').textContent='Camera disabled';syncButtons()};
$('testMic').onclick=testMicrophone;$('stopMic').onclick=()=>{stopMicTest();$('micStatus').textContent='Microphone test stopped'};
$('previewBtn').onclick=startPreview;$('recordBtn').onclick=startRecord;
$('stopBtn').onclick=()=>stopRecord(false);$('cancelBtn').onclick=()=>stopRecord(true);
$('openFile').onclick=()=>{if(lastFile)api.showFile(lastFile)};
$('settingsScreen').onclick=()=>settings('screen');
$('settingsCam').onclick=()=>settings('camera');
$('settingsMic').onclick=()=>settings('microphone');
$('checkPermissions').onclick=diagnostics;
navigator.mediaDevices?.addEventListener?.('devicechange',listMedia);
window.addEventListener('beforeunload',()=>{stopStream(screenStream);stopStream(camStream);stopStream(testMicStream);stopStream(micStream);stopMicTest()});
showMode();listScreens();listMedia();diagnostics();
