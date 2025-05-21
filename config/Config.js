// --- Definições de Jogabilidade ---

// Definições por defeito que podem ser sobrescritas
export const DEFAULT_SETTINGS = {
    numFruits: 1,
    numBombs: 1,
    numObjects: 25,
    snakeSpeed: 220,
    killOnBorderTrespass: false,
    ambientLightEnabled: true,
    directionalLightEnabled: true,
    pointLightEnabled: false,
    showMinimap: true
}

// Obter valor da definição atual - devolve sempre o valor por defeito
export function getSetting(key) {
    return DEFAULT_SETTINGS[key];
}

// Guardar valor da definição - não guarda realmente em localStorage
export function saveSetting(key, value) {
    // Esta função é agora um no-op - não guarda em localStorage
    console.log(`Setting ${key} would have been saved as ${value}`);
}

// --- Jogabilidade ---
export const MOVEMENT_SPEED = getSetting('snakeSpeed') // ms por movimento da cobra
export const INITIAL_SNAKE_LENGTH = 4
export const NUM_ENTITIES = getSetting('numObjects') // número de rochas + árvores geradas
export const NUM_FRUITS = getSetting('numFruits') // número de frutas presentes ao mesmo tempo
export const FRUIT_MIN_POINTS = 1
export const FRUIT_MAX_POINTS = 3

// --- Animação ---
export const ENTITY_IN_DURATION = 1 // segundos
export const ENTITY_IN_EASE = 'elastic.out(1.5, 0.5)'
