# Passo a Passo para Integração do Sistema de Dificuldades

Siga essas instruções para integrar o sistema de dificuldades já preparado em sua aplicação. Essas instruções são mais detalhadas e atualizadas para o seu ambiente atual.

## 1. Os Arquivos Já Criados

Você já tem os seguintes arquivos criados:
- `config/DifficultyConfig.js` - Configurações das dificuldades
- `managers/DifficultyManager.js` - Gerenciador do modal de dificuldades
- `difficulty-styles.css` - Estilos para o modal de dificuldades

## 2. HTML do Modal de Dificuldades

O HTML do modal de dificuldades já parece estar adicionado ao seu `index.html`.

## 3. Ligação do CSS do Modal

O CSS para o modal de dificuldades já foi ligado ao seu `index.html`.

## 4. Implementação das Funções no main.js

Para implementar o sistema de dificuldades completamente, você precisa realizar as seguintes modificações no seu arquivo `main.js`:

### 4.1. Encontre a função `startGame`

Ela deve começar por volta da linha 567 do seu arquivo `main.js`. Certifique-se de que ela esteja correta:

```javascript
function startGame() {
  if (!snake.isMoving) {
    // Ensure camera rotation is disabled when snake starts moving
    cameraRotationActive = false;
    
    // Hide settings tab when snake starts moving
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab && settingsTab.style.display !== 'none') {
      animateSettingsTab(settingsTab, false);
    }    
    
    // Use the snake speed from settings
    const moveInterval = DEFAULT_SETTINGS.snakeSpeed;
    isRunning = setInterval(() => {
      snake.update();
    }, moveInterval);
  }
}
```

### 4.2. Adicione a Função `onDifficultySelected`

Procure por uma seção adequada para adicionar a função `onDifficultySelected`. Sugiro adicioná-la depois da função `closeSettings()` e antes da função `startGame()`:

