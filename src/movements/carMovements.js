import { gsap } from 'gsap';

export function moveCarRight(carModel) {
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
export function moveCarRight1(carModel) {
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
export function moveCarRight2(carModel) {
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
export function moveCarRight3(carModel) {
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

export function moveCarLeft1(carModel) {
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
export function moveCarLeft11(carModel) {
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
export function moveCarLeft12(carModel) {
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
export function moveCarLeft13(carModel) {
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


export function moveCarLeft2(carModel) {
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

export function moveCarLeft21(carModel) {
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
export function moveCarLeft22(carModel) {
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
export function moveCarLeft23(carModel) {
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

export function moveCarStraight(carModel) {
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

export function moveCarStraight1(carModel) {
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
export function moveCarStraight2(carModel) {
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
export function moveCarStraight3(carModel) {
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


export function changeLane(car,dir){
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

export function changeLane1(car,dir){
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
export function changeLane2(car,dir){
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
export function changeLane3(car,dir){
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

export function moveCarFront(car) {
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

export function moveCarFront1(car) {
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
export function moveCarFront2(car) {
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
export function moveCarFront3(car) {
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
