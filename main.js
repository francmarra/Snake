// --------- Imports ---------
import './style.css'
import * as THREE from 'three'
import Snake from './src/components/Snake'
import Fruit from './src/components/Fruit'
import Rock from './src/components/Rock'
import Tree from './src/components/Tree'
import Flower from './src/components/Flower'
import Mushroom from './src/components/Mushroom'
import Fence from './src/components/Fence'
import Grass from './src/components/Grass'
import lights, { toggleAmbientLight, toggleDirectionalLight, togglePointLight, applyThemeLights, areAllLightsOff, setLightChangeCallback } from './src/utils/Lights'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import Entity from './src/components/Entity'
import Bomb from './src/components/Bomb'
import { MOVEMENT_SPEED, NUM_ENTITIES, DEFAULT_SETTINGS } from './config/Config.js'
import { AudioController } from './managers/AudioManager.js'
import { CameraController } from './managers/CameraManager.js'
import { initializeSettings, UIController } from './managers/SettingsManager'
import Minimap from './src/components/Minimap.js';
import Island from './src/components/Island.js';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  COLOR_PALETTES,
  TREE_DATA,
  ROCK_DATA,
  FLOWER_DATA,
  MUSHROOM_DATA,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR
} from './config/StaticData.js'
import { 
  animateButtonIn, 
  animateButtonOut, 
  animateSettingsTab,
  animateEntitiesIn,
  animateMinimapIn,
  animateCameraPosition,
  animateButtonClick,
  animatePaletteSelectors,
  animateSettingsGear 
} from './src/utils/Animations.js';

// --------- Font Loader & Score Initialization ---------
// Carrega a fonte para o texto da pontuação
const loader = new FontLoader()
let font
loader.load(fontSrc, (loadedFont) => {
  font = loadedFont
  printScore()
})

// --------- Color Palette and Helper Functions ---------
// --- Paletas de cores e seleção ---
const resolution = new THREE.Vector2(GRID_WIDTH, GRID_HEIGHT);
const palettes = COLOR_PALETTES
const gridTotal = resolution.x * resolution.y;  // Precompute total cells early

// Function to load theme from localStorage
function loadThemeFromStorage() {
  try {
    const savedTheme = localStorage.getItem('snakeGameTheme')
    if (savedTheme && palettes[savedTheme]) {
      return savedTheme
    }
  } catch (error) {
    console.warn('Could not load theme from localStorage:', error)
  }
  return 'day' // Default fallback
}

// Function to save theme to localStorage
function saveThemeToStorage(themeName) {
  try {
    localStorage.setItem('snakeGameTheme', themeName)
  } catch (error) {
    console.warn('Could not save theme to localStorage:', error)
  }
}

let paletteName = loadThemeFromStorage() // Load theme from localStorage
let selectedPalette = palettes[paletteName]
const params = { ...selectedPalette }

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// --------- Palette Application Function ---------
// Aplica a paleta de cores selecionada
function applyPalette(name) {
  paletteName = name
  const palette = palettes[name]
  if (!palette) return
    // Save theme to localStorage for persistence
  saveThemeToStorage(name);
  selectedPalette = palette;
    const {
    groundColor,
    grassColor,
    dirtColor,
    rockColor,
    treeColor,
    fruitColor,
    snakeColor,
    mouthColor,
    flowerPetalColor,
    flowerCenterColor,
    mushroomCapColor,
    mushroomSpotColor
  } = palette
    // Update island materials if the island is loaded
  if (island) {
    island.updateColors(groundColor, dirtColor);
  }
  // Update skybox based on theme
  updateSkybox(name)

  // Apply theme lighting
  applyThemeLights(name)

  // Atualiza cor de rochas
  entities.filter((e) => e instanceof Rock).forEach((rock) => {
    rock.mesh.material.color.set(rockColor)
  })
  // Atualiza cor de árvores (folhagem apenas)
  entities.filter((e) => e instanceof Tree).forEach((tree) => {
    tree.foliage.material.color.set(treeColor)
  })
  // Update flower colors to match palette - maintaining green stems and leaves
  entities.filter((e) => e instanceof Flower).forEach((flower) => {
    // Find center (sphere) - it's typically the second child after the stem
    const center = flower.mesh.children.find(child => 
      child.geometry instanceof THREE.SphereGeometry
    );
    
    if (center) {
      // Update the center color
      center.material.color.set(flowerCenterColor);
    }
      // Update all petals (avoiding stems and leaves which are green)
    flower.mesh.children.forEach(child => {
      // Skip stem and leaves which have these green color hex values
      const childColor = child.material?.color?.getHex();
      const isGreenPart = childColor === 0x2d5016 || childColor === 0x228B22;
      
      // If it's not stem or leaves and not the center, it's a petal
      if (child.material && !isGreenPart && child !== center) {
        // Use flowerPetalColor or fall back to fruitColor for backward compatibility
        child.material.color.set(flowerPetalColor || fruitColor);
      }
    });
  })
  
  // Update mushroom colors - maintaining natural stem color
  entities.filter((e) => e instanceof Mushroom).forEach((mushroom) => {
    // Find the cap (sphere) and update its color
    const cap = mushroom.mesh.children.find(child => 
      child.geometry instanceof THREE.SphereGeometry
    );
    
    if (cap) {
      cap.material.color.set(mushroomCapColor || 0x8B4513);
    }
    
    // Update all spot colors but keep the stem untouched
    mushroom.mesh.children.forEach(child => {
      // Skip the stem which is a cylinder but taller than spots (spots are very thin cylinders)
      if (child.geometry instanceof THREE.CylinderGeometry && 
          child !== cap && 
          child.geometry.parameters.height <= 0.01) { // Only thin cylinders (spots)
        child.material.color.set(mushroomSpotColor || 0xFFFFFF);
      }
    });
  })
  
  // Update grass colors to match ground color
  if (typeof grassInstances !== 'undefined') {
    grassInstances.forEach((grassInstance) => {
      grassInstance.updateColor(grassColor);
    });
  }
  
  candies[0].mesh.material.color.set(fruitColor)
  snake.body.head.data.mesh.material.color.set(snakeColor)
  snake.mouth.material.color.set(mouthColor)
  updateSnakeSegmentsUI()

  btnPlayImg.src = `/assets/images/themes/${name.toLowerCase()}/${capitalize(name)}Play.svg`;    // Update minimap theme and colors
  const minimapContainer = document.getElementById('minimap-container');
  if (minimapContainer) {
    minimapContainer.classList.remove('theme-day', 'theme-sunset', 'theme-night');
    minimapContainer.classList.add(`theme-${name.toLowerCase()}`);
  }
    // Update minimap with new palette colors if it exists
  if (minimap && gameStarted) {
    minimap.update(snake, candies, bombs, selectedPalette);
  }
}

