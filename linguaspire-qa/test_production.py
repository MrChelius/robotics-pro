#!/usr/bin/env python3
import json, time, urllib.request, urllib.error, urllib.parse, ssl, wave, struct, math, os, sys

FRONT="https://frontend-production-802b.up.railway.app"
ROOM="https://room-api-production-881c.up.railway.app"
TRANS="https://translation-production-3882.up.railway.app"
STT="https://stt-production-4262.up.railway.app"
OUT={"startedAt":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"tests":[],"translationMatrix":[]}

def add(name,ok,detail="",severity="critical",data=None):
    OUT["tests"].append({"name":name,"ok":bool(ok),"severity":severity,"detail":str(detail)[:2000],"data":data})
    print(("PASS" if ok else "FAIL"), name, "-", detail)

def request(method,url,body=None,headers=None,timeout=20):
    h={"User-Agent":"LinguaSpire-QA/2.9"}
    if headers:h.update(headers)
    data=None
    if body is not None:
        if isinstance(body,(dict,list)):
            data=json.dumps(body).encode()
            h.setdefault("Content-Type","application/json")
        elif isinstance(body,str): data=body.encode()
        else: data=body
    req=urllib.request.Request(url,data=data,headers=h,method=method)
    started=time.perf_counter()
    try:
        with urllib.request.urlopen(req,timeout=timeout,context=ssl.create_default_context()) as r:
            raw=r.read()
            return r.status,dict(r.headers),raw,(time.perf_counter()-started)*1000
    except urllib.error.HTTPError as e:
        return e.code,dict(e.headers),e.read(),(time.perf_counter()-started)*1000

def json_req(method,url,body=None,headers=None,timeout=20):
    status,h,raw,ms=request(method,url,body,headers,timeout)
    try:d=json.loads(raw.decode("utf-8","replace"))
    except:d={"_raw":raw.decode("utf-8","replace")[:2000]}
    return status,h,d,ms

# Frontend and legal/version/static checks
status,h,raw,ms=request("GET",FRONT+"/",timeout=25)
html=raw.decode("utf-8","replace")
add("frontend_home_http",status==200,f"HTTP {status}, {ms:.0f} ms")
add("frontend_utf8_meta",'<meta charset="utf-8">' in html.lower(),"UTF-8 meta present" if '<meta charset="utf-8">' in html.lower() else "UTF-8 meta missing")
bad=[x for x in ["\\\\u2014","\\\\u00D7","\\\\u2026","\\\\u{1f399}"] if x in html]
add("frontend_no_raw_unicode_escapes",not bad,"none" if not bad else ",".join(bad))
add("frontend_version_not_21","build 2.1" not in html.lower(),"no build 2.1" if "build 2.1" not in html.lower() else "live site still contains build 2.1")
add("frontend_security_nosniff",h.get("X-Content-Type-Options","").lower()=="nosniff",h.get("X-Content-Type-Options","missing"),severity="warning")
for path in ["/api/version","/privacy","/terms","/support","/release-notes"]:
    st,hh,rr,m=request("GET",FRONT+path,timeout=15)
    add("frontend_"+path.strip("/").replace("/","_"),st==200,f"HTTP {st}, {m:.0f} ms")

# Network endpoints visible in the app
for label,path in [("room","/api/net/room"),("stt","/api/net/stt"),("translate","/api/net/translate"),("media","/api/net/media")]:
    st,hh,d,m=json_req("GET",FRONT+path,timeout=25)
    add("network_"+label,st==200 and bool(d.get("ok")),f"HTTP {st}, ok={d.get('ok')}, {m:.0f} ms, detail={d.get('detail','')}",data=d,severity="critical")

# Room API health/security/lifecycle
st,hh,d,m=json_req("GET",ROOM+"/health")
add("room_health",st==200 and d.get("ok") is True,f"HTTP {st}, {m:.0f} ms, {d}",data=d)
add("room_security_nosniff",hh.get("X-Content-Type-Options","").lower()=="nosniff",hh.get("X-Content-Type-Options","missing"),severity="warning")

