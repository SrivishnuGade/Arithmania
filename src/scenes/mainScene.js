// src/scenes/mainScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initFog } from '../environment/fog.js';
import { initLighting } from '../environment/lighting.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { loadModel } from '../loaders/gltfloader.js';
import { loadRoad } from '../loaders/objloader.js';
import { createJoystick, resetJoystick, removeJoystickControl, setupJoystick } from '../controls/joystickcontrols.js';

const scene = new THREE.Scene();
initFog(scene);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(15, 25, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

initLighting(scene);
initGround(scene);
initSky(scene);
const cloudTexture = new THREE.TextureLoader().load('/assets/images/clouds.jpg'); // Load cloud texture
const cloudMaterial = new THREE.SpriteMaterial({ map: cloudTexture, transparent: false, opacity: 0.7 });
const clouds = [];

for (let i = 0; i < 30; i++) {
    const cloud = new THREE.Sprite(cloudMaterial);
    cloud.scale.set(50, 25, 1); // Smaller size for clouds
    cloud.position.set(Math.random() * 1000 - 500, Math.random() * 1 + 150, Math.random() * 1000 - 500); // Positioned near the ceiling
    clouds.push(cloud);
    scene.add(cloud);
}
    
// Define joystick element and active car
//let joystickElement = null;
let activeCar = null; 

// Function called when a car model is loaded
function onCarLoaded(carModel) {
    console.log(`${carModel.name} loaded`);
    carModel.name = 'selectedCar';

    // If there's an active car, remove joystick control from it
    if (activeCar) {
        removeJoystickControl(activeCar);
        resetJoystick(); // Hide the joystick if switching cars
    }

    // Show the joystick and set up control for the new car model
    joystickElement.style.display = 'block'; // Show the joystick
    setupJoystick(scene, camera, carModel);
    activeCar = carModel;  // Update the active car
}


// Call this function once during the initialization phase
createJoystick();

// Load models with the new onCarLoaded callback
for (let i = 0; i < 5; i++) {
    loadModel(scene,'Mustang', '/assets/shelby/scene.gltf', 450, 0, 0, i, function() {
        console.log('Shelby loaded');
    });
}

for (let i = 0; i < 7; i++) {
    loadModel(scene,'Porsche', '/assets/porsche/scene.gltf', 5, 0.55, 15, i, function() {
        console.log('Porsche loaded');
    });
}
for (let i = 0; i < 10; i++) {
    loadModel(scene,'Boxster', '/assets/boxster/scene.gltf', 1.35, 3.9, 30, i, function() {
        console.log('Boxster loaded');
    });
}
 
for (let i = 2; i < 3; i++) {
    loadModel(scene,'Civic', '/assets/civic/scene.gltf', 500, 0, 75, i, function() {
        console.log('Civic loaded');
    });
}
for (let i = 0; i < 10; i++) {
    loadModel(scene,'Focus', '/assets/focus/scene.gltf', 500, 0, 60, i, function() {
        console.log('Focus loaded');
    });
}

loadRoad(scene);
setupJoystick(scene, camera);

const redMaterialOn = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const redMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });
const yellowMaterialOn = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const yellowMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });
const greenMaterialOn = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const greenMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });

const trafficLights = [];

function createTrafficLight(x, y, z) {
    const group = new THREE.Group();
    const lightGeometry = new THREE.SphereGeometry(1, 32, 32);
    const redLight = new THREE.Mesh(lightGeometry, redMaterialOn);
    redLight.position.set(-2.3, 0, 0);
    group.add(redLight);

    const redShadeGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32, 1, true); // Hollow cylinder with open ends
    const shadeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide }); // Double-sided for inner visibility
    const redShade = new THREE.Mesh(redShadeGeometry, shadeMaterial);
    redShade.position.set(-2.3, 0, 0.5);
    redShade.rotation.z = Math.PI / 2;
    redShade.rotation.y=Math.PI/2 
    group.add(redShade);

    const yellowLight = new THREE.Mesh(lightGeometry, yellowMaterialOff);
    yellowLight.position.set(0, 0, 0);
    group.add(yellowLight);
    const yellowShade = new THREE.Mesh(redShadeGeometry.clone(), shadeMaterial);
    yellowShade.position.set(0, 0, 0.5);
    yellowShade.rotation.z = Math.PI / 2;
    yellowShade.rotation.y = Math.PI / 2;
    group.add(yellowShade);

    const greenLight = new THREE.Mesh(lightGeometry, greenMaterialOff);
    greenLight.position.set(2.3, 0, 0);
    group.add(greenLight);
    const greenShade = new THREE.Mesh(redShadeGeometry.clone(), shadeMaterial);
    greenShade.position.set(2.3, 0, 0.5);
    greenShade.rotation.z = Math.PI / 2;
    greenShade.rotation.y = Math.PI / 2;
    group.add(greenShade);

    const housingGeometry = new THREE.BoxGeometry(7, 3, 1); 
    const housingMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.position.set(0, 0, -0.2); 
    group.add(housing);
    group.position.set(x, y, z);
    if (z ==-70) {
        group.rotation.y = 0;
    }
    else if (z == 70) {
        group.rotation.y = Math.PI;
    }
    else if (x == -70) {
        group.rotation.y = Math.PI / 2;
    }
    else if (x == 70) {
        group.rotation.y = -Math.PI / 2;
    }
    scene.add(group);
    trafficLights.push({ group, redLight, yellowLight, greenLight, state: 0 }); 
}

