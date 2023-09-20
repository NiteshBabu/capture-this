const player = document.querySelector("#player")
const startBtn = document.querySelector("#startBtn")
const stopBtn = document.querySelector("#stopBtn")
const srcBtn = document.querySelector("#srcBtn")

console.log("Hit from Browser")

export const linkFunction = (f,selector) =>{
    let el = document.querySelector(selector)
    if (el) el.onclick = f
}