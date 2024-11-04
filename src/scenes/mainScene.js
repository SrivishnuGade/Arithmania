// src/scenes/mainScene.js
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initFog } from '../environment/fog.js';
import { initLighting } from '../environment/lighting.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { cars, loadModel } from '../loaders/gltfloader.js';
import { loadRoad } from '../loaders/objloader.js';
import { createJoystick, resetJoystick, removeJoystickControl, setupJoystick } from '../controls/joystickcontrols.js';

const scene = new THREE.Scene();
initFog(scene);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(30, 75, 350);

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

Promise.all([
    loadModel(scene,'Mustang', '/assets/shelby/scene.gltf', 450, 0, 60, 12),
    loadModel(scene,'Focus', '/assets/focus/scene.gltf', 500, 0, 30, 12),
    loadModel(scene,'Boxster', '/assets/boxster/scene.gltf', 1.35, 3.9, 45, 12),
    loadModel(scene,'Porsche', '/assets/porsche/scene.gltf', 5, 0.55, 30, 8),
    // loadModel(scene,'Civic', '/assets/civic/scene.gltf', 500, 0, 75, 12)
]).then(() => {
    console.log('All models loaded:', cars);
    setInterval(() => {
        // Define the cars you want to include in the loop
        const carModels = [
            [cars['Focus'][5]], // Include Focus car at index 5
            [cars['Boxster'][5]], // Include Boxster car at index 5
            [cars['Focus'][1]],
            [cars['Boxster'][1]],
            [cars['Focus'][9]],
            [cars['Boxster'][9]],
            [cars['Porsche'][1]],
            [cars['Porsche'][5]],
            [cars['Porsche'][9]],
            [cars['Mustang'][1]],
            [cars['Mustang'][5]],
            [cars['Mustang'][9]],
        ];

        // Loop over each car array and each car within those arrays
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                const lane = Math.floor(car.position.x / 15);
                const position = Math.floor((car.position.z - 90) / 30);
                let light= 'red';
                if(lane>=0 &&lane<=4){
                    light = getTrafficLightColor(15+lane);
                }
                // console.log(light);
                if(position>=0)
                {
                    // Check if the car's current position is already tracked
                    if (!occ_pos.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos.push([lane, position]); // Only add if it doesn't exist
                    }
                    if (position === 0 && light=='green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft1(car);

                                break;
                            case 1:
                                moveCarLeft2(car);
                                break;

                            default:
                                moveCarStraight(car);
                                break;
                        }
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position);
                    }else if(lane===5 && position===1){
                        moveCarRight(car);
                        console.log('right');
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position);
                    }
                    else if (car.position.z <= 140 && car.position.x===75) {
                        moveCarRight(car);
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position);
                    }
                    else if ((position !== 0 || light=='green') && !occ_pos.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        // Move the car forward
     
                        

                        if (position === 7 && lane === 2 ) {
                            changeLane(car, 'left');
                            occ_pos.push([lane-1, position-1]);
                            
                        } else if (position === 5 && lane === 1 && !occ_pos.some(pos => pos[0] === lane-1 && pos[1] === position - 1)) {
                            changeLane(car, 'left');
                            occ_pos.push([lane-1, position-1]);
                        } else if(position === 8 && lane === 4){
                            changeLane(car, 'right');
                            occ_pos.push([lane+1, position-1]);
                        } else {
                            moveCarFront(car);
                            occ_pos.push([lane, position-1]);
                        }
                        // Update occupancy for the new position
                        // occ_pos.push([lane, position-1]); // Add the new position
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position); // Remove the old position
                    } else {
                        // Mark the current position if it hasn't moved
                        occ2[lane][position] = 1;
                    }
                }
                // Log for debugging
                // console.log(`Position: ${position}, Lane: ${lane}`);
                // console.log(occ_pos);

                // Remove the car from the scene if it goes beyond z = -450
                if (car.position.z < -450) {
                    scene.remove(car);
                }
            });
        });
    }, 250);
    setInterval(() => {
        const carModels = [
            [cars['Focus'][4]],
            [cars['Boxster'][4]],
            [cars['Focus'][0]],
            [cars['Boxster'][0]],
            [cars['Focus'][8]],
            [cars['Boxster'][8]],
            [cars['Porsche'][0]],
            [cars['Porsche'][4]],
            [cars['Porsche'][8]],
            [cars['Mustang'][0]],
            [cars['Mustang'][4]],
            [cars['Mustang'][8]],
        ];
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                const lane = Math.floor(-car.position.x / 15);
                const position = Math.floor((-car.position.z - 90) / 30);
                let light = 'red';
    
                if (lane >= 0 && lane <= 4) {
                    light = getTrafficLightColor(lane);
                }
                if (position >= 0) {
                    // Insert debugging logs
                    console.log(`Processing car at lane: ${lane}, position: ${position}`);
    
                    if (!occ_pos1.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos1.push([lane, position]);
                        console.log(`Added to occ_pos1: lane ${lane}, position ${position}`);
                    }
    
                    if (position === 0 && light === 'green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft11(car);
                                break;
                            case 1:
                                moveCarLeft21(car);
                                break;
                            default:
                                moveCarStraight1(car);
                                break;
                        }
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (lane === 5 && position === 1) {
                        moveCarRight1(car);
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (car.position.z <= 140 && car.position.x === 75) {
                        moveCarRight1(car);
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if ((position !== 0 || light === 'green') && !occ_pos1.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        if (position === 7 && lane === 2) {
                            changeLane1(car, 'left');
                            occ_pos1.push([lane - 1, position - 1]);
                        } else if (position === 5 && lane === 1 && !occ_pos1.some(pos => pos[0] === lane - 1 && pos[1] === position - 1)) {
                            changeLane1(car, 'left');
                            occ_pos1.push([lane - 1, position - 1]);
                        } else if (position === 8 && lane === 4) {
                            changeLane1(car, 'right');
                            occ_pos1.push([lane + 1, position - 1]);
                        } else {
                            moveCarFront1(car);
                            occ_pos1.push([lane, position - 1]);
                        }
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else {
                        occ21[lane][position] = 1;
                    }
                }
    
                console.log(`Final occ_pos1:`, occ_pos1);
                
                if (car.position.z < -450) {
                    scene.remove(car);
                }
            });
        });
    }, 250);
    setInterval(() => {
        const carModels = [
            [cars['Focus'][6]],
            [cars['Boxster'][6]],
            [cars['Focus'][2]],
            [cars['Boxster'][2]],
            [cars['Focus'][10]],
            [cars['Boxster'][10]],
            [cars['Porsche'][2]],
            [cars['Porsche'][6]],
            [cars['Porsche'][10]],
            [cars['Mustang'][2]],
            [cars['Mustang'][6]],
            [cars['Mustang'][10]],
        ];
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                const lane = Math.floor(car.position.z / 15);
                const position = Math.floor((-car.position.x - 90) / 30);
                let light = 'red';
    
                if (lane >= 0 && lane <= 4) {
                    light = getTrafficLightColor(5+lane);
                }
                if (position >= 0) {
                    // Insert debugging logs
                    console.log(`Processing car at lane: ${lane}, position: ${position}`);
    
                    if (!occ_pos2.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos2.push([lane, position]);
                        console.log(`Added to occ_pos2: lane ${lane}, position ${position}`);
                    }
    
                    if (position === 0 && light === 'green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft12(car);
                                break;
                            case 1:
                                moveCarLeft22(car);
                                break;
                            default:
                                moveCarStraight2(car);
                                break;
                        }
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (lane === 5 && position === 1) {
                        moveCarRight2(car);
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (car.position.x >= -140 && car.position.z === 75) {
                        moveCarRight2(car);
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if ((position !== 0 || light === 'green') && !occ_pos2.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        if (position === 7 && lane === 2) {
                            changeLane2(car, 'left');
                            occ_pos2.push([lane - 1, position - 1]);
                        } else if (position === 5 && lane === 1 && !occ_pos2.some(pos => pos[0] === lane - 1 && pos[1] === position - 1)) {
                            changeLane2(car, 'left');
                            occ_pos2.push([lane - 1, position - 1]);
                        } else if (position === 8 && lane === 4) {
                            changeLane2(car, 'right');
                            occ_pos2.push([lane + 1, position - 1]);
                        } else {
                            moveCarFront2(car);
                            occ_pos2.push([lane, position - 1]);
                        }
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else {
                        occ21[lane][position] = 1;
                    }
                }
    
                console.log(`Final occ_pos2:`, occ_pos2);
                
                if (car.position.z < -450) {
                    scene.remove(car);
                }
            });
        });
    }, 250);
    setInterval(() => {
        const carModels = [
            [cars['Focus'][7]],
            [cars['Boxster'][7]],
            [cars['Focus'][3]],
            [cars['Boxster'][3]],
            [cars['Focus'][11]],
            [cars['Boxster'][11]],
            [cars['Porsche'][3]],
            [cars['Porsche'][7]],
            [cars['Porsche'][11]],
            [cars['Mustang'][3]],
            [cars['Mustang'][7]],
            [cars['Mustang'][11]],
        ];
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                const lane = Math.floor(-car.position.z / 15);
                const position = Math.floor((car.position.x - 90) / 30);
                let light = 'red';
    
                if (lane >= 0 && lane <= 4) {
                    light = getTrafficLightColor(10+lane);
                }
                if (position >= 0) {
                    // Insert debugging logs
                    console.log(`Processing car at lane: ${lane}, position: ${position}`);
    
                    if (!occ_pos3.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos3.push([lane, position]);
                        console.log(`Added to occ_pos3: lane ${lane}, position ${position}`);
                    }
    
                    if (position === 0 && light === 'green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft13(car);
                                break;
                            case 1:
                                moveCarLeft23(car);
                                break;
                            default:
                                moveCarStraight3(car);
                                break;
                        }
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (lane === 5 && position === 1) {
                        moveCarRight3(car);
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (car.position.x <= 140 && car.position.z === -75) {
                        moveCarRight3(car);
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if ((position !== 0 || light === 'green') && !occ_pos3.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        if (position === 7 && lane === 2) {
                            changeLane3(car, 'left');
                            occ_pos3.push([lane - 1, position - 1]);
                        } else if (position === 5 && lane === 1 && !occ_pos3.some(pos => pos[0] === lane - 1 && pos[1] === position - 1)) {
                            changeLane3(car, 'left');
                            occ_pos3.push([lane - 1, position - 1]);
                        } else if (position === 8 && lane === 4) {
                            changeLane3(car, 'right');
                            occ_pos3.push([lane + 1, position - 1]);
                        } else {
                            moveCarFront3(car);
                            occ_pos3.push([lane, position - 1]);
                        }
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else {
                        occ21[lane][position] = 1;
                    }
                }
    
                console.log(`Final occ_pos3:`, occ_pos3);
                
                if (car.position.z < -450) {
                    scene.remove(car);
                }
            });
        });
    }, 250);

}).catch(error => {
    console.error(error);
});