for (let i = 0; i < 61; i += 15) {
    createTrafficLight(-i, 31.2, +70); 
}

for (let i = 0; i < 61; i += 15) {
    createTrafficLight(70, 31.2, i); 
}

for (let i = 0; i < 61; i += 15) {
    createTrafficLight(-70, 31.2, -i); 
}

for (let i = 0; i < 61; i+=15) {
    createTrafficLight(i , 31.2, -70); 
}

function setTrafficLightsColors(lists, color) {
    lists.forEach((indices, i) => {
        const colorToApply = Array.isArray(color) ? color[i] : color;  // Color can be an array or single value
        indices.forEach(index => {
            const trafficLight = trafficLights[index];
            if (!trafficLight) return;

            trafficLight.redLight.material = redMaterialOff;
            trafficLight.yellowLight.material = yellowMaterialOff;
            trafficLight.greenLight.material = greenMaterialOff;

            switch (colorToApply) {
                case 'red': trafficLight.redLight.material = redMaterialOn; break;
                case 'yellow': trafficLight.yellowLight.material = yellowMaterialOn; break;
                case 'green': trafficLight.greenLight.material = greenMaterialOn; break;
            }
        });
    });
}



const st1=[2,3,4]
const st2=[17,18,19]
const st3=[7,8,9]
const st4=[12,13,14]

const l1=[0,1]
const l2=[15,16]
const l3=[5,6]
const l4=[10,11]


let isRunning = true; 
let currentPattern = 1; 
function controlTrafficSignals() {

    const patterns = {
        1: [
            { lights: [st1, st2], duration: 5000 },
            { lights: [st3, st4], duration: 5000 },
            { lights: [l1, l2], duration: 5000 },  
            { lights: [l3, l4], duration: 5000 }, 
        ],
        2: [
            { lights: [st1, l1], duration: 5000 }, 
            { lights: [st2, l2], duration: 5000 }, 
            { lights: [st3, l3], duration: 5000 }, 
            { lights: [st4, l4], duration: 5000 }, 
        ],
    };

    let index = 0;

    function changeSignals() {
        if (!isRunning) return; 

        const { lights, duration } = patterns[currentPattern][index];

        setTrafficLightsColors(lights, "green");

        setTimeout(() => {
            setTrafficLightsColors(lights, "yellow");

            setTimeout(() => {
                setTrafficLightsColors(lights, "red");

                index = (index + 1) % patterns[currentPattern].length; // Loop through the current pattern
                changeSignals();
            }, 1000);
        }, duration);
    }

    changeSignals();
}


function startTrafficSignals() {
    isRunning = true;
    controlTrafficSignals();
}

function stopTrafficSignals() {
    isRunning = false;
}


function switchPattern(event) {
    if (event.key === '1' || event.key === '2') {
        currentPattern = parseInt(event.key);
        stopTrafficSignals();
        startTrafficSignals();
        console.log(`Switched to Pattern ${currentPattern}`);
    }
}


document.addEventListener('keydown', switchPattern);


startTrafficSignals();

function isRed(r, g, b) {
    return r > 200 && g < 100 && b < 100; // Adjust thresholds as necessary
}

function isOrange(r, g, b) {
    return r > 200 && g > 100 && g < 200 && b < 100; // Adjust thresholds as necessary
}

function isGreen(r, g, b) {
    return g > 150 && r < 100 && b < 100; // Adjust thresholds as necessary
}

function animateCloud() {
    clouds.forEach(cloud => {
        cloud.position.x += 0.1;
        if (cloud.position.x > 500) cloud.position.x = -500;
    });
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animateCloud);
}

animateCloud();


