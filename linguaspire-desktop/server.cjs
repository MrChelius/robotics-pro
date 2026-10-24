'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const FRONTEND_290='https://frontend-v29-live-production.up.railway.app';
const ROOM_API='https://room-api-production-881c.up.railway.app';
const TRANSLATION='https://translation-production-3882.up.railway.app';
const ASR='https://stt-production-4262.up.railway.app';
const page=fs.readFileSync(path.join(__dirname,'index.html'));
const mime='text/html; charset=utf-8';
function respond(res,code,data,contentType='application/json; charset=utf-8'){
 res.writeHead(code,{'Content-Type':contentType,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
}
async function proxy(req,res,target){
 const controller=new AbortController();const to=setTimeout(()=>controller.abort(),30000);
 try{
  const chunks=[];let total=0;
  for await (const chunk of req){total+=chunk.length;if(total>12*1024*1024){respond(res,413,JSON.stringify({error:'PAYLOAD_TOO_LARGE'}));return}chunks.push(chunk)}
  const data=Buffer.concat(chunks);
  const headers={};
  if(req.headers['content-type'])headers['content-type']=req.headers['content-type'];
  if(req.headers.authorization)headers.authorization=req.headers.authorization;
  const upstream=await fetch(target,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:data,signal:controller.signal,redirect:'manual'});
  const bytes=Buffer.from(await upstream.arrayBuffer());
  const ctype=upstream.headers.get('content-type')||'application/json';
  respond(res,upstream.status,bytes,ctype);
 }catch(e){respond(res,502,JSON.stringify({error:'SERVICE_UNAVAILABLE',detail:String(e?.message||e).slice(0,120)}))}finally{clearTimeout(to)}
}
async function fallbackTranslation(req,res){
 const chunks=[];for await(const c of req){chunks.push(c);if(chunks.reduce((a,b)=>a+b.length,0)>100000){respond(res,413,JSON.stringify({error:'TEXT_TOO_LONG'}));return}}
 const data=Buffer.concat(chunks);let body;try{body=JSON.parse(data.toString('utf8'))}catch{respond(res,400,JSON.stringify({error:'INVALID_JSON'}));return}
 const payload=JSON.stringify({q:body.q,source:body.source||'auto',target:body.target||'en',format:'text'});
 const calls=[FRONTEND_290+'/api/translate',TRANSLATION+'/translate'];
 for(const url of calls){try{const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),6500);let r;try{r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:payload,signal:ctl.signal})}finally{clearTimeout(tm)}
 const d=await r.json();if(r.ok&&typeof d.translatedText==='string'&&d.translatedText.trim()){respond(res,200,JSON.stringify({translatedText:d.translatedText,source:d.source||body.source||'auto',upstream:url===calls[0]?'frontend':'translation'}));return}}
 catch(e){console.warn('Translation backend failed',e.message)}}
 respond(res,503,JSON.stringify({error:'TRANSLATION_UNAVAILABLE',translatedText:''}));
}
async function handler(req,res){
 const origin=req.headers.origin;
 const local='http://127.0.0.1:'+String(req.headers.host||'').split(':').pop();
 if(origin&&origin!==local){respond(res,403,JSON.stringify({error:'ORIGIN_NOT_ALLOWED'}));return}
 if(!String(req.headers.host||'').startsWith('127.0.0.1:')){respond(res,403,JSON.stringify({error:'HOST_NOT_ALLOWED'}));return}
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(req.method==='OPTIONS'){res.writeHead(204,{'Allow':'GET,POST,OPTIONS'});res.end();return}
 if((req.method==='GET'||req.method==='HEAD')&&(pathname==='/'||pathname==='/index.html')){respond(res,200,req.method==='HEAD'?'':page,mime);return}
 if(pathname==='/health'){respond(res,200,JSON.stringify({ok:true,service:'LinguaSpire Desktop',version:'2.9.2',backend:'remote'}));return}
 if(pathname==='/api/version'){respond(res,200,JSON.stringify({product:'LinguaSpire',version:'2.9.2',channel:'desktop'}));return}
 if(pathname==='/api/translate'&&req.method==='POST'){await fallbackTranslation(req,res);return}
 if(pathname.startsWith('/api/')&&(['asr','net/room','net/stt','net/translate','net/media'].includes(pathname.slice(5)))){await proxy(req,res,FRONTEND_290+pathname);return}
 if(pathname.startsWith('/v1/')){await proxy(req,res,ROOM_API+req.url);return}
 if(pathname.startsWith('/room/')){res.writeHead(302,{'Location':'/?room='+encodeURIComponent(pathname.slice(6))});res.end();return}
 respond(res,404,JSON.stringify({error:'NOT_FOUND'}));
}
async function startLocalServer(){return new Promise((resolve,reject)=>{
 const server=http.createServer((req,res)=>{handler(req,res).catch(e=>respond(res,500,JSON.stringify({error:'DESKTOP_INTERNAL_ERROR'})))});
 server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve({server,url:'http://127.0.0.1:'+server.address().port+'/'}));
})}
module.exports={startLocalServer};
if(require.main===module){startLocalServer().then(({url})=>console.log('LinguaSpire 2.9.2 local '+url))}