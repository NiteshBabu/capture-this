const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, dialog } = require("electron")
const path = require("path")
let win;
const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration : true,
            // contextIsolation: false,
            preload: path.join(__dirname, "pre.js")
        }
    })
    // window.loadURL("https://niteshbabu.netlify.com")
    win.loadFile("src/index.html")
    win.webContents.openDevTools()
}

app.whenReady().then(async () => {
    createWindow()
    ipcMain.handle("ping", () => "pong")
    ipcMain.handle("DESKTOP_GET_SOURCES", (e, opts) => desktopCapturer.getSources(opts))
    ipcMain.handle("MENU_BUILD", (e, opts) => JSON.stringify(Menu.buildFromTemplate(JSON.parse(opts))))


    // setting up the menu for screen sources
    let inputSourcesTemplate = await desktopCapturer.getSources({ types: ["window", "screen"] })
    inputSourcesTemplate = inputSourcesTemplate.map(src => ({
        label: src.name,
        click: () => win.webContents.send("select-source", src)
    }))
    // setTimeout(() =>{
    //     win.webContents.send("select-source", JSON.stringify(inputSourcesTemplate[3]))
    // }, 2000)
    const menuOptions = Menu.buildFromTemplate(inputSourcesTemplate)

    // Listening to ipcRenderer to open source menu
    ipcMain.on("menu:open", () => menuOptions.popup())
    // ipcMain.on("show-dialog", async (e, options) => await dialog.showSaveDialog(options))


    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length == 0) createWindow()
    })

})


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

