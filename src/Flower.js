import Entity from './Entity'
import * as THREE from 'three'

export default class Flower extends Entity {
  constructor(resolution, color = 0xff69b4) {
    // Create flower geometry - a cylinder for stem and smaller sphere for center
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.8, 8)
    const centerGeometry = new THREE.SphereGeometry(0.15, 16, 12)
    
    // Create materials
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 })
    const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }) // Yellow center
    const petalMaterial = new THREE.MeshStandardMaterial({ color })
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32 })
    
    // Create meshes
    const stem = new THREE.Mesh(stemGeometry, stemMaterial)
    const center = new THREE.Mesh(centerGeometry, centerMaterial)
    
    // Position parts
    // stem.position.y = 0.4
    center.position.y = 0.45
    
    // Create group to hold all parts
    const group = new THREE.Group()
    group.add(stem, center)
    
    // Create petals that radiate from the center - now longer and less pointy
    const numPetals = 8;
    for (let i = 0; i < numPetals; i++) {
      // Create a custom petal shape that connects to the center
      const petalShape = new THREE.Shape();
      const petalLength = 0.45; // Increased length for longer petals
      const petalWidth = 0.16;  // Slightly increased width for better proportion
      
      // Start at center point
      petalShape.moveTo(0, 0);
      
      // Create a more rounded, less pointy petal shape with bezier curve
      petalShape.bezierCurveTo(
        petalWidth * 0.5, petalWidth * 0.6,       // control point 1 - adjusted
        petalLength * 0.6, petalWidth,            // control point 2 - reduced influence
        petalLength, petalWidth * 0.1             // end point - offset from center line for rounded tip
      );
      
      petalShape.bezierCurveTo(
        petalLength * 0.6, -petalWidth,           // control point 1 - adjusted
        petalWidth * 0.5, -petalWidth * 0.6,      // control point 2 - adjusted
        0, 0                                      // back to center
      );
      
      // Extrude the shape slightly to give it thickness
      const extrudeSettings = {
        steps: 1,
        depth: 0.025, // Slightly thinner for delicate appearance
        bevelEnabled: false
      };
      
      const petalGeometry = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
      const petal = new THREE.Mesh(petalGeometry, petalMaterial.clone());
      
      const angle = (i / numPetals) * Math.PI * 2;
      
      // Position and rotate petal
      petal.position.y = 0.45;
      petal.rotation.x = Math.PI / 2; // Make petal flat (horizontal)
      petal.rotation.z = angle;       // Distribute around the center
      
      group.add(petal);
    }
    
    // Add leaves that connect to the stem
    for (let i = 0; i < 2; i++) {
      // Create leaf geometry using flattened ellipsoid
      const leafGeometry = new THREE.SphereGeometry(0.15, 8, 6)
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial)
      
      const angle = i * Math.PI + Math.PI / 4 // Position leaves on opposite sides
      const leafHeight = (i * 0.15) // Vary height along stem
      
      // Position leaves along the stem
      leaf.position.x = Math.cos(angle) * 0.12
      leaf.position.z = Math.sin(angle) * 0.12
      leaf.position.y = leafHeight
      
      // Scale and rotate leaves
      leaf.scale.set(1.0, 0.1, 2.0) // Very flat and elongated
      leaf.rotation.y = angle + Math.PI / 2 // Orient along stem
      leaf.rotation.z = -0.3 // Angle upward
      
      group.add(leaf)
    }
    
    super(group, resolution)
    
    // Enable shadows
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }
}
