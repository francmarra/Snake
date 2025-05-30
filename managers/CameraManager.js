import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR } from '../config/StaticData.js'
import { animateCameraRotation } from '../src/utils/CameraRotation.js'

export function initCameras(resolution, sizes, initialPosition, finalPosition) {
  // Inicializa as câmaras principal e ortográfica
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, sizes.width / sizes.height, CAMERA_NEAR, CAMERA_FAR)
  camera.position.copy(initialPosition)

  const halfWidth = (resolution.x / 2) * 1.2
  const halfHeight = (resolution.y / 2) * 1.2
  const topCamera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 1000)
  topCamera.position.set(resolution.x / 2, 26, resolution.y / 2)
  topCamera.lookAt(new THREE.Vector3(resolution.x / 2, 0, resolution.y / 2))
  
  return { camera, topCamera }
}

export function updateCamerasOnResize(cameras, sizes, resolution) {
  // Atualiza as câmaras ao redimensionar a janela
  const { camera, topCamera } = cameras
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  const aspect = sizes.width / sizes.height
  const halfWidth = (resolution.x / 2) * 1.2
  const halfHeight = (resolution.y / 2) * 1.2
  
  if (aspect > 1) {
    topCamera.left = -halfWidth * aspect
    topCamera.right = halfWidth * aspect
    topCamera.top = halfHeight
    topCamera.bottom = -halfHeight
  } else {
    topCamera.left = -halfWidth
    topCamera.right = halfWidth
    topCamera.top = halfHeight / aspect
    topCamera.bottom = -halfHeight / aspect
  }
  topCamera.updateProjectionMatrix()
}

export class CameraController {
  constructor(resolution, sizes, renderer, initialPosition, finalPosition) {
    this.resolution = resolution
    this.sizes = sizes
    this.renderer = renderer
    
    // Camera mode tracking: 0 = perspective, 1 = orthographic, 2 = free orbit
    this.cameraMode = 0
    
    // Initialize cameras
    const { camera, topCamera } = initCameras(resolution, sizes, initialPosition, finalPosition)
    this.camera = camera
    this.topCamera = topCamera
    this.activeCamera = camera
    
    // Create a third camera for free orbit mode
    this.orbitCamera = new THREE.PerspectiveCamera(CAMERA_FOV, sizes.width / sizes.height, CAMERA_NEAR, CAMERA_FAR)
    this.orbitCamera.position.set(
      resolution.x / 2 + 8,
      6,
      resolution.y / 2 + 8
    )
    
    // Setup controls
    this.setupControls()
    
    // Camera rotation state
    this.cameraRotationActive = true
    this.centerPoint = new THREE.Vector3(resolution.x / 2, 0, resolution.y / 2)
    
    // Setup button event listeners
    this.setupCameraButton()
  }
  
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.enableZoom = false
    this.controls.enablePan = false
    this.controls.enableRotate = false
    this.controls.target.set(
      this.resolution.x / 2 - 2,
      0,
      this.resolution.y / 2 + 2
    )
    
    // Create a separate OrbitControls instance for the free orbit camera
    this.orbitControls = new OrbitControls(this.orbitCamera, this.renderer.domElement)
    this.orbitControls.enableDamping = true
    this.orbitControls.enableZoom = true
    this.orbitControls.enablePan = true
    this.orbitControls.enableRotate = true
    this.orbitControls.target.set(
      this.resolution.x / 2,
      0,
      this.resolution.y / 2
    )
    this.orbitControls.minDistance = 3
    this.orbitControls.maxDistance = 100
    this.orbitControls.maxPolarAngle = Math.PI * 0.8 // Prevent camera from going below ground
  }
  
  setupCameraButton() {
    const btnToggleCamera = document.getElementById('btn-toggle-camera')
    if (!btnToggleCamera) return
    
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
      this.toggleCameraMode()
    })
  }
  
  showCameraButton() {
    const btnToggleCamera = document.getElementById('btn-toggle-camera')
    if (btnToggleCamera) {
      btnToggleCamera.style.display = 'block';
      btnToggleCamera.style.transform = 'translateX(-200px)';
      import('../src/utils/Animations.js').then(({ animatePaletteSelectors }) => {
        animatePaletteSelectors([btnToggleCamera], null);
      })
    }
  }
  
  toggleCameraMode() {
    // Only allow camera switching when game has started
    if (!window.gameStarted) return
    
    // Cycle through camera modes: perspective -> orthographic -> free orbit -> repeat
    this.cameraMode = (this.cameraMode + 1) % 3
    
    switch (this.cameraMode) {
      case 0: // Perspective mode
        this.activeCamera = this.camera
        this.controls.enabled = false
        this.orbitControls.enabled = false
        break
      case 1: // Orthographic mode
        this.activeCamera = this.topCamera
        this.controls.enabled = false
        this.orbitControls.enabled = false
        break
      case 2: // Free orbit mode
        this.activeCamera = this.orbitCamera
        this.controls.enabled = false
        this.orbitControls.enabled = true
        // Update orbit controls target to current game center
        this.orbitControls.target.set(
          this.resolution.x / 2,
          0,
          this.resolution.y / 2
        )
        break
    }
  }
  
  update(gameStarted) {
    // If game hasn't started yet, animate camera rotation
    if (!gameStarted && this.cameraRotationActive) {
      // Set initial camera position when we start rotating, if needed
      const initialPosition = new THREE.Vector3(this.resolution.x / 2 + 5, 3, this.resolution.y / 2 + 4)
      if (this.camera.position.equals(initialPosition)) {
        // Set a closer starting position for the rotation
        this.camera.position.set(
          this.resolution.x / 2 + 10, // X position
          3,                    // Y position (height - lowered)
          this.resolution.y / 2      // Z position
        )
      }
      animateCameraRotation(this.camera, this.controls, this.centerPoint, true)
    } else {
      // Update controls based on current camera mode
      if (gameStarted && this.cameraMode === 2) {
        // Free orbit mode - update orbit controls
        this.orbitControls.update()
      } else {
        // Perspective and orthographic modes - update regular controls
        this.controls.update()
      }
    }
  }
  
  stopRotation() {
    this.cameraRotationActive = false
  }
  
  handleResize(sizes) {
    this.sizes = sizes
    updateCamerasOnResize({ camera: this.camera, topCamera: this.topCamera }, sizes, this.resolution)
    
    // Update orbit camera aspect ratio as well
    this.orbitCamera.aspect = sizes.width / sizes.height
    this.orbitCamera.updateProjectionMatrix()
  }
}