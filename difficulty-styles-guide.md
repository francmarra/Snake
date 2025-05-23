# Styles para o Sistema de Dificuldades

Para adicionar estilos ao modal de dificuldades, adicione este CSS ao seu arquivo `style.css`:

```css
/*-----------------------------------------------------------
  Difficulty Modal Styles
------------------------------------------------------------*/
#difficulty-modal {
  backdrop-filter: blur(5px);
}

#difficulty-modal button {
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

#difficulty-modal button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

#difficulty-modal button:active {
  transform: translateY(0);
}

/* Dificuldades específicas podem ter estilos personalizados */
#difficulty-easy {
  background-color: #10b981; /* Verde mais claro */
}

#difficulty-easy:hover {
  background-color: #059669; /* Verde mais escuro */
}

#difficulty-normal {
  background-color: #f59e0b; /* Amarelo/Laranja */
}

#difficulty-normal:hover {
  background-color: #d97706; /* Amarelo/Laranja mais escuro */
}

#difficulty-hard {
  background-color: #ef4444; /* Vermelho */
}

#difficulty-hard:hover {
  background-color: #dc2626; /* Vermelho mais escuro */
}

#difficulty-custom {
  background-color: #8b5cf6; /* Roxo */
}

#difficulty-custom:hover {
  background-color: #7c3aed; /* Roxo mais escuro */
}
```

Estes estilos garantem uma aparência agradável para o modal de dificuldades, com efeitos de hover e cores distintas para cada opção de dificuldade.
