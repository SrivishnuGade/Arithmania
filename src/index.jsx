// src/index.js
import './scenes/mainScene.js';
import '../styles.css';

import html2canvas from 'html2canvas';

window.initMap = function() {
    // Initialize the Google Map with a traffic layer
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 20,
        center: { lat: 12.9254, lng: 77.55005 },
    });

    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    // Use an event listener to capture and analyze the map once it has loaded
    google.maps.event.addListenerOnce(trafficLayer, 'tilesloaded', () => {
        console.log("Traffic layer tiles loaded.");
        captureAndAnalyzeMap();
    });
}

function captureAndAnalyzeMap() {
    const mapElement = document.getElementById("map");

    html2canvas(mapElement).then((canvas) => {
        console.log("Canvas captured.");
        analyzeTrafficColors(canvas);
    }).catch((error) => {
        console.error("Error capturing canvas:", error);
    });
}

function analyzeTrafficColors(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let redPixels = 0;
    let orangePixels = 0;
    let greenPixels = 0;

    // Analyze each pixel in the image
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (isRed(r, g, b)) {
            redPixels++;
        } else if (isOrange(r, g, b)) {
            orangePixels++;
        } else if (isGreen(r, g, b)) {
            greenPixels++;
        }
    }

    // Output the results to the console
    console.log("Red pixels:", redPixels);
    console.log("Orange pixels:", orangePixels);
    console.log("Green pixels:", greenPixels);
}

function isRed(r, g, b) {
    return r > 200 && g < 100 && b < 100; // Adjust thresholds as necessary
}

function isOrange(r, g, b) {
    return r > 200 && g > 100 && g < 200 && b < 100; // Adjust thresholds as necessary
}

function isGreen(r, g, b) {
    return g > 150 && r < 100 && b < 100; // Adjust thresholds as necessary
}
