// ---------------- INITIALIZATION -----------------
function initializeData(){
    if(!localStorage.getItem("users")){
        const users=[
            {username:"FOUNDER", password:"0165pqyt", role:"superadmin"},
            {username:"ADMIN", password:"0165pqyt", role:"admin"}
        ];
        localStorage.setItem("users", JSON.stringify(users));
    }
    if(!localStorage.getItem("games")){
        const games=[
            {name:"Bloxd.io", url:"https://bloxd.io/", img:"bloxd.jfif", type:"link"},
            {name:"MiniBlox", url:"https://miniblox.io/", img:"download.jfif", type:"link"},
            {name:"Snake", img:"snake.jfif", type:"snake"},
            {name:"Tic-Tac-Toe", img:"tic.jfif", type:"tic-tac-toe"}
        ];
        localStorage.setItem("games", JSON.stringify(games));
    }
}

// ---------------- AUTH -----------------
function register(){
    const u=document.getElementById("register-username").value.trim();
    const p=document.getElementById("register-password").value;
    const c=document.getElementById("register-confirm").value;
    const msg=document.getElementById("register-message");
    if(!u||!p||!c){ msg.textContent="Fill all fields"; return; }
    if(p!==c){ msg.textContent="Passwords do not match"; return; }
    if(u==="FOUNDER"){ msg.textContent="Cannot register superadmin"; return; }

    const users=JSON.parse(localStorage.getItem("users"));
    if(users.find(x=>x.username===u)){ msg.textContent="Username exists"; return; }
    users.push({username:u,password:p,role:"user"});
    localStorage.setItem("users", JSON.stringify(users));
    msg.style.color="lightgreen"; msg.textContent="Registered! Redirecting...";
    setTimeout(()=>window.location.href="index.html",1500);
}

function login(){
    const u=document.getElementById("login-username").value.trim();
    const p=document.getElementById("login-password").value;
    const msg=document.getElementById("login-message");
    if(!u||!p){ msg.textContent="Fill all fields"; return; }
    const users=JSON.parse(localStorage.getItem("users"));
    const user=users.find(x=>x.username===u && x.password===p);
    if(!user){ msg.textContent="Incorrect login"; return; }
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href="home.html";
}

function checkAuth(){
    const u=localStorage.getItem("loggedInUser");
    if(!u) window.location.href="index.html";
    else{
        const user=JSON.parse(u);
        document.getElementById("welcome-user").textContent=`Hello, ${user.username}!`;
        if(user.role!=="user") document.getElementById("admin-tab-btn").style.display="inline-block";
    }
}

function logout(){
    localStorage.removeItem("loggedInUser");
    window.location.href="index.html";
}

// ---------------- TABS -----------------
function switchTab(tab){
    document.getElementById("games-tab").style.display=tab==="games"?"block":"none";
    document.getElementById("admin-tab").style.display=tab==="admin"?"block":"none";
}

// ---------------- GAMES -----------------
let filteredType="all";
function renderGames(){
    const grid=document.getElementById("games-grid");
    if(!grid) return;
    grid.innerHTML="";
    const games=JSON.parse(localStorage.getItem("games"));
    const currentUser=JSON.parse(localStorage.getItem("loggedInUser"));
    games.forEach(game=>{
        if(filteredType!=="all"){
            if(filteredType==="mini" && !["snake","tic-tac-toe"].includes(game.type)) return;
            if(filteredType==="link" && game.type!=="link") return;
        }
        const card=document.createElement("div");
        card.classList.add("game-card");
        let inner=`<h2>${game.name}</h2>
                   <img src="${game.img}" class="game-thumbnail">`;
        if(game.type==="link") inner+=`<button onclick="openGame('${game.url}')">Play</button>`;
        inner+=`<button class="fullscreen-btn" onclick="openGameFull('${game.url}','${game.name}')">Fullscreen</button>`;
        if(currentUser.role!=="user") inner+=`<button class="delete-btn" onclick="deleteGame('${game.name}')">Delete</button>`;
        card.innerHTML=inner;
        grid.appendChild(card);
    });
}

