import Entity from './Entity'
import * as THREE from 'three'

export default class Mushroom extends Entity {
  constructor(resolution, capColor = 0x8B4513, stemColor = 0xF5DEB3, spotColor = 0xFFFFFF) {
    // Create mushroom geometry
    const stemGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.6, 8)
    const capGeometry = new THREE.SphereGeometry(0.4, 12, 8)
    
    // Flatten the cap
    capGeometry.scale(1, 0.5, 1)
    
    // Create materials
    const stemMaterial = new THREE.MeshStandardMaterial({ color: stemColor })
    const capMaterial = new THREE.MeshStandardMaterial({ color: capColor })
    
    // Create meshes
    const stem = new THREE.Mesh(stemGeometry, stemMaterial)
    const cap = new THREE.Mesh(capGeometry, capMaterial)
    
    // Position parts
    stem.position.y = -0.2
    cap.position.y = 0.2
    
    // Create group to hold all parts
    const group = new THREE.Group()
    group.add(stem, cap)      // Add flat spots to the cap with random pattern
    const spotCount = Math.floor(Math.random() * 5) + 5; // Random number of spots between 5-9
      // Create some flat spots in a scattered pattern on top
    for (let i = 0; i < spotCount; i++) {
      // Use thin cylinders for flat spots
      const spotGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.01, 8)
      const spotMaterial = new THREE.MeshStandardMaterial({ color: spotColor })
      const spot = new THREE.Mesh(spotGeometry, spotMaterial)
      
      // Random position within cap bounds
      let validPosition = false;
      let x, z, distFromCenter;
      
      // Make sure spots are within the cap's circle
      while (!validPosition) {
        // Random position within a square
        x = (Math.random() * 2 - 1) * 0.35;
        z = (Math.random() * 2 - 1) * 0.35;
        
        // Check if inside cap circle
        distFromCenter = Math.sqrt(x*x + z*z);
        if (distFromCenter <= 0.35) {
          validPosition = true;
        }
      }
      
      // Set the position
      spot.position.x = x;
      spot.position.z = z;
      
      // Calculate height on the cap surface (using spherical cap equation)
      const capHeight = 0.4; // Cap radius
      const height = Math.sqrt(Math.max(0, capHeight*capHeight - x*x - z*z)) * 0.5; // 0.5 for flattened sphere
      spot.position.y = 0.2 + height + 0.005; // Add small offset from surface
      
      // Calculate normal vector at this point on the cap to orient the flat spot
      const normal = new THREE.Vector3(x, height, z).normalize();
      
      // Create a rotation matrix to align the spot with the normal vector
      // Convert from default cylinder orientation (Y-axis) to normal direction
      const upVector = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normal);
      spot.quaternion.copy(quaternion);
      
      // Random size (more variation)
      const scale = Math.random() * 0.7 + 0.3;
      spot.scale.set(scale, 1, scale); // Keep y-scale at 1 to maintain thinness
      
      group.add(spot);
    }
      // Add few spots on the sides of the cap for extra detail
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
      const spotGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 8)
      const spotMaterial = new THREE.MeshStandardMaterial({ color: spotColor })
      const spot = new THREE.Mesh(spotGeometry, spotMaterial)
      
      // Position on the sides of the cap
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.38;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Position slightly below the equator of the cap
      const y = 0.2 + Math.random() * 0.15;
      spot.position.set(x, y, z);
      
      // Calculate normal vector at this point
      const normal = new THREE.Vector3(x, 0, z).normalize();
      
      // Rotate to align with cap surface
      const upVector = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normal);
      spot.quaternion.copy(quaternion);
      
      // Smaller spots for the sides
      const scale = Math.random() * 0.4 + 0.2;
      spot.scale.set(scale, 1, scale);
      
      group.add(spot);
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
