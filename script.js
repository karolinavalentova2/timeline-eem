"use strict";

function doStart(){
    loadSVG();
}

async function loadSVG() {
    try {
        const SVG = {
            logo: await (await fetch("./logo.svg")).text(),
        };

        document.getElementById('logo-container').innerHTML = SVG.logo;

    } catch(error) {
        console.error('Cannot read svg file, reason: ' + error.message);
    }
}

document.body.onload = doStart;