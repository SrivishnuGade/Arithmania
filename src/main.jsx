import * as THREE from 'three';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import NippleJS from 'nipplejs'; // Import joystick library
import "../styles.css";

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87CEEB, 200, 1200); // Add fog to the scene for depth

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(15, 25, 150);

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

// Adjust Sunlight setup
const sunlight = new THREE.DirectionalLight(0xffffff, 3); // Adjusted intensity
sunlight.position.set(100, 150, 100); // Adjusted position for better shadow casting
sunlight.castShadow = true;
sunlight.shadow.camera.left = -500;
sunlight.shadow.camera.right = 500;
sunlight.shadow.camera.top = 500;
sunlight.shadow.camera.bottom = -500;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 1000;
sunlight.shadow.bias = -0.0005;
sunlight.shadow.mapSize.width = 4096;
sunlight.shadow.mapSize.height = 4096;
scene.add(sunlight);

// Updated Ground setup
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
ground.receiveShadow = true;
scene.add(ground);

// Gradient Sky Shader
const skyShader = {
    uniforms: {
        "topColor": { value: new THREE.Color(0xB3DAE8) }, // Sky blue at top
        "bottomColor": { value: new THREE.Color(0xB3DAE8) }, // Lighter blue near horizon
        "offset": { value: 33 },
        "exponent": { value: 0.6 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
    `
};

const skyMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(skyShader.uniforms),
    vertexShader: skyShader.vertexShader,
    fragmentShader: skyShader.fragmentShader,
    side: THREE.BackSide
});

const skyGeometry = new THREE.SphereGeometry(1000, 32, 15);
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Cloud setup
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

// Model loading and setup
const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();
const cars = {};
let selectedCar = null;

function loadModel(name, path, scale, positionY = 0, counter = 0, callback) {
    gltfLoader.load(path, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(-counter, positionY, -90);
        //model.castShadow = true;
        // Set castShadow on each mesh in the model
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
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
            scene.add(clone);
        });

        if (callback) callback(model);
    });
}

loadModel('Mustang', '/assets/shelby/scene.gltf', 450, 0, 0, function () { console.log('Shelby loaded'); });
loadModel('Porsche', '/assets/porsche/scene.gltf', 5, 0.55, 15, function () { console.log('Porsche loaded'); });
loadModel('Boxster', '/assets/boxster/scene.gltf', 1.35, 3.9, 30, function () { console.log('Boxster loaded'); });
loadModel('Civic', '/assets/civic/scene.gltf', 500, 0, 45, function () { console.log('Civic loaded'); });
loadModel('Focus', '/assets/focus/scene.gltf', 500, 0, 60, function () { console.log('Focus loaded'); });

// Road setup
objLoader.load('/assets/USARoad.obj', (obj) => {
    obj.scale.set(5, 5, 5);
    obj.rotation.x = -Math.PI / 2;
    obj.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    obj.castShadow = true;
    obj.receiveShadow = true;
    scene.add(obj);
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
document.body.appendChild(joystickArea);

const joystick = NippleJS.create({
    zone: joystickArea,
    size: 150,
    color: 'blue',
    position: { left: '50%', top: '50%' },
    restOpacity: 0.5,
    fadeTime: 100,
});

joystick.on('move', (event, data) => {
    if (selectedCar) {
        const speed = 0.5;
        const direction = new THREE.Vector3(data.position.x / 75, 0, data.position.y / 75).normalize();
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
        case '1': selectedCar = cars['Mustang'][0]; break;
        case '2': selectedCar = cars['Porsche'][0]; break;
        case '3': selectedCar = cars['Boxster'][0]; break;
        case '4': selectedCar = cars['Civic'][0]; break;
        case '5': selectedCar = cars['Focus'][0]; break;
    }
});

function animate() {
    requestAnimationFrame(animate);

    // Animate cloud movement
    clouds.forEach(cloud => {
        cloud.position.x += 0.1;
        if (cloud.position.x > 500) cloud.position.x = -500;
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();
