"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const app = new hono_1.Hono();
const fs = require('node:fs');
const path = require('node:path');
const livekitModulePath = path.join(__dirname, 'node_modules', 'livekit-client', 'dist', 'livekit-client.esm.mjs');
app.get('/assets/livekit-client.mjs', c => { try {const body=fs.readFileSync(livekitModulePath);return c.body(body,200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});}catch(err){console.error('Bundled LiveKit SDK missing',err?.message);return c.text('LiveKit SDK not available',503);} });
app.use('*', async (c, next) => { await next(); c.header('X-Content-Type-Options', 'nosniff'); c.header('Referrer-Policy', 'strict-origin-when-cross-origin'); c.header('X-Frame-Options', 'SAMEORIGIN'); });
const ROOM_API = 'https://room-api-production-881c.up.railway.app';
const STT_PUBLIC = 'https://stt-production-4262.up.railway.app';
const TRANSLATE_PUBLIC = 'https://translation-production-3882.up.railway.app';
const APP_VERSION = '2.9.2';
const html = String.raw `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#f7f9fc" />
<meta name="description" content="LinguaSpire multilingual video calls with translated captions and chat." />
<meta name="color-scheme" content="light dark" />
<title>LinguaSpire</title>
<style>
:root{--bg:#f6f8fb;--surface:#fff;--surface2:#f8faff;--line:#e3e8f2;--text:#172033;--muted:#77839a;--blue:#1677ff;--blue2:#4d8dff;--green:#18a957;--red:#e33d51;--amber:#d68a00;--shadow:0 14px 38px rgba(27,45,78,.10);--radius:18px}
[data-theme="dark"]{--bg:#07101f;--surface:#0f1b30;--surface2:#0a1527;--line:#243753;--text:#f4f7fb;--muted:#94a4bf;--blue:#4b9dff;--blue2:#6f7dff;--green:#53e49a;--red:#ff6576;--amber:#ffd978;--shadow:0 18px 45px rgba(0,0,0,.28)}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select,textarea{font:inherit}button{cursor:pointer}
.hidden{display:none!important}.app{min-height:100vh;display:grid;grid-template-columns:94px 1fr}.rail{background:var(--surface);border-right:1px solid var(--line);display:flex;flex-direction:column;align-items:center;padding:18px 10px;gap:18px;position:fixed;inset:0 auto 0 0;width:94px;z-index:20}.avatar{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#4aa9ff,#6b63ff);display:grid;place-items:center;color:white;font-weight:900;box-shadow:var(--shadow)}.navbtn{width:74px;min-height:68px;border:0;background:transparent;color:var(--muted);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:12px}.navbtn .ico{font-size:22px}.navbtn.active{color:var(--blue);background:rgba(22,119,255,.10);font-weight:750}.rail-spacer{flex:1}
.content{grid-column:2;min-width:0}.top{height:70px;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:15}.brand{font-size:20px;font-weight:850;display:flex;align-items:center;gap:10px}.brandmark{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#2aa8ff,#6468ff);display:grid;place-items:center;color:#fff}.topright{display:flex;align-items:center;gap:10px}.tiny{font-size:12px;color:var(--muted)}.chip{border:1px solid var(--line);background:var(--surface2);color:var(--text);padding:8px 10px;border-radius:999px}
.page{padding:28px;max-width:1320px;margin:auto}.dashboard{display:grid;grid-template-columns:minmax(560px,1.2fr) minmax(340px,.8fr);gap:22px}.hero{background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:30px;box-shadow:var(--shadow)}.hero h1{margin:0 0 8px;font-size:34px;letter-spacing:-.6px}.hero p{margin:0;color:var(--muted);line-height:1.6}.quick{display:grid;grid-template-columns:repeat(2,minmax(180px,1fr));gap:20px;margin-top:28px}.quickbtn{border:0;background:var(--surface2);border:1px solid var(--line);border-radius:22px;padding:24px;text-align:left;transition:.18s;min-height:160px}.quickbtn:hover{transform:translateY(-2px);box-shadow:var(--shadow)}.quickico{width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,#1684ff,#0e6ff5);color:white;display:grid;place-items:center;font-size:32px;margin-bottom:18px}.quickbtn b{display:block;font-size:22px;margin-bottom:4px}.quickbtn span{color:var(--muted)}
.sidepanel{background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:var(--shadow)}.dateBig{font-size:54px;font-weight:850;letter-spacing:-2px}.meetingList{display:flex;flex-direction:column;gap:10px;margin-top:22px}.meetingItem{padding:14px;border:1px solid var(--line);background:var(--surface2);border-radius:14px}.empty{padding:46px 20px;text-align:center;color:var(--muted)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow)}.sectionTitle{font-size:24px;font-weight:850;margin:0 0 6px}.sectionSub{color:var(--muted);margin:0 0 22px}.btn{border:1px solid var(--line);background:var(--surface);color:var(--text);padding:11px 15px;border-radius:12px;font-weight:700}.btn.primary{background:linear-gradient(135deg,var(--blue),var(--blue2));border:none;color:#fff}.btn.danger{background:var(--red);border:none;color:#fff}.btn.ghost{background:transparent}.btn:disabled{opacity:.45;cursor:not-allowed}
.settingsLayout{display:grid;grid-template-columns:270px 1fr;gap:18px}.settingsNav{padding:10px;align-self:start;position:sticky;top:88px}.setnav{width:100%;border:0;background:transparent;color:var(--text);padding:12px 14px;border-radius:12px;text-align:left;margin:2px 0}.setnav.active{background:var(--blue);color:#fff;font-weight:750}.settingsPane{padding:28px}.settingGroup{margin:0 0 30px}.settingGroup h3{font-size:18px;margin:0 0 14px}.row{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 0;border-bottom:1px solid var(--line)}.row:last-child{border-bottom:0}.rowText b{display:block}.rowText span{font-size:13px;color:var(--muted);display:block;margin-top:3px}.switch{width:48px;height:28px;border-radius:999px;background:#c9d1df;position:relative;border:0}.switch::after{content:"";width:22px;height:22px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:.2s;box-shadow:0 2px 6px #0002}.switch.on{background:var(--blue)}.switch.on::after{left:23px}.field{display:flex;flex-direction:column;gap:6px}.field label{font-size:12px;color:var(--muted);font-weight:700}.field input,.field select,.field textarea{width:100%;border:1px solid var(--line);background:var(--surface2);color:var(--text);border-radius:12px;padding:11px 12px;outline:none}.field textarea{min-height:92px;resize:vertical}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.previewBox{aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#0a0f18;border:1px solid var(--line);position:relative}.previewBox video{width:100%;height:100%;object-fit:cover}.previewEmpty{position:absolute;inset:0;display:grid;place-items:center;color:#93a2b9}.meter{display:grid;grid-template-columns:repeat(12,1fr);gap:5px;align-items:end;height:26px}.meter i{display:block;height:7px;border-radius:4px;background:#dfe5ef}.meter i.on{background:var(--blue)}
.modal{position:fixed;inset:0;background:rgba(10,18,33,.56);backdrop-filter:blur(8px);display:grid;place-items:center;z-index:100;padding:20px}.modalBox{width:min(980px,96vw);max-height:92vh;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:24px;box-shadow:0 40px 120px #0006;padding:24px}.modalHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.modalHead h2{margin:0}.close{border:0;background:transparent;color:var(--muted);font-size:24px}.prejoin{display:grid;grid-template-columns:1.15fr .85fr;gap:20px}.preControls{display:flex;gap:10px;position:absolute;left:14px;bottom:14px}.circle{width:44px;height:44px;border-radius:50%;border:0;background:#000b;color:#fff}.note{padding:12px 14px;border-radius:12px;background:rgba(22,119,255,.09);border:1px solid rgba(22,119,255,.18);color:var(--muted);font-size:13px;line-height:1.5}.status{font-size:13px;color:var(--muted);min-height:18px}.status.ok{color:var(--green)}.status.err{color:var(--red)}
.meetingShell{height:calc(100vh - 70px);display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:0;background:var(--bg)}.stage{position:relative;overflow:auto;padding:16px 16px 100px}.meetingTop{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.meetingMeta b{font-size:17px}.meetingMeta div{font-size:12px;color:var(--muted)}.liveBadge{padding:7px 10px;border-radius:999px;background:rgba(24,169,87,.12);border:1px solid rgba(24,169,87,.3);color:var(--green);font-size:12px;font-weight:750}.videoGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}.tile{position:relative;aspect-ratio:16/10;background:#0a0f18;border-radius:18px;overflow:hidden;border:1px solid var(--line);min-height:230px}.tile video{width:100%;height:100%;object-fit:cover;background:#080d16}.tileName{position:absolute;left:10px;bottom:10px;background:#000b;color:#fff;padding:6px 9px;border-radius:9px;font-size:13px}.tileBadges{position:absolute;right:10px;top:10px;display:flex;gap:6px}.smallBadge{background:#000a;color:#fff;padding:5px 7px;border-radius:8px;font-size:11px}.caption{position:absolute;left:8%;right:8%;bottom:52px;background:#000d;color:#fff;border:1px solid #ffffff24;padding:10px 12px;border-radius:12px;text-align:center;font-size:19px;font-weight:800;line-height:1.35;text-shadow:0 1px 2px #000}.controlbar{position:fixed;left:calc(94px + (100vw - 94px - 340px)/2);transform:translateX(-50%);bottom:18px;display:flex;gap:8px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);padding:9px;border-radius:18px;z-index:30}.control{border:1px solid var(--line);background:var(--surface2);color:var(--text);padding:10px 13px;border-radius:12px}.control.off{background:#ffe9ec;color:#a62033}.control.end{background:var(--red);color:#fff;border:none}.meetSide{background:var(--surface);border-left:1px solid var(--line);display:flex;flex-direction:column;min-width:0}.tabs{display:flex;border-bottom:1px solid var(--line)}.tab{flex:1;border:0;background:transparent;color:var(--muted);padding:14px 8px;font-weight:700}.tab.active{color:var(--blue);border-bottom:2px solid var(--blue)}.sideBody{flex:1;overflow:auto;padding:14px}.person{display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid var(--line);background:var(--surface2);border-radius:11px;margin-bottom:8px}.chat{display:flex;flex-direction:column;gap:8px}.msg{padding:10px;border:1px solid var(--line);background:var(--surface2);border-radius:12px;line-height:1.4}.msg b{color:var(--blue)}.msg small{display:block;color:var(--muted);margin-top:4px}.chatComposer{padding:12px;border-top:1px solid var(--line);display:flex;gap:8px}.chatComposer input{flex:1;border:1px solid var(--line);background:var(--surface2);color:var(--text);border-radius:10px;padding:10px}.transcriptLine{padding:10px 0;border-bottom:1px solid var(--line)}.transcriptLine b{font-size:13px}.transcriptLine div{margin-top:4px}.transcriptLine small{color:var(--muted)}
.networkCards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.netRow{display:flex;justify-content:space-between;align-items:center;padding:15px;border:1px solid var(--line);border-radius:14px;background:var(--surface2)}.dot{width:10px;height:10px;border-radius:50%;background:#c7cedb}.dot.ok{background:var(--green)}.dot.bad{background:var(--red)}.dot.wait{background:var(--amber)}
@media(max-width:1050px){.app{grid-template-columns:76px 1fr}.rail{width:76px}.navbtn{width:58px}.dashboard{grid-template-columns:1fr}.settingsLayout{grid-template-columns:1fr}.settingsNav{position:static;display:flex;overflow:auto}.setnav{white-space:nowrap;width:auto}.meetingShell{grid-template-columns:1fr}.meetSide{position:fixed;right:0;top:70px;bottom:0;width:min(360px,92vw);z-index:40;box-shadow:-20px 0 50px #0003}.controlbar{left:50%;}.prejoin{grid-template-columns:1fr}.grid3{grid-template-columns:1fr}}
@media(max-width:700px){.rail{display:none}.app{display:block}.content{grid-column:1}.top{padding:0 14px}.page{padding:16px}.quick{grid-template-columns:1fr 1fr;gap:12px}.quickbtn{padding:16px;min-height:135px}.quickico{width:56px;height:56px}.videoGrid{grid-template-columns:1fr}.controlbar{left:50%;max-width:95vw;overflow:auto}.meetingShell{height:calc(100vh - 70px)}.grid2{grid-template-columns:1fr}}

/* LinguaSpire Premium Dashboard 2.2 */
:root{--premium-bg:#06101f;--premium-panel:#0d1b32;--premium-panel-2:#101f3b;--premium-line:#23395e;--premium-blue:#3b82f6;--premium-purple:#8b5cf6;--premium-cyan:#4fd1ff;--premium-green:#25d695;--premium-gold:#d6a449}
[data-theme="dark"] body{background:radial-gradient(circle at 45% -10%,#0e2650 0,#071325 28%,#050d18 65%,#040a13 100%)}
[data-theme="dark"] .rail{background:linear-gradient(180deg,#08162b 0,#071324 100%);border-right:1px solid #1f3253}
.rail{width:168px;padding:18px 14px;align-items:stretch;gap:8px}.app{grid-template-columns:168px 1fr}.content{grid-column:2}.sideBrand{display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 4px 22px}.sideBrandMark{width:52px;height:52px;border-radius:15px;background:linear-gradient(145deg,#45b6ff,#7267ff 70%,#a855f7);display:grid;place-items:center;color:#fff;font-weight:900;font-size:26px;box-shadow:0 12px 32px rgba(70,100,255,.35)}.sideBrandText{font-weight:850;font-size:18px;color:var(--text)}.navbtn{width:100%;min-height:56px;border-radius:14px;flex-direction:row;justify-content:flex-start;padding:0 14px;gap:13px;font-size:14px}.navbtn .ico{width:24px;height:24px;display:grid;place-items:center}.navbtn .ico svg{width:24px;height:24px}.navbtn.active{color:#fff;background:linear-gradient(90deg,rgba(43,111,255,.85),rgba(57,91,210,.45));border:1px solid rgba(91,140,255,.5);box-shadow:0 10px 24px rgba(41,79,192,.28)}.navbtn:not(.active):hover{background:rgba(255,255,255,.045);color:var(--text)}
.top{height:86px;padding:0 32px;background:rgba(7,18,35,.86)!important;border-bottom:1px solid #1f3353!important;backdrop-filter:blur(18px)}.brand{font-size:23px}.brandmark{width:42px;height:42px;border-radius:12px;font-size:20px;box-shadow:0 10px 24px rgba(81,105,255,.28)}.systemReady{display:flex;align-items:center;gap:9px;padding:9px 15px;border:1px solid #234269;border-radius:999px;background:rgba(8,31,46,.72);color:#dfe8f5;font-size:13px;font-weight:700}.systemReady i{width:9px;height:9px;border-radius:50%;background:#24d17e;box-shadow:0 0 14px #24d17e}.topDivider{width:1px;height:30px;background:#28405f}.themeToggle{display:flex;align-items:center;gap:9px;border:1px solid #263b5d;background:#0b1930;color:#c5d0e3;border-radius:999px;padding:8px 10px}.toggleTrack{width:42px;height:22px;border-radius:999px;background:linear-gradient(90deg,#6ea8ff,#6c63ff);position:relative}.toggleKnob{position:absolute;top:3px;left:21px;width:16px;height:16px;background:#fff;border-radius:50%;box-shadow:0 2px 5px #0004}.sunIcon,.moonIcon{font-size:16px}
.page.homePage{padding:24px 26px 30px;max-width:1540px}.dashboard{grid-template-columns:minmax(690px,1.55fr) minmax(360px,.78fr);gap:18px;align-items:stretch}.dashboardMain{min-width:0}.heroPremium{height:374px;padding:0;overflow:hidden;position:relative;background:linear-gradient(120deg,#0c1c3c 0%,#12255d 40%,#151d56 70%,#0a1530 100%);border:1px solid #355284;box-shadow:0 22px 60px rgba(0,0,0,.28)}.heroPremium::before{content:"";position:absolute;inset:-40% 25% auto -10%;height:390px;background:radial-gradient(circle,#2444a95c 0,transparent 62%);filter:blur(6px)}.heroCopy{position:relative;z-index:3;padding:38px 38px 30px;width:58%}.eyebrow{font-size:12px;letter-spacing:.18em;color:#9fb5de;font-weight:800;margin-bottom:14px}.heroPremium h1{font-size:58px;line-height:.94;letter-spacing:-2.4px;margin:0 0 22px;color:#fff}.heroPremium h1 span{background:linear-gradient(90deg,#4fd1ff 0%,#6b8cff 50%,#a855f7 100%);-webkit-background-clip:text;background-clip:text;color:transparent}.heroPremium p{font-size:17px;line-height:1.6;color:#c0cbe0;max-width:570px}.heroVisual{position:absolute;inset:0 0 0 52%;overflow:hidden}.globe{position:absolute;width:470px;height:470px;border-radius:50%;right:-62px;bottom:-155px;background:radial-gradient(circle at 38% 28%,#2a56a9 0,#193b83 33%,#10275d 58%,#07142d 78%);box-shadow:inset -40px -50px 90px #060d22,0 0 80px rgba(75,93,255,.3)}.globe::after{content:"";position:absolute;inset:18px;border-radius:50%;background-image:radial-gradient(#6da6ff 1.1px,transparent 1.1px);background-size:11px 11px;opacity:.45;mask-image:linear-gradient(110deg,#000,transparent 75%)}.orbit{position:absolute;border:1px solid rgba(104,102,255,.55);border-radius:50%;transform:rotate(-16deg)}.orbit1{width:490px;height:160px;right:-25px;top:125px}.orbit2{width:390px;height:120px;right:35px;top:215px;transform:rotate(14deg)}.langBubble{position:absolute;z-index:5;padding:10px 16px;border-radius:12px;color:#fff;font-weight:800;font-size:15px;backdrop-filter:blur(12px);box-shadow:0 12px 35px #0006;border:1px solid rgba(255,255,255,.28)}.bubbleHello{top:78px;left:40px;background:linear-gradient(135deg,#168ed8d9,#2f72d7e6)}.bubbleJp{top:170px;right:44px;background:linear-gradient(135deg,#6f4cf0e6,#8232d9e6)}.bubbleHola{top:245px;left:82px;background:linear-gradient(135deg,#0ea5a4e6,#0b817de6)}.wave{margin-right:8px;color:#8cf4ff}.star{position:absolute;width:8px;height:8px;border-radius:50%;background:#68e9ff;box-shadow:0 0 13px #68e9ff}.s1{top:142px;left:18px}.s2{top:224px;right:130px;background:#8f5cff}.s3{top:278px;left:188px;background:#4ed4ff}
.premiumQuick{gap:14px;margin-top:14px}.premiumQuick .quickbtn{min-height:132px;padding:18px 20px;display:grid;grid-template-columns:78px 1fr 40px;align-items:center;gap:18px;border-radius:20px;background:#0d1a31;border:1px solid #2a4065;box-shadow:0 14px 35px rgba(0,0,0,.18);position:relative;overflow:hidden}.premiumQuick .quickbtn::before{content:"";position:absolute;inset:0;opacity:.15;pointer-events:none}.premiumQuick .quickbtn:hover{transform:translateY(-2px);box-shadow:0 18px 45px rgba(0,0,0,.26)}.premiumQuick .quickico{width:72px;height:72px;border-radius:19px;margin:0;display:grid;place-items:center;color:#fff}.premiumQuick .quickico svg{width:34px;height:34px}.quickText{position:relative;z-index:2}.premiumQuick .quickText b{font-size:19px;color:#fff;margin:0 0 5px}.premiumQuick .quickText span{font-size:14px;line-height:1.45;color:#b6c3d9}.quickArrow{width:36px;height:36px;border-radius:50%;border:1px solid #35517e;display:grid;place-items:center;color:#d7e3f5}.quickArrow svg{width:18px;height:18px}.actionJoin{border-color:#385fc2!important;background:linear-gradient(115deg,#0e1d3b,#101a32)!important}.actionJoin .quickico{background:linear-gradient(145deg,#2888ff,#3158e8)}.actionStart{border-color:#1c776c!important;background:linear-gradient(115deg,#0c2630,#0d1b2c)!important}.actionStart .quickico{background:linear-gradient(145deg,#26d69b,#0c8c68)}.actionSchedule{border-color:#6d3cc7!important;background:linear-gradient(115deg,#1b1640,#10162d)!important}.actionSchedule .quickico{background:linear-gradient(145deg,#9f53ef,#6735d8)}.actionShare{border-color:#7f6430!important;background:linear-gradient(115deg,#241f24,#11182b)!important}.actionShare .quickico{background:linear-gradient(145deg,#f1bb4b,#b67927)}
.premiumSidepanel{min-height:100%;padding:30px;background:linear-gradient(180deg,#0e1b32,#0b172d 60%,#10183a);border:1px solid #294064;box-shadow:0 22px 60px rgba(0,0,0,.24);display:flex;flex-direction:column}.dateHeader{display:flex;align-items:flex-start;justify-content:space-between}.weekday{font-size:14px;color:#a7b5cb;margin-bottom:2px}.dateBig{font-size:48px;font-weight:900;letter-spacing:-1.8px;color:#fff}.calendarButton{width:44px;height:44px;border-radius:12px;border:1px solid #2c466f;background:#0f1d36;color:#d6e3f5;display:grid;place-items:center}.calendarButton svg{width:21px;height:21px}.sideRule{height:1px;background:#263b5c;margin:24px 0}.upcomingHeader{display:flex;align-items:center;justify-content:space-between}.upcomingHeader h3{font-size:20px;margin:0;color:#fff}.viewAllBtn{border:0;background:transparent;color:#6aa3ff;font-weight:700}.premiumMeetingList{flex:1;min-height:330px;margin-top:18px}.premiumMeetingList .empty{min-height:300px;display:flex;align-items:flex-end;justify-content:center;padding:0 0 74px;font-size:0;position:relative}.premiumMeetingList .empty::before{content:"";position:absolute;top:62px;width:104px;height:104px;border-radius:24px;background:linear-gradient(145deg,#34446e,#242c55);box-shadow:0 24px 45px rgba(0,0,0,.3);transform:rotate(4deg)}.premiumMeetingList .empty::after{content:"No meetings scheduled\A Your upcoming meetings will appear here.";white-space:pre;text-align:center;font-size:15px;line-height:1.7;color:#aab7cb}.emptyScheduleCta{display:flex;justify-content:center}.scheduleCta{display:flex;align-items:center;gap:8px;border-radius:12px;padding:12px 20px}.scheduleCta svg{width:18px;height:18px}
.settingsLayout{gap:16px}.settingsNav,.settingsPane{background:linear-gradient(180deg,#0f1d34,#0c182d);border-color:#263d62}.setnav{border:1px solid transparent}.setnav.active{background:linear-gradient(90deg,#2567df,#3158ce);box-shadow:0 10px 24px rgba(38,87,194,.24)}.card{box-shadow:0 18px 40px rgba(0,0,0,.16)}
@media(max-width:1180px){.rail{width:108px}.app{grid-template-columns:108px 1fr}.sideBrandText{display:none}.navbtn{justify-content:center;padding:0}.navbtn span:last-child{display:none}.dashboard{grid-template-columns:1fr}.heroVisual{opacity:.75}.premiumSidepanel{min-height:520px}.content{grid-column:2}}
@media(max-width:760px){.rail{display:none}.app{display:block}.content{grid-column:1}.page.homePage{padding:14px}.heroPremium{height:auto;min-height:400px}.heroCopy{width:100%;padding:30px}.heroPremium h1{font-size:48px}.heroVisual{opacity:.32;left:30%}.premiumQuick{grid-template-columns:1fr}.premiumQuick .quickbtn{grid-template-columns:70px 1fr 34px}.top{padding:0 16px}.systemReady,.topDivider{display:none}}

.themeGlyph{width:18px;height:18px;display:grid;place-items:center}.themeGlyph svg{width:18px;height:18px}.toggleTrack{transition:.22s;background:#b7c2d4}.toggleKnob{left:3px;transition:left .22s ease,background .22s}.themeToggle.isDark .toggleTrack{background:linear-gradient(90deg,#6ea8ff,#6c63ff)}.themeToggle.isDark .toggleKnob{left:23px}.themeToggle:not(.isDark) .sunIcon{color:#ffb020}.themeToggle.isDark .moonIcon{color:#aebcff}
.wave{display:inline-grid;place-items:center;width:20px;height:20px;margin-right:8px}.wave svg{width:20px;height:20px}.deviceActions{display:flex;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap}.deviceStatus{min-height:44px;border:1px solid var(--line);background:var(--surface2);border-radius:12px;padding:11px 12px;color:var(--muted)}.deviceStatus.ok{color:var(--green);border-color:rgba(24,169,87,.45)}.deviceStatus.bad{color:var(--red);border-color:rgba(227,61,81,.45)}

.phoneCameraPage{min-height:100vh;background:radial-gradient(circle at 50% 0,#102b58,#071325 48%,#050b14);padding:20px;color:#f7f9fc}.phoneCameraShell{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:16px}.phoneBrand{display:flex;align-items:center;gap:12px;padding:4px 0 2px}.phoneBrand>div{display:flex;flex-direction:column}.phoneBrand b{font-size:20px}.phoneBrand span:not(.brandmark){font-size:12px;color:#9bacc5}.phonePreviewWrap{position:relative;background:#02070f;border:1px solid #284569;border-radius:24px;overflow:hidden;aspect-ratio:9/16;max-height:62vh;margin:auto;width:min(100%,420px);box-shadow:0 25px 60px #0007}.phonePreviewWrap video{width:100%;height:100%;object-fit:cover}.phonePreviewEmpty{position:absolute;inset:0;display:grid;place-items:center;padding:30px;text-align:center;color:#9fb0c8}.phoneLiveBadge{position:absolute;top:14px;left:14px;background:#d92d48;color:#fff;border-radius:999px;padding:7px 11px;font-weight:900;font-size:12px;letter-spacing:.1em;box-shadow:0 6px 20px #0007}.phoneControls{padding:20px}.phoneControls h1{font-size:26px;margin:0 0 6px}.phoneButtons{display:grid;grid-template-columns:1fr 1fr;gap:10px}.phoneButtons .primary{grid-column:1/-1;min-height:50px}.phoneLinkBox{padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface2);word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text);margin:14px 0}.phoneCamConnected{color:var(--green)}
@media(max-width:600px){.phoneCameraPage{padding:12px}.phoneControls{padding:16px}.phoneControls h1{font-size:22px}}
.phonePairFooter{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}@media(max-width:600px){.phonePairFooter{flex-direction:column}.phonePairFooter .btn{width:100%}}.noticeBar{margin-top:12px;padding:11px 13px;border:1px solid var(--line);border-radius:12px;background:var(--surface2);font-size:12px;line-height:1.45;color:var(--muted)}.noticeBar a,.legalLinks a{color:var(--blue);font-weight:700;text-decoration:none}.legalLinks{display:flex;gap:14px;flex-wrap:wrap;margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}.topLang{border:1px solid var(--line);background:var(--surface2);color:var(--text);border-radius:999px;padding:8px 11px;min-width:110px}.pairCodeDisplay{font:900 clamp(38px,7vw,64px)/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;text-align:center;padding:25px 15px;margin:18px 0;border:1px solid #395a8d;border-radius:18px;background:linear-gradient(135deg,#0a1830,#10254a);color:#8bdcff}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,a:focus-visible{outline:3px solid #77b5ff;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.connectionBanner{position:absolute;top:76px;left:50%;transform:translateX(-50%);z-index:15;background:#3a2504;color:#ffe1a8;border:1px solid #7b5410;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:800;box-shadow:0 8px 28px #0005}.connectionBanner.bad{background:#3a0c14;color:#ffc1cc;border-color:#7f2638}.connectionBanner.ok{background:#083522;color:#b8f2d6;border-color:#17613f}.phoneButtons{grid-template-columns:1fr 1fr}.phoneButtons .primary{grid-column:1/-1}.phoneButtons #phoneBackHome{grid-column:1/-1}</style>
</head>
<body>
<div class="app" id="app">
  <aside class="rail" id="rail">
    <div class="sideBrand"><div class="sideBrandMark">L</div><div class="sideBrandText">LinguaSpire</div></div>
    <button class="navbtn active" data-page="meetings"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5v-8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span>Home</span></button>
    <button class="navbtn" data-page="recordings"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m10 8.8 5.5 3.2-5.5 3.2V8.8Z" fill="currentColor"/></svg></span><span>Recordings</span></button>
    <button class="navbtn" data-page="settings"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19.2 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.5 1a8 8 0 0 0-2.6-1.5L13.8 2H10l-.4 3.1A8 8 0 0 0 7 6.6l-2.5-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.5-1a8 8 0 0 0 2.6 1.5L10 22h3.8l.4-3.1a8 8 0 0 0 2.6-1.5l2.5 1 2-3.4-2.1-1.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg></span><span>Settings</span></button>
    <button class="navbtn" data-page="network"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="6" cy="18" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="18" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10.6 8 7.4 15.8M13.4 8l3.2 7.8M8.4 18h7.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></span><span>Network</span></button>
    <div class="rail-spacer"></div>
    <button class="navbtn" data-page="about"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.7V17M12 7.2h.01" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span><span>About</span></button>
  </aside>

  <section class="content">
    <header class="top">
      <div class="brand"><span class="brandmark">L</span><span>LinguaSpire</span></div>
      <div class="topright">
        <span class="systemReady" id="globalStatus"><i></i>System Ready</span><select id="uiLangSelect" class="topLang" aria-label="Interface language"><option value="en">English</option><option value="ru">Русский</option><option value="zh">中文</option><option value="ja">日本語</option><option value="ko">한국어</option><option value="de">Deutsch</option><option value="fr">Français</option><option value="it">Italiano</option></select>
        <span class="topDivider"></span>
        <button class="themeToggle" id="themeBtn" aria-label="Toggle theme" aria-pressed="true"><span class="themeGlyph sunIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span class="toggleTrack"><span class="toggleKnob"></span></span><span class="themeGlyph moonIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 15.3A8 8 0 0 1 8.7 4.5 8.5 8.5 0 1 0 19.5 15.3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span></button>
      </div>
    </header>

    <main class="page homePage" id="meetingsPage">
      <div class="dashboard">
        <div class="dashboardMain">
          <section class="hero heroPremium">
            <div class="heroCopy">
              <div class="eyebrow">WELCOME TO LINGUASPIRE</div>
              <h1>Meet across<br><span>languages.</span></h1>
              <p>Start a call with real-time translated captions and chat, and let LinguaSpire break down language barriers for every conversation.</p>
            </div>
            <div class="heroVisual" aria-hidden="true">
              <div class="globe"></div>
              <div class="orbit orbit1"></div><div class="orbit orbit2"></div>
              <div class="langBubble bubbleHello"><span class="wave"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>Hello</div>
              <div class="langBubble bubbleJp">&#10022;&nbsp;&#12371;&#12435;&#12395;&#12385;&#12399;</div>
              <div class="langBubble bubbleHola"><span class="wave"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>Hola</div>
              <i class="star s1"></i><i class="star s2"></i><i class="star s3"></i>
            </div>
          </section>
          <div class="quick premiumQuick">
            <button class="quickbtn actionJoin" id="joinQuick">
              <div class="quickico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="16.5" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.8 19c.7-3.2 2.5-5 5.2-5s4.5 1.8 5.2 5M13.5 15.2c1-.8 2-1.2 3.2-1.2 2.2 0 3.7 1.5 4.3 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><div class="quickText"><b>Join Meeting</b><span>Join with a meeting link or meeting ID.</span></div><span class="quickArrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            </button>
            <button class="quickbtn actionStart" id="startQuick">
              <div class="quickico"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 10 5-3v10l-5-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></div><div class="quickText"><b>Start Meeting</b><span>Start a new multilingual video call.</span></div><span class="quickArrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            </button>
            <button class="quickbtn actionSchedule" id="scheduleQuick">
              <div class="quickico"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15" r="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></div><div class="quickText"><b>Schedule Meeting</b><span>Plan and schedule a meeting for later.</span></div><span class="quickArrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            </button>
            <button class="quickbtn actionShare" id="shareQuick">
              <div class="quickico"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="12" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 20v-9m0 0-3 3m3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="quickText"><b>Share Screen</b><span>Share your screen with participants.</span></div><span class="quickArrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            </button>
          </div>
        </div>
        <aside class="sidepanel premiumSidepanel">
          <div class="dateHeader"><div><div class="weekday" id="todayName"></div><div class="dateBig" id="todayDate"></div></div><button class="calendarButton" id="scheduleFromDate" aria-label="Schedule meeting"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="13" cy="13" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/><circle cx="9" cy="16.5" r="1" fill="currentColor"/><circle cx="13" cy="16.5" r="1" fill="currentColor"/></svg></button></div>
          <div class="sideRule"></div>
          <div class="upcomingHeader"><h3>Upcoming meetings</h3><button class="viewAllBtn" id="clearSchedule">Clear</button></div>
          <div class="meetingList premiumMeetingList" id="upcomingList"></div>
          <div class="emptyScheduleCta"><button class="btn primary scheduleCta" id="scheduleSideBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="13" cy="13" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/><circle cx="9" cy="16.5" r="1" fill="currentColor"/><circle cx="13" cy="16.5" r="1" fill="currentColor"/></svg><span>Schedule a Meeting</span></button></div>
        </aside>
      </div>
    </main>

    <main class="page hidden" id="recordingsPage">
      <div class="card" style="padding:28px"><h2 class="sectionTitle">Recordings</h2><p class="sectionSub">Local meeting recordings and saved transcripts appear here.</p><div class="empty">No saved recordings yet.</div></div>
    </main>

    <main class="page hidden" id="settingsPage">
      <div class="settingsLayout">
        <aside class="card settingsNav" id="settingsNav"></aside>
        <section class="card settingsPane" id="settingsPane"></section>
      </div>
    </main>

    <main class="page hidden" id="networkPage">
      <div class="card" style="padding:28px"><h2 class="sectionTitle">Network Test</h2><p class="sectionSub">Check the services LinguaSpire needs for calls, subtitles and translation.</p><div style="display:flex;justify-content:flex-end;margin-bottom:18px"><button class="btn primary" id="runNet">Start Testing</button></div><div class="networkCards" id="networkCards"></div></div>
    </main>

    <main class="page hidden" id="aboutPage">
      <div class="card" style="padding:28px"><h2 class="sectionTitle">About LinguaSpire</h2><p class="sectionSub">One call. Every language.</p><p>Production build ${APP_VERSION} — multilingual video calls, translated subtitles, translated chat, waiting rooms, screen sharing, transcript panel and connection diagnostics.</p><div class="legalLinks"><a href="/privacy" target="_blank">Privacy Policy</a><a href="/terms" target="_blank">Terms of Use</a><a href="/support" target="_blank">Support</a><a href="/release-notes" target="_blank">Release Notes</a></div></div>
    </main>

    <section class="hidden" id="meetingPage">
      <div class="meetingShell">
        <div class="stage">
          <div class="meetingTop"><div class="meetingMeta"><b id="meetingTitle">LinguaSpire Meeting</b><div id="meetingIdLabel"></div></div><div style="display:flex;gap:8px;align-items:center"><span class="liveBadge" id="captionBadge">Subtitles starting…</span><select id="meetingSubtitleLang" class="btn"></select><button class="btn" id="copyInvite">Copy invite</button></div></div>
          <div class="connectionBanner hidden" id="connectionBanner" role="status" aria-live="assertive">Connection interrupted — LinguaSpire is reconnecting…</div><div class="videoGrid" id="videoGrid"></div>
          <div class="controlbar">
            <button class="control" id="micBtn">Mic</button><button class="control" id="camBtn">Camera</button><button class="control" id="phoneCamBtn">Phone Camera</button><button class="control" id="screenBtn">Share</button><button class="control" id="captionsBtn">Captions</button><button class="control" id="panelBtn">Panel</button><button class="control end" id="leaveBtn">Leave</button>
          </div>
        </div>
        <aside class="meetSide" id="meetSide">
          <div class="tabs"><button class="tab active" data-tab="participants">People</button><button class="tab" data-tab="chat">Chat</button><button class="tab" data-tab="transcript">Transcript</button><button class="tab" data-tab="waiting">Waiting</button></div>
          <div class="sideBody" id="sideBody"></div>
          <div class="chatComposer hidden" id="chatComposer"><input id="chatInput" placeholder="Write a message…"><button class="btn primary" id="sendChat">Send</button></div>
        </aside>
      </div>
    </section>
  </section>
</div>

<section class="phoneCameraPage hidden" id="phoneCameraPage">
  <div class="phoneCameraShell">
    <div class="phoneBrand"><span class="brandmark">L</span><div><b>LinguaSpire</b><span>Phone Camera</span></div></div>
    <div class="phonePreviewWrap">
      <video id="phonePreview" autoplay muted playsinline></video>
      <div id="phonePreviewEmpty" class="phonePreviewEmpty">Tap “Start camera” and allow camera access.</div>
      <div id="phoneLiveBadge" class="phoneLiveBadge hidden">LIVE</div>
    </div>
    <div class="card phoneControls">
      <h1>Use this phone as a meeting camera</h1>
      <p class="sectionSub">Your iPhone or Android phone joins the current meeting as a dedicated video camera. Microphone stays off to avoid echo.</p>
      <div class="field"><label>Camera</label><select id="phoneCameraSelect"></select></div>
      <div class="field"><label>Pairing code</label><input id="phonePairInput" maxlength="7" autocapitalize="characters" autocomplete="one-time-code" inputmode="text" placeholder="ABC123"></div>
      <div class="field"><label>Camera name</label><input id="phoneCameraName" value="iPhone Camera"></div>
      <div class="phoneButtons">
        <button class="btn" id="phoneStartPreview">Start camera</button>
        <button class="btn" id="phoneFlipCamera">Switch camera</button>
        <button class="btn primary" id="phoneJoinCamera">Connect camera</button>
        <button class="btn" id="phoneBackHome">Back to LinguaSpire</button>
      </div>
      <div class="status" id="phoneCameraStatus"></div>
    </div>
  </div>
</section>

<div class="modal hidden" id="phonePairModal"><div class="modalBox" style="width:min(620px,96vw)">
  <div class="modalHead"><h2>Add iPhone / Android camera</h2><button class="close" id="closePhonePair" aria-label="Close">×</button></div>
  <p class="sectionSub">Open LinguaSpire on your phone, choose <b>Phone Camera</b>, and enter this one-time pairing code. No meeting password is stored in the URL.</p>
  <div class="pairCodeDisplay" id="phonePairCodeDisplay">------</div>
  <div class="deviceActions"><button class="btn primary" id="copyPhoneCode">Copy pairing code</button><button class="btn" id="newPhoneCode">Generate new code</button></div>
  <div class="note">The code expires after 10 minutes and is single-use. The phone joins only as a camera and its microphone stays off to prevent echo.</div>
  <div class="status" id="phonePairStatus" role="status" aria-live="polite"></div>
  <div class="phonePairFooter"><button class="btn primary" id="backToMeetingBtn">Back to meeting</button><button class="btn" id="mainMenuBtn">Main menu</button></div>
</div></div>

<div class="modal hidden" id="prejoinModal"><div class="modalBox"><div class="modalHead"><h2 id="prejoinTitle">Join meeting</h2><button class="close" data-close="prejoinModal">×</button></div><div class="prejoin"><div><div class="previewBox"><video id="previewVideo" autoplay muted playsinline></video><div id="previewEmpty" class="previewEmpty">Camera preview</div><div class="preControls"><button class="circle" id="previewMic" aria-label="Toggle microphone">🎙</button><button class="circle" id="previewCam" aria-label="Toggle camera">📷</button></div></div><div class="grid2" style="margin-top:12px"><div class="field"><label>Camera</label><select id="cameraSelect"></select></div><div class="field"><label>Microphone</label><select id="micSelect"></select></div></div><div class="deviceActions"><button class="btn" id="refreshDevices">Refresh devices</button><span class="tiny">External webcams and iPhone Continuity Camera appear here when macOS/browser exposes them as video devices.</span></div></div><div><div class="field"><label>Your name</label><input id="displayName" placeholder="Your name"></div><div class="field"><label>Meeting ID / invite link</label><input id="meetingInput" placeholder="LS-XXXXXXXXXX"></div><div class="grid2"><div class="field"><label>I speak</label><select id="speakLang"></select></div><div class="field"><label>Translate subtitles for me into</label><select id="subtitleLang"></select></div></div><div class="field"><label>Translate chat for me into</label><select id="chatLang"></select></div><div class="field"><label>Password</label><input id="joinPassword" type="password" placeholder="Optional"></div><div class="note">Your voice stays original. Only subtitles and incoming chat are translated to the languages you choose.</div><div class="noticeBar">Speech may be processed for live captions and transcription. Recording must be visibly indicated to everyone in the meeting. <a href="/privacy" target="_blank">Privacy</a> · <a href="/terms" target="_blank">Terms</a></div><div style="display:flex;gap:10px;margin-top:14px"><button class="btn primary" id="prejoinGo">Join meeting</button><button class="btn" data-close="prejoinModal">Cancel</button></div><div class="status" id="prejoinStatus"></div></div></div></div></div>

<div class="modal hidden" id="createModal"><div class="modalBox" style="width:min(620px,96vw)"><div class="modalHead"><h2>Create meeting</h2><button class="close" data-close="createModal">×</button></div><div class="field"><label>Meeting title</label><input id="createTitle" value="LinguaSpire Meeting"></div><div class="field"><label>Your name</label><input id="hostName"></div><div class="field"><label>Camera source</label><select id="hostCameraSource"><option value="computer">Mac / external camera</option><option value="phone">iPhone / phone camera</option></select><div class="tiny" id="hostCameraHint">Use a camera connected to this computer.</div></div><div class="grid2"><div class="field"><label>I speak</label><select id="hostSpeak"></select></div><div class="field"><label>Translate subtitles for me into</label><select id="hostSubtitle"></select></div></div><div class="field"><label>Translate chat for me into</label><select id="hostChat"></select></div><div class="field"><label>Password</label><input id="hostPassword" type="password" placeholder="Optional"></div><div class="row"><div class="rowText"><b>Waiting room</b><span>Require approval before guests enter.</span></div><button class="switch on" id="waitingToggle" aria-label="Toggle waiting room"></button></div><div class="noticeBar">Live captions/transcription may process speech. Inform participants before recording. <a href="/privacy" target="_blank">Privacy</a> · <a href="/terms" target="_blank">Terms</a></div><div style="display:flex;gap:10px;margin-top:16px"><button class="btn primary" id="createGo">Start meeting</button><button class="btn" data-close="createModal">Cancel</button></div><div class="status" id="createStatus"></div></div></div>

<div class="modal hidden" id="scheduleModal"><div class="modalBox" style="width:min(520px,96vw)"><div class="modalHead"><h2>Schedule meeting</h2><button class="close" data-close="scheduleModal">×</button></div><div class="field"><label>Title</label><input id="scheduleTitle" value="LinguaSpire Meeting"></div><div class="field"><label>Date & time</label><input id="scheduleTime" type="datetime-local"></div><button class="btn primary" id="saveSchedule" style="margin-top:14px">Save</button></div></div>

<div class="modal hidden" id="waitingModal"><div class="modalBox" style="width:min(420px,94vw)"><h2>Waiting for the host</h2><p class="sectionSub">You will enter automatically after the host admits you.</p><div class="status" id="waitingStatus">Waiting…</div></div></div>

<script type="module">
// Keep the main interface interactive even when a third-party SDK CDN is unavailable.
// Load LiveKit only when a user starts or joins a call.
let Room, RoomEvent, Track, VideoPresets;
let livekitLoading = null;
async function ensureLiveKit() {
  if (Room && RoomEvent && Track && VideoPresets) return;
  if (!livekitLoading) {
    livekitLoading = (async () => {
      const sources = [
        '/assets/livekit-client.mjs',
        'https://esm.sh/livekit-client@2.15.4?bundle',
        'https://cdn.jsdelivr.net/npm/livekit-client@2.15.4/dist/livekit-client.esm.mjs'
      ];
      for (const src of sources) {
        try {
          const lib = await Promise.race([
            import(/* @vite-ignore */ src),
            new Promise((_, reject) => setTimeout(() => reject(new Error('SDK_TIMEOUT')), 6500))
          ]);
          if (!lib.Room || !lib.RoomEvent || !lib.Track || !lib.VideoPresets) continue;
          ({ Room, RoomEvent, Track, VideoPresets } = lib);
          return;
        } catch (e) { console.warn('LinguaSpire video SDK unavailable at', src, e); }
      }
      throw new Error('Video engine could not load. Check your internet/CDN connection. The meeting was not started.');
    })().catch(err => { livekitLoading = null; throw err; });
  }
  return livekitLoading;
}
window.addEventListener('error', e => {
  const status=document.getElementById('globalStatus');
  if(status && /cdn|module|script|livekit|sdk/i.test(String(e?.message||''))) {
    status.title = 'Video component failed to load; use Network Test or retry.';
  }
});

const ROOM_API='${ROOM_API}';
const $=id=>document.getElementById(id);
const UI_TEXT={
en:['Home','Recordings','Settings','Network','About','Join Meeting','Start Meeting','Schedule Meeting','Share Screen','Mic','Camera','Phone Camera','Captions','Panel','Leave','System Ready'],
ru:['Главная','Записи','Настройки','Сеть','О приложении','Подключиться','Начать встречу','Запланировать','Показать экран','Микрофон','Камера','Камера телефона','Субтитры','Панель','Выйти','Система готова'],
zh:['主页','录制','设置','网络','关于','加入会议','开始会议','安排会议','共享屏幕','麦克风','摄像头','手机摄像头','字幕','面板','离开','系统就绪'],
ja:['ホーム','録画','設定','ネットワーク','情報','会議に参加','会議を開始','会議を予約','画面共有','マイク','カメラ','スマホカメラ','字幕','パネル','退出','システム準備完了'],
ko:['홈','녹화','설정','네트워크','정보','회의 참가','회의 시작','회의 예약','화면 공유','마이크','카메라','휴대폰 카메라','자막','패널','나가기','시스템 준비됨'],
de:['Start','Aufnahmen','Einstellungen','Netzwerk','Info','Meeting beitreten','Meeting starten','Meeting planen','Bildschirm teilen','Mikrofon','Kamera','Handy-Kamera','Untertitel','Panel','Verlassen','System bereit'],
fr:['Accueil','Enregistrements','Paramètres','Réseau','À propos','Rejoindre','Démarrer','Planifier','Partager l’écran','Micro','Caméra','Caméra du téléphone','Sous-titres','Panneau','Quitter','Système prêt'],
it:['Home','Registrazioni','Impostazioni','Rete','Informazioni','Partecipa','Avvia riunione','Pianifica','Condividi schermo','Microfono','Fotocamera','Fotocamera telefono','Sottotitoli','Pannello','Esci','Sistema pronto']
};
function applyCoreLocale(lang){const t=UI_TEXT[lang]||UI_TEXT.en;document.documentElement.lang=lang;document.querySelectorAll('.navbtn').forEach((b,i)=>{const s=b.querySelector('span:last-child');if(s&&i<5)s.textContent=t[i]});[['joinQuick',5],['startQuick',6],['scheduleQuick',7],['shareQuick',8]].forEach(([id,i])=>{const x=$(id)?.querySelector('.quickText b');if(x)x.textContent=t[i]});[['micBtn',9],['camBtn',10],['phoneCamBtn',11],['captionsBtn',12],['panelBtn',13],['leaveBtn',14]].forEach(([id,i])=>{if($(id))$(id).textContent=t[i]});if($('globalStatus'))$('globalStatus').lastChild.textContent=t[15]}

const langList=[['auto','Auto-detect'],['en','English'],['ru','Русский'],['zh','中文'],['ja','日本語'],['ko','한국어'],['de','Deutsch'],['fr','Français'],['it','Italiano']];
const receiveLangs=langList.filter(x=>x[0]!=='auto');
const state={page:'meetings',room:null,roomId:'',requestId:'',hostSecret:'',isHost:false,name:'',speak:'auto',subtitle:'en',chat:'en',previewStream:null,rec:null,recStream:null,captionsOn:true,sideOpen:true,activeTab:'participants',waitingTimer:null,hostTimer:null,messages:[],autoShare:false,phoneRoom:null,phonePreviewStream:null,phoneRequestId:'',phoneFacing:'environment',phoneHostMode:false,settings:loadSettings()};
const enc=new TextEncoder(),dec=new TextDecoder();

function loadSettings(){try{return Object.assign({theme:'system',joinMic:true,joinCam:true,mirror:true,noise:true,echo:true,autoGain:true,captionMode:'translated',captionFont:'medium',industry:'general',vocab:'',uiLanguage:'English',recordTranscription:true,cameraDevice:'',micDevice:'',captionsEnabled:true},JSON.parse(localStorage.getItem('ls.settings')||'{}'))}catch{return {theme:'system',cameraDevice:'',micDevice:'',captionsEnabled:true}}}
function saveSettings(){localStorage.setItem('ls.settings',JSON.stringify(state.settings))}
function setTheme(){let t=state.settings.theme||'system';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;const b=$('themeBtn');if(b){b.classList.toggle('isDark',t==='dark');b.setAttribute('aria-pressed',t==='dark'?'true':'false')}}
setTheme();
const initialUiLang=(localStorage.getItem('ls.uiLanguage')||(navigator.language||'en').slice(0,2));if($('uiLangSelect')){$('uiLangSelect').value=UI_TEXT[initialUiLang]?initialUiLang:'en';$('uiLangSelect').onchange=()=>{const l=$('uiLangSelect').value;localStorage.setItem('ls.uiLanguage',l);applyCoreLocale(l)}}applyCoreLocale(UI_TEXT[initialUiLang]?initialUiLang:'en');
document.querySelectorAll('.status').forEach(x=>{x.setAttribute('role','status');x.setAttribute('aria-live','polite')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const open=[...document.querySelectorAll('.modal:not(.hidden)')].pop();if(open)open.classList.add('hidden')}});
$('themeBtn').onclick=()=>{const dark=document.documentElement.dataset.theme==='dark';state.settings.theme=dark?'light':'dark';saveSettings();setTheme()};

for(const [code,name] of receiveLangs){for(const id of ['subtitleLang','chatLang','hostSubtitle','hostChat','meetingSubtitleLang']){const o=document.createElement('option');o.value=code;o.textContent=name;$(id).appendChild(o)}}
for(const [code,name] of langList){for(const id of ['speakLang','hostSpeak']){const o=document.createElement('option');o.value=code;o.textContent=name;$(id).appendChild(o)}}
const browserLang=(navigator.language||'en').slice(0,2);const defaultRecv=receiveLangs.some(x=>x[0]===browserLang)?browserLang:'en';['subtitleLang','chatLang','hostSubtitle','hostChat','meetingSubtitleLang'].forEach(id=>$(id).value=defaultRecv);$('speakLang').value='auto';$('hostSpeak').value='auto';

function show(id){$(id).classList.remove('hidden')}function hide(id){$(id).classList.add('hidden')}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>hide(b.dataset.close));
function setStatus(id,msg,kind=''){const e=$(id);e.textContent=msg;e.className='status '+kind}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmtLang(code){return (langList.find(x=>x[0]===code)||[code,code])[1]}
function meetingIdFromInput(v){try{if(v.includes('://')){const u=new URL(v);return (u.searchParams.get('room')||'').trim().toUpperCase()}}catch{}return v.trim().toUpperCase()}
async function api(path,opts={}){const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(ROOM_API+path,{...opts,signal:opts.signal||ctrl.signal,headers:{'Content-Type':'application/json',...(opts.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||('HTTP '+r.status));return d}catch(e){if(e?.name==='AbortError')throw new Error('Room API timed out. Use Network Test to check availability.');if(e instanceof TypeError)throw new Error('Could not connect to Room API. Check the Network page and your connection.');throw e}finally{clearTimeout(timer)}}
async function translate(text,target,source='auto'){if(!text)return text;const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),8000);try{const r=await fetch('/api/translate',{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({q:text,target,source})});const d=await r.json();return d.translatedText||('[Translation unavailable] '+text)}catch{return '[Translation unavailable] '+text}finally{clearTimeout(timer)}}

function nav(page){state.page=page;document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.page===page));['meetings','recordings','settings','network','about'].forEach(p=>$(p+'Page').classList.toggle('hidden',p!==page));$('meetingPage').classList.add('hidden');if(page==='settings')renderSettings();if(page==='network')renderNetwork()}
document.querySelectorAll('.navbtn[data-page]').forEach(b=>b.onclick=()=>nav(b.dataset.page));

const now=new Date();$('todayName').textContent=now.toLocaleDateString(undefined,{weekday:'long'});$('todayDate').textContent=now.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
function renderSchedule(){const items=JSON.parse(localStorage.getItem('ls.schedule')||'[]');const box=$('upcomingList');box.innerHTML='';if(!items.length){box.innerHTML='<div class="empty">No meetings scheduled</div>';return}items.sort((a,b)=>a.time.localeCompare(b.time)).forEach(m=>{const d=document.createElement('div');d.className='meetingItem';d.innerHTML='<b>'+escapeHtml(m.title)+'</b><div class="tiny">'+new Date(m.time).toLocaleString()+'</div>';box.appendChild(d)})}renderSchedule();
$('clearSchedule').onclick=()=>{localStorage.removeItem('ls.schedule');renderSchedule()};$('scheduleQuick').onclick=()=>show('scheduleModal');$('scheduleSideBtn').onclick=()=>show('scheduleModal');$('scheduleFromDate').onclick=()=>show('scheduleModal');$('saveSchedule').onclick=()=>{const title=$('scheduleTitle').value.trim()||'LinguaSpire Meeting';const time=$('scheduleTime').value;if(!time)return;const items=JSON.parse(localStorage.getItem('ls.schedule')||'[]');items.push({title,time});localStorage.setItem('ls.schedule',JSON.stringify(items));hide('scheduleModal');renderSchedule()};

$('joinQuick').onclick=()=>{state.autoShare=false;openPrejoin(false)};$('startQuick').onclick=()=>{state.autoShare=false;$('createTitle').value='LinguaSpire Meeting';show('createModal')};$('shareQuick').onclick=()=>{state.autoShare=true;show('createModal');$('createTitle').value='Quick Screen Share'};$('hostCameraSource').onchange=()=>{const phone=$('hostCameraSource').value==='phone';$('hostCameraHint').textContent=phone?'After the meeting starts, LinguaSpire will show a pairing code. Open LinguaSpire on your phone, choose Phone Camera, and enter the code. Your Mac camera will stay off.':'Use a camera connected to this computer.'};if($('phoneQuick'))$('phoneQuick').onclick=async()=>{document.querySelector('.app')?.classList.add('hidden');$('phoneCameraPage').classList.remove('hidden');$('phonePairInput').value='';$('phoneCameraStatus').textContent='';$('phoneLiveBadge').classList.add('hidden');await startPhonePreview()};$('phoneBackHome').onclick=()=>{try{state.phoneRoom?.disconnect()}catch{}state.phoneRoom=null;stopPhonePreview();$('phoneCameraPage').classList.add('hidden');document.querySelector('.app')?.classList.remove('hidden');nav('meetings')};

async function listDevices(){
  try{
    const devices=await navigator.mediaDevices.enumerateDevices();
    const cams=devices.filter(d=>d.kind==='videoinput');
    const mics=devices.filter(d=>d.kind==='audioinput');
    fillDevice('cameraSelect',cams,state.settings.cameraDevice,'Camera');
    fillDevice('micSelect',mics,state.settings.micDevice,'Microphone');
    fillDevice('settingsCamera',cams,state.settings.cameraDevice,'Camera');
    fillDevice('settingsMic',mics,state.settings.micDevice,'Microphone');
    const cs=$('cameraStatus');if(cs&&cs.textContent==='Not tested')cs.textContent=cams.length+' camera'+(cams.length===1?'':'s')+' detected';return {cams,mics};
  }catch{return {cams:[],mics:[]}}
}
function fillDevice(id,items,preferred='',fallback='Device'){
  const s=$(id);if(!s)return;s.innerHTML='';
  if(!items.length){const o=document.createElement('option');o.value='';o.textContent='No device detected';s.appendChild(o);return}
  items.forEach((d,i)=>{const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||fallback+' '+(i+1);s.appendChild(o)});
  const wanted=preferred&&items.some(d=>d.deviceId===preferred)?preferred:items[0].deviceId;
  s.value=wanted;
}
async function requestDevicePermission(){
  try{const p=await navigator.mediaDevices.getUserMedia({video:true,audio:true});p.getTracks().forEach(t=>t.stop());return true}catch{return false}
}
async function startPreview(){
  stopPreview();
  try{
    if(!$('cameraSelect')?.options.length||!$('micSelect')?.options.length){await requestDevicePermission();await listDevices()}
    const cam=$('cameraSelect')?.value||state.settings.cameraDevice||'';
    const mic=$('micSelect')?.value||state.settings.micDevice||'';
    if(cam)state.settings.cameraDevice=cam;if(mic)state.settings.micDevice=mic;saveSettings();
    const video=state.settings.joinCam!==false?{deviceId:cam?{exact:cam}:undefined,width:{ideal:1280},height:{ideal:720}}:false;
    const audio=state.settings.joinMic!==false?{deviceId:mic?{exact:mic}:undefined,echoCancellation:state.settings.echo!==false,noiseSuppression:state.settings.noise!==false,autoGainControl:state.settings.autoGain!==false}:false;
    state.previewStream=await navigator.mediaDevices.getUserMedia({video,audio});
    $('previewVideo').srcObject=state.previewStream;$('previewVideo').style.transform=state.settings.mirror?'scaleX(-1)':'';$('previewEmpty').classList.add('hidden');
    await listDevices();
  }catch(e){$('previewEmpty').classList.remove('hidden');$('previewEmpty').textContent='Camera or microphone unavailable'}
}
function stopPreview(){state.previewStream?.getTracks().forEach(t=>t.stop());state.previewStream=null;if($('previewVideo'))$('previewVideo').srcObject=null}
async function openPrejoin(isCreate){$('prejoinTitle').textContent=isCreate?'Preview before joining':'Join meeting';show('prejoinModal');await requestDevicePermission();await listDevices();await startPreview();const q=new URL(location.href).searchParams.get('room');if(q)$('meetingInput').value=q}
$('cameraSelect').onchange=()=>{state.settings.cameraDevice=$('cameraSelect').value;saveSettings();startPreview()};$('refreshDevices').onclick=async()=>{await requestDevicePermission();await listDevices();await startPreview()};
$('micSelect').onchange=()=>{state.settings.micDevice=$('micSelect').value;saveSettings();startPreview()};
$('previewMic').onclick=()=>{state.settings.joinMic=!state.settings.joinMic;saveSettings();startPreview()};
$('previewCam').onclick=()=>{state.settings.joinCam=!state.settings.joinCam;saveSettings();startPreview()};
if(navigator.mediaDevices?.addEventListener)navigator.mediaDevices.addEventListener('devicechange',async()=>{await listDevices();if(state.page==='settings')startSettingsPreview()});


async function generatePhonePairCode(){
  if(!state.roomId)throw new Error('Start or join a meeting first.');
  $('phonePairStatus').textContent='Generating pairing code...';
  const headers=state.hostSecret?{Authorization:'Bearer '+state.hostSecret}:{};
  const d=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/camera-pair',{method:'POST',headers,body:JSON.stringify({requestId:state.requestId})});
  state.phonePairCode=d.code;
  $('phonePairCodeDisplay').textContent=d.code.slice(0,3)+' '+d.code.slice(3);
  $('phonePairStatus').textContent='Open LinguaSpire on your phone, choose Phone Camera, and enter this code.';
  return d.code;
}
async function openPhonePair(){
  if(!state.roomId){alert('Start or join a meeting first.');return}
  show('phonePairModal');
  try{await generatePhonePairCode()}catch(e){$('phonePairStatus').textContent=e.message||'Could not generate pairing code.'}
}
$('phoneCamBtn').onclick=openPhonePair;
$('closePhonePair').onclick=()=>hide('phonePairModal');
$('backToMeetingBtn').onclick=()=>hide('phonePairModal');
$('mainMenuBtn').onclick=()=>{try{stopCC()}catch{}try{clearInterval(state.hostTimer)}catch{}try{clearInterval(state.waitingTimer)}catch{}try{state.room?.disconnect()}catch{}state.room=null;hide('phonePairModal');location.href=location.pathname};
$('copyPhoneCode').onclick=async()=>{if(!state.phonePairCode)await generatePhonePairCode();await navigator.clipboard.writeText(state.phonePairCode);$('phonePairStatus').textContent='Pairing code copied.'};
$('newPhoneCode').onclick=async()=>{try{await generatePhonePairCode()}catch(e){$('phonePairStatus').textContent=e.message||'Could not generate a new code.'}};

async function listPhoneCameras(){
  try{
    const devices=await navigator.mediaDevices.enumerateDevices();
    const cams=devices.filter(d=>d.kind==='videoinput');
    const s=$('phoneCameraSelect');s.innerHTML='';
    cams.forEach((d,i)=>{const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||('Camera '+(i+1));s.appendChild(o)});
    return cams;
  }catch{return []}
}
function stopPhonePreview(){
  state.phonePreviewStream?.getTracks().forEach(t=>t.stop());state.phonePreviewStream=null;
  if($('phonePreview'))$('phonePreview').srcObject=null;
}
async function startPhonePreview(preferFacing=state.phoneFacing){
  stopPhonePreview();
  const status=$('phoneCameraStatus'),empty=$('phonePreviewEmpty');
  try{
    status.textContent='Requesting phone camera…';
    let constraints={video:{facingMode:{ideal:preferFacing},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30}},audio:false};
    let s=await navigator.mediaDevices.getUserMedia(constraints);
    state.phonePreviewStream=s;
    const v=$('phonePreview');v.srcObject=s;await v.play().catch(()=>{});
    empty.classList.add('hidden');
    await listPhoneCameras();
    const track=s.getVideoTracks()[0];
    const label=track?.label||'Phone camera';
    status.textContent='Camera ready • '+label;
    const ds=await navigator.mediaDevices.enumerateDevices();
    const active=ds.find(d=>d.kind==='videoinput'&&d.label===label);
    if(active&&$('phoneCameraSelect'))$('phoneCameraSelect').value=active.deviceId;
  }catch(e){
    empty.classList.remove('hidden');
    const n=String(e?.name||'');
    const msg=(n==='NotAllowedError')?'Camera permission denied. Allow camera access in Safari/Chrome.':(n==='NotFoundError'?'No phone camera found.':'Could not start the phone camera.');
    empty.textContent=msg;status.textContent=msg;
  }
}
$('phoneStartPreview').onclick=()=>startPhonePreview();
$('phoneFlipCamera').onclick=async()=>{state.phoneFacing=state.phoneFacing==='environment'?'user':'environment';await startPhonePreview(state.phoneFacing)};
$('phoneCameraSelect').onchange=async()=>{
  const id=$('phoneCameraSelect').value;if(!id)return;
  stopPhonePreview();
  try{const s=await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:id},width:{ideal:1920},height:{ideal:1080}},audio:false});state.phonePreviewStream=s;$('phonePreview').srcObject=s;await $('phonePreview').play().catch(()=>{});$('phonePreviewEmpty').classList.add('hidden');$('phoneCameraStatus').textContent='Selected camera ready.'}catch{$('phoneCameraStatus').textContent='Could not switch to that camera.'}
};

async function connectPhoneRoom(){
  const tok=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/token',{method:'POST',body:JSON.stringify({requestId:state.phoneRequestId})});
  await ensureLiveKit();state.phoneRoom=new Room({adaptiveStream:true,dynacast:true,videoCaptureDefaults:{resolution:VideoPresets.h1080.resolution}});
  await state.phoneRoom.connect(tok.serverUrl,tok.token);
  const selected=$('phoneCameraSelect').value||'';
  await state.phoneRoom.localParticipant.setCameraEnabled(true,{deviceId:selected||undefined,resolution:VideoPresets.h1080.resolution});
  await state.phoneRoom.localParticipant.setMicrophoneEnabled(false);
  stopPhonePreview();
  $('phoneLiveBadge').classList.remove('hidden');
  $('phonePreviewEmpty').classList.add('hidden');
  $('phoneCameraStatus').innerHTML='<span class="phoneCamConnected">Connected to meeting • phone camera is live</span>';
  for(const pub of state.phoneRoom.localParticipant.videoTrackPublications.values()){if(pub.track){const el=pub.track.attach();el.autoplay=true;el.playsInline=true;el.muted=true;const old=$('phonePreview');old.replaceWith(el);el.id='phonePreview';break}}
}
function pollPhoneJoin(){
  clearInterval(state.waitingTimer);
  state.waitingTimer=setInterval(async()=>{
    try{
      const s=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/join/'+encodeURIComponent(state.phoneRequestId));
      if(s.status==='approved'){clearInterval(state.waitingTimer);await connectPhoneRoom()}
      else if(s.status==='denied'){clearInterval(state.waitingTimer);$('phoneCameraStatus').textContent='Host declined the phone camera.'}
      else $('phoneCameraStatus').textContent='Waiting for the host to admit this phone camera…';
    }catch{}
  },1400)
}
$('phoneJoinCamera').onclick=async()=>{
  try{
    if(!state.phonePreviewStream)await startPhonePreview();
    const pairing=String($('phonePairInput').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(pairing.length!==6)throw new Error('Enter the 6-character pairing code shown on your computer.');
    const nm=$('phoneCameraName').value.trim()||'Phone Camera';
    $('phoneCameraStatus').textContent='Pairing with meeting...';
    const j=await api('/v1/camera-pair/redeem',{method:'POST',body:JSON.stringify({code:pairing,name:nm})});
    state.roomId=j.roomId;state.phoneRequestId=j.requestId;
    await connectPhoneRoom();
  }catch(e){
    const msg=String(e.message||'Could not connect phone camera.');
    $('phoneCameraStatus').textContent=msg.includes('PAIR_CODE')?'Pairing code is invalid or expired. Generate a new code on the computer.':msg;
  }
};

$('prejoinGo').onclick=async()=>{setStatus('prejoinStatus','Connecting…');try{state.name=$('displayName').value.trim();state.roomId=meetingIdFromInput($('meetingInput').value);state.speak=$('speakLang').value;state.subtitle=$('subtitleLang').value;state.chat=$('chatLang').value;if(!state.name||!state.roomId)throw new Error('Enter your name and meeting ID');await ensureLiveKit();stopPreview();const j=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/join',{method:'POST',body:JSON.stringify({name:state.name,password:$('joinPassword').value,language:state.subtitle})});state.requestId=j.requestId;if(j.status==='approved'){hide('prejoinModal');await connectRoom()}else{hide('prejoinModal');show('waitingModal');pollJoin()}}catch(e){setStatus('prejoinStatus',e.message,'err')}};

$('waitingToggle').onclick=()=>$('waitingToggle').classList.toggle('on');
$('createGo').onclick=async()=>{setStatus('createStatus','Creating…');try{state.name=$('hostName').value.trim();if(!state.name)throw new Error('Enter your name');await ensureLiveKit();state.speak=$('hostSpeak').value;state.subtitle=$('hostSubtitle').value;state.chat=$('hostChat').value;state.isHost=true;state.phoneHostMode=$('hostCameraSource').value==='phone';const d=await api('/v1/rooms',{method:'POST',body:JSON.stringify({title:$('createTitle').value.trim()||'LinguaSpire Meeting',hostName:state.name,password:$('hostPassword').value,waitingRoom:$('waitingToggle').classList.contains('on'),expiresInSeconds:86400})});state.roomId=d.id;state.hostSecret=d.hostSecret;const j=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/join',{method:'POST',body:JSON.stringify({name:state.name,password:$('hostPassword').value,language:state.subtitle})});state.requestId=j.requestId;if(j.status!=='approved'){await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/waiting/'+encodeURIComponent(state.requestId),{method:'POST',headers:{Authorization:'Bearer '+state.hostSecret},body:JSON.stringify({approve:true})})}hide('createModal');await connectRoom()}catch(e){setStatus('createStatus',e.message,'err')}};

function pollJoin(){clearInterval(state.waitingTimer);state.waitingTimer=setInterval(async()=>{try{const s=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/join/'+encodeURIComponent(state.requestId));if(s.status==='approved'){clearInterval(state.waitingTimer);hide('waitingModal');await connectRoom()}else if(s.status==='denied'){clearInterval(state.waitingTimer);$('waitingStatus').textContent='Host declined the request.'}}catch{}},1500)}

const tileId=id=>'tile-'+id.replace(/[^a-zA-Z0-9_-]/g,'_');
function getTile(p,local=false){let e=$(tileId(p.identity));if(e)return e;e=document.createElement('div');e.id=tileId(p.identity);e.className='tile';const v=document.createElement('video');v.autoplay=true;v.playsInline=true;if(local)v.muted=true;const name=document.createElement('div');name.className='tileName';name.textContent=(p.name||p.identity)+(local?' (You)':'');const badges=document.createElement('div');badges.className='tileBadges';badges.innerHTML='<span class="smallBadge">'+(local?fmtLang(state.speak):'Live')+'</span>';const cap=document.createElement('div');cap.className='caption hidden';cap.dataset.caption='1';e.append(v,name,badges,cap);$('videoGrid').appendChild(e);return e}
function attachTrack(track,p){if(track.kind!==Track.Kind.Video&&track.kind!==Track.Kind.Audio)return;const e=getTile(p,p===state.room.localParticipant),m=track.attach();if(track.kind===Track.Kind.Video){const old=e.querySelector('video');old.replaceWith(m);m.autoplay=true;m.playsInline=true;if(p===state.room.localParticipant){m.muted=true;m.style.transform=state.settings.mirror?'scaleX(-1)':''}}else{m.style.display='none';e.appendChild(m)}}
function setCaption(identity,text){const e=$(tileId(identity));if(!e)return;const c=e.querySelector('[data-caption]');c.textContent=text;c.classList.toggle('hidden',!text||!state.captionsOn);clearTimeout(c._timer);c._timer=setTimeout(()=>c.classList.add('hidden'),7000)}
function renderPeople(){const body=$('sideBody');body.innerHTML='';if(!state.room)return;for(const p of [state.room.localParticipant,...state.room.remoteParticipants.values()]){const d=document.createElement('div');d.className='person';d.innerHTML='<span><b>'+escapeHtml(p.name||p.identity)+'</b><div class="tiny">'+(p===state.room.localParticipant?'You':'Participant')+'</div></span><span>●</span>';body.appendChild(d)}}
function addTranscript(who,original,translated){const item={time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),who,original,translated};state.transcript=(state.transcript||[]);state.transcript.push(item);if(state.activeTab==='transcript')renderTranscript()}
function renderTranscript(){const body=$('sideBody');body.innerHTML='';for(const x of state.transcript||[]){const d=document.createElement('div');d.className='transcriptLine';d.innerHTML='<b>'+escapeHtml(x.who)+'</b><small>'+x.time+'</small><div>'+escapeHtml(x.translated)+'</div>'+(state.settings.captionMode==='both'?'<small>'+escapeHtml(x.original)+'</small>':'');body.appendChild(d)}}
function renderChat(){const body=$('sideBody');body.innerHTML='';if(!state.messages.length){body.innerHTML='<div class=\"empty\">Translated messages will appear here.</div>';return}for(const x of state.messages){const d=document.createElement('div');d.className='msg';d.innerHTML='<b>'+escapeHtml(x.who)+'</b><div>'+escapeHtml(x.text)+'</div>'+(x.original&&state.settings.captionMode==='both'?'<small>Original: '+escapeHtml(x.original)+'</small>':'');d.dataset.mine=x.mine?'1':'0';body.appendChild(d)}body.scrollTop=body.scrollHeight}
function chatLine(who,text,isMine=false,original=''){state.messages.push({who,text,mine:isMine,original,time:Date.now()});if(state.activeTab==='chat')renderChat()}
async function onData(payload,p){try{const d=JSON.parse(dec.decode(payload));if(d.type==='caption'){if(p)getTile(p,false);const translated=await translate(d.text,state.subtitle,d.source||'auto');if(d.sentAt){state.captionLatencies=state.captionLatencies||[];state.captionLatencies.push(Math.max(0,Date.now()-Number(d.sentAt)));if(state.captionLatencies.length>40)state.captionLatencies.shift()}setCaption(p?.identity||d.identity,translated);addTranscript(p?.name||d.name||'Guest',d.text,translated)}if(d.type==='chat'){const translated=await translate(d.text,state.chat,d.source||'auto');chatLine(p?.name||d.name||'Guest',translated,false,d.text)}}catch(err){console.warn('[LinguaSpire] Incoming translation/data error',err);captionStatus('Incoming subtitles error: '+String(err?.message||err).slice(0,90),true)}}

async function publishCaption(text,language='auto'){if(!text.trim()||!state.room)return;const identity=state.room.localParticipant.identity;await state.room.localParticipant.publishData(enc.encode(JSON.stringify({type:'caption',text,source:language,name:state.name,identity,sentAt:Date.now()})),{reliable:true});const localTranslated=await translate(text,state.subtitle,language);setCaption(identity,localTranslated);addTranscript(state.name,text,localTranslated)}
function captionStatus(message,problem=false){
  const e=$('captionBadge');if(!e)return;
  e.textContent=message;
  e.title=problem?'Check microphone permission and Network Test for the failing service.':'LinguaSpire live speech recognition';
  if(problem)console.warn('[LinguaSpire captions]',message);
}
async function sendCaptionAudio(part,session){
  if(state.ccSession!==session || !state.room || !state.room.localParticipant.isMicrophoneEnabled)return;
  const fd=new FormData();
  fd.append('audio_file',part.blob,part.type.includes('mp4')?'speech.m4a':'speech.webm');
  fd.append('language',state.speak||'auto');
  fd.append('vocab',state.settings.vocab||'');
  fd.append('profile',state.settings.industry||'general');
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),18000);
  try{
    captionStatus('Recognizing speech…');
    const r=await fetch('/api/asr',{method:'POST',body:fd,signal:ctrl.signal});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(String(d.error||'ASR HTTP '+r.status));
    if(state.ccSession!==session)return;
    const text=String(d.text||'').trim();
    if(text){
      captionStatus('Translating • '+fmtLang(state.subtitle));
      await publishCaption(text,d.language||state.speak);
      if(state.ccSession===session)captionStatus('Live captions • '+fmtLang(state.subtitle));
    }else{
      captionStatus('Listening • '+fmtLang(state.subtitle)+(d.rejected?' (speech unclear)':''));
    }
  }catch(err){
    if(state.ccSession===session)captionStatus('Captions error: '+String(err?.message||'network unavailable').slice(0,100),true);
  }finally{clearTimeout(timer)}
}
function consumeCaptionQueue(session){
  if(state.ccBusy||state.ccSession!==session)return;
  state.ccBusy=true;
  (async()=>{while(state.ccSession===session&&state.ccQueue?.length){
    const part=state.ccQueue.shift();await sendCaptionAudio(part,session);
  }})().finally(()=>{state.ccBusy=false;if(state.ccSession===session&&state.ccQueue?.length)consumeCaptionQueue(session)});
}
async function startCC(){
  stopCC();
  if(!state.captionsOn||state.settings.captionsEnabled===false){captionStatus('Captions disabled');return}
  const session=String(Date.now())+Math.random();state.ccSession=session;
  captionStatus('Microphone starting…');
  try{
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('Browser microphone recording unsupported');
    const mic=state.settings.micDevice||'';
    const stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:mic?{ideal:mic}:undefined,echoCancellation:state.settings.echo!==false,noiseSuppression:state.settings.noise!==false,autoGainControl:state.settings.autoGain!==false,channelCount:1}});
    if(state.ccSession!==session){stream.getTracks().forEach(t=>t.stop());return}
    state.recStream=stream;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)throw new Error('AudioContext unavailable');
    const ctx=new AC();const source=ctx.createMediaStreamSource(stream),an=ctx.createAnalyser();an.fftSize=1024;source.connect(an);
    if(ctx.state==='suspended')await ctx.resume().catch(()=>{});
    const levels=new Float32Array(an.fftSize);
    let voiced=0,peak=0,samples=0;
    const meter=setInterval(()=>{if(state.ccSession!==session)return;
      an.getFloatTimeDomainData(levels);let energy=0;
      for(const x of levels)energy+=x*x;
      const rms=Math.sqrt(energy/levels.length);
      peak=Math.max(peak,rms);samples++;
      // Normal speech often has RMS below .022. Let server-side VAD decide whether audio is speech.
      if(rms>.005)voiced++;
    },100);
    let chunks=[];
    const mime=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':(MediaRecorder.isTypeSupported('audio/mp4')?'audio/mp4':'');
    const rec=mime?new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:96000}):new MediaRecorder(stream);
    state.rec=rec;state.ccQueue=[];state.ccBusy=false;
    const scheduleStop=()=>{clearTimeout(state.ccStopTimer);state.ccStopTimer=setTimeout(()=>{
      if(state.ccSession===session&&rec.state==='recording')rec.stop();
    },4200)};
    rec.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data)};
    rec.onerror=event=>{if(state.ccSession===session)captionStatus('Recorder error: '+String(event.error?.message||'unknown'),true)};
    rec.onstop=()=>{
      const part={blob:new Blob(chunks,{type:rec.mimeType||mime||'audio/webm'}),type:rec.mimeType||mime||'audio/webm',voiced,peak,samples};
      chunks=[];voiced=0;peak=0;samples=0;
      if(state.ccSession!==session||!state.room||!state.room.localParticipant.isMicrophoneEnabled)return;
      // Restart capture BEFORE uploading and translating the previous chunk.
      try{rec.start();scheduleStop()}catch(err){captionStatus('Recorder stopped: '+String(err.message||err),true);return}
      // Keep quiet-room traffic under control without suppressing naturally soft speech.
      if(part.blob.size<1400 || (part.voiced<1&&part.peak<.0025))return;
      if(state.ccQueue.length>=5)state.ccQueue.shift();
      state.ccQueue.push(part);consumeCaptionQueue(session);
    };
    stream.getAudioTracks().forEach(track=>track.addEventListener('ended',()=>{if(state.ccSession===session)captionStatus('Microphone disconnected',true)}));
    rec._cleanup=()=>{clearInterval(meter);clearTimeout(state.ccStopTimer);try{ctx.close()}catch{}};
    rec.start();scheduleStop();captionStatus('Listening • '+fmtLang(state.subtitle));
  }catch(err){
    if(state.ccSession===session){captionStatus('Subtitles unavailable: '+String(err?.message||err),true);stopCC(true)}
  }
}
function stopCC(keepStatus=false){
  state.ccSession=null;state.ccQueue=[];
  clearTimeout(state.ccStopTimer);
  const rec=state.rec;state.rec=null;
  try{rec?._cleanup?.()}catch{}
  try{if(rec){rec.onstop=null;if(rec.state==='recording')rec.stop()}}catch{}
  state.recStream?.getTracks().forEach(t=>t.stop());state.recStream=null;
  if(!keepStatus&&state.room)captionStatus('Captions stopped');
}
async function connectRoom(){await ensureLiveKit();const tok=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/token',{method:'POST',body:JSON.stringify({requestId:state.requestId})});state.room=new Room({adaptiveStream:true,dynacast:true,videoCaptureDefaults:{resolution:VideoPresets.h720.resolution,deviceId:state.settings.cameraDevice||undefined},audioCaptureDefaults:{deviceId:state.settings.micDevice||undefined,echoCancellation:state.settings.echo!==false,noiseSuppression:state.settings.noise!==false,autoGainControl:state.settings.autoGain!==false}});state.room.on(RoomEvent.TrackSubscribed,(t,pub,p)=>attachTrack(t,p));state.room.on(RoomEvent.LocalTrackPublished,p=>{if(p.track)attachTrack(p.track,state.room.localParticipant)});state.room.on(RoomEvent.ParticipantConnected,()=>{if(state.activeTab==='participants')renderPeople()});state.room.on(RoomEvent.ParticipantDisconnected,p=>{$(tileId(p.identity))?.remove();if(state.activeTab==='participants')renderPeople()});state.room.on(RoomEvent.DataReceived,onData);
state.room.on(RoomEvent.Reconnecting,()=>{const b=$('connectionBanner');if(b){b.textContent='Connection interrupted — reconnecting…';b.className='connectionBanner'}$('globalStatus').lastChild.textContent=' Reconnecting'});
state.room.on(RoomEvent.Reconnected,()=>{const b=$('connectionBanner');if(b){b.textContent='Connection restored';b.className='connectionBanner ok';setTimeout(()=>b.classList.add('hidden'),1800)}$('globalStatus').lastChild.textContent=' System Ready';if(state.room.localParticipant.isMicrophoneEnabled&&!state.rec)startCC()});
state.room.on(RoomEvent.Disconnected,()=>{stopCC();const b=$('connectionBanner');if(b){b.textContent='Meeting disconnected. Rejoin from Home if needed.';b.className='connectionBanner bad'}});
state.room.on(RoomEvent.ConnectionQualityChanged,(quality,participant)=>{if(participant?.identity===state.room?.localParticipant?.identity&&String(quality).toLowerCase().includes('poor')){const b=$('connectionBanner');if(b){b.textContent='Poor network quality — video may be reduced automatically';b.className='connectionBanner';b.classList.remove('hidden');setTimeout(()=>b.classList.add('hidden'),3500)}}});
await state.room.connect(tok.serverUrl,tok.token);if(state.settings.joinMic!==false)await state.room.localParticipant.setMicrophoneEnabled(true,{deviceId:state.settings.micDevice||undefined,echoCancellation:state.settings.echo!==false,noiseSuppression:state.settings.noise!==false,autoGainControl:state.settings.autoGain!==false});if(state.settings.joinCam!==false&&!state.phoneHostMode)await state.room.localParticipant.setCameraEnabled(true,{deviceId:state.settings.cameraDevice||undefined});getTile(state.room.localParticipant,true);for(const p of state.room.localParticipant.trackPublications.values())if(p.track)attachTrack(p.track,state.room.localParticipant);['meetingsPage','recordingsPage','settingsPage','networkPage','aboutPage'].forEach(id=>hide(id));show('meetingPage');$('meetingIdLabel').textContent='Meeting ID: '+state.roomId;$('meetingSubtitleLang').value=state.subtitle;history.replaceState({},'', '?room='+encodeURIComponent(state.roomId));state.messages=[];state.transcript=[];state.activeTab='participants';renderTab();if(state.settings.joinMic!==false)startCC();if(state.autoShare){try{await state.room.localParticipant.setScreenShareEnabled(true);$('screenBtn').textContent='Stop share'}catch{}state.autoShare=false}if(state.isHost)startHostPoll();if(state.phoneHostMode){setTimeout(()=>openPhonePair(),450);state.phoneHostMode=false}}
function startHostPoll(){clearInterval(state.hostTimer);const f=async()=>{try{const d=await api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/waiting',{headers:{Authorization:'Bearer '+state.hostSecret}});const reqs=d.requests||[];state.waitingRequests=reqs;if(state.activeTab==='waiting')renderWaiting(reqs);const phoneReq=reqs.find(q=>/camera|iphone|phone/i.test(q.name||''));if(phoneReq&&$('phonePairStatus'))$('phonePairStatus').textContent='Phone camera is waiting for approval — open the Waiting tab and tap Admit.'}catch{}};f();state.hostTimer=setInterval(f,1500)}
function renderWaiting(reqs){const body=$('sideBody');body.innerHTML='';if(!reqs.length){body.innerHTML='<div class="empty">Nobody is waiting.</div>';return}for(const q of reqs){const d=document.createElement('div');d.className='person';const left=document.createElement('span');left.innerHTML='<b>'+escapeHtml(q.name||'Guest')+'</b>';const right=document.createElement('span');for(const [lab,ok] of [['Admit',true],['Deny',false]]){const b=document.createElement('button');b.className='btn '+(ok?'primary':'');b.style.padding='6px 8px';b.textContent=lab;b.onclick=()=>api('/v1/rooms/'+encodeURIComponent(state.roomId)+'/waiting/'+encodeURIComponent(q.requestId),{method:'POST',headers:{Authorization:'Bearer '+state.hostSecret},body:JSON.stringify({approve:ok})});right.appendChild(b)}d.append(left,right);body.appendChild(d)}}

function renderTab(){document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===state.activeTab));$('chatComposer').classList.toggle('hidden',state.activeTab!=='chat');if(state.activeTab==='participants')renderPeople();if(state.activeTab==='transcript')renderTranscript();if(state.activeTab==='chat')renderChat();if(state.activeTab==='waiting'){if(state.isHost)startHostPoll();else $('sideBody').innerHTML='<div class="empty">Only the host manages the waiting room.</div>'}}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{state.activeTab=t.dataset.tab;renderTab()});
$('sendChat').onclick=async()=>{const text=$('chatInput').value.trim();if(!text||!state.room)return;$('chatInput').value='';chatLine(state.name,text,true);await state.room.localParticipant.publishData(enc.encode(JSON.stringify({type:'chat',text,source:state.speak,name:state.name})),{reliable:true})};$('chatInput').onkeydown=e=>{if(e.key==='Enter')$('sendChat').click()};
$('meetingSubtitleLang').onchange=()=>{state.subtitle=$('meetingSubtitleLang').value;$('captionBadge').textContent='Listening • '+fmtLang(state.subtitle)};$('copyInvite').onclick=()=>navigator.clipboard.writeText(location.origin+location.pathname+'?room='+encodeURIComponent(state.roomId));
$('micBtn').onclick=async()=>{const on=!state.room.localParticipant.isMicrophoneEnabled;await state.room.localParticipant.setMicrophoneEnabled(on);$('micBtn').classList.toggle('off',!on);$('micBtn').textContent=on?'Mic':'Mic off';if(on)startCC();else stopCC()};$('camBtn').onclick=async()=>{const on=!state.room.localParticipant.isCameraEnabled;await state.room.localParticipant.setCameraEnabled(on);$('camBtn').classList.toggle('off',!on);$('camBtn').textContent=on?'Camera':'Camera off'};$('screenBtn').onclick=async()=>{const on=!state.room.localParticipant.isScreenShareEnabled;await state.room.localParticipant.setScreenShareEnabled(on);$('screenBtn').textContent=on?'Stop share':'Share'};$('captionsBtn').onclick=()=>{state.captionsOn=!state.captionsOn;$('captionsBtn').classList.toggle('off',!state.captionsOn);if(state.captionsOn&&state.room?.localParticipant?.isMicrophoneEnabled)startCC();else stopCC()};$('panelBtn').onclick=()=>{$('meetSide').classList.toggle('hidden')};$('leaveBtn').onclick=()=>{stopCC();clearInterval(state.hostTimer);state.room?.disconnect();state.room=null;location.href=location.pathname};

const settingSections=[['general','General'],['video','Video'],['audio','Audio'],['recording','Recording'],['appearance','Background & Appearance'],['captions','Captions & Translation'],['security','Security & Privacy'],['network','Network Test'],['shortcuts','Shortcuts'],['language','Language'],['about','About']];let activeSetting='general';
function renderSettings(){const nav=$('settingsNav');nav.innerHTML='';settingSections.forEach(([id,name])=>{const b=document.createElement('button');b.className='setnav'+(id===activeSetting?' active':'');b.textContent=name;b.onclick=()=>{activeSetting=id;renderSettings()};nav.appendChild(b)});const p=$('settingsPane');p.innerHTML=settingsHTML(activeSetting);wireSettings(activeSetting)}
function sw(label,key,desc=''){return '<div class="row"><div class="rowText"><b>'+label+'</b><span>'+desc+'</span></div><button class="switch '+(state.settings[key]!==false?'on':'')+'" data-setting="'+key+'"></button></div>'}
function settingsHTML(id){if(id==='general')return '<h2 class="sectionTitle">General</h2><p class="sectionSub">Meeting behavior and application preferences.</p>'+sw('Turn on mic when joining','joinMic','Start meetings with your microphone enabled.')+sw('Enable camera when joining','joinCam','Start meetings with your camera enabled.')+sw('Show active speaker','showSpeaker')+sw('Display connected time','showTime')+sw('Always show toolbar','showToolbar')+'<div class="row"><div class="rowText"><b>Theme</b><span>Choose the application appearance.</span></div><select id="themeSetting" class="btn"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div>';
if(id==='video')return '<h2 class="sectionTitle">Video</h2><p class="sectionSub">LinguaSpire can use every camera that macOS and your browser expose as a video input.</p><div class="previewBox" style="max-width:680px"><video id="settingsPreview" autoplay muted playsinline></video><div class="previewEmpty" id="settingsPreviewEmpty">Camera preview</div></div><div class="grid2" style="margin-top:14px"><div class="field"><label>Camera</label><select id="settingsCamera"></select></div><div class="field"><label>Camera status</label><div class="deviceStatus" id="cameraStatus">Not tested</div></div></div><div class="deviceActions"><button class="btn primary" id="testCamera">Test selected camera</button><button class="btn" id="refreshSettingsDevices">Refresh cameras</button></div><div class="note" id="cameraHelp">USB webcams, capture cards and iPhone Continuity Camera will appear automatically when the operating system exposes them to the browser. If a phone is not listed here, LinguaSpire cannot directly access it as a local camera yet.</div>'+sw('Mirror my video','mirror')+sw('Hide video-off attendees','hideVideoOff')+sw('Hide my self view','hideSelf');
if(id==='audio')return '<h2 class="sectionTitle">Audio</h2><p class="sectionSub">Choose and test the microphone used for calls and live translation.</p><div class="grid2"><div class="field"><label>Microphone</label><select id="settingsMic"></select></div><div class="field"><label>Input status</label><div class="deviceStatus" id="micStatus">Not tested</div></div></div><div class="deviceActions"><button class="btn" id="refreshAudioDevices">Refresh microphones</button></div>'+sw('Noise suppression','noise','Reduce fan noise, typing and room ambience.')+sw('Echo cancellation','echo','Reduce speaker echo.')+sw('Auto-adjust microphone gain','autoGain','Keep speech volume more consistent.')+sw('Press and hold Space to unmute','pushTalk')+'<div class="settingGroup"><h3>Microphone test</h3><div class="meter" id="audioMeter">'+Array(12).fill('<i></i>').join('')+'</div><button class="btn" id="testMic" style="margin-top:12px">Test microphone</button></div>';
if(id==='recording')return '<h2 class="sectionTitle">Recording</h2><p class="sectionSub">Recording and transcription preferences.</p>'+sw('Automatic transcription','recordTranscription','Keep a meeting transcript while captions are active.')+sw('Save temporary recording files','saveTemp')+sw('Record video during screen sharing','recordVideoShare')+'<div class="note">Cloud recording needs a dedicated storage backend. Current production build supports the transcript panel and browser-side media features.</div>';
if(id==='appearance')return '<h2 class="sectionTitle">Background & Appearance</h2><p class="sectionSub">Personalize how your video and interface look.</p>'+sw('Mirror my video','mirror')+'<div class="grid3"><div class="card" style="padding:18px;text-align:center">None</div><div class="card" style="padding:18px;text-align:center">Soft blur</div><div class="card" style="padding:18px;text-align:center">Custom background</div></div><div class="note" style="margin-top:14px">Background segmentation is planned for the native desktop build; browser support depends on device performance.</div>';
if(id==='captions')return '<h2 class="sectionTitle">Captions & Translation</h2><p class="sectionSub">Control live translation and recognition accuracy.</p>'+sw('Enable live captions','captionsEnabled')+'<div class="grid2"><div class="field"><label>Caption display</label><select id="captionMode"><option value="translated">Translated only</option><option value="both">Original + translated</option></select></div><div class="field"><label>Recognition profile</label><select id="industry"><option value="general">General conversation</option><option value="business">Business</option><option value="education">Education</option><option value="technical">Technical</option></select></div></div><div class="field" style="margin-top:14px"><label>Custom vocabulary</label><textarea id="vocab" placeholder="Names, company names, product terms, recurring words…"></textarea></div><div class="note">LinguaSpire uses voice activity detection, noise filtering and confidence thresholds. If speech is unclear, it prefers showing nothing instead of inventing text.</div>';
if(id==='security')return '<h2 class="sectionTitle">Security & Privacy</h2><p class="sectionSub">Meeting access and data controls.</p>'+sw('Waiting room by default','defaultWaiting')+sw('Only host can share screen','hostShareOnly')+sw('Allow participants to start transcription','participantTranscription')+sw('Delete transcript after meeting','deleteTranscript')+'<div class="note">Meeting tokens are issued by the room API and LiveKit. Rotate exposed service credentials before public release.</div>';
if(id==='network')return '<h2 class="sectionTitle">Network Test</h2><p class="sectionSub">Check service reachability.</p><button class="btn primary" id="settingsRunNet">Start testing</button><div id="settingsNet" style="margin-top:14px"></div>';
if(id==='shortcuts')return '<h2 class="sectionTitle">Shortcuts</h2><p class="sectionSub">Keyboard controls.</p><div class="row"><b>Mute / unmute</b><span class="chip">M</span></div><div class="row"><b>Camera on / off</b><span class="chip">V</span></div><div class="row"><b>Push to talk</b><span class="chip">Space</span></div><div class="row"><b>Open chat</b><span class="chip">C</span></div>';
if(id==='language')return '<h2 class="sectionTitle">Language</h2><p class="sectionSub">Language names are shown in their native form.</p><div class="grid2">'+receiveLangs.map(([c,n])=>'<div class="card" style="padding:18px"><b>'+n+'</b><div class="tiny">'+c+'</div></div>').join('')+'</div>';
return '<h2 class="sectionTitle">About</h2><p class="sectionSub">LinguaSpire production build ${APP_VERSION}</p><p>One call. Every language.</p>'}
function wireSettings(id){
  document.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>{b.classList.toggle('on');state.settings[b.dataset.setting]=b.classList.contains('on');saveSettings()});
  if($('themeSetting')){$('themeSetting').value=state.settings.theme||'system';$('themeSetting').onchange=()=>{state.settings.theme=$('themeSetting').value;saveSettings();setTheme()}}
  if($('captionMode')){$('captionMode').value=state.settings.captionMode||'translated';$('captionMode').onchange=()=>{state.settings.captionMode=$('captionMode').value;saveSettings()}}
  if($('industry')){$('industry').value=state.settings.industry||'general';$('industry').onchange=()=>{state.settings.industry=$('industry').value;saveSettings()}}
  if($('vocab')){$('vocab').value=state.settings.vocab||'';$('vocab').oninput=()=>{state.settings.vocab=$('vocab').value;saveSettings()}}
  if(id==='video')startSettingsPreview();
  if(id==='audio')listDevices();
  if($('settingsCamera'))$('settingsCamera').onchange=()=>{state.settings.cameraDevice=$('settingsCamera').value;saveSettings();startSettingsPreview()};
  if($('settingsMic'))$('settingsMic').onchange=()=>{state.settings.micDevice=$('settingsMic').value;saveSettings()};
  if($('refreshSettingsDevices'))$('refreshSettingsDevices').onclick=async()=>{const st=$('cameraStatus');if(st){st.textContent='Refreshing…';st.className='deviceStatus'}await requestDevicePermission();const d=await listDevices();if(st)st.textContent=d.cams.length+' camera'+(d.cams.length===1?'':'s')+' detected';await startSettingsPreview()};if($('testCamera'))$('testCamera').onclick=startSettingsPreview;
  if($('refreshAudioDevices'))$('refreshAudioDevices').onclick=async()=>{await requestDevicePermission();await listDevices()};
  if($('testMic'))$('testMic').onclick=testMic;
  if($('settingsRunNet'))$('settingsRunNet').onclick=()=>runNetwork('settingsNet')
}
async function startSettingsPreview(){
  const status=$('cameraStatus'),empty=$('settingsPreviewEmpty'),videoEl=$('settingsPreview');
  if(status){status.textContent='Testing camera…';status.className='deviceStatus'}
  try{
    const permitted=await requestDevicePermission();
    const {cams}=await listDevices();
    if(!permitted&&status){status.textContent='Camera permission denied';status.className='deviceStatus bad'}
    const cam=$('settingsCamera')?.value||state.settings.cameraDevice||cams[0]?.deviceId||'';
    if(cam){state.settings.cameraDevice=cam;saveSettings()}
    if(state.settingsPreviewStream)state.settingsPreviewStream.getTracks().forEach(t=>t.stop());
    let s=null;
    try{
      s=await navigator.mediaDevices.getUserMedia({video:{deviceId:cam?{exact:cam}:undefined,width:{ideal:1280},height:{ideal:720},frameRate:{ideal:30}},audio:false});
    }catch(firstError){
      // Some browsers expose a device but reject an exact hardware id after hot-plug.
      try{s=await navigator.mediaDevices.getUserMedia({video:{deviceId:cam?{ideal:cam}:undefined,width:{ideal:1280},height:{ideal:720}},audio:false})}
      catch{ s=await navigator.mediaDevices.getUserMedia({video:true,audio:false}) }
    }
    state.settingsPreviewStream=s;if(videoEl){videoEl.srcObject=s;videoEl.style.transform=state.settings.mirror?'scaleX(-1)':'';await videoEl.play().catch(()=>{})}
    if(empty)empty.classList.add('hidden');
    const track=s.getVideoTracks()[0];const label=track?.label||($('settingsCamera')?.selectedOptions?.[0]?.textContent)||'Camera';
    if(status){status.textContent='Connected • '+label+' • '+cams.length+' detected';status.className='deviceStatus ok'}
  }catch(e){
    const name=String(e?.name||'');
    let msg='Camera unavailable';
    if(name==='NotAllowedError'||name==='PermissionDeniedError')msg='Camera permission denied in the browser/system';
    else if(name==='NotReadableError'||name==='TrackStartError')msg='Camera is busy or blocked by another app';
    else if(name==='NotFoundError'||name==='DevicesNotFoundError')msg='No usable camera found';
    else if(name==='OverconstrainedError')msg='Selected camera cannot satisfy requested settings';
    if(empty){empty.classList.remove('hidden');empty.textContent=msg}
    if(status){status.textContent=msg;status.className='deviceStatus bad'}
  }
}
async function testMic(){
  const status=$('micStatus');if(status)status.textContent='Testing…';
  try{
    const mic=$('settingsMic')?.value||state.settings.micDevice||'';
    if(mic){state.settings.micDevice=mic;saveSettings()}
    const s=await navigator.mediaDevices.getUserMedia({audio:{deviceId:mic?{exact:mic}:undefined,echoCancellation:state.settings.echo!==false,noiseSuppression:state.settings.noise!==false,autoGainControl:state.settings.autoGain!==false}});
    const ctx=new (window.AudioContext||window.webkitAudioContext)(),src=ctx.createMediaStreamSource(s),an=ctx.createAnalyser();an.fftSize=512;src.connect(an);
    const a=new Uint8Array(an.frequencyBinCount),bars=[...$('audioMeter').querySelectorAll('i')];let peak=0,heard=0;const until=Date.now()+5000;
    const loop=()=>{an.getByteFrequencyData(a);const avg=a.reduce((x,y)=>x+y,0)/a.length;peak=Math.max(peak,avg);if(avg>4)heard++;bars.forEach((b,i)=>b.classList.toggle('on',i<Math.max(1,Math.round(avg/14))));
      if(Date.now()<until)requestAnimationFrame(loop);else{s.getTracks().forEach(t=>t.stop());ctx.close();bars.forEach(b=>b.classList.remove('on'));if(status){status.textContent=heard>4?'Microphone works • signal detected':'No clear microphone signal';status.className='deviceStatus '+(heard>4?'ok':'bad')}}
    };loop();
  }catch(e){if(status){status.textContent='Microphone permission/device error';status.className='deviceStatus bad'}}
}

function renderNetwork(){renderNetCards($('networkCards'));const l=state.captionLatencies||[];if(l.length){const avg=Math.round(l.reduce((a,b)=>a+b,0)/l.length);$('networkCards').insertAdjacentHTML('beforeend','<div class="netRow"><span>Recent caption delivery<div class="tiny">Measured on this device</div></span><span><i class="dot '+(avg<2500?'ok':'')+'"></i> '+avg+' ms avg</span></div>')}}function renderNetCards(el){el.innerHTML=['Room API','Speech recognition','Translation','Media server'].map(n=>'<div class="netRow"><span>'+n+'</span><span><i class="dot"></i> Pending</span></div>').join('')}
$('runNet').onclick=()=>runNetwork('networkCards');async function runNetwork(target){const el=$(target);if(!el)return;if(target==='networkCards')renderNetCards(el);else el.innerHTML='Testing…';const tests=[['Room API','/api/net/room'],['Speech recognition','/api/net/stt'],['Translation','/api/net/translate'],['Media server','/api/net/media']];const results=[];for(const [name,url] of tests){try{const r=await fetch(url);const d=await r.json();results.push([name,d.ok?'ok':'bad',d.detail||''])}catch{results.push([name,'bad',''])}}el.innerHTML=results.map(([n,s,d])=>'<div class="netRow"><span>'+n+'<div class="tiny">'+escapeHtml(d)+'</div></span><span><i class="dot '+(s==='ok'?'ok':'bad')+'"></i> '+(s==='ok'?'Connected':'Failed')+'</span></div>').join('')}

window.addEventListener('offline',()=>{const b=$('connectionBanner');if(b){b.textContent='You are offline — waiting for network…';b.className='connectionBanner bad';b.classList.remove('hidden')}});
window.addEventListener('online',()=>{const b=$('connectionBanner');if(b){b.textContent='Network is back — reconnecting…';b.className='connectionBanner ok';b.classList.remove('hidden');setTimeout(()=>b.classList.add('hidden'),2200)}});
window.addEventListener('keydown',e=>{if(!$('meetingPage').classList.contains('hidden')){if(e.key.toLowerCase()==='m')$('micBtn').click();if(e.key.toLowerCase()==='v')$('camBtn').click();if(e.key.toLowerCase()==='c'){state.activeTab='chat';renderTab()}}});
const initialParams=new URL(location.href).searchParams;const initialRoom=initialParams.get('room');if(initialParams.get('phone')==='1'&&initialRoom){state.roomId=initialRoom;document.querySelector('.app')?.classList.add('hidden');$('phoneCameraPage').classList.remove('hidden');setTimeout(()=>startPhonePreview(),250)}else if(initialRoom){$('meetingInput').value=initialRoom;setTimeout(()=>openPrejoin(false),150)}
</script>
</body>
</html>`;
const legalPage = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · LinguaSpire</title><style>body{margin:0;background:#071325;color:#eef5ff;font:16px/1.65 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.w{max-width:850px;margin:auto;padding:50px 24px}.c{background:#0d1b32;border:1px solid #294064;border-radius:18px;padding:26px}a{color:#70b8ff}h1{font-size:38px}.muted{color:#9fb0c8}</style></head><body><main class="w"><a href="/">← LinguaSpire</a><h1>${title}</h1><div class="c">${body}</div><p class="muted">LinguaSpire ${APP_VERSION}</p></main></body></html>`;
app.get('/api/version', c => c.json({ product: 'LinguaSpire', version: APP_VERSION, minimumDesktopVersion: '2.9.0', channel: 'production' }));
app.get('/privacy', c => c.html(legalPage('Privacy Policy', '<p>LinguaSpire processes audio when live captions or transcription are enabled so speech can be converted to text and translated.</p><p>Room state is short-lived. Phone-camera pairing codes expire after 10 minutes and are single-use.</p><p>Recording must be visibly indicated to participants and used only with consent required by law.</p>')));
app.get('/terms', c => c.html(legalPage('Terms of Use', '<p>Machine transcription and translation can contain errors. Do not rely on LinguaSpire as the sole source for legal, medical, emergency, financial or other high-stakes decisions.</p><p>Do not use LinguaSpire to violate law or invade privacy.</p>')));
app.get('/support', c => c.html(legalPage('Support', '<p>Use Network Test inside LinguaSpire to check Room API, speech-to-text, translation and media connectivity.</p><p>A dedicated commercial support mailbox will be published with the custom production domain.</p>')));
app.get('/release-notes', c => c.html(legalPage('Release Notes · 2.9.0 RC1', '<ul><li>Unified product version 2.9.0 RC1.</li><li>Server-side room security.</li><li>Single-use phone-camera pairing.</li><li>Privacy, accessibility and 8-language core localization.</li></ul>')));
app.get('/health', c => c.json({ ok: true, service: 'LinguaSpire frontend', version: APP_VERSION }));
app.get('/', c => c.html(html));
app.get('/room/:id', c => c.redirect('/?room=' + encodeURIComponent(c.req.param('id'))));
app.get('/phone/:id', c => c.redirect('/?phone=1&room=' + encodeURIComponent(c.req.param('id'))));
const translationCache = new Map();
function translationCacheGet(key) { const x = translationCache.get(key); if (!x)
    return null; if (x.expires < Date.now()) {
    translationCache.delete(key);
    return null;
} return x.value; }
function translationCacheSet(key, value) { if (translationCache.size > 500)
    translationCache.delete(translationCache.keys().next().value); translationCache.set(key, { value, expires: Date.now() + 300000 }); }
function detectSource(text) {
    const t = ' ' + text.toLowerCase() + ' ';
    if (/[а-яё]/i.test(text))
        return 'ru';
    if (/[ぁ-ゟ゠-ヿ]/.test(text))
        return 'ja';
    if (/[가-힣]/.test(text))
        return 'ko';
    if (/[一-龯]/.test(text))
        return 'zh';
    const scores = { de: [' der ', ' die ', ' das ', ' und ', ' ist ', ' ich ', ' nicht ', ' wie ', ' hallo ', ' danke '], fr: [' le ', ' la ', ' les ', ' et ', ' est ', ' je ', ' pas ', ' comment ', ' bonjour ', ' merci '], it: [' il ', ' la ', ' che ', ' e ', ' è ', ' io ', ' non ', ' come ', ' ciao ', ' grazie '], en: [' the ', ' and ', ' is ', ' i ', ' not ', ' how ', ' hello ', ' thanks ', ' you ', ' are '] };
    let best = 'en', score = 0;
    for (const [lang, words] of Object.entries(scores)) {
        const s = words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
        if (s > score) {
            best = lang;
            score = s;
        }
    }
    return best;
}
async function translateOnce(base, text, source, target) {
    const cacheKey = source + '|' + target + '|' + text;
    const cached = translationCacheGet(cacheKey);
    if (cached)
        return cached;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2800);
    try {
        const r = await fetch(base + '/translate', { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctrl.signal, body: JSON.stringify({ q: text, source, target, format: 'text' }) });
        if (!r.ok)
            return null;
        const d = await r.json();
        const out = typeof d?.translatedText === 'string' ? d.translatedText.trim() : '';
        if (out)
            translationCacheSet(cacheKey, out);
        return out || null;
    }
    catch {
        return null;
    }
    finally {
        clearTimeout(timer);
    }
}
async function runTranslation(text, requestedSource, target) {
    const supported = new Set(['en', 'ru', 'zh', 'ja', 'ko', 'de', 'fr', 'it']);
    if (!supported.has(target))
        return { translatedText: '', source: requestedSource, error: 'UNSUPPORTED_TARGET' };
    let source = supported.has(requestedSource) ? requestedSource : 'auto';
    if (source === 'auto')
        source = detectSource(text);
    if (source === target)
        return { translatedText: text, source, latencyMs: 0, path: 'identity' };
    const started = Date.now();
    const internal = 'http://translation.railway.internal:5000';
    // Fast direct path first.
    let out = await translateOnce(internal, text, source, target);
    if (out)
        return { translatedText: out, source, latencyMs: Date.now() - started, path: 'direct' };
    // One public retry only; same service, but it can survive a transient private-network failure.
    out = await translateOnce(TRANSLATE_PUBLIC, text, source, target);
    if (out)
        return { translatedText: out, source, latencyMs: Date.now() - started, path: 'direct-public' };
    // Non-English pairs can pivot through English. One attempt per leg to bound live-call latency.
    if (source !== 'en' && target !== 'en') {
        const english = (await translateOnce(internal, text, source, 'en')) || (await translateOnce(TRANSLATE_PUBLIC, text, source, 'en'));
        if (english) {
            out = (await translateOnce(internal, english, 'en', target)) || (await translateOnce(TRANSLATE_PUBLIC, english, 'en', target));
            if (out)
                return { translatedText: out, source, latencyMs: Date.now() - started, path: 'pivot-en' };
        }
    }
    return { translatedText: '', source, error: 'TRANSLATION_UNAVAILABLE', latencyMs: Date.now() - started };
}
app.post('/api/translate', async (c) => {
    try {
        const b = await c.req.json();
        const text = String(b.q || '').slice(0, 4000);
        const target = String(b.target || 'en');
        const source = String(b.source || 'auto');
        if (!text)
            return c.json({ translatedText: '' });
        const result = await runTranslation(text, source, target);
        return c.json(result, result.error ? 503 : 200);
    }
    catch {
        return c.json({ error: 'TRANSLATION_FAILED' }, 502);
    }
});
app.get('/api/diagnostics/translation', async (c) => {
    const samples = { en: 'Hello, how are you?', ru: 'Привет, как дела?', zh: '你好，你怎么样？', ja: 'こんにちは、お元気ですか？', ko: '안녕하세요, 어떻게 지내세요?', de: 'Hallo, wie geht es dir?', fr: 'Bonjour, comment allez-vous ?', it: 'Ciao, come stai?' };
    const languages = Object.keys(samples);
  const requestedSource=c.req.query('source'),requestedTarget=c.req.query('target');
  if(requestedSource||requestedTarget){
    if(!samples[requestedSource]||!samples[requestedTarget]||requestedSource===requestedTarget)return c.json({ok:false,error:'INVALID_LANGUAGE_PAIR'},400);
    const result=await runTranslation(samples[requestedSource],requestedSource,requestedTarget);
    const ok=!result.error&&!!result.translatedText&&result.translatedText!==samples[requestedSource];
    return c.json({ok,source:requestedSource,target:requestedTarget,input:samples[requestedSource],...result},result.error?503:200);
  }
    const results = [];
    for (const source of languages)
        for (const target of languages)
            if (source !== target) {
                const started = Date.now();
                const result = await runTranslation(samples[source], source, target);
                results.push({ source, target, ok: !result.error && !!result.translatedText && result.translatedText !== samples[source], latencyMs: Date.now() - started, error: result.error || null });
            }
    const sorted = results.map(x => x.latencyMs).sort((a, b) => a - b);
    return c.json({ ok: results.every(x => x.ok), languages, checked: results.length, passed: results.filter(x => x.ok).length, p50Ms: sorted[Math.floor(sorted.length * .5)], p95Ms: sorted[Math.floor(sorted.length * .95)], results });
});
app.post('/api/asr', async (c) => {
    try {
        const input = await c.req.raw.formData();
        const f = input.get('audio_file');
        if (!(f instanceof File))
            return c.json({ error: 'NO_AUDIO' }, 400);
        let language = String(input.get('language') || 'auto');
        const vocab = String(input.get('vocab') || '').slice(0, 1200);
        const profile = String(input.get('profile') || 'general');
        const supported = new Set(['en', 'ru', 'zh', 'ja', 'ko', 'de', 'fr', 'it']);
        const out = new FormData();
        out.append('file', f, f.name || 'speech.webm');
        out.append('model', 'Systran/faster-whisper-tiny');
        out.append('response_format', 'verbose_json');
        out.append('temperature', '0');
        out.append('vad_filter', 'false');
        if (language !== 'auto' && supported.has(language))
            out.append('language', language);
        const hotwords = vocab.trim();
        if (hotwords)
            out.append('hotwords', hotwords);
        const profileHint = profile === 'business' ? 'Business meeting with names, companies and professional terms.' : profile === 'education' ? 'Educational conversation with clear academic vocabulary.' : profile === 'technical' ? 'Technical conversation with product and software terminology.' : 'Natural everyday conversation.';
        out.append('prompt', profileHint + ' Supported languages: English, Russian, Chinese, Japanese, Korean, German, French, Italian. Transcribe the speaker accurately in their original language.');
        for (const url of ['http://stt.railway.internal:8000/v1/audio/transcriptions', STT_PUBLIC + '/v1/audio/transcriptions']) {
            try {
                const ctrl = new AbortController();
                const to = setTimeout(() => ctrl.abort(), 8000);
                const r = await fetch(url, { method: 'POST', body: out, signal: ctrl.signal });
                clearTimeout(to);
                if (!r.ok)
                    continue;
                const d = await r.json();
                let lang = String(d.language || language || '').toLowerCase();
                if (lang === 'yue')
                    lang = 'zh';
                if (!supported.has(lang))
                    return c.json({ text: '', language: lang, rejected: 'unsupported_language' });
                const segs = Array.isArray(d.segments) ? d.segments : [];
                const accepted = segs.filter((s) => { const noSpeech = Number(s.no_speech_prob ?? 0), logp = Number(s.avg_logprob ?? 0), comp = Number(s.compression_ratio ?? 0), dur = Math.max(0, Number(s.end ?? 0) - Number(s.start ?? 0)), txt = String(s.text || '').trim(); return !!txt && noSpeech <= .65 && logp >= -1.0 && comp <= 2.6 && dur >= .10; });
                if (!accepted.length && segs.length)
                    return c.json({ text: '', language: lang, rejected: 'no_clear_speech' });
                const text = (accepted.length ? accepted.map((s) => String(s.text || '').trim()).join(' ') : String(d.text || '')).replace(/\s+/g, ' ').trim();
                const chars = (text.match(/[\p{L}\p{N}]/gu) || []).length;
                if (chars < 2)
                    return c.json({ text: '', language: lang, rejected: 'low_content' });
                return c.json({ text, language: lang });
            }
            catch { }
        }
        return c.json({ error: 'STT_UNAVAILABLE' }, 502);
    }
    catch {
        return c.json({ error: 'STT_FAILED' }, 502);
    }
});
app.get('/api/net/room', async (c) => { try {
    const r = await fetch(ROOM_API + '/health');
    return c.json({ ok: r.ok, detail: 'Room API ' + r.status });
}
catch {
    return c.json({ ok: false, detail: 'Room API unreachable' });
} });
app.get('/api/net/stt', async (c) => { try {
    const r = await fetch(STT_PUBLIC + '/health');
    return c.json({ ok: r.ok, detail: 'STT ' + r.status });
}
catch {
    return c.json({ ok: false, detail: 'STT unreachable' });
} });
app.get('/api/net/translate', async (c) => { try {
    const r = await fetch(TRANSLATE_PUBLIC + '/languages');
    return c.json({ ok: r.ok, detail: 'Translation ' + r.status });
}
catch {
    return c.json({ ok: false, detail: 'Translation unreachable' });
} });
app.get('/api/net/media', async (c) => {
    try {
        const response = await fetch(ROOM_API + '/health');
        const data = await response.json();
        return c.json({ ok: response.ok && data?.media === 'configured' && data?.redis === 'ok',
            detail: 'LiveKit credentials ' + (data?.media || 'unknown') + '; Redis ' + (data?.redis || 'unknown') + ' (actual WebRTC connection not tested)' });
    }
    catch {
        return c.json({ ok: false, detail: 'Media configuration check failed' });
    }
});
exports.default = app;