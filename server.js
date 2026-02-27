// ===============================
// 🕵️ Digital Forensics Murder Hunt
// NO DATABASE VERSION
// ===============================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// ===============================
// ⏱ EVENT TIMER CONFIG
// ===============================

const ROUND_DURATION = 60 * 60 * 1000; // 1 hour in ms

// ===============================
// 🧠 GOD MODE STATE
// ===============================

function getStage(team){

  const solved = Object.values(teams[team].discoveries)
    .filter(v=>v!==null).length;

  return solved; // stage 0 → 4
}

// ===============================
// 🕒 FORMAT READABLE TIME
// ===============================

function getReadableTime(){
  const now = new Date();

  const date = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
  const time = now.toLocaleTimeString("en-GB"); // HH:MM:SS

  return `${date} ${time}`;
}



// ===============================
// 📂 LOAD STORIES
// ===============================

const stories = JSON.parse(
  fs.readFileSync("./data/stories.json", "utf-8")
);

// ===============================
// 🧠 MEMORY STORAGE (NO DB)
// ===============================

let teams = {};

// try loading previous progress (optional)
if (fs.existsSync("./data/progress.json")) {
  teams = JSON.parse(fs.readFileSync("./data/progress.json"));
}

// ===============================
// 💾 SAVE PROGRESS FUNCTION
// ===============================

function saveProgress() {
  fs.writeFileSync(
    "./data/progress.json",
    JSON.stringify(teams, null, 2)
  );
}

// ===============================
// 🔐 LOGIN ROUTE
// ===============================

app.post("/login", (req, res) => {
  const { team } = req.body;

  if (!team) {
    return res.json({ success: false });
  }

  // if team already exists, don't reassign story
  if (!teams[team]) {
    const storyIndex = Math.floor(Math.random() * stories.length);

    teams[team] = {
      storyId: storyIndex,
      loginTime: Date.now(),
      loginReadable: getReadableTime(),
      score: 0,
      penalty: 0,
      finishTime: null,
      discoveries: {
        murderer: null,
        weapon: null,
        location: null,
        motive: null
      }
    };

    saveProgress();
  }

  res.json({ success: true });
});

// ===============================
// ⏱ TEAM TIMER STATUS
// ===============================

app.get("/timer/:team",(req,res)=>{

 const {team} = req.params;

 if(!teams[team]) return res.json({expired:true});

 // ⭐ CHECK IF TEAM ALREADY FINISHED
 if(teams[team].finishTime){
   return res.json({
     expired:false,
     finished:true,
     remaining:0
   });
 }

 const login = teams[team].loginTime; // numeric timestamp
 const now = Date.now();

 const elapsed = now - login;
 const remaining = ROUND_DURATION - elapsed;

 if(remaining <= 0){
   return res.json({
     expired:true,
     remaining:0
   });
 }

 res.json({
   expired:false,
   finished:false,
   remaining
 });

});
// ===============================
// 🧩 SUBMIT ANSWER ROUTE
// ===============================

app.post("/submit", (req, res) => {
  const { team, category, answer } = req.body;

  if (!teams[team]) {
    return res.json({ correct: false, msg: "Team not found" });
  }

  const story = stories[teams[team].storyId];

  const userAnswer = answer.toLowerCase().trim();
  const correctAnswer = story[category].toLowerCase();

  const isCorrect = userAnswer === correctAnswer;

  // ✅ CORRECT ANSWER
  if (isCorrect && !teams[team].discoveries[category]) {

    teams[team].discoveries[category] = getReadableTime();

  }

  // ❌ WRONG ANSWER → APPLY PENALTY
  if(!isCorrect){
    teams[team].penalty = (teams[team].penalty || 0) + 2;
  }

  // 🔄 UPDATE SCORE (ALWAYS RECALCULATE)
  const solvedCount = Object.values(teams[team].discoveries)
    .filter(v=>v!==null).length;

  teams[team].score = (solvedCount * 25) - (teams[team].penalty || 0);

  // 🏁 FINISH TIME
  if(solvedCount === 4 && !teams[team].finishTime){
    teams[team].finishTime = getReadableTime();
  }

  saveProgress();

  res.json({ correct: isCorrect });
});
// ===============================
// 🏁 LEADERBOARD ROUTE
// ===============================

