// src/loaders/objLoader.js
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export function loadRoad(scene) {
    const objLoader = new OBJLoader();
    objLoader.load('/assets/USARoad.obj', (obj) => {
        obj.scale.set(5, 5, 5);
        obj.rotation.x = -Math.PI / 2;
        obj.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(obj);
    });
}
