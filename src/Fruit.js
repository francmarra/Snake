// --- Classe Fruit: representa uma fruta colecionável ---


import {
    Group,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    CylinderGeometry
} from 'three'
import Entity from './Entity'

const BODY_GEOMETRY = new SphereGeometry(0.35, 20, 20)
const STEM_GEOMETRY = new CylinderGeometry(0.05, 0.05, 0.2, 8)

export default class Fruit extends Entity {
    constructor(resolution, color) {
        // Cria um grupo para conter o corpo e o caule da fruta
        const fruit = new Group()

        // Corpo da fruta
        const bodyMat = new MeshStandardMaterial({ color: color || 0x614bdd })
        const appleBody = new Mesh(BODY_GEOMETRY, bodyMat)

        // Caule
        const stemMat = new MeshStandardMaterial({ color: 0x4d2600 })
        const appleStem = new Mesh(STEM_GEOMETRY, stemMat)
        appleStem.position.y = 0.35 + 0.1  // levanta o caule acima do corpo

        fruit.add(appleBody, appleStem)
        super(fruit, resolution)

        // Expõe o material do corpo no grupo
        this.mesh.material = bodyMat

        // Define pontos aleatórios para a fruta
        this.points = Math.floor(Math.random() * 3) + 1
        fruit.scale.setScalar(0.5 + (this.points * 0.5) / 3)
    }
}