st,hh,d,m=json_req("POST",ROOM+"/v1/rooms",{
  "title":"LinguaSpire QA Matrix","hostName":"QA Host","password":"QA-Strong-Pass-42","waitingRoom":True,"expiresInSeconds":1800
})
room_id=d.get("id",""); host_secret=d.get("hostSecret",""); invite=d.get("inviteUrl","")
add("room_create",st==201 and room_id.startswith("LS-") and bool(host_secret),f"HTTP {st}, id={room_id}, {m:.0f} ms",data={"id":room_id,"inviteUrl":invite})
add("invite_url_no_password","password" not in invite.lower() and "QA-Strong" not in invite,"password absent from invite URL")
if room_id:
    st,hh,meta,m=json_req("GET",ROOM+"/v1/rooms/"+urllib.parse.quote(room_id))
    add("room_metadata",st==200 and meta.get("passwordRequired") is True and meta.get("waitingRoom") is True,f"HTTP {st}, {meta}",data=meta)

    st,hh,badjoin,m=json_req("POST",ROOM+f"/v1/rooms/{room_id}/join",{"name":"QA Guest","password":"wrong","language":"de"})
    add("room_wrong_password_rejected",st==401 and badjoin.get("error")=="INVALID_PASSWORD",f"HTTP {st}, {badjoin}")

    st,hh,join,m=json_req("POST",ROOM+f"/v1/rooms/{room_id}/join",{"name":"QA Guest","password":"QA-Strong-Pass-42","language":"de"})
    rid=join.get("requestId","")
    add("room_join_waiting",st==202 and join.get("status")=="waiting" and bool(rid),f"HTTP {st}, status={join.get('status')}",data=join)

    st,hh,noauth,m=json_req("GET",ROOM+f"/v1/rooms/{room_id}/waiting")
    add("waiting_requires_host_auth",st==403,f"HTTP {st}, {noauth}")

    auth={"Authorization":"Bearer "+host_secret}
    st,hh,wait,m=json_req("GET",ROOM+f"/v1/rooms/{room_id}/waiting",headers=auth)
    add("waiting_host_list",st==200 and any(x.get("requestId")==rid for x in wait.get("requests",[])),f"HTTP {st}, count={len(wait.get('requests',[]))}",data=wait)

    st,hh,approved,m=json_req("POST",ROOM+f"/v1/rooms/{room_id}/waiting/{rid}",{"approve":True},headers=auth)
    add("waiting_approve",st==200 and approved.get("status")=="approved",f"HTTP {st}, {approved}")

    st,hh,tok,m=json_req("POST",ROOM+f"/v1/rooms/{room_id}/token",{"requestId":rid})
    add("livekit_token_issue",st==200 and bool(tok.get("token")) and str(tok.get("serverUrl","")).startswith("wss://"),f"HTTP {st}, server={tok.get('serverUrl','')}",data={"serverUrl":tok.get("serverUrl")})

    st,hh,pair,m=json_req("POST",ROOM+f"/v1/rooms/{room_id}/camera-pair",{"requestId":rid})
    code=pair.get("code","")
    add("phone_pair_create",st==200 and len(code)==6 and pair.get("expiresAt",0)>time.time(),f"HTTP {st}, codeLength={len(code)}")

    if code:
        st,hh,redeem,m=json_req("POST",ROOM+"/v1/camera-pair/redeem",{"code":code,"name":"QA Phone"})
        add("phone_pair_redeem",st==200 and redeem.get("status")=="approved" and redeem.get("roomId")==room_id,f"HTTP {st}, {redeem}")
        st2,hh2,again,m2=json_req("POST",ROOM+"/v1/camera-pair/redeem",{"code":code,"name":"QA Phone"})
        add("phone_pair_single_use",st2 in (404,410),f"second redeem HTTP {st2}, {again}")

# CORS check: evil origin must not be reflected
st,hh,raw,m=request("OPTIONS",ROOM+"/v1/rooms",headers={"Origin":"https://evil.example","Access-Control-Request-Method":"POST"},timeout=10)
allow=hh.get("Access-Control-Allow-Origin","")
add("cors_rejects_untrusted_origin",allow!="https://evil.example",f"Access-Control-Allow-Origin={allow or 'absent'}")

