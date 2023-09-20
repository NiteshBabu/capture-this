const { ipcRenderer, contextBridge, dialog } = require("electron")
const fs = require("fs")
const os = require("os")
const path = require("path")



window.onload = () => {
    const player = document.querySelector("#player")
    const startBtn = document.querySelector("#startBtn")
    const stopBtn = document.querySelector("#stopBtn")
    const srcBtn = document.querySelector("#srcBtn")
    const pulseIcon = document.querySelector("#recording")
    console.log("Hit from Browser")

    const toastr = {

        success: (content) => {
            list = []
            el = document.createElement("span")
            el.id = "toastr"
            el.dataset["toastrType"] = "success"
            list.push(el)
            el.textContent = content
            document.body.prepend(el)

            list.forEach(item => {
                setTimeout(() => {
                    item.style.opacity = 1
                }, 10)

                setTimeout(() => item.remove(), 3000)
            })
        },
        danger: (content) => {
            list = []
            el = document.createElement("span")
            el.id = "toastr"
            el.dataset["toastrType"] = "danger"
            list.push(el)
            el.textContent = content
            document.body.prepend(el)

            list.forEach(item => {
                setTimeout(() => {
                    item.style.opacity = 1
                }, 10)

                setTimeout(() => item.remove(), 3000)
            })
        }
    }

    // const linkFunction = (f, selector) => {
    //     let el = document.querySelector(selector)
    //     console.log(el)
    //     if (el) el.onclick = f
    // }

    // async function getFeed() {
    //     const inputSources = await ipcRenderer.invoke("DESKTOP_GET_SOURCES", { types: ["window", "screen"] })

    //     const menuTemplate = inputSources.map(src => {
    //         return {
    //             label: src.name,
    //             click: () => selectSource(src)
    //         }
    //     })
    //     const optionsMenu = await ipcRenderer.invoke('MENU_BUILD', JSON.stringify(menuTemplate))
    //     const o = JSON.parse(optionsMenu)
    //     console.log(o)
    //     o.popup()
    // }
    // linkFunction(getFeed, "#startBtn")

    srcBtn.onclick = () => ipcRenderer.send("menu:open")

    let mediaRecorder, recordedChunks = [];

    async function selectSource(source) {
        srcBtn.innerText = source.name
        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: source.id
                }
            }
        }


        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        player.srcObject = stream
        player.play()


        // Create Media Recorder
        const options = { mimeType: 'video/webm; codecs=vp9' }
        mediaRecorder = new MediaRecorder(stream, options)

        const handleData = (e) => {
            recordedChunks.push(e.data)
        }
        const handleStop = async (e) => {

            const blob = new Blob(recordedChunks, {
                type: options.mimeType
            })

            const buffer = Buffer.from(await blob.arrayBuffer())

            const filePath = ipcRenderer.send("show-dialog", {
                buttonLabel: "Save",
                defaultPath: `capture-${Date.now()}.webm`
            })

            console.log()

            const pathToDir = path.join(os.homedir(), "desktop/capturethis")
            !fs.existsSync(pathToDir) ?? fs.mkdirSync(pathToDir)

            fs.writeFileSync(`${pathToDir}/${Date.now()}.webm`, buffer)
        }

        mediaRecorder.ondataavailable = handleData
        mediaRecorder.onstop = handleStop

        stopBtn.onclick = () => {
            console.log(mediaRecorder.status)
            toastr.danger("Stopped recording ...........")
            mediaRecorder.stop()
            startBtn.classList.remove("on")
            pulseIcon.style.display = "none"
            startBtn.textContent = "Start"
            startBtn.disabled = false
        }

        startBtn.onclick = () => {
            console.log(mediaRecorder.state)

            // mediaRecorder.state !== "recording" && function () {}
            toastr.success("Started recording ...........")
            mediaRecorder.start()
            startBtn.disabled = true    
            pulseIcon.style.display = "block"
            startBtn.classList.add("on")
            startBtn.textContent = "Recording"
        }
    }

    ipcRenderer.addListener("select-source", (e, options) => selectSource(options))
}