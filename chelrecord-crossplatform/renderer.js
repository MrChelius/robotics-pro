'use strict';
const $=id=>document.getElementById(id),api=window.chelrecord;
const canvas=$('screen'),ctx=canvas.getContext('2d',{alpha:false});
const screenVideo=$('captureVideo'),cameraVideo=$('cameraTest'),overlay=$('cameraOverlay');
let sources=[],chosen=null,nativePicker=false,screenStream=null,camStream=null,micStream=null,testMicStream=null;
let renderToken=0,region=null,anchor=null,preview=false,recorder=null,busy=false,quickStarting=false,lastCaptureError=null;
const diagnosticTrail=[];
function diagnosticNote(message){diagnosticTrail.push(new Date().toISOString()+' '+String(message));if(diagnosticTrail.length>30)diagnosticTrail.shift()}
let writing=Promise.resolve(),recordingStart=0,ticker=null,lastFile=null,meterContext=null,meterStream=null,meterRaf=0,meterTimer=null;
const sourceIsReady=()=>Boolean(screenStream?.active&&screenVideo.readyState>=2);
const cameraIsReady=()=>Boolean(camStream?.active&&cameraVideo.readyState>=2);
const mode=()=>$('mode').value;
const desiredSurface=()=>mode()==='window'?'window':'monitor';
function info(msg,isError=false){
 const box=$('status');box.textContent=msg;box.classList.toggle('warning',isError);
 box.classList.toggle('success',!isError&&/saved:|saved recording|video saved/i.test(msg));
 diagnosticNote((isError?'ERROR ':'INFO ')+msg);
}
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
 $('areaControl').classList.toggle('hidden',mode()!=='region');
 $('region').classList.toggle('hidden',!(mode()==='region'&&sourceIsReady()));
 if(mode()!=='region')resetRegion();
 syncButtons();
}
function syncButtons(){
 const isRecording=Boolean(recorder);
 const ready=preview&&(mode()==='camera'?cameraIsReady():sourceIsReady())&&(mode()!=='region'||Boolean(region&&region.w>.025&&region.h>.025));
 $('recordBtn').disabled=isRecording||busy||quickStarting;
 $('quickRecord').disabled=isRecording||busy||quickStarting;
 $('emptyState').classList.toggle('hidden',Boolean(preview&&(mode()==='camera'?cameraIsReady():sourceIsReady())));
 $('stopBtn').disabled=!isRecording||busy;
 $('cancelBtn').disabled=!isRecording||busy;
 $('previewBtn').disabled=isRecording||busy;
 $('selectAreaBtn').disabled=isRecording||busy;
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
function resetRegion(){region=null;$('selection').style.display='none';$('areaSummary').textContent='No area selected. Press Select area, then drag anywhere on the desktop.';}
function regionIsReady(){return Boolean(region&&region.w>.025&&region.h>.025)}
function describeRegion(){
 $('areaSummary').textContent=regionIsReady()?'Area selected: '+Math.round(region.w*100)+'% wide × '+Math.round(region.h*100)+'% high. Press RECORD NOW to capture it.':'Choose a region directly on the desktop before recording.';
}
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
  const data=await api.listSources(desiredSurface()==='window'?'window':'screen');nativePicker=Boolean(data.systemPicker);
  diagnosticNote('Picker mode: '+(nativePicker?'native macOS screen picker':'desktop source list'));
  sources=data.items||[];chosen=data.selectedId;
  $('sourceList').replaceChildren();
  if(nativePicker){
   $('refresh').textContent='Apple system screen picker';
   $('sourceHint').textContent=desiredSurface()==='window'?'macOS will show application windows. Select the window you want to capture.':'macOS will show MONITORS only. Select the entire MacBook display, not the ChelRecord window.';
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
  diagnosticNote('Camera track opened: '+(camStream.getVideoTracks()[0]?.label||'unknown'));
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
async function closeScreen(preserveRegion=false){
 ++renderToken;stopStream(screenStream);screenStream=null;screenVideo.srcObject=null;
 preview=false;
 overlay.classList.add('hidden');if(!preserveRegion)resetRegion();showMode();syncButtons();
}
async function startPreview(){
 if(busy||recorder)return false;
 if(mode()==='camera'){
  if(!cameraIsReady())await testCamera();
  if(!cameraIsReady()){info('Camera-only preview requires a working camera.',true);return false}
  stopStream(screenStream);screenStream=null;screenVideo.srcObject=null;
  canvas.width=1280;canvas.height=720;$('stage').style.aspectRatio='16 / 9';
  preview=true;++renderToken;draw(renderToken);showMode();
  info('Camera-only preview is active. Click Record to save camera video.');return true;
 }
 if(!chosen&&!nativePicker){await listScreens()}
 if(!chosen&&!nativePicker){info('No screen selected. Select a screen or enable macOS screen recording permission.',true);return false}
 await closeScreen(mode()==='region');
 lastCaptureError=null;
 try{
  info(nativePicker?'Opening macOS screen/window picker…':'Requesting screen capture…');
  const expectedSurface=desiredSurface();
  // Avoid adding display frame-rate constraints to the experimental macOS system picker.
  // Electron uses displaySurface to choose the monitor/window picker.
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:expectedSurface},audio:false});
  diagnosticNote('Screen picker returned '+stream.getVideoTracks().length+' video track(s)');
  const track=stream.getVideoTracks()[0];
  if(!track)throw new Error('Screen capture returned no video track');
  const settings=track.getSettings();
  const actualSurface=settings.displaySurface;
  diagnosticNote('Requested '+expectedSurface+'; actual share: '+String(actualSurface||'unknown')+'; track label: '+track.label);
  // A macOS picker offering an application/window must never silently pass as a desktop capture.
  if(actualSurface && actualSurface!==expectedSurface){
   stopStream(stream);
   throw new Error('Wrong screen source selected: got '+actualSurface+' instead of '+expectedSurface+'. Select '+(expectedSurface==='monitor'?'the Entire Screen / Monitor':'an application window')+' in the macOS sharing picker.');
  }
  screenStream=stream;screenVideo.srcObject=screenStream;
  await screenVideo.play();
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
  info((expectedSurface==='monitor'?'Entire desktop':'Window')+' preview active. '+(mode()==='region'?(regionIsReady()?'Your selected desktop region is ready. Click RECORD NOW.':'Select a region on the screen, then click RECORD NOW.'):'Click RECORD NOW to begin.')+(cameraIsReady()?' Camera is active.':''));
  track.addEventListener('ended',async()=>{
   if(screenStream!==stream)return;
   if(recorder)await stopRecord(false);
   await closeScreen();info('Screen share stopped. Start preview again.',true)
  },{once:true});
  await diagnostics();
  return true;
 }catch(err){
  await closeScreen(mode()==='region');
  // Only an actual capture rejection should present a blocking error.
  const wasCancelled=err?.name==='AbortError'||(err?.name==='NotAllowedError'&&/cancel|dismiss/i.test(String(err?.message||'')));
  lastCaptureError={name:String(err?.name||'CaptureError'),message:String(err?.message||err),surface:desiredSurface()};
  diagnosticNote('CAPTURE FAILURE '+JSON.stringify(lastCaptureError));
  const hint=wasCancelled?'Screen selection was cancelled. Click Start preview to try again.':
    'Screen capture error ('+lastCaptureError.name+'): '+lastCaptureError.message+
    '\nRequested: '+(lastCaptureError.surface==='monitor'?'entire desktop / monitor':'application window')+
    '\nUse Device permissions → Copy diagnostic report if this persists.';
  info(hint,!wasCancelled);
  return false;
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
 const ready=preview&&(mode()==='camera'?cameraIsReady():sourceIsReady())&&(mode()!=='region'||regionIsReady());
 if(!ready){info('A working screen or camera source and a valid region are required for recording.',true);return}
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
   diagnosticNote('Starting recording: video canvas with '+(micStream?.getAudioTracks().length||0)+' microphone tracks');
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
$('mode').addEventListener('change',async()=>{await closeScreen();resetRegion();showMode();await listScreens();info(mode()==='region'?'Select your desktop region, then RECORD NOW.':mode()==='window'?'Window mode selected. Press RECORD NOW to choose an application window.':'Entire desktop mode selected. Press RECORD NOW to capture the monitor.')});
$('refresh').onclick=listScreens;
$('testCam').onclick=testCamera;$('stopCam').onclick=stopCamera;
$('camera').onchange=async()=>{if(camStream)stopCamera();if($('camera').value)await testCamera();else $('cameraStatus').textContent='Camera disabled';syncButtons()};
$('testMic').onclick=testMicrophone;$('stopMic').onclick=()=>{stopMicTest();$('micStatus').textContent='Microphone test stopped'};
$('previewBtn').onclick=startPreview;$('recordBtn').onclick=requestRecord;
$('selectAreaBtn').onclick=selectAreaOnDesktop;
$('stopBtn').onclick=()=>stopRecord(false);$('cancelBtn').onclick=()=>stopRecord(true);
$('openFile').onclick=()=>{if(lastFile)api.showFile(lastFile)};
$('settingsScreen').onclick=()=>settings('screen');
$('settingsCam').onclick=()=>settings('camera');
$('settingsMic').onclick=()=>settings('microphone');
$('checkPermissions').onclick=diagnostics;
navigator.mediaDevices?.addEventListener?.('devicechange',listMedia);
window.addEventListener('beforeunload',()=>{stopStream(screenStream);stopStream(camStream);stopStream(testMicStream);stopStream(micStream);stopMicTest()});
async function selectAreaOnDesktop(){
 if(recorder||busy)return null;
 try{
  info('Choose the area on the desktop. Release the mouse to confirm or press Esc to cancel.');
  const selected=await api.selectRegion();
  if(!selected||!selected.region){info('Area selection cancelled.');return null}
  const r=selected.region;
  if(!['x','y','w','h'].every(k=>Number.isFinite(r[k]))||r.w<.025||r.h<.025){
   info('The selected region was too small. Try again.',true);return null;
  }
  region=r;
  describeRegion();syncButtons();
  diagnosticNote('Desktop region selected on display '+selected.displayId+': '+JSON.stringify(r));
  info('Screen region selected. Press RECORD NOW and choose the same display in the macOS sharing picker.');
  return region;
 }catch(err){info('Could not open the area selector: '+err.message,true);return null}
}
async function requestRecord(){
 if(recorder||busy)return;
 if(mode()==='region'&&!regionIsReady()){
  const r=await selectAreaOnDesktop();
  if(!r)return;
 }
 if(!preview||(mode()==='camera'&&!cameraIsReady())||(mode()!=='camera'&&!sourceIsReady())){
  const opened=await startPreview();
  if(!opened){
   // The specific OS error was already displayed by startPreview. Never overwrite it.
   return;
  }
 }
 if(mode()==='camera' ? cameraIsReady()&&preview : sourceIsReady()&&preview){
  if(mode()==='region'&&!regionIsReady()){
   info('Screen area was not selected; try Select area directly on desktop.',true);
   return;
  }
  await startRecord();
 }else{
  // A real screen source is mandatory. Preserve any more specific error from the OS.
  if(!lastCaptureError)info('The capture source is not ready. Start preview again, then try Record.',true);
 }
}
async function quickRecord(){
 if(quickStarting||busy||recorder)return;
 quickStarting=true;syncButtons();
 try{await requestRecord()}
 finally{quickStarting=false;syncButtons()}
}
async function copyDiagnostics(){
 try{
  const d=await api.diagnostics();
  const report=[
   'ChelRecord Studio diagnostic report',
   'Date: '+new Date().toISOString(),
   'OS: '+d.platform,
   'App packaged: '+d.packaged,
   'Screen permission: '+d.screen,
   'Camera permission: '+d.camera,
   'Mic permission: '+d.microphone,
   'Capture picker: '+(nativePicker?'native':'desktopCapturer'),
   'Current mode: '+mode(),
   'Source selected: '+Boolean(chosen),
   'Screen stream active: '+Boolean(screenStream?.active),
   'Camera stream active: '+Boolean(camStream?.active),
   'Microphone stream active: '+Boolean(micStream?.active),
   'Preview active: '+Boolean(preview),
   'Recording active: '+Boolean(recorder),
   'Last screen capture error: '+JSON.stringify(lastCaptureError),
   'Recent application events:',...diagnosticTrail
  ].join('\n');
  await api.copyDiagnostics(report);
  info('Diagnostic report copied. You can paste it into a bug report.');
 }catch(error){info('Could not copy diagnostics: '+error.message,true)}
}
$('quickRecord').onclick=quickRecord;
$('copyDiagnostics').onclick=copyDiagnostics;
showMode();listScreens();listMedia();diagnostics();
