import * as THREE from 'three'
import { AmbientLight, DirectionalLight, PointLight } from 'three'
import { GRID_WIDTH, GRID_HEIGHT, COLOR_PALETTES, FIREFLY_DATA } from '../../config/StaticData.js'
import { DEFAULT_SETTINGS } from '../../config/Config.js'
import { startFirefliesAnimation, stopFirefliesAnimation } from './Animations.js'

const ambLight = new AmbientLight(0xffffff, 0.6) // luz branca suave
const dirLight = new DirectionalLight(0xffffff, 0.7) // luz direcional
const pointLight = new PointLight(0xffaa00, 0.8, 40) // luz pontual amarela quente

dirLight.position.set(20, 20, 18)
dirLight.target.position.set(GRID_WIDTH / 2, 0, GRID_HEIGHT / 2)
dirLight.shadow.mapSize.set(1024, 1024)
dirLight.shadow.radius = 7
dirLight.shadow.blurSamples = 20
dirLight.shadow.camera.top = 30
dirLight.shadow.camera.bottom = -30
dirLight.shadow.camera.left = -30
dirLight.shadow.camera.right = 30

dirLight.castShadow = true

// Posiciona a luz pontual numa área diferente para criar sombras e realces interessantes
pointLight.position.set(GRID_WIDTH / 2, 6, GRID_HEIGHT / 2)
pointLight.castShadow = true
pointLight.shadow.mapSize.set(1024, 1024)
pointLight.shadow.radius = 5
pointLight.shadow.bias = -0.005

// Define a visibilidade inicial com base nas definições por defeito
ambLight.visible = DEFAULT_SETTINGS.ambientLightEnabled
dirLight.visible = DEFAULT_SETTINGS.directionalLightEnabled
pointLight.visible = DEFAULT_SETTINGS.pointLightEnabled

const lights = [dirLight, ambLight, pointLight]

// Callback function to notify when lights change (to be set externally)
let lightChangeCallback = null

// Set the callback function
export function setLightChangeCallback(callback) {
  lightChangeCallback = callback
}

// Helper function to call the callback if it exists
function notifyLightChange() {
  if (lightChangeCallback && typeof lightChangeCallback === 'function') {
    lightChangeCallback()
  }
}

// Função para alternar luz ambiente
export function toggleAmbientLight(enabled) {
  ambLight.visible = enabled;
  notifyLightChange()
}

// Função para alternar luz direcional
export function toggleDirectionalLight(enabled) {
  dirLight.visible = enabled;
  notifyLightChange()
}

// Função para alternar luz pontual
export function togglePointLight(enabled) {
  pointLight.visible = enabled;
  
  // If point light is disabled, also disable fireflies
  if (!enabled && firefliesEnabled) {
    toggleFireflies(false)
    // Update the checkbox to reflect the change
    const firefliesCheckbox = document.getElementById('fireflies')
    if (firefliesCheckbox) {
      firefliesCheckbox.checked = false
    }
  }
  
  notifyLightChange()
}

// Firefly system
const fireflies = []
let firefliesEnabled = false

// Function to create fireflies
function createFireflies(scene) {
  if (fireflies.length > 0) return // Already created
  
  FIREFLY_DATA.forEach((data, index) => {
    const [startX, startY, startZ] = data
    
    // Create firefly light
    const fireflyLight = new PointLight(0xffffaa, 0.5, 8, 2)
    fireflyLight.position.set(startX, startY, startZ)
    fireflyLight.castShadow = false // Fireflies don't cast shadows for performance
    
    // Create firefly visual mesh
    const fireflyGeometry = new THREE.SphereGeometry(0.05, 8, 6)
    const fireflyMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.8
    })
    const fireflyMesh = new THREE.Mesh(fireflyGeometry, fireflyMaterial)
    fireflyMesh.position.copy(fireflyLight.position)
    
    fireflies.push({
      light: fireflyLight,
      mesh: fireflyMesh,
      index: index
    })
    
    if (scene) {
      scene.add(fireflyLight)
      scene.add(fireflyMesh)
    }
  })
  
  console.log(`Created ${fireflies.length} fireflies`)
}

// Function to toggle fireflies
export function toggleFireflies(enabled, scene = null) {
  firefliesEnabled = enabled
  
  if (enabled && !pointLight.visible) {
    // Don't enable fireflies if point light is disabled
    firefliesEnabled = false
    return false
  }
  
  if (enabled) {
    // Create fireflies if they don't exist
    if (fireflies.length === 0 && scene) {
      createFireflies(scene)
    }
    
    // Show fireflies
    fireflies.forEach(firefly => {
      firefly.light.visible = true
      firefly.mesh.visible = true
    })
    
    // Start animation
    startFirefliesAnimation(fireflies, FIREFLY_DATA)
    console.log('Fireflies enabled and animated')
  } else {
    // Hide fireflies
    fireflies.forEach(firefly => {
      firefly.light.visible = false
      firefly.mesh.visible = false
    })
    
    // Stop animation
    stopFirefliesAnimation()
    console.log('Fireflies disabled')
  }
  
  notifyLightChange()
  return true
}

// Function to check if fireflies are enabled
export function areFirefliesEnabled() {
  return firefliesEnabled
}

// Function to get fireflies (for scene management)
export function getFireflies() {
  return fireflies
}

// Função para aplicar as cores do tema às luzes
export function applyThemeLights(themeName) {
  const palette = COLOR_PALETTES[themeName];
  if (!palette) {
    console.warn(`Theme "${themeName}" not found, using default light colors`);
    return;
  }

  // Apply theme colors to lights
  ambLight.color.setHex(palette.ambientLightColor);
  dirLight.color.setHex(palette.directionalLightColor);
  pointLight.color.setHex(palette.pointLightColor);
}

// Função para verificar se todas as luzes estão desligadas
export function areAllLightsOff() {
  return !ambLight.visible && !dirLight.visible && !pointLight.visible;
}

// Initialize with day theme colors by default
applyThemeLights('day');

// Export individual lights for external access
export { ambLight, dirLight, pointLight }

export default lights
