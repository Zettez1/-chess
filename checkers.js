// Логика игры в шашки
const checkersGame = {
    board: [],
    currentPlayer: 'white',
    selectedSquare: null,
    moveHistory: [],
    capturedByWhite: [],
    capturedByBlack: [],
    mustCapture: false,

    pieces: {
        white: '⛀',
        whiteKing: '⛁',
        black: '⛂',
        blackKing: '⛃'
    },

    init() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.capturedByWhite = [];
        this.capturedByBlack = [];
        this.mustCapture = false;
    },

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Черные шашки (сверху)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = {
                        type: 'regular',
                        color: 'black',
                        symbol: this.pieces.black
                    };
                }
            }
        }
        
        // Белые шашки (снизу)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = {
                        type: 'regular',
                        color: 'white',
                        symbol: this.pieces.white
                    };
                }
            }
        }
        
        return board;
    },

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) return false;

        const target = this.board[toRow][toCol];
        if (target) return false;

        // Можно ходить только по черным клеткам
        if ((toRow + toCol) % 2 === 0) return false;

        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);

        // Если есть обязательное взятие, разрешить только взятие
        if (this.mustCapture) {
            const captures = this.getCaptureMoves(fromRow, fromCol);
            return captures.some(m => m.row === toRow && m.col === toCol);
        }

        // Обычная шашка
        if (piece.type === 'regular') {
            const direction = piece.color === 'white' ? -1 : 1;
            
            // Обычный ход
            if (rowDiff === direction && colDiff === 1) {
                return true;
            }
            
            // Взятие
            if (Math.abs(rowDiff) === 2 && colDiff === 2) {
                const midRow = (fromRow + toRow) / 2;
                const midCol = (fromCol + toCol) / 2;
                const middle = this.board[midRow][midCol];
                return middle && middle.color !== piece.color;
            }
        }
        
        // Дамка
        if (piece.type === 'king') {
            if (Math.abs(rowDiff) !== colDiff) return false;
            
            // Проверить путь
            const rowStep = rowDiff > 0 ? 1 : -1;
            const colStep = (toCol - fromCol) > 0 ? 1 : -1;
            
            let currentRow = fromRow + rowStep;
            let currentCol = fromCol + colStep;
            let enemyCount = 0;
            let enemyPos = null;
            
            while (currentRow !== toRow) {
                const current = this.board[currentRow][currentCol];
                if (current) {
                    if (current.color === piece.color) return false;
                    enemyCount++;
                    enemyPos = { row: currentRow, col: currentCol };
                }
                currentRow += rowStep;
                currentCol += colStep;
            }
            
            // Дамка может ходить по диагонали или брать одну фигуру
            return enemyCount <= 1;
        }

        return false;
    },

    getCaptureMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const captures = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        if (piece.type === 'regular') {
            for (const [dr, dc] of directions) {
                const midRow = row + dr;
                const midCol = col + dc;
                const toRow = row + 2 * dr;
                const toCol = col + 2 * dc;

                if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) {
                    const middle = this.board[midRow][midCol];
                    const target = this.board[toRow][toCol];

                    if (middle && middle.color !== piece.color && !target) {
                        captures.push({ row: toRow, col: toCol });
                    }
                }
            }
        } else if (piece.type === 'king') {
            for (const [dr, dc] of directions) {
                let distance = 1;
                let foundEnemy = false;
                let enemyRow, enemyCol;

                while (true) {
                    const checkRow = row + dr * distance;
                    const checkCol = col + dc * distance;

                    if (checkRow < 0 || checkRow >= 8 || checkCol < 0 || checkCol >= 8) break;

                    const current = this.board[checkRow][checkCol];

                    if (current) {
                        if (current.color === piece.color) break;
                        if (foundEnemy) break;
                        foundEnemy = true;
                        enemyRow = checkRow;
                        enemyCol = checkCol;
                    } else if (foundEnemy) {
                        captures.push({ row: checkRow, col: checkCol });
                    }

                    distance++;
                }
            }
        }

        return captures;
    },

    hasCaptureMoves(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    if (this.getCaptureMoves(r, c).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const rowDiff = Math.abs(toRow - fromRow);

        // Сохранить ход
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: null
        });

        // Обработка взятия
        let captured = false;
        if (rowDiff === 2) {
            // Обычная шашка
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            const capturedPiece = this.board[midRow][midCol];
            
            if (capturedPiece) {
                if (this.currentPlayer === 'white') {
                    this.capturedByWhite.push(capturedPiece.symbol);
                } else {
                    this.capturedByBlack.push(capturedPiece.symbol);
                }
                this.board[midRow][midCol] = null;
                captured = true;
            }
        } else if (piece.type === 'king' && rowDiff > 1) {
            // Взятие дамкой
            const rowStep = toRow > fromRow ? 1 : -1;
            const colStep = toCol > fromCol ? 1 : -1;
            
            let currentRow = fromRow + rowStep;
            let currentCol = fromCol + colStep;
            
            while (currentRow !== toRow) {
                const current = this.board[currentRow][currentCol];
                if (current && current.color !== piece.color) {
                    if (this.currentPlayer === 'white') {
                        this.capturedByWhite.push(current.symbol);
                    } else {
                        this.capturedByBlack.push(current.symbol);
                    }
                    this.board[currentRow][currentCol] = null;
                    captured = true;
                }
                currentRow += rowStep;
                currentCol += colStep;
            }
        }

        // Переместить шашку
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Превращение в дамку
        if (piece.type === 'regular') {
            if ((piece.color === 'white' && toRow === 0) || 
                (piece.color === 'black' && toRow === 7)) {
                this.board[toRow][toCol] = {
                    type: 'king',
                    color: piece.color,
                    symbol: piece.color === 'white' ? this.pieces.whiteKing : this.pieces.blackKing
                };
            }
        }

        // Проверить возможность продолжения взятия
        if (captured && this.getCaptureMoves(toRow, toCol).length > 0) {
            this.selectedSquare = { row: toRow, col: toCol };
            this.mustCapture = true;
            return;
        }

        // Сменить игрока
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.selectedSquare = null;
        this.mustCapture = this.hasCaptureMoves(this.currentPlayer);
    },

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        // Если есть обязательное взятие
        if (this.mustCapture) {
            return this.getCaptureMoves(row, col);
        }

        const validMoves = [];
        const directions = piece.type === 'regular' 
            ? (piece.color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]])
            : [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        if (piece.type === 'regular') {
            // Обычные ходы
            for (const [dr, dc] of directions) {
                const toRow = row + dr;
                const toCol = col + dc;
                if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) {
                    if (this.isValidMove(row, col, toRow, toCol)) {
                        validMoves.push({ row: toRow, col: toCol });
                    }
                }
            }

            // Взятие
            const captures = this.getCaptureMoves(row, col);
            validMoves.push(...captures);
        } else {
            // Дамка
            for (const [dr, dc] of directions) {
                let distance = 1;
                while (true) {
                    const toRow = row + dr * distance;
                    const toCol = col + dc * distance;
                    
                    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) break;
                    
                    if (this.isValidMove(row, col, toRow, toCol)) {
                        validMoves.push({ row: toRow, col: toCol });
                    }
                    
                    if (this.board[toRow][toCol]) break;
                    distance++;
                }
            }
        }

        return validMoves;
    },

    undoLastMove() {
        if (this.moveHistory.length === 0) return false;

        const lastMove = this.moveHistory.pop();
        
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = null;

        // Вернуть взятую фигуру (упрощенно)
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.selectedSquare = null;
        this.mustCapture = this.hasCaptureMoves(this.currentPlayer);

        return true;
    },

    checkWinner() {
        let whitePieces = 0;
        let blackPieces = 0;

        // Сначала просто подсчитать фигуры
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece) {
                    if (piece.color === 'white') {
                        whitePieces++;
                    } else {
                        blackPieces++;
                    }
                }
            }
        }

        // Если у кого-то не осталось фигур - он проиграл
        if (whitePieces === 0) return 'black';
        if (blackPieces === 0) return 'white';
        
        // Проверить, может ли ТЕКУЩИЙ игрок ходить
        // (проверяем только когда это действительно его ход)
        let currentPlayerCanMove = false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === this.currentPlayer) {
                    if (this.getValidMoves(r, c).length > 0) {
                        currentPlayerCanMove = true;
                        break;
                    }
                }
            }
            if (currentPlayerCanMove) break;
        }
        
        // Если текущий игрок не может ходить - он проиграл
        if (!currentPlayerCanMove && this.moveHistory.length > 0) {
            return this.currentPlayer === 'white' ? 'black' : 'white';
        }
        
        return null;
    }
};
