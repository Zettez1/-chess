// Главный контроллер игры
let currentGame = 'chess';
let game = chessGame;
let gameMode = 'pvp'; // 'pvp' или 'ai'
let aiEnabled = false;

// Статистика игры
let gameStats = {
    startTime: null,
    moveCount: 0,
    capturedPieces: 0
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    switchGame('chess');
});

function setGameMode(mode) {
    gameMode = mode;
    aiEnabled = (mode === 'ai');
    
    // Обновить кнопки
    document.getElementById('pvpBtn').classList.toggle('active', mode === 'pvp');
    document.getElementById('aiBtn').classList.toggle('active', mode === 'ai');
    
    // Сбросить игру
    resetGame();
}

function switchGame(gameType) {
    currentGame = gameType;
    
    // Обновить кнопки
    document.getElementById('chessBtn').classList.toggle('active', gameType === 'chess');
    document.getElementById('checkersBtn').classList.toggle('active', gameType === 'checkers');
    
    // Переключить игру
    game = gameType === 'chess' ? chessGame : checkersGame;
    game.init();
    
    renderBoard();
    updateGameInfo();
}

function renderBoard() {
    const boardElement = document.getElementById('chessBoard');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = game.board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.textContent = piece.symbol;
                square.appendChild(pieceElement);
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
    
    // Подсветить выбранную клетку и доступные ходы
    if (game.selectedSquare) {
        highlightSquare(game.selectedSquare.row, game.selectedSquare.col);
        highlightValidMoves(game.selectedSquare.row, game.selectedSquare.col);
    }
}

function handleSquareClick(row, col) {
    // Если ИИ думает, не позволять кликать
    if (aiEngine.thinking) return;
    
    // В режиме ИИ игрок играет только за белых
    if (aiEnabled && game.currentPlayer === 'black') return;
    
    const piece = game.board[row][col];
    
    // Если ничего не выбрано
    if (!game.selectedSquare) {
        if (piece && piece.color === game.currentPlayer) {
            game.selectedSquare = { row, col };
            renderBoard();
        }
        return;
    }
    
    // Если выбрана та же клетка, отменить выбор
    if (game.selectedSquare.row === row && game.selectedSquare.col === col) {
        game.selectedSquare = null;
        renderBoard();
        return;
    }
    
    // Попытка сделать ход
    const fromRow = game.selectedSquare.row;
    const fromCol = game.selectedSquare.col;
    
    if (game.isValidMove(fromRow, fromCol, row, col)) {
        // Подсчитать взятые фигуры
        const capturedBefore = game.capturedByWhite.length + game.capturedByBlack.length;
        
        game.makeMove(fromRow, fromCol, row, col);
        
        // Увеличить счетчик ходов
        gameStats.moveCount++;
        
        // Обновить счетчик взятых фигур
        const capturedAfter = game.capturedByWhite.length + game.capturedByBlack.length;
        if (capturedAfter > capturedBefore) {
            gameStats.capturedPieces++;
        }
        
        renderBoard();
        updateGameInfo();
        checkGameOver();
        
        // Если включен ИИ и теперь ход черных, дать ИИ сделать ход
        if (aiEnabled && game.currentPlayer === 'black' && !game.checkWinner()) {
            setTimeout(() => {
                aiEngine.makeAIMove(game, currentGame, () => {
                    renderBoard();
                    updateGameInfo();
                    checkGameOver();
                });
            }, 300);
        }
    } else if (piece && piece.color === game.currentPlayer) {
        // Выбрать другую фигуру того же цвета
        game.selectedSquare = { row, col };
        renderBoard();
    } else {
        // Неверный ход - отменить выбор
        game.selectedSquare = null;
        renderBoard();
    }
}

function highlightSquare(row, col) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (square) {
        square.classList.add('selected');
    }
}

function highlightValidMoves(row, col) {
    const validMoves = game.getValidMoves(row, col);
    validMoves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (square) {
            square.classList.add('valid-move');
        }
    });
}

function updateGameInfo() {
    // Обновить индикатор хода
    const currentPlayerName = game.currentPlayer === 'white' ? translate('white') : translate('black');
    document.getElementById('currentPlayer').textContent = currentPlayerName;
    
    // Обновить взятые фигуры
    document.getElementById('capturedByWhite').innerHTML = 
        game.capturedByWhite.map(p => `<span class="captured-piece">${p}</span>`).join('');
    
    document.getElementById('capturedByBlack').innerHTML = 
        game.capturedByBlack.map(p => `<span class="captured-piece">${p}</span>`).join('');
}

