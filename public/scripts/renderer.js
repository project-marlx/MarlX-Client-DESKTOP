const remote = require('electron').remote,
    path = require('path'),
    CCONF = require(path.join(remote.getGlobal('dirname'), 'includes/client.json')),
    os = require('os'),
    getSize = require('get-folder-size'),
    fse = require('fs-extra'),
    fs = require('fs'),
    execFile = require('child_process').execFile;

var client;

function dispClient() {
    document.getElementById('client-hostname').innerHTML = os.hostname();
    getSize(CCONF.store_dir, (err, size) => {
        if (err)
            return;
        document.getElementById('client-store-dir-size').innerHTML = parseSize(size);
    });

    if (CCONF.store_dir.length >= 24) {
        document.getElementById('client-store-dir').innerHTML = CCONF.store_dir.substr(0, 21) + "...";
    } else {
        document.getElementById('client-store-dir').innerHTML = CCONF.store_dir;
    }
    document.getElementById('client-store-dir').title = CCONF.store_dir;
    document.getElementById('client-mtu').innerHTML = parseSize(CCONF.MTU);
    document.getElementById('client-token').value = CCONF.token;
}

function parseSize(s, type = 'short') {
    let sizes = {
        short: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        long: ['Byte', 'Kilo Byte', 'Mega Byte', 'Giga Byte', 'Tera Byte', 'Peta Byte', 'Exa Byte', 'Zetta Byte', 'Yotta Byte'],
    };

    if (!Object.keys(sizes).includes(type))
        type = 'short';

    if (typeof s !== "number")
        s = +s

    let i = 0;
    while (s >= 1000 && i < sizes[type].length) {
        s /= 1000;
        i++;
    }

    return Math.round(s * 100) / 100 + ' ' + sizes[type][i];
}

function updateClientConf() {
    fs.writeFile(path.join(remote.getGlobal('dirname'), 'includes/client.json'), JSON.stringify(CCONF), err => {
        if (err)
            return console.error(err);
        dispClient();
    });
}

(function init() {
    document.getElementById('minimize-control').onclick = () => {
        remote.getCurrentWindow().hide();
    };

    document.getElementById('max-control').onclick = () => {
        let win = remote.getCurrentWindow(),
            trgt = document.getElementById('max-control');

        if (win.isMaximized()) {
            win.restore();
            trgt.title = 'Maximize ... ';
        } else {
            win.maximize();
            trgt.title = 'Restore ... ';
        }
    };

    document.getElementById('close-control').onclick = () => {
        remote.getCurrentWindow().close();
    };

    remote.getCurrentWindow().on('maximize', () => {
        let trgt = document.getElementById('max-control');

        trgt.classList.toggle('fa-window-maximize');
        trgt.classList.toggle('fa-window-restore');
    });
    remote.getCurrentWindow().on('unmaximize', () => {
        let trgt = document.getElementById('max-control');

        trgt.classList.toggle('fa-window-maximize');
        trgt.classList.toggle('fa-window-restore');
    });

    document.getElementById('change-store-dir').onclick = () => {
        let npath = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            properties: ['openDirectory']
        });

        if (npath === undefined)
            return;
        npath = npath[0];

        fs.readdir(npath, (err, files) => {
            let cu_exsts = fs.existsSync(CCONF.store_dir);

            if (err) {
                return console.error(err);
            }
            if (files.length > 0 && cu_exsts) {
                if (!confirm('Directory is not empty. Do you want to proceed?'))
                    return;
            }

            if (!cu_exsts) {
                CCONF.store_dir = npath;
                updateClientConf();
            } else {
                fse.move(CCONF.store_dir, npath, {
                    overwrite: true,
                }, err => {
                    if (err)
                        return console.error(err);
    
                    CCONF.store_dir = npath;
                    updateClientConf();
                });
            }
        });
    };

    document.getElementById('client-mtu').onclick = e => {
        e.target.innerHTML = '';
        let inp = document.createElement('input');

        inp.type = 'number';
        inp.min = 1000;
        inp.value = CCONF.MTU;

        inp.onchange = () => {
            CCONF.MTU = +inp.value;
            updateClientConf();
        };
        inp.onblur = () => {
            CCONF.MTU = +inp.value;
            updateClientConf();
        };

        e.target.appendChild(inp);
    };

    document.getElementById('client-token').onchange = () => {
        CCONF.token = document.getElementById('client-token').value;
        updateClientConf();
    };
    document.getElementById('client-token').onblur = document.getElementById('client-token').onchange;

    document.getElementById('client-power').onclick = () => {
        if (CCONF.token === '' || CCONF.token.length < 64 ||
            +CCONF.MTU < 1000 || isNaN(+CCONF.MTU) ||
            CCONF.store_dir === '' || !fs.existsSync(CCONF.store_dir)
        ) {
            return;
        }

        if (!client || client.killed) {
            document.getElementById('client-output').innerHTML = '';

            client = execFile(path.join(remote.getGlobal('dirname'), 'includes/marlx-c.exe'));
            // client.on('exit', console.log);
            client.stdout.on('data', d => {
                document.getElementById('client-output').innerHTML += d;
                document.getElementById('client-output').scrollTo(0, document.getElementById('client-output').scrollHeight);
            });
            document.getElementById('client-power').style.backgroundImage = 'linear-gradient(#55FFA6, #55FFFB)';
        } else {
            document.getElementById('client-output').innerHTML += '\n[MarlX-Client]: Exiting ... ';
            client.kill();
            document.getElementById('client-power').style.backgroundImage = 'linear-gradient(#111, #555)';
        }
    };

    window.onkeyup = e => {
        if (e.keyCode === 27)
            remote.getCurrentWindow().hide();
    };

    dispClient();
    setInterval(() => {
        dispClient();
    }, 15000);
})();