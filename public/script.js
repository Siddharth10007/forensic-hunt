const team = localStorage.getItem("team");

if(!team){
  window.location="login.html";
}

const output = document.getElementById("output");
const input = document.getElementById("cmd");

// ======================
// ⚡ REACTIVE EFFECTS
// ======================

function triggerSuccess(){
  document.body.classList.add("success");
  setTimeout(()=>document.body.classList.remove("success"),300);
}

function triggerError(){
  document.body.classList.add("error");
  setTimeout(()=>document.body.classList.remove("error"),300);
}

function triggerShake(){
  document.body.classList.add("shake");
  setTimeout(()=>document.body.classList.remove("shake"),250);
}


// ======================
// 🧭 CYBER RADAR ANIMATION
// ======================

const radar = document.getElementById("radar");

if(radar){

  const rctx = radar.getContext("2d");
  radar.width = 180;
  radar.height = 180;

  let angle = 0;

  // fake nodes
  const nodes = [
    {x:40,y:60},
    {x:120,y:50},
    {x:80,y:120},
    {x:140,y:130}
  ];

  function drawRadar(){

    rctx.clearRect(0,0,radar.width,radar.height);

    // radar circle
    rctx.strokeStyle="#22c55e";
    rctx.beginPath();
    rctx.arc(90,90,80,0,Math.PI*2);
    rctx.stroke();

    // sweeping line
    rctx.beginPath();
    rctx.moveTo(90,90);
    rctx.lineTo(
      90 + 80*Math.cos(angle),
      90 + 80*Math.sin(angle)
    );
    rctx.stroke();

    // nodes
    nodes.forEach(n=>{
      rctx.fillStyle="#22c55e";
      rctx.beginPath();
      rctx.arc(n.x,n.y,3,0,Math.PI*2);
      rctx.fill();
    });

    angle += 0.05;
  }

  setInterval(drawRadar,30);
}


// ======================
// 🌐 LIVE CYBER COMPETITION FEED
// ======================

const feed = document.getElementById("livefeed");

const fakeEvents = [
 "[TEAM03] scanning packets...",
 "[TEAM11] decrypting logs...",
 "[SYS] anomaly detected...",
 "[TEAM07] accessing server...",
 "[NET] firewall ping...",
 "[TEAM02] running AI analysis..."
];

function pushFeed(){

  if(!feed) return;

  const msg = document.createElement("div");
  msg.textContent = fakeEvents[Math.floor(Math.random()*fakeEvents.length)];

  feed.prepend(msg);

  // keep feed short
  if(feed.children.length>20){
    feed.removeChild(feed.lastChild);
  }
}

// new message every 2 seconds
setInterval(pushFeed,2000);


let history=[];
let historyIndex=-1;

let teamData={};

// ======================
// LOAD TEAM DATA
// ======================

fetch(`/team-data/${team}`)
.then(r=>r.json())
.then(data=>teamData=data);

// ======================
// MATRIX BACKGROUND EFFECT
// ======================

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "01";
const fontSize = 14;
const columns = canvas.width/fontSize;
const drops = Array.from({length:columns}).fill(1);

function drawMatrix(){
  ctx.fillStyle="rgba(0,0,0,0.08)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#22c55e";
  ctx.font=fontSize+"px monospace";

  for(let i=0;i<drops.length;i++){
    const text = letters[Math.floor(Math.random()*letters.length)];
    ctx.fillText(text,i*fontSize,drops[i]*fontSize);

    if(drops[i]*fontSize > canvas.height && Math.random()>0.975){
      drops[i]=0;
    }
    drops[i]++;
  }
}

setInterval(drawMatrix,50);

// ======================
// TYPING SOUND
// ======================

const typeAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
typeAudio.volume = 0.08;


// ======================
// COMMAND HISTORY
// ======================

input.addEventListener("keydown",(e)=>{
  if(e.key==="ArrowUp"){
    if(history.length){
      historyIndex=Math.max(0,historyIndex-1);
      input.value=history[historyIndex];
    }
  }
  if(e.key==="ArrowDown"){
    if(history.length){
      historyIndex=Math.min(history.length-1,historyIndex+1);
      input.value=history[historyIndex];
    }
  }
});

