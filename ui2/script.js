// BATTERY ENGINE

navigator.getBattery().then(function(battery){

function update(){

let level=Math.floor(battery.level*100)

document.getElementById("battery").style.width=level+"%"

document.getElementById("batteryText").innerText=level+"%"

if(level<20){

document.body.classList.add("low-energy")

}

}

update()

battery.addEventListener("levelchange",update)

})


// RADAR CHART

const canvas=document.getElementById("radar")

const ctx=canvas.getContext("2d")

canvas.width=160
canvas.height=160

const stats=[80,85,75,65,70,90,88]

function draw(){

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

ctx.fillStyle="rgba(0,255,255,.25)"

ctx.fill()

requestAnimationFrame(draw)

}

draw()


// RUNIC BACKGROUND

const runes=document.getElementById("runes")

const rctx=runes.getContext("2d")

runes.width=window.innerWidth
runes.height=window.innerHeight

let chars="ᚠᚢᚦᚨᚱᚲ0123456789"

let drops=[]

for(let i=0;i<200;i++) drops[i]=1

function rain(){

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

setInterval(rain,35)
