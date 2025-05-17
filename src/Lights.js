import { AmbientLight, DirectionalLight } from 'three'
import { GRID_WIDTH, GRID_HEIGHT } from '../config/StaticData.js'

const ambLight = new AmbientLight(0xffffff, 0.6) // soft white light
const dirLight = new DirectionalLight(0xffffff, 0.7) // directional light

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

const lights = [dirLight, ambLight]

export default lights
