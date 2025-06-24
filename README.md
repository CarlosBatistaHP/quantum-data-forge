# Quantum Data Forge - Edição Odyssey

Bem-vindo ao Quantum Data Forge, um jogo incremental (idle/clicker) com tema de hacking, construído com HTML, CSS e JavaScript puros.

## 🚀 Visão Geral

Assuma o papel de um hacker construindo uma infraestrutura de dados massiva. Comece com simples scripts de autoclick e evolua para superinteligências artificiais e enxames de Dyson, tudo enquanto observa sua nave de coleta de dados, a "Odyssey", ser construída peça por peça.

O jogo apresenta múltiplos sistemas de progressão, incluindo:
-   **Edifícios e Melhorias:** Uma árvore de tecnologia clássica de jogos incrementais.
-   **Sistema de Prestígio (Recompilação):** Zere seu progresso em troca de "Kernel Cores", que fornecem bônus permanentes e desbloqueiam novas Eras de jogo, cada uma com um tema visual e animações de fundo únicas.
-   **Evolução Visual:** Veja sua nave e a interface do jogo mudarem de cor e forma à medida que você avança pelas Eras.
-   **Conquistas:** Desbloqueie bônus permanentes ao atingir marcos importantes.
-   **Login e Placar da Rede (Simulado):** O jogo possui uma interface completa de login e um placar. A lógica é simulada no frontend com `localStorage`, pronta para ser conectada a um backend real.

## 🛠️ Como Executar

Por usar módulos JavaScript (`import`/`export`), este projeto precisa ser executado a partir de um servidor web local.

-   **Recomendado (VS Code):** Instale a extensão "Live Server" e clique com o botão direito em `index.html` -> "Open with Live Server".
-   **Alternativa (Python):** Navegue até a pasta do projeto no terminal e execute `python -m http.server`. Acesse `http://localhost:8000`.

## 📁 Estrutura de Arquivos

-   `index.html`: Contém a estrutura da página e todos os elementos do jogo.
-   `style.css`: Responsável por toda a estilização, temas e animações.
-   `api.js`: Módulo que simula um backend para login e ranking.
-   `main.js`: Contém toda a lógica do jogo, estado, UI e o loop principal.
-   `README.md`: Este arquivo de apresentação.