// --------- Scene, Grid, Renderer, and Camera Setup ---------
// Remove grid helper to disable grid display
// const gridHelper = new THREE.GridHelper(
//   resolution.x,
//   resolution.y,
//   0xffffff,
//   0xffffff
// )
// gridHelper.position.set(resolution.x / 2 - 0.5, -0.49, resolution.y / 2 - 0.5)
// gridHelper.material.transparent = true
// gridHelper.material.opacity = 0.3

const scene = new THREE.Scene()

// --------- Enhanced Skybox Setup with Horizon Alignment ---------
// Create a dedicated loading manager for skybox textures
const skyboxLoadingManager = new THREE.LoadingManager()
const skyTextureLoader = new THREE.TextureLoader(skyboxLoadingManager)

// Skybox image mapping for different themes - using centralized paths from StaticData.js
const skyboxImages = {
  day: COLOR_PALETTES.day.skyboxPath,
  sunset: COLOR_PALETTES.sunset.skyboxPath,
  night: COLOR_PALETTES.night.skyboxPath
}

// Cache for preloaded skybox textures
const skyboxTextureCache = {}
let skyboxLoadingPromise = null
let skyBox // Global reference to the skybox for updates
let skyboxOverlay // Global reference to the dark overlay

// Set up loading manager callbacks
skyboxLoadingManager.onLoad = () => {
  console.log('All skybox textures loaded successfully')
}

skyboxLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  console.log(`Loading skybox textures: ${itemsLoaded}/${itemsTotal} - ${url}`)
}

skyboxLoadingManager.onError = (url) => {
  console.error(`Failed to load skybox texture: ${url}`)
}

// Function to preload all skybox textures
function preloadSkyboxTextures() {
  if (skyboxLoadingPromise) return skyboxLoadingPromise

  const loadPromises = Object.entries(skyboxImages).map(([theme, imagePath]) => {
    return new Promise((resolve, reject) => {
      const texture = skyTextureLoader.load(
        imagePath,
        () => {
          // Configure texture settings
          texture.mapping = THREE.EquirectangularReflectionMapping
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          
          // Cache the texture
          skyboxTextureCache[theme] = texture
          console.log(`Skybox texture cached: ${theme}`)
          resolve(texture)
        },
        undefined, // onProgress
        (error) => {
          console.error(`Failed to load skybox texture: ${theme}`, error)
          reject(error)
        }
      )
    })
  })

  skyboxLoadingPromise = Promise.all(loadPromises)
  return skyboxLoadingPromise
}

// Function to create or update skybox (now instant with preloaded textures)
function updateSkybox(themeName) {
  const texture = skyboxTextureCache[themeName] || skyboxTextureCache.day
  
  if (!texture) {
    console.warn(`Skybox texture not loaded for theme: ${themeName}, falling back to loading on demand`)
    // Fallback: load on demand if not preloaded
    const imagePath = skyboxImages[themeName] || skyboxImages.day
    const fallbackTexture = skyTextureLoader.load(imagePath, () => {
      if (skyBox) {
        skyBox.material.map = fallbackTexture
        skyBox.material.needsUpdate = true
      }
    })
    fallbackTexture.mapping = THREE.EquirectangularReflectionMapping
    fallbackTexture.wrapS = THREE.RepeatWrapping
    fallbackTexture.wrapT = THREE.ClampToEdgeWrapping
    return
  }

  // Create skybox if it doesn't exist
  if (!skyBox) {
    const skyGeometry = new THREE.SphereGeometry(500, 60, 40)
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      fog: false
    })

    skyBox = new THREE.Mesh(skyGeometry, skyMaterial)

    // Position the skybox to align horizon with your ground plane
    skyBox.position.set(resolution.x / 2 - 0.5, -50, resolution.y / 2 - 0.5)
    skyBox.rotation.y = Math.PI

    scene.add(skyBox)  } else {
    // Instantly update existing skybox material
    skyBox.material.map = texture
    skyBox.material.needsUpdate = true
  }
}

