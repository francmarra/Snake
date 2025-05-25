// --------- Imports ---------
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'lil-gui'
import Snake from './src/components/Snake'
import Fruit from './src/components/Fruit'
import Rock from './src/components/Rock'
import Tree from './src/components/Tree'
import Flower from './src/components/Flower'
import Mushroom from './src/components/Mushroom'
import Fence from './src/components/Fence'
import lights, { toggleAmbientLight, toggleDirectionalLight, togglePointLight } from './src/utils/Lights'
import gsap from 'gsap'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import Entity from './src/components/Entity'
import Bomb from './src/components/Bomb'
import { MOVEMENT_SPEED, NUM_ENTITIES, DEFAULT_SETTINGS } from './config/Config.js'
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
import { animateButtonIn, animateButtonOut, animateCameraButtonIn, animateSettingsTab } from './src/utils/Animations.js';
import { initCameras, updateCamerasOnResize } from './managers/CameraManager'
import { muteVolume, unmuteVolume } from './managers/AudioManager'
import { initializeSettings, toggleMinimap } from './managers/SettingsManager'
import Minimap from './src/components/Minimap.js';
import { animateCameraRotation } from './src/utils/CameraRotation.js';

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
let paletteName = 'green' // Default palette, not loaded from localStorage
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
  
  // Don't save to localStorage
  selectedPalette = palette;
  
  const {
    groundColor,
    fogColor,
    rockColor,
    treeColor,
    fruitColor,
    snakeColor,
    mouthColor,
    flowerPetalColor,
    flowerCenterColor,
    mushroomCapColor,
    mushroomSpotColor  } = palette
    // Update ground plane or island materials
  if (groundPlane) {
    // If we're using the fallback plane
    groundPlane.material.color.set(groundColor);
  }
    // Update island materials if the island is loaded
  if (island) {
    island.traverse((child) => {
      if (child.isMesh && child.material) {
        const materialName = child.material.name?.toLowerCase() || '';
        
        // Check if it's likely a grass/top material
        if (materialName.includes('grass') || materialName.includes('top') || child.name?.toLowerCase().includes('grass')) {
          child.material.color.setHex(groundColor);
        }
        // Check if it's likely a dirt/base material
        else if (materialName.includes('dirt') || materialName.includes('base') || materialName.includes('soil')) {
          const darkGroundColor = new THREE.Color(groundColor);
          darkGroundColor.multiplyScalar(0.7); // Make dirt darker
          child.material.color.copy(darkGroundColor);
        }
        // Default case - apply ground color
        else {
          child.material.color.setHex(groundColor);
        }
      }
    });
  }
  // Maintain fog color consistent with skybox instead of theme colors
  // This ensures the skybox and fog blend seamlessly

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
      center.material.color.set(palette.flowerCenterColor);
    }
      // Update all petals (avoiding stems and leaves which are green)
    flower.mesh.children.forEach(child => {
      // Skip stem and leaves which have these green color hex values
      const childColor = child.material?.color?.getHex();
      const isGreenPart = childColor === 0x2d5016 || childColor === 0x228B22;
      
      // If it's not stem or leaves and not the center, it's a petal
      if (child.material && !isGreenPart && child !== center) {
        // Use flowerPetalColor or fall back to fruitColor for backward compatibility
        child.material.color.set(palette.flowerPetalColor || palette.fruitColor);
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
      cap.material.color.set(palette.mushroomCapColor || 0x8B4513);
    }
    
    // Update all spot colors but keep the stem untouched
    mushroom.mesh.children.forEach(child => {
      // Skip the stem which is a cylinder but taller than spots (spots are very thin cylinders)
      if (child.geometry instanceof THREE.CylinderGeometry && 
          child !== cap && 
          child.geometry.parameters.height <= 0.01) { // Only thin cylinders (spots)
        child.material.color.set(palette.mushroomSpotColor || 0xFFFFFF);
      }
    });
  })
  
  candies[0].mesh.material.color.set(fruitColor)
  snake.body.head.data.mesh.material.color.set(snakeColor)
  snake.mouth.material.color.set(mouthColor)
  updateSnakeSegmentsUI()

  btnPlayImg.src = `/assets/images/themes/${name.toLowerCase()}/${capitalize(name)}Play.svg`;
  document.getElementById('btn-toggle-camera-img').src =
    `/assets/images/themes/${name.toLowerCase()}/${capitalize(name)}Camera.svg`;
  document.getElementById('btn-volume-img').src =
    `/assets/images/themes/${name.toLowerCase()}/${capitalize(name)}Audio.svg`;
  const vol = localStorage.getItem('volume');
  if (vol === 'off' || audio.volume === 0) {
    document.getElementById('btn-volume-img').src =
      `/assets/images/themes/${name.toLowerCase()}/${capitalize(name)}NoAudio.svg`;
  }
    // Update minimap theme and colors
  const minimapContainer = document.getElementById('minimap-container');
  if (minimapContainer) {
    minimapContainer.classList.remove('theme-green', 'theme-orange', 'theme-lilac');
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
const skyTextureLoader = new THREE.TextureLoader()
const skyTexture = skyTextureLoader.load('./assets/images/cloudy_midday_8k.png')

// Better mapping for horizon alignment
skyTexture.mapping = THREE.EquirectangularReflectionMapping
skyTexture.wrapS = THREE.RepeatWrapping
skyTexture.wrapT = THREE.ClampToEdgeWrapping

// Create a skybox sphere for better control over horizon alignment
const skyGeometry = new THREE.SphereGeometry(500, 60, 40)
const skyMaterial = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide,
  fog: false
})

