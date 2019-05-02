const { app, BrowserWindow, Menu, Tray } = require('electron'),
        { autoUpdater } = require('electron-updater'),
        path = require('path');
// require('electron-reload')(__dirname);

global.tray = null;
global.tray_context_menu = null;
global.__dirname = __dirname;
global.dirname = path.dirname(__dirname);

let win = null;

// --------------------------------------------------------------------------------------------------------------------------------------
// WINDOW INIT FUNCTION -----------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

function init() {
    win = new BrowserWindow({
        minWidth: 600,
        width: 800,
        minHeight: 800,
        height: 800,
        frame: false,
        icon: path.join(__dirname, 'public/favicon.ico')
    });

    win.setTitle('MarlX-Client');
    win.loadFile(path.join(__dirname, 'public/index.html'));

    // win.webContents.openDevTools();

    global.tray = new Tray(path.join(__dirname, 'public/favicon.ico'));
    global.tray_context_menu = Menu.buildFromTemplate([
        { label: 'Quit', type: 'normal', role: 'quit' },
    ]);

    global.tray.setToolTip('MarlX-Client');
    global.tray.setContextMenu(global.tray_context_menu);

    global.tray.on('click', () => {
        win.center();

        if (win.isVisible())
            win.hide();
        else
            win.show();
    });

    win.on('closed', () => {
        tray.destroy();
        win = null;
    });

    // win.on('blur', () => {
    //     win.hide();
    // });
}

// --------------------------------------------------------------------------------------------------------------------------------------
// APP EVENTS ---------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

var secInst = app.makeSingleInstance((cmdl, wd) => {
    if (win) {
        if (win.isMinimized()) 
            win.restore();
        win.focus();
    }
});

if (secInst) {
    app.quit();
    return;
}

app.on('ready', init);

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null)
        init();
});

// --------------------------------------------------------------------------------------------------------------------------------------
// AUTO-UPDATER FUNCTIONS ---------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

function messageRenderer(chang, ...msg) {
    if (win)
        win.webContents.send(chan, ...msg);
}

autoUpdater.on('checking-for-update', () => {
    messageRenderer('auto-updater', 'checking-for-updates');
});

autoUpdater.on('update-available', () => {
    messageRenderer('update-available', 'auto-updater');
});

autoUpdater.on('update-not-available', () => {
    messageRenderer('update-not-available', 'auto-updater');
});

autoUpdater.on('error', () => {
    messageRenderer('error', 'auto-updater');
});

autoUpdater.on('download-progress', prog => {
    
});

autoUpdater.on('update-downloaded', () => {
    messageRenderer('update-downloaded', 'auto-updater');
});