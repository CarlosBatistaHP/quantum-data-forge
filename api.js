// --- api.js ---
// Este arquivo SIMULA um backend para login e ranking.
// Em um projeto real, aqui estariam chamadas fetch() para um servidor de verdade.

const FAKE_DB = {
    leaderboard: [
        { name: "Nyx", score: 1.2e18 },
        { name: "ZeroCool", score: 8.5e17 },
        { name: "Acid Burn", score: 5.1e17 },
        { name: "Trinity", score: 9.8e16 },
        { name: "Ghost", score: 4.4e15 },
        { name: "Oracle", score: 7.2e14 },
    ]
};

class AuthManager {
    static login(playerName) {
        // Simula o login, salvando o nome do jogador no localStorage.
        localStorage.setItem('quantum_player', playerName);
        return { success: true, playerName };
    }

    static logout() {
        // Simula o logout.
        localStorage.removeItem('quantum_player');
        return { success: true };
    }

    static getLoggedInUser() {
        // Verifica se há um jogador logado.
        return localStorage.getItem('quantum_player');
    }
}

class ApiManager {
    static getLeaderboard(playerData) {
        // Simula uma chamada de API para buscar o ranking.
        return new Promise(resolve => {
            setTimeout(() => {
                let board = [...FAKE_DB.leaderboard];
                // Adiciona o jogador atual ao placar para exibição
                if (playerData && playerData.name && !FAKE_DB.leaderboard.some(p => p.name === playerData.name)) {
                   board.push({ name: playerData.name, score: playerData.score });
                }
                
                // Atualiza a pontuação do jogador se ele já estiver no placar (fake)
                const playerOnBoard = board.find(p => p.name === playerData.name);
                if (playerOnBoard) {
                    playerOnBoard.score = Math.max(playerOnBoard.score, playerData.score);
                }

                board.sort((a, b) => b.score - a.score);
                resolve(board);
            }, 500); // Adiciona um pequeno delay para simular a rede
        });
    }

    static submitScore(playerName, score) {
        // Em um projeto real, esta função enviaria a pontuação para o servidor.
        // Como estamos simulando, a lógica de ranking já considera a pontuação atual do jogador.
        console.log(`[API MOCK] Pontuação de ${playerName} (${score}) registrada para o próximo carregamento do ranking.`);
        return Promise.resolve({ success: true });
    }
}

export { AuthManager, ApiManager };