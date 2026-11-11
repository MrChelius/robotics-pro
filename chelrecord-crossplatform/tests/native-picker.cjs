'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const main=fs.readFileSync(path.join(__dirname,'../main.cjs'),'utf8');

async function exercise(platform,darwinVersion,expectedNative){
  const ipc=new Map(),ipcEvents=new Map();
  let pickerOptions=null,enumerations=0,windowRef=null,overlayWindow=null;
  class MockWindow{
    constructor(){
      this.webContents={mainFrame:{},setWindowOpenHandler(){},on(){}};
      if(windowRef)overlayWindow=this;else windowRef=this;
    }
    loadFile(){return Promise.resolve()}
    on(){}
    show(){}
    focus(){}
    setAlwaysOnTop(){}
    isDestroyed(){return false}
    close(){}
  }
  const fakeApp={
    whenReady(){return Promise.resolve()},
    setAppUserModelId(){},
    getPath(){return '/tmp'},
    on(){},
    quit(){},
    relaunch(){}
  };
  const desktopCapturer={async getSources(options){
    enumerations++;
    if(expectedNative)throw Error('Failed to get sources');
    const kind=options.types[0];
    return [{id:kind+':0:0',name:kind==='screen'?'Display':'Application',thumbnail:{isEmpty:()=>true}}];
  }};
  const session={defaultSession:{
    setPermissionRequestHandler(){},
    setPermissionCheckHandler(){},
    setDisplayMediaRequestHandler(_handler,options){pickerOptions=options}
  }};
  const electron={
    app:fakeApp, BrowserWindow:MockWindow, desktopCapturer,session,
    ipcMain:{handle(name,fn){ipc.set(name,fn)},on(name,fn){ipcEvents.set(name,fn)},removeListener(name,fn){if(ipcEvents.get(name)===fn)ipcEvents.delete(name)}},
    screen:{getCursorScreenPoint(){return {x:30,y:50}},getDisplayNearestPoint(){return {id:9,bounds:{x:0,y:0,width:1440,height:900}}}},
    systemPreferences:{getMediaAccessStatus(){return 'granted'}},
    dialog:{showSaveDialog:async()=>({canceled:true})},
    shell:{openExternal:async()=>{},showItemInFolder(){}}
  };
  const context={
    require(id){
      if(id==='electron')return electron;
      if(id==='node:os')return {release:()=>darwinVersion};
      if(id==='ffmpeg-static')return '/tmp/fake-ffmpeg';
      return require(id);
    },
    process:{platform}, __dirname:path.resolve(__dirname,'..'), console, Buffer
  };
  vm.runInNewContext(main,context,{filename:'main.cjs',timeout:4000});
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(windowRef,'App failed to create its window');
  assert.equal(pickerOptions?.useSystemPicker,expectedNative,'Incorrect screen-picker configuration');
  const list=await ipc.get('desktop:list')({sender:windowRef.webContents});
  assert.equal(Boolean(list.systemPicker),expectedNative,'Incorrect source listing mode');
  if(expectedNative){
    assert.deepEqual(Array.from(list.items),[],'Native picker should not return custom sources');
    assert.equal(enumerations,0,'Native macOS picker tried broken desktopCapturer.getSources');
  }else{
    assert.equal(list.items.length,1,'Non-native picker did not enumerate sources');
    assert.equal(enumerations,1,'Unexpected desktop source query count');
  }
  const windowItems=await ipc.get('desktop:list')({sender:windowRef.webContents},'window');
  if(expectedNative){
    assert.equal(windowItems.systemPicker,true);
    assert.equal(enumerations,0);
  }else{
    assert.equal(windowItems.items.length,1);
    assert.ok(windowItems.items[0].id.startsWith('window:'));
    assert.equal(enumerations,2);
  }
  // The area picker is independent of screen capture and never calls getSources().
  const before=enumerations;
  const pending=ipc.get('desktop:pick-region')({sender:windowRef.webContents});
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(overlayWindow,'Desktop region overlay was not created');
  assert.equal(typeof ipcEvents.get('region:done'),'function');
  ipcEvents.get('region:done')({sender:overlayWindow.webContents},{x:.1,y:.2,w:.45,h:.4});
  const selected=await pending;
  assert.equal(selected.displayId,9);
  assert.equal(selected.region.w,.45);
  assert.equal(enumerations,before,'Area picker unexpectedly queried desktopCapturer');
}
(async()=>{
  await exercise('darwin','24.6.0',true);
  await exercise('darwin','25.1.0',true);
  await exercise('darwin','23.4.0',false);
  await exercise('win32','10.0.22631',false);
  console.log('PASS: native macOS picker avoids desktopCapturer; fallback works on old macOS and Windows');
})().catch(e=>{console.error(e);process.exitCode=1});
