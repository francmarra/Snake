// Este arquivo contém a função startGame modificada 
// Para implementar, substitua a função startGame no main.js com este código

/*
Substitua a função startGame:

function startGame() {
  if (!snake.isMoving) {
    // Ensure camera rotation is disabled when snake starts moving
    cameraRotationActive = false;
    
    // Hide settings tab when snake starts moving
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab && settingsTab.style.display !== 'none') {
      animateSettingsTab(settingsTab, false);
    }    // Use the current slider value to determine moveInterval for snake speed
    const sliderVal = parseInt(document.getElementById('speed-range').value);
    const moveInterval = 300 - (sliderVal * 16);
    isRunning = setInterval(() => {
      snake.update();
    }, moveInterval);
  }
}

Por este código:
*/

function startGame() {
  if (!snake.isMoving) {
    // Ensure camera rotation is disabled when snake starts moving
    cameraRotationActive = false;
    
    // Hide settings tab when snake starts moving
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab && settingsTab.style.display !== 'none') {
      animateSettingsTab(settingsTab, false);
    }    
    
    // Use a velocidade da cobra das configurações
    const moveInterval = DEFAULT_SETTINGS.snakeSpeed;
    isRunning = setInterval(() => {
      snake.update();
    }, moveInterval);
  }
}
