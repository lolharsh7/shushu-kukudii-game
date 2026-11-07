import React,{useCallback,useEffect,useRef,useState}from'react';
import{createClient}from'@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const db=url&&key?createClient(url,key):null;
const fresh=()=>({shushu:{hp:100,energy:0,x:25,action:'idle',block:false},kukudii:{hp:100,energy:0,x:75,action:'idle',block:false}});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const words={shushu:['Kukudii, ab Shushu ka asli power dekho!','Ye punch sirf tumhare liye!','Shushu mode: FULL POWER!'],kukudii:['Shushu, itna hi dum tha? 💅','Kukudii kabhi haar nahi maanti!','Pink power, maximum damage!']};
function Fighter({who,action='idle'}){
 const girl=who==='kukudii',c=girl?'#ef58a7':'#df414b',dark=girl?'#572b70':'#252642',hair=girl?'#35203e':'#262039',skin='#f3bd98';
 return <svg viewBox="0 0 220 270" className={`art ${who} pose-${action}`} aria-label={who+' cartoon fighter'}>
 <path d="M80 94 Q34 115 42 215 L94 182 L120 108Z" fill={dark} stroke="#171327" strokeWidth="6"/>
 <g className="leg back"><path d="M91 174L76 235L99 244L120 191Z" fill={dark} stroke="#171327" strokeWidth="7"/><path d="M75 234Q52 238 51 252Q76 262 111 252L105 239Z" fill={c} stroke="#171327" strokeWidth="6"/></g>
 <g className="leg front"><path d="M119 175L145 236L123 245L101 195Z" fill={c} stroke="#171327" strokeWidth="7"/><path d="M122 238Q146 230 162 246Q166 258 148 260L113 256Z" fill={dark} stroke="#171327" strokeWidth="6"/></g>
 <path d="M82 94Q111 78 138 98L148 174Q112 194 76 174Z" fill={c} stroke="#171327" strokeWidth="7"/>
 <path d="M91 111Q112 126 133 111L128 147Q110 159 91 145Z" fill={girl?'#ffb9dc':'#ffb0a2'} opacity=".9"/>
 <path d="M79 164Q112 178 145 164L148 179Q111 194 77 179Z" fill="#f6d77f" stroke="#171327" strokeWidth="5"/>
 <g className="arm back"><path d="M83 107L57 143L42 166" fill="none" stroke="#171327" strokeWidth="24" strokeLinecap="round"/><path d="M83 107L57 143L42 166" fill="none" stroke={c} strokeWidth="16" strokeLinecap="round"/><path d="M29 157Q45 147 57 164L48 186Q29 190 23 174Z" fill={dark} stroke="#171327" strokeWidth="5"/></g>
 <g className="arm front"><path d="M137 107L165 143L180 160" fill="none" stroke="#171327" strokeWidth="24" strokeLinecap="round"/><path d="M137 107L165 143L180 160" fill="none" stroke={c} strokeWidth="16" strokeLinecap="round"/><path d="M169 151Q188 144 198 162L192 184Q174 193 162 174Z" fill={dark} stroke="#171327" strokeWidth="5"/></g>
 <path d="M99 82L99 101Q112 114 126 99L126 82Z" fill={skin} stroke="#171327" strokeWidth="5"/>
 <ellipse cx="112" cy="59" rx="42" ry="48" fill={skin} stroke="#171327" strokeWidth="6"/>
 {girl?<><path d="M72 64Q60 17 103 13Q144 5 153 48L145 99L134 84L140 49Q117 57 97 43Q90 67 77 79Z" fill={hair} stroke="#171327" strokeWidth="5"/><path d="M143 66Q166 82 157 128Q151 153 135 151L139 109L128 91Z" fill={hair} stroke="#171327" strokeWidth="5"/><path d="M74 35L84 24L96 37L84 49Z" fill="#ffdf8c" stroke="#171327" strokeWidth="3"/></>:<path d="M72 58Q61 19 89 18L83 4L111 18L125 3L130 24Q158 27 153 65L143 85L135 51Q111 63 92 48L82 78Z" fill={hair} stroke="#171327" strokeWidth="5"/>}
 <ellipse cx="97" cy="62" rx="5" ry="7" fill="#292039"/><ellipse cx="128" cy="62" rx="5" ry="7" fill="#292039"/>
 <path d="M106 79Q113 85 121 78" fill="none" stroke="#a34f64" strokeWidth="4" strokeLinecap="round"/>
 <path d="M86 53Q96 48 104 53M121 53Q131 48 138 54" fill="none" stroke="#38243b" strokeWidth="4" strokeLinecap="round"/>
 <circle cx="112" cy="132" r="11" fill="#fff0c0" stroke={dark} strokeWidth="4"/><path d="M112 123L116 130L123 131L117 136L118 143L112 139L106 143L107 136L101 131L109 130Z" fill={c}/>
 </svg>
}
export default function App(){
 const[page,P]=useState('home'),[input,I]=useState(''),[room,R]=useState(''),[role,S]=useState('shushu'),[online,O]=useState(false),[people,Pe]=useState([]),[f,F]=useState(fresh),[time,T]=useState(90),[playing,G]=useState(false),[winner,W]=useState(''),[line,L]=useState('Ready? Aaj pyaar wali fight hogi! ❤️');
 const ch=useRef(null),roleRef=useRef('shushu'),last=useRef(0),lastClock=useRef(0),fRef=useRef(f);useEffect(()=>{fRef.current=f},[f]);
 const send=useCallback(async payload=>{if(ch.current)await ch.current.send({type:'broadcast',event:'fight',payload:{...payload,from:roleRef.current}})},[]);
 const connect=useCallback((code,r)=>{
  if(!db){L('Supabase environment variables missing hain.');return}
  if(ch.current)db.removeChannel(ch.current);S(r);roleRef.current=r;R(code);O(false);
  const c=db.channel('love-war-'+code,{config:{broadcast:{self:false},presence:{key:r}}});
  c.on('presence',{event:'sync'},()=>{const s=c.presenceState();Pe(Object.entries(s).flatMap(([k,a])=>a.map(x=>({...x,key:k}))))});
  c.on('broadcast',{event:'fight'},({payload:p})=>{
   if(!p||p.from===roleRef.current)return;
   if(p.kind==='start'){F(fresh());T(90);W('');G(true);P('game');L('FIGHT! Dono apni power dikhao! ⚡')}
   if(p.kind==='move')F(old=>({...old,[p.from]:{...old[p.from],x:p.x}}));
   if(p.kind==='attack'){
    F(old=>{const n={...old},a=p.from,t=a==='shushu'?'kukudii':'shushu',amount=p.action==='special'?25:p.action==='kick'?14:p.action==='punch'?10:0,damage=old[t].block?Math.ceil(amount*.2):amount;
     n[t]={...old[t],hp:clamp(old[t].hp-damage,0,100),action:damage?'hurt':old[t].action,block:false};
     n[a]={...old[a],energy:p.action==='special'?Math.max(0,old[a].energy-35):clamp(old[a].energy+(amount?12:0),0,100),action:p.action,block:p.action==='block'};return n});
    L(p.line||'POW! 💥');
   }
   if(p.kind==='clock'){T(p.seconds);if(p.winner){W(p.winner);G(false)}}
  });
  c.subscribe(async status=>{if(status==='SUBSCRIBED'){ch.current=c;O(true);P('lobby');await c.track({role:r,name:r.toUpperCase()})}else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')L('Connection issue. Code check karo.')});
 },[]);
 useEffect(()=>()=>{if(ch.current&&db)db.removeChannel(ch.current)},[]);
 useEffect(()=>{if(!playing)return;const id=setInterval(()=>T(v=>{const n=Math.max(0,v-1);if(roleRef.current==='shushu'&&Date.now()-lastClock.current>850){lastClock.current=Date.now();const a=fRef.current;let w='';if(a.shushu.hp<=0)w='Kukudii';else if(a.kukudii.hp<=0)w='Shushu';else if(n===0)w=a.shushu.hp===a.kukudii.hp?'Draw':a.shushu.hp>a.kukudii.hp?'Shushu':'Kukudii';if(w){W(w);G(false)}send({kind:'clock',seconds:n,winner:w})}return n}),1000);return()=>clearInterval(id)},[playing,send]);
 useEffect(()=>{if(playing&&(f.shushu.hp<=0||f.kukudii.hp<=0)){const w=f.shushu.hp<=0?'Kukudii':'Shushu';W(w);G(false);if(role==='shushu')send({kind:'clock',seconds:time,winner:w})}},[f,playing,role,send,time]);
 const create=()=>connect(Math.random().toString(36).slice(2,7).toUpperCase(),'shushu');
 const join=()=>{const c=input.trim().toUpperCase();if(c.length<4){L('Valid room code daalo ❤️');return}connect(c,'kukudii')};
 const start=async()=>{F(fresh());T(90);W('');G(true);P('game');L('FIGHT! Dono apni power dikhao! ⚡');await send({kind:'start'})};
 const move=async d=>{if(!playing||Date.now()-last.current<90)return;last.current=Date.now();const x=clamp(f[role].x+d*4,8,92);F(a=>({...a,[role]:{...a[role],x}}));await send({kind:'move',x})};
 const attack=async a=>{if(!playing||Date.now()-last.current<220)return;last.current=Date.now();if(a==='special'&&f[role].energy<35){L('Special ke liye 35 energy chahiye! Pehle punch/kick karo.');return}
  const msg=words[role][Math.floor(Math.random()*words[role].length)];
  F(old=>{const n={...old},t=role==='shushu'?'kukudii':'shushu',amount=a==='special'?25:a==='kick'?14:a==='punch'?10:0,damage=old[t].block?Math.ceil(amount*.2):amount;
   n[t]={...old[t],hp:clamp(old[t].hp-damage,0,100),action:damage?'hurt':old[t].action,block:false};
   n[role]={...old[role],energy:a==='special'?Math.max(0,old[role].energy-35):clamp(old[role].energy+(amount?12:0),0,100),action:a,block:a==='block'};return n});
  L(msg);await send({kind:'attack',action:a,line:msg});
 };
 const leave=async()=>{if(ch.current&&db)await db.removeChannel(ch.current);ch.current=null;P('home');G(false);W('');O(false);Pe([])};
 const fighter=k=><div className={'fighter '+k} style={{left:f[k].x+'%'}}><FighterArtDummy who={k} action={f[k].action}/><b>{k.toUpperCase()}</b></div>;
 const meter=k=><div className="meter"><div><b>{k.toUpperCase()}</b><span>{f[k].hp} HP</span></div><div className={'hp '+k}><i style={{width:f[k].hp+'%'}}/></div><div className="energy"><i style={{width:f[k].energy+'%'}}/></div></div>;
 return <main className="app"><header><b>♥ LOVE WAR <i>ARENA</i></b><small>SHUSHU × KUKUDII</small></header>
 {page==='home'&&<section className="home"><small>A PRIVATE FIGHTING GAME FOR TWO</small><h1>SHUSHU <em>VS</em><br/>KUKUDII</h1><p>Pyaar apni jagah. Fight apni jagah. 💥</p>
 <div className="showcase"><div className="card red"><Fighter who="shushu"/><b>SHUSHU</b><small>CRIMSON STRIKER</small></div><strong>VS</strong><div className="card pink"><Fighter who="kukudii"/><b>KUKUDII</b><small>HEART STORM</small></div></div>
 {!db&&<p className="warning">Supabase keys add karo to enable online rooms.</p>}<div className="actions"><button className="primary" onClick={create}>＋ CREATE ROOM</button><div><input value={input} onChange={e=>I(e.target.value)} placeholder="ENTER ROOM CODE"/><button onClick={join}>JOIN ROOM</button></div></div><small>Room creator = Shushu · Guest = Kukudii</small></section>}
 {page==='lobby'&&<section className="lobby"><small>YOUR PRIVATE ROOM</small><h2>ROOM CODE</h2><strong className="code">{room}</strong><button className="copy" onClick={()=>navigator.clipboard?.writeText(room)}>COPY CODE</button><p>Partner ko code bhejo aur battle start karo.</p><div className="lobbyCards"><div><Fighter who="shushu"/><b>SHUSHU</b></div><div><Fighter who="kukudii"/><b>KUKUDII</b></div></div><small className="online">● {online?'Connected':'Connecting'} · {people.length}/2 players</small><button className="primary start" onClick={start}>START FIGHT ⚔</button><button className="plain" onClick={leave}>Leave room</button></section>}
 {page==='game'&&<section className="game"><div className="hud">{meter('shushu')}<div className="clock">{String(time).padStart(2,'0')}<small>TIME</small></div>{meter('kukudii')}</div><div className="arena"><div className="clouds">☁　　　 ☁　　　 ☁</div><div className="sun">☀</div><div className="city">⌂　▥　⌂　▥　⌂</div><div className="ground"/>{fighter('shushu')}{fighter('kukudii')}<b className="arenaTitle">LOVE WAR ARENA</b></div><div className="dialogue">{line}</div><div className="controls"><div><button onClick={()=>move(-1)}>◀</button><button onClick={()=>move(1)}>▶</button></div><div className="attacks"><button onClick={()=>attack('punch')}>👊<small>PUNCH</small></button><button onClick={()=>attack('kick')}>🦵<small>KICK</small></button><button onClick={()=>attack('block')}>🛡<small>BLOCK</small></button><button className="special" onClick={()=>attack('special')}>✦<small>SPECIAL</small></button></div></div><div className="bottom">PLAYING AS <b>{role.toUpperCase()}</b><button className="plain" onClick={leave}>EXIT MATCH</button></div></section>}
 {winner&&<div className="overlay"><div className="result"><div>🏆</div><small>BATTLE COMPLETE</small><h2>{winner==='Draw'?'IT’S A DRAW!':winner.toUpperCase()+' WINS!'}</h2><p>{winner==='Shushu'?'Kukudii, rematch toh banta hai! ❤️':winner==='Kukudii'?'Shushu, ab sorry bolo! 😘':'Dono ek doosre ke dil mein jeete! 💞'}</p><button className="primary" onClick={start}>REMATCH ❤️</button><button className="plain" onClick={()=>{W('');P('lobby')}}>BACK TO ROOM</button></div></div>}
 <footer>Made with ♥ for Shushu & Kukudii</footer></main>
}
function FighterArtDummy({who,action}){return <Fighter who={who} action={action}/>}
