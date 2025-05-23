# Implementação do Sistema de Dificuldades no Jogo Snake

Este guia explica como implementar o sistema de dificuldades no jogo Snake 3D. O sistema oferece três níveis de dificuldade predefinidos (Fácil, Normal e Difícil) e uma opção para configurações personalizadas.

## Arquivos Criados

1. `config/DifficultyConfig.js` - Configurações para os diferentes níveis de dificuldade
2. `managers/DifficultyManager.js` - Gerenciador do modal de dificuldade e seleção
3. `updates/DifficultyButtonPlay.js` - Código para modificar o comportamento do botão Play
4. `updates/UpdatedStartGame.js` - Código para atualizar a função startGame

## Modificações feitas

### 1. HTML - Modal de Dificuldade

Foi adicionado um modal de dificuldade ao HTML que mostra as quatro opções:
- Fácil: Velocidade lenta, 2 frutas, 0 bombas, 10 objetos
- Normal: Velocidade média, 1 fruta, 1 bomba, 20 objetos
- Difícil: Velocidade rápida, 1 fruta, 3 bombas, 30 objetos, morte nas bordas
- Personalizado: Permite configurar manualmente as definições

### 2. Configuração de Dificuldade

O arquivo `config/DifficultyConfig.js` define as configurações para cada nível de dificuldade:

- **Fácil**:
  - Velocidade mais lenta (300ms)
  - 2 frutas, 0 bombas, 10 objetos
  - Não morre ao cruzar as bordas

- **Normal**:
  - Velocidade média (220ms)
  - 1 fruta, 1 bomba, 20 objetos
  - Não morre ao cruzar as bordas

- **Difícil**:
  - Velocidade rápida (150ms)
  - 1 fruta, 3 bombas, 30 objetos
  - Morre ao cruzar as bordas

### 3. Comportamento do Jogo

- Ao iniciar o jogo, em vez de começar imediatamente, é mostrado o modal de dificuldade
- Ao selecionar uma dificuldade, as configurações são aplicadas e o jogo começa
- Ao selecionar "Personalizado", o jogador pode ajustar manualmente as configurações

## Como Implementar

1. Inclua os novos arquivos no seu projeto
2. Modifique o arquivo main.js:
   - Atualize os imports para incluir `updateSettingsUI`, `DifficultyManager` e `DIFFICULTY_LEVELS`
   - Substitua o event listener do botão Play pelo código em `updates/DifficultyButtonPlay.js`
   - Substitua a função startGame pelo código em `updates/UpdatedStartGame.js` 
   - Adicione a lógica de atualização das entidades baseada nas configurações de dificuldade

3. Atualize a interface de usuário:
   - Certifique-se de que os sliders e checkboxes sejam atualizados quando uma dificuldade for selecionada
   - Desative os controles de configuração quando não estiver no modo personalizado

## Considerações

- No modo personalizado, todas as configurações podem ser ajustadas livremente
- Nos modos predefinidos, as configurações não podem ser alteradas
- A velocidade da cobra é controlada pela configuração `snakeSpeed` (valores menores = mais rápido)
- A detecção de colisão com bordas é controlada pela configuração `killOnBorderTrespass`
