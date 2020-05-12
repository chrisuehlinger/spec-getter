const os = require("os");
const $ = require('jquery');
const si = require('systeminformation');

window.stats = {};
$('#message').text('Collecting info...');

function selectText(node) {
    node = document.getElementById(node);

    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

(async () => {
    try {
        let { stats } = window;
        let cpus = os.cpus();
        stats.cpus = cpus;
        stats.ram = os.totalmem();
        stats.os = {
            arch: os.arch(),
            type: os.type(),
            platform: os.platform(),
            release: os.release()
        };
        // $('#cpu').text(`CPU: ${cpus[0].model} (${cpus.length + (cpus.length === 1 ? ' core' : ' cores')})`);
        // $('#ram').text(`RAM: ${Math.round(10*((os.totalmem())/1073741824))/10}GB`);
        // $('#arch').text(`Arch: ${os.arch()}`);
        // $('#os').text(`OS: ${os.type()}`);
        // $('#platform').text(`Platform: ${os.platform()}`);
        // $('#release').text(`Release: ${os.release()}`);
    
        await Promise.all([
            showGpus(),
            showInputs(),
            new Promise(resolve => {
                checkDisplays();
                function checkDisplays(){
                    console.log('Checking for displays...')
                    if(window.stats.displays){
                        resolve()
                    } else {
                        requestAnimationFrame(checkDisplays);
                    }
                }
            })
        ]);
        let $button = $('<button>Click here to copy</button>');
        $button.on('click', () => {
            selectText('output');
            document.execCommand('copy');
        })
        $('#message').text('Done! Copy this and send it to Chris:');
        $('#output').text(JSON.stringify(window.stats, null, 4));
        $('#message').append($button);
    } catch(e) {
        $('#message').text(`UHOH: ${error}`);
    }

})();

async function showGpus(){
    let { stats } = window;
    let graphics = await si.graphics()
    stats.graphics = graphics;
    // let $gpuList = $('#gpuList');
    // graphics.controllers.map(gpu => {
    //     console.log(gpu);
    //     $gpuList.append(`<li>Vendor: "${gpu.vendor}" Model: "${gpu.model}" VRAM: ${gpu.vram}MB</li>`);
    // })
}

async function showInputs() {
    let { stats } = window;
    let mediaDevices = await navigator.mediaDevices.enumerateDevices();
    stats.mediaDevices = [];

    // let $inputList = $('#inputList');
    await Promise.all(mediaDevices.map(async device => {
        if(device.kind === 'videoinput'){
            console.log(device);

            let stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    deviceId: { exact: device.deviceId },
                    width: { ideal: 4096 },
                    height: { ideal: 2160 } 
                } 
            });
            console.log(stream);
            let track = stream.getVideoTracks()[0]
            console.log(track);
            let settings = track.getSettings()
            console.log(settings);
            stats.mediaDevices.push({
                device,
                settings
            });
            // $inputList.append(`<li>Name: ${device.label} Resolution: ${settings.width}x${settings.height} framerate: ${settings.frameRate} aspectRatio: </li>`);
        } else {
            stats.mediaDevices.push({
                device
            });
        }
    }));
}

window.showDisplays = function (displays){
    console.log('GOTEM', displays);
    window.stats.displays = displays;
    // let $displayList = $('#displayList');
    // displays.map(display => {
    //     $displayList.append(`<li>Size: ${display.size.width}x${display.size.height} dppx: ${display.scaleFactor}</li>`);
    // })
}