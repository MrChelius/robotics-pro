'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../renderer.js'),'utf8');
const useNativePicker=process.argv.includes('native');
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
const ids=['screen','captureVideo','cameraTest','cameraOverlay','region','selection',
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
let writeCount=0,exportCount=0,permissionChecks=0;
const api={
 diagnostics:async()=>({platform:'darwin',camera:'granted',microphone:'granted',screen:'granted'}),
 listSources:async()=>useNativePicker?{selectedId:null,systemPicker:true,items:[]}:
  {selectedId:'screen:0:0',systemPicker:false,items:[{id:'screen:0:0',name:'Desktop',thumbnail:''}]},
 chooseSource:async()=>true,requestPermission:async()=>{permissionChecks++;return 'granted'},
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
 getDisplayMedia:async()=>fakeStream('screen'),
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
  assert.match(element('sourceHint').textContent,/macOS will ask/i);
 }else assert.ok(element('sourceList').children.length,'Desktop source listing did not render');
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
 // Screen region must be selected before enabling Record
 element('mode').value='region';
 await fire('mode','change');
 await click('previewBtn');
 assert.equal(element('recordBtn').disabled,true,'Region recording enabled before selection');
 await fire('region','pointerdown',{clientX:25,clientY:25,pointerId:1});
 await fire('region','pointermove',{clientX:250,clientY:180});
 await fire('region','pointerup',{});
 assert.equal(element('recordBtn').disabled,false,'Region recording remains disabled after selection');
 await click('recordBtn');
 await click('stopBtn');
 assert.equal(exportCount,2);
 assert.ok(writeCount>=2,'Recording chunks were not written');
 assert.ok(permissionChecks>=1,'Camera access was not requested');
 console.log('PASS: '+(useNativePicker?'macOS native picker':'custom source picker')+', camera-only preview/record/stop, region gating, MP4 writer controller');
}
test().catch(e=>{console.error(e);process.exitCode=1});
