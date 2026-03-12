// Battery Sync

navigator.getBattery().then(function(battery){

function updateBattery(){

let level = Math.floor(battery.level * 100)

document.getElementById("battery-fill").style.width = level + "%"
document.getElementById("battery-text").innerText = level + "%"

if(level < 20){
document.body.classList.add("low-energy")
}

}

updateBattery()
battery.addEventListener("levelchange", updateBattery)

})


// Radar Chart

const canvas = document.getElementById("radarChart")
const ctx = canvas.getContext("2d")

canvas.width = 160
canvas.height = 160

const stats=[80,85,70,60,75,90,88]

function drawRadar(){

const cx=80
const cy=80
const r=60

ctx.strokeStyle="rgba(255,255,255,0.2)"

for(let i=0;i<7;i++){

let angle=(Math.PI*2/7)*i

ctx.beginPath()
ctx.moveTo(cx,cy)
ctx.lineTo(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r)
ctx.stroke()

}

ctx.beginPath()

stats.forEach((v,i)=>{

let angle=(Math.PI*2/7)*i
let x=cx+Math.cos(angle)*(v/100*r)
let y=cy+Math.sin(angle)*(v/100*r)

if(i==0) ctx.moveTo(x,y)
else ctx.lineTo(x,y)

})

ctx.closePath()

ctx.fillStyle="rgba(0,255,255,0.3)"
ctx.fill()

}

drawRadar()
