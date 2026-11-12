'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const icon=fs.readFileSync(path.join(__dirname,'..','build','icon.svg'),'utf8');
const picker=fs.readFileSync(path.join(__dirname,'..','region-picker.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate element IDs in interface');
for(const id of ['mode','desktopControls','sourceList','sourceHint','selectAreaBtn','areaSummary',
'camera','cameraTest','testCam','stopCam','mic','testMic','stopMic','meterBar',
'previewBtn','recordBtn','quickRecord','stopBtn','cancelBtn','status','copyErrorQuick',
'openFile','stage','screen','region','selection','cameraOverlay','timer','state',
'permissionStatus','checkPermissions','copyDiagnostics']){
 assert.ok(ids.includes(id),'Missing working capture control: '+id);
}
assert.ok(html.includes('grid-template-columns:318px minmax(0,1fr)'), 'Studio workspace columns unavailable');
assert.ok(html.indexOf('class="panel viewport-panel"')<html.indexOf('class="panel action-panel"'), 'Recording transport must be beneath live preview');
assert.match(html,/#recordBtn\{[^}]*background:var\(--red\)/,'Primary action must be prominent but restrained');
assert.match(html,/<option value="full">[^<]*Entire desktop/i);
assert.match(html,/<option value="window">[^<]*Single application window/i);
assert.match(html,/<option value="region">[^<]*Custom desktop region/i);
assert.match(html,/<option value="camera">[^<]*Camera only/i);
assert.match(html,/<details class="advanced">/,'Advanced secondary capture options should be collapsed');
assert.ok(!html.includes('Reimagined.')&&!html.includes('Beautifully.'),'Decorative marketing copy should not occupy work area');
assert.ok(!/#(?:d448f7|f044a2|21e5ff|c479ff)/i.test(html),'Previous neon palette still present');
assert.ok(!/#(?:d238e6|5a5dff|04c5ec)/i.test(icon),'Old neon launcher icon still present');
assert.ok(!picker.includes('#55e2ff'),'Region picker has old neon palette');
console.log('PASS: Graphite UI hierarchy, restrained palette, desktop/window/area modes, 30+ stable functional controls, original launcher icon');
