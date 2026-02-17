const team = localStorage.getItem("team");

if(!team){
  window.location="login.html";
}

document.getElementById("teamDisplay").innerText="Team: "+team;

function openTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  document.getElementById(id).style.display="block";
}

openTab("evidence");

function rickroll(){
  window.open("https://youtu.be/dQw4w9WgXcQ");
}

async function submitAnswer(){

  const category = document.getElementById("category").value;
  const answer = document.getElementById("answer").value;

  const res = await fetch("/submit",{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({team,category,answer})
  });

  const data = await res.json();

  document.getElementById("result").innerText =
    data.correct ? "✅ ACCESS GRANTED" : "❌ ACCESS DENIED";
}

function loadFile(name){
  document.getElementById("viewer").textContent =
    "Opening file: "+name+"\n\nHint: <!-- location = Server Room -->";
}
