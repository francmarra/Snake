// --- Ficheiro principal do jogo Snake 3D ---
// Inicializa a cena, câmara, luzes, entidades e lógica principal do jogo

import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import Snake from './src/Snake'
import Fruit from './src/Fruit'
import Rock from './src/Rock'
import Tree from './src/Tree'
import lights from './src/Lights'
import gsap from 'gsap'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import Entity from './src/Entity'
import Bomb from './src/Bomb'
import { MOVEMENT_SPEED, NUM_ENTITIES } from './config/Config.js'
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

// Carrega a fonte para o texto da pontuação
const loader = new FontLoader()
let font
loader.load(fontSrc, (loadedFont) => {
  font = loadedFont
  printScore()
})

// --- Paletas de cores e seleção ---
const resolution = new THREE.Vector2(GRID_WIDTH, GRID_HEIGHT)
const palettes = COLOR_PALETTES
let paletteName = localStorage.getItem('paletteName') || 'green'
let selectedPalette = palettes[paletteName]
const params = { ...selectedPalette }

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Aplica a paleta de cores selecionada
function applyPalette(name) {
  paletteName = name
  const palette = palettes[name]
  if (!palette) return
  localStorage.setItem('paletteName', name)

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

  btnPlayImg.src = `/ThemeBtn/${capitalize(name)}Play.svg`
  document.getElementById('btn-toggle-camera-img').src =
    `/ThemeBtn/${capitalize(name)}Camera.svg`
  document.getElementById('btn-volume-img').src =
    `/ThemeBtn/${capitalize(name)}Audio.svg`

  const vol = localStorage.getItem('volume')
  if (vol === 'off' || audio.volume === 0) {
    document.getElementById('btn-volume-img').src =
      `/ThemeBtn/${capitalize(name)}NoAudio.svg`
  }
}

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

const camera = new THREE.PerspectiveCamera(CAMERA_FOV, sizes.width / sizes.height, CAMERA_NEAR)
const finalPosition = new THREE.Vector3(
  -8 + resolution.x / 2,
  resolution.x / 2 + 4,
  resolution.y + 6
)
const initialPosition = new THREE.Vector3(
  resolution.x / 2 + 5,
  4,
  resolution.y / 2 + 4
)
camera.position.copy(initialPosition)

const topCamera = new THREE.PerspectiveCamera(CAMERA_FOV, sizes.width / sizes.height, CAMERA_NEAR, CAMERA_FAR)
topCamera.position.set(resolution.x / 2, 22, resolution.y / 2)
topCamera.lookAt(new THREE.Vector3(resolution.x / 2, 0, resolution.y / 2))
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
    addBomb()
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
      }
    }
    score = Math.max(0, score - bomb.points)
    addBomb()
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

function registerEventListener() {
  window.addEventListener('keydown', function (e) {
    const keyCode = e.code
    snake.setDirection(keyCode)
    if (keyCode === 'Space') {
      !isRunning ? startGame() : stopGame()
    } else if (!isRunning) {
      startGame()
    }
  })
}

let isRunning

function startGame() {
  if (!snake.isMoving) {
    isRunning = setInterval(() => {
      snake.update()
    }, MOVEMENT_SPEED)
  }
}

function stopGame() {
  clearInterval(isRunning)
  isRunning = null
}

function resetGame() {
  stopGame()
  score = 0

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

  addFruit()
  addBomb()
  generateEntities()
}

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
  if (bombs.length === 0) {
    const bomb = new Bomb(resolution)
    let index = getFreeIndex()
    bomb.mesh.position.x = index % resolution.x
    bomb.mesh.position.z = Math.floor(index / resolution.x)
    bombs.push(bomb)
    bomb.in()
    scene.add(bomb.mesh)
  }
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

// --- Áudio e controlos de volume ---
const audio = document.getElementById('audio')
const btnVolume = document.getElementById('btn-volume')
const btnPlay = document.getElementById('btn-play')
const btnPlayImg = document.getElementById('btn-play-img')
const btnSettings = document.getElementById('btn-settings')
const btnSettingsImg = document.getElementById('btn-settings-img')

// Play button animation
gsap.fromTo(
  btnPlay,
  { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
  {
    duration: 0.8,
    autoAlpha: 1,
    scale: 1,
    yPercent: -50,
    xPercent: -50,
    delay: 0.3,
    ease: `elastic.out(1.2, 0.7)`,
  }
)

// Animate settings button in sync with play button
if (btnSettings) {
  gsap.fromTo(
    btnSettings,
    { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
    {
      duration: 0.8,
      autoAlpha: 1,
      scale: 1,
      yPercent: -50,
      xPercent: -50,
      delay: 0.3,
      ease: `elastic.out(1.2, 0.7)`,
    }
  )
}

let gameStarted = false

btnPlay.addEventListener('click', function () {
  if (!gameStarted) {
    gameStarted = true
    audio.play()
    gsap.to(camera.position, { ...finalPosition, duration: 2 })
    gsap.to(scene.fog, { duration: 2, near: 20, far: 55 })
    gsap.to(this, {
      duration: 1,
      scale: 0,
      ease: `elastic.in(1.2, 0.7)`,
      onComplete: () => {
        this.style.visibility = 'hidden'
      },
    })
    btnToggleCamera.style.display = 'block'
    gsap.fromTo(
      btnToggleCamera,
      { autoAlpha: 0, scale: 0 },
      { duration: 0.8, autoAlpha: 1, scale: 1, ease: 'elastic.out(1.2, 0.7)', delay: 0.3 }
    )
    registerEventListener()
  }
})

const userVolume = localStorage.getItem('volume')
if (userVolume === 'off') {
  muteVolume()
}

const initialVolume = audio.volume

btnVolume.addEventListener('click', function () {
  if (audio.volume === 0) {
    unmuteVolume()
  } else {
    muteVolume()
  }
})

function muteVolume() {
  localStorage.setItem('volume', 'off')
  gsap.to(audio, { volume: 0, duration: 1 })
  btnVolume.classList.remove('after:block')
  btnVolume.querySelector(':first-child').classList.remove('animate-ping')
  btnVolume.querySelector(':first-child').style.background = 'none'
  document.getElementById('btn-volume-img').src = `/ThemeBtn/${capitalize(paletteName)}NoAudio.svg`
}

function unmuteVolume() {
  localStorage.setItem('volume', 'on')
  btnVolume.classList.add('after:hidden')
  btnVolume.querySelector(':first-child').classList.add('animate-ping')
  btnVolume.querySelector(':first-child').style.background = ''
  gsap.to(audio, { volume: initialVolume, duration: 1 })
  document.getElementById('btn-volume-img').src = `/ThemeBtn/${capitalize(paletteName)}Audio.svg`
}

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

// Palette-aware settings icon
function updateSettingsIcon(name) {
  if (!btnSettingsImg) return;
  btnSettingsImg.src = `/ThemeBtn/${capitalize(name)}Settings.svg`;
}

// Update settings icon when palette changes
const originalApplyPalette = applyPalette;
applyPalette = function(name) {
  originalApplyPalette(name);
  updateSettingsIcon(name);
};
updateSettingsIcon(paletteName);

// Placeholder click event for settings
btnSettings.addEventListener('click', function () {
  alert('Settings will be available soon!')
})

applyPalette(paletteName)

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

// --- Ciclo principal de renderização ---
function tic() {
  controls.update()
  renderer.render(scene, activeCamera)
  requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  topCamera.aspect = sizes.width / sizes.height
  topCamera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)

  const pixelRatio = Math.min(window.devicePixelRatio, 2)
  renderer.setPixelRatio(pixelRatio)
}