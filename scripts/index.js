
var canvas = document.querySelector("canvas")
var ctx = canvas.getContext("2d")

function resizeCanvas() {
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@$%&"
letters = letters.split("")

var fontSize = 11
var columns = canvas.width / fontSize

var drops = []
var speeds = []
for (var i = 0; i < columns; i++) {
  drops[i] = 1
  speeds[i] = Math.random() + 0.5
}
let isVerified=false;
function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "rgba(0, 255, 0, 0.3)"
  ctx.font = fontSize + "px arial"
  for (var i = 0; i < drops.length; i++) {
    var text = letters[Math.floor(Math.random() * letters.length)]
    ctx.fillText(text, i * fontSize, drops[i] * fontSize)

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0
    }

    drops[i] += speeds[i]
  }
}

setInterval(draw, 33)
async function startGame() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("pass").value;
  if(username == ""||password == ""){
    alert("Please enter username and password to Proceed!!!");
  }else{
  localStorage.setItem("user",username);
    let totalQueriesSolved=0;
    try{
      let data= await checkUser(username,password);
      isVerified=data.isVerified;
      totalQueriesSolved=data.user.totalQueriesSolved;
      localStorage.setItem("totalQueriesSolved",data.user.totalQueriesSolved);
      localStorage.setItem("score",data.user.score);
    }
    catch(err){
      console.error("Error submitting data:", err);
    }
    if(isVerified==true){
      if(totalQueriesSolved>0){
          setTimeout(() => {
            fetch('mainGame.html')
              .then(response => response.text())
              .then(data => {
                document.body.innerHTML = data

                const SQLscript = document.createElement('script')
                SQLscript.src = 'sql-wasm.js'
                document.body.appendChild(SQLscript)
                SQLscript.onload = () => {
                  const script = document.createElement('script')
                  script.src = 'main.js'
                  document.body.appendChild(script)
                  script.onload = () => {
                    const newFadeToBlackDiv = document.createElement('div')
                    newFadeToBlackDiv.id = 'fade-to-black'
                    newFadeToBlackDiv.style.position = 'fixed'
                    newFadeToBlackDiv.style.top = '0'
                    newFadeToBlackDiv.style.left = '0'
                    newFadeToBlackDiv.style.width = '100%'
                    newFadeToBlackDiv.style.height = '100%'
                    newFadeToBlackDiv.style.backgroundColor = 'black'
                    newFadeToBlackDiv.style.transition = 'opacity 1s'
                    newFadeToBlackDiv.style.visibility = 'visible'
                    newFadeToBlackDiv.style.opacity = '1'
                    document.body.appendChild(newFadeToBlackDiv)

                    setTimeout(() => {
                      newFadeToBlackDiv.style.opacity = '0'
                    }, 1000)

                    setTimeout(() => {
                      newFadeToBlackDiv.style.visibility = 'hidden'
                    }, 2000)
                  }
                }
              })
              .catch(error => console.error('Error:', error))
          }, 1000)
        
      }else{
        fetch("storyScreen.html")
        .then(response => response.text())
        .then(data => {
          document.body.innerHTML = data
          const script = document.createElement("script")
          script.src = "storyScript.js"
          document.body.appendChild(script)
        })
        .catch(error => console.error("Error:", error))
      }
    }else{
      document.getElementById('warning').classList.remove('hidden');
    }
}

    async function checkUser(username,password){
    try{
      const response = await fetch(`https://sqlgameserver.onrender.com/getUser?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json(); // Capture the response body
      throw new Error(`Error ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    const data = await response.json();
    return data;
  }catch(error){
    console.error("Error submitting data:", error);
    alert("There was a problem submitting your data. Please try again.");
    }
  }
}
