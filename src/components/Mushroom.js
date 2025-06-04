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
    
    // Define cap ellipsoid semi-axes (original radius 0.4, Y scaled by 0.5)
    const capSemiAxisX = 0.4;
    const capSemiAxisY = 0.4 * 0.5; // 0.2
    const capSemiAxisZ = 0.4;
    const upVector = new THREE.Vector3(0, 1, 0); // For quaternion calculation

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
  
      // Make sure spots are within the cap's circle (using 0.35 to keep them off the very edge)
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
  
      // Calculate y-coordinate on the cap surface (local to cap's center at 0,0,0 for this calc)
      // capHeight_original = 0.4 (original sphere radius)
      // y_local_on_cap = scale_y * sqrt(R_original^2 - x^2 - z^2)
      const y_local_on_cap = capSemiAxisY * Math.sqrt(Math.max(0, 1 - (x*x)/(capSemiAxisX*capSemiAxisX) - (z*z)/(capSemiAxisZ*capSemiAxisZ)));
  
      // Calculate normal vector at this point on the cap ellipsoid surface
      // Normal N = (x / a^2, y / b^2, z / c^2)
      const normal = new THREE.Vector3(
        x / (capSemiAxisX * capSemiAxisX),
        y_local_on_cap / (capSemiAxisY * capSemiAxisY),
        z / (capSemiAxisZ * capSemiAxisZ)
      ).normalize();
  
      // Set the spot's base position on the cap surface (cap is at y=0.2)
      const spotBasePosition = new THREE.Vector3(x, 0.2 + y_local_on_cap, z);
      // Offset the spot slightly along the normal to prevent z-fighting
      spot.position.copy(spotBasePosition).add(normal.clone().multiplyScalar(0.005)); // 0.005 is half of spot thickness

      // Create a rotation matrix to align the spot with the normal vector
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
      const radiusFactor = 0.85 + Math.random() * 0.1; // Place spots between 85% and 95% of cap radius
      const x_pos = Math.cos(angle) * capSemiAxisX * radiusFactor;
      const z_pos = Math.sin(angle) * capSemiAxisZ * radiusFactor;
      
      // y_pos_local_on_cap: y-coordinate on cap surface, relative to cap center
      // Ensure y is positive for upper hemisphere, and slightly varied
      let y_pos_local_on_cap = capSemiAxisY * Math.sqrt(Math.max(0, 1 - (x_pos*x_pos)/(capSemiAxisX*capSemiAxisX) - (z_pos*z_pos)/(capSemiAxisZ*capSemiAxisZ)));
      y_pos_local_on_cap *= (0.2 + Math.random() * 0.6); // Vary height from 20% to 80% of max height at this x,z

      // Absolute y position in group (cap center is at y=0.2)
      const y_abs_pos = 0.2 + y_pos_local_on_cap;
      spot.position.set(x_pos, y_abs_pos, z_pos);
  
      // Calculate normal vector at this point on the cap ellipsoid surface
      const normal_side = new THREE.Vector3(
        x_pos / (capSemiAxisX * capSemiAxisX),
        y_pos_local_on_cap / (capSemiAxisY * capSemiAxisY),
        z_pos / (capSemiAxisZ * capSemiAxisZ)
      ).normalize();
  
      // Rotate to align with cap surface
      const quaternion_side = new THREE.Quaternion().setFromUnitVectors(upVector, normal_side);
      spot.quaternion.copy(quaternion_side);
        // Offset slightly along normal if needed (usually cylinder thickness handles this)
      spot.position.add(normal_side.clone().multiplyScalar(0.005));


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
