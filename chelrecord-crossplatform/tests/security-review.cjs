'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const files=['main.cjs','preload.cjs','renderer.js','index.html','region-picker.html'];
const content=Object.fromEntries(files.map(name=>[name,fs.readFileSync(path.join(root,name),'utf8')]));
const source=files.map(n=>content[n]).join('\n');
const forbidden=[
 [/\brequire\(['"](?:https?|net|tls|dgram|axios|node:net|node:https?|node:tls)['"]\)/,'Unexpected network module'],
 [/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/,'Unexpected network call'],
 [/\b(?:eval|Function)\s*\(/,'Dynamic JS evaluation'],
 [/\b(?:execSync|execFileSync|exec)\s*\(/,'Arbitrary command execution'],
 [/\bshell\s*:\s*true\b/,'Shell invocation enabled'],
 [/https?:\/\/(?!www\.apple\.com\/DTDs)/,'Unexpected web endpoint'],
];
for(const [regex,msg] of forbidden)assert.ok(!regex.test(source),msg+': '+String(source.match(regex)?.[0]));
const main=content['main.cjs'];
for(const requirement of [
 'contextIsolation:true','nodeIntegration:false','sandbox:true','webSecurity:true',
 "windowRef.webContents.setWindowOpenHandler(()=>({action:'deny'}))",
 "windowRef.webContents.on('will-navigate',event=>event.preventDefault());",
 'requireOwner(e)','ffmpegExecutable()',
 'nativeMacBinary()','desktop:pick-region'
])assert.ok(main.includes(requirement),'Required security/capture check missing: '+requirement);
assert.ok(/if\(!fs\.existsSync\(bin\)\)/.test(main),'FFmpeg executable existence verification missing');
assert.ok(/let bin=require\('ffmpeg-static'\)/.test(main),'Unexpected third-party encoding binary');
const pre=content['preload.cjs'];
assert.ok(pre.includes('contextBridge.exposeInMainWorld'),'Missing isolated preload bridge');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert.equal(pkg.build.mac.hardenedRuntime,true,'macOS hardened runtime must be enabled');
assert.equal(pkg.build.asar,true,'Electron app sources must be packed in ASAR');
assert.equal(Object.keys(pkg.dependencies).join(','),'ffmpeg-static','Unexpected production dependency; review it before distribution');
console.log('PASS: reviewed first-party capture code has no outbound networking, remote code execution, dynamic evaluation, or third-party integrations.');
console.log('PASS: isolated renderer; OS permissions; local video output; expected local FFmpeg and native capture modules.');
console.log('This static source check is NOT an anti-malware scan of bundled binaries.');
