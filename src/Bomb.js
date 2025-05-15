import {
    Group,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    CylinderGeometry
} from 'three'
import Entity from './Entity'

const BODY_GEOMETRY = new SphereGeometry(0.35, 20, 20)
const FUSE_GEOMETRY = new CylinderGeometry(0.05, 0.05, 0.2, 8)

export default class Bomb extends Entity {
    constructor(resolution, color) {
        // cria um grupo para conter corpo + o pavio
        const bomb = new Group()

        // corpo da bomba
        const bodyMat = new MeshStandardMaterial({ color: color || 0x111111 })
        const bombBody = new Mesh(BODY_GEOMETRY, bodyMat)

        // pavio
        const fuseMesh = new MeshStandardMaterial({ color: 0xff0000 })
        const fuse = new Mesh(FUSE_GEOMETRY, fuseMesh)
        fuse.position.y = 0.35 + 0.1  // levanta o pavio acima do corpo

        bomb.add(bombBody, fuse)
        super(bomb, resolution)

        // expose the body material on the group itself
        this.mesh.material = bodyMat

        // scale based on points
        this.points = Math.floor(Math.random() * 3) + 1
        bomb.scale.setScalar(0.5 + (this.points * 0.5) / 3)
    }
}