loadRoad(scene);
setupJoystick(scene, camera);


function moveCarRight(carModel) {
    let yPosition=carModel.position.y;

        // Create a GSAP timeline for seamless transitions
        const timeline = gsap.timeline();

        // Add each movement to the timeline
        timeline.add(() => {
                    // Step 2: Animate the right turn with radius 60
                    animateTurn(carModel, () => {
                        // Step 3: Continue straight along the x-axis from (135, y, -60)
                        gsap.to(carModel.position, {
                            duration: 3,
                            x: 450,
                            y: yPosition,
                            z: 60,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });

}

function moveCarRight1(carModel) {
    let yPosition=carModel.position.y;

        // Create a GSAP timeline for seamless transitions
        const timeline = gsap.timeline();

        // Add each movement to the timeline
        timeline.add(() => {
                    // Step 2: Animate the right turn with radius 60
                    animateTurn1(carModel, () => {
                        // Step 3: Continue straight along the x-axis from (135, y, -60)
                        gsap.to(carModel.position, {
                            duration: 3,
                            x: -450,
                            y: yPosition,
                            z: -60,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });

}
function moveCarRight2(carModel) {
    let yPosition=carModel.position.y;

        // Create a GSAP timeline for seamless transitions
        const timeline = gsap.timeline();

        // Add each movement to the timeline
        timeline.add(() => {
                    // Step 2: Animate the right turn with radius 60
                    animateTurn2(carModel, () => {
                        // Step 3: Continue straight along the x-axis from (135, y, -60)
                        gsap.to(carModel.position, {
                            duration: 3,
                            x: -60,
                            y: yPosition,
                            z: 450,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });

}
function moveCarRight3(carModel) {
    let yPosition=carModel.position.y;

        // Create a GSAP timeline for seamless transitions
        const timeline = gsap.timeline();

        // Add each movement to the timeline
        timeline.add(() => {
                    // Step 2: Animate the right turn with radius 60
                    animateTurn3(carModel, () => {
                        // Step 3: Continue straight along the x-axis from (135, y, -60)
                        gsap.to(carModel.position, {
                            duration: 3,
                            x: 60,
                            y: yPosition,
                            z: -450,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });

}


function animateTurn(carModel, onComplete) {
    const radius = 60;
    const centerX = 75 + radius;  // Center of the turn circle at (135, y, 120)
    const centerZ = 120;  // Z-position of the circle's center
    const startAngle = 3*Math.PI/2;  
    const endAngle = Math.PI;  

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle;
        },
        onComplete: onComplete
    });
}

function animateTurn1(carModel, onComplete) {
    const radius = 60;
    const centerX = -75 - radius;  // Center of the turn circle at (135, y, 120)
    const centerZ = -120;  // Z-position of the circle's center
    const startAngle = 3*Math.PI/2+Math.PI;  
    const endAngle = Math.PI+Math.PI;  

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle;
        },
        onComplete: onComplete
    });
}
function animateTurn2(carModel, onComplete) {
    const radius = 60;
    const centerZ = 75 + radius;  // Center of the turn circle at (135, y, 120)
    const centerX = -120;  // Z-position of the circle's center
    const startAngle = 0;  // Start at 270 degrees
    const endAngle = -Math.PI/2;  // End at 180 degrees

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle;
        },
        onComplete: onComplete
    });
}
function animateTurn3(carModel, onComplete) {
    const radius = 60;
    const centerZ = -75 - radius;  // Center of the turn circle at (135, y, 120)
    const centerX = 120;  // Z-position of the circle's center
    const startAngle = Math.PI;  // Start at 270 degrees
    const endAngle = Math.PI/2;  // End at 180 degrees

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle;
        },
        onComplete: onComplete
    });
}

function animateTurnL1(carModel, onComplete) {
    const radius = 90;
    const centerX = 0 - radius;  // Center of the turn circle at (135, y, 120)
    const centerZ = 60;  // Z-position of the circle's center
    const startAngle = 3*Math.PI/2;  // 180 degrees (pointing left)
    const endAngle = 2*Math.PI;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}
function animateTurnL11(carModel, onComplete) {
    const radius = 90;
    const centerX = 0 + radius;  // Center of the turn circle at (135, y, 120)
    const centerZ = -60;  // Z-position of the circle's center
    const startAngle = 3*Math.PI/2+Math.PI;  // 180 degrees (pointing left)
    const endAngle = 2*Math.PI+Math.PI;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}
function animateTurnL12(carModel, onComplete) {
    const radius = 90;
    const centerZ = 0 - radius;  // Center of the turn circle at (135, y, 120)
    const centerX = -60;  // Z-position of the circle's center
    const startAngle = 0;  // 180 degrees (pointing left)
    const endAngle = Math.PI/2;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}
function animateTurnL13(carModel, onComplete) {
    const radius = 90;
    const centerZ = 0 + radius;  // Center of the turn circle at (135, y, 120)
    const centerX = 60;  // Z-position of the circle's center
    const startAngle = Math.PI;  // 180 degrees (pointing left)
    const endAngle = Math.PI/2+Math.PI;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}

function moveCarLeft1(carModel) {
// / Get the second clone
        let yPosition=carModel.position.y;
        // Create a GSAP timeline for seamless transitions
        const timeline = gsap.timeline();

        // Add each movement to the timeline
        timeline.to(carModel.position, { duration: 0.25, x: 0, y: yPosition, z: 60 })
                .add(() => {
                    // Step 2: Animate the right turn with radius 60
                    animateTurnL1(carModel, () => {
                        // Step 3: Continue straight along the x-axis from (135, y, -60)
                        gsap.to(carModel.position, {
                            duration: 5,
                            x: -450,
                            y: yPosition,
                            z: -30,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });
}
function moveCarLeft11(carModel) {
    // / Get the second clone
            let yPosition=carModel.position.y;
            // Create a GSAP timeline for seamless transitions
            const timeline = gsap.timeline();
    
            // Add each movement to the timeline
            timeline.to(carModel.position, { duration: 0.25, x: 0, y: yPosition, z: -60 })
                    .add(() => {
                        // Step 2: Animate the right turn with radius 60
                        animateTurnL11(carModel, () => {
                            // Step 3: Continue straight along the x-axis from (135, y, -60)
                            gsap.to(carModel.position, {
                                duration: 5,
                                x: 450,
                                y: yPosition,
                                z: 30,
                                onComplete: () => {
                                    console.log('Car reached destination');
                                }
                            });
                        });
                    });
    }
function moveCarLeft12(carModel) {
        // / Get the second clone
                let yPosition=carModel.position.y;
                // Create a GSAP timeline for seamless transitions
                const timeline = gsap.timeline();
        
                // Add each movement to the timeline
                timeline.to(carModel.position, { duration: 0.25, x: -60, y: yPosition, z: 0 })
                        .add(() => {
                            // Step 2: Animate the right turn with radius 60
                            animateTurnL12(carModel, () => {
                                // Step 3: Continue straight along the x-axis from (135, y, -60)
                                gsap.to(carModel.position, {
                                    duration: 5,
                                    x: 30,
                                    y: yPosition,
                                    z: -450,
                                    onComplete: () => {
                                        console.log('Car reached destination');
                                    }
                                });
                            });
                        });
        }
function moveCarLeft13(carModel) {
            // / Get the second clone
                    let yPosition=carModel.position.y;
                    // Create a GSAP timeline for seamless transitions
                    const timeline = gsap.timeline();
            
                    // Add each movement to the timeline
                    timeline.to(carModel.position, { duration: 0.25, x: 60, y: yPosition, z: 0 })
                            .add(() => {
                                // Step 2: Animate the right turn with radius 60
                                animateTurnL13(carModel, () => {
                                    // Step 3: Continue straight along the x-axis from (135, y, -60)
                                    gsap.to(carModel.position, {
                                        duration: 5,
                                        x: -30,
                                        y: yPosition,
                                        z: 450,
                                        onComplete: () => {
                                            console.log('Car reached destination');
                                        }
                                    });
                                });
                            });
            }

function animateTurnL2(carModel, onComplete) {
    const radius = 90+15;
    const centerX = 15 - radius;  // Center of the turn circle at (135, y, 120)
    const centerZ = 60;  // Z-position of the circle's center
    const startAngle = 3*Math.PI/2;  // 180 degrees (pointing left)
    const endAngle = 2*Math.PI;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}
function animateTurnL21(carModel, onComplete) {
    const radius = 90+15;
    const centerX = -15 + radius;  // Center of the turn circle at (135, y, 120)
    const centerZ = -60;  // Z-position of the circle's center
    const startAngle = 3*Math.PI/2+Math.PI;  // 180 degrees (pointing left)
    const endAngle = 2*Math.PI+Math.PI;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}
function animateTurnL22(carModel, onComplete) {
    const radius = 90+15;
    const centerZ = -(radius-15);  // Center of the turn circle at (135, y, 120)
    const centerX = -60;  // Z-position of the circle's center
    const startAngle = 0;  // 180 degrees (pointing left)
    const endAngle = Math.PI/2;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}
function animateTurnL23(carModel, onComplete) {
    const radius = 90+15;
    const centerZ = -15 + radius;  // Center of the turn circle at (135, y, 120)
    const centerX = 60;  // Z-position of the circle's center
    const startAngle = Math.PI;  // 180 degrees (pointing left)
    const endAngle = Math.PI/2+Math.PI;  // -90 degrees (pointing down)

    gsap.to(carModel.position, {
        duration: 1,
        onUpdate: function () {
            const angle = startAngle + (endAngle - startAngle) * (1 - this.progress());
            carModel.position.x = centerX + radius * Math.cos(angle);
            carModel.position.z = centerZ + radius * Math.sin(angle);
            carModel.rotation.y = -angle+Math.PI;
        },
        onComplete: onComplete
    });
}


function moveCarLeft2(carModel) {
    let yPosition=carModel.position.y;

        // Create a GSAP timeline for seamless transitions
        const timeline = gsap.timeline();

        // Add each movement to the timeline
        timeline.to(carModel.position, { duration: 0.25, x: 15, y: yPosition, z: 60 })
                .add(() => {
                    // Step 2: Animate the right turn with radius 60
                    animateTurnL2(carModel, () => {
                        // Step 3: Continue straight along the x-axis from (135, y, -60)
                        gsap.to(carModel.position, {
                            duration: 5,
                            x: -450,
                            y: yPosition,
                            z: -45,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });
}

function moveCarLeft21(carModel) {
    let yPosition=carModel.position.y;

        // Create a GSAP timeline for seamless transitions
        const timeline = gsap.timeline();

        // Add each movement to the timeline
        timeline.to(carModel.position, { duration: 0.25, x: -15, y: yPosition, z: -60 })
                .add(() => {
                    // Step 2: Animate the right turn with radius 60
                    animateTurnL21(carModel, () => {
                        // Step 3: Continue straight along the x-axis from (135, y, -60)
                        gsap.to(carModel.position, {
                            duration: 5,
                            x: 450,
                            y: yPosition,
                            z: 45,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });
}
function moveCarLeft22(carModel) {
    let yPosition=carModel.position.y;

        const timeline = gsap.timeline();

        timeline.to(carModel.position, { duration: 0.25, x: -60, y: yPosition, z: 15 })
                .add(() => {
                    animateTurnL22(carModel, () => {
                        gsap.to(carModel.position, {
                            duration: 5,
                            x: 45,
                            y: yPosition,
                            z: -450,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });
}
function moveCarLeft23(carModel) {
    let yPosition=carModel.position.y;

        const timeline = gsap.timeline();

        timeline.to(carModel.position, { duration: 0.25, x: 60, y: yPosition, z: -15 })
                .add(() => {
                    animateTurnL23(carModel, () => {
                        gsap.to(carModel.position, {
                            duration: 5,
                            x: -45,
                            y: yPosition,
                            z: 450,
                            onComplete: () => {
                                console.log('Car reached destination');
                            }
                        });
                    });
                });
}

function moveCarStraight(carModel) {
    let yPosition=carModel.position.y;
    gsap.to(carModel.position, {
        duration: 5,
        x: carModel.position.x,
        y: yPosition,
        z: -450,
        onComplete: () => {
            console.log('Car reached destination');
        }
    });
}

function moveCarStraight1(carModel) {
    let yPosition=carModel.position.y;
    gsap.to(carModel.position, {
        duration: 5,
        x: carModel.position.x,
        y: yPosition,
        z: 450,
        onComplete: () => {
            console.log('Car reached destination');
        }
    });
}
function moveCarStraight2(carModel) {
    let yPosition=carModel.position.y;
    gsap.to(carModel.position, {
        duration: 5,
        x: 450,
        y: yPosition,
        z: carModel.position.z,
        onComplete: () => {
            console.log('Car reached destination');
        }
    });
}
function moveCarStraight3(carModel) {
    let yPosition=carModel.position.y;
    gsap.to(carModel.position, {
        duration: 5,
        x: -450,
        y: yPosition,
        z: carModel.position.z,
        onComplete: () => {
            console.log('Car reached destination');
        }
    });
}

function changeLane(car,dir){
    let currentZ=car.position.z;
    let currentX=car.position.x;
    const timeline = gsap.timeline();
    currentZ -= 30;
    if(dir=='left'){currentX -= 15;}else if(dir=='right'){currentX += 15;}

    timeline.to(car.position, {
        duration: 0.25,
        x: currentX,
        y: car.position.y,
        z: currentZ
    });
}

function changeLane1(car,dir){
    let currentZ=car.position.z;
    let currentX=car.position.x;
    const timeline = gsap.timeline();
    currentZ += 30;
    if(dir=='left'){currentX += 15;}else if(dir=='right'){currentX -= 15;}

    timeline.to(car.position, {
        duration: 0.25,
        x: currentX,
        y: car.position.y,
        z: currentZ
    });
}
function changeLane2(car,dir){
    let currentZ=car.position.z;
    let currentX=car.position.x;
    const timeline = gsap.timeline();
    currentX += 30;
    if(dir=='left'){currentZ -= 15;}else if(dir=='right'){currentZ += 15;}

    timeline.to(car.position, {
        duration: 0.25,
        x: currentX,
        y: car.position.y,
        z: currentZ
    });
}
function changeLane3(car,dir){
    let currentZ=car.position.z;
    let currentX=car.position.x;
    const timeline = gsap.timeline();
    currentX -= 30;
    if(dir=='left'){currentZ += 15;}else if(dir=='right'){currentZ -= 15;}

    timeline.to(car.position, {
        duration: 0.25,
        x: currentX,
        y: car.position.y,
        z: currentZ
    });
}

function moveCarFront(car) {
    let currentZ=car.position.z;
    const timeline = gsap.timeline();
    
    // Move car forward by 30 units on the z-axis
    currentZ -= 30;
    
    timeline.to(car.position, { 
        duration: 0.25, // Update the duration to match the interval
        x: car.position.x,          // Keep x constant
        y: car.position.y,          // Keep y constant
        z: currentZ     // Use updated z position
    });
}

function moveCarFront1(car) {
    let currentZ=car.position.z;
    const timeline = gsap.timeline();
    
    // Move car forward by 30 units on the z-axis
    currentZ += 30;
    
    timeline.to(car.position, { 
        duration: 0.25, // Update the duration to match the interval
        x: car.position.x,          // Keep x constant
        y: car.position.y,          // Keep y constant
        z: currentZ     // Use updated z position
    });
}
function moveCarFront2(car) {
    let currentX=car.position.x;
    const timeline = gsap.timeline();
    
    currentX += 30;
    
    timeline.to(car.position, { 
        duration: 0.25,
        x: currentX,       
        y: car.position.y,      
        z: car.position.z
    });
}
function moveCarFront3(car) {
    let currentX=car.position.x;
    const timeline = gsap.timeline();
    
    currentX -= 30;
    
    timeline.to(car.position, { 
        duration: 0.25,
        x: currentX,       
        y: car.position.y,      
        z: car.position.z
    });
}

//Define a list containing lists of diffrent sizes
let occ2 = [  [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];




let occ_pos=[];

let occ21 = [  [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];




let occ_pos1=[];

let occ22 = [  [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];




let occ_pos2=[];

let occ23 = [  [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];




let occ_pos3=[];


// -------------------------Traffic Light-------------------------
const redMaterialOn = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const redMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });
const yellowMaterialOn = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const yellowMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });
const greenMaterialOn = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const greenMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });

// Array to hold all traffic lights
const trafficLights = [];

// Function to create a traffic light
function createTrafficLight(x, y, z) {
    const group = new THREE.Group();
    const lightGeometry = new THREE.SphereGeometry(1, 32, 32);

    // Red light
    const redLight = new THREE.Mesh(lightGeometry, redMaterialOn);
    redLight.position.set(-2.3, 0, 0);
    group.add(redLight);

    const redShadeGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32, 1, true); // Hollow cylinder with open ends
    const shadeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide }); // Double-sided for inner visibility
    const redShade = new THREE.Mesh(redShadeGeometry, shadeMaterial);
    redShade.position.set(-2.3, 0, 0.5); // Position above the red light
    redShade.rotation.z = Math.PI / 2;
    redShade.rotation.y=Math.PI/2 // Slant the cylinder to create an angled shade
    group.add(redShade);

    // Yellow light
    const yellowLight = new THREE.Mesh(lightGeometry, yellowMaterialOff);
    yellowLight.position.set(0, 0, 0);
    group.add(yellowLight);
    const yellowShade = new THREE.Mesh(redShadeGeometry.clone(), shadeMaterial);
    yellowShade.position.set(0, 0, 0.5);
    yellowShade.rotation.z = Math.PI / 2;
    yellowShade.rotation.y = Math.PI / 2;
    group.add(yellowShade);

    // Green light
    const greenLight = new THREE.Mesh(lightGeometry, greenMaterialOff);
    greenLight.position.set(2.3, 0, 0);
    group.add(greenLight);
    const greenShade = new THREE.Mesh(redShadeGeometry.clone(), shadeMaterial);
    greenShade.position.set(2.3, 0, 0.5);
    greenShade.rotation.z = Math.PI / 2;
    greenShade.rotation.y = Math.PI / 2;
    group.add(greenShade);

    const housingGeometry = new THREE.BoxGeometry(7, 3, 1.5); // Adjust dimensions as needed
    const housingMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.position.set(0, 0, -0.3); // Position it to enclose the lights
    group.add(housing);


    
    group.position.set(x, y, z);
    if (z ==-69) {
        group.rotation.y = 0;
    }
    else if (z == 69) {
        group.rotation.y = Math.PI;
    }
    else if (x == -69) {
        group.rotation.y = Math.PI / 2;
    }
    else if (x == 69) {
        group.rotation.y = -Math.PI / 2;
    }


    scene.add(group);
    trafficLights.push({ group, redLight, yellowLight, greenLight, state: 0 }); 
}

function AddTrafficLight() {  
// Create multiple traffic lights
for (let i = 0; i < 61; i += 15) {
    createTrafficLight(-i, 30.7, +69); // Adjust spacing as needed
}

for (let i = 0; i < 61; i += 15) {
    createTrafficLight(69, 30.7, i); // Adjust spacing as needed
}

for (let i = 0; i < 61; i += 15) {
    createTrafficLight(-69, 30.7, -i); // Adjust spacing as needed
}

for (let i = 0; i < 61; i+=15) {
    createTrafficLight(i , 30.7, -69); // Adjust spacing as needed
}
}

AddTrafficLight();

function getTrafficLightColor(index) {
    // Ensure index is within bounds
    if (index < 0 || index >= trafficLights.length) {
        console.error(`Invalid traffic light index: ${index}`);
        return null;
    }

    const trafficLight = trafficLights[index];

    // Check the material of each light to determine the current color
    if (trafficLight.redLight.material === redMaterialOn) {
        return "red";
    } else if (trafficLight.yellowLight.material === yellowMaterialOn) {
        return "yellow";
    } else if (trafficLight.greenLight.material === greenMaterialOn) {
        return "green";
    } else {
        // If no light is "on", you might consider returning "off" or null
        return "off";
    }
}

function setTrafficLightsColors(lists, color) {
    // Flatten the lists of indices into a single array
    const allIndices = [].concat(...lists);

    // Loop through each index in the combined array
    allIndices.forEach(index => {
        // Ensure each index is valid
        if (index < 0 || index >= trafficLights.length) {
            console.error(`Invalid traffic light index: ${index}`);
            return;
        }

        // Get the traffic light object for the current index
        const trafficLight = trafficLights[index];

        // Set all lights to "off" by default
        trafficLight.redLight.material = redMaterialOff;
        trafficLight.yellowLight.material = yellowMaterialOff;
        trafficLight.greenLight.material = greenMaterialOff;

        // Turn on the specified color
        switch (color) {
            case "red":
                trafficLight.redLight.material = redMaterialOn;
                break;
            case "yellow":
                trafficLight.yellowLight.material = yellowMaterialOn;
                break;
            case "green":
                trafficLight.greenLight.material = greenMaterialOn;
                break;
            default:
                console.error("Invalid color specified. Use 'red', 'yellow', or 'green'.");
        }
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

// setTrafficLightsColors([l1,l2], "green");
// setTrafficLightsColors([st3,st4], "red");

let isRunning = true; // Control variable for the traffic signal loop
let currentPattern = 1; // Initialize the pattern to 1

function controlTrafficSignals() {
    // Define the two traffic signal patterns
    const patterns = {
        1: [
            { lights: [st1, l1], duration: 3000 }, // st1 and l1 green for 5 seconds
            { lights: [st2, l2], duration: 3000 }, // st2 and l2 green for 5 seconds
            { lights: [st3, l3], duration: 3000 }, // st3 and l3 green for 5 seconds
            { lights: [st4, l4], duration: 3000 }, // st4 and l4 green for 5 seconds
        ],
        2: [
            
            { lights: [st1, st2], duration: 3000 }, // First green for 5 seconds
            { lights: [st3, st4], duration: 3000 }, // Next green for 5 seconds
            { lights: [l1, l2], duration: 3000 },   // Next green for 5 seconds
            { lights: [l3, l4], duration: 3000 },   // Next green for 5 seconds
        ],
    };

    let index = 0;

    function changeSignals() {
        if (!isRunning) return; // Stop if not running

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

// To start and stop the loop:
function startTrafficSignals() {
    isRunning = true;
    controlTrafficSignals();
}

function stopTrafficSignals() {
    isRunning = false;
}

// Function to switch patterns based on user input
function switchPattern(event) {
    if (event.key === '1') {
        currentPattern = 1; // Switch to pattern 1
        console.log("Switched to Pattern 1");
    } else if (event.key === '2') {
        currentPattern = 2; // Switch to pattern 2
        console.log("Switched to Pattern 2");
    }
}

document.addEventListener('keydown', switchPattern);

startTrafficSignals();


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


