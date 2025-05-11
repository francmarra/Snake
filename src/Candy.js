import {
    Group,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    CylinderGeometry,
} from 'three'
import Entity from './Entity'

const BODY_GEOMETRY = new SphereGeometry(0.35, 20, 20)
const STEM_GEOMETRY = new CylinderGeometry(0.05, 0.05, 0.2, 8)

export default class Candy extends Entity {
    constructor(resolution, color) {
        // create a group to hold body + stem
        const fruit = new Group()

        // apple body
        const bodyMat = new MeshStandardMaterial({ color: color || 0x614bdd })
        const appleBody = new Mesh(BODY_GEOMETRY, bodyMat)

        // stem
        const stemMat = new MeshStandardMaterial({ color: 0x4d2600 })
        const appleStem = new Mesh(STEM_GEOMETRY, stemMat)
        appleStem.position.y = 0.35 + 0.1  // lift stem above body

        fruit.add(appleBody, appleStem)
        super(fruit, resolution)

        // expose the body material on the group itself
        this.mesh.material = bodyMat

        // scale based on points
        this.points = Math.floor(Math.random() * 3) + 1
        fruit.scale.setScalar(0.5 + (this.points * 0.5) / 3)
    }
}
