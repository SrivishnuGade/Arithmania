import * as THREE from 'three';

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

export function initCloud(scene){
for (let i = 0; i < 10; i++) {
    const cloud = createFluffyCloud();
    clouds.push(cloud);
    scene.add(cloud);
}
}
export { clouds };