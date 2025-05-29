import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Grass {
  constructor(scene, position, scale = 1, color = 0xd9ed92) {
    this.scene = scene
    this.position = position
    this.scale = scale
    this.color = color
    this.grass = null
    this.gltfLoader = new GLTFLoader()
    
    this.loadGrass()
  }

  loadGrass() {
    this.gltfLoader.load('./assets/models/Grass.gltf', 
      (gltf) => {
        this.grass = gltf.scene.clone();
        
        // Scale the grass - make it shorter but wider to cover more ground
        const heightScale = this.scale * 0.65; // Make grass 50% shorter
        const widthScale = this.scale * 1.3; // Make grass 30% wider for better coverage
        this.grass.scale.set(widthScale, heightScale, widthScale);
        
        // Position the grass with slight offset and lower Y to ensure ground coverage
        const offsetX = (Math.random() - 0.5) * 0.4; // Random offset for natural variation
        const offsetZ = (Math.random() - 0.5) * 0.4;
        this.grass.position.set(
          this.position.x + offsetX,
          this.position.y - 0.55, // Lower position to ensure it covers the ground
          this.position.z + offsetZ
        );
        
        // Add slight random rotation for natural variation
        this.grass.rotation.y = Math.random() * Math.PI * 2;// Enable shadows for all meshes in the grass
        this.grass.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
            
            // Apply grass color
            if (child.material) {
              // Clone material to avoid affecting other instances
              child.material = child.material.clone();
              
              // Remove texture to allow pure color application
              // The grass model comes with a texture that prevents color changes
              if (child.material.map) {
                child.material.map = null;
              }
              
              // Apply the desired color
              child.material.color.setHex(this.color);
              
              // Ensure material is properly visible
              child.material.transparent = false;
              child.material.opacity = 1.0;
              child.material.needsUpdate = true;
            }
          }
        });
        
        this.scene.add(this.grass);
      },
      undefined, // onProgress
      (error) => {
        console.error('Failed to load grass model:', error);
      }
    );
  }
  updateColor(color) {
    this.color = color;
    if (this.grass) {
      this.grass.traverse((child) => {
        if (child.isMesh && child.material) {
          // For materials with textures, remove the texture to allow pure color
          if (child.material.map) {
            child.material.map = null;
          }
          
          child.material.color.setHex(color);
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.needsUpdate = true;
        }
      });
    }
  }

  remove() {
    if (this.grass) {
      this.scene.remove(this.grass);
    }
  }
}
