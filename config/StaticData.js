// --- Definições "Estáticas" ---

// --- Grelha ---
export const GRID_WIDTH = 20
export const GRID_HEIGHT = 20

// --- Câmara ---
export const CAMERA_FOV = 60
export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 1000

// --- Paletas ---
export const COLOR_PALETTES = {		day: {
		groundColor: 0x56f854,
		dirtColor: 0xa5756d,
		fogColor: 0x39c09f,
		rockColor: 0xebebeb,
		treeColor: 0x639541,
		fruitColor: 0x1d5846,
		snakeColor: 0x1d5846,
		mouthColor: 0x39c09f,
		flowerPetalColor: 0xff69b4,
		flowerCenterColor: 0xFFA500,
		mushroomCapColor: 0x8B4513,
		mushroomSpotColor: 0xFFFFE0,
		// Light configuration
		ambientLightColor: 0xffffff,
		directionalLightColor: 0xffffff,
		pointLightColor: 0xffaa00,
	},
		sunset: {
		groundColor: 0xaf4e69,
		dirtColor: 0xa5756d,
		fogColor: 0xffac38,
		rockColor: 0x7a454b,
		treeColor: 0x795c24,
		fruitColor: 0x614bdd,
		snakeColor: 0xff470a,
		mouthColor: 0xb35069,
		flowerPetalColor: 0xf48c06,
		flowerCenterColor: 0xffea00,
		mushroomCapColor: 0xe5383b,
		mushroomSpotColor: 0xFFFF99,
		// Light configuration - warm sunset colors
		ambientLightColor: 0xffd4a3,
		directionalLightColor: 0xffb366,
		pointLightColor: 0xff6b35,
	},
	night: {
		groundColor: 0xBC6595,
		dirtColor: 0xa5756d,
		fogColor: 0xb04ce6,
		rockColor: 0xebebeb,
		treeColor: 0x347f83,
		fruitColor: 0x9900ff,
		snakeColor: 0xff2ed2,
		mouthColor: 0x614bdd,
		flowerPetalColor: 0x9d4edd,
		flowerCenterColor: 0xffd6ff,
		mushroomCapColor: 0x1F44EA,
		mushroomSpotColor: 0x4CC9F0,
		// Light configuration - darker night colors
		ambientLightColor: 0x4d4d66,
		directionalLightColor: 0x6666b3,
		pointLightColor: 0x9d4edd,
	},
}

// Árvores: [x, y, z, escala]
export const TREE_DATA = [
	[-5, 0, 10, 1],
	[-6, 0, 15, 1.2],
	[-5, 0, 16, 0.8],
	[-10, 0, 4, 1.3],
	[-5, 0, -3, 2],
	[-4, 0, -4, 1.5],
	[-2, 0, -15, 1],
	[5, 0, -20, 1.2],
	[24, 0, -12, 1.2],
	[2, 0, -6, 1.2],
	[3, 0, -7, 1.8],
	[1, 0, -9, 1.0],
	[15, 0, -8, 1.8],
	[17, 0, -9, 1.1],
	[18, 0, -7, 1.3],
	[24, 0, -1, 1.3],
	[26, 0, 0, 1.8],
	[32, 0, 0, 1],
	[28, 0, 6, 1.7],
	[24, 0, 15, 1.1],
	[16, 0, 23, 1.1],
	[12, 0, 24, 0.9],
	[-13, 0, -13, 0.7],
	[35, 0, 10, 0.7]
]

// Pedras: [ [x, y, z], [escalaX, escalaY, escalaZ, rotY] ]
export const ROCK_DATA = [
	// Original rocks
	[[-7, -0.5, 2], [2, 8, 3, 2.8]],
	[[-3, -0.5, -10], [3, 2, 2.5, 1.5]],
	[[-5, -0.5, 3], [1, 1.5, 2, 0.8]],
	[[20 + 5, -0.5, 3], [4, 1, 3, 1]],
	[[20 + 4, -0.5, 2], [2, 2, 1, 1]],
	[[20 + 8, -0.5, 16], [6, 2, 4, 4]],
	[[20 + 6, -0.5, 13], [3, 2, 2.5, 3.2]],
	[[20 + 5, -0.5, -8], [1, 1, 1, 0]],
	[[20 + 6, -0.5, -7], [2, 4, 1.5, 0.5]],
	[[-5, -0.5, 14], [1, 3, 2, 0]],
	[[-4, -0.5, 15], [0.8, 0.6, 0.7, 0]],
	[[20 / 2 + 5, -0.5, 25], [2.5, 0.8, 4, 2]],
	[[20 / 2 + 9, -0.5, 22], [1.2, 2, 1.2, 1]],
	[[20 / 2 + 8, -0.5, 21.5], [0.8, 1, 0.8, 2]]
]

// Flores: [x, y, z, escala]
export const FLOWER_DATA = [
	[-3, 0, 8, 0.8],
	[-8, 0, 12, 1.2],
	[-2, 0, 18, 0.9],
	[4, 0, -12, 1.1],
	[8, 0, -8, 0.7],
	[-2, 0, 5, 1.3],
	[23, 0, 12, 0.8],
	[22, 0, 8, 1.0],
	[6, 0, 22, 1.1],
	[22, 0, 18, 0.9],
	[-12, 0, -5, 1.2],
	[-8, 0, 25, 0.8],
	[28, 0, -3, 1.0],
	[32, 0, 12, 0.9],
	[25, 0, 20, 1.1],
	[-6, 0, -8, 0.7],
	[26, 0, -12, 0.8],
	[-10, 0, 26, 0.9],
	[30, 0, 25, 1.0],
]

// Cogumelos: [x, y, z, escala]
export const MUSHROOM_DATA = [
	[-4, 0, 6, 0.8],
	[-9, 0, 14, 1.1],
	[-2, 0, 16, 0.9],
	[7, 0, -10, 1.0],
	[11, 0, -6, 0.7],
	[-6, 0, 7, 1.2],
	[-3, 0, 14, 0.8],
	[8, 0, 24, 1.0],
	[3, 0, 25, 0.9],
	[-7, 0, -12, 1.1],
	[24, 0, -8, 0.8],
	[21, 0, 3, 1.0],
	[24, 0, 13, 0.9],
	[-14, 0, 20, 1.2],
	[14, 0, -2, 0.7],
]
