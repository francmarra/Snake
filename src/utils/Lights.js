import { AmbientLight, DirectionalLight, PointLight } from 'three'
import { GRID_WIDTH, GRID_HEIGHT, COLOR_PALETTES } from '../../config/StaticData.js'
import { DEFAULT_SETTINGS } from '../../config/Config.js'

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

// Função para alternar luz ambiente
export function toggleAmbientLight(enabled) {
  ambLight.visible = enabled;
}

// Função para alternar luz direcional
export function toggleDirectionalLight(enabled) {
  dirLight.visible = enabled;
}

// Função para alternar luz pontual
export function togglePointLight(enabled) {
  pointLight.visible = enabled;
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

// Initialize with day theme colors by default
applyThemeLights('day');

// Export individual lights for external access
export { ambLight, dirLight, pointLight }

export default lights
