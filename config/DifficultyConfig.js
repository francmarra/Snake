// Configurações predefinidas para cada dificuldade
export const DIFFICULTY_PRESETS = {
    EASY: {
        name: 'Fácil',
        numFruits: 2,
        numBombs: 0,
        numObjects: 10,
        snakeSpeed: 300, // mais lento
        killOnBorderTrespass: false,
        ambientLightEnabled: true,
        directionalLightEnabled: true,
        pointLightEnabled: false,
        showMinimap: true
    },
    NORMAL: {
        name: 'Normal',
        numFruits: 1,
        numBombs: 1,
        numObjects: 20,
        snakeSpeed: 220, // velocidade média
        killOnBorderTrespass: false,
        ambientLightEnabled: true,
        directionalLightEnabled: true,
        pointLightEnabled: false,
        showMinimap: true
    },
    HARD: {
        name: 'Difícil',
        numFruits: 1,
        numBombs: 3,
        numObjects: 30,
        snakeSpeed: 150, // mais rápido
        killOnBorderTrespass: true, // morre nas bordas
        ambientLightEnabled: true,
        directionalLightEnabled: true,
        pointLightEnabled: false,
        showMinimap: true
    }
}

export const DIFFICULTY_LEVELS = {
    EASY: 'EASY',
    NORMAL: 'NORMAL',
    HARD: 'HARD',
    CUSTOM: 'CUSTOM'
}

// Estado atual da dificuldade
export let currentDifficulty = DIFFICULTY_LEVELS.NORMAL

// Função para definir a dificuldade atual
export function setCurrentDifficulty(difficulty) {
    currentDifficulty = difficulty
}

// Função para obter as configurações da dificuldade atual
export function getCurrentDifficultySettings() {
    if (currentDifficulty === DIFFICULTY_LEVELS.CUSTOM) {
        return null // Para modo personalizado, usa as configurações atuais
    }
    return DIFFICULTY_PRESETS[currentDifficulty]
}

// Função para aplicar configurações de uma dificuldade
export function applyDifficultySettings(difficulty, DEFAULT_SETTINGS) {
    const settings = DIFFICULTY_PRESETS[difficulty]
    if (settings) {
        Object.assign(DEFAULT_SETTINGS, settings)
        return true
    }
    return false
}
