// --- Classe Snake: representa a cobra do jogo ---
// Lógica de movimento, crescimento, colisão e reinicialização


import {
	EventDispatcher,
	Mesh,
	MeshStandardMaterial,
	SphereGeometry,
	Vector2,
	Vector3,
	CanvasTexture,
	RepeatWrapping,
	Color
} from 'three'
import LinkedKList from '../utils/LinkedList'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'
import ListNode from '../utils/ListNode'
import Entity from './Entity'
import { INITIAL_SNAKE_LENGTH } from '../../config/Config.js'

const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1)
const NODE_MATERIAL = new MeshStandardMaterial({
	color: 0xff470a,
})

const UP = new Vector3(0, 0, -1) 
const DOWN = new Vector3(0, 0, 1) 
const LEFT = new Vector3(-1, 0, 0) 
const RIGHT = new Vector3(1, 0, 0) 

// Camouflage pattern generation function
function generateCamouflageTexture(baseColor, size = 512, seed = Math.random(), camoColors = null) {
	const canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext('2d')
	
	// Convert THREE.Color to hex string if needed
	const baseHex = typeof baseColor === 'number' ? 
		'#' + baseColor.toString(16).padStart(6, '0') : baseColor
	
	// Use theme-specific camouflage colors if provided, otherwise generate from base color
	let colorsToUse;
	if (camoColors && camoColors.dark && camoColors.medium && camoColors.light) {
		colorsToUse = [
			'#' + camoColors.dark.toString(16).padStart(6, '0'),
			'#' + camoColors.medium.toString(16).padStart(6, '0'),
			'#' + camoColors.light.toString(16).padStart(6, '0'),
		];
		if (camoColors.accent) {
			colorsToUse.push('#' + camoColors.accent.toString(16).padStart(6, '0'));
		}
	}
	else {
		// Fallback to generated colors from base color
		const baseColorObj = new Color(baseHex)
		const darkVariant = baseColorObj.clone().multiplyScalar(0.6)
		const mediumVariant = baseColorObj.clone().multiplyScalar(0.8)
		const lightVariant = baseColorObj.clone().multiplyScalar(1.2)
		colorsToUse = [
			'#' + darkVariant.getHexString(),
			'#' + mediumVariant.getHexString(),
			'#' + lightVariant.getHexString()
		];
		console.warn('Camouflage colors not provided or incomplete, generating from base color.');
	}
	
	// Fill with base color
	ctx.fillStyle = baseHex
	ctx.fillRect(0, 0, size, size)
	
	// Seeded random function for consistent patterns per segment
	let seedValue = seed * 9999
	function seededRandom() {
		seedValue = (seedValue * 9301 + 49297) % 233280
		return seedValue / 233280
	}
	
	// Generate irregular blob patterns
	const blobCount = 8 + Math.floor(seededRandom() * 12) // 8-20 blobs
	
	for (let i = 0; i < blobCount; i++) {
		// Random blob properties
		const centerX = seededRandom() * size
		const centerY = seededRandom() * size
		const blobSize = 30 + seededRandom() * 80
		const colorIndex = Math.floor(seededRandom() * colorsToUse.length)
		
		ctx.fillStyle = colorsToUse[colorIndex]
		ctx.beginPath()
		
		// Create irregular blob shape using multiple circles with random offsets
		const points = 8 + Math.floor(seededRandom() * 8) // 8-16 points for irregularity
		for (let j = 0; j < points; j++) {
			const angle = (j / points) * Math.PI * 2
			const radiusVariation = 0.5 + seededRandom() * 0.8 // Random radius variation
			const radius = blobSize * radiusVariation
			const offsetX = seededRandom() * 20 - 10 // Random offset for irregularity
			const offsetY = seededRandom() * 20 - 10
			
			const x = centerX + Math.cos(angle) * radius + offsetX
			const y = centerY + Math.sin(angle) * radius + offsetY
			
			if (j === 0) {
				ctx.moveTo(x, y)
			} else {
				// Use quadratic curves for smoother, more organic shapes
				const prevAngle = ((j - 1) / points) * Math.PI * 2
				const prevRadius = blobSize * (0.5 + seededRandom() * 0.8)
				const prevX = centerX + Math.cos(prevAngle) * prevRadius
				const prevY = centerY + Math.sin(prevAngle) * prevRadius
				
				const cpX = (prevX + x) / 2 + (seededRandom() - 0.5) * 30
				const cpY = (prevY + y) / 2 + (seededRandom() - 0.5) * 30
				
				ctx.quadraticCurveTo(cpX, cpY, x, y)
			}
		}
		
		ctx.closePath()
		ctx.fill()
		
		// Add some smaller spots within larger blobs for more detail
		if (seededRandom() > 0.6) {
			const spotCount = 2 + Math.floor(seededRandom() * 4)
			for (let k = 0; k < spotCount; k++) {
				const spotX = centerX + (seededRandom() - 0.5) * blobSize
				const spotY = centerY + (seededRandom() - 0.5) * blobSize
				const spotRadius = 5 + seededRandom() * 15
				
				ctx.fillStyle = colorsToUse[(colorIndex + 1) % colorsToUse.length]
				ctx.beginPath()
				ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2)
				ctx.fill()
			}
		}
	}
	
	// Create texture from canvas
	const texture = new CanvasTexture(canvas)
	texture.wrapS = RepeatWrapping
	texture.wrapT = RepeatWrapping
	texture.repeat.set(1, 1)
	texture.needsUpdate = true
	
	return texture
}