```javascript
// Função para iniciar jogo após seleção de dificuldade
function onDifficultySelected(difficulty) {
  // Atualiza a interface com as novas configurações
  updateSettingsUI(DEFAULT_SETTINGS);
  
  // Atualiza as entidades no jogo baseado nas novas configurações
  updateEntitiesBasedOnSettings();
  
  // Inicia o jogo
  gameStarted = true;
  
  // Stop camera rotation when game starts
  cameraRotationActive = false;
  
  // Handle audio initialization and play
  const playAudio = async () => {
    try {
      // Check if user muted audio
      if (audio.volume !== 0) {
        await audio.play();
        document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`;
      } else {
        document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`;
      }
    } catch (err) {
      console.log('Audio could not play automatically:', err);
      muteVolume();
    }
  };
  
  // Handle minimap visibility
  const minimapContainer = document.getElementById('minimap-container');
  const showMinimap = document.getElementById('show-minimap').checked;
  
  if (showMinimap) {
    toggleMinimap(true);
  } else {
    toggleMinimap(false);
  }
  
  playAudio();
  
  gsap.to(camera.position, { ...finalPosition, duration: 2 });
  gsap.to(scene.fog, { duration: 2, near: 20, far: 55 });
  animateButtonOut(btnPlay);
  if (btnSettings) {
    animateButtonOut(btnSettings);
    // Close settings sidebar if it's open
    const settingsSidebar = document.getElementById('settings-sidebar');
    if (settingsSidebar && settingsSidebar.classList.contains('open')) {
      settingsSidebar.classList.remove('open');
    }
  }
  
  btnToggleCamera.style.display = 'block';
  animateCameraButtonIn(btnToggleCamera);
  
  // Register event listener but don't start the snake movement yet
  registerEventListener();
  
  // Show settings tab after game starts with a slight delay
  const settingsTab = document.getElementById('settings-tab');
  if (settingsTab) {
    settingsTab.classList.remove('theme-green', 'theme-lilac', 'theme-orange');
    settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`);
    // Add slight delay to show after camera movement starts
    setTimeout(() => animateSettingsTab(settingsTab, true), 1000);
  }
  
  // Initialize minimap
  minimap = new Minimap(GRID_WIDTH, GRID_HEIGHT);
}
```

### 4.3. Adicione a Função `updateEntitiesBasedOnSettings`

Esta função deve ser adicionada antes ou depois da função `onDifficultySelected`:

```javascript
// Função para atualizar entidades baseado nas configurações
function updateEntitiesBasedOnSettings() {
  // Ajusta frutas
  while (candies.length > DEFAULT_SETTINGS.numFruits) {
    const fruit = candies.pop();
    scene.remove(fruit.mesh);
  }
  while (candies.length < DEFAULT_SETTINGS.numFruits) {
    addFruit();
  }
  
  // Ajusta bombas
  while (bombs.length > DEFAULT_SETTINGS.numBombs) {
    const bomb = bombs.pop();
    scene.remove(bomb.mesh);
  }
  while (bombs.length < DEFAULT_SETTINGS.numBombs) {
    addBomb();
  }
  
  // Ajusta objetos
  while (entities.length > DEFAULT_SETTINGS.numObjects) {
    const entity = entities.pop();
    scene.remove(entity.mesh);
  }
  while (entities.length < DEFAULT_SETTINGS.numObjects) {
    addEntity();
  }
}
```

### 4.4. Modifique o Event Listener do Slider de Velocidade

Procure o event listener do elemento `speed-range` e substitua-o pelo seguinte:

```javascript
document.getElementById('speed-range').addEventListener('input', function() {
  if (currentDifficulty !== DIFFICULTY_LEVELS.CUSTOM) {
    // In non-Custom modes, reset the slider to match settings
    const speedValue = DEFAULT_SETTINGS.snakeSpeed;
    // Convert milliseconds to slider value (approx 1-10)
    const sliderValue = Math.round((300 - speedValue) / 16);
    this.value = sliderValue;
    document.getElementById('speed-value').textContent = sliderValue;
    return; // Não permitir alterações em modos predefinidos
  }
  
  const sliderVal = parseInt(this.value);
  document.getElementById('speed-value').textContent = sliderVal;
  
  // Converter o valor do slider para milissegundos (menor = mais rápido)
  DEFAULT_SETTINGS.snakeSpeed = 300 - (sliderVal * 16);
  
  // If the game is already running, restart the move interval with the new speed
  if (isRunning) {
    clearInterval(isRunning);
    isRunning = setInterval(() => {
      snake.update();
    }, DEFAULT_SETTINGS.snakeSpeed);
  }
});
```

### 4.5. Inicialize o Gerenciador de Dificuldades

Procure onde o botão Play (`btnPlay`) é inicializado e adicione o seguinte código após essa inicialização:

```javascript
// Inicializa o gerenciador de dificuldade
let difficultyManager = new DifficultyManager(DEFAULT_SETTINGS, onDifficultySelected);

// Substitui o event listener do botão Play
btnPlay.addEventListener('click', function () {
  if (!gameStarted) {
    // Mostra o modal de dificuldade em vez de iniciar o jogo diretamente
    difficultyManager.showModal();
  }
});
```

## 5. Teste as Alterações

Após implementar todas essas mudanças:

1. Execute o jogo
2. Clique no botão "Play"
3. O modal de dificuldades deve aparecer
4. Selecione uma dificuldade
5. O jogo deve iniciar com as configurações correspondentes à dificuldade selecionada

## Solução de Problemas

Se encontrar algum problema durante a implementação:

1. Verifique se todas as referências às funções e variáveis estão corretas
2. Confirme que o CSS dos estilos do modal está sendo carregado corretamente
3. Verifique os erros no console do navegador para identificar problemas específicos

O arquivo `difficulty-integration.js` contém todas as funções necessárias para a integração e pode ser usado como referência.
