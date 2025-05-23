// Script para integrar automaticamente o sistema de dificuldades
// Este script pode ser executado para implementar todas as mudanças necessárias

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos no contexto correto
    if (!window.THREE || !window.snake) {
        console.error('Esse script deve ser executado no contexto do jogo Snake.');
        return;
    }
    
    console.log('Iniciando integração do sistema de dificuldades...');
    
    try {
        // Passo 1: Inicializar variáveis necessárias
        let difficultyManager;
        
        // Passo 2: Adicionar a função onDifficultySelected
        window.onDifficultySelected = function(difficulty) {
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
        };
        
        // Passo 3: Adicionar a função updateEntitiesBasedOnSettings
        window.updateEntitiesBasedOnSettings = function() {
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
        };
        
        // Passo 4: Modificar o event listener do slider de velocidade
        const speedRange = document.getElementById('speed-range');
        if (speedRange) {
            // Remover listeners existentes
            const oldListener = speedRange._listener;
            if (oldListener) {
                speedRange.removeEventListener('input', oldListener);
            }
            
            // Adicionar novo listener
            const newListener = function() {
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
            };
            
            speedRange.addEventListener('input', newListener);
            speedRange._listener = newListener;
        }
        
        // Passo 5: Inicializar o gerenciador de dificuldades
        const btnPlay = document.getElementById('btn-play');
        if (btnPlay) {
            // Inicializa o gerenciador de dificuldade
            difficultyManager = new DifficultyManager(DEFAULT_SETTINGS, onDifficultySelected);
            
            // Substituir o event listener do botão Play
            const oldClickListener = btnPlay._clickListener;
            if (oldClickListener) {
                btnPlay.removeEventListener('click', oldClickListener);
            }
            
            const newClickListener = function() {
                if (!gameStarted) {
                    // Mostra o modal de dificuldade em vez de iniciar o jogo diretamente
                    difficultyManager.showModal();
                }
            };
            
            btnPlay.addEventListener('click', newClickListener);
            btnPlay._clickListener = newClickListener;
        }
        
        console.log('Sistema de dificuldades integrado com sucesso!');
        alert('Sistema de dificuldades integrado com sucesso! Clique em "Play" para começar.');
        
    } catch (error) {
        console.error('Erro ao integrar sistema de dificuldades:', error);
        alert('Ocorreu um erro ao integrar o sistema de dificuldades. Verifique o console para mais detalhes.');
    }
});
