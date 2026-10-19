# STT model verification rerun after switching production ASR model to faster-whisper-base
#!/usr/bin/env python3
import json,time,urllib.request,urllib.error,ssl,subprocess,wave,os
TRANS="https://translation-production-3882.up.railway.app"
FRONT="https://frontend-production-802b.up.railway.app"
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
def post(q,source,target,timeout=12):
    data=json.dumps({"q":q,"source":source,"target":target,"format":"text"}).encode()
    req=urllib.request.Request(TRANS+"/translate",data=data,headers={"content-type":"application/json","user-agent":"LinguaSpire-QA/2.9"},method="POST")
    t=time.perf_counter()
    try:
        with urllib.request.urlopen(req,timeout=timeout,context=ssl.create_default_context()) as r:
            body=json.loads(r.read().decode())
            return r.status,str(body.get("translatedText","")).strip(),round((time.perf_counter()-t)*1000)
    except urllib.error.HTTPError as e:
        return e.code,"",round((time.perf_counter()-t)*1000)
    except Exception:
        return 0,"",round((time.perf_counter()-t)*1000)

def retry(q,s,t):
    last=(0,"",0)
    for _ in range(3):
        last=post(q,s,t)
        if last[0]==200 and last[1]: return last
        time.sleep(.25)
    return last

rows=[]
langs=list(samples)
for s in langs:
  for t in langs:
    if s==t: continue
    started=time.perf_counter()
    st,out,ms=retry(samples[s],s,t)
    path="direct"
    if not (st==200 and out) and s!="en" and t!="en":
        st1,en,ms1=retry(samples[s],s,"en")
        if st1==200 and en:
            st2,out2,ms2=retry(en,"en",t)
            if st2==200 and out2:
                st,out,ms=200,out2,round((time.perf_counter()-started)*1000);path="pivot-en"
    ok=st==200 and bool(out) and out!=samples[s]
    rows.append({"source":s,"target":t,"ok":ok,"path":path,"latencyMs":ms,"output":out[:240]})
    print(("PASS" if ok else "FAIL"),s+"->"+t,path,st,ms,out[:100])

lat=sorted(r["latencyMs"] for r in rows if r["ok"])
summary={"checked":len(rows),"passed":sum(r["ok"] for r in rows),"failed":sum(not r["ok"] for r in rows),"pivotUsed":sum(r["path"]=="pivot-en" and r["ok"] for r in rows),"p50Ms":lat[len(lat)//2] if lat else None,"p95Ms":lat[min(len(lat)-1,int(len(lat)*.95))] if lat else None}

# Test silence through the actual frontend /api/asr route, which is what the app calls.
wav="/tmp/silence.wav"
with wave.open(wav,"wb") as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(b"\x00\x00"*16000*3)
cmd=["curl","-sS","-m","35","-w","\n__HTTP__%{http_code}",
     "-F","audio_file=@"+wav,"-F","language=auto","-F","vocab=","-F","profile=general",
     FRONT+"/api/asr"]
cp=subprocess.run(cmd,capture_output=True,text=True,timeout=40)
raw=cp.stdout
if "\n__HTTP__" in raw: body,http=raw.rsplit("\n__HTTP__",1)
else: body,http=raw,""
try: data=json.loads(body)
except: data={"_raw":body[:500]}
stt_text=str(data.get("text","")).strip()
silence_ok=http=="200" and stt_text==""
print(("PASS" if silence_ok else "FAIL"),"frontend /api/asr silence",http,repr(stt_text),data)
report={"summary":summary,"rows":rows,"silence":{"ok":silence_ok,"http":http,"response":data}}
os.makedirs("linguaspire-qa/results",exist_ok=True)
json.dump(report,open("linguaspire-qa/results/resilient-translation.json","w"),ensure_ascii=False,indent=2)
print("SUMMARY",json.dumps(summary))
if summary["passed"]<56 or not silence_ok:
    raise SystemExit(2)
