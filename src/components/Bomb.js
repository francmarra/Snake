// --- Classe Bomb: representa uma bomba negativa na grelha ---
import {
    Group,
    Mesh,
    MeshStandardMaterial,
    MeshBasicMaterial,
    SphereGeometry,
    CylinderGeometry,
    PointLight
} from 'three'
import Entity from './Entity'
import gsap from 'gsap'

const BODY_GEOMETRY = new SphereGeometry(0.35, 20, 20)
const FUSE_GEOMETRY = new CylinderGeometry(0.05, 0.05, 0.2, 8)
const FUSE_TIP_GEOMETRY = new SphereGeometry(0.12, 8, 8) // Increased size
const SPARK_GEOMETRY = new SphereGeometry(0.04, 6, 6) // Doubled spark size

export default class Bomb extends Entity {
    constructor(resolution, color) {
        // Cria um grupo para conter o corpo e o pavio da bomba
        const bomb = new Group()

        // Corpo da bomba
        const bodyMat = new MeshStandardMaterial({ color: color || 0x111111 })
        const bombBody = new Mesh(BODY_GEOMETRY, bodyMat)

        // Pavio
        const fuseMesh = new MeshStandardMaterial({ color: 0xff0000 })
        const fuse = new Mesh(FUSE_GEOMETRY, fuseMesh)
        fuse.position.y = 0.35 + 0.1  // levanta o pavio acima do corpo

        // Ponta do pavio acesa (brilhante)
        const fuseTipMat = new MeshBasicMaterial({ 
            color: 0xff2200,
            transparent: true,
            opacity: 1.0 // Increased opacity
        })
        const fuseTip = new Mesh(FUSE_TIP_GEOMETRY, fuseTipMat)
        fuseTip.position.y = 0.35 + 0.2 + 0.08 // Raised higher

        // Luz pontual para simular o brilho da ponta acesa - much brighter
        const fuseLight = new PointLight(0xff3300, 2.0, 3, 1.5) // Increased intensity and range
        fuseLight.position.copy(fuseTip.position)

        bomb.add(bombBody, fuse, fuseTip, fuseLight)
        super(bomb, resolution)

        // Store references for animations
        this.fuseTip = fuseTip
        this.fuseLight = fuseLight
        this.sparks = []
        this.sparkTimeline = null

        // Ensure all parts cast and receive shadows
        bombBody.castShadow = true
        bombBody.receiveShadow = true
        fuse.castShadow = true
        fuse.receiveShadow = true
        fuseTip.castShadow = true

        // Expõe o material do corpo no grupo
        this.mesh.material = bodyMat

        // Define pontos negativos aleatórios para a bomba
        this.points = Math.floor(Math.random() * 3) + 1
        bomb.scale.setScalar(0.5 + (this.points * 0.5) / 3)

        // Store original scale for animations
        this.originalScale = {
            x: bomb.scale.x,
            y: bomb.scale.y,
            z: bomb.scale.z
        }

        // Inicia o efeito de pulsação após um pequeno atraso
        setTimeout(() => {
            this.startPulsating(0.9, 1.1, 1.5);
            this.startFuseAnimation();
            this.startSparkEffect();
        }, 500);
    }

    // Animação da ponta do pavio acesa
    startFuseAnimation() {
        if (!this.fuseTip || !this.fuseLight) return

        // Pulsação da ponta do pavio - more dramatic
        gsap.to(this.fuseTip.scale, {
            x: 1.8, // Increased scale
            y: 1.8,
            z: 1.8,
            duration: 0.2, // Faster pulsing
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        })

        // Pulsação da intensidade da luz - much brighter
        gsap.to(this.fuseLight, {
            intensity: 3.5, // Much higher intensity
            duration: 0.25,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        })

        // Mudança sutil de cor da ponta - more dramatic color changes
        gsap.to(this.fuseTip.material.color, {
            r: 1,
            g: 0.8, // More orange/yellow
            b: 0,
            duration: 0.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        })
    }

    // Efeito de faíscas voando - much more frequent
    startSparkEffect() {
        this.sparkTimeline = gsap.timeline({ repeat: -1 })
        
        // Cria faíscas muito mais frequentemente
        this.sparkTimeline.add(() => {
            this.createSpark()
        })
        this.sparkTimeline.to({}, { duration: 0.1 + Math.random() * 0.2 }) // Much more frequent

        // Create multiple sparks at once for more dramatic effect
        this.sparkTimeline.add(() => {
            this.createSpark()
            setTimeout(() => this.createSpark(), 50)
            setTimeout(() => this.createSpark(), 100)
        })
        this.sparkTimeline.to({}, { duration: 0.2 + Math.random() * 0.3 })
    }

