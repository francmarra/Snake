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
import lights, { toggleAmbientLight, toggleDirectionalLight, togglePointLight, applyThemeLights } from './src/utils/Lights'
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
const resolution = new THREE.Vector2(GRID_WIDTH, GRID_HEIGHT)
const palettes = COLOR_PALETTES

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
// --- Inicialização da cena, grelha e câmara ---
const gridHelper = new THREE.GridHelper(
  resolution.x,
  resolution.y,
  0xffffff,
  0xffffff
)
gridHelper.position.set(resolution.x / 2 - 0.5, -0.49, resolution.y / 2 - 0.5)
gridHelper.material.transparent = true
gridHelper.material.opacity = 0.3

const scene = new THREE.Scene()

// --------- Enhanced Skybox Setup with Horizon Alignment ---------
// Create a dedicated loading manager for skybox textures
const skyboxLoadingManager = new THREE.LoadingManager()
const skyTextureLoader = new THREE.TextureLoader(skyboxLoadingManager)

// Skybox image mapping for different themes
const skyboxImages = {
  day: './assets/images/cloudy_midday_4k.png',
  sunset: './assets/images/cloudy_sunset_4k.png',
  night: './assets/images/cloudy2_night_4k.png'
}

// Cache for preloaded skybox textures
const skyboxTextureCache = {}
let skyboxLoadingPromise = null
let skyBox // Global reference to the skybox for updates

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

    scene.add(skyBox)
  } else {
    // Instantly update existing skybox material
    skyBox.material.map = texture
    skyBox.material.needsUpdate = true
  }
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
scene.add(gridHelper)

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
    snake.body.head.data.fruit = fruit
    addFruit()
      // Only add a bomb if we're below the bombs setting
    const bombsSetting = DEFAULT_SETTINGS.numBombs;
    if (bombs.length < bombsSetting) {
      addBomb();
    }
    
    score += fruit.points
    printScore()
  }

  const bombIndex = bombs.findIndex(
    (bomb) => bomb.getIndexByCoord() === headIndex
  )
  if (bombIndex >= 0) {
    const bomb = bombs[bombIndex]
    scene.remove(bomb.mesh)
    bombs.splice(bombIndex, 1)
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
  window.addEventListener('keydown', function (e) {
    const keyCode = e.code;
    const isMovementKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(keyCode);
    const settingsSidebar = document.getElementById('settings-sidebar');
    
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

  // Wait for the player to press a movement key before starting again
  // gameStarted stays true, but the snake won't move until a key is pressed

  let fruit = candies.pop()
  while (fruit) {
    scene.remove(fruit.mesh)
    fruit = candies.pop()
  }

  let bomb = bombs.pop()
  while (bomb) {
    scene.remove(bomb.mesh)
    bomb = bombs.pop()
  }

  let entity = entities.pop()
  while (entity) {
    scene.remove(entity.mesh)
    entity = entities.pop()
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

function addFruit() {
  const fruit = new Fruit(resolution, selectedPalette.fruitColor)
  let index = getFreeIndex()
  fruit.mesh.position.x = index % resolution.x
  fruit.mesh.position.z = Math.floor(index / resolution.x)
  candies.push(fruit)
  fruit.in()
  scene.add(fruit.mesh)
}

function addBomb() {
  // Remove the bombs.length === 0 condition to allow multiple bombs
  const bomb = new Bomb(resolution)
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
  let index
  let fruitIndexes = candies.map((fruit) => fruit.getIndexByCoord())
  let entityIndexes = entities.map((entity) => entity.getIndexByCoord())
  let bombIndexes = bombs.map((bomb) => bomb.getIndexByCoord())

  do {
    index = Math.floor(Math.random() * resolution.x * resolution.y)
  } while (
    snake.indexes.includes(index) ||
    fruitIndexes.includes(index) ||
    entityIndexes.includes(index) ||
    bombIndexes.includes(index)
  )

  return index
}

function addEntity() {
  const entityType = Math.random()
  let entity
  
  if (entityType < 0.4) {
    entity = new Rock(resolution, selectedPalette.rockColor)
  } else if (entityType < 0.7) {
    entity = new Tree(resolution, selectedPalette.treeColor)
  } else if (entityType < 0.85) {
    entity = new Flower(resolution, selectedPalette.flowerPetalColor, selectedPalette.flowerCenterColor)
  } else {
    entity = new Mushroom(
      resolution, 
      selectedPalette.mushroomCapColor, 
      0xF5DEB3, // Stem color stays constant
      selectedPalette.mushroomSpotColor
    )
  }

  let index = getFreeIndex()

  entity.mesh.position.x = index % resolution.x
  entity.mesh.position.z = Math.floor(index / resolution.x)

  entities.push(entity)
  scene.add(entity.mesh)
}

function generateEntities() {
  for (let i = 0; i < NUM_ENTITIES; i++) {
    addEntity()
  }

  entities.sort((a, b) => {
    const c = new THREE.Vector3(
      resolution.x / 2 - 0.5,
      0,
      resolution.y / 2 - 0.5
    )

    const distanceA = a.position.clone().sub(c).length()
    const distanceB = b.position.clone().sub(c).length()

    return distanceA - distanceB
  })
  animateEntitiesIn(entities)
}

generateEntities()

scene.add(...lights)

// Add static trees
const tree = new Tree(resolution)
TREE_DATA.forEach(([x, y, z, w]) => {
  let clone = tree.mesh.clone()
  clone.position.set(x, y, z)
  clone.scale.setScalar(w)
  scene.add(clone)
})

// Add static rocks
const rock = new Rock(resolution)
ROCK_DATA.forEach(([posArr, scaleArr]) => {
  let clone = new Rock(resolution).mesh
  clone.position.set(...posArr)
  clone.scale.set(...scaleArr.slice(0, 3))
  clone.rotation.y = scaleArr[3]
  scene.add(clone)
})

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
    
    // Show settings tab after game starts with a slight delay
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab) {
      setTimeout(() => animateSettingsTab(settingsTab, true), 1500);
    }
    
    // Initialize minimap
    minimap = new Minimap(GRID_WIDTH, GRID_HEIGHT);
  }
})

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
    }
  }
  
  this.updateIndexes();
  this.updateSegmentScales();
  this.dispatchEvent({ type: 'updated' });
};

applyPalette(paletteName)

// --------- Main Render Loop ---------
// --- Ciclo principal de renderização ---
function tic() {
  // Update camera controller
  cameraController.update(gameStarted)
  
  // Update active camera reference
  activeCamera = cameraController.activeCamera
  
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
