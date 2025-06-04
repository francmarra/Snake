import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Island {  constructor(scene, resolution, groundColor, dirtColor) {
    this.scene = scene
    this.resolution = resolution
    this.island = null
    this.gltfLoader = new GLTFLoader()
    this.dirtColor = dirtColor || 0xa5756d // Use provided dirtColor or default

    this.loadIsland(groundColor)
  }

  loadIsland(groundColor) {
    this.gltfLoader.load('./assets/models/Island.gltf', 
      (gltf) => {
        this.island = gltf.scene;

        // Scale the island to fit the game grid (20x20)
        // Make it bigger to cover more of the game area
        const scale = Math.max(this.resolution.x, this.resolution.y) * 4;
        this.island.scale.set(scale, scale, scale);

        // Position the island at the center of the game area
        this.island.position.x = this.resolution.x / 2 - 0.5;
        this.island.position.z = this.resolution.y / 2 - 0.5;
        this.island.position.y = -60; // Lower the island to be below snake and objects (which are at y=0)

        // Enable shadow receiving for all meshes in the island
        this.island.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;

            // Update material colors to match the current palette
            if (child.material) {
              // Try to identify materials by name first, then fallback to primitive index
              const materialName = child.material.name?.toLowerCase() || '';
  
              // Check if it's likely a grass/top material (usually the first primitive or has "grass" in name)
              if (materialName.includes('grass') || materialName.includes('top') || child.name?.toLowerCase().includes('grass')) {
                child.material.color.setHex(groundColor);
              }              // Check if it's likely a dirt/base material
              else if (materialName.includes('dirt') || materialName.includes('base') || materialName.includes('soil')) {
                const dirtColorObj = new THREE.Color(this.dirtColor);
                dirtColorObj.multiplyScalar(0.7); // Make dirt darker for better visual contrast
                child.material.color.copy(dirtColorObj);
              }
              // If we can't identify by name, apply grass color to the first mesh, dirt to others
              else {
                // For the island model, we'll default to grass color for all surfaces
                child.material.color.setHex(groundColor);
              }
            }
          }
        });
        this.scene.add(this.island);
      }
    );
  }
  updateColors(groundColor, dirtColor) {
    // Update island materials if the island is loaded
    if (this.island) {
      // Update the dirt color if provided
      if (dirtColor) {
        this.dirtColor = dirtColor;
      }
  
      this.island.traverse((child) => {
        if (child.isMesh && child.material) {
          const materialName = child.material.name?.toLowerCase() || '';
  
          // Check if it's likely a grass/top material
          if (materialName.includes('grass') || materialName.includes('top') || child.name?.toLowerCase().includes('grass')) {
            child.material.color.setHex(groundColor);
          }
          // Check if it's likely a dirt/base material
          else if (materialName.includes('dirt') || materialName.includes('base') || materialName.includes('soil')) {
            const dirtColorObj = new THREE.Color(this.dirtColor);
            dirtColorObj.multiplyScalar(0.7); // Make dirt darker for better visual contrast
            child.material.color.copy(dirtColorObj);
          }
          // Default case - apply ground color
          else {
            child.material.color.setHex(groundColor);
          }
        }
      });
    }
  }
}
