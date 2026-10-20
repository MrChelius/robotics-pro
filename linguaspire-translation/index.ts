type LangCode='en'|'ru'|'zh'|'ja'|'ko'|'de'|'fr'|'it';
const PORT=Number(Bun.env.PORT||5000);
const languageNames:Record<LangCode,string>={
  en:'English',ru:'Russian',zh:'Chinese',ja:'Japanese',ko:'Korean',de:'German',fr:'French',it:'Italian'
};
const supported=new Set<LangCode>(Object.keys(languageNames) as LangCode[]);
const cache=new Map<string,{v:string,e:number}>();
const jsonHeaders={'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*','access-control-allow-headers':'content-type','access-control-allow-methods':'GET,POST,OPTIONS','x-content-type-options':'nosniff'};

function json(data:any,status=200){return new Response(JSON.stringify(data),{status,headers:jsonHeaders})}
function cacheGet(k:string){const x=cache.get(k);if(!x)return null;if(x.e<Date.now()){cache.delete(k);return null}return x.v}
function cacheSet(k:string,v:string){if(cache.size>1500)cache.delete(cache.keys().next().value);cache.set(k,{v,e:Date.now()+10*60_000})}
function detectSource(text:string):LangCode{
  const t=' '+text.toLowerCase()+' ';
  if(/[а-яё]/i.test(text))return 'ru';
  if(/[ぁ-ゟ゠-ヿ]/.test(text))return 'ja';
  if(/[가-힣]/.test(text))return 'ko';
  if(/[一-龯]/.test(text))return 'zh';
  const scores:Record<string,string[]>={de:[' der ',' die ',' das ',' und ',' ist ',' ich ',' nicht ',' wie ',' hallo ',' danke '],fr:[' le ',' la ',' les ',' et ',' est ',' je ',' pas ',' comment ',' bonjour ',' merci '],it:[' il ',' la ',' che ',' e ',' è ',' io ',' non ',' come ',' ciao ',' grazie '],en:[' the ',' and ',' is ',' i ',' not ',' how ',' hello ',' thanks ',' you ',' are ']};
  let best:LangCode='en',score=0;
  for(const [lang,words] of Object.entries(scores)){const s=words.reduce((n,w)=>n+(t.includes(w)?1:0),0);if(s>score){best=lang as LangCode;score=s}}
  return best;
}
function splitText(text:string,max=900){
  if(text.length<=max)return [text];
  const out:string[]=[];let rest=text.trim();
  while(rest&&out.length<8){
    if(rest.length<=max){out.push(rest);break}
    let cut=rest.lastIndexOf(' ',max);
    const p=Math.max(rest.lastIndexOf('. ',max),rest.lastIndexOf('? ',max),rest.lastIndexOf('! ',max),rest.lastIndexOf('。',max),rest.lastIndexOf('！',max),rest.lastIndexOf('？',max));
    if(p>Math.floor(max*.45))cut=p+1;
    if(cut<Math.floor(max*.35))cut=max;
    out.push(rest.slice(0,cut).trim());rest=rest.slice(cut).trim();
  }
  return out.filter(Boolean);
}
async function withTimeout(url:string,ms:number,headers?:Record<string,string>){
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),ms);
  try{return await fetch(url,{signal:ctrl.signal,headers})}finally{clearTimeout(timer)}
}
async function googleChunk(text:string,source:LangCode,target:LangCode){
  const u=new URL('https://translate.googleapis.com/translate_a/single');
  u.searchParams.set('client','gtx');u.searchParams.set('sl',source);u.searchParams.set('tl',target);u.searchParams.set('dt','t');u.searchParams.set('q',text);
  try{
    const r=await withTimeout(u.toString(),2200,{'user-agent':'LinguaSpire-Translation/3.0'});
    if(!r.ok)return null;
    const d:any=await r.json();
    const out=Array.isArray(d?.[0])?d[0].map((x:any)=>Array.isArray(x)?String(x[0]||''):'').join('').trim():'';
    return out||null;
  }catch{return null}
}
const mmCode=(c:LangCode)=>c==='zh'?'zh-CN':c;
async function memoryChunk(text:string,source:LangCode,target:LangCode){
  const u=new URL('https://api.mymemory.translated.net/get');
  u.searchParams.set('q',text);u.searchParams.set('langpair',mmCode(source)+'|'+mmCode(target));
  try{
    const r=await withTimeout(u.toString(),2600,{'user-agent':'LinguaSpire-Translation/3.0'});
    if(!r.ok)return null;
    const d:any=await r.json();
    if(Number(d?.responseStatus||200)>=400)return null;
    const out=typeof d?.responseData?.translatedText==='string'?d.responseData.translatedText.trim():'';
    return out&&out.toLowerCase()!==text.toLowerCase()?out:null;
  }catch{return null}
}
async function translateText(text:string,source:LangCode,target:LangCode){
  if(source===target)return {translatedText:text,provider:'identity',latencyMs:0};
  const key=source+'|'+target+'|'+text;const hit=cacheGet(key);
  if(hit)return {translatedText:hit,provider:'cache',latencyMs:0};
  const started=Date.now();const chunks=splitText(text);
  let parts=await Promise.all(chunks.map(x=>googleChunk(x,source,target)));
  let provider='google';
  if(parts.some(x=>!x)){parts=await Promise.all(chunks.map(x=>memoryChunk(x,source,target)));provider='mymemory'}
  if(parts.some(x=>!x))return {translatedText:'',provider,error:'TRANSLATION_UNAVAILABLE',latencyMs:Date.now()-started};
  const out=(parts as string[]).join(' ').trim();cacheSet(key,out);
  return {translatedText:out,provider,latencyMs:Date.now()-started};
}

Bun.serve({
  port:PORT,
  hostname:'0.0.0.0',
  async fetch(req){
    const url=new URL(req.url);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:jsonHeaders});
    if(url.pathname==='/health')return json({ok:true,service:'LinguaSpire translation',version:'3.0.0',languages:[...supported],memoryMode:'stateless'});
    if(url.pathname==='/languages'){
      const list=[...supported].map(code=>({code,name:languageNames[code],targets:[...supported].filter(x=>x!==code)}));
      return json(list);
    }
    if(url.pathname==='/translate'&&req.method==='POST'){
      try{
        const b:any=await req.json();const raw=String(b?.q??'').trim().slice(0,4000);
        const target=String(b?.target||'en') as LangCode;let source=String(b?.source||'auto');
        if(!raw)return json({translatedText:'',provider:'identity',latencyMs:0});
        if(!supported.has(target))return json({error:'UNSUPPORTED_TARGET'},400);
        if(source==='auto')source=detectSource(raw);
        if(!supported.has(source as LangCode))return json({error:'UNSUPPORTED_SOURCE'},400);
        const result=await translateText(raw,source as LangCode,target);
        return json(result,result.error?503:200);
      }catch{return json({error:'BAD_REQUEST'},400)}
    }
    if(url.pathname==='/detect'&&req.method==='POST'){
      try{const b:any=await req.json();return json([{language:detectSource(String(b?.q||'')),confidence:90}])}catch{return json({error:'BAD_REQUEST'},400)}
    }
    return json({error:'NOT_FOUND'},404);
  }
});
console.log('LinguaSpire translation 3.0 listening on',PORT);
