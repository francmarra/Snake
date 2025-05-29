// --- Classe base Entity: representa qualquer entidade na grelha ---


import gsap from 'gsap'

export default class Entity {
	constructor(mesh, resolution, option = { size: 1.5, number: 0.5 }) {
		this.mesh = mesh
		mesh.castShadow = true
		mesh.receiveShadow = true
		this.resolution = resolution
		this.option = option
		
		// Properties for pulsating animation
		this.originalScale = null
		this.isPulsating = false
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
	
	// Start pulsating animation
	startPulsating(minScale = 0.9, maxScale = 1.3, duration = 1.2) {
		// Store original scale if not already stored
		if (!this.originalScale) {
			this.originalScale = {
				x: this.mesh.scale.x,
				y: this.mesh.scale.y,
				z: this.mesh.scale.z
			}
		}
		
		// If already pulsating, don't start again
		if (this.isPulsating) return;
		
		this.isPulsating = true;
		
		// Create the pulsating animation
		const timeline = gsap.timeline({
			repeat: -1, // Infinitely repeat
			yoyo: true, // Go back and forth
			onComplete: () => {
				this.isPulsating = false;
			}
		});
		
		// Scale up and down smoothly
		timeline.to(this.mesh.scale, {
			x: this.originalScale.x * maxScale,
			y: this.originalScale.y * maxScale,
			z: this.originalScale.z * maxScale,
			duration: duration / 2,
			ease: 'sine.inOut'
		}).to(this.mesh.scale, {
			x: this.originalScale.x * minScale,
			y: this.originalScale.y * minScale,
			z: this.originalScale.z * minScale,
			duration: duration / 2,
			ease: 'sine.inOut'
		});
		
		// Store the timeline for potential future reference
		this.pulseTween = timeline;
	}
	
	// Stop pulsating animation
	stopPulsating() {
		if (this.pulseTween) {
			this.pulseTween.kill();
			this.isPulsating = false;
			
			// Reset to original scale if available
			if (this.originalScale) {
				gsap.to(this.mesh.scale, {
					x: this.originalScale.x,
					y: this.originalScale.y,
					z: this.originalScale.z,
					duration: 0.3,
					ease: 'power2.out'
				});
			}
		}
	}
}