    createSpark() {
        if (!this.fuseTip) return

        // Cores mais brilhantes e variadas para as faíscas
        const sparkColors = [0xff0000, 0xff3300, 0xff6600, 0xff9900, 0xffcc00, 0xffff00, 0xffffff]
        const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)]

        // Material da faísca - more emissive
        const sparkMat = new MeshBasicMaterial({
            color: sparkColor,
            transparent: true,
            opacity: 1
        })

        // Geometria da faísca
        const spark = new Mesh(SPARK_GEOMETRY, sparkMat)
        
        // Posição inicial na ponta do pavio
        const fuseTopPos = this.fuseTip.position.clone()
        spark.position.copy(fuseTopPos)
        
        // Adiciona a faísca ao grupo da bomba
        this.mesh.add(spark)
        this.sparks.push(spark)

        // Direção aleatória para a faísca - wider spread
        const direction = {
            x: (Math.random() - 0.5) * 1.5, // Increased spread
            y: 0.5 + Math.random() * 0.8, // Higher trajectory
            z: (Math.random() - 0.5) * 1.5
        }

        // Random initial scale for variety
        const initialScale = 0.8 + Math.random() * 0.4
        spark.scale.setScalar(initialScale)

        // Anima a faísca
        const sparkTl = gsap.timeline({
            onComplete: () => {
                // Remove a faísca quando a animação termina
                this.mesh.remove(spark)
                const index = this.sparks.indexOf(spark)
                if (index > -1) {
                    this.sparks.splice(index, 1)
                }
                spark.geometry.dispose()
                spark.material.dispose()
            }
        })

        // Movimento da faísca - longer travel distance
        sparkTl.to(spark.position, {
            x: fuseTopPos.x + direction.x * 1.5, // Increased travel distance
            y: fuseTopPos.y + direction.y,
            z: fuseTopPos.z + direction.z * 1.5,
            duration: 1.2 + Math.random() * 0.6, // Longer duration
            ease: "power2.out"
        }, 0)

        // Fade out da faísca
        sparkTl.to(spark.material, {
            opacity: 0,
            duration: 0.8, // Longer fade
            ease: "power2.out"
        }, 0.4)

        // Diminuição do tamanho
        sparkTl.to(spark.scale, {
            x: 0.05, // Don't shrink as much
            y: 0.05,
            z: 0.05,
            duration: 1.0,
            ease: "power2.out"
        }, 0)

        // Add subtle rotation for more dynamic effect
        sparkTl.to(spark.rotation, {
            x: Math.random() * Math.PI * 2,
            y: Math.random() * Math.PI * 2,
            z: Math.random() * Math.PI * 2,
            duration: 1.0,
            ease: "none"
        }, 0)
    }

    // Para as animações da ponta do pavio e faíscas
    stopFuseAnimations() {
        if (this.fuseTip) {
            gsap.killTweensOf(this.fuseTip.scale)
            gsap.killTweensOf(this.fuseTip.material.color)
        }
        if (this.fuseLight) {
            gsap.killTweensOf(this.fuseLight)
        }
        if (this.sparkTimeline) {
            this.sparkTimeline.kill()
            this.sparkTimeline = null
        }
        
        // Remove todas as faíscas restantes
        this.sparks.forEach(spark => {
            gsap.killTweensOf(spark.position)
            gsap.killTweensOf(spark.material)
            gsap.killTweensOf(spark.scale)
            this.mesh.remove(spark)
            spark.geometry.dispose()
            spark.material.dispose()
        })
        this.sparks = []
    }

    // Sobrescreve o método in para adicionar efeito de pulsação após a animação de entrada
    in() {
        super.in(); // Chama o método pai primeiro

        // Começa a pulsar após a animação de entrada ser concluída
        setTimeout(() => {
            this.startPulsating(0.9, 1.1, 1.5);
            this.startFuseAnimation();
            this.startSparkEffect();
        }, 1000);
    }

    // Sobrescreve o método out para parar a pulsação antes de sair
    out() {
        this.stopPulsating();
        this.stopFuseAnimations();
        super.out();
    }

    // Override stopPulsating to also stop fuse animations
    stopPulsating() {
        super.stopPulsating();
        this.stopFuseAnimations();
    }
}
