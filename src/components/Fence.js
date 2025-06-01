import * as THREE from 'three'

export default class Fence {
  constructor(resolution, color = 0xA67C52, railColor = 0x8B4513) {
    this.resolution = resolution
    this.postColor = 0x7f5539 // Light brown for posts regardless of theme
    this.railColor = 0x9c6644 // Darker brown for rails regardless of theme
    this.fencePosts = []
    this.createFence()
  }
    createFence() {    // Create fence post geometry
    const postGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.1)
    const cornerPostGeometry = new THREE.BoxGeometry(0.15, 1.3, 0.15) // Slightly larger corner posts
    const railGeometry = new THREE.BoxGeometry(1.0, 0.08, 0.08) // Increased length for better connection

    // Create materials for posts and rails - can now be different colors
    const postMaterial = new THREE.MeshStandardMaterial({ color: this.postColor })
    const railMaterial = new THREE.MeshStandardMaterial({ color: this.railColor })

    // Create fence around the perimeter
    const positions = []

    // Top edge (z = -1)
    for (let x = -1; x <= this.resolution.x; x++) {
      positions.push({ x, z: -1, rotation: 0 })
    }

    // Bottom edge (z = resolution.y)
    for (let x = -1; x <= this.resolution.x; x++) {
      positions.push({ x, z: this.resolution.y, rotation: Math.PI })
    }

    // Left edge (x = -1)
    for (let z = 0; z < this.resolution.y; z++) {
      positions.push({ x: -1, z, rotation: Math.PI / 2 })
    }
    // Right edge (x = resolution.x)
    for (let z = 0; z < this.resolution.y; z++) {
      positions.push({ x: this.resolution.x-0.1, z, rotation: Math.PI / 2 })
    }

    // Add corner pieces positions with specific rotations
    const corners = [
      { x: -1, z: -1, isCorner: true, rotation: 0 },         // Top-left corner
      { x: this.resolution.x, z: -1, isCorner: true, rotation: -Math.PI / 2 },   // Top-right corner
      { x: -1, z: this.resolution.y, isCorner: true, rotation: Math.PI / 2 },   // Bottom-left corner
      { x: this.resolution.x, z: this.resolution.y, isCorner: true, rotation: Math.PI } // Bottom-right corner
    ]

    positions.forEach(pos => {
      // Skip positions where corners will be placed
      if (corners.some(corner => corner.x === pos.x && corner.z === pos.z)) {
        return
      }
  
      const fenceSection = new THREE.Group()
        // Create post
      const post = new THREE.Mesh(postGeometry.clone(), postMaterial.clone())
      post.position.y = -0.3
      fenceSection.add(post)
        // Create rails
      const rail1 = new THREE.Mesh(railGeometry.clone(), railMaterial.clone())
      const rail2 = new THREE.Mesh(railGeometry.clone(), railMaterial.clone())

      rail1.position.y = -0.3
      rail2.position.y = 0.1

      // Push the rails slightly forward to better connect between posts
      // (rails are 1.0 units long, position at 0.5 centers them in the post)
      rail1.position.z = 0.05
      rail2.position.z = 0.05

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
    })    // Add corner posts with rotation
    corners.forEach(corner => {
      this.createCornerPost(corner.x, corner.z, corner.rotation, cornerPostGeometry, railGeometry, postMaterial, railMaterial)
    })
  }  createCornerPost(x, z, rotation, cornerPostGeometry, railGeometry, postMaterial, railMaterial) {
    const cornerGroup = new THREE.Group()

    // Create corner post
    const cornerPost = new THREE.Mesh(cornerPostGeometry.clone(), postMaterial.clone())
    cornerPost.position.y = -0.35 // Slightly taller
    cornerPost.castShadow = true
    cornerPost.receiveShadow = true
    cornerGroup.add(cornerPost)
    // Add two sets of rails at right angles
    // First set of rails (along X axis)
    const railX1 = new THREE.Mesh(railGeometry.clone(), railMaterial.clone())
    const railX2 = new THREE.Mesh(railGeometry.clone(), railMaterial.clone())

    railX1.position.y = -0.3
    railX2.position.y = 0.1

    // Position the rails correctly relative to the corner
    // Using half rail length (0.5) for better positioning
    railX1.position.x = 0.5 
    railX2.position.x = 0.5
    railX1.position.z = 0.05
    railX2.position.z = 0.05
    // Second set of rails (along Z axis)
    const railZ1 = new THREE.Mesh(railGeometry.clone(), railMaterial.clone())
    const railZ2 = new THREE.Mesh(railGeometry.clone(), railMaterial.clone())

    railZ1.position.y = -0.3
    railZ2.position.y = 0.1
    railZ1.position.z = 0.5
    railZ2.position.z = 0.5
    railZ1.position.x = 0.05
    railZ2.position.x = 0.05

    // Rotate the Z rails
    railZ1.rotation.y = Math.PI / 2
    railZ2.rotation.y = Math.PI / 2

    cornerGroup.add(railX1, railX2, railZ1, railZ2)

    // Position the corner and apply rotation
    cornerGroup.position.set(x, 0, z)
    cornerGroup.rotation.y = rotation

    // Enable shadows
    cornerGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    this.fencePosts.push(cornerGroup)
  }
  
  addToScene(scene) {
    this.fencePosts.forEach(post => scene.add(post))
  }
  
  removeFromScene(scene) {
    this.fencePosts.forEach(post => scene.remove(post))
  }
}
