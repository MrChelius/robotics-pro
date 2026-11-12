'use strict';
/**
 * FFmpeg PiP composition for ChelRecord's macOS ScreenCaptureKit backend.
 * Camera video is captured separately by the existing Chromium camera device.
 * The original desktop file is never replaced until successful composition.
 */
const assert=require('node:assert/strict');

const positions=Object.freeze({
 'bottom-right':['main_w-overlay_w-24','main_h-overlay_h-24'],
 'bottom-left':['24','main_h-overlay_h-24'],
 'top-right':['main_w-overlay_w-24','24'],
 'top-left':['24','24']
});
function argsForCameraPiP(desktop,camera,out,opts={}){
 assert.equal(typeof desktop,'string');
 assert.equal(typeof camera,'string');
 assert.equal(typeof out,'string');
 if(!desktop||!camera||!out||desktop===out||camera===out)throw new Error('Invalid PiP inputs');
 const position=opts.position||'bottom-right';
 if(!Object.hasOwn(positions,position))throw new Error('Invalid camera PiP position');
 const size=Number(opts.size||24);
 if(![18,24,32].includes(size))throw new Error('Invalid camera PiP size');
 const [x,y]=positions[position];
 const ratio=(size/100).toFixed(2);
 const filter=[
  '[1:v]fps=30,setpts=PTS-STARTPTS,',
  'scale2ref=w=trunc(main_w*',ratio,'/2)*2:h=trunc(ow/a/2)*2[cam][base];',
  '[base][cam]overlay=x=',x,':y=',y,
  ':shortest=0:eof_action=repeat,format=yuv420p[v]'
 ].join('');
 return ['-hide_banner','-y','-loglevel','error','-i',desktop,'-i',camera,
   '-filter_complex',filter,'-map','[v]','-map','0:a?','-c:v','libx264',
   '-preset','veryfast','-crf','22','-pix_fmt','yuv420p',
   '-c:a','aac','-b:a','160k','-movflags','+faststart','-max_muxing_queue_size','2048',out];
}
module.exports={argsForCameraPiP};
