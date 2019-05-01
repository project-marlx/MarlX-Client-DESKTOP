const { app, BrowserWindow, Menu, Tray } = require('electron'),
        path = require('path');
// require('electron-reload')(__dirname);

global.tray = null;
global.tray_context_menu = null;
global.__dirname = __dirname;
global.dirname = path.dirname(__dirname);

let win;

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

    win.webContents.openDevTools();

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