app.get("/leaderboard", (req, res) => {

  const results = Object.keys(teams).map(team => {

    const data = teams[team];

    const solvedCount = Object.values(data.discoveries)
      .filter(v => v !== null).length;

    const totalScore = data.score || (solvedCount * 25);

    // finish time = latest timestamp
    const finishTime = data.finishTime || null;

    return {
      team,
      score: totalScore,
      finishTime
    };
  });

  // sort by score desc, then fastest finish
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (!a.finishTime) return 1;
    if (!b.finishTime) return -1;
    return a.finishTime - b.finishTime;
  });

  res.json(results);
});

// ===============================
// 📂 DYNAMIC FORENSIC FILE
// ===============================

app.get("/forensics/:team/:file",(req,res)=>{

  const {team,file} = req.params;

  if(!teams[team]) return res.send("");

  const story = stories[teams[team].storyId];
  const stage = getStage(team);

  let output="";

  if(file==="network"){

output=`
NETWORK TRACE REPORT

Encrypted archive recovered from corrupted CEO backup.
File integrity: 82%

Suspicious device class detected:
PERIPHERAL INPUT HARDWARE

Use command:
download fragment

NOTE:
AI analysis unstable.
`;

}


 if(file==="accesslog"){

const story = stories[teams[team].storyId];

let code = 0;

if(story.location.includes("Server")) code = 1;
else if(story.location.includes("Conference")) code = 2;
else if(story.location.includes("Cafeteria")) code = 3;
else if(story.location.includes("Parking")) code = 4;

output=`
ACCESS CONTROL LOG — PARTIAL RECOVERY

02:00 System reboot initiated
02:01 Kernel module loaded
02:05 Login attempt detected
02:10 Badge Entry → 3
02:20 Badge Entry → 2
02:30 USB device connected
02:40 Badge Entry → 4
02:45 Login attempt detected
02:50 Badge Entry → 1
03:00 Scheduled update applied
03:10 Maintenance routine executed
03:15 Access attempt detected
03:20 Badge Entry → ${code}
03:21 Badge Entry → ${code}
03:22 Device ID anomaly detected
03:23 Firewall anomaly detected

NOTES:
• Badge codes reference internal zones.
• Network Map labels may help decode zones(locations).

STATUS:
Data integrity compromised.
`;

}

  res.type("text/plain").send(output);
});

app.get("/location/:team/:node",(req,res)=>{

 const {team,node} = req.params;

 if(!teams[team]) return res.send("");

 const story = stories[teams[team].storyId];

 let output="";

 if(node==="server"){
   output=`
CLOUDZILLA INCIDENT REPORT — "SERVER ROOM"

Rack temperature spikes were detected minutes before shutdown.
Security logs show restricted access during late hours.
Witnesses reported heavy equipment noises near the main racks.
Location ID: 1

`;
 }

 else if(node==="conf"){
   output=`
CLOUDZILLA INCIDENT REPORT — "CONFERENCE ROOM"

Emergency meeting scheduled unexpectedly.
Audio fragments captured raised voices.
Access logs indicate a confrontation occurred.
Location ID: 2

`;
 }

 else if(node==="cafe"){
   output=`
CLOUDZILLA INCIDENT REPORT — "CAFETERIA"

Multiple staff gathered during lunch hours.
Security footage shows a sudden disruption near the tables.
Unattended items were reported shortly before the incident.
Location ID: 3

`;
 }

 else if(node==="lot"){
   output=`
CLOUDZILLA INCIDENT REPORT — "PARKING LOT"

Vehicle sensors recorded sudden movement near the executive bay.
Security lights activated briefly.
Witnesses heard an argument near the parking area.
Location ID: 4

`;
 }

 else if(node==="unknown"){
   return res.json({redirect:true});
 }

 res.type("text/plain").send(output);

});

// ===============================
// 📧 MOTIVE EMAIL SYSTEM (DISCREET COMMAND VERSION)
// ===============================