// Function to create or update skybox dark overlay
function updateSkyboxOverlay(darken = false) {
  if (!skyboxOverlay && darken) {
    // Create the overlay if it doesn't exist and we need to darken
    const overlayGeometry = new THREE.SphereGeometry(499, 60, 40) // Slightly smaller than skybox
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7, // Adjust this value to control darkness (0.0 = no effect, 1.0 = completely black)
      side: THREE.BackSide,
      fog: false
    })

    skyboxOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
    
    // Position the overlay same as skybox
    skyboxOverlay.position.set(resolution.x / 2 - 0.5, -50, resolution.y / 2 - 0.5)
    skyboxOverlay.rotation.y = Math.PI

    scene.add(skyboxOverlay)  } else if (skyboxOverlay) {
    // Update existing overlay visibility
    skyboxOverlay.visible = darken
  }
}

// Function to check lighting state and update skybox overlay
function updateSkyboxLighting() {
  const allLightsOff = areAllLightsOff()
  updateSkyboxOverlay(allLightsOff)
}

// Start preloading skybox textures immediately
preloadSkyboxTextures().then(() => {
  console.log('All skybox textures preloaded and ready for instant switching')
  // Initialize skybox with default theme once textures are loaded
  updateSkybox(paletteName)
}).catch((error) => {
  console.error('Failed to preload some skybox textures:', error)
  // Fallback: try to initialize with default theme anyway
  updateSkybox(paletteName)
})
// scene.add(gridHelper)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// --------- Camera Positioning Adjustments ---------
const initialPosition = new THREE.Vector3(resolution.x / 2 + 5, 3, resolution.y / 2 + 4)
const finalPosition = new THREE.Vector3((resolution.x / 2) - 8, (resolution.x / 2) + 3, resolution.y + 9)

const renderer = new THREE.WebGLRenderer({
  antialias: window.devicePixelRatio < 2,
  logarithmicDepthBuffer: true,
})

// Initialize camera controller
const cameraController = new CameraController(resolution, sizes, renderer, initialPosition, finalPosition)
let activeCamera = cameraController.activeCamera

document.body.appendChild(renderer.domElement)
handleResize()

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap

// --------- Plane and Minimap Initialization ---------
// Initialize the minimap
let minimap = null;

// Initialize the island
let island = new Island(scene, resolution, params.groundColor, params.dirtColor);

// --------- Snake Initialization and Game Logic ---------
const snake = new Snake({
  scene,
  resolution,
  color: selectedPalette.snakeColor,
  mouthColor: selectedPalette.mouthColor,
})

snake.addEventListener('updated', function () {
  if (snake.checkSelfCollision() || snake.checkEntitiesCollision(entities)) {
    snake.die()
    resetGame()
  }

  const headIndex = snake.indexes.at(-1)
  const fruitIndex = candies.findIndex(
    (fruit) => fruit.getIndexByCoord() === headIndex
  )
  if (fruitIndex >= 0) {
    const fruit = candies[fruitIndex]
    scene.remove(fruit.mesh)
    candies.splice(fruitIndex, 1)
    fruit.mesh.visible = false
    fruitPool.push(fruit)
    snake.body.head.data.fruit = fruit
    addFruit()
  }

  const bombIndex = bombs.findIndex(
    (bomb) => bomb.getIndexByCoord() === headIndex
  )
  if (bombIndex >= 0) {
    const bomb = bombs[bombIndex]
    scene.remove(bomb.mesh)
    bombs.splice(bombIndex, 1)
    bomb.mesh.visible = false
    bombPool.push(bomb)
     if (snake.body.end !== snake.body.head) {
       const tail = snake.body.end
       scene.remove(tail.data.mesh)
       snake.body.end = tail.prev
       snake.body.end.next = null
       snake.indexes.pop()
       if (snake.indexes.length <= 2) {
         snake.die()
         resetGame()
         return
       }    }
     score = Math.max(0, score - bomb.points)
       // Only add a new bomb if we're below the bombs setting
     const bombsSetting = DEFAULT_SETTINGS.numBombs;
     if (bombs.length < bombsSetting) {
       addBomb();
     }
     
     printScore()
   }
})

function updateSnakeSegmentsUI() {
  const container = document.getElementById('segments-container')
  const counter = document.getElementById('segments-counter')

  container.innerHTML = ''
  const hex = '#' + snake.body.head.data.mesh.material.color.getHexString()
  const count = snake.indexes.length

  for (let i = 0; i < count; i++) {
    const cube = document.createElement('div')
    cube.className = 'w-4 h-4 rounded-sm'
    cube.style.backgroundColor = hex
    container.appendChild(cube)
  }
  counter.textContent = count
}

updateSnakeSegmentsUI()
snake.addEventListener('updated', updateSnakeSegmentsUI)

let score = 0
let scoreEntity

// --------- Score Rendering Function ---------
function printScore() {
  if (!font) {
    return
  }

  if (!score) {
    score = 0
  }

  if (scoreEntity) {
    scene.remove(scoreEntity.mesh)
    scoreEntity.mesh.geometry.dispose()
    scoreEntity.mesh.material.dispose()
  }

  const geometry = new TextGeometry(`${score}`, {
    font: font,
    size: 3,
    height: 1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 5,
  })

  geometry.center()

  const mesh = new THREE.Mesh(geometry, snake.body.head.data.mesh.material)

  mesh.position.x = resolution.x / 2 - 0.5
  mesh.position.z = -4
  mesh.position.y = 1.8

  mesh.castShadow = true

  scoreEntity = new Entity(mesh, resolution, { size: 0.8, number: 0.3 })
  scoreEntity.in()
  scene.add(scoreEntity.mesh)
}