# Translation service: all 56 directions, sample semantic smoke tests
samples={
 "en":"Good morning. Please send the updated contract tomorrow.",
 "ru":"Доброе утро. Пожалуйста, пришлите обновлённый договор завтра.",
 "zh":"早上好。请明天发送更新后的合同。",
 "ja":"おはようございます。更新した契約書を明日送ってください。",
 "ko":"좋은 아침입니다. 업데이트된 계약서를 내일 보내 주세요.",
 "de":"Guten Morgen. Bitte senden Sie morgen den aktualisierten Vertrag.",
 "fr":"Bonjour. Veuillez envoyer le contrat mis à jour demain.",
 "it":"Buongiorno. Per favore, invia domani il contratto aggiornato."
}
langs=list(samples)
for source in langs:
  for target in langs:
    if source==target: continue
    st,hh,d,m=json_req("POST",TRANS+"/translate",{"q":samples[source],"source":source,"target":target,"format":"text"},timeout=15)
    out=str(d.get("translatedText","")).strip()
    ok=st==200 and bool(out) and out!=samples[source]
    row={"source":source,"target":target,"ok":ok,"http":st,"latencyMs":round(m),"output":out[:300]}
    OUT["translationMatrix"].append(row)
    print(("PASS" if ok else "FAIL"),f"translate {source}->{target}",f"HTTP {st}, {m:.0f} ms",out[:120])

matrix=OUT["translationMatrix"]
lat=sorted([x["latencyMs"] for x in matrix if x["ok"]])
passed=sum(1 for x in matrix if x["ok"])
OUT["translationSummary"]={"checked":len(matrix),"passed":passed,"failed":len(matrix)-passed,"p50Ms":lat[len(lat)//2] if lat else None,"p95Ms":lat[min(len(lat)-1,int(len(lat)*.95))] if lat else None}
add("translation_all_56_directions",passed==56,f"passed {passed}/56, p50={OUT['translationSummary']['p50Ms']} ms, p95={OUT['translationSummary']['p95Ms']} ms",data=OUT["translationSummary"])

# STT health and anti-hallucination silence test
for path in ["/health","/"]:
    try:
        st,hh,raw,m=request("GET",STT+path,timeout=10)
        if st==200:
            add("stt_http_health",True,f"{path} HTTP {st}, {m:.0f} ms",severity="warning")
            break
    except Exception as e:
        pass
else:add("stt_http_health",False,"No 200 health/root endpoint",severity="warning")

wav="/tmp/silence.wav"
with wave.open(wav,"wb") as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000)
    w.writeframes(b"\x00\x00"*16000*3)

# multipart upload via curl for silence
import subprocess
cmd=["curl","-sS","-m","30","-w","\n__HTTP__%{http_code}","-F","file=@"+wav,"-F","model=Systran/faster-whisper-small","-F","response_format=verbose_json","-F","temperature=0","-F","vad_filter=true",STT+"/v1/audio/transcriptions"]
try:
    cp=subprocess.run(cmd,capture_output=True,text=True,timeout=35)
    output=cp.stdout
    body,http=(output.rsplit("\n__HTTP__",1)+[""])[:2] if "\n__HTTP__" in output else (output,"")
    try:jd=json.loads(body)
    except:jd={"_raw":body[:1000]}
    text_out=str(jd.get("text","")).strip()
    ok=http=="200" and text_out==""
    add("stt_silence_no_hallucination",ok,f"HTTP {http}, text={text_out!r}",data=jd,severity="critical")
except Exception as e:
    add("stt_silence_no_hallucination",False,str(e),severity="critical")

OUT["finishedAt"]=time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
crit=[t for t in OUT["tests"] if not t["ok"] and t["severity"]=="critical"]
warn=[t for t in OUT["tests"] if not t["ok"] and t["severity"]!="critical"]
OUT["summary"]={"tests":len(OUT["tests"]),"criticalFailures":len(crit),"warnings":len(warn),"translationPassed":passed,"translationChecked":56}
os.makedirs("linguaspire-qa/results",exist_ok=True)
with open("linguaspire-qa/results/report.json","w",encoding="utf-8") as fh: json.dump(OUT,fh,ensure_ascii=False,indent=2)
with open("linguaspire-qa/results/summary.txt","w",encoding="utf-8") as fh:
    fh.write(json.dumps(OUT["summary"],ensure_ascii=False,indent=2)+"\n")
print("SUMMARY",json.dumps(OUT["summary"]))
