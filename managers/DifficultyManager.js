import { DIFFICULTY_LEVELS, DIFFICULTY_PRESETS, setCurrentDifficulty, applyDifficultySettings } from '../config/DifficultyConfig.js'
import gsap from 'gsap'

export class DifficultyManager {
    constructor(DEFAULT_SETTINGS, onDifficultySelected) {
        this.DEFAULT_SETTINGS = DEFAULT_SETTINGS
        this.onDifficultySelected = onDifficultySelected
        this.modal = document.getElementById('difficulty-modal')
        this.initializeButtons()
    }

    initializeButtons() {
        // Botão Fácil
        document.getElementById('difficulty-easy').addEventListener('click', () => {
            this.selectDifficulty(DIFFICULTY_LEVELS.EASY)
        })

        // Botão Normal
        document.getElementById('difficulty-normal').addEventListener('click', () => {
            this.selectDifficulty(DIFFICULTY_LEVELS.NORMAL)
        })

        // Botão Difícil
        document.getElementById('difficulty-hard').addEventListener('click', () => {
            this.selectDifficulty(DIFFICULTY_LEVELS.HARD)
        })

        // Botão Personalizado
        document.getElementById('difficulty-custom').addEventListener('click', () => {
            this.selectDifficulty(DIFFICULTY_LEVELS.CUSTOM)
        })
    }

    selectDifficulty(difficulty) {
        setCurrentDifficulty(difficulty)
        
        if (difficulty !== DIFFICULTY_LEVELS.CUSTOM) {
            // Aplica as configurações predefinidas
            applyDifficultySettings(difficulty, this.DEFAULT_SETTINGS)
        }

        this.hideModal(() => {
            // Chama o callback para atualizar a interface e iniciar o jogo
            if (this.onDifficultySelected) {
                this.onDifficultySelected(difficulty)
            }
        })
    }

    showModal() {
        this.modal.style.pointerEvents = 'auto'
        
        gsap.to(this.modal, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        })

        gsap.to(this.modal.querySelector('.bg-gray-800'), {
            scale: 1,
            duration: 0.3,
            delay: 0.1,
            ease: "back.out(1.7)"
        })
    }

    hideModal(callback) {
        gsap.to(this.modal.querySelector('.bg-gray-800'), {
            scale: 0.9,
            duration: 0.2,
            ease: "power2.in"
        })

        gsap.to(this.modal, {
            opacity: 0,
            duration: 0.3,
            delay: 0.1,
            ease: "power2.in",
            onComplete: () => {
                this.modal.style.pointerEvents = 'none'
                if (callback) callback()
            }
        })
    }
}