// --------- Event Listeners ---------
function registerEventListener() {
  // Mouse movement tracking for grass interaction
  window.addEventListener('mousemove', function(e) {
    mousePosition.x = e.clientX
    mousePosition.y = e.clientY
  })
  
  window.addEventListener('keydown', function (e) {
    const keyCode = e.code;
    const isMovementKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(keyCode);
    const settingsSidebar = document.getElementById('settings-sidebar');
      // Manual wind gust trigger (G key)
    if (keyCode === 'KeyG' && gameStarted) {
      triggerWindGust()
      console.log('🌬️ Manual wind gust triggered! Watch the grass sway.')
      return
    }
    
    // If settings are open, ignore key input for settings changes
    if (settingsSidebar && settingsSidebar.classList.contains('open')) {
      // If the key is meant to start the game, close settings and start game without updating direction
      if (keyCode === 'Space' || (!isRunning && isMovementKey && gameStarted)) {
        closeSettings();
        if (keyCode === 'Space') {
          !isRunning ? startGame() : stopGame();
        } else if (!isRunning && isMovementKey && gameStarted) {
          startGame();
        }
      }
      return; // Do not update the snake or settings values
    }
    
    // Update snake direction if settings are not being shown
    snake.setDirection(keyCode);
    
    if (keyCode === 'Space') {
      !isRunning ? startGame() : stopGame();
    } else if (!isRunning && isMovementKey && gameStarted) {
      startGame();
    }
    
    // Hide settings tab and sidebar when snake moves
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab) {
      animateSettingsTab(settingsTab, false);
    }
    if (settingsSidebar && settingsSidebar.classList.contains('open')) {
      closeSettings();
    }
  });
}

// Helper function to close settings and blur all inputs
function closeSettings() {
  uiController.closeSettings()
}

let isRunning

function startGame() {
  if (!snake.isMoving) {
    // Ensure camera rotation is disabled when snake starts moving
    cameraController.stopRotation()
    
    // Hide settings tab when snake starts moving
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab && settingsTab.style.display !== 'none') {
      animateSettingsTab(settingsTab, false);
    }    
    // Use the current slider value to determine moveInterval for snake speed
    const sliderVal = parseInt(document.getElementById('speed-range').value);
    const moveInterval = 300 - (sliderVal * 16);
    isRunning = setInterval(() => {
      snake.update();
    }, moveInterval);
  }
}

// New event listener for dynamic speed changes
document.getElementById('speed-range').addEventListener('input', function() {
  const sliderVal = parseInt(this.value);
  document.getElementById('speed-value').textContent = sliderVal;
  // Update the default setting in case other components rely on it
  DEFAULT_SETTINGS.snakeSpeed = sliderVal;
  // If the game is already running, restart the move interval with the new speed
  if (isRunning) {
    clearInterval(isRunning);
    const newInterval = 300 - (sliderVal * 16);
    isRunning = setInterval(() => {
      snake.update();
    }, newInterval);
  }
});

function stopGame() {
  clearInterval(isRunning)
  isRunning = null
}

