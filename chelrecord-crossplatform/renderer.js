'use strict';
const $=id=>document.getElementById(id),api=window.chelrecord;
let screenStream=null,camStream=null,micStream=null,rendering=false,region=null,recorder=null,started=0,timer=null,busy=false,chosen=null,lastFile=null,writeChain=Promise.resolve(),captureW=1280,captureH=720;
const canvas=$('screen'),ctx=canvas.getContext('2d',{alpha:false}),video=$('captureVideo');
function info(t){$('status').textContent=t}
function buttons(recording){$('recordBtn').disabled=recording||!screenStream;$('stopBtn').disabled=!recording;$('cancelBtn').disabled=!recording;$('previewBtn').disabled=recording;$('refresh').disabled=recording;$('mode').disabled=recording;$('camera').disabled=recording;$('mic').disabled=recording}
function resetRegion(){region=null;$('selection').style.display='none'}
async function listMedia(){
 const devices=await navigator.mediaDevices.enumerateDevices();
 for(const [key,type] of [['mic','audioinput'],['camera','videoinput']]){
  const sel=$(key),old=sel.value;sel.innerHTML='<option value="">'+(key==='mic'?'Microphone off':'Camera off')+'</option>';
  devices.filter(d=>d.kind===type).forEach((d,i)=>{const opt=document.createElement('option');opt.value=d.deviceId;opt.textContent=d.label||key+' '+(i+1);sel.append(opt)});
  if([...sel.options].some(o=>o.value===old))sel.value=old;
 }
}
async function listScreens(){
 const sources=await api.listSources();$('sourceList').replaceChildren();
 sources.forEach(s=>{const b=document.createElement('button');const im=document.createElement('img');im.src=s.thumbnail;b.append(im,document.createTextNode(s.name));b.classList.toggle('active',chosen===s.id);b.onclick=async()=>{if(recorder)return;chosen=s.id;await api.chooseSource(s.id);[...$('sourceList').children].forEach(el=>el.classList.remove('active'));b.classList.add('active');info('Source selected: '+s.name);if(screenStream)await startPreview()};$('sourceList').append(b)});
 if(!sources.length)info('No screens/windows found. Allow screen recording permission in system settings.');
}
async function dispose(){rendering=false;for(const s of [screenStream,camStream,micStream])s?.getTracks().forEach(t=>t.stop());screenStream=camStream=micStream=null;video.srcObject=null;$('cameraPreview').srcObject=null;$('cameraPreview').classList.add('hidden')}
async function startPreview(){
 if(!chosen){info('Select a screen or window first');return}
 await dispose();resetRegion();
 try{
  screenStream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:false});
  video.srcObject=screenStream;await video.play();
  const t=screenStream.getVideoTracks()[0];const st=t.getSettings();captureW=Math.max(320,st.width||1280);captureH=Math.max(240,st.height||720);
  // Keep output at source resolution, capped to 1920x1080 for CPU stability.
  const factor=Math.min(1,1920/captureW,1080/captureH);captureW=Math.round(captureW*factor);captureH=Math.round(captureH*factor);
  canvas.width=captureW;canvas.height=captureH;
  t.addEventListener('ended',()=>{if(!recorder){dispose();buttons(false);info('Screen sharing stopped')}});rendering=true;draw();
  $('region').classList.toggle('hidden',$('mode').value!=='region');$('selection').style.display='none';await refreshCamera();buttons(false);info('Preview is running');
 }catch(err){await dispose();buttons(false);info('Screen capture unavailable: '+(err?.message||err))}
}
async function refreshCamera(){
 if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}
 const deviceId=$('camera').value;if(!deviceId){$('cameraPreview').classList.add('hidden');return}
 try{camStream=await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:deviceId},width:{ideal:640},height:{ideal:480}},audio:false});$('cameraPreview').srcObject=camStream;$('cameraPreview').classList.remove('hidden');await $('cameraPreview').play()}catch(err){info('Camera unavailable: '+err.message)}
}
function draw(){
 if(!rendering)return;
 if(video.readyState>=2){
  const w=canvas.width,h=canvas.height;ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  if(region){const x=region.x*w,y=region.y*h,rw=region.w*w,rh=region.h*h;ctx.drawImage(video,x,y,rw,rh,0,0,w,h)}else ctx.drawImage(video,0,0,w,h);
  const cv=$('cameraPreview');if(camStream&&cv.readyState>=2){const cw=w*.23,ch=cw*.75;ctx.drawImage(cv,w-cw-24,h-ch-24,cw,ch)}
 }
 requestAnimationFrame(draw);
}
let anchor=null;
$('region').addEventListener('pointerdown',e=>{if(recorder)return;const r=$('region').getBoundingClientRect();anchor={x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};$('region').setPointerCapture(e.pointerId)});
$('region').addEventListener('pointermove',e=>{if(!anchor)return;const r=$('region').getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));region={x:Math.min(anchor.x,x),y:Math.min(anchor.y,y),w:Math.abs(x-anchor.x),h:Math.abs(y-anchor.y)};const s=$('selection');s.style.display='block';Object.assign(s.style,{left:region.x*100+'%',top:region.y*100+'%',width:region.w*100+'%',height:region.h*100+'%'})});
$('region').addEventListener('pointerup',()=>{anchor=null;if(region&&(region.w<.03||region.h<.03))resetRegion()});
async function startRecord(){
 if(busy||recorder)return;busy=true;
 try{
  const meta=await api.begin();if(!meta){info('Save cancelled');return}
  try{
   const micId=$('mic').value;let tracks=[];
   if(micId){micStream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:micId},echoCancellation:true,noiseSuppression:true},video:false});tracks=micStream.getAudioTracks()}
   const stream=canvas.captureStream(30);for(const t of tracks)stream.addTrack(t);
   const mime=['video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error('WebM capture not supported');
   recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});
   writeChain=Promise.resolve();
   recorder.ondataavailable=e=>{if(e.data.size)writeChain=writeChain.then(async()=>api.write(new Uint8Array(await e.data.arrayBuffer())));};
   recorder.onerror=e=>info('Recorder error: '+(e.error?.message||'unknown'));
   recorder.start(1000);started=Date.now();timer=setInterval(()=>{const s=Math.floor((Date.now()-started)/1000);$('timer').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},250);
   buttons(true);$('state').textContent='● Recording';info('Recording to '+meta.finalPath);lastFile=null;$('openFile').classList.add('hidden');
  }catch(err){await api.abort();throw err}
 }catch(err){info('Could not start: '+err.message)}finally{busy=false}
}
async function stopRecord(discard){
 if(!recorder||busy)return;busy=true;clearInterval(timer);const r=recorder;recorder=null;
 try{
  await new Promise(resolve=>{r.addEventListener('stop',resolve,{once:true});r.stop()});
  await writeChain;
  if(discard){await api.abort();info('Recording discarded')}else{
   info('Converting video to MP4…');const result=await api.finish();lastFile=result.filePath;
   info('Saved: '+lastFile);$('openFile').classList.remove('hidden')
  }
 }catch(err){info('Export failed: '+err.message);await api.abort().catch(()=>{})}
 finally{micStream?.getTracks().forEach(t=>t.stop());micStream=null;busy=false;buttons(false);$('state').textContent='Ready'}
}
$('refresh').onclick=()=>listScreens().catch(e=>info(e.message));
$('previewBtn').onclick=startPreview;$('recordBtn').onclick=startRecord;
$('stopBtn').onclick=()=>stopRecord(false);$('cancelBtn').onclick=()=>stopRecord(true);
$('openFile').onclick=()=>{if(lastFile)api.showFile(lastFile)};
$('mode').onchange=()=>{resetRegion();$('region').classList.toggle('hidden',$('mode').value!=='region')};
$('camera').onchange=refreshCamera;
listScreens().catch(e=>info(e.message));listMedia().catch(e=>info('Media discovery: '+e.message));
