import * as THREE from 'three'

export default class Fence {
  constructor(resolution, color = 0x8B4513) {
    this.resolution = resolution
    this.color = color
    this.fencePosts = []
    this.createFence()
  }
  
  createFence() {
    // Create fence post geometry
    const postGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.1)
    const railGeometry = new THREE.BoxGeometry(0.8, 0.08, 0.08)
    const material = new THREE.MeshStandardMaterial({ color: this.color })
    
    // Create fence around the perimeter
    const positions = []
    
    // Top edge (z = -1)
    for (let x = -1; x <= this.resolution.x; x++) {
      positions.push({ x, z: -1, rotation: 0 })
    }
    
    // Bottom edge (z = resolution.y)
    for (let x = -1; x <= this.resolution.x; x++) {
      positions.push({ x, z: this.resolution.y, rotation: 0 })
    }
    
    // Left edge (x = -1)
    for (let z = 0; z < this.resolution.y; z++) {
      positions.push({ x: -1, z, rotation: Math.PI / 2 })
    }
    
    // Right edge (x = resolution.x)
    for (let z = 0; z < this.resolution.y; z++) {
      positions.push({ x: this.resolution.x, z, rotation: Math.PI / 2 })
    }
    
    positions.forEach(pos => {
      const fenceSection = new THREE.Group()
      
      // Create post
      const post = new THREE.Mesh(postGeometry.clone(), material.clone())
      post.position.y = 0.6
      fenceSection.add(post)
      
      // Create rails
      const rail1 = new THREE.Mesh(railGeometry.clone(), material.clone())
      const rail2 = new THREE.Mesh(railGeometry.clone(), material.clone())
      
      rail1.position.y = 0.4
      rail2.position.y = 0.8
      
      fenceSection.add(rail1, rail2)
      
      // Position and rotate the fence section
      fenceSection.position.set(pos.x, 0, pos.z)
      fenceSection.rotation.y = pos.rotation
      
      // Enable shadows
      fenceSection.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      this.fencePosts.push(fenceSection)
    })
  }
  
  addToScene(scene) {
    this.fencePosts.forEach(post => scene.add(post))
  }
  
  removeFromScene(scene) {
    this.fencePosts.forEach(post => scene.remove(post))
  }
}
