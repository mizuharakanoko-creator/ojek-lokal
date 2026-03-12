// BATTERY ENGINE

navigator.getBattery().then(battery=>{

function update(){

let level=Math.floor(battery.level*100)

document.getElementById("battery").style.width=level+"%"

document.getElementById("batteryText").innerText=level+"%"

if(level<20){

document.body.style.animation="glitch .2s infinite"

}

}

update()

battery.addEventListener("levelchange",update)

})


// RADAR

const radar=document.getElementById("radar")
const ctx=radar.getContext("2d")

radar.width=160
radar.height=160

const stats=[80,85,70,60,75,90,88]

function drawRadar(){

let cx=80
let cy=80
let r=60

ctx.clearRect(0,0,160,160)

ctx.strokeStyle="rgba(0,255,255,.3)"

for(let i=0;i<7;i++){

let a=(Math.PI*2/7)*i

ctx.beginPath()

ctx.moveTo(cx,cy)

ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)

ctx.stroke()

}

ctx.beginPath()

stats.forEach((v,i)=>{

let a=(Math.PI*2/7)*i

let x=cx+Math.cos(a)*(v/100*r)

let y=cy+Math.sin(a)*(v/100*r)

if(i==0)ctx.moveTo(x,y)
else ctx.lineTo(x,y)

})

ctx.closePath()

ctx.fillStyle="rgba(0,255,255,.3)"

ctx.fill()

requestAnimationFrame(drawRadar)

}

drawRadar()


// FLOATING TEXT

function completeMission(){

const f=document.getElementById("floating")

f.innerText="+500 EXP"

f.style.opacity=1

f.style.transform="translate(-50%,-150%)"

setTimeout(()=>{

f.style.opacity=0
f.style.transform="translate(-50%,0)"

},1500)

}


// RUNIC BACKGROUND

const runes=document.getElementById("runes")

const rctx=runes.getContext("2d")

runes.width=window.innerWidth
runes.height=window.innerHeight

let chars="ᚠᚢᚦᚨᚱᚲ0123456789"

let drops=[]

for(let i=0;i<200;i++) drops[i]=1

function runeRain(){

rctx.fillStyle="rgba(5,2,10,.2)"
rctx.fillRect(0,0,runes.width,runes.height)

rctx.fillStyle="#0ff"

rctx.font="14px monospace"

for(let i=0;i<drops.length;i++){

let text=chars[Math.floor(Math.random()*chars.length)]

rctx.fillText(text,i*14,drops[i]*14)

if(drops[i]*14>runes.height&&Math.random()>0.975)

drops[i]=0

drops[i]++

}

}

setInterval(runeRain,35)


// RAIN PARTICLES

const rain=document.getElementById("rain")
const rainCtx=rain.getContext("2d")

rain.width=window.innerWidth
rain.height=window.innerHeight

let dropsRain=[]

for(let i=0;i<200;i++){

dropsRain.push({

x:Math.random()*rain.width,
y:Math.random()*rain.height,
l:Math.random()*1,
speed:Math.random()*4

})

}

function drawRain(){

rainCtx.clearRect(0,0,rain.width,rain.height)

rainCtx.strokeStyle="rgba(180,220,255,.4)"

rainCtx.lineWidth=1

for(let i=0;i<dropsRain.length;i++){

let d=dropsRain[i]

rainCtx.beginPath()

rainCtx.moveTo(d.x,d.y)

rainCtx.lineTo(d.x,d.y+d.l*10)

rainCtx.stroke()

d.y+=d.speed

if(d.y>rain.height){

d.y=-20

}

}

requestAnimationFrame(drawRain)

}

drawRain()