const commands = [
 "help",
 "scan network",
 "network map",
 "open mail",
 "read accesslog",
 "ai assist",
 "leaderboard",
 "submit"
];

input.addEventListener("keydown",(e)=>{
  if(e.key==="Tab"){
    e.preventDefault();

    const val=input.value.toLowerCase();

    const match = commands.find(c=>c.startsWith(val));
    if(match){
      input.value=match;
    }
  }
});

// ======================
// OUTPUT FUNCTIONS
// ======================

async function typePrint(text,speed=8){
  for(const c of text){
    output.textContent+=c;
    output.scrollTop=output.scrollHeight;
    typeAudio.currentTime=0;
    typeAudio.play().catch(()=>{});
    await sleep(speed);
  }
  output.textContent+="\n";
}

function print(text){
  output.textContent+="\n"+text;
  output.scrollTop=output.scrollHeight;
}

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

// ======================
// PROGRESS BAR
// ======================

async function progress(label){
  let bar="";
  output.textContent+="\n"+label+" [";
  for(let i=0;i<20;i++){
    bar+="█";
    output.textContent=output.textContent.replace(/\[.*$/,"["+bar);
    await sleep(35);
  }
  output.textContent+="] DONE\n";
}

// ======================
// GLITCH EFFECT
// ======================

async function glitch(text){
  const chars="!@#$%^&*()_+=-{}[]";
  for(let i=0;i<6;i++){
    print(chars[Math.floor(Math.random()*chars.length)].repeat(10));
    await sleep(60);
  }
  await typePrint(text);
}

// ======================
// HANDLE INPUT
// ======================

function handleCommand(e){

  if(e.key!=="Enter") return;

  const cmd=input.value.trim();
  if(!cmd) return;

  history.push(cmd);
  historyIndex=history.length;

  input.value="";
  print("> "+cmd);

  parseCommand(cmd.toLowerCase());
}



// ======================
// AI ASSISTANT
// ======================

async function aiReply(){
  const replies=[
    "Analyzing forensic patterns...",
    "Cross-referencing digital fingerprints...",
    "Suspicious activity detected."
  ];
  await typePrint("[AI] "+replies[Math.floor(Math.random()*replies.length)]);
}

// ======================
// COMMAND PARSER
// ======================

async function parseCommand(cmd){

  const parts = cmd.split(" ");
  const main = parts[0];

  if(main==="help"){
    await typePrint(`
COMMANDS:

scan network
read accesslog
network map
open mail
ai assist
leaderboard
submit [category] [answer]
`);
  }

  // 🌐 NETWORK SCAN
  else if(cmd==="network map"){

    await progress("RENDERING NETWORK TOPOLOGY");

    const r = await fetch(`/networkmap/${team}`);
    const nodes = await r.json();

    nodes.forEach(n=>print(" ├─ "+n));
  }
  else if(cmd==="download fragment"){
   window.open(`/download/${team}/fragment`);
}

  // 📂 DYNAMIC FILES (FROM GOD MODE)
  else if(cmd==="scan network"){
    await progress("SCANNING NETWORK");
    const r = await fetch(`/forensics/${team}/network`);
    await typePrint(await r.text());
  }
  else if(["server","conf","cafe","lot","unknown"].includes(cmd)){

 if(cmd==="unknown"){
   window.open("https://www.youtube.com/watch?v=fC7oUOUEEi4");
   return;
 }

 const res = await fetch(`/location/${team}/${cmd}`);
 const text = await res.text();

 print(text);
}



  // ======================
// 📧 MOTIVE COMMANDS (UPDATED)
// ======================

else if(cmd==="open mail"){
 await progress("ACCESSING MAIL ARCHIVE");
 const res = await fetch(`/mail/${team}/start`);
 print(await res.text());
}

else if(cmd==="lizard"){
 const res = await fetch(`/mail/${team}/lizard`);
 print(await res.text());
}

else if(cmd==="monster"){
 const res = await fetch(`/mail/${team}/monster`);
 print(await res.text());
}

else if(cmd==="ceo"){
 const res = await fetch(`/mail/${team}/ceo`);
 print(await res.text());
}

else if(cmd==="king kong"){
 const res = await fetch(`/mail/${team}/kingkong`);
 print(await res.text());
}

else if(cmd==="image"){
 window.open("https://i.pinimg.com/474x/7b/67/09/7b67097f2be633efd643ab7dec032d4b.jpg");
}

else if(cmd==="hex_scan"){
 window.open("https://www.youtube.com/watch?v=ZhFVt5uPdW0");
}

else if(cmd==="site"){
 window.open("https://cloudzilla-nmit.vercel.app/");
}

else if(cmd==="25"){
 print(`
AI ANALYSIS:
Sum confirmed: 55
Adjusted value: 25
Archive node unclear.
`);
window.open("https://www.youtube.com/watch?v=YbaTur4A1OU");
}

  else if(cmd==="read accesslog"){
    await progress("FETCHING ACCESS LOG");
    const r = await fetch(`/forensics/${team}/accesslog`);
    await typePrint(await r.text());
  }

  // 🤖 AI ASSIST
  else if(cmd==="ai assist"){

 const hints=[
  "Badge correlation unstable...",
  "Director flagged as suspicious.",
  "Peripheral device anomaly detected."
 ];

 await glitch("[AI] "+hints[Math.floor(Math.random()*hints.length)]);
}

  // 🏆 LEADERBOARD
  else if(cmd==="leaderboard"){
    const res=await fetch("/leaderboard");
    const data=await res.json();
    data.slice(0,5).forEach((t,i)=>{
      print(`#${i+1} ${t.team} — ${t.score}`);
    });
  }

  // 😈 SECRET JUDGE COMMAND
  else if(cmd==="sudo judge_override"){
    await glitch("ROOT ACCESS GRANTED");
    await typePrint("Hello Judge 👑");
  }

  // 🧩 SUBMIT ANSWER
  else if(main==="submit"){

    const category=parts[1];
    const answer=parts.slice(2).join(" ");

    await progress("VERIFYING DATA");

    const res = await fetch("/submit",{
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({team,category,answer})
    });

    const data = await res.json();

    if(data.correct){
  triggerSuccess();
  await typePrint("✅ CLUE VERIFIED — NEW DATA UNLOCKED");
}else{
  triggerError();
  triggerShake();
  await typePrint("❌ INVALID ENTRY");
}

    checkFinish(); // 🔥 auto finish check
  }

  else{
    triggerError();
await typePrint("Unknown command.");

  }
}



// ======================
// BOOT SEQUENCE
// ======================

(async ()=>{

  const breach = localStorage.getItem("breachTransition");

  // ======================
  // CONTINUED BREACH ENTRY
  // ======================

  if(breach==="true"){

    localStorage.removeItem("breachTransition");

    await glitch(">>> AUTHORIZATION ACCEPTED");
    await typePrint("Continuing secure session...");
    await sleep(200);
    await typePrint("Linking forensic console...");
    await sleep(200);
    await typePrint("Team Session: "+team);
    await typePrint('Type "help" to begin.\n');

  }else{

    // normal boot if page opened directly
    await typePrint("Booting Forensics Terminal...");
    await sleep(300);
    await typePrint("Loading Investigation Modules...");
    await sleep(300);
    await glitch("CONNECTED TO TEAM: "+team);
    await typePrint('Type "help" to begin.\n');

  }

})();


async function checkFinish(){

  const r = await fetch(`/finish/${team}`);
  const data = await r.json();

  if(data.done){

    await progress("COMPILING FINAL REPORT");

    await typePrint(`
██████████████████████████████
CASE CLOSED
CEO MURDER SOLVED
██████████████████████████████

Submitting final timestamps...
`);

    randomGlitchAttack();
  }
}

async function randomGlitchAttack(){

  const glitchChars="▓▒░█";

  for(let i=0;i<12;i++){
    output.textContent += glitchChars[Math.floor(Math.random()*glitchChars.length)];
    await sleep(40);
  }

  await typePrint("\nSYSTEM STABILIZED.");
}

setInterval(()=>{
  document.getElementById("cmd").focus();
},500);