const skyBox = new THREE.Mesh(skyGeometry, skyMaterial)

// Position the skybox to align horizon with your ground plane
skyBox.position.set(resolution.x / 2 - 0.5, -50, resolution.y / 2 - 0.5) // Lowered Y position
skyBox.rotation.y = Math.PI // Rotate if needed to align horizon

scene.add(skyBox)
scene.add(gridHelper)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// --------- Camera Positioning Adjustments ---------
const initialPosition = new THREE.Vector3(resolution.x / 2 + 5, 3, resolution.y / 2 + 4)
const finalPosition = new THREE.Vector3((resolution.x / 2) - 8, (resolution.x / 2) + 3, resolution.y + 9)

const { camera, topCamera } = initCameras(resolution, sizes, initialPosition, finalPosition)
let activeCamera = camera

// Camera mode tracking: 0 = perspective, 1 = orthographic, 2 = free orbit
let cameraMode = 0

// Create a third camera for free orbit mode
const orbitCamera = new THREE.PerspectiveCamera(CAMERA_FOV, sizes.width / sizes.height, CAMERA_NEAR, CAMERA_FAR)
orbitCamera.position.set(
  resolution.x / 2 + 8,
  6,
  resolution.y / 2 + 8
)

const renderer = new THREE.WebGLRenderer({
  antialias: window.devicePixelRatio < 2,
  logarithmicDepthBuffer: true,
})
document.body.appendChild(renderer.domElement)
handleResize()

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false
controls.enableRotate = false
controls.target.set(
  resolution.x / 2 - 2,
  0,
  resolution.y / 2 + 2
)

// Create a separate OrbitControls instance for the free orbit camera
const orbitControls = new OrbitControls(orbitCamera, renderer.domElement)
orbitControls.enableDamping = true
orbitControls.enableZoom = true
orbitControls.enablePan = true
orbitControls.enableRotate = true
orbitControls.target.set(
  resolution.x / 2,
  0,
  resolution.y / 2
)
orbitControls.minDistance = 3
orbitControls.maxDistance = 100
orbitControls.maxPolarAngle = Math.PI * 0.8 // Prevent camera from going below ground

// --------- Plane and Minimap Initialization ---------
// Initialize the minimap
let minimap = null;

// Load the GLTF island model
const gltfLoader = new GLTFLoader();
let island = null;
let groundPlane = null; // For fallback plane

