import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Grass {
  // Static loader and model cache
  static loader = new GLTFLoader();
  static modelPromise = null;
  
  constructor(scene, position, scale = 1, color = 0x184e77) {
    this.scene = scene
    this.position = position
    this.scale = scale
    this.color = color
    this.grass = null

    // Interactive properties
    this.originalRotation = { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    this.originalPosition = position.clone()
    this.isHovered = false
    this.isTrampled = false
    this.trampleTime = 0
    this.swayOffset = Math.random() * Math.PI * 2 // Random phase for swaying
    this.windStrength = 0.5 + Math.random() * 0.5 // Random wind sensitivity
    this.baseScale = { x: scale * 1.3, y: scale * 0.65, z: scale * 1.3 }

    // Mouse interaction setup
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    // Initialize model load promise once
    if (!Grass.modelPromise) {
      Grass.modelPromise = new Promise((resolve, reject) => {
        Grass.loader.load(
          './assets/models/Grass.gltf',
          (gltf) => resolve(gltf.scene),
          null,
          (err) => reject(err)
        );
      });
    }
    this.loadGrass()
  }

  loadGrass() {
    // Use shared modelPromise
    Grass.modelPromise
      .then((baseModel) => {
        this.grass = baseModel.clone(true);

        // Scale the grass - make it shorter but wider to cover more ground
        const heightScale = this.scale * 0.55; // Make grass 50% shorter
        const widthScale = this.scale * 1.3; // Make grass 30% wider for better coverage
        this.grass.scale.set(widthScale, heightScale, widthScale);

        // Store original scale for animations
        this.baseScale = { x: widthScale, y: heightScale, z: widthScale }

        // Position the grass with slight offset and lower Y to ensure ground coverage
        const offsetX = (Math.random() - 0.5) * 0.4; // Random offset for natural variation
        const offsetZ = (Math.random() - 0.5) * 0.4;
        this.grass.position.set(
          this.position.x + offsetX,
          this.position.y - 0.55, // Lower position to ensure it covers the ground
          this.position.z + offsetZ
        );

        // Store original position for animations
        this.originalPosition = this.grass.position.clone()

        // Add slight random rotation for natural variation
        this.originalRotation.y = Math.random() * Math.PI * 2
        this.grass.rotation.y = this.originalRotation.y

        // Enable shadows for all meshes in the grass
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

        // Start interactive animations
        this.startSwaying()
      })
      .catch((error) => {
        console.error('Failed to load grass model:', error);
      });
  }

  // Start natural swaying animation
  startSwaying() {
    const swayGrass = () => {
      if (!this.grass || this.isTrampled) return

      const time = Date.now() * 0.001 // Convert to seconds

      // Natural wind swaying
      const swayAmountX = Math.sin(time * 2 + this.swayOffset) * 0.08 * this.windStrength
      const swayAmountZ = Math.cos(time * 1.5 + this.swayOffset) * 0.05 * this.windStrength

      // Apply swaying rotation (subtle movement at the base)
      this.grass.rotation.x = this.originalRotation.x + swayAmountX
      this.grass.rotation.z = this.originalRotation.z + swayAmountZ

      // Add slight height variation for wind effect
      const heightVariation = Math.sin(time * 3 + this.swayOffset) * 0.02
      this.grass.position.y = this.originalPosition.y + heightVariation

      requestAnimationFrame(swayGrass)
    }

    swayGrass()
  }

  // Hover effect animation
  startHoverEffect() {
    if (!this.grass) return

    // Scale up slightly and brighten
    const targetScale = {
      x: this.baseScale.x * 1.1,
      y: this.baseScale.y * 1.1,
      z: this.baseScale.z * 1.1
    }

    this.animateScale(targetScale, 200)
    this.brightensGrass(1.3)
  }

  // End hover effect
  endHoverEffect() {
    if (!this.grass) return

    this.animateScale(this.baseScale, 300)
    this.brightensGrass(1.0)
  }

  // Trampling effect when snake moves over grass
  trample() {
    if (!this.grass || this.isTrampled) return

    this.isTrampled = true
    this.trampleTime = Date.now()

    // Flatten the grass
    const trampledScale = {
      x: this.baseScale.x * 1.2,
      y: this.baseScale.y * 0.3,
      z: this.baseScale.z * 1.2
    }

    this.animateScale(trampledScale, 100)

    // Slightly tilt the grass
    this.grass.rotation.x = this.originalRotation.x + (Math.random() - 0.5) * 0.4
    this.grass.rotation.z = this.originalRotation.z + (Math.random() - 0.5) * 0.4

    // Darken the grass slightly using current theme color
    this.brightensGrass(0.7)

    // Recover after 2 seconds
    setTimeout(() => {
      this.recover()
    }, 2000)
  }

  // Recover from trampling
  recover() {
    if (!this.grass) return

    this.isTrampled = false

    // Gradually return to normal
    this.animateScale(this.baseScale, 1000)
    this.brightensGrass(1.0)

    // Reset rotation gradually
    const returnToOriginal = () => {
      if (!this.grass) return
  
      this.grass.rotation.x += (this.originalRotation.x - this.grass.rotation.x) * 0.02
      this.grass.rotation.z += (this.originalRotation.z - this.grass.rotation.z) * 0.02
  
      if (Math.abs(this.grass.rotation.x - this.originalRotation.x) > 0.01 ||
          Math.abs(this.grass.rotation.z - this.originalRotation.z) > 0.01) {
        requestAnimationFrame(returnToOriginal)
      }
    }

    returnToOriginal()
  }

  // Wind gust effect
  windGust(direction, strength = 1.0) {
    if (!this.grass || this.isTrampled) return

    const gustRotationX = direction.x * strength * 0.3
    const gustRotationZ = direction.z * strength * 0.3

    // Apply wind rotation
    this.grass.rotation.x = this.originalRotation.x + gustRotationX
    this.grass.rotation.z = this.originalRotation.z + gustRotationZ

    // Return to normal position gradually
    const returnToNormal = () => {
      if (!this.grass) return
  
      this.grass.rotation.x += (this.originalRotation.x - this.grass.rotation.x) * 0.05
      this.grass.rotation.z += (this.originalRotation.z - this.grass.rotation.z) * 0.05
  
      if (Math.abs(this.grass.rotation.x - this.originalRotation.x) > 0.01 ||
          Math.abs(this.grass.rotation.z - this.originalRotation.z) > 0.01) {
        requestAnimationFrame(returnToNormal)
      }
    }

    returnToNormal()
  }

  // Utility function to animate scale
  animateScale(targetScale, duration) {
    if (!this.grass) return

    const startScale = {
      x: this.grass.scale.x,
      y: this.grass.scale.y,
      z: this.grass.scale.z
    }
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic
  
      this.grass.scale.x = startScale.x + (targetScale.x - startScale.x) * easeProgress
      this.grass.scale.y = startScale.y + (targetScale.y - startScale.y) * easeProgress
      this.grass.scale.z = startScale.z + (targetScale.z - startScale.z) * easeProgress
  
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  // Utility function to brighten/darken grass
  brightensGrass(factor) {
    if (!this.grass) return

    this.grass.traverse((child) => {
      if (child.isMesh && child.material) {
        // Always use the current theme color as base, not a cached color
        const baseColor = new THREE.Color(this.color)
        baseColor.multiplyScalar(factor)
        child.material.color.copy(baseColor)
        child.material.needsUpdate = true
      }
    })
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
  
          // If trampled, apply darkening to the new color
          const finalColor = new THREE.Color(color);
          if (this.isTrampled) {
            finalColor.multiplyScalar(0.7);
          }
          
          child.material.color.copy(finalColor);
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
