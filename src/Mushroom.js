import Entity from './Entity'
import * as THREE from 'three'

export default class Mushroom extends Entity {
  constructor(resolution, capColor = 0x8B4513, stemColor = 0xF5DEB3) {
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
    stem.position.y = 0.3
    cap.position.y = 0.7
    
    // Create group to hold all parts
    const group = new THREE.Group()
    group.add(stem, cap)
    
    // Add spots to the cap
    for (let i = 0; i < 6; i++) {
      const spotGeometry = new THREE.SphereGeometry(0.08, 6, 6)
      const spotMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
      const spot = new THREE.Mesh(spotGeometry, spotMaterial)
      
      const angle = (i / 6) * Math.PI * 2
      const radius = 0.25
      spot.position.x = Math.cos(angle) * radius
      spot.position.z = Math.sin(angle) * radius
      spot.position.y = 0.75
      spot.scale.setScalar(Math.random() * 0.5 + 0.5)
      group.add(spot)
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
