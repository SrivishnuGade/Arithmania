// src/scenes/mainScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initFog } from '../environment/fog.js';
import { initLighting } from '../environment/lighting.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { loadModel } from '../loaders/gltfloader.js';
import { loadRoad } from '../loaders/objloader.js';
import { setupJoystick } from '../controls/joystickcontrols.js';

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
    
loadModel(scene, 'Mustang', '/assets/shelby/scene.gltf', 450, 0, 0, function() {
    console.log('Shelby loaded');
});
loadModel(scene, 'Porsche', '/assets/porsche/scene.gltf', 5, 0.55, 15, function() {
    console.log('Porsche loaded');
});
loadModel(scene, 'Boxster', '/assets/boxster/scene.gltf', 1.35, 3.9, 30, function() {
    console.log('Boxster loaded');
});
loadModel(scene, 'Civic', '/assets/civic/scene.gltf', 500, 0, 45, function() {
    console.log('Civic loaded');
});
loadModel(scene, 'Focus', '/assets/focus/scene.gltf', 500, 0, 60, function() {
    console.log('Focus loaded');
});
loadRoad(scene);
setupJoystick(scene, camera);


function animate() {
    requestAnimationFrame(animate);
    clouds.forEach(cloud => {
        cloud.position.x += 0.1;
        if (cloud.position.x > 500) cloud.position.x = -500;
    });
    controls.update();
    renderer.render(scene, camera);
}

animate();