function filterGames(type){ filteredType=type; renderGames(); }
function openGame(url){ if(url) window.open(url,"_blank"); }
function openGameFull(url,name){ if(url) window.open(url,name,"fullscreen=yes"); }

function deleteGame(name){
    if(!confirm(`Delete ${name}?`)) return;
    const games=JSON.parse(localStorage.getItem("games")).filter(g=>g.name!==name);
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
}

// ---------------- ADMIN -----------------
function renderAdmin(){
    const userSection=document.getElementById("user-list");
    if(!userSection) return;
    const users=JSON.parse(localStorage.getItem("users"));
    const currentUser=JSON.parse(localStorage.getItem("loggedInUser"));
    userSection.innerHTML="";
    users.forEach(u=>{
        const div=document.createElement("div");
        div.textContent=`${u.username} (${u.role})`;
        if(currentUser.role==="superadmin" || 
           (currentUser.role==="admin" && u.role!=="admin" && u.username!=="FOUNDER")){
            div.innerHTML+=` <button onclick="deleteUser('${u.username}')">Delete</button>`;
        }
        userSection.appendChild(div);
    });
}

function addUser(){
    const u=document.getElementById("new-username").value.trim();
    const p=document.getElementById("new-password").value;
    const role=document.getElementById("new-admin").checked?"admin":"user";
    if(!u||!p){ alert("Fill fields"); return; }
    const users=JSON.parse(localStorage.getItem("users"));
    if(users.find(x=>x.username===u)){ alert("User exists"); return; }
    users.push({username:u,password:p,role:role});
    localStorage.setItem("users", JSON.stringify(users));
    renderAdmin();
}

function deleteUser(username){
    if(!confirm(`Delete user ${username}?`)) return;
    let users=JSON.parse(localStorage.getItem("users"));
    const currentUser=JSON.parse(localStorage.getItem("loggedInUser"));
    if(currentUser.role==="superadmin" || 
       (currentUser.role==="admin" && username!=="FOUNDER" && users.find(u=>u.username===username).role!=="admin")){
        users=users.filter(u=>u.username!==username);
        localStorage.setItem("users", JSON.stringify(users));
        renderAdmin();
    } else alert("You do not have permission");
}

// ---------------- ADD GAME -----------------
function addGame(){
    const name=document.getElementById("new-game-name").value.trim();
    const img=document.getElementById("new-game-img").value.trim();
    const url=document.getElementById("new-game-url").value.trim();
    const type=document.getElementById("new-game-type").value;
    if(!name||!img){ alert("Game name and image required"); return; }
    const games=JSON.parse(localStorage.getItem("games"));
    if(games.find(g=>g.name===name)){ alert("Game exists"); return; }
    games.push({name,img,url,type});
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
    renderAdmin();
}

// ---------------- DANGER ZONE (FOUNDER ONLY) -----------------
function resetAllAccountsToTwoAdmins(){
    const loggedRaw=localStorage.getItem("loggedInUser");
    if(!loggedRaw){ alert("You must be logged in as FOUNDER."); return; }
    const current=JSON.parse(loggedRaw);
    if(!(current.role==="superadmin" && current.username==="FOUNDER")){
        alert("Only FOUNDER (superadmin) may reset accounts."); return;
    }
    if(!confirm("This will DELETE ALL accounts and create only FOUNDER & ADMIN. Are you 100% sure?")) return;
    const newUsers=[
        {username:"FOUNDER", password:"0165pqyt", role:"superadmin"},
        {username:"ADMIN", password:"0165pqyt", role:"admin"}
    ];
    localStorage.setItem("users", JSON.stringify(newUsers));
    localStorage.setItem("loggedInUser", JSON.stringify(newUsers[0]));
    alert("All accounts reset. Logged in as FOUNDER.");
    renderAdmin();
    renderGames();
}
