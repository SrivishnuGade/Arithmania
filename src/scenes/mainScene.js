// src/scenes/mainScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initFog } from '../environment/fog.js';
import { initLighting } from '../environment/lighting.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { gsap } from 'gsap';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Prey } from '../entities/Prey';
import { Predator } from '../entities/Predator';
import { cos } from 'three/tsl';
import { loadTree } from '../loaders/treeLoader.js';
import { loadGrass } from '../loaders/grassLoader.js';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { readCsvFile } from '../utils/csvReader.js';

let ndvi=[[]];

readCsvFile('Anamalai_last_ndvi.csv')
    .then((data) => {
        // console.log('CSV Data:', data);
        ndvi=data;
        console.log("NDVI: ", ndvi);
        initGround(scene, ndvi); // Pass the NDVI data to initGround
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });

// console.log("NDVI: ", ndvi);

const scene = new THREE.Scene();
initFog(scene);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(30, 75, 350);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = "myCanvas";
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const clock = new THREE.Clock();

initLighting(scene);
// initGround(scene);
initSky(scene);
// loadTree(scene); // Load the tree model


const clouds = [];
function createFluffyCloud() {
    const cloudGroup = new THREE.Group();
    
    const particleMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
    });

    // Adjusted geometry to make particles slightly larger and smoother
    const particleGeometry = new THREE.SphereGeometry(10, 16, 16); // Larger spheres for fluffier particles

    // Create multiple particles to form a fluffy cloud
    for (let i = 0; i < 150; i++) { // Reduced particle count for performance, but larger particles
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Randomly position each particle to form a spread-out, fluffy cloud shape
        particle.position.set(
            (Math.random() - 0.5) * 80, // x position, wider spread
            (Math.random() - 0.5) * 20, // y position, less vertical spread
            (Math.random() - 0.5) * 80  // z position, wider spread
        );

        // Randomize size slightly for a more natural look
        particle.scale.setScalar(Math.random() * 0.8 + 0.6);
        cloudGroup.add(particle);
    }

    // Set the overall position of the cloud cluster higher in the scene
    cloudGroup.position.set(
        Math.random() * 800 - 400, // x position within -400 to 400
        150 + Math.random() * 100,   // height above ground for a natural cloud level
        Math.random() * 800 - 400  // z position within -400 to 400
    );

    return cloudGroup;
}

// function generateGrass(scene) {
//     const grassGroup = new THREE.Group(); // Group to hold all grass blades
//     const grassMaterial = new THREE.MeshPhongMaterial({
//         color: 0x228B22, // Grass green color
//         side: THREE.DoubleSide, // Render both sides of the grass blade
//     });

//     const grassBladeGeometry = new THREE.PlaneGeometry(0.5, 2); // Each grass blade is a small plane

//     const grassCount = 100000; // Number of grass blades to generate
//     const grassAreaSize = 1000; // Size of the area where grass will be distributed

//     for (let i = 0; i < grassCount; i++) {
//         const grassBlade = new THREE.Mesh(grassBladeGeometry, grassMaterial);

//         // Randomly position each grass blade within the area
//         grassBlade.position.set(
//             Math.random() * grassAreaSize - grassAreaSize / 2, // Random x position
//             0, // Grass is on the ground
//             Math.random() * grassAreaSize - grassAreaSize / 2 // Random z position
//         );

//         // Randomly rotate each grass blade for variation
//         grassBlade.rotation.y = Math.random() * Math.PI;

//         // Randomly scale each grass blade for variation
//         const scale = Math.random() * 0.5 + 0.5; // Scale between 0.5 and 1
//         grassBlade.scale.set(scale, scale, scale);

//         grassGroup.add(grassBlade);
//     }

//     grassGroup.position.y = 0.01; // Slightly above the ground to avoid z-fighting
//     scene.add(grassGroup);
// }

// // Call the function to generate grass
// generateGrass(scene);

// Add multiple fluffy clouds to the scene
for (let i = 0; i < 10; i++) {
    const cloud = createFluffyCloud();
    clouds.push(cloud);
    scene.add(cloud);
}
let tigerMixer;
let deerMixer;
let tiger;
let deer;

// Global lists to hold tigers and deers, and their mixers
let tigers = [];
let deers = [];
let tigerMixers = [];
let deerMixers = [];

// const objLoader = new OBJLoader();
// objLoader.load('/assets/lowpoly-tree/source/PineTree.obj', function (object) {
//     object.scale.set(10, 10, 10);
//     object.position.set(0, 0, 0);
//     scene.add(object);
// });