function resetGame() {
  stopGame()
  score = 0
  
  // Enable camera rotation again if the player goes back to the main menu
  if (!gameStarted) {
    cameraController.cameraRotationActive = true
  }

  // Remove existing fruits, bombs, and entities returning them to pools
  let fruit
  while (fruit = candies.pop()) {
    scene.remove(fruit.mesh)
    fruit.mesh.visible = false
    fruitPool.push(fruit)
  }

  let bomb
  while (bomb = bombs.pop()) {
    scene.remove(bomb.mesh)
    bomb.mesh.visible = false
    bombPool.push(bomb)
  }

  let entity
  while (entity = entities.pop()) {
    scene.remove(entity.mesh)
    entity.mesh.visible = false
    const type = entity.constructor.name
    if (entityPools[type]) {
      entityPools[type].push(entity)
    }
  }
  // Add entities based on default settings
  const numFruits = DEFAULT_SETTINGS.numFruits;
  const numBombs = DEFAULT_SETTINGS.numBombs;
  const numObjects = DEFAULT_SETTINGS.numObjects;

  for (let i = 0; i < numFruits; i++) {
    addFruit();
  }
  
  for (let i = 0; i < numBombs; i++) {
    addBomb();
  }
    for (let i = 0; i < numObjects; i++) {
    addEntity();
  }
  
  // Reset all grass instances to their original state
  resetGrassStates();
  
    // Show settings tab after reset
  const settingsTab = document.getElementById('settings-tab');
  if (settingsTab) {
    settingsTab.classList.remove('theme-green', 'theme-lilac', 'theme-orange');
    settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`);
    animateSettingsTab(settingsTab, true);
  }
    // Update minimap visibility based on settings
  const showMinimap = document.getElementById('show-minimap').checked;
  const minimapContainer = document.getElementById('minimap-container');
  if (minimapContainer) {
    if (showMinimap) {
      minimapContainer.style.display = 'block';
    } else {
      minimapContainer.style.display = 'none';
    }
  }
}

// --------- Entity, Fruit, Bomb, and Object Functions ---------
const candies = []
const bombs = []
const entities = []

// Add object pools for fruits, bombs, and entities
const fruitPool = []
const bombPool = []
const entityPools = { Rock: [], Tree: [], Flower: [], Mushroom: [] }

function addFruit() {
  let fruit
  if (fruitPool.length > 0) {
    fruit = fruitPool.pop()
    // Reset properties
    fruit.points = Math.floor(Math.random() * 3) + 1
    fruit.mesh.scale.setScalar(0.5 + (fruit.points * 0.5) / 3)
    fruit.mesh.material.color.set(selectedPalette.fruitColor)
    fruit.mesh.visible = true
  } else {
    fruit = new Fruit(resolution, selectedPalette.fruitColor)
  }
  let index = getFreeIndex()
  fruit.mesh.position.x = index % resolution.x
  fruit.mesh.position.z = Math.floor(index / resolution.x)
  candies.push(fruit)
  fruit.in()
  scene.add(fruit.mesh)
}

function addBomb() {
  let bomb
  if (bombPool.length > 0) {
    bomb = bombPool.pop()
    // Reset properties
    bomb.points = Math.floor(Math.random() * 3) + 1
    bomb.mesh.scale.setScalar(0.5 + (bomb.points * 0.5) / 3)
    bomb.mesh.visible = true
  } else {
    bomb = new Bomb(resolution)
  }
  let index = getFreeIndex()
  bomb.mesh.position.x = index % resolution.x
  bomb.mesh.position.z = Math.floor(index / resolution.x)
  bombs.push(bomb)
  bomb.in()
  scene.add(bomb.mesh)
}

addFruit()
addBomb()

function getFreeIndex() {
  // Use a Set for faster occupancy checks
  const occupied = new Set([
    ...snake.indexes,
    ...candies.map((f) => f.getIndexByCoord()),
    ...entities.map((e) => e.getIndexByCoord()),
    ...bombs.map((b) => b.getIndexByCoord()),
  ]);
  let index;
  do {
    index = Math.floor(Math.random() * gridTotal);
  } while (occupied.has(index));
  return index;
}

// Precompute center for sorting entities
const entitySortCenter = new THREE.Vector3(resolution.x / 2 - 0.5, 0, resolution.y / 2 - 0.5);

function addEntity() {
  const rand = Math.random()
  let EntityClass, key
  if (rand < 0.4) { EntityClass = Rock; key = 'Rock' }
  else if (rand < 0.7) { EntityClass = Tree; key = 'Tree' }
  else if (rand < 0.85) { EntityClass = Flower; key = 'Flower' }
  else { EntityClass = Mushroom; key = 'Mushroom' }

  let entity
  if (entityPools[key] && entityPools[key].length > 0) {
    entity = entityPools[key].pop()
    entity.mesh.visible = true
    // Update color if needed
    if (entity.updateFoliageColor && key === 'Tree') entity.updateFoliageColor(selectedPalette.treeColor)
  } else {
    const colorArgs = {
      Rock: [resolution, selectedPalette.rockColor],
      Tree: [resolution, selectedPalette.treeColor],
      Flower: [resolution, selectedPalette.flowerPetalColor, selectedPalette.flowerCenterColor],
      Mushroom: [resolution, selectedPalette.mushroomCapColor, 0xF5DEB3, selectedPalette.mushroomSpotColor]
    }
    entity = new EntityClass(...colorArgs[key])
  }
  let index = getFreeIndex()
  entity.mesh.position.x = index % resolution.x
  entity.mesh.position.z = Math.floor(index / resolution.x)

  entities.push(entity)
  scene.add(entity.mesh)
}

function generateEntities() {
  for (let i = 0; i < NUM_ENTITIES; i++) {
    addEntity();
  }

  entities.sort((a, b) => {
    const da = a.mesh.position.distanceToSquared(entitySortCenter);
    const db = b.mesh.position.distanceToSquared(entitySortCenter);
    return da - db;
  });
  animateEntitiesIn(entities)
}

generateEntities()

scene.add(...lights)

// Set up the callback for light changes to update skybox overlay
setLightChangeCallback(updateSkyboxLighting)

// Initialize skybox lighting state
updateSkyboxLighting()

// Add static trees
const tree = new Tree(resolution)
TREE_DATA.forEach(([x, y, z, w]) => {
  let clone = tree.mesh.clone()
  clone.position.set(x, y, z)
  clone.scale.setScalar(w)
  scene.add(clone)
})

// Add static rocks via instanced mesh
{
  const rockProto = new Rock(resolution)
  const rockGeometry = rockProto.mesh.geometry
  const rockMaterial = rockProto.mesh.material
  const rockInstances = new THREE.InstancedMesh(rockGeometry, rockMaterial, ROCK_DATA.length)
  const matrix = new THREE.Matrix4()
  ROCK_DATA.forEach(([posArr, scaleArr], i) => {
    const position = new THREE.Vector3(...posArr)
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, scaleArr[3], 0))
    const scale = new THREE.Vector3(scaleArr[0], scaleArr[1], scaleArr[2])
    matrix.compose(position, quaternion, scale)
    rockInstances.setMatrixAt(i, matrix)
  })
  rockInstances.instanceMatrix.needsUpdate = true
  scene.add(rockInstances)
}

// Add static flowers
FLOWER_DATA.forEach(([x, y, z, scale, color]) => {
  // Use specified petal color or theme's petal color, and use the theme's center color
  const flower = new Flower(
    resolution, 
    color || selectedPalette.flowerPetalColor,
    selectedPalette.flowerCenterColor
  )
  flower.mesh.position.set(x, y, z)
  flower.mesh.scale.setScalar(scale)
  scene.add(flower.mesh)
})

// Add static mushrooms
MUSHROOM_DATA.forEach(([x, y, z, scale, capColor, stemColor]) => {
  // Use specified cap color or theme's cap color, and specified stem color or default
  // Also add the theme's spot color
  const mushroom = new Mushroom(
    resolution,
    capColor || selectedPalette.mushroomCapColor,
    stemColor || 0xF5DEB3, // Stem color stays natural regardless of theme
    selectedPalette.mushroomSpotColor
  )
  mushroom.mesh.position.set(x, y, z)
  mushroom.mesh.scale.setScalar(scale)
  scene.add(mushroom.mesh)
})

// Add static grass instances
const grassInstances = []

function generateGrass() {
  // Generate dense grass coverage to completely hide the ground
  const totalCells = resolution.x * resolution.y
  
  // Get all occupied positions to avoid conflicts with game objects
  let occupiedIndexes = new Set([
    ...snake.indexes,
    ...candies.map(fruit => fruit.getIndexByCoord()),
    ...entities.map(entity => entity.getIndexByCoord()),
    ...bombs.map(bomb => bomb.getIndexByCoord())
  ])
  
  // First pass: Fill every available cell with grass
  for (let index = 0; index < totalCells; index++) {
    // Skip if position is occupied by game objects
    if (occupiedIndexes.has(index)) {
      continue
    }
    
    const x = index % resolution.x
    const z = Math.floor(index / resolution.x)
    const y = 0
    
    // Random scale for variety
    const scale = 0.6 + Math.random() * 0.4
    
    const grassPosition = new THREE.Vector3(x, y, z)
    const grassInstance = new Grass(
      scene,
      grassPosition,
      scale,
      selectedPalette.groundColor
    )
    grassInstances.push(grassInstance)
  }
  
  // Second pass: Add overlapping grass instances for complete coverage
  const overlapCount = Math.floor(totalCells * 0.4) // 40% additional coverage
  for (let i = 0; i < overlapCount; i++) {
    const index = Math.floor(Math.random() * totalCells)
    
    // Skip if position has game objects
    if (occupiedIndexes.has(index)) {
      continue
    }
    
    const x = index % resolution.x
    const z = Math.floor(index / resolution.x)
    const y = 0
    
    // Smaller grass instances for filling gaps
    const scale = 0.4 + Math.random() * 0.3
    
    const grassPosition = new THREE.Vector3(x, y, z)
    const grassInstance = new Grass(
      scene,
      grassPosition,
      scale,
      selectedPalette.groundColor
    )
    grassInstances.push(grassInstance)
  }
    console.log(`Generated ${grassInstances.length} grass instances for complete ground coverage`)
}

// --------- Grass Management Functions ---------
// Function to trigger wind gust across all grass instances
function triggerWindGust() {
  if (!grassInstances || grassInstances.length === 0) return
  
  const windDirection = {
    x: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2
  }
  const windStrength = 0.8 + Math.random() * 0.4
  
  grassInstances.forEach(grassInstance => {
    grassInstance.windGust(windDirection, windStrength)
  })
  
  console.log(`Wind gust triggered: direction(${windDirection.x.toFixed(2)}, ${windDirection.z.toFixed(2)}), strength: ${windStrength.toFixed(2)}`)
}

// Function to update all grass hover interactions
function updateGrassHoverInteractions() {
  if (!grassInstances || grassInstances.length === 0 || !gameStarted) return
  
  // Performance optimization: only update if mouse has moved significantly
  const mouseMoveThreshold = 5 // pixels
  if (mousePosition.lastX !== undefined && mousePosition.lastY !== undefined) {
    const deltaX = Math.abs(mousePosition.x - mousePosition.lastX)
    const deltaY = Math.abs(mousePosition.y - mousePosition.lastY)
    if (deltaX < mouseMoveThreshold && deltaY < mouseMoveThreshold) {
      return // Skip update if mouse hasn't moved enough
    }
  }
  
  grassInstances.forEach(grassInstance => {
    grassInstance.onMouseHover(activeCamera, mousePosition)
  })
  
  // Store last mouse position for next frame
  mousePosition.lastX = mousePosition.x
  mousePosition.lastY = mousePosition.y
}

// Function to reset all grass instances to their original state
function resetGrassStates() {
  if (!grassInstances || grassInstances.length === 0) return
  
  grassInstances.forEach(grassInstance => {
    if (grassInstance.isTrampled) {
      // Force immediate recovery for reset
      grassInstance.isTrampled = false
      grassInstance.isHovered = false
      
      if (grassInstance.grass) {
        // Reset scale
        grassInstance.grass.scale.set(
          grassInstance.baseScale.x,
          grassInstance.baseScale.y,
          grassInstance.baseScale.z
        )
        
        // Reset rotation
        grassInstance.grass.rotation.set(
          grassInstance.originalRotation.x,
          grassInstance.originalRotation.y,
          grassInstance.originalRotation.z
        )
        
        // Reset brightness
        grassInstance.brightensGrass(1.0)
      }
    }
  })
  
  console.log(`Reset ${grassInstances.length} grass instances to original state`)
}

generateGrass()

// Add fence around the perimeter - always light brown regardless of theme
const fence = new Fence(resolution) // Use default light brown colors defined in the Fence class
fence.addToScene(scene)

// --------- Audio and Control Buttons Setup ---------
// Initialize audio and UI controllers
const audioController = new AudioController(paletteName, capitalize)
const uiController = new UIController(paletteName, capitalize)

// Audio and button references for backwards compatibility
const audio = audioController.audio
const btnVolume = audioController.btnVolume
const btnPlay = document.getElementById('btn-play')
const btnPlayImg = document.getElementById('btn-play-img')
const btnSettings = document.getElementById('btn-settings')
const btnSettingsImg = document.getElementById('btn-settings-img')


// Play button animation
animateButtonIn(btnPlay);
// Animate settings button in sync with play button
if (btnSettings) {
  animateButtonIn(btnSettings);
}

let gameStarted = false
// Make gameStarted globally accessible
window.gameStarted = false

btnPlay.addEventListener('click', function () {
  if (!gameStarted) {
    gameStarted = true
    window.gameStarted = true // Update global reference
    
    // Stop camera rotation when game starts
    cameraController.stopRotation()
    
    // Handle audio initialization and play
    audioController.playAudio()
    
    // Enhanced minimap animation with smoother timing
    const minimapContainer = document.getElementById('minimap-container');
    const showMinimap = document.getElementById('show-minimap').checked;
    if (showMinimap) {
      animateMinimapIn(minimapContainer);
    } else {
      minimapContainer.style.display = 'none';
    }
      animateCameraPosition(cameraController.camera, finalPosition)
    animateButtonOut(this)
    if (btnSettings) {
      animateButtonOut(btnSettings)
      // Close settings sidebar if it's open
      uiController.closeSettings()
    }
    
    // Show camera button using camera controller
    cameraController.showCameraButton()
    
    // Register event listener but don't start the snake movement yet
    // The snake will start moving when the player presses a movement key
    registerEventListener()
    
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab) {
      setTimeout(() => animateSettingsTab(settingsTab, true), 1500);
    }
    
    minimap = new Minimap(GRID_WIDTH, GRID_HEIGHT);
  }
});

btnPlay.addEventListener('mouseenter', function () {
  this.style.transform = 'translate(-50%, -50%) scale(1.15)';
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)';
});
btnPlay.addEventListener('mouseleave', function () {
  this.style.transform = 'translate(-50%, -50%) scale(1)';
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)';
});

btnSettings.addEventListener('mouseenter', function () {
  this.style.transform = 'translate(-50%, -50%) scale(1.15)';
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)';
});
btnSettings.addEventListener('mouseleave', function () {
  this.style.transform = 'translate(-50%, -50%) scale(1)';
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)';
});

// Set up audio with proper initial values - handled by AudioController
// btnVolume event listeners - handled by AudioController

// Event listener for palette changes
window.addEventListener('paletteChange', (event) => {
  const paletteName = event.detail.paletteName
  applyPalette(paletteName)
  
  // Update controllers with new palette
  audioController.updatePalette(paletteName)
  uiController.updatePaletteTheme(paletteName)
})

const manager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(manager)
const wasd = textureLoader.load('/assets/images/wasd.png')
const arrows = textureLoader.load('/assets/images/arrows.png')
const wasdGeometry = new THREE.PlaneGeometry(3.5, 2)
wasdGeometry.rotateX(-Math.PI * 0.5)
const planeWasd = new THREE.Mesh(
  wasdGeometry,
  new THREE.MeshStandardMaterial({
    transparent: true,
    map: wasd,
    opacity: 0.5,
  })
)
const planeArrows = new THREE.Mesh(
  wasdGeometry,
  new THREE.MeshStandardMaterial({
    transparent: true,
    map: arrows,
    opacity: 0.5,
  })
)
planeArrows.position.set(8.7, 0, 21)
planeWasd.position.set(13, 0, 21)
scene.add(planeArrows, planeWasd)
manager.onLoad = () => {}

// --------- Settings and Palette Update Functions ---------
// Enhanced palette application function
const originalApplyPalette = applyPalette;
applyPalette = function(name) {
  originalApplyPalette(name);
  
  // Update UI controllers with new palette
  if (typeof uiController !== 'undefined') {
    uiController.updatePaletteTheme(name);
    uiController.updateCameraIcon(name);
    uiController.updatePlayIcon(name);
  }
  
  // Update audio controller with new palette
  if (typeof audioController !== 'undefined') {
    audioController.updatePalette(name);
  }
};

// Initialize with current palette
if (typeof uiController !== 'undefined') {
  uiController.updatePaletteTheme(paletteName);
}

initializeSettings(DEFAULT_SETTINGS, scene, addFruit, addBomb, addEntity, candies, bombs, entities, animateSettingsTab, paletteName)

// --------- Snake Update Modification ---------
// Update snake's update method to respect border kill setting
snake.update = function() {
  if (this.newDirection) {
    this.direction = this.newDirection;
    this.newDirection = null;
  }
  let currentNode = this.end;
  if (this.end.data.fruit) {
    this.end.data.fruit = null;
    this.end.data.mesh.scale.setScalar(1);
    this.addTailNode();
  }
  while (currentNode.prev) {
    const fruit = currentNode.prev.data.fruit;
    if (fruit) {
      currentNode.data.fruit = fruit;
      currentNode.data.mesh.scale.setScalar(1.15);
      currentNode.prev.data.fruit = null;
      currentNode.prev.data.mesh.scale.setScalar(1);
    }
    const position = currentNode.prev.data.mesh.position;
    currentNode.data.mesh.position.copy(position);
    currentNode = currentNode.prev;
  }
  const headPos = currentNode.data.mesh.position;
  headPos.add(this.direction);
  const headMesh = this.body.head.data.mesh;
  headMesh.lookAt(headMesh.position.clone().add(this.direction));
    // Check border crossing based on setting
  const killOnBorderTrespass = DEFAULT_SETTINGS.killOnBorderTrespass; // Use default value instead of localStorage
  if (killOnBorderTrespass) {
    if (headPos.z < 0 || headPos.z > this.resolution.y - 1 || 
        headPos.x < 0 || headPos.x > this.resolution.x - 1) {
      this.die();
      resetGame();
      return;
    }
  } else {
    // Original toroidal grid behavior
    if (headPos.z < 0) {
      headPos.z = this.resolution.y - 1;
    } else if (headPos.z > this.resolution.y - 1) {
      headPos.z = 0;
    }
    if (headPos.x < 0) {
      headPos.x = this.resolution.x - 1;
    } else if (headPos.x > this.resolution.x - 1) {
      headPos.x = 0;
    }  }
  
  // --------- Grass Trampling Detection ---------
  // Check if snake segments are trampling grass
  if (typeof grassInstances !== 'undefined' && grassInstances.length > 0) {
    // Get all current snake positions
    const snakePositions = this.indexes.map(index => {
      const x = index % this.resolution.x
      const z = Math.floor(index / this.resolution.x)
      return { x, z }
    })
    
    // Check each grass instance for trampling
    grassInstances.forEach(grassInstance => {
      if (!grassInstance.grass) return
      
      const grassX = Math.round(grassInstance.position.x)
      const grassZ = Math.round(grassInstance.position.z)
      
      // Check if any snake segment is on this grass position
      const isTrampled = snakePositions.some(pos => 
        Math.abs(pos.x - grassX) < 0.5 && Math.abs(pos.z - grassZ) < 0.5
      )
      
      if (isTrampled && !grassInstance.isTrampled) {
        grassInstance.trample()
      }
    })
  }
  
  this.updateIndexes();
  this.updateSegmentScales();
  this.dispatchEvent({ type: 'updated' });
};

applyPalette(paletteName)

// --------- Grass Interaction Variables ---------
let mousePosition = { x: 0, y: 0 }
let lastWindGustTime = 0
const WIND_GUST_INTERVAL = 8000 // Wind gusts every 8 seconds

// --------- Main Render Loop ---------
// --- Ciclo principal de renderização ---
function tic() {
  // Update camera controller
  cameraController.update(gameStarted)
  
  // Update active camera reference
  activeCamera = cameraController.activeCamera
  
  // Update grass interactions if game has started
  if (gameStarted && grassInstances.length > 0) {
    // Handle mouse hover interactions
    updateGrassHoverInteractions()
    
    // Handle periodic wind gusts
    const currentTime = Date.now()
    if (currentTime - lastWindGustTime > WIND_GUST_INTERVAL) {
      triggerWindGust()
      lastWindGustTime = currentTime
    }
  }
  
  renderer.render(scene, activeCamera)
  
  // Update minimap if the game has started, minimap is initialized, and it should be shown
  if (gameStarted && minimap && document.getElementById('show-minimap').checked) {
    minimap.update(snake, candies, bombs, selectedPalette)
  }
  
  requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

// --------- Window Resize Handler ---------
window.addEventListener('resize', handleResize)

function handleResize() {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  
  // Use camera controller for resize handling
  cameraController.handleResize(sizes)
  
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

// Debounce utility to limit frequent calls
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Precompute total grid cells
// const gridTotal = resolution.x * resolution.y;  // Removed duplicate definition

// Replace resize listener with debounced handler
const debouncedResize = debounce(handleResize, 200);
window.addEventListener('resize', debouncedResize);

// --------- Prevent Dragging on UI Elements ---------
// This ensures UI elements can't be dragged by the user
function preventDragging() {
  // Get all UI elements that should not be draggable
  const uiElements = document.querySelectorAll('button, img, .theme-selector, #settings-tab, .settings-sidebar, #minimap-container, canvas');
  
  // Add dragstart event listener to prevent dragging
  uiElements.forEach(element => {
    element.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Prevent text selection when double-clicking
    element.addEventListener('mousedown', (e) => {
      if (e.detail > 1) { // Check for double click
        e.preventDefault();
        return false;
      }
    });
  });
}

// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', preventDragging);

// Test function to verify grass system integration (for debugging)
function testGrassSystem() {
  console.log('🌱 Grass System Integration Test')
  console.log(`- Grass instances created: ${grassInstances.length}`)
  console.log(`- Mouse position tracking: ${mousePosition.x}, ${mousePosition.y}`)
  console.log(`- Game started: ${gameStarted}`)
  console.log(`- Wind gust interval: ${WIND_GUST_INTERVAL}ms`)
  
  if (grassInstances.length > 0) {
    const sampleGrass = grassInstances[0]
    console.log(`- Sample grass loaded: ${sampleGrass.grass !== null}`)
    console.log(`- Sample grass trampled: ${sampleGrass.isTrampled}`)
    console.log(`- Sample grass hovered: ${sampleGrass.isHovered}`)
  }
  
  console.log('✅ Grass system integration test complete')
}

// Make test function available globally for console testing
window.testGrassSystem = testGrassSystem