app.get("/mail/:team/:layer",(req,res)=>{

 const {team,layer} = req.params;
 if(!teams[team]) return res.send("");

 const story = stories[teams[team].storyId];

 let output="";

 // ===============================
 // 🟢 START — OPEN MAIL
 // ===============================
 if(layer==="start"){

output=`
EMAIL THREAD — CEO_CONFLICT_ARCHIVE [PARTIAL RESTORE]

CEO:
We are moving forward with legacy browser compatibility.
Internet Explorer support is non-negotiable.
The company needs stability more than flashy new interfaces.

██████████████████:
You call it stability, everyone else calls it regression.
Developers are rewriting features just to make them work in a dead browser.

CEO:
Metrics show improved uniformity across departments.
Parking complaints and cafeteria rumors are irrelevant.

██████████████████:
You blocked three parking slots again today.
People are talking about it everywhere — HR, Dev, even Facilities.

CEO:
Light mode improves readability metrics.
Data doesn’t lie.

██████████████████:
Morale dropped the moment you enforced that rule.

CEO:
Nonsense.


██████████████████:
You think you are so smart, hiding your messages in hex strings, and accessing them through the command line.
I got one for you, if you are too stupid then you can even use a translator(recommended).

6865785F7363616E

CEO:
I am good with binary as well, if you want answers, decode this as well:

01101100 01101001 01111010 01100001 01110010 01100100


`;
 }

 // ===============================
 // 🟡 LIZARD — SECOND EMAIL
 // ===============================
 else if(layer==="lizard"){

output=`
EMAIL THREAD — INTERNAL ESCALATION LOG

██████████████████:
The entire design team complained about the forced light mode update.
Even support staff said customers noticed the change immediately.

CEO:
Change always brings resistance.
Productivity charts increased after deployment.

██████████████████:
Charts don’t show exhaustion.
People are covering their screens with filters just to work comfortably.

CEO:
By the way, how dare you share that image of mine to the other employees? That’s a violation of privacy.
You think you are too smart, trying to hide it in a qr code and made it accessible through the command 'image'.

██████████████████:
Haha, how stupid you look in that image. 

CEO:
Engineering should focus on delivery, not aesthetics.

██████████████████:
Fine. Solve this instead:

[∑(n=1→5) n²] − 30

CEO:
And this fragment was found in system logs:

6D6F6E73746572

`;
 }

 // ===============================
 // 🔴 MONSTER — FINAL EMAIL
 // ===============================
 else if(layer==="monster"){

output=`
EMAIL THREAD — FINAL FRAGMENT

CEO:
This conversation ends here.
I know exactly why tensions are rising across CloudZilla.

██████████████████:
Then maybe you finally understand what pushed things too far.

CEO:
Investigators might read this someday.
If they are smart enough, they will know where to look.

██████████████████:
You hid it, didn’t you?

CEO:
Yes.
Only those who reach this layer deserve the truth.

FINAL PUZZLE STRING:
77686174206120736D617274206D616E3A20747970652063656F

`;
 }

 // ===============================
 // 🧠 CEO STEP
 // ===============================
 else if(layer==="ceo"){

output=`
SYSTEM NOTE — CEO PERSONAL LOG

The CEO suspected the motive long before the incident.
Believing investigators would eventually reach this archive,
he concealed the final answer inside the CloudZilla public site.

What a smart man.

Type:
site
`;
 }

 // ===============================
 // 👑 FINAL MOTIVE REVEAL
 // ===============================
 else if(layer==="kingkong"){

output=`
MOTIVE RECONSTRUCTED:

${story.motive}

Investigation Node Complete.
`;
 }

 res.type("text/plain").send(output);

});

// ===============================
// 🔒 MURDERER LOCK SYSTEM (STORY VERSION)
// ===============================

app.get("/murderer/:team",(req,res)=>{

 const {team} = req.params;
 if(!teams[team]) return res.send("");

 const d = teams[team].discoveries;

 let solved = 0;
 if(d.weapon) solved++;
 if(d.location) solved++;
 if(d.motive) solved++;

 // 🔒 LOCKED
 if(solved < 3){
   return res.type("text/plain").send(`
IDENTITY TRACE LOCKED

Progress: ${solved}/3 Clues Completed

Uncover Weapon, Location, and Motive first.
`);
 }

 // 🔓 UNLOCKED — DRAMATIC STORY TEXT
 return res.type("text/plain").send(`
IDENTITY TRACE — FINAL RECONSTRUCTION

An artifact is recieved, maybe useful later.

He is playing with us, what a cheeky man. 
Leaving a message for us? 
His last mistake.

Type 'message'
`);
});

