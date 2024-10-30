// src/environment/ground.js
import * as THREE from 'three';

export function initGround(scene) {
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x77dd77 });
    const ground = new THREE.Mesh(planeGeometry, planeMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
}
