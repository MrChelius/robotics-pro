'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const ffmpeg=require('ffmpeg-static');
const {argsForCameraPiP}=require('../native-pip.cjs');
assert.ok(ffmpeg && fs.existsSync(ffmpeg),'Missing FFmpeg executable');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'chelrecord-pip-test-'));
const desktop=path.join(dir,'desktop.mp4'),camera=path.join(dir,'camera.mp4'),output=path.join(dir,'with-camera.mp4');
function run(args,encoding='utf8'){
 const res=spawnSync(ffmpeg,['-hide_banner','-loglevel','error',...args],{encoding,maxBuffer:20*1024*1024,timeout:45000});
 if(res.status!==0)throw new Error('FFmpeg failed: '+String(res.stderr).slice(-5000));
 return res.stdout;
}
function pixel(buffer,x,y,w=640){
 const i=(y*w+x)*3;return [...buffer.subarray(i,i+3)];
}
try{
 run(['-y','-f','lavfi','-i','color=c=blue:s=640x360:r=15','-frames:v','18','-c:v','libx264','-pix_fmt','yuv420p',desktop]);
 run(['-y','-f','lavfi','-i','color=c=red:s=160x120:r=15','-frames:v','18','-c:v','libx264','-pix_fmt','yuv420p',camera]);
 const options={position:'bottom-right',size:24};
 const args=argsForCameraPiP(desktop,camera,output,options);
 assert.ok(args.includes('0:a?'),'Optional microphone mapping must not fail for silent desktop');
 run(args);
 assert.ok(fs.statSync(output).size>2000,'Merged MP4 is empty');
 const raw=run(['-ss','0.2','-i',output,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],null);
 assert.ok(Buffer.isBuffer(raw),'No decoded video frame');
 const background=pixel(raw,40,45);
 let redCount=0,minX=640,maxX=0,minY=360,maxY=0;
 for(let y=0;y<360;y+=4)for(let x=0;x<640;x+=4){
  const [r,g,b]=pixel(raw,x,y);
  if(r>140&&r>b*1.5&&r>g*1.5){redCount++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
 }
 console.log('Pixel-level camera detection:',{redCount,bounds:[minX,minY,maxX,maxY],bottomRight:pixel(raw,540,275)});
 assert.ok(background[2]>160&&background[0]<90,'Desktop blue pixels were lost: '+background);
 assert.ok(redCount>200,'Camera red PiP is absent from the final MP4');
 assert.ok(minX>300&&minY>140,'Camera PiP is not in the expected lower-right portion of desktop');
 assert.throws(()=>argsForCameraPiP(desktop,camera,output,{position:'bad'}));
 assert.throws(()=>argsForCameraPiP(desktop,camera,output,{size:100}));
 console.log('PASS: FFmpeg encoded a valid H264 MP4 with correct desktop (blue) and PiP webcam (red) pixels');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
