
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Redis from 'ioredis';
import { AccessToken } from 'livekit-server-sdk';

const app = new Hono();
const allowedOrigins=new Set([
  Bun.env.APP_URL,
  'https://frontend-production-802b.up.railway.app',
  'https://linguaspire-app.netlify.app'
].filter(Boolean) as string[]);
app.use('*', async (c,next)=>{
  await next();
  c.header('X-Content-Type-Options','nosniff');
  c.header('Referrer-Policy','no-referrer');
  c.header('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  c.header('Cache-Control','no-store');
});
app.use('*', cors({
  origin: (origin) => !origin ? '' : (allowedOrigins.has(origin) ? origin : ''),
  allowMethods: ['GET','POST','OPTIONS'],
  allowHeaders: ['Content-Type','Authorization']
}));

const redis = new Redis(Bun.env.REDIS_URL || 'redis://redis.railway.internal:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 2
});
await redis.connect();

const now = () => Math.floor(Date.now() / 1000);
const rid = () => 'LS-' + crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase();
const secret = () => crypto.randomUUID().replace(/-/g,'') + crypto.randomUUID().replace(/-/g,'');
const sha = async (s:string) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
};
async function hashRoomPassword(password:string){
  if(!password) return '';
  return await Bun.password.hash(password,{algorithm:'argon2id'});
}
async function verifyRoomPassword(password:string,stored:string){
  if(!stored) return true;
  if(stored.startsWith('$argon2')) return await Bun.password.verify(password,stored);
  return (await sha(password))===stored;
}
const roomKey = (id:string) => `room:${id}`;
const reqKey = (id:string) => `room:${id}:requests`;
const hostKey = (id:string) => `room:${id}:host`;
const cameraPairKey = (code:string) => `camera-pair:${code}`;
const cameraPairAttemptKey = (code:string) => `camera-pair-attempt:${code}`;
const cameraCode = () => { const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let out=''; const bytes=crypto.getRandomValues(new Uint8Array(6)); for(const b of bytes) out+=chars[b%chars.length]; return out; };
const supportedLanguages = new Set(['auto','en','ru','zh','ja','ko','de','fr','it']);
const clientIp = (c:any) => String(c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown').split(',')[0].trim().slice(0,96);
async function rateLimit(bucket:string, identity:string, limit:number, windowSeconds:number) {
  const digest = await sha(identity || 'unknown');
  const key = `rl:${bucket}:${digest}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, windowSeconds);
  const ttl = Math.max(1, await redis.ttl(key));
  return { ok:n <= limit, remaining:Math.max(0,limit-n), retryAfter:ttl };
}
function cleanName(v:any,fallback='Guest'){return String(v||fallback).replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim().slice(0,80)||fallback}
function cleanTitle(v:any){return String(v||'LinguaSpire Meeting').replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim().slice(0,120)||'LinguaSpire Meeting'}

async function requireHost(id:string, auth:string) {
  if (!auth) return false;
  const expected = await redis.get(hostKey(id));
  return !!expected && (await sha(auth)) === expected;
}

app.get('/health', async c => {
  let redisOk=false;
  try { redisOk=(await redis.ping())==='PONG'; } catch {}
  const livekitConfigured=!!(Bun.env.LIVEKIT_API_KEY&&Bun.env.LIVEKIT_API_SECRET&&Bun.env.LIVEKIT_URL);
  return c.json({ok:redisOk&&livekitConfigured,service:'LinguaSpire room-api',version:'2.9.0',redis:redisOk?'ok':'down',media:livekitConfigured?'configured':'missing',time:new Date().toISOString()},redisOk&&livekitConfigured?200:503);
});

app.post('/v1/rooms', async c => {
  const rl=await rateLimit('create-room',clientIp(c),20,3600);
  if(!rl.ok){c.header('Retry-After',String(rl.retryAfter));return c.json({error:'RATE_LIMITED'},429)}
  const body = await c.req.json().catch(()=>({}));
  const id = rid();
  const hostSecret = secret();
  const expiresIn = Math.max(900, Math.min(Number(body.expiresInSeconds || 86400), 604800));
  const passwordHash = body.password ? await hashRoomPassword(String(body.password)) : '';
  const expiresAt = now() + expiresIn;

  await redis.hset(roomKey(id), {
    id,
    title:cleanTitle(body.title),
    hostName:cleanName(body.hostName,'Host'),
    passwordHash,
    waitingRoom:body.waitingRoom !== false ? '1' : '0',
    createdAt:String(now()),
    expiresAt:String(expiresAt)
  });
  await redis.set(hostKey(id), await sha(hostSecret), 'EX', expiresIn);
  await redis.expire(roomKey(id), expiresIn);
  await redis.expire(reqKey(id), expiresIn);

  return c.json({
    id,
    hostSecret,
    expiresAt,
    waitingRoom:body.waitingRoom !== false,
    inviteUrl:`${Bun.env.APP_URL || 'https://linguaspire-app.netlify.app'}/room/${id}`
  }, 201);
});

app.get('/v1/rooms/:id', async c => {
  const room = await redis.hgetall(roomKey(c.req.param('id')));
  if (!room?.id) return c.json({error:'ROOM_NOT_FOUND'},404);
  if (Number(room.expiresAt) <= now()) return c.json({error:'ROOM_EXPIRED'},410);
  return c.json({
    id:room.id,
    title:room.title,
    hostName:room.hostName,
    waitingRoom:room.waitingRoom === '1',
    expiresAt:Number(room.expiresAt),
    passwordRequired:!!room.passwordHash
  });
});

app.post('/v1/rooms/:id/join', async c => {
  const id = c.req.param('id');
  const rl=await rateLimit('join:'+id,clientIp(c),30,600);
  if(!rl.ok){c.header('Retry-After',String(rl.retryAfter));return c.json({error:'RATE_LIMITED'},429)}
  const room = await redis.hgetall(roomKey(id));
  if (!room?.id) return c.json({error:'ROOM_NOT_FOUND'},404);
  if (Number(room.expiresAt) <= now()) return c.json({error:'ROOM_EXPIRED'},410);

  const body = await c.req.json().catch(()=>({}));
  if (room.passwordHash && !(await verifyRoomPassword(String(body.password || ''), room.passwordHash))) {
    return c.json({error:'INVALID_PASSWORD'},401);
  }

  const requestId = crypto.randomUUID();
  const request = {
    requestId,
    name:cleanName(body.name,'Guest'),
    language:supportedLanguages.has(String(body.language||'en'))?String(body.language||'en'):'en',
    status:room.waitingRoom === '1' ? 'waiting' : 'approved',
    createdAt:now()
  };

  await redis.hset(reqKey(id), requestId, JSON.stringify(request));
  await redis.expire(reqKey(id), Math.max(60, Number(room.expiresAt)-now()));
  return c.json(request, 202);
});

app.get('/v1/rooms/:id/join/:requestId', async c => {
  const raw = await redis.hget(reqKey(c.req.param('id')), c.req.param('requestId'));
  if (!raw) return c.json({error:'REQUEST_NOT_FOUND'},404);
  return c.json(JSON.parse(raw));
});

app.get('/v1/rooms/:id/waiting', async c => {
  const id = c.req.param('id');
  const token = (c.req.header('authorization') || '').replace(/^Bearer\s+/i,'');
  if (!(await requireHost(id, token))) return c.json({error:'HOST_AUTH_REQUIRED'},403);

  const all = await redis.hvals(reqKey(id));
  return c.json({requests:all.map(x=>JSON.parse(x)).filter(x=>x.status==='waiting')});
});

app.post('/v1/rooms/:id/waiting/:requestId', async c => {
  const id = c.req.param('id');
  const token = (c.req.header('authorization') || '').replace(/^Bearer\s+/i,'');
  if (!(await requireHost(id, token))) return c.json({error:'HOST_AUTH_REQUIRED'},403);

  const requestId = c.req.param('requestId');
  const raw = await redis.hget(reqKey(id), requestId);
  if (!raw) return c.json({error:'REQUEST_NOT_FOUND'},404);

  const body = await c.req.json().catch(()=>({}));
  const request = JSON.parse(raw);
  request.status = body.approve === false ? 'denied' : 'approved';
  request.updatedAt = now();
  await redis.hset(reqKey(id), requestId, JSON.stringify(request));
  return c.json(request);
});

app.post('/v1/rooms/:id/camera-pair', async c => {
  const id=c.req.param('id');
  const rl=await rateLimit('camera-pair:'+id,clientIp(c),20,600);
  if(!rl.ok){c.header('Retry-After',String(rl.retryAfter));return c.json({error:'RATE_LIMITED'},429)}
  const room=await redis.hgetall(roomKey(id));
  if(!room?.id) return c.json({error:'ROOM_NOT_FOUND'},404);
  if(Number(room.expiresAt)<=now()) return c.json({error:'ROOM_EXPIRED'},410);

  const auth=(c.req.header('authorization')||'').replace(/^Bearer\s+/i,'');
  const body=await c.req.json().catch(()=>({}));
  let authorized=await requireHost(id,auth);
  let parentName=room.hostName||'Participant';

  if(!authorized && body.requestId){
    const raw=await redis.hget(reqKey(id),String(body.requestId));
    if(raw){
      const req=JSON.parse(raw);
      if(req.status==='approved'){authorized=true;parentName=req.name||parentName}
    }
  }
  if(!authorized) return c.json({error:'PAIR_AUTH_REQUIRED'},403);

  let code='';
  for(let i=0;i<5;i++){
    const candidate=cameraCode();
    if(!(await redis.exists(cameraPairKey(candidate)))){code=candidate;break}
  }
  if(!code) return c.json({error:'PAIR_CODE_FAILED'},500);

  const ttl=600;
  const payload={roomId:id,parentName,createdAt:now(),expiresAt:now()+ttl};
  await redis.set(cameraPairKey(code),JSON.stringify(payload),'EX',ttl);
  return c.json({code,expiresAt:payload.expiresAt});
});

app.post('/v1/camera-pair/redeem', async c => {
  const body=await c.req.json().catch(()=>({}));
  const code=String(body.code||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!code) return c.json({error:'PAIR_CODE_REQUIRED'},400);

  const attempts=await redis.incr(cameraPairAttemptKey(code));
  if(attempts===1) await redis.expire(cameraPairAttemptKey(code),600);
  if(attempts>8) return c.json({error:'PAIR_RATE_LIMITED'},429);
  const raw=await redis.get(cameraPairKey(code));
  if(!raw) return c.json({error:'PAIR_CODE_INVALID_OR_EXPIRED'},404);
  const pair=JSON.parse(raw);
  const room=await redis.hgetall(roomKey(pair.roomId));
  if(!room?.id || Number(room.expiresAt)<=now()) return c.json({error:'ROOM_NOT_FOUND_OR_EXPIRED'},410);

  const requestId=crypto.randomUUID();
  const request={
    requestId,
    name:cleanName(body.name,'Phone Camera'),
    language:'en',
    role:'camera',
    status:'approved',
    createdAt:now()
  };
  await redis.hset(reqKey(pair.roomId),requestId,JSON.stringify(request));
  await redis.expire(reqKey(pair.roomId),Math.max(60,Number(room.expiresAt)-now()));
  await redis.del(cameraPairKey(code));
  await redis.del(cameraPairAttemptKey(code));
  return c.json({roomId:pair.roomId,requestId,status:'approved',name:request.name});
});

app.post('/v1/rooms/:id/token', async c => {
  const id = c.req.param('id');
  const room=await redis.hgetall(roomKey(id));
  if(!room?.id) return c.json({error:'ROOM_NOT_FOUND'},404);
  if(Number(room.expiresAt)<=now()) return c.json({error:'ROOM_EXPIRED'},410);
  const body = await c.req.json().catch(()=>({}));
  const requestId = String(body.requestId || '');
  const rl=await rateLimit('token:'+id,requestId||clientIp(c),60,600);
  if(!rl.ok){c.header('Retry-After',String(rl.retryAfter));return c.json({error:'RATE_LIMITED'},429)}
  const raw = await redis.hget(reqKey(id), requestId);
  if (!raw) return c.json({error:'REQUEST_NOT_FOUND'},404);

  const request = JSON.parse(raw);
  if (request.status !== 'approved') return c.json({error:'NOT_APPROVED', status:request.status},403);

  if (!Bun.env.LIVEKIT_API_KEY || !Bun.env.LIVEKIT_API_SECRET || !Bun.env.LIVEKIT_URL) {
    return c.json({error:'LIVEKIT_NOT_CONFIGURED'},503);
  }

  const token = new AccessToken(
    Bun.env.LIVEKIT_API_KEY,
    Bun.env.LIVEKIT_API_SECRET,
    {identity:requestId, name:request.name, ttl:'2h'}
  );
  token.addGrant({roomJoin:true, room:id, canPublish:true, canSubscribe:request.role!=='camera', canPublishData:request.role!=='camera'});

  return c.json({token:await token.toJwt(), serverUrl:Bun.env.LIVEKIT_URL});
});

export default app;
