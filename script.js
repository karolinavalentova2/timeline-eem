"use strict";
let previouslySelectedID = 0;
let isMusicPlaying = false;
const MusicPlayer = new Audio("./assets/intro.mp3");
let MusicPlayerPercentageUpdater;
let DBEntries = [];
function doStart(){
    getData();
    loadSVG();
    doRegisterHorizontalScroll();
    doHandleCircleVisibility();
}

const dataLink = "https://timeline-5237.restdb.io/rest/timeline-data";

function getData() {
    fetch(dataLink, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=uf-8",
            "x-apikey": "5dcad81864e7774913b6ebd3",
            "cache-control": "no-cache"
        }
    }).then(result => result.json()).then(res => {
        console.table('Response =>', res);
        if(Array.isArray(res)) {
            DBEntries = [...res];
            doGenerateTimelineBubbles(res);
        }
    });
}

async function loadSVG() {
    try {
        const SVG = {
            logo: await (await fetch("./assets/logo.svg")).text(),
            playButton: await (await fetch("./assets/play-button.svg")).text(),
            progressDonut: await (await fetch("./assets/progress-donut.svg")).text(),
        };

        document.getElementById('logo-container').innerHTML = SVG.logo;
        document.getElementById('play-button-SVG').innerHTML = SVG.playButton;
        startMusic();
        document.getElementById('progressDonut').innerHTML = SVG.progressDonut;

    } catch(error) {
        console.error('Cannot read svg file, reason: ' + error.message);
    }
}

function startMusic() {
    const playButton = document.getElementById("playBtn");

    playButton.onclick = async () => {
        if(isMusicPlaying) {
            MusicPlayer.pause();
            MusicPlayer.currentTime = 0;
            isMusicPlaying = false;
            document.getElementById("playMusic").style.display = "block";
            document.getElementById("stopMusic").style.display = "none";

            clearInterval(MusicPlayerPercentageUpdater);
            document.getElementById('donutText').textContent = '0%';
            doResetPlayDonut();
        } else {
            await MusicPlayer.play();
            isMusicPlaying = true;
            document.getElementById("playMusic").style.display = "none";
            document.getElementById("stopMusic").style.display = "block";

            MusicPlayerPercentageUpdater = setInterval(() => {
                const currentPlayedPercent = calculatePercentage(MusicPlayer.currentTime, MusicPlayer.duration);
                document.getElementById('donutText').textContent = currentPlayedPercent + '%';

                doStartPlayDonut(currentPlayedPercent);
            }, 500);
        }
    }
}

function doStartPlayDonut(currentPlayedPercent) {
    document.getElementById('donutFill').setAttribute('stroke-dasharray', `${ currentPlayedPercent } ${ 100 - parseInt(currentPlayedPercent) }`)
}

function doResetPlayDonut() {
    document.getElementById('donutFill').setAttribute('stroke-dasharray', `0 100`)
}

function calculatePercentage(currentSeconds, totalSeconds) {
    return String(Math.round((currentSeconds / totalSeconds) * 100));
}


///////////////////////////////////////////////////

function doRegisterHorizontalScroll() {
    const timelineContent = document.getElementById('timeline-content');

    timelineContent.addEventListener('wheel', function(e) {
        if (e.deltaY > 0) timelineContent.scrollLeft += 60;
        else timelineContent.scrollLeft -= 60;


        // ------------------------------ Source: https://codepen.io/vsync/pen/rwygwq
        getElementsInArea(e, {
            elements    : document.querySelectorAll('.circle'),
            markedClass : 'active-circle',
            zone        : [25, 25] // percentage distance from top & bottom
        });

        getElementsInArea(e, {
            elements    : document.querySelectorAll('.circle'),
            markedClass : 'active-circle',
            zone        : [40, 40] // percentage distance from top & bottom
        });

        // getElementsInArea(e, {
        //     elements    : document.querySelectorAll('.circle'),
        //     markedClass : 'active-circle',
        //     zone        : [40, 40] // percentage distance from top & bottom
        // });
    });
}

function doHandleCircleVisibility() {
    let options = {
        root: document.body,
        rootMargin: '40px',
        threshold: 1
    };

    let i = 0;

    const circles = document.getElementsByClassName('circle');

    let observer = new IntersectionObserver((e) => {
        if(Array.isArray(e) && e.length === 2) {
            doHighlightTimelineElements(e);
        }
    }, options);

    Array.from(circles).forEach((circle) => {
        observer.observe(circle);
        circle.id = i;
        i = ++i;
    })
}

function doHighlightTimelineElements(elements) {
    const lastVisibleLeftCircle = elements[0].target.id;
    const lastVisibleRightCircle = elements[1].target.id;

    document.getElementById(previouslySelectedID).classList.remove('active-circle');

    console.log('Left: ' + lastVisibleLeftCircle + ' / Right: ' + lastVisibleRightCircle);
    console.log('Left visible: ' + elements[0].isVisible + ' / Right visible: ' + elements[1].isVisible);

    const middleCircleID = lastVisibleRightCircle - 12;

    const selectedCircleStyle = document.getElementById(String(middleCircleID));
    selectedCircleStyle.classList.add('active-circle');

    const nextCircles = {
        left: document.getElementById(String(middleCircleID - 1)),
        right: document.getElementById(String(middleCircleID + 1)),
    };

    nextCircles.left.classList.remove('active-circle');
    nextCircles.right.classList.remove('active-circle');
    previouslySelectedID = middleCircleID
    console.log(middleCircleID)
}

function doGenerateTimelineBubbles(data) {
    const circleContainer = document.getElementById('timelineCircleContainer');

    function doReturnEndElement() {
        const timelineEndElement = document.createElement('div');
        timelineEndElement.classList.add('end-timeline');
        return timelineEndElement;
    }

    circleContainer.appendChild(doReturnEndElement());

    data.forEach((entry, index) => {
        const newCircle = document.createElement('div');

        newCircle.classList.add('circle');
        newCircle.id = index;

        //Anything that needs to be added on the circles goes here

        newCircle.onclick = () => {
            // TODO: Add handling for bubble clicks
            console.log('You clicked on element with id ', newCircle.id);
        };

        circleContainer.appendChild(newCircle);
    });

    circleContainer.appendChild(doReturnEndElement());
}

// ------------------------------ Source: https://codepen.io/vsync/pen/rwygwq
const getElementsInArea = (function(docElm){
    let viewPortWidth = docElm.clientWidth;

    return function(e, opts){
        let found = [], i;

        if( e && e.type === 'resize' )
            viewPortWidth = docElm.clientWidth;

        for( i = opts.elements.length; i--; ){
            let elm        = opts.elements[i],
                pos        = elm.getBoundingClientRect(),
                leftPerc    = pos.left / viewPortWidth * 100,
                rightPerc = pos.right / viewPortWidth * 100,
                middle     = (leftPerc + rightPerc) / 2,
                inViewport = middle > opts.zone[1] && middle < (100-opts.zone[1]);

            elm.classList.toggle(opts.markedClass, inViewport);

            if( inViewport ) {
                console.log(elm)
                found.push(elm);
            }
        }

        doSetClassesOnCenterBubbles(found);
    };
})(document.documentElement);

function doSetClassesOnCenterBubbles(elements) {
    console.log(elements)

    // // First bubble
    // console.table(DBEntries[elements[0].id]);
    // // Main bubble
    // console.table(DBEntries[elements[elements.length - 2].id]);
    // // Last bubble
    // console.table(DBEntries[elements[elements.length - 1].id]);
}
document.body.onload = doStart;