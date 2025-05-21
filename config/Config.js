// --- Configurações de Gameplay ---

// Default settings that can be overridden
export const DEFAULT_SETTINGS = {
    numFruits: 1,
    numBombs: 1,
    numObjects: 20,
    snakeSpeed: 140,
    killOnBorderTrespass: false,
    ambientLightEnabled: true,
    directionalLightEnabled: true,
    pointLightEnabled: true
}

// Get current setting value - always returns the default value
export function getSetting(key) {
    return DEFAULT_SETTINGS[key];
}

// Save setting value - doesn't actually save to localStorage
export function saveSetting(key, value) {
    // This function is now a no-op - doesn't save to localStorage
    console.log(`Setting ${key} would have been saved as ${value}`);
}

// --- Gameplay ---
export const MOVEMENT_SPEED = getSetting('snakeSpeed') // ms per snake move
export const INITIAL_SNAKE_LENGTH = 4
export const NUM_ENTITIES = getSetting('numObjects') // number of rocks + trees spawned
export const NUM_FRUITS = getSetting('numFruits') // number of fruits present at a time
export const FRUIT_MIN_POINTS = 1
export const FRUIT_MAX_POINTS = 3

// --- Animation ---
export const ENTITY_IN_DURATION = 1 // seconds
export const ENTITY_IN_EASE = 'elastic.out(1.5, 0.5)'
