'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),sharp=require('sharp');
(async()=>{
 const dir=path.join(__dirname,'build');fs.mkdirSync(dir,{recursive:true});
 const src=path.join(dir,'icon.svg');const out=path.join(dir,'icon.png');
 await sharp(src).resize(1024,1024).png().toFile(out);
 if(process.platform==='darwin'){
  const iconset=path.join(dir,'icon.iconset');fs.mkdirSync(iconset,{recursive:true});
  for(const size of [16,32,128,256,512]){
   await sharp(src).resize(size,size).png().toFile(path.join(iconset,'icon_'+size+'x'+size+'.png'));
   await sharp(src).resize(size*2,size*2).png().toFile(path.join(iconset,'icon_'+size+'x'+size+'@2x.png'));
  }
  cp.execFileSync('iconutil',['-c','icns',iconset,'-o',path.join(dir,'icon.icns')]);
 }
 console.log('Generated ChelRecord Aurora icons');
})().catch(e=>{console.error(e);process.exitCode=1});
