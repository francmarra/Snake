# Sistema de Seleção de Dificuldade para Snake 3D 🐍

## Visão Geral

Este sistema adiciona um modal de seleção de dificuldade ao jogo Snake 3D, permitindo que os jogadores escolham entre 4 níveis:

- **Fácil** 🟢 - Snake mais lenta, mais frutas, sem bombas, mais seguro para iniciantes
- **Normal** 🟡 - Velocidade média, configurações padrão equilibradas
- **Difícil** 🔴 - Snake mais rápida, mais bombas, morte ao tocar nas bordas
- **Personalizado** ⚙️ - Permite ajustar todas as configurações manualmente

## Arquivos Incluídos

O sistema já está completamente desenvolvido nos seguintes arquivos:

1. `config/DifficultyConfig.js` - Contém as configurações predefinidas para cada nível
2. `managers/DifficultyManager.js` - Gerencia o modal e a lógica de seleção
3. `difficulty-styles.css` - Estilos para o modal de seleção
4. `difficulty-integration.js` - Todas as funções necessárias para integração
5. `difficulty-integration-steps.md` - Guia passo a passo para integração manual
6. `difficulty-auto-integration.js` - Script para integração automática (experimental)
7. `difficulty-troubleshooting.md` - Guia de solução de problemas

## Como Integrar ao Jogo

### Método 1: Integração Manual (Recomendado)

Para a integração mais confiável e personalizada, siga os passos detalhados no arquivo `difficulty-integration-steps.md`. Esse método permite entender completamente como o sistema funciona e adaptá-lo conforme necessário.

### Método 2: Copiar e Colar Funções

1. Abra o arquivo `difficulty-integration.js`
2. Copie as funções necessárias
3. Cole-as nos locais apropriados em seu arquivo `main.js`
4. Ajuste conforme necessário para o seu projeto

### Método 3: Integração Automática (Experimental)

**Nota:** Esta opção é experimental e pode não funcionar perfeitamente em todos os cenários.

1. Adicione o seguinte código ao seu HTML antes do fechamento da tag body:
   ```html
   <script src="difficulty-auto-integration.js"></script>
   ```
2. Abra o jogo e o script tentará integrar o sistema automaticamente
3. Verifique o console para mensagens de erro caso algo não funcione

## Como Funciona

1. Quando o jogador clica em "Play", o modal de dificuldade é exibido
2. Ao selecionar uma dificuldade, as configurações correspondentes são aplicadas:
   - Número de frutas, bombas e obstáculos
   - Velocidade da cobra
   - Comportamento nas bordas (morre ou atravessa)
3. Em modo "Personalizado", o jogador pode ajustar todas essas configurações manualmente
4. Nos outros modos, as configurações são bloqueadas para manter a experiência consistente

## Personalização

### Ajustando as Dificuldades

Para personalizar as configurações de cada nível, edite `config/DifficultyConfig.js`:

```javascript
export const DIFFICULTY_PRESETS = {
    EASY: {
        numFruits: 2,
        numBombs: 0,
        // Outras configurações...
    },
    // Outros níveis...
}
```

### Estilo do Modal

Para personalizar a aparência do modal, edite `difficulty-styles.css`:

```css
#difficulty-modal button {
    /* Seus estilos aqui */
}

#difficulty-easy {
    background-color: #10b981; /* Verde mais claro */
}

/* Outros estilos... */
```

## Solução de Problemas

Se encontrar algum problema durante a implementação, consulte `difficulty-troubleshooting.md` para orientações específicas sobre como resolver problemas comuns.

---

Desenvolvido com ❤️ para o jogo Snake 3D. Boa sorte e divirta-se! 🎮
