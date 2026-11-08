'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const ffmpeg=require('ffmpeg-static');
const assertOk=(result,description)=>{
 if(result.error||result.status!==0){
  throw new Error(description+': '+String(result.error||result.stderr||result.stdout));
 }
};
assert.ok(ffmpeg,'FFmpeg binary was not resolved');
assert.ok(fs.existsSync(ffmpeg),'FFmpeg binary does not exist: '+ffmpeg);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'chelrecord-test-'));
const video=path.join(dir,'test.mp4'),noAudio=path.join(dir,'silent.mp4');
try{
 let run=spawnSync(ffmpeg,[
  '-hide_banner','-loglevel','error','-y',
  '-f','lavfi','-i','testsrc2=size=320x180:rate=10',
  '-f','lavfi','-i','sine=frequency=440:sample_rate=44100',
  '-t','1','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',
  '-c:a','aac','-b:a','96k','-movflags','+faststart',video
 ],{encoding:'utf-8',timeout:90000,maxBuffer:2*1024*1024});
 assertOk(run,'H.264/AAC encoding');
 assert.ok(fs.statSync(video).size>5000,'Recorded file is unexpectedly small');
 run=spawnSync(ffmpeg,['-hide_banner','-i',video,'-f','null','-'],{encoding:'utf-8',timeout:90000,maxBuffer:2*1024*1024});
 assertOk(run,'MP4 decode');
 assert.match(run.stderr,/Video:\s+h264/,'Missing H.264 track');
 assert.match(run.stderr,/Audio:\s+aac/,'Missing AAC track');
 run=spawnSync(ffmpeg,[
  '-hide_banner','-loglevel','error','-y','-f','lavfi','-i',
  'testsrc2=size=320x180:rate=10','-t','0.5','-c:v','libx264',
  '-pix_fmt','yuv420p','-movflags','+faststart',noAudio
 ],{encoding:'utf-8',timeout:90000,maxBuffer:2*1024*1024});
 assertOk(run,'Silent MP4 encoding');
 assert.ok(fs.statSync(noAudio).size>1000,'Silent recording is unexpectedly small');
 console.log('PASS: FFmpeg H.264/AAC MP4 encode+decode and silent video on',process.platform,process.arch);
}finally{
 fs.rmSync(dir,{recursive:true,force:true});
}
