import { toggleAmbientLight, toggleDirectionalLight, togglePointLight } from '../src/Lights'

export function initializeSettings(DEFAULT_SETTINGS, scene, addFruit, addBomb, addEntity, candies, bombs, entities, animateSettingsTab, paletteName) {
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
            while (candies.length > value) {
              const fruit = candies.pop()
              scene.remove(fruit.mesh)
            }
            while (candies.length < value) {
              addFruit()
            }
            break
          case 'numBombs':
            while (bombs.length > value) {
              const bomb = bombs.pop()
              scene.remove(bomb.mesh)
            }
            while (bombs.length < value) {
              addBomb()
            }
            break
          case 'numObjects':
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

  const borderKillCheckbox = document.getElementById('kill-borders')
  if (borderKillCheckbox) {
    borderKillCheckbox.checked = DEFAULT_SETTINGS.killOnBorderTrespass
    borderKillCheckbox.addEventListener('change', () => {
      if (window.isRunning) {
        borderKillCheckbox.checked = DEFAULT_SETTINGS.killOnBorderTrespass
        return
      }
    })
  }

  const ambientLightCheckbox = document.getElementById('ambient-light')
  if (ambientLightCheckbox) {
    ambientLightCheckbox.checked = DEFAULT_SETTINGS.ambientLightEnabled
    ambientLightCheckbox.addEventListener('change', () => {
      toggleAmbientLight(ambientLightCheckbox.checked)
    })
  }

  const directionalLightCheckbox = document.getElementById('directional-light')
  if (directionalLightCheckbox) {
    directionalLightCheckbox.checked = DEFAULT_SETTINGS.directionalLightEnabled
    directionalLightCheckbox.addEventListener('change', () => {
      toggleDirectionalLight(directionalLightCheckbox.checked)
    })
  }

  const pointLightCheckbox = document.getElementById('point-light')
  if (pointLightCheckbox) {
    pointLightCheckbox.checked = DEFAULT_SETTINGS.pointLightEnabled
    pointLightCheckbox.addEventListener('change', () => {
      togglePointLight(pointLightCheckbox.checked)
    })
  }

  const settingsSidebar = document.getElementById('settings-sidebar')
  if (settingsSidebar) {
    settingsSidebar.classList.add(`theme-${paletteName.toLowerCase()}`)
  }

  const settingsTab = document.getElementById('settings-tab')
  if (settingsTab) {
    settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`)
    settingsTab.addEventListener('click', () => {
      settingsSidebar.classList.add('open')
      animateSettingsTab(settingsTab, false)
    })
  }
}