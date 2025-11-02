// Непобедимый ИИ для шахмат и шашек
const aiEngine = {
    difficulty: 'hard', // easy, medium, hard
    thinking: false,

    // Minimax алгоритм с альфа-бета отсечением
    minimax(game, depth, alpha, beta, maximizingPlayer, gameType) {
        if (depth === 0 || game.checkWinner()) {
            return this.evaluatePosition(game, gameType);
        }

        const allMoves = this.getAllPossibleMoves(game, maximizingPlayer ? 'black' : 'white');

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of allMoves) {
                const originalBoard = JSON.parse(JSON.stringify(game.board));
                const originalPlayer = game.currentPlayer;
                const originalCaptured = {
                    white: [...game.capturedByWhite],
                    black: [...game.capturedByBlack]
                };

                game.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                
                const evaluation = this.minimax(game, depth - 1, alpha, beta, false, gameType);
                
                // Восстановить состояние
                game.board = originalBoard;
                game.currentPlayer = originalPlayer;
                game.capturedByWhite = originalCaptured.white;
                game.capturedByBlack = originalCaptured.black;

                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of allMoves) {
                const originalBoard = JSON.parse(JSON.stringify(game.board));
                const originalPlayer = game.currentPlayer;
                const originalCaptured = {
                    white: [...game.capturedByWhite],
                    black: [...game.capturedByBlack]
                };

                game.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                
                const evaluation = this.minimax(game, depth - 1, alpha, beta, true, gameType);
                
                // Восстановить состояние
                game.board = originalBoard;
                game.currentPlayer = originalPlayer;
                game.capturedByWhite = originalCaptured.white;
                game.capturedByBlack = originalCaptured.black;

                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    },

    // Оценить позицию
    evaluatePosition(game, gameType) {
        // Сначала проверить победу
        const winner = game.checkWinner();
        if (winner === 'black') return 10000; // ИИ победил
        if (winner === 'white') return -10000; // Игрок победил
        
        if (gameType === 'chess') {
            return this.evaluateChessPosition(game);
        } else {
            return this.evaluateCheckersPosition(game);
        }
    },

    // Оценить позицию для шахмат
    evaluateChessPosition(game) {
        let score = 0;

        const pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };

        // Позиционные бонусы для пешек (шахматы)
        const pawnPositionBonus = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        const knightPositionBonus = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = game.board[r][c];
                if (!piece) continue;

                let pieceValue = pieceValues[piece.type] || 0;
                
                // Позиционный бонус
                if (piece.type === 'pawn') {
                    pieceValue += piece.color === 'black' ? pawnPositionBonus[r][c] : pawnPositionBonus[7-r][c];
                } else if (piece.type === 'knight') {
                    pieceValue += piece.color === 'black' ? knightPositionBonus[r][c] : knightPositionBonus[7-r][c];
                }
                
                // Бонус за контроль центра
                if ((r >= 3 && r <= 4) && (c >= 3 && c <= 4)) {
                    pieceValue += 30;
                }

                score += piece.color === 'black' ? pieceValue : -pieceValue;
            }
        }

        // Бонус за мобильность
        const blackMoves = this.getAllPossibleMoves(game, 'black').length;
        const whiteMoves = this.getAllPossibleMoves(game, 'white').length;
        score += (blackMoves - whiteMoves) * 10;

        return score;
    },

    // Оценить позицию для шашек
    evaluateCheckersPosition(game) {
        let score = 0;
        let blackPieces = 0;
        let whitePieces = 0;
        let blackKings = 0;
        let whiteKings = 0;
        let blackBackRow = 0;
        let whiteBackRow = 0;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = game.board[r][c];
                if (!piece) continue;
                
                // Подсчет фигур
                if (piece.color === 'black') {
                    blackPieces++;
                    if (piece.isKing) blackKings++;
                    if (r === 7) blackBackRow++; // Защита последнего ряда
                } else {
                    whitePieces++;
                    if (piece.isKing) whiteKings++;
                    if (r === 0) whiteBackRow++;
                }
                
                // Базовая ценность
                const pieceValue = piece.isKing ? 600 : 100;
                
                // Позиционный бонус
                let positionBonus = 0;
                if (!piece.isKing) {
                    // Сильное продвижение к королю
                    positionBonus = piece.color === 'black' ? r * 20 : (7 - r) * 20;
                    
                    // Критический бонус за предпоследний ряд
                    if ((piece.color === 'black' && r === 6) || (piece.color === 'white' && r === 1)) {
                        positionBonus += 40;
                    }
                    
                    // Бонус за центральные позиции
                    const centerDistance = Math.abs(3.5 - c);
                    positionBonus += (3.5 - centerDistance) * 8;
                    
                    // Штраф за края (легко блокируются)
                    if (c === 0 || c === 7) {
                        positionBonus -= 10;
                    }
                    
                    // Диагональная защита
                    if (piece.color === 'black' && r > 0) {
                        const leftDiag = game.board[r-1]?.[c-1];
                        const rightDiag = game.board[r-1]?.[c+1];
                        if (leftDiag?.color === 'black' || rightDiag?.color === 'black') {
                            positionBonus += 5; // Защищена
                        }
                    }
                } else {
                    // Короли должны доминировать в центре
                    const centerBonus = 4 - Math.abs(3.5 - r) - Math.abs(3.5 - c);
                    positionBonus = centerBonus * 15;
                    
                    // Короли должны быть активными
                    positionBonus += 30;
                }
                
                // Мобильность (количество возможных ходов)
                const moves = game.getValidMoves(r, c);
                const mobility = moves.length * 12;
                
                // ТАКТИКА: Обнаружение возможности взятия
                let captureBonus = 0;
                for (const move of moves) {
                    if (Math.abs(move.row - r) === 2) {
                        // Это взятие!
                        captureBonus += 100;
                        
                        // Множественное взятие еще ценнее
                        const midRow = (r + move.row) / 2;
                        const midCol = (c + move.col) / 2;
                        const captured = game.board[midRow]?.[midCol];
                        if (captured?.isKing) {
                            captureBonus += 150; // Взятие короля!
                        }
                    }
                }
                
                const totalValue = pieceValue + positionBonus + mobility + captureBonus;
                
                if (piece.color === 'black') {
                    score += totalValue;
                } else {
                    score -= totalValue;
                }
            }
        }
        
        // ТАКТИКА: Материальное преимущество
        const materialDiff = blackPieces - whitePieces;
        if (materialDiff > 0) {
            score += materialDiff * 80;
            // В эндшпиле материал еще важнее
            if (blackPieces + whitePieces <= 8) {
                score += materialDiff * 50;
            }
        }
        
        // ТАКТИКА: Преимущество в королях критично
        const kingDiff = blackKings - whiteKings;
        score += kingDiff * 300;
        
        // ТАКТИКА: Защита последнего ряда (предотвращение прорыва)
        if (blackBackRow >= 2) {
            score += 40; // Хорошая защита
        } else if (blackBackRow === 0 && blackPieces > 3) {
            score -= 50; // Опасная слабость
        }
        
        // ЭНДШПИЛЬ: Если у ИИ больше фигур, загонять короля противника
        if (blackPieces > whitePieces && (blackPieces + whitePieces) <= 6) {
            // Найти короля противника и загонять его в угол
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = game.board[r][c];
                    if (piece?.color === 'white' && piece.isKing) {
                        // Штраф если король не в углу
                        const cornerDistance = Math.min(
                            Math.abs(r - 0) + Math.abs(c - 0),
                            Math.abs(r - 0) + Math.abs(c - 7),
                            Math.abs(r - 7) + Math.abs(c - 0),
                            Math.abs(r - 7) + Math.abs(c - 7)
                        );
                        score += (14 - cornerDistance) * 10;
                    }
                }
            }
        }
        
        return score;
    },

    // Получить все возможные ходы
    getAllPossibleMoves(game, color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = game.board[r][c];
                if (piece && piece.color === color) {
                    const validMoves = game.getValidMoves(r, c);
                    for (const move of validMoves) {
                        moves.push({
                            from: { row: r, col: c },
                            to: { row: move.row, col: move.col },
                            piece: piece
                        });
                    }
                }
            }
        }
        return moves;
    },

    // Найти лучший ход
    findBestMove(game, gameType) {
        this.thinking = true;
        // Максимальная глубина для непобедимого ИИ
        const depth = gameType === 'checkers' ? 5 : 4;
        let bestMove = null;
        let bestValue = -Infinity;

        const allMoves = this.getAllPossibleMoves(game, 'black');
        
        // Перемешать ходы для разнообразия
        this.shuffleArray(allMoves);

        for (const move of allMoves) {
            const originalBoard = JSON.parse(JSON.stringify(game.board));
            const originalPlayer = game.currentPlayer;
            const originalCaptured = {
                white: [...game.capturedByWhite],
                black: [...game.capturedByBlack]
            };

            game.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            
            const moveValue = this.minimax(game, depth - 1, -Infinity, Infinity, false, gameType);
            
            // Восстановить состояние
            game.board = originalBoard;
            game.currentPlayer = originalPlayer;
            game.capturedByWhite = originalCaptured.white;
            game.capturedByBlack = originalCaptured.black;

            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }

        this.thinking = false;
        return bestMove;
    },

    // Перемешать массив
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    // Сделать ход ИИ
    async makeAIMove(game, gameType, callback) {
        if (this.thinking) return;

        // Показать "размышление"
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = translate('aiThinking');
        statusElement.style.color = '#667eea';

        // Искусственная задержка для эффекта "размышления"
        const thinkingTime = gameType === 'checkers' ? 500 : 600;
        await new Promise(resolve => setTimeout(resolve, thinkingTime));

        const bestMove = this.findBestMove(game, gameType);
        
        if (bestMove) {
            game.makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
            if (callback) callback();
        }

        statusElement.textContent = '';
    },

    // Получить подсказку для игрока
    getHint(game, gameType) {
        const tempGame = {
            board: JSON.parse(JSON.stringify(game.board)),
            currentPlayer: game.currentPlayer,
            capturedByWhite: [...game.capturedByWhite],
            capturedByBlack: [...game.capturedByBlack],
            isValidMove: game.isValidMove.bind(game),
            makeMove: game.makeMove.bind(game),
            getValidMoves: game.getValidMoves.bind(game),
            checkWinner: game.checkWinner.bind(game)
        };

        const bestMove = this.findBestMove(tempGame, gameType);
        return bestMove;
    }
};
