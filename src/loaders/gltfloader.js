// src/loaders/gltfLoader.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three'; // Import THREE if not done elsewhere

// Define cars globally within the module (but not in the function)
const cars = {};

export function loadModel(scene, name, path, scale, positionY = 0, counter = 0, callback) {
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(path, function (gltf) {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(-counter, positionY, -90);
        model.castShadow = true;
        model.receiveShadow = true;

        // Initialize an array for this car if it doesn't exist yet
        if (!cars[name]) {
            cars[name] = [];
        }

        // Store the original model
        cars[name].push(model);

        // Traverse to apply shadow properties
        model.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material = child.material.clone();
                }
            }
        });

        // Add the original model to the scene
        scene.add(model);

        // Create clones with different orientations
        const rotations = [Math.PI, Math.PI / 2, -Math.PI / 2];
        const positions = [
            new THREE.Vector3(counter, positionY, 90),    // Clone 1
            new THREE.Vector3(-90, positionY, counter),   // Clone 2
            new THREE.Vector3(90, positionY, -counter)    // Clone 3
        ];

        rotations.forEach((rot, index) => {
            const clone = model.clone();
            clone.rotation.y = rot;
            clone.position.copy(positions[index]);

            // Store each clone
            cars[name].push(clone);

            // Add clone to scene
            scene.add(clone);
        });

        // Execute callback if provided
        if (callback) callback(model);
    }, undefined, function (error) {
        console.error('Error loading GLTF model:', error);
    });
}
