import * as THREE from 'three'
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR } from '../config/StaticData.js'

export function initCameras(resolution, sizes, initialPosition, finalPosition) {
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