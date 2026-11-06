import React,{useCallback,useEffect,useRef,useState} from 'react';
import {createClient} from '@supabase/supabase-js';

const URL=import.meta.env.VITE_SUPABASE_URL;
const KEY=import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb=URL&&KEY?createClient(URL,KEY):null;
const say={
 shushu:['Kukudii, ab bach ke dikha! 😈','Shushu ka pyaar bhi dangerous hai!','Ye punch sirf tumhare naam! 💥','Ab aaya mera asli roop!'],
 kukudii:['Shushu ki toh aaj khair nahi! 💅','Awww… itna weak attack?','Kukudii power activated! 💖','Pyaar se maarungi… shayad!']
};
const startFighters=()=>({
 shushu:{hp:100,energy:0,x:24,action:'idle',facing:1,block:false},
 kukudii:{hp:100,energy:0,x:76,action:'idle',facing:-1,block:false}
});
const randLine=p=>say[p][Math.floor(Math.random()*say[p].length)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export default function App(){
 const [page,setPage]=useState('home'),[codeInput,setCodeInput]=useState('');
 const [room,setRoom]=useState(''),[role,setRole]=useState('shushu'),[channel,setChannel]=useState(null);
 const [presence,setPresence]=useState([]),[connection,setConnection]=useState('Not connected');
 const [fighters,setFighters]=useState(startFighters),[message,setMessage]=useState('Pyaar bhi. Punch bhi. ❤️');
 const [playing,setPlaying]=useState(false),[seconds,setSeconds]=useState(60),[winner,setWinner]=useState('');
 const [roundId,setRoundId]=useState(0);
 const [copied,setCopied]=useState(false);
 const lastAction=useRef(0),lastClock=useRef(0),roomRef=useRef(''),roleRef=useRef('shushu'),channelRef=useRef(null);
 const other=role==='shushu'?'kukudii':'shushu';
 const me=role;

 const send=useCallback(async(event,payload)=>{if(channelRef.current) await channelRef.current.send({type:'broadcast',event,payload:{...payload,from:roleRef.current,ts:Date.now()}});},[]);

 const connect=useCallback(async(roomCode,playerRole)=>{
   if(!sb){setMessage('Supabase keys missing. README mein free setup dekho.');return;}
   if(channelRef.current){await sb.removeChannel(channelRef.current);channelRef.current=null;}
   setRole(playerRole);roleRef.current=playerRole;setConnection('Connecting…');
   const ch=sb.channel('love-war-'+roomCode,{config:{broadcast:{self:false},presence:{key:playerRole}}});
   ch.on('presence',{event:'sync'},()=>{const state=ch.presenceState();setPresence(Object.entries(state).flatMap(([key,items])=>items.map(item=>({...item,key}))));});
   ch.on('broadcast',{event:'game'},({payload})=>{
     if(!payload||payload.from===roleRef.current)return;
     if(payload.kind==='start'){
       setFighters(startFighters());setSeconds(60);setWinner('');setPlaying(true);setPage('game');setRoundId(v=>v+1);setMessage('FIGHT! Pyaar se… thoda zor se! 💘');
     }
     if(payload.kind==='action'){
       const attacker=payload.from,target=attacker==='shushu'?'kukudii':'shushu';
       setFighters(old=>{
         const next={...old};
         const defending=payload.action==='block' || old[target].block;
         let damage=payload.action==='special'?25:payload.action==='kick'?13:payload.action==='punch'?9:0;
         if(defending)damage=Math.ceil(damage*.25);
         next[target]={...next[target],hp:clamp(next[target].hp-damage,0,100),action:damage?'hurt':payload.action,block:false};
         next[attacker]={...next[attacker],energy:payload.action==='special'?old[attacker].energy:clamp(old[attacker].energy+12,0,100),action:payload.action,block:payload.action==='block'};
         return next;
       });
       setMessage(payload.line||'POW! 💥');
     }
     if(payload.kind==='move'){setFighters(old=>({...old,[payload.from]:{...old[payload.from],x:payload.x}}));}
     if(payload.kind==='clock'){setSeconds(payload.seconds);if(payload.winner){setWinner(payload.winner);setPlaying(false);}}
     if(payload.kind==='rematch'){setFighters(startFighters());setSeconds(60);setWinner('');setPlaying(true);setPage('game');setRoundId(v=>v+1);}
   });
   ch.subscribe(async status=>{
     if(status==='SUBSCRIBED'){
       channelRef.current=ch;setChannel(ch);roomRef.current=roomCode;setRoom(roomCode);setConnection('Connected');setPage('lobby');
       await ch.track({role:playerRole,display:playerRole==='shushu'?'SHUSHU':'KUKUDII',joined_at:new Date().toISOString()});
     }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){setConnection('Connection issue — try reconnecting');}
   });
 },[]);

 useEffect(()=>()=>{if(channelRef.current&&sb)sb.removeChannel(channelRef.current);},[]);
 useEffect(()=>{
   if(!playing)return;
   const id=setInterval(()=>{
     setSeconds(old=>{
       const next=Math.max(0,old-1);
       if(roleRef.current==='shushu'&&Date.now()-lastClock.current>850){
         lastClock.current=Date.now();
         const f=latestFighters.current;
         let win='';
         if(f.shushu.hp<=0)win='Kukudii';else if(f.kukudii.hp<=0)win='Shushu';else if(next===0)win=f.shushu.hp===f.kukudii.hp?'Draw':f.shushu.hp>f.kukudii.hp?'Shushu':'Kukudii';
         if(win){setWinner(win);setPlaying(false);}
         send('game',{kind:'clock',seconds:next,winner:win});
       }
       return next;
     });
   },1000);
   return()=>clearInterval(id);
 },[playing,send]);
 const latestFighters=useRef(fighters);
 useEffect(()=>{latestFighters.current=fighters;},[fighters]);
 useEffect(()=>{
   if(!playing)return;
   if(fighters.shushu.hp<=0||fighters.kukudii.hp<=0){
     const w=fighters.shushu.hp<=0?'Kukudii':'Shushu';setWinner(w);setPlaying(false);
     if(role==='shushu')send('game',{kind:'clock',seconds,winner:w});
   }
 },[fighters,playing,role,seconds,send]);

 const create=()=>{const c=Math.random().toString(36).slice(2,7).toUpperCase();connect(c,'shushu');};
 const join=()=>{const c=codeInput.trim().toUpperCase();if(c.length<4){setMessage('Room code sahi daalo ❤️');return;}connect(c,'kukudii');};
 const start=async()=>{setFighters(startFighters());setSeconds(60);setWinner('');setPlaying(true);setPage('game');setRoundId(v=>v+1);setMessage('FIGHT! Pyaar se… thoda zor se! 💘');await send('game',{kind:'start'});};
 const act=async(action)=>{
   if(!playing||Date.now()-lastAction.current<350)return;lastAction.current=Date.now();
   if(action==='special'&&fighters[me].energy<35){setMessage('Special ke liye 35 energy chahiye! ⚡');return;}
   const line=randLine(me);
   setFighters(old=>{
     const next={...old};const damage=action==='special'?25:action==='kick'?13:action==='punch'?9:0;
     const blocked=old[other].block;
     const actual=blocked?Math.ceil(damage*.25):damage;
     next[other]={...next[other],hp:clamp(old[other].hp-actual,0,100),action:actual?'hurt':old[other].action,block:false};
     next[me]={...next[me],energy:action==='special'?Math.max(0,old[me].energy-35):clamp(old[me].energy+(damage?12:0),0,100),action,block:action==='block'};
     return next;
   });
   setMessage(line);await send('game',{kind:'action',action,line});
 };
 const move=async(dir)=>{if(!playing)return;const x=clamp(fighters[me].x+dir*4,8,92);setFighters(old=>({...old,[me]:{...old[me],x}}));await send('game',{kind:'move',x});};
 const leave=async()=>{if(channelRef.current&&sb)await sb.removeChannel(channelRef.current);channelRef.current=null;setChannel(null);setPage('home');setPlaying(false);setWinner('');setConnection('Not connected');};
 const rematch=async()=>{setFighters(startFighters());setSeconds(60);setWinner('');setPlaying(true);setPage('game');await send('game',{kind:'rematch'});};

 const fighter=(who)=> <div className={'fighter '+who+' '+fighters[who].action} style={{left:fighters[who].x+'%'}}><div className="shadow"/><div className="char">{who==='shushu'?'🦸🏻‍♂️':'🦸🏻‍♀️'}</div><div className="nameplate">{who==='shushu'?'SHUSHU':'KUKUDII'}</div></div>;
 const meter=(who)=> <div className="meter"><div className="meterline"><b>{who==='shushu'?'🦸 SHUSHU':'💗 KUKUDII'}</b><b>{fighters[who].hp} HP</b></div><div className={'health '+who}><i style={{width:fighters[who].hp+'%'}}/></div><div className="energy"><i style={{width:fighters[who].energy+'%'}}/></div></div>;

 return <main className="app">
  <header><div className="brand">💘 LOVE WAR <span>ARENA</span></div><div className="topchip">PRIVATE COUPLE GAME</div></header>
  {page==='home'&&<section className="home">
   <div className="spark sA">✦</div><div className="kicker">ONLY TWO PLAYERS. ONE LOVE WAR.</div>
   <h1>SHUSHU <em>VS</em><br/>KUKUDII</h1><p className="lead">Pyaar mein no sorry… sirf rematch! 💥</p>
   <div className="versus"><div className="heroCard shushu"><div className="bigchar">🦸🏻‍♂️</div><b>SHUSHU</b><small>SHUSHU BLAST</small></div><div className="versusText">VS</div><div className="heroCard kukudii"><div className="bigchar">🦸🏻‍♀️</div><b>KUKUDII</b><small>KUKU HEART STORM</small></div></div>
   {!sb&&<div className="setupWarn">⚙️ Online rooms activate after adding your free Supabase keys. Setup guide included in ZIP.</div>}
   <div className="roomActions"><button className="mainBtn" onClick={create}>＋ CREATE ROOM</button><div className="joinRow"><input value={codeInput} onChange={e=>setCodeInput(e.target.value)} placeholder="ENTER ROOM CODE" maxLength={8}/><button onClick={join}>JOIN ⚔️</button></div></div>
   <p className="footnote">Creator plays SHUSHU • Room guest plays KUKUDII</p>
  </section>}
  {page==='lobby'&&<section className="lobby panel">
   <div className="kicker">YOUR SECRET BATTLE ROOM</div><h2>ROOM CODE</h2><div className="roomCode">{room}</div>
   <button className="copyBtn" onClick={async()=>{try{await navigator.clipboard.writeText(room);setCopied(true);setTimeout(()=>setCopied(false),1500);}catch{setMessage('Code manually copy kar lo: '+room);}}}>{copied?'COPIED ✓':'COPY CODE'}</button>
   <p className="lead">Partner ko code bhejo. Woh Join Room se connect karegi.</p>
   <div className="players"><div className="playerPill">🦸🏻‍♂️ SHUSHU <small>{role==='shushu'?'YOU':'PLAYER'}</small></div><div className="playerPill">🦸🏻‍♀️ KUKUDII <small>{role==='kukudii'?'YOU':'PLAYER'}</small></div></div>
   <div className="connection"><span/> {connection} · {presence.length}/2 online</div>
   <button className="mainBtn startBtn" onClick={start}>START FIGHT ⚔️</button>
   <button className="textBtn" onClick={leave}>Leave room</button>
  </section>}
  {page==='game'&&<section className="game">
   <div className="hud">{meter('shushu')}<div className="timer">{String(seconds).padStart(2,'0')}<small>TIME</small></div>{meter('kukudii')}</div>
   <div className="arena">
    <div className="arenaSky"><span>☁️</span><span>☁️</span><span>☁️</span></div>
    <div className="sun">☀️</div><div className="crowd">🏠 🏡 🏠 🏡 🏠</div>
    <div className="ground"/>
    {fighter('shushu')}{fighter('kukudii')}
    <div className="arenaCaption">LOVE WAR ARENA</div>
   </div>
   <div className="speech">{message}</div>
   <div className="mobileControls">
    <div className="moveControls"><button onClick={()=>move(-1)}>◀</button><button onClick={()=>move(1)}>▶</button></div>
    <div className="attackControls"><button onClick={()=>act('punch')}>👊<small>PUNCH</small></button><button onClick={()=>act('kick')}>🦵<small>KICK</small></button><button onClick={()=>act('block')}>🛡️<small>BLOCK</small></button><button className="specialBtn" onClick={()=>act('special')}>✨<small>SPECIAL</small></button></div>
   </div>
   <div className="gameFooter"><span>Your fighter: <b>{me.toUpperCase()}</b></span><button className="textBtn" onClick={leave}>EXIT MATCH</button></div>
  </section>}
  {winner&&<div className="overlay"><div className="winCard"><div className="crown">👑</div><div className="kicker">BATTLE COMPLETE</div><h2>{winner==='Draw'?'IT’S A DRAW!':winner.toUpperCase()+' WINS!'}</h2><p>{winner==='Shushu'?'Kukudii, ek aur chance de do na? ❤️':winner==='Kukudii'?'Shushu, ab sorry bolo! 😘':'Dono hi ek doosre ke dil mein jeete! 💞'}</p><button className="mainBtn" onClick={rematch}>REMATCH ❤️</button><button className="textBtn" onClick={()=>{setWinner('');setPage('lobby');}}>BACK TO ROOM</button></div></div>}
  <footer>Built with ❤️ for SHUSHU & KUKUDII</footer>
 </main>;
}