export default class Snake extends EventDispatcher {
	direction = RIGHT
	indexes = []
	speedInterval = 240

	constructor({ scene, resolution = new Vector2(10, 10), color, mouthColor, camoColors }) {
		super()
		this.scene = scene
		this.resolution = resolution
		this.mouthColor = mouthColor
		this.baseColor = color || 0xff470a
		this.camoColors = camoColors || null // Store camoColors
		if (color) {
			NODE_MATERIAL.color.set(color)
		}
		this.init()
	}

	get head() {
		return this.body.head
	}

	get end() {
		return this.body.end
	}

	// Cria a cabeça da cobra com olhos e boca
	createHeadMesh() {
		const headMesh = this.body.head.data.mesh

		const leftEye = new Mesh(
			new SphereGeometry(0.2, 10, 10),
			new MeshStandardMaterial({ color: 0xffffff })
		)
		leftEye.scale.x = 0.1
		leftEye.position.x = 0.5
		leftEye.position.y = 0.12
		leftEye.position.z = -0.1

		let leftEyeHole = new Mesh(
			new SphereGeometry(0.22, 10, 10),
			new MeshStandardMaterial({ color: 0x333333 })
		)
		leftEyeHole.scale.set(1, 0.6, 0.6)
		leftEyeHole.position.x += 0.05
		leftEye.add(leftEyeHole)

		const rightEye = leftEye.clone()
		rightEye.position.x = -0.5
		rightEye.rotation.y = Math.PI

		const mouthMesh = new Mesh(
			new RoundedBoxGeometry(1.05, 0.1, 0.6, 5, 0.1),
			new MeshStandardMaterial({
				color: this.mouthColor,
			})
		)
		mouthMesh.rotation.x = -Math.PI * 0.07
		mouthMesh.position.z = 0.23
		mouthMesh.position.y = -0.19
		this.mouth = mouthMesh
		headMesh.add(rightEye, leftEye, mouthMesh)
		headMesh.lookAt(headMesh.position.clone().add(this.direction))
	}