// ===============================
// 🖼️ MURDERER IMAGE DOWNLOAD
// ===============================

app.get("/download-murderer/:team",(req,res)=>{

 const filePath = path.join(__dirname,"data","assets","identity_trace.jpg");
 res.download(filePath);

});

// ===============================
// 🎧 FINAL AUDIO EVIDENCE (DYNAMIC)
// ===============================

app.get("/caught/:team",(req,res)=>{

 const {team} = req.params;

 if(!teams[team]) return res.send("");

 const story = stories[teams[team].storyId];

 // normalize murderer name
 let killer = story.murderer.toLowerCase();

 // map names to audio files
 let fileName = "";

 if(killer.includes("intern")) fileName = "int.wav";
 else if(killer.includes("director")) fileName = "dir.wav";
 else if(killer.includes("manager")) fileName = "man.wav";
 else if(killer.includes("partner")) fileName = "part.wav";

 const filePath = path.join(__dirname,"data","assets",fileName);

 res.download(filePath);

});


app.get("/download/:team/fragment",(req,res)=>{

 const team=req.params.team;
 if(!teams[team]) return res.send("");

 const story = stories[teams[team].storyId];

 let filename="";

 if(story.weapon.includes("keyboard")) filename="whoami.pdf";
 if(story.weapon.includes("USB")) filename="whocoulditbe.pdf";
 if(story.weapon.includes("charger")) filename="whodidit.pdf";
 if(story.weapon.includes("coffee")) filename="whoisit.pdf";

 const filePath = path.join(__dirname,"data","storyfiles",filename);

 res.download(filePath);
});

app.get("/achievement/:team",(req,res)=>{

  const stage = getStage(req.params.team);

  const titles=[
    "Rookie Analyst",
    "Packet Inspector",
    "Digital Sleuth",
    "Cyber Hunter",
    "Forensics Master"
  ];

  res.json({
    title: titles[stage]
  });
});

// ===============================
// 🏁 CHECK FINISH STATUS
// ===============================

app.get("/finish/:team",(req,res)=>{

  const team = req.params.team;
  if(!teams[team]) return res.json({done:false});

  const solved = Object.values(teams[team].discoveries)
    .filter(v=>v!==null).length;

  res.json({
    done: solved===4
  });
});

app.get("/networkmap/:team",(req,res)=>{

  const nodes = [
  "[UNKNOWN]",
  "[SERVER]",
  "[CONF]",
  "[CAFE]",
  "[LOT]"
];

  res.json(nodes);
});


// ===============================
// 🔍 DEBUG ROUTE (OPTIONAL)
// shows assigned story (REMOVE IN EVENT)
// ===============================

app.get("/debug/:team", (req,res)=>{
  const team = req.params.team;
  if(!teams[team]) return res.json({});
  res.json(stories[teams[team].storyId]);
});

// ===============================
// 🎯 GET TEAM STORY DATA (SAFE)
// ===============================

app.get("/team-data/:team",(req,res)=>{

  const team = req.params.team;

  if(!teams[team]){
    return res.json({});
  }

  const story = stories[teams[team].storyId];

  // send only hint text (not full answers)
  res.json({
    hintEmail: story.motive,
    hintLog: story.location
  });
});

// ===============================
// 👑 ADMIN LIVE MONITOR (SAFE)
// ===============================

app.get("/admin-progress",(req,res)=>{

  const summary = Object.keys(teams).map(team=>{

    const data = teams[team];

    const solvedCount = Object.values(data.discoveries)
      .filter(v=>v!==null).length;

    return {
      team,
      storyId: data.storyId,
      loginTime: data.loginTime,
      score: data.score || solvedCount*25,
      finishTime: data.finishTime || null,
      discoveries: data.discoveries
    };
  });

  res.json(summary);
});


// ===============================
// 🚀 START SERVER
// ===============================

app.get("/", (req,res)=>{
   res.sendFile(__dirname + "/public/login.html");
});

app.listen(PORT, () => {
  console.log(`🕵️ Murder Hunt Server running at http://localhost:${PORT}`);
});
