// --- Classe base Entity: representa qualquer entidade na grelha ---


import gsap from 'gsap'

export default class Entity {
	constructor(mesh, resolution, option = { size: 1.5, number: 0.5 }) {
		this.mesh = mesh
		mesh.castShadow = true
		mesh.receiveShadow = true
		this.resolution = resolution
		this.option = option
	}

	// Devolve a posição da entidade
	get position() {
		return this.mesh.position
	}

	// Calcula o índice da grelha com base na posição
	getIndexByCoord() {
		const { x } = this.resolution
		return Math.round(this.position.z) * x + Math.round(this.position.x)
	}

	// Animação de entrada da entidade
	in() {
		gsap.from(this.mesh.scale, {
			duration: 1,
			x: 0,
			y: 0,
			z: 0,
			ease: `elastic.out(${this.option.size}, ${this.option.number})`,
		})
	}

	// Placeholder para animação de saída
	out() {}
}
