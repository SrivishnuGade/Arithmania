import * as THREE from 'three';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Sky } from '../node_modules/three/examples/jsm/objects/Sky.js'; // Sky shader
import NippleJS from 'nipplejs'; // Import nipplejs
import "../styles.css";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

camera.position.set(15, 25, 150);
controls.update();

// Sunlight setup
const sunlight = new THREE.DirectionalLight(0xffffff, 5);
sunlight.position.set(50, 50, 50);
sunlight.castShadow = true;
sunlight.shadow.camera.left = -200;
sunlight.shadow.camera.right = 200;
sunlight.shadow.camera.top = 200;
sunlight.shadow.camera.bottom = -200;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 500;
sunlight.shadow.bias = -0.001;
sunlight.shadow.mapSize.width = 4096;
sunlight.shadow.mapSize.height = 4096;
scene.add(sunlight);

// Ground setup
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
ground.receiveShadow = true;
scene.add(ground);

// Sky shader setup
const sky = new Sky();
sky.scale.setScalar(1000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
const sun = new THREE.Vector3();
const elevation = 15; // adjust for desired sun angle
const azimuth = 180;

// Function to update sun position based on elevation and azimuth
function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sun);
    sunlight.position.copy(sun.multiplyScalar(200));
}
updateSun();

// Load GLTF models
const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

const cars = {}; // Object to store original and cloned car references
let selectedCar = null; // Track the selected car

function loadModel(name, path, scale, positionY = 0, counter = 0, callback) {
    gltfLoader.load(path, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(-counter, positionY, -90);
        model.castShadow = true;
        model.receiveShadow = true;

        if (!cars[name]) {
            cars[name] = [];
        }
        cars[name].push(model);

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = child.material.clone();
                child.material.depthWrite = true;
            }
        });
        scene.add(model);

        const rotations = [Math.PI, Math.PI / 2, -Math.PI / 2];
        const positions = [
            new THREE.Vector3(counter, positionY, 90),
            new THREE.Vector3(-90, positionY, counter),
            new THREE.Vector3(90, positionY, -counter)
        ];

        rotations.forEach((rot, index) => {
            const clone = model.clone();
            clone.rotation.y = rot;
            clone.position.copy(positions[index]);
            cars[name].push(clone);
            scene.add(clone);
        });

        if (callback) callback(model);
    }, undefined, (error) => {
        console.error('Error loading GLTF model:', error);
    });
}

// Load models
loadModel('Mustang', '/assets/shelby/scene.gltf', 450, 0, 0, function () {
    console.log('Shelby loaded');
});
loadModel('Porsche', '/assets/porsche/scene.gltf', 5, 0.55, 15, function () {
    console.log('Porsche loaded');
});
loadModel('Boxster', '/assets/boxster/scene.gltf', 1.35, 3.9, 30, function () {
    console.log('Boxster loaded');
});
loadModel('Civic', '/assets/civic/scene.gltf', 500, 0, 45, function () {
    console.log('Civic loaded');
});
loadModel('Focus', '/assets/focus/scene.gltf', 500, 0, 60, function () {
    console.log('Focus loaded');
});

// Load OBJ model for road
objLoader.load('/assets/USARoad.obj', (obj) => {
    obj.scale.set(5, 5, 5);
    obj.position.set(0, 0, 0);
    obj.rotation.x = -Math.PI / 2;
    obj.castShadow = true;
    obj.receiveShadow = true;
    obj.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = child.material.clone();
        }
    });
    scene.add(obj);
}, undefined, (error) => {
    console.error('Error loading OBJ model:', error);
});

// Resize handler
window.addEventListener('resize', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Joystick setup
const joystickArea = document.createElement('div');
joystickArea.style.position = 'absolute';
joystickArea.style.left = '20px';
joystickArea.style.top = '20px';
joystickArea.style.width = '100px';
joystickArea.style.height = '100px';
joystickArea.style.zIndex = '1000'; // Ensure it's above other elements
document.body.appendChild(joystickArea);

const joystick = NippleJS.create({
    zone: joystickArea,
    size: 150,
    color: 'blue',
    position: { left: '50%', top: '50%' },
    restOpacity: 0.5,
    fadeTime: 100,
});

// Joystick event handling
joystick.on('move', (event, data) => {
    if (selectedCar) {
        const speed = 0.5; // Speed factor for the car movement
        // Normalize the joystick position to get direction
        const direction = new THREE.Vector3(data.position.x / 75, 0, data.position.y / 75).normalize(); // Adjusted for joystick size
        selectedCar.position.add(direction.multiplyScalar(speed));
    }
});

joystick.on('end', () => {
    if (selectedCar) {
        // Optional: Stop the car when the joystick is released
    }
});

// Light movement control
const lightMovementSpeed = 5;

window.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'w': sunlight.position.y += lightMovementSpeed; break;
        case 's': sunlight.position.y -= lightMovementSpeed; break;
        case 'a': sunlight.position.x -= lightMovementSpeed; break;
        case 'd': sunlight.position.x += lightMovementSpeed; break;
        case 'z': sunlight.position.z -= lightMovementSpeed; break;
        case 'x': sunlight.position.z += lightMovementSpeed; break;
        case '1': selectedCar = cars['Mustang'][0]; break; // Select Mustang
        case '2': selectedCar = cars['Porsche'][0]; break; // Select Porsche
        case '3': selectedCar = cars['Boxster'][0]; break; // Select Boxster
        case '4': selectedCar = cars['Civic'][0]; break; // Select Civic
        case '5': selectedCar = cars['Focus'][0]; break; // Select Focus
        default: break;
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    if (cars['Focus']) {
        const focusCar = cars['Focus'][0];
        focusCar.rotation.y += 0.01; // Optional rotation for Focus car
    }
}

animate();