	// Inicializa a cobra no centro da grelha
	init() {
		this.direction = RIGHT
		this.iMoving = null
		this.indexes = []
		const head = new ListNode(new SnakeNode(this.resolution, this.baseColor, this.camoColors)) // Pass camoColors
		head.data.mesh.position.x = this.resolution.x / 2
		head.data.mesh.position.z = this.resolution.y / 2
		this.body = new LinkedKList(head)
		this.createHeadMesh()
		this.indexes.push(this.head.data.getIndexByCoord())
		for (let i = 0; i < INITIAL_SNAKE_LENGTH - 1; i++) {
			const position = this.end.data.mesh.position.clone().sub(this.direction)
			this.addTailNode()
			this.end.data.mesh.position.copy(position)
			this.indexes.push(this.end.data.getIndexByCoord())
		}
		this.scene.add(head.data.mesh)
		this.updateIndexes()
		this.updateSegmentScales()
		head.data.in()
		let node = this.body.head.next
		while (node) {
			node.data.in()
			node = node.next
		}
	}

	// Define a direção da cobra com base na tecla pressionada
	setDirection(keyCode) {
		let newDirection
		switch (keyCode) {
			case 'ArrowUp':
			case 'KeyW':
				newDirection = UP
				break
			case 'ArrowDown':
			case 'KeyS':
				newDirection = DOWN
				break
			case 'ArrowLeft':
			case 'KeyA':
				newDirection = LEFT
				break
			case 'ArrowRight':
			case 'KeyD':
				newDirection = RIGHT
				break
			default:
				return
		}
		const dot = this.direction.dot(newDirection)
		if (dot === 0) {
			this.newDirection = newDirection
		}
	}

	// Atualiza a posição da cobra e verifica se comeu fruta ou colidiu
	update() {
		if (this.newDirection) {
			this.direction = this.newDirection
			this.newDirection = null
		}
		let currentNode = this.end
		if (this.end.data.fruit) {
			this.end.data.fruit = null
			this.end.data.mesh.scale.setScalar(1)
			this.addTailNode()
		}
		while (currentNode.prev) {
			const fruit = currentNode.prev.data.fruit
			if (fruit) {
				currentNode.data.fruit = fruit
				currentNode.data.mesh.scale.setScalar(1.15)
				currentNode.prev.data.fruit = null
				currentNode.prev.data.mesh.scale.setScalar(1)
			}
			const position = currentNode.prev.data.mesh.position
			currentNode.data.mesh.position.copy(position)
			currentNode = currentNode.prev
		}
		const headPos = currentNode.data.mesh.position
		headPos.add(this.direction)
		const headMesh = this.body.head.data.mesh
		headMesh.lookAt(headMesh.position.clone().add(this.direction))
		// Grelha toroidal: permite que a cobra atravesse os limites
		if (headPos.z < 0) {
			headPos.z = this.resolution.y - 1
		} else if (headPos.z > this.resolution.y - 1) {
			headPos.z = 0
		}
		if (headPos.x < 0) {
			headPos.x = this.resolution.x - 1
		} else if (headPos.x > this.resolution.x - 1) {
			headPos.x = 0
		}
		this.updateIndexes()
		this.updateSegmentScales()
		this.dispatchEvent({ type: 'updated' })
	}

	// Reinicia a cobra após morrer
	die() {
		let node = this.body.head
		do {
			this.scene.remove(node.data.mesh)
			node = node.next
		} while (node)
		this.init()
		this.addEventListener({ type: 'die' })
	}

	// Verifica colisão da cabeça com o corpo
	checkSelfCollision() {
		const headIndex = this.indexes[this.indexes.length - 1]
		return this.indexes.slice(0, -1).includes(headIndex)
	}

	// Verifica colisão da cabeça com entidades
	checkEntitiesCollision(entities) {
		const headIndex = this.indexes.at(-1)
		const entity = entities.find(
			(entity) => entity.getIndexByCoord() === headIndex
		)
		return !!entity
	}

	// Atualiza a lista de índices ocupados pela cobra
	updateIndexes() {
		this.indexes = []
		let node = this.body.end
		while (node) {
			this.indexes.push(node.data.getIndexByCoord())
			node = node.prev
		}
	}