function checkGameOver() {
    const winner = game.checkWinner();
    if (winner) {
        const statusElement = document.getElementById('gameStatus');
        const winnerText = winner === 'white' ? translate('whiteWon') : translate('blackWon');
        statusElement.textContent = `🎉 ${winnerText}`;
        statusElement.className = 'game-status winner';
        
        // Показать модальное окно со статистикой
        setTimeout(() => {
            showStatsModal(winner);
        }, 800);
    }
}

function showStatsModal(winner) {
    // Вычислить время игры
    const gameTime = Math.floor((Date.now() - gameStats.startTime) / 1000);
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    
    // Подсчитать взятые фигуры
    const totalCaptured = game.capturedByWhite.length + game.capturedByBlack.length;
    
    // Обновить модальное окно
    document.getElementById('modalTitle').textContent = translate('victory');
    const winnerText = winner === 'white' ? translate('whiteWon') : translate('blackWon');
    document.getElementById('modalSubtitle').textContent = winnerText;
    document.getElementById('statMoves').textContent = gameStats.moveCount;
    document.getElementById('statTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('statCaptured').textContent = totalCaptured;
    document.getElementById('statMode').textContent = aiEnabled ? translate('aiMode') : translate('pvpMode');
    
    // Показать модальное окно
    document.getElementById('statsModal').classList.add('active');
}

function closeModal() {
    document.getElementById('statsModal').classList.remove('active');
}

function closeModalAndReset() {
    closeModal();
    resetGame();
}

function resetGame() {
    game.init();
    renderBoard();
    updateGameInfo();
    document.getElementById('gameStatus').textContent = '';
    document.getElementById('gameStatus').className = 'game-status';
    
    // Сбросить статистику
    gameStats = {
        startTime: Date.now(),
        moveCount: 0,
        capturedPieces: 0
    };
    
    // Если ИИ играет за черных и в шашках черные ходят первыми, дать ИИ сделать ход
    // (В шахматах белые ходят первыми, так что ничего не делаем)
}

function undoMove() {
    // В режиме ИИ отменяем 2 хода (ход игрока и ход ИИ)
    if (aiEnabled) {
        if (game.undoLastMove() && game.undoLastMove()) {
            renderBoard();
            updateGameInfo();
            document.getElementById('gameStatus').textContent = '';
        } else {
            const statusElement = document.getElementById('gameStatus');
            statusElement.textContent = translate('noMovesToUndo');
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
    } else {
        if (game.undoLastMove()) {
            renderBoard();
            updateGameInfo();
            document.getElementById('gameStatus').textContent = '';
        } else {
            const statusElement = document.getElementById('gameStatus');
            statusElement.textContent = translate('noMovesToUndo');
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
    }
}

function getHint() {
    if (aiEngine.thinking) return;
    
    const statusElement = document.getElementById('gameStatus');
    statusElement.textContent = translate('searchingBestMove');
    statusElement.style.color = '#FFD700';
    
    setTimeout(() => {
        const hint = aiEngine.getHint(game, currentGame);
        
        if (hint) {
            // Подсветить рекомендуемый ход
            const fromSquare = document.querySelector(`[data-row="${hint.from.row}"][data-col="${hint.from.col}"]`);
            const toSquare = document.querySelector(`[data-row="${hint.to.row}"][data-col="${hint.to.col}"]`);
            
            if (fromSquare && toSquare) {
                fromSquare.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.9), inset 0 0 20px rgba(255, 215, 0, 0.5)';
                toSquare.style.boxShadow = '0 0 30px rgba(144, 238, 144, 0.9), inset 0 0 20px rgba(144, 238, 144, 0.5)';
                
                statusElement.textContent = translate('tryThisMove');
                
                setTimeout(() => {
                    fromSquare.style.boxShadow = '';
                    toSquare.style.boxShadow = '';
                    statusElement.textContent = '';
                }, 3000);
            }
        } else {
            statusElement.textContent = translate('noMovesAvailable');
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
    }, 500);
}
