// --- Classe Bomb: representa uma bomba negativa na grelha ---
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
        // Cria um grupo para conter o corpo e o pavio da bomba
        const bomb = new Group()

        // Corpo da bomba
        const bodyMat = new MeshStandardMaterial({ color: color || 0x111111 })
        const bombBody = new Mesh(BODY_GEOMETRY, bodyMat)

        // Pavio
        const fuseMesh = new MeshStandardMaterial({ color: 0xff0000 })
        const fuse = new Mesh(FUSE_GEOMETRY, fuseMesh)
        fuse.position.y = 0.35 + 0.1  // levanta o pavio acima do corpo

        bomb.add(bombBody, fuse)
        super(bomb, resolution)

        // Expõe o material do corpo no grupo
        this.mesh.material = bodyMat

        // Define pontos negativos aleatórios para a bomba
        this.points = Math.floor(Math.random() * 3) + 1
        bomb.scale.setScalar(0.5 + (this.points * 0.5) / 3)

        // Inicia o efeito de pulsação após um pequeno atraso
        setTimeout(() => {
            this.startPulsating(0.9, 1.1, 1.5);
        }, 500);
    }

    // Sobrescreve o método in para adicionar efeito de pulsação após a animação de entrada
    in() {
        super.in(); // Chama o método pai primeiro

        // Começa a pulsar após a animação de entrada ser concluída
        setTimeout(() => {
            this.startPulsating(0.9, 1.1, 1.5);
        }, 1000);
    }

    // Sobrescreve o método out para parar a pulsação antes de sair
    out() {
        this.stopPulsating();
        super.out();
    }
}
