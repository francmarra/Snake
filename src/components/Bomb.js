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
const SHARED_SPARK_GEOMETRY = new SphereGeometry(0.04, 6, 6) // Renamed and ensured it's shared

const MAX_ACTIVE_SPARKS_PER_BOMB = 7; // Limit concurrent sparks for a single bomb
const SPARK_POOL_MAX_SIZE = 50; // Maximum size of the global spark pool
const GlobalSparkPool = []; // Global pool for spark Mesh objects

// Helper function to get a spark from the pool or create a new one
function getSparkFromPool() {
    if (GlobalSparkPool.length > 0) {
        const spark = GlobalSparkPool.pop();
        spark.visible = true;
        // Ensure material exists and reset its properties
        if (!spark.material) {
            spark.material = new MeshBasicMaterial({ transparent: true, opacity: 1.0 });
        } else {
            spark.material.opacity = 1.0;
            spark.material.needsUpdate = true; // Important if material properties were changed
        }
        return spark;
    }
    // Pool is empty, create a new spark
    const sparkMaterial = new MeshBasicMaterial({ transparent: true, opacity: 1.0 });
    return new Mesh(SHARED_SPARK_GEOMETRY, sparkMaterial);
}

// Helper function to return a spark to the pool
function returnSparkToPool(spark) {
    if (!spark) return;

    spark.visible = false;
    if (spark.parent) {
        spark.parent.remove(spark);
    }
    // Kill any ongoing GSAP animations on the spark
    gsap.killTweensOf(spark.position);
    gsap.killTweensOf(spark.material);
    gsap.killTweensOf(spark.scale);
    gsap.killTweensOf(spark.rotation);

    if (GlobalSparkPool.length < SPARK_POOL_MAX_SIZE) {
        GlobalSparkPool.push(spark);
    } else {
        // Pool is full, dispose of the spark's material. Geometry is shared.
        if (spark.material) spark.material.dispose();
        // The Mesh object itself will be garbage collected if not in the pool.
    }
}

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
        this.activeSparks = [] // Changed from this.sparks to this.activeSparks
        this.sparkTimeline = null
        this.animationsStarted = false // Track if animations have started

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

        // Defer animation start to reduce initial frame rate impact
        // Use a random delay to stagger bomb animations
        const animationDelay = 200 + Math.random() * 800; // 200-1000ms delay
        setTimeout(() => {
            if (!this.animationsStarted) {
                this.startPulsating(0.9, 1.1, 1.5);
                this.startFuseAnimation();
                // Delay spark effect even more to reduce initial load
                setTimeout(() => {
                    this.startSparkEffect();
                }, 300 + Math.random() * 500); // Additional 300-800ms delay for sparks
                this.animationsStarted = true;
            }
        }, animationDelay);
    }

    // Animação da ponta do pavio acesa
    startFuseAnimation() {
        if (!this.fuseTip || !this.fuseLight) return

        // Reduce initial light intensity for smoother startup
        this.fuseLight.intensity = 1.5; // Start lower, will animate up

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

        // Pulsação da intensidade da luz - gradually increase to full brightness
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
        if (this.sparkTimeline) { // Prevent multiple timelines if called again
            this.sparkTimeline.kill();
        }
        
        // Start with longer intervals to ease into the effect
        let currentInterval = 0.5; // Start slower
        const targetInterval = 0.1; // Target faster interval
        const intervalStep = 0.05; // How much to decrease each time
        
        this.sparkTimeline = gsap.timeline({ repeat: -1 })
        
        // Gradually increase spark frequency
        const createGradualSparks = () => {
            this.sparkTimeline.add(() => {
                if (this.activeSparks.length < MAX_ACTIVE_SPARKS_PER_BOMB) {
                    this.createSpark();
                }
            })
            
            // Gradually decrease interval to increase frequency
            if (currentInterval > targetInterval) {
                currentInterval = Math.max(targetInterval, currentInterval - intervalStep);
            }
            
            this.sparkTimeline.to({}, { duration: currentInterval + Math.random() * 0.2 })
        };
        
        // Start the gradual spark creation
        createGradualSparks();

        // Create multiple sparks at once for more dramatic effect (after initial ramp-up)
        setTimeout(() => {
            this.sparkTimeline.add(() => {
                if (this.activeSparks.length < MAX_ACTIVE_SPARKS_PER_BOMB) this.createSpark();
                // Add more sparks only if under the limit
                if (this.activeSparks.length < MAX_ACTIVE_SPARKS_PER_BOMB) {
                    setTimeout(() => {
                        if (this.activeSparks.length < MAX_ACTIVE_SPARKS_PER_BOMB) this.createSpark();
                    }, 50);
                }
                if (this.activeSparks.length < MAX_ACTIVE_SPARKS_PER_BOMB) {
                    setTimeout(() => {
                        if (this.activeSparks.length < MAX_ACTIVE_SPARKS_PER_BOMB) this.createSpark();
                    }, 100);
                }
            })
            this.sparkTimeline.to({}, { duration: 0.2 + Math.random() * 0.3 })
        }, 2000); // Wait 2 seconds before ramping up to full effect
    }

    createSpark() {
        if (!this.fuseTip || this.activeSparks.length >= MAX_ACTIVE_SPARKS_PER_BOMB) return;

        const spark = getSparkFromPool();
        // spark.geometry is SHARED_SPARK_GEOMETRY, material is new or reset

        // Cores mais brilhantes e variadas para as faíscas
        const sparkColors = [0xff0000, 0xff3300, 0xff6600, 0xff9900, 0xffcc00, 0xffff00, 0xffffff]
        const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)]
        spark.material.color.setHex(sparkColor); // Set color on the existing/new material
        
        // Posição inicial na ponta do pavio
        const fuseTopPos = this.fuseTip.position.clone()
        spark.position.copy(fuseTopPos)
        
        // Adiciona a faísca ao grupo da bomba
        this.mesh.add(spark)
        this.activeSparks.push(spark) // Use activeSparks

        // Direção aleatória para a faísca - wider spread
        const direction = {
            x: (Math.random() - 0.5) * 1.5, // Increased spread
            y: 0.5 + Math.random() * 0.8, // Higher trajectory
            z: (Math.random() - 0.5) * 1.5
        }

        // Random initial scale for variety
        const initialScale = 0.8 + Math.random() * 0.4
        spark.scale.setScalar(initialScale)
        spark.rotation.set(0,0,0); // Reset rotation before animation

        // Anima a faísca
        const sparkTl = gsap.timeline({
            onComplete: () => {
                // Remove a faísca quando a animação termina
                const index = this.activeSparks.indexOf(spark) // Use activeSparks
                if (index > -1) {
                    this.activeSparks.splice(index, 1) // Use activeSparks
                }
                returnSparkToPool(spark); // Return to pool instead of disposing
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
        
        // Remove todas as faíscas restantes e return to pool
        while (this.activeSparks.length > 0) { // Use activeSparks
            const spark = this.activeSparks.pop(); // Use activeSparks
            returnSparkToPool(spark);
        }
    }

    // Sobrescreve o método in para adicionar efeito de pulsação após a animação de entrada
    in() {
        super.in(); // Chama o método pai primeiro

        // Only start animations if they haven't started yet (avoid double-start)
        if (!this.animationsStarted) {
            // Começa a pulsar após a animação de entrada ser concluída
            setTimeout(() => {
                this.startPulsating(0.9, 1.1, 1.5);
                this.startFuseAnimation();
                setTimeout(() => {
                    this.startSparkEffect();
                }, 500); // Delay spark effect
                this.animationsStarted = true;
            }, 1000);
        }
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