	// Adiciona um novo segmento à cauda
	addTailNode(position) {
		const node = new ListNode(new SnakeNode(this.resolution, this.baseColor, this.camoColors)) // Pass camoColors
		if (position) {
			node.data.mesh.position.copy(position)
		} else {
			node.data.mesh.position.copy(this.end.data.mesh.position)
		}
		this.body.addNode(node)
		this.scene.add(node.data.mesh)
	}

	// Atualiza a escala dos segmentos para um efeito visual suave
	updateSegmentScales() {
		const HEAD_SCALE = 1
		const TAIL_SCALE = 0.5
		let nodes = []
		let node = this.body.head
		while (node) {
			nodes.push(node)
			node = node.next
		}
		const n = nodes.length
		nodes.forEach((node, i) => {
			const t = i / (n - 1 || 1)
			const scale = HEAD_SCALE * (1 - t) + TAIL_SCALE * t
			node.data.mesh.scale.setScalar(scale)
		})
		for (let i = 1; i < nodes.length; i++) {
			const prevNode = nodes[i - 1]
			const currentNode = nodes[i]
			const prevScale = prevNode.data.mesh.scale.x
			const currScale = currentNode.data.mesh.scale.x
			const targetGap = ((prevScale + currScale) / 2) * HEAD_SCALE
			const prevPos = prevNode.data.mesh.position
			const currPos = currentNode.data.mesh.position
			let dx = currPos.x - prevPos.x
			let dz = currPos.z - prevPos.z
			const halfWidth = this.resolution.x / 2
			const halfHeight = this.resolution.y / 2
			if (Math.abs(dx) > halfWidth) {
				dx = dx - Math.sign(dx) * this.resolution.x
			}
			if (Math.abs(dz) > halfHeight) {
				dz = dz - Math.sign(dz) * this.resolution.y
			}
			const dir = new Vector3(dx, 0, dz)
			const currentDistance = dir.length()
			if (currentDistance === 0) continue
			dir.normalize()
			const newPos = prevPos.clone().add(dir.multiplyScalar(targetGap))
			newPos.x = (newPos.x + this.resolution.x) % this.resolution.x
			newPos.z = (newPos.z + this.resolution.y) % this.resolution.y
			currentNode.data.mesh.position.copy(newPos)
		}
		// New alignment: set each segment's bottom to match the head's bottom
		const headMesh = this.body.head.data.mesh
		const headBottom = headMesh.position.y - headMesh.scale.x / 2
		nodes.forEach((node) => {
			node.data.mesh.position.y = headBottom + node.data.mesh.scale.x / 2
		})
	}
}

// Classe interna para cada segmento da cobra
class SnakeNode extends Entity {
	constructor(resolution, baseColor, camoColors) { // Accept camoColors
		// Create unique camouflage texture for this segment
		const camouflageTexture = generateCamouflageTexture(baseColor, 256, Math.random(), camoColors) // Pass camoColors
		
		// Create material with camouflage texture
		const material = new MeshStandardMaterial({
			color: baseColor,
			map: camouflageTexture,
			roughness: 0.8,
			metalness: 0.1
		})
		
		const mesh = new Mesh(NODE_GEOMETRY, material)
		super(mesh, resolution)
	}

	updateCamouflage(newBaseColor, newCamoColors) {
		const newTexture = generateCamouflageTexture(newBaseColor, 256, Math.random(), newCamoColors);
		if (this.mesh && this.mesh.material) {
			this.mesh.material.map = newTexture;
			this.mesh.material.color.set(newBaseColor); // Also update the material's base color
			this.mesh.material.needsUpdate = true; // Important for texture changes
		}
	}

	// round the snake‐segment coords to nearest grid cell
	getIndexByCoord() {
		const p = this.mesh.position
		const x = Math.round(p.x)
		const z = Math.round(p.z)
		return x + z * this.resolution.x
	}
}
