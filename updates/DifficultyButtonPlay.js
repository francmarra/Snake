// Esse arquivo contém a função modificada para o botão Play no jogo Snake
// Para implementar, substitua o event listener do btnPlay no main.js por este código

/*
Substitua o código:

btnPlay.addEventListener('click', function () {
  if (!gameStarted) {
    gameStarted = true
    ...
  }
})

Pelo código abaixo:
*/

// Inicializa o gerenciador de dificuldade
difficultyManager = new DifficultyManager(DEFAULT_SETTINGS, onDifficultySelected);

// Modifica o comportamento do botão play para mostrar o modal de dificuldade
btnPlay.addEventListener('click', function () {
  if (!gameStarted) {
    // Mostra o modal de dificuldade em vez de iniciar o jogo diretamente
    difficultyManager.showModal();
  }
});

// A função onDifficultySelected já está definida e será chamada quando o jogador selecionar uma dificuldade
// Esta função atualiza as configurações, atualiza a interface e inicia o jogo
