import { toggleAmbientLight, toggleDirectionalLight, togglePointLight } from '../src/utils/Lights'
import { animateSettingsGear, animatePaletteSelectors } from '../src/utils/Animations.js'
import gsap from 'gsap'

// Helper function to toggle minimap visibility - moved up before it's used
export function toggleMinimap(visible) {
  const minimapContainer = document.getElementById('minimap-container')
  if (minimapContainer) {
    if (visible) {
      // Show with animation
      minimapContainer.style.display = 'block'
      minimapContainer.style.opacity = '0'
      minimapContainer.style.transform = 'scale(0.7) translateY(30px)'
      
      gsap.to(minimapContainer, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
      })
    } else {
      // Hide with animation
      gsap.to(minimapContainer, {
        opacity: 0,
        scale: 0.7,
        y: 30,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          minimapContainer.style.display = 'none'
        }
      })
    }
  }
}

export function initializeSettings(DEFAULT_SETTINGS, scene, addFruit, addBomb, addEntity, candies, bombs, entities, animateSettingsTab, paletteName) {
  // Inicializa controlos de definições
  const controls = [
    { rangeId: 'fruits-range', valueId: 'fruits-value', setting: 'numFruits' },
    { rangeId: 'bombs-range', valueId: 'bombs-value', setting: 'numBombs' },
    { rangeId: 'objects-range', valueId: 'objects-value', setting: 'numObjects' },
    { rangeId: 'speed-range', valueId: 'speed-value', setting: 'snakeSpeed' }
  ]
  controls.forEach(({ rangeId, valueId, setting }) => {
    const range = document.getElementById(rangeId)
    const display = document.getElementById(valueId)
    if (range && display) {
      const defaultValue = setting === 'snakeSpeed' ? 5 : DEFAULT_SETTINGS[setting]
      range.value = defaultValue
      display.textContent = defaultValue
      range.addEventListener('input', () => {
        // Impede alterações durante o jogo
        if (window.isRunning) {
          range.value = defaultValue
          display.textContent = range.value
          return
        }
        display.textContent = range.value
        const value = parseInt(range.value)
        switch (setting) {
          case 'snakeSpeed':
            break
          case 'numFruits':
            // Adiciona ou remove frutas conforme necessário
            while (candies.length > value) {
              const fruit = candies.pop()
              scene.remove(fruit.mesh)
            }
            while (candies.length < value) {
              addFruit()
            }
            break
          case 'numBombs':
            // Adiciona ou remove bombas conforme necessário
            while (bombs.length > value) {
              const bomb = bombs.pop()
              scene.remove(bomb.mesh)
            }
            while (bombs.length < value) {
              addBomb()
            }
            break
          case 'numObjects':
            // Adiciona ou remove entidades conforme necessário
            while (entities.length > value) {
              const entity = entities.pop()
              scene.remove(entity.mesh)
            }
            while (entities.length < value) {
              addEntity()
            }
            break
        }
      })
    }
  })

  // Checkbox para matar ao atravessar bordas
  const borderKillCheckbox = document.getElementById('kill-borders')
  if (borderKillCheckbox) {
    borderKillCheckbox.checked = DEFAULT_SETTINGS.killOnBorderTrespass
    borderKillCheckbox.addEventListener('change', () => {
        if (window.isRunning) {
            borderKillCheckbox.checked = DEFAULT_SETTINGS.killOnBorderTrespass
            return
        }
        // Update the default setting when not running
        DEFAULT_SETTINGS.killOnBorderTrespass = borderKillCheckbox.checked
    })
  }

  // Checkbox para luz ambiente
  const ambientLightCheckbox = document.getElementById('ambient-light')
  if (ambientLightCheckbox) {
    ambientLightCheckbox.checked = DEFAULT_SETTINGS.ambientLightEnabled
    ambientLightCheckbox.addEventListener('change', () => {
      toggleAmbientLight(ambientLightCheckbox.checked)
    })
  }

  // Checkbox para luz direcional
  const directionalLightCheckbox = document.getElementById('directional-light')
  if (directionalLightCheckbox) {
    directionalLightCheckbox.checked = DEFAULT_SETTINGS.directionalLightEnabled
    directionalLightCheckbox.addEventListener('change', () => {
      toggleDirectionalLight(directionalLightCheckbox.checked)
    })
  }

  // Checkbox para luz pontual
  const pointLightCheckbox = document.getElementById('point-light')
  if (pointLightCheckbox) {
    pointLightCheckbox.checked = DEFAULT_SETTINGS.pointLightEnabled
    pointLightCheckbox.addEventListener('change', () => {
      togglePointLight(pointLightCheckbox.checked)
    })
  }

  // Checkbox for minimap visibility
  const minimapCheckbox = document.getElementById('show-minimap')
  if (minimapCheckbox) {
    minimapCheckbox.checked = DEFAULT_SETTINGS.showMinimap
    minimapCheckbox.addEventListener('change', () => {
      toggleMinimap(minimapCheckbox.checked)
    })
  }

  // Aplica tema ao sidebar de definições
  const settingsSidebar = document.getElementById('settings-sidebar')
  if (settingsSidebar) {
    settingsSidebar.classList.add(`theme-${paletteName.toLowerCase()}`)
  }

  // Aplica tema ao separador de definições
  const settingsTab = document.getElementById('settings-tab')
  if (settingsTab) {
    settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`)
    settingsTab.addEventListener('click', () => {
      settingsSidebar.classList.add('open')
      animateSettingsTab(settingsTab, false)
    })
  }
}

export class UIController {
  constructor(paletteName, capitalize) {
    this.paletteName = paletteName
    this.capitalize = capitalize
    
    this.setupSettingsButton()
    this.setupPaletteSelectors()
  }
  
  setupSettingsButton() {
    const btnSettings = document.getElementById('btn-settings')
    const btnSettingsImg = document.getElementById('btn-settings-img')
    
    if (!btnSettings) return
    
    btnSettings.addEventListener('mouseenter', function () {
      this.style.transform = 'translate(-50%, -50%) scale(1.15)'
      this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)'
    })
    btnSettings.addEventListener('mouseleave', function () {
      this.style.transform = 'translate(-50%, -50%) scale(1)'
      this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)'
    })
    
    btnSettings.addEventListener('click', () => {
      const gear = btnSettings.querySelector('img[alt="Settings Gear"]')
      if (gear) {
        animateSettingsGear(gear)
      }
      
      // Toggle settings sidebar
      const settingsSidebar = document.getElementById('settings-sidebar')
      if (settingsSidebar.classList.contains('open')) {
        this.closeSettings()
      } else {
        settingsSidebar.classList.add('open')
      }
    })
  }
  
  setupPaletteSelectors() {
    const sideBar = document.querySelector('.top-bar')
    const paletteSelectors = document.querySelectorAll('[data-color]')
    
    // Animate palette selectors with or without sidebar
    animatePaletteSelectors(paletteSelectors, sideBar)
    
    paletteSelectors.forEach((selector) =>
      selector.addEventListener('click', (event) => {
        const paletteName = event.target.closest('[data-color]').dataset.color
        // Dispatch custom event for palette change
        window.dispatchEvent(new CustomEvent('paletteChange', { detail: { paletteName } }))
      })
    )
  }
  
  closeSettings() {
    const settingsSidebar = document.getElementById('settings-sidebar')
    if (settingsSidebar) {
      settingsSidebar.classList.remove('open')
      
      // Blur all input elements to remove focus
      const inputs = settingsSidebar.querySelectorAll('input, button, select, textarea')
      inputs.forEach(input => input.blur())
    }
  }
  
  updateSettingsIcon(paletteName) {
    const btnSettingsImg = document.getElementById('btn-settings-img')
    if (!btnSettingsImg) return
    btnSettingsImg.src = `/assets/images/themes/${paletteName.toLowerCase()}/${this.capitalize(paletteName)}Settings.svg`
  }
  
  updatePaletteTheme(paletteName) {
    this.paletteName = paletteName
    this.updateSettingsIcon(paletteName)
      // Update settings tab theme
    const settingsTab = document.getElementById('settings-tab')
    if (settingsTab) {
      // Remove all theme classes
      settingsTab.classList.remove('theme-day', 'theme-night', 'theme-sunset')
      // Add the current theme class
      settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`)
    }
    
    // Update settings sidebar theme
    const settingsSidebar = document.getElementById('settings-sidebar')
    if (settingsSidebar) {
      // Remove all theme classes
      settingsSidebar.classList.remove('theme-day', 'theme-night', 'theme-sunset')
      // Add the current theme class
      settingsSidebar.classList.add(`theme-${paletteName.toLowerCase()}`)
    }
  }
  
  updateCameraIcon(paletteName) {
    const btnToggleCameraImg = document.getElementById('btn-toggle-camera-img')
    if (btnToggleCameraImg) {
      btnToggleCameraImg.src = `/assets/images/themes/${paletteName.toLowerCase()}/${this.capitalize(paletteName)}Camera.svg`
    }
  }
  
  updatePlayIcon(paletteName) {
    const btnPlayImg = document.getElementById('btn-play-img')
    if (btnPlayImg) {
      btnPlayImg.src = `/assets/images/themes/${paletteName.toLowerCase()}/${this.capitalize(paletteName)}Play.svg`
    }
  }
}