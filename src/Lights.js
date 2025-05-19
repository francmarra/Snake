import { AmbientLight, DirectionalLight, PointLight } from 'three'
import { GRID_WIDTH, GRID_HEIGHT } from '../config/StaticData.js'
import { DEFAULT_SETTINGS } from '../config/Config.js'

const ambLight = new AmbientLight(0xffffff, 0.6) // soft white light
const dirLight = new DirectionalLight(0xffffff, 0.7) // directional light
const pointLight = new PointLight(0xffaa00, 0.8, 40) // warm yellow point light

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

// Position the point light in a different area to create interesting shadows and highlights
pointLight.position.set(GRID_WIDTH / 2, 6, GRID_HEIGHT / 2)
pointLight.castShadow = true
pointLight.shadow.mapSize.set(1024, 1024)
pointLight.shadow.radius = 5
pointLight.shadow.bias = -0.005

// Set initial visibility based on default settings
ambLight.visible = DEFAULT_SETTINGS.ambientLightEnabled
dirLight.visible = DEFAULT_SETTINGS.directionalLightEnabled
pointLight.visible = DEFAULT_SETTINGS.pointLightEnabled

const lights = [dirLight, ambLight, pointLight]

// Function to toggle ambient light
export function toggleAmbientLight(enabled) {
  ambLight.visible = enabled;
}

// Function to toggle directional light
export function toggleDirectionalLight(enabled) {
  dirLight.visible = enabled;
}

// Function to toggle point light
export function togglePointLight(enabled) {
  pointLight.visible = enabled;
}

export default lights
