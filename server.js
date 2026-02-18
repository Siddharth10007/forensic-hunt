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

const PORT = 3000;

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
      loginTime: getReadableTime(),
      score: 0,
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
// 🧩 SUBMIT ANSWER ROUTE
// ===============================

app.post("/submit", (req, res) => {
  const { team, category, answer } = req.body;

  if (!teams[team]) {
    return res.json({ correct: false, msg: "Team not found" });
  }

  const story = stories[teams[team].storyId];

  // normalize for easier matching
  const userAnswer = answer.toLowerCase().trim();
  const correctAnswer = story[category].toLowerCase();

  const isCorrect = userAnswer === correctAnswer;

  if (isCorrect && !teams[team].discoveries[category]) {

  // save readable timestamp
  teams[team].discoveries[category] = getReadableTime();

  // update score
  const solvedCount = Object.values(teams[team].discoveries)
    .filter(v=>v!==null).length;

  teams[team].score = solvedCount * 25;

  // if all clues solved → set finish time once
  if(solvedCount === 4 && !teams[team].finishTime){
    teams[team].finishTime = getReadableTime();
  }

  saveProgress();
}


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

    const totalScore = solvedCount * 25;

    // finish time = latest timestamp
    const times = Object.values(data.discoveries).filter(v => v);
    const finishTime = times.length ? Math.max(...times) : null;

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

IP anomaly detected...
Device linked to: ${stage>=1 ? story.weapon : "UNKNOWN"}

<!-- weapon = ${story.weapon} -->
`;

  }

  if(file==="mail"){

    output=`
MAIL SERVER BACKUP

CEO complaints archived.

${stage>=2 ? story.motive : "ENCRYPTED DATA"}

<!-- motive = ${story.motive} -->
`;

  }

  if(file==="accesslog"){

    output=`
ACCESS CONTROL LOG

Entry point: ${stage>=3 ? story.location : "REDACTED"}

<!-- location = ${story.location} -->
`;
  }

  res.type("text/plain").send(output);
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
    "[SERVER]",
    "[MAIL]",
    "[FIREWALL]",
    "[CEO-LAPTOP]",
    "[UNKNOWN DEVICE]"
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
// 🚀 START SERVER
// ===============================

app.get("/", (req,res)=>{
   res.sendFile(__dirname + "/public/login.html");
});

app.listen(PORT, () => {
  console.log(`🕵️ Murder Hunt Server running at http://localhost:${PORT}`);
});
