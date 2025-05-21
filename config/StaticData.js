// --- Definições "Estáticas" ---

// --- Grelha ---
export const GRID_WIDTH = 20
export const GRID_HEIGHT = 20

// --- Câmara ---
export const CAMERA_FOV = 60
export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 1000

// --- Paletas ---
export const COLOR_PALETTES = {
	green: {
		groundColor: 0x56f854,
		fogColor: 0x39c09f,
		rockColor: 0xebebeb,
		treeColor: 0x639541,
		fruitColor: 0x1d5846,
		snakeColor: 0x1d5846,
		mouthColor: 0x39c09f,
	},
	orange: {
		groundColor: 0xd68a4c,
		fogColor: 0xffac38,
		rockColor: 0xacacac,
		treeColor: 0xa2d109,
		fruitColor: 0x614bdd,
		snakeColor: 0xff470a,
		mouthColor: 0x614bdd,
	},
	lilac: {
		groundColor: 0xd199ff,
		fogColor: 0xb04ce6,
		rockColor: 0xebebeb,
		treeColor: 0x53d0c1,
		fruitColor: 0x9900ff,
		snakeColor: 0xff2ed2,
		mouthColor: 0x614bdd,
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
	[35, 0, 10, 0.7],
]

// Pedras: [ [x, y, z], [escalaX, escalaY, escalaZ, rotY] ]
export const ROCK_DATA = [
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
	[[20 / 2 + 8, -0.5, 21.5], [0.8, 1, 0.8, 2]],
	// [ [0, -0.5, 0], [1, 1, 1, 0] ],
]
