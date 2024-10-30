// src/controls/joystickControls.js
import NippleJS from 'nipplejs';

export function setupJoystick(scene, camera) {
    const joystickArea = document.createElement('div');
    joystickArea.style.position = 'absolute';
    joystickArea.style.left = '20px';
    joystickArea.style.top = '20px';
    document.body.appendChild(joystickArea);

    const joystick = NippleJS.create({
        zone: joystickArea,
        size: 150,
        color: 'blue',
    });

    joystick.on('move', (event, data) => {
        const speed = 0.5;
        const direction = new THREE.Vector3(data.position.x / 75, 0, data.position.y / 75).normalize();
        scene.children.forEach(obj => {
            if (obj.name === 'selectedCar') obj.position.add(direction.multiplyScalar(speed));
        });
    });
}