gltfLoader.load('./assets/models/Island.gltf', (gltf) => {
  console.log('Island GLTF loaded successfully!', gltf);
  island = gltf.scene;
    // Scale the island to fit the game grid (20x20)
  // Make it bigger to cover more of the game area
  const scale = Math.max(resolution.x, resolution.y) * 4; // Increased from 0.3 to 0.8
  island.scale.set(scale, scale, scale);
    // Position the island at the center of the game area
  island.position.x = resolution.x / 2 - 0.5;
  island.position.z = resolution.y / 2 - 0.5;
  island.position.y = -60.2; // Lower the island to be below snake and objects (which are at y=0)

    // Enable shadow receiving for all meshes in the island
  island.traverse((child) => {
    if (child.isMesh) {
      console.log('Found mesh in island:', child.name, child.material?.name);
      child.receiveShadow = true;
      child.castShadow = true;
      
      // Update material colors to match the current palette
      if (child.material) {
        // Try to identify materials by name first, then fallback to primitive index
        const materialName = child.material.name?.toLowerCase() || '';
        
        // Check if it's likely a grass/top material (usually the first primitive or has "grass" in name)
        if (materialName.includes('grass') || materialName.includes('top') || child.name?.toLowerCase().includes('grass')) {
          child.material.color.setHex(params.groundColor);
          console.log('Applied grass color to:', child.name);
        }
        // Check if it's likely a dirt/base material
        else if (materialName.includes('dirt') || materialName.includes('base') || materialName.includes('soil')) {
          const dirtColor = new THREE.Color(0xa5756d); // Default dirt color
          dirtColor.multiplyScalar(0.7); // Make dirt darker
          child.material.color.copy(dirtColor);
          console.log('Applied dirt color to:', child.name);
        }
        // If we can't identify by name, apply grass color to the first mesh, dirt to others
        else {
          // For the island model, we'll default to grass color for all surfaces
          child.material.color.setHex(params.groundColor);
          console.log('Applied default ground color to:', child.name);
        }
      }
    }
  });
  
  scene.add(island);
  console.log('Island added to scene');
}, 
(progress) => {
  console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
},
(error) => {
  console.error('Error loading island model:', error);
    // Fallback to original plane if GLTF fails to load
  console.log('Falling back to original plane');
  const planeGeometry = new THREE.PlaneGeometry(
    resolution.x * 50,
    resolution.y * 50
  );
  planeGeometry.rotateX(-Math.PI * 0.5);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: params.groundColor,
  });
  groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  groundPlane.position.x = resolution.x / 2 - 0.5;
  groundPlane.position.z = resolution.y / 2 - 0.5;
  groundPlane.position.y = -0.5;
  scene.add(groundPlane);
  groundPlane.receiveShadow = true;
});

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
  const settingsSidebar = document.getElementById('settings-sidebar');
  if (settingsSidebar) {
    settingsSidebar.classList.remove('open');
    
    // Blur all input elements to prevent them from receiving keyboard events
    const inputs = settingsSidebar.querySelectorAll('input');
    inputs.forEach(input => input.blur());
  }
}

let isRunning