window.addEventListener('resize', onWindowResize, false);
// Load the tiger model and its animations
const fbxLoader = new FBXLoader();

let numtigers = 10;
let numdeers = 50;

fbxLoader.load(
    '/assets/tiger/source/tiger_run.fbx',
    (fbx) => {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/assets/tiger/textures/FbxTemp_0001.png');
    
        for (let i = 0; i < numtigers; i++) {
            const tigerClone = clone(fbx);  // Properly clone SkinnedMesh instances
    
            tigerClone.traverse((child) => {
                if (child.isMesh) {
                    child.material = child.material.clone(); // Clone material to avoid sharing issues
                    child.material.map = texture;
                    child.castShadow = true;
                    child.receiveShadow = false;
                }
            });
    
            // Setup animation mixer for each cloned model
            const mixer = new THREE.AnimationMixer(tigerClone);
            if (tigerClone.animations && tigerClone.animations.length) {
                const action = mixer.clipAction(tigerClone.animations[0]);
                action.play();
            }
    
            tigerMixers.push(mixer);
    
            // Spread them out in the scene
            tigerClone.scale.set(0.1, 0.1, 0.1);
            tigerClone.position.set(Math.random() * 800 - 400, 0, Math.random() * 800 - 400); // Adjust positions to prevent overlap
            tigerClone.updateMatrix();
            tigerClone.updateMatrixWorld(true);
    
            scene.add(tigerClone);
            tigers.push(tigerClone);
        }
    
        // Store mixers globally if needed for updates in an animation loop
        window.tigerMixers = tigerMixers;
    },
    (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
    },
    (error) => {
        console.error('Error loading tiger:', error);
    }
    );


fbxLoader.load(
'/assets/deer/source/deer.fbx',
(fbx) => {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/assets/deer/textures/Antelope_Diffuse.png');

    const lightsToRemove = [];
        fbx.traverse((child) => {
            if (child.isLight) {
                lightsToRemove.push(child);
            }
        });
        
        // Then remove them safely
        lightsToRemove.forEach(light => {
            if (light.parent) {
                light.parent.remove(light);
            }
        });
    for (let i = 0; i < numdeers; i++) {
        const deerClone = clone(fbx);  // Properly clone SkinnedMesh instances
        
        deerClone.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone(); // Clone material to avoid sharing issues
                child.material.map = texture;
                child.castShadow = true;
                child.receiveShadow = false;
            }
        });

        // Setup animation mixer for each cloned model
        const mixer = new THREE.AnimationMixer(deerClone);
        if (deerClone.animations && deerClone.animations.length) {
            const action = mixer.clipAction(deerClone.animations[0]);
            action.play();
        }

        deerMixers.push(mixer);

        // Spread them out in the scene
        deerClone.scale.set(0.1, 0.1, 0.1);
        deerClone.position.set(Math.random() * 800 - 400, 0, Math.random() * 800 - 400); // Adjust positions to prevent overlap
        // deerClone.position.set(0, 0,0); // Adjust positions to prevent overlap
        deerClone.updateMatrix();
        deerClone.updateMatrixWorld(true);

        scene.add(deerClone);
        deers.push(deerClone);
    }

    // Store mixers globally if needed for updates in an animation loop
    window.deerMixers = deerMixers;
},
(progress) => {
    console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
},
(error) => {
    console.error('Error loading deer:', error);
}
);


console.log("Tiger Mixers: ", tigerMixers);
console.log("Deer Mixers: ", deerMixers);
console.log("Tigers: ", tigers);
console.log("Deers: ", deers);

