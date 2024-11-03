// src/controls/joystickControls.js
import NippleJS from 'nipplejs';
import * as THREE from 'three'; // Ensure THREE.js is imported

let joystickElement = null;
let activeCar = null;

export function createJoystick() {
    joystickElement = document.createElement('div');
    joystickElement.id = 'joystick';
    joystickElement.style.position = 'absolute';
    joystickElement.style.top = '20px'; // Change this from bottom to top
    joystickElement.style.left = '20px';
    joystickElement.style.width = '100px';
    joystickElement.style.height = '100px';
    joystickElement.style.zIndex = '9999'; 
    joystickElement.style.display = 'block'; // Show joystick initially or on demand
    document.body.appendChild(joystickElement);
    console.log('Joystick created successfully.');
}


// Function to show/hide joystick
export function resetJoystick() {
    joystickElement.style.display = 'none'; // Hide the joystick
}

// Function to remove joystick control from a car model
export function removeJoystickControl(carModel) {
    // Check if the carModel has joystick control set up
    if (carModel.joystickControls) {
        // Remove event listeners for joystick control
        document.removeEventListener('joystickMove', carModel.joystickControls.moveHandler);
        document.removeEventListener('joystickStop', carModel.joystickControls.stopHandler);

        // Stop any animations related to joystick
        if (carModel.joystickControls.animationId) {
            cancelAnimationFrame(carModel.joystickControls.animationId);
            carModel.joystickControls.animationId = null; // Reset animation ID
        }

        // Clean up joystick controls data
        carModel.joystickControls = null; // Reset joystick controls
        console.log(`Joystick control removed from ${carModel.name}`);
    }
}

export function setupJoystick(scene, camera, selectedCar) {
    // Remove joystick area creation to avoid the green box
    // const joystickArea = document.createElement('div');
    // joystickArea.style.position = 'absolute';
    // joystickArea.style.left = '20px';
    // joystickArea.style.top = '20px';
    // joystickArea.style.width = '200px';
    // joystickArea.style.height = '200px';
    // joystickArea.style.border = '2px solid red'; // Ensure border is visible
    // joystickArea.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Bright green background
    // joystickArea.style.zIndex = '100'; // Make sure it’s above other elements
    // document.body.appendChild(joystickArea);

    // Use the existing joystickElement as the zone
    const joystick = NippleJS.create({
        zone: joystickElement,
        size: 150,
        color: 'blue',
    });
    
    if (joystick) {
        console.log('Joystick created successfully.');
    } else {
        console.log('Joystick creation failed.');
    }

    joystick.on('move', (event, data) => {
        console.log('Joystick is moving:', data); // Confirm event firing
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
}
