// src/environment/fog.js
import * as THREE from 'three';

export function initFog(scene) {
    scene.fog = new THREE.Fog(0x87CEEB, 200, 1200);
}