function updateSimulation() {
    // Move deers (prey) randomly
    deers.forEach(deer => {
        // Calculate random movement
        const dx = (Math.random() - 0.5) * 50; // Change in x
        const dz = (Math.random() - 0.5) * 50; // Change in z

        // Calculate new position
        const newX = Math.max(-500, Math.min(500, deer.position.x + dx));
        const newZ = Math.max(-500, Math.min(500, deer.position.z + dz));

        // Calculate heading direction using atan2
        const deltaheading = Math.atan2(newZ - deer.position.z, newX - deer.position.x); // Angle in radians
        const heading=deer.rotation.y  // Set the rotation to face the new direction
        // Use GSAP to animate both position and rotation simultaneously
        gsap.to(deer.rotation, {
            y: -deltaheading+Math.PI/2, // Adjust rotation to face the new direction
            duration: 0.1,
            ease: "power1.out" // Smooth rotation
        });
        gsap.to(deer.position, {
            x: newX,
            z: newZ,
            duration: 0.9, // Duration of the animation in seconds
            ease: "power1.out" // Easing function for smooth movement
        });

        
    });
    // Move tigers (predators) toward the nearest deer
    tigers.forEach(tiger => {
        let nearestDeer = deers.reduce((closest, current) => {
            const closestDistance = tiger.position.distanceTo(closest.position);
            const currentDistance = tiger.position.distanceTo(current.position);
            return currentDistance < closestDistance ? current : closest;
        }, deers[0]);
    
        if (nearestDeer) {
            const direction = new THREE.Vector3()
                .subVectors(nearestDeer.position, tiger.position)
                .normalize();
    
            // Calculate new position
            const newX = tiger.position.x + direction.x * 25; // Move closer to the deer
            const newZ = tiger.position.z + direction.z * 25;
    
            // Calculate heading direction
            
            const deltaheading = Math.atan2(newZ - tiger.position.z, newX - tiger.position.x);
            // Use GSAP to animate both position and rotation simultaneously
            tiger.rotation.z = -deltaheading+Math.PI/2; // Set the rotation to face the new direction
            gsap.to(tiger.position, {
                x: newX,
                z: newZ,
                duration: 1.0, // Duration of the animation in seconds
                ease: "none" // Easing function for smooth movement
            });
        }
        if (!nearestDeer) return; // No deer to chase
        const distance = tiger.position.distanceTo(nearestDeer.position);
        if (distance < 20) {
            // Play "animation2" on the deer
            const deerMixer = deerMixers[deers.indexOf(nearestDeer)];
            const deer = nearestDeer;
            if (deerMixer) {
                const action = deerMixer.clipAction(deer.animations[2]);
                action.setLoop(THREE.LoopOnce); // Play the animation once
                action.clampWhenFinished = true; // Stop at the last frame
                action.play();
            }

            // Remove the deer from the scene and the list after the animation finishes
            setTimeout(() => {
                
                const index = deers.indexOf(nearestDeer);
                if (index !== -1) {
                    scene.remove(nearestDeer);
                    deers.splice(index, 1); // Remove the deer from the deers array
                    deerMixers.splice(index, 1); // Remove the corresponding mixer from the deerMixers array
                }// Remove the corresponding mixer
            }, 10); // Adjust timeout to match the duration of "animation2"
        }
    });

    // Reproduction: Add new deers if below max limit
    if (deers.length < 30 && Math.random() < 0.3) {
        const newDeer = deers[0].clone(); // Clone an existing deer
        newDeer.position.set(
            Math.random() * 200 - 100,
            0,
            Math.random() * 200 - 100
        );
        scene.add(newDeer);
        deers.push(newDeer);

        const newMixer = new THREE.AnimationMixer(newDeer);
        if (newDeer.animations && newDeer.animations.length) {
            const action = newMixer.clipAction(newDeer.animations[0]);
            action.play();
        }
        deerMixers.push(newMixer);
    }

    // Starvation: Remove tigers if no deers are left
    if (deers.length < 6 && Math.random() < 0.05 && tigers.length > 2) {
        const tigerToRemove = tigers.pop();
        scene.remove(tigerToRemove);
        tigerMixers.pop();
    }
    if (tigers.length < 10 && Math.random() < 0.05) {
        const newTiger = tigers[0].clone(); // Clone an existing tiger
        newTiger.position.set(
            Math.random() * 800 - 400,
            0,
            Math.random() * 800 - 400
        );
        scene.add(newTiger);
        tigers.push(newTiger);

        const newMixer = new THREE.AnimationMixer(newTiger);
        if (newTiger.animations && newTiger.animations.length) {
            const action = newMixer.clipAction(newTiger.animations[0]);
            action.play();
        }
        tigerMixers.push(newMixer);
    }

    console.log(`Deers: ${deers.length}, Tigers: ${tigers.length}`);
    document.getElementById('tigerCount').textContent = tigers.length;
    document.getElementById('deerCount').textContent = deers.length;

    console.log(`Deers: ${deers.length}, Tigers: ${tigers.length}`);
}

setInterval(() => {
    updateSimulation();
}, 1000); // Update every 100ms (adjust as needed)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}



function animate() {
    const delta = clock.getDelta();
    
    // Update cloud positions
    clouds.forEach(cloud => {
        cloud.position.x += 0.1;
        if (cloud.position.x > 500) cloud.position.x = -500;
    });

    // Update both animations independently
    if (tigerMixers && tigerMixers.length > 0) {
        tigerMixers.forEach(mixer => mixer.update(delta));
    }
    if (deerMixers && deerMixers.length > 0) {
        deerMixers.forEach(mixer => mixer.update(delta));
    }

    
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


animate();