function startGame() {
  if (!snake.isMoving) {
    // Ensure camera rotation is disabled when snake starts moving
    cameraRotationActive = false;
    
    // Hide settings tab when snake starts moving
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab && settingsTab.style.display !== 'none') {
      animateSettingsTab(settingsTab, false);
    }    // Use the current slider value to determine moveInterval for snake speed
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
    cameraRotationActive = true;
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

  gsap.from(
    entities.map((entity) => entity.mesh.scale),
    {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      ease: 'elastic.out(1.5, 0.5)',
      stagger: {
        grid: [20, 20],
        amount: 0.7,
      },
    }
  )
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
// --- Áudio e controlos de volume ---
const audio = document.getElementById('audio')
const btnVolume = document.getElementById('btn-volume')
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

btnPlay.addEventListener('click', function () {
  if (!gameStarted) {
    gameStarted = true
    
    // Stop camera rotation when game starts
    cameraRotationActive = false;
    
    // Handle audio initialization and play
    const playAudio = async () => {
      try {
        // Check if user muted audio
        if (audio.volume !== 0) {
          await audio.play()
          // Update the icon just to be safe
          document.getElementById('btn-volume-img').src = `/assets/images/themes/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`
        } else {
          document.getElementById('btn-volume-img').src = `/assets/images/themes/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`
        }
      } catch (err) {
        console.log('Audio could not play automatically:', err)
        // In case of autoplay failure, we keep the mute icon
        muteVolume()
      }
    }
    // Enhanced minimap animation with smoother timing
    const minimapContainer = document.getElementById('minimap-container');
    const showMinimap = document.getElementById('show-minimap').checked;
    
    if (showMinimap) {
      minimapContainer.style.display = 'block';
      minimapContainer.style.opacity = '0';
      minimapContainer.style.transform = 'scale(0.7) translateY(30px)';
      
      gsap.to(minimapContainer, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        delay: 1.0,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(minimapContainer, {
            scale: 1.05,
            duration: 0.3,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      });
    } else {
      minimapContainer.style.display = 'none';
    }
      playAudio()
    
    gsap.to(camera.position, { ...finalPosition, duration: 2 })
    gsap.to(scene.fog, { duration: 2, near: 30, far: 80 })
    animateButtonOut(this)
    if (btnSettings) {
      animateButtonOut(btnSettings)
      // Close settings sidebar if it's open
      const settingsSidebar = document.getElementById('settings-sidebar');
      if (settingsSidebar && settingsSidebar.classList.contains('open')) {
        settingsSidebar.classList.remove('open');
      }
    }    btnToggleCamera.style.display = 'block'
    animateCameraButtonIn(btnToggleCamera)
    
    // Register event listener but don't start the snake movement yet
    // The snake will start moving when the player presses a movement key
    registerEventListener()
    
    // Show settings tab after game starts with a slight delay
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab) {
      settingsTab.classList.remove('theme-green', 'theme-lilac', 'theme-orange');
      settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`);
      // Add slight delay to show after camera movement starts
      setTimeout(() => animateSettingsTab(settingsTab, true), 1000);
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

// Set up audio with proper initial values
audio.volume = 0.7 // A reasonable default volume
const initialVolume = audio.volume
audio.pause() // Ensure it's paused initially

const userVolume = 'on' // Default value, not loaded from localStorage
if (userVolume === 'off') {
  muteVolume()
}

btnVolume.addEventListener('click', function () {
  // Add a small scale animation for feedback
  gsap.to(this, {
    scale: 0.9,
    duration: 0.1,
    onComplete: () => {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1.2, 0.7)"
      })
    }
  })
  
  // Check if audio is muted
  if (audio.volume === 0) {
    unmuteVolume(audio, document.getElementById('btn-volume-img'), paletteName, initialVolume, capitalize, gsap)
  } else {
    muteVolume(audio, document.getElementById('btn-volume-img'), paletteName, capitalize, gsap)
  }
})

btnVolume.addEventListener('mouseenter', function () {
  this.style.transform = 'scale(1.15)';
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)';
});
btnVolume.addEventListener('mouseleave', function () {
  this.style.transform = 'scale(1)';
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)';
});

const sideBar = document.querySelector('.top-bar')
const paletteSelectors = document.querySelectorAll('[data-color]')
gsap.to(sideBar, {
  opacity: 1,
  delay: 0.5,
  onComplete: () => {
    gsap.to(paletteSelectors, {
      duration: 1,
      x: 0,
      autoAlpha: 1,
      ease: `elastic.out(1.2, 0.9)`,
      stagger: {
        amount: 0.2,
      },
    })
  },
})

paletteSelectors.forEach((selector) =>
  selector.addEventListener('click', function () {
    const paletteName = this.dataset.color
    applyPalette(paletteName)
  })
)

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
// Palette-aware settings icon
function updateSettingsIcon(name) {
  if (!btnSettingsImg) return;
  btnSettingsImg.src = `/assets/images/themes/${name.toLowerCase()}/${capitalize(name)}Settings.svg`;
}

// Update settings icon when palette changes
const originalApplyPalette = applyPalette;
applyPalette = function(name) {
  originalApplyPalette(name);
  updateSettingsIcon(name);
  
  // Update settings tab theme
  const settingsTab = document.getElementById('settings-tab');
  if (settingsTab) {
    // Remove all theme classes
    settingsTab.classList.remove('theme-green', 'theme-lilac', 'theme-orange');
    // Add the current theme class
    settingsTab.classList.add(`theme-${name.toLowerCase()}`);
  }
  
  // Update settings sidebar theme
  const settingsSidebar = document.getElementById('settings-sidebar');
  if (settingsSidebar) {
    // Remove all theme classes
    settingsSidebar.classList.remove('theme-green', 'theme-lilac', 'theme-orange');
    // Add the current theme class
    settingsSidebar.classList.add(`theme-${name.toLowerCase()}`);
  }
};

updateSettingsIcon(paletteName);

// Placeholder click event for settings
btnSettings.addEventListener('click', function () {
  const gear = btnSettings.querySelector('img[alt="Settings Gear"]');
  if (gear) {
    gsap.to(gear, {
      rotation: "+=360",
      duration: 1,
      ease: "power2.inOut"
    });
  }
  
  // Toggle settings sidebar
  const settingsSidebar = document.getElementById('settings-sidebar');
  if (settingsSidebar.classList.contains('open')) {
    closeSettings();
  } else {
    settingsSidebar.classList.add('open');
  }
});

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

// --------- Camera Toggle Button and Its Handlers ---------
// --- Botão para alternar entre câmaras ---
const btnToggleCamera = document.getElementById('btn-toggle-camera')

// Modified hover effect: remove any color or shadow changes, but keep the scale animation
btnToggleCamera.addEventListener('mouseenter', function () {
  this.style.transform = 'scale(1.15)'
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)'
})
btnToggleCamera.addEventListener('mouseleave', function () {
  this.style.transform = 'scale(1)'
  this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)'
})

btnToggleCamera.addEventListener('click', () => {
  if (!gameStarted) return
  
  // Cycle through camera modes: perspective -> orthographic -> free orbit -> repeat
  cameraMode = (cameraMode + 1) % 3
  
  switch (cameraMode) {
    case 0: // Perspective mode
      activeCamera = camera
      controls.enabled = false
      orbitControls.enabled = false
      break
    case 1: // Orthographic mode
      activeCamera = topCamera
      controls.enabled = false
      orbitControls.enabled = false
      break
    case 2: // Free orbit mode
      activeCamera = orbitCamera
      controls.enabled = false
      orbitControls.enabled = true
      // Update orbit controls target to current game center
      orbitControls.target.set(
        resolution.x / 2,
        0,
        resolution.y / 2
      )
      break
  }
})

// Center point for camera rotation
const centerPoint = new THREE.Vector3(resolution.x / 2, 0, resolution.y / 2);

// Flag to track if the camera rotation should be active
let cameraRotationActive = true;

// --------- Main Render Loop ---------
// --- Ciclo principal de renderização ---
function tic() {  // If game hasn't started yet, animate camera rotation
  if (!gameStarted && cameraRotationActive) {
    // Set initial camera position when we start rotating, if needed
    if (camera.position.equals(initialPosition)) {
      // Set a closer starting position for the rotation
      camera.position.set(
        resolution.x / 2 + 10, // X position
        3,                    // Y position (height - lowered)
        resolution.y / 2      // Z position
      );
    }
    animateCameraRotation(camera, controls, centerPoint, true);
  } else {
    // Update controls based on current camera mode
    if (gameStarted && cameraMode === 2) {
      // Free orbit mode - update orbit controls
      orbitControls.update();
    } else {
      // Perspective and orthographic modes - update regular controls
      controls.update();
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
  updateCamerasOnResize({ camera, topCamera }, sizes, resolution)
  
  // Update orbit camera aspect ratio as well
  orbitCamera.aspect = sizes.width / sizes.height
  orbitCamera.updateProjectionMatrix()
  
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
