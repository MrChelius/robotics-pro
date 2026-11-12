'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../renderer.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const required of ['mode','camera','mic','testCam','testMic','previewBtn','recordBtn','stopBtn','cancelBtn','quickRecord','copyDiagnostics','emptyState','stage','screen','selectAreaBtn','areaSummary']){
 assert.ok(html.includes('id="'+required+'"'),'UI missing: '+required)
}
const useNativePicker=process.argv.includes('native');
const screenStatusDenied=process.argv.includes('screen-denied');
const simulateWrongSurface=process.argv.includes('wrong-surface');
const simulateCaptureError=process.argv.includes('capture-error');
const elements=new Map();
class FakeElement{
 constructor(id=''){
  this.id=id;this.children=[];this.handlers={};this.style={};this.options=[];
  this.value='';this.disabled=false;this.readyState=3;this.videoWidth=1280;this.videoHeight=720;
  this.classList={toggle(){},add(){},remove(){}};this.srcObject=null;this.textContent='';
 }
 addEventListener(kind,fn){this.handlers[kind]=fn}
 append(...children){this.children.push(...children)}
 replaceChildren(...children){this.children=[...children]}
 getBoundingClientRect(){return {left:0,top:0,width:640,height:360}}
 setPointerCapture(){}
 play(){this.readyState=3;return Promise.resolve()}
 getContext(){return {fillRect(){},drawImage(){},fillStyle:''}}
 captureStream(){return fakeStream('canvas')}
 add(x){this.options.push(x)}
}
const element=id=>{if(!elements.has(id))elements.set(id,new FakeElement(id));return elements.get(id)};
const ids=['screen','captureVideo','cameraTest','cameraOverlay','region','selection','areaControl','areaSummary','selectAreaBtn','emptyState','quickRecord','copyDiagnostics',
 'status','permissionStatus','sourceList','sourceHint','desktopControls','cameraStatus','micStatus',
 'camera','mic','mode','stage','timer','state','refresh','testCam','stopCam','testMic',
 'stopMic','previewBtn','recordBtn','stopBtn','cancelBtn','openFile','settingsScreen',
 'settingsCam','settingsMic','checkPermissions','meterBar'];
ids.forEach(element);
element('mode').value='full';element('camera').value='auto';element('mic').value='';
const track=kind=>({kind,label:'Synthetic '+kind,stop(){},addEventListener(){},
 getSettings(){return {width:1280,height:720}}});
