// --- Classe Tree: representa uma árvore decorativa ---

import {
    IcosahedronGeometry,
    Mesh,
    MeshNormalMaterial,
    MeshStandardMaterial,
    CylinderGeometry,
    Group,
} from 'three'
import Entity from './Entity'

const GEOMETRY = new IcosahedronGeometry(0.3)
GEOMETRY.rotateX(Math.random() * Math.PI * 2)
GEOMETRY.scale(3, 6, 3)
const MATERIAL = new MeshStandardMaterial({
    flatShading: true,
    color: 0xa2d109,
})
const TRUNK_GEOMETRY = new CylinderGeometry(0.3, 0.4, 1, 12)
const TRUNK_MATERIAL = new MeshStandardMaterial({ flatShading: true, color: 0x8b4513 })

export default class Tree extends Entity {
    constructor(resolution, color) {
        // Cria uma árvore com tronco e folhagem
        const group = new Group()
        const scale = 0.6 + Math.random() * 0.6

        // Folhagem
        const foliage = new Mesh(GEOMETRY, MATERIAL)
        foliage.scale.setScalar(scale)
        foliage.rotation.y = Math.random() * Math.PI * 2
        // Posiciona a folhagem sobre o tronco (tronco + metade da altura da folhagem)
        foliage.position.y = scale * 1.9
        if (color) {
            MATERIAL.color.set(color)
        }

        // Tronco
        const trunk = new Mesh(TRUNK_GEOMETRY, TRUNK_MATERIAL)
        // Ajusta altura do tronco com base na escala
        trunk.scale.set(scale * 0.5, scale, scale * 0.5)
        // Posiciona o tronco com sua base na origem
        trunk.position.y = 0
        
        group.add(trunk)
        group.add(foliage)
        
        // Reposiciona todo o grupo para que o centro da base do tronco seja a origem
        group.position.y = 0

        // Inicializa Entity e expõe foliage para mudanças de cor
        super(group, resolution)
        // Permite alteração de cor da folhagem via mesh.material
        this.foliage = foliage
        // Exponha material para compatibilidade com applyPalette
        this.mesh.material = this.foliage.material
    }
}
