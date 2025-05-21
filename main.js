// --------- Imports ---------
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import Snake from './src/Snake'
import Fruit from './src/Fruit'
import Rock from './src/Rock'
import Tree from './src/Tree'
import lights, { toggleAmbientLight, toggleDirectionalLight, togglePointLight } from './src/Lights'
import gsap from 'gsap'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import Entity from './src/Entity'
import Bomb from './src/Bomb'
import { MOVEMENT_SPEED, NUM_ENTITIES, DEFAULT_SETTINGS } from './config/Config.js'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  COLOR_PALETTES,
  TREE_DATA,
  ROCK_DATA,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR
} from './config/StaticData.js'
import { animateButtonIn, animateButtonOut, animateCameraButtonIn, animateSettingsTab } from './src/Animations.js';
import { initCameras, updateCamerasOnResize } from './managers/CameraManager'
import { muteVolume, unmuteVolume } from './managers/AudioManager'
import { initializeSettings } from './managers/SettingsManager'
import Minimap from './src/Minimap.js';
import { animateCameraRotation } from './src/CameraRotation.js';

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
  selectedPalette = palette

  const {
    groundColor,
    fogColor,
    rockColor,
    treeColor,
    fruitColor,
    snakeColor,
    mouthColor
  } = palette

  planeMaterial.color.set(groundColor)
  scene.fog.color.set(fogColor)
  scene.background.set(fogColor)

  // Atualiza cor de rochas
  entities.filter((e) => e instanceof Rock).forEach((rock) => {
    rock.mesh.material.color.set(rockColor)
  })
  // Atualiza cor de árvores (folhagem apenas)
  entities.filter((e) => e instanceof Tree).forEach((tree) => {
    tree.foliage.material.color.set(treeColor)
  })
  candies[0].mesh.material.color.set(fruitColor)
  snake.body.head.data.mesh.material.color.set(snakeColor)
  snake.mouth.material.color.set(mouthColor)

  updateSnakeSegmentsUI()

  btnPlayImg.src = `/ThemeBtn/${name.toLowerCase()}/${capitalize(name)}Play.svg`
  document.getElementById('btn-toggle-camera-img').src =
    `/ThemeBtn/${name.toLowerCase()}/${capitalize(name)}Camera.svg`
  document.getElementById('btn-volume-img').src =
    `/ThemeBtn/${name.toLowerCase()}/${capitalize(name)}Audio.svg`
  const vol = localStorage.getItem('volume')
  if (vol === 'off' || audio.volume === 0) {
    document.getElementById('btn-volume-img').src =
      `/ThemeBtn/${name.toLowerCase()}/${capitalize(name)}NoAudio.svg`
  }
  
  // Update minimap theme and colors
  const minimapContainer = document.getElementById('minimap-container')
  if (minimapContainer) {
    minimapContainer.classList.remove('theme-green', 'theme-orange', 'theme-lilac')
    minimapContainer.classList.add(`theme-${name.toLowerCase()}`)
  }
  
  // Update minimap with new palette colors if it exists
  if (minimap && gameStarted) {
    minimap.update(snake, candies, bombs, selectedPalette)
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
scene.background = new THREE.Color(params.fogColor)
scene.fog = new THREE.Fog(params.fogColor, 5, 40)
scene.add(gridHelper)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const initialPosition = new THREE.Vector3(
  resolution.x / 2 + 5,
  4,
  resolution.y / 2 + 4
)
const finalPosition = new THREE.Vector3(
  -8 + resolution.x / 2,
  resolution.x / 2 + 4,
  resolution.y + 6
)
const { camera, topCamera } = initCameras(resolution, sizes, initialPosition, finalPosition)
let activeCamera = camera

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

// --------- Plane and Minimap Initialization ---------
// Initialize the minimap
let minimap = null;

const planeGeometry = new THREE.PlaneGeometry(
  resolution.x * 50,
  resolution.y * 50
)
planeGeometry.rotateX(-Math.PI * 0.5)
const planeMaterial = new THREE.MeshStandardMaterial({
  color: params.groundColor,
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.position.x = resolution.x / 2 - 0.5
plane.position.z = resolution.y / 2 - 0.5
plane.position.y = -0.5
scene.add(plane)
plane.receiveShadow = true

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
    const keyCode = e.code
    const isMovementKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(keyCode);
    
    // Set the direction regardless of whether the game is running
    snake.setDirection(keyCode)
    
    if (keyCode === 'Space') {
      !isRunning ? startGame() : stopGame()
    } else if (!isRunning && isMovementKey && gameStarted) {
      // Only start the game if a movement key is pressed and the play button has been clicked
      startGame()
    }    
    
    // Hide settings tab and sidebar when snake moves
    const settingsTab = document.getElementById('settings-tab');
    const settingsSidebar = document.getElementById('settings-sidebar');
    if (settingsTab) {
      animateSettingsTab(settingsTab, false);
    }
    if (settingsSidebar && settingsSidebar.classList.contains('open')) {
      settingsSidebar.classList.remove('open');
    }
  })
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
  const entity =
    Math.random() > 0.5
      ? new Rock(resolution, selectedPalette.rockColor)
      : new Tree(resolution, selectedPalette.treeColor)

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

const tree = new Tree(resolution)
TREE_DATA.forEach(([x, y, z, w]) => {
  let clone = tree.mesh.clone()
  clone.position.set(x, y, z)
  clone.scale.setScalar(w)
  scene.add(clone)
})

const rock = new Rock(resolution)
ROCK_DATA.forEach(([posArr, scaleArr]) => {
  let clone = new Rock(resolution).mesh
  clone.position.set(...posArr)
  clone.scale.set(...scaleArr.slice(0, 3))
  clone.rotation.y = scaleArr[3]
  scene.add(clone)
})

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
          document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`
        } else {
          document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`
        }
      } catch (err) {
        console.log('Audio could not play automatically:', err)
        // In case of autoplay failure, we keep the mute icon
        muteVolume()
      }
    }
    // Enhanced minimap animation with smoother timing
    const minimapContainer = document.getElementById('minimap-container');
    minimapContainer.style.display = 'block';
    minimapContainer.style.opacity = '0';
    minimapContainer.style.transform = 'scale(0.7) translateY(30px)';
    
    gsap.to(minimapContainer, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      delay: 1.0, // Slightly earlier to feel more responsive
      ease: "back.out(1.7)", // More natural elastic feel
      onComplete: () => {
        // Add a subtle pulse effect after appearing
        gsap.to(minimapContainer, {
          scale: 1.05,
          duration: 0.3,
          repeat: 1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    });
    
    playAudio()
    
    gsap.to(camera.position, { ...finalPosition, duration: 2 })
    gsap.to(scene.fog, { duration: 2, near: 20, far: 55 })
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
const wasd = textureLoader.load('/wasd.png')
const arrows = textureLoader.load('/arrows.png')
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
  btnSettingsImg.src = `/ThemeBtn/${name.toLowerCase()}/${capitalize(name)}Settings.svg`;
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
  document.getElementById('settings-sidebar').classList.toggle('open');
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
  activeCamera = activeCamera === camera ? topCamera : camera
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
    controls.update();
  }
  
  renderer.render(scene, activeCamera)
  
  // Update minimap if the game has started and minimap is initialized
  if (gameStarted && minimap) {
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
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}