function fakeStream(kind){
 const tracks=kind==='mic'?[track('audio')]:[track('video')];
 return {active:true,getVideoTracks(){return tracks.filter(t=>t.kind==='video')},
 getAudioTracks(){return tracks.filter(t=>t.kind==='audio')},getTracks(){return tracks},
 addTrack(t){tracks.push(t)}};
}
let writeCount=0,exportCount=0,permissionChecks=0,copiedReport='',regionPickCount=0,lastRequestedSurface=null;
const api={
 diagnostics:async()=>({platform:'darwin',camera:'granted',microphone:'granted',screen:screenStatusDenied?'denied':'granted'}),
 listSources:async()=>useNativePicker?{selectedId:null,systemPicker:true,items:[]}:
  {selectedId:'screen:0:0',systemPicker:false,items:[{id:'screen:0:0',name:'Desktop',thumbnail:''}]},
 chooseSource:async()=>true,requestPermission:async()=>{permissionChecks++;return 'granted'},
 selectRegion:async()=>{regionPickCount++;return {region:{x:.15,y:.12,w:.47,h:.61},displayId:1}},
 copyDiagnostics:async text=>{copiedReport=text;return true},
 openSettings:async()=>true,begin:async()=>({filePath:'/tmp/synthetic.mp4'}),
 write:async()=>{writeCount++;return true},
 finish:async()=>{exportCount++;return {filePath:'/tmp/synthetic.mp4'}},
 abort:async()=>true,showFile:async()=>true
};
class MockMediaRecorder{
 static isTypeSupported(t){return t.startsWith('video/webm')}
 constructor(){this.handlers={};this.state='inactive'}
 addEventListener(name,fn){this.handlers[name]=fn}
 start(){this.state='recording'}
 stop(){
  this.state='inactive';
  const content=Uint8Array.from([1,2,3]);
  Promise.resolve().then(()=>this.handlers.dataavailable?.({data:{
   size:content.length,arrayBuffer:async()=>content.buffer}}))
   .then(()=>this.handlers.stop?.());
 }
}
const devices={
 enumerateDevices:async()=>[{kind:'videoinput',deviceId:'cam1',label:'Synthetic camera'},
  {kind:'audioinput',deviceId:'mic1',label:'Synthetic microphone'}],
 getUserMedia:async(constraints)=>fakeStream(constraints.video?'camera':'mic'),
 getDisplayMedia:async options=>{
  lastRequestedSurface=options?.video?.displaySurface;
  if(simulateCaptureError){const e=new Error('Could not start video source');e.name='NotReadableError';throw e;}
  const stream=fakeStream('screen');
  for(const track of stream.getVideoTracks()){
   const originalSettings=track.getSettings();
   track.getSettings=()=>({...originalSettings,displaySurface:simulateWrongSurface?'window':lastRequestedSurface});
  }
  return stream;
 },
 addEventListener(){}
};
const context={
 window:{chelrecord:api,MediaRecorder:MockMediaRecorder,addEventListener(){},
 AudioContext:class{},webkitAudioContext:class{}},
 document:{getElementById:element,createElement:id=>new FakeElement(id)},
 navigator:{mediaDevices:devices},
 console,Uint8Array,Math,Date,Promise,Option:class{constructor(text,value){this.text=text;this.value=value}},
 MediaRecorder:MockMediaRecorder,setTimeout:()=>0,clearTimeout(){},setInterval:()=>1,clearInterval(){},
 requestAnimationFrame:()=>0,cancelAnimationFrame(){},Object,String,Array,Number,Error
};
vm.runInNewContext(source,context,{filename:'renderer.js',timeout:3000});
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
async function click(id){const el=element(id);assert.equal(el.disabled,false,id+' disabled');return el.onclick()}
async function fire(id,kind,event){return element(id).handlers[kind](event)}
async function test(){
 await flush();
 if(useNativePicker){
  assert.equal(element('sourceList').children.length,0,'Native macOS picker should not enumerate windows');
  assert.match(element('sourceHint').textContent,/macOS will show MONITORS|macOS will ask/i);
 }else assert.ok(element('sourceList').children.length,'Desktop source listing did not render');
 // Even if the OS permission snapshot looks stale/denied, a real successful
 // screen capture must enable Record and keep the success message visible.
 assert.doesNotMatch(element('status').textContent,/macOS blocked screen capture/);
 await click('previewBtn');
 assert.equal(lastRequestedSurface,'monitor','Entire desktop must request only a monitor from the native macOS picker');
 if(simulateCaptureError){
  assert.match(element('status').textContent,/NotReadableError.*Could not start video source/i,'Detailed macOS error was hidden');
  await click('recordBtn');
  assert.match(element('status').textContent,/NotReadableError.*Could not start video source/i,'Record button replaced the detailed OS error');
  assert.doesNotMatch(element('status').textContent,/Screen capture could not start\. In Device permissions/i,'Old generic warning reappeared');
  await click('copyDiagnostics');
  assert.match(copiedReport,/Could not start video source/,'Diagnostic report missed real capture error');
  console.log('PASS: macOS NotReadableError preserved by preview and Record');
  return;
 }
 if(simulateWrongSurface){
  assert.match(element('status').textContent,/Wrong screen source selected/i,'Window capture was accepted in desktop-only mode');
  assert.doesNotMatch(element('status').textContent,/preview active/i,'Wrong window source was reported as active');
  console.log('PASS: application window rejected when entire desktop monitor was requested');
  return;
 }
 assert.equal(element('recordBtn').disabled,false,'Full-screen capture must enable Record after preview');
 assert.match(element('status').textContent,/Entire desktop preview active/i,'Successful desktop capture was replaced by a permission warning');
 // A separate Window mode must request exactly window sources.
 element('mode').value='window';
 await fire('mode','change');
 await click('previewBtn');
 assert.equal(lastRequestedSurface,'window','Window capture mode must request the native window picker');
 assert.match(element('status').textContent,/Window preview active/i);
 element('mode').value='full';
 await fire('mode','change');
 // Camera independent of screen capture
 element('mode').value='camera';
 await fire('mode','change');
 await click('testCam');
 assert.match(element('cameraStatus').textContent,/active/i);
 await click('previewBtn');
 assert.equal(element('recordBtn').disabled,false,'Camera only: Record remained disabled');
 await click('recordBtn');
 assert.equal(element('stopBtn').disabled,false,'Camera only: Stop remained disabled');
 await click('stopBtn');
 assert.match(element('status').textContent,/saved/i);
 assert.equal(exportCount,1);
 // Verify quick-record can start a second camera recording without screen enumeration.
 await click('quickRecord');
 assert.equal(element('stopBtn').disabled,false,'Quick record did not start');
 await click('stopBtn');
 assert.equal(exportCount,2);
 await click('copyDiagnostics');
 assert.match(copiedReport,/ChelRecord Studio diagnostic report/);
 // Region can be selected on the actual desktop BEFORE preview exists.
 element('mode').value='region';
 await fire('mode','change');
 assert.equal(element('recordBtn').disabled,false,'Record should be clickable before preview');
 assert.equal(element('areaControl').classList!==null,true);
 await click('recordBtn');
 assert.equal(lastRequestedSurface,'monitor','A custom region must be cropped from a full monitor, not an application window');
 assert.equal(regionPickCount,1,'Record should invoke full-desktop region selector');
 assert.match(element('areaSummary').textContent,/Area selected/);
 assert.equal(element('stopBtn').disabled,false,'Record did not start after selecting an area');
 await click('stopBtn');
 assert.equal(exportCount,3);
 // Dedicated area button also opens the OS overlay.
 await click('selectAreaBtn');
 assert.equal(regionPickCount,2,'Area button did not open the selector');
 assert.ok(writeCount>=3,'Recording chunks were not written');
 assert.ok(permissionChecks>=1,'Camera access was not requested');
 console.log('PASS: '+(useNativePicker?'macOS native picker':'custom source picker')+(screenStatusDenied?' with stale OS denied status':'')+', real capture readiness, camera-only preview/record/stop, region gating, MP4 writer controller');
}
test().catch(e=>{console.error(e);process.exitCode=1});
