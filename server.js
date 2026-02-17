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
    teams[team].discoveries[category] = Date.now();
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
// 🔍 DEBUG ROUTE (OPTIONAL)
// shows assigned story (REMOVE IN EVENT)
// ===============================

app.get("/debug/:team", (req,res)=>{
  const team = req.params.team;
  if(!teams[team]) return res.json({});
  res.json(stories[teams[team].storyId]);
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
