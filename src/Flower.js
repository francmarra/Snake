import Entity from './Entity'
import * as THREE from 'three'

export default class Flower extends Entity {
  constructor(resolution, color = 0xff69b4) {
    // Create flower geometry - a cylinder for stem and sphere for bloom
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.8, 8)
    const bloomGeometry = new THREE.SphereGeometry(0.25, 12, 8)
    
    // Create materials
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 })
    const bloomMaterial = new THREE.MeshStandardMaterial({ color })
    
    // Create meshes
    const stem = new THREE.Mesh(stemGeometry, stemMaterial)
    const bloom = new THREE.Mesh(bloomGeometry, bloomMaterial)
    
    // Position parts
    stem.position.y = 0.4
    bloom.position.y = 0.85
    
    // Create group to hold all parts
    const group = new THREE.Group()
    group.add(stem, bloom)
    
    // Add petals for more detail
    for (let i = 0; i < 5; i++) {
      const petalGeometry = new THREE.SphereGeometry(0.15, 6, 4)
      const petal = new THREE.Mesh(petalGeometry, bloomMaterial)
      const angle = (i / 5) * Math.PI * 2
      petal.position.x = Math.cos(angle) * 0.2
      petal.position.z = Math.sin(angle) * 0.2
      petal.position.y = 0.85
      petal.scale.set(0.8, 0.3, 0.8)
      group.add(petal)
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
