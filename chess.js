// Шахматная логика
const chessGame = {
    board: [],
    currentPlayer: 'white',
    selectedSquare: null,
    moveHistory: [],
    capturedByWhite: [],
    capturedByBlack: [],

    pieces: {
        white: {
            king: '♔',
            queen: '♕',
            rook: '♖',
            bishop: '♗',
            knight: '♘',
            pawn: '♙'
        },
        black: {
            king: '♚',
            queen: '♛',
            rook: '♜',
            bishop: '♝',
            knight: '♞',
            pawn: '♟'
        }
    },

    init() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.capturedByWhite = [];
        this.capturedByBlack = [];
    },

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Черные фигуры
        board[0] = [
            { type: 'rook', color: 'black', symbol: this.pieces.black.rook },
            { type: 'knight', color: 'black', symbol: this.pieces.black.knight },
            { type: 'bishop', color: 'black', symbol: this.pieces.black.bishop },
            { type: 'queen', color: 'black', symbol: this.pieces.black.queen },
            { type: 'king', color: 'black', symbol: this.pieces.black.king },
            { type: 'bishop', color: 'black', symbol: this.pieces.black.bishop },
            { type: 'knight', color: 'black', symbol: this.pieces.black.knight },
            { type: 'rook', color: 'black', symbol: this.pieces.black.rook }
        ];
        
        // Черные пешки
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black', symbol: this.pieces.black.pawn };
        }
        
        // Белые пешки
        for (let i = 0; i < 8; i++) {
            board[6][i] = { type: 'pawn', color: 'white', symbol: this.pieces.white.pawn };
        }
        
        // Белые фигуры
        board[7] = [
            { type: 'rook', color: 'white', symbol: this.pieces.white.rook },
            { type: 'knight', color: 'white', symbol: this.pieces.white.knight },
            { type: 'bishop', color: 'white', symbol: this.pieces.white.bishop },
            { type: 'queen', color: 'white', symbol: this.pieces.white.queen },
            { type: 'king', color: 'white', symbol: this.pieces.white.king },
            { type: 'bishop', color: 'white', symbol: this.pieces.white.bishop },
            { type: 'knight', color: 'white', symbol: this.pieces.white.knight },
            { type: 'rook', color: 'white', symbol: this.pieces.white.rook }
        ];
        
        return board;
    },

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) return false;

        const target = this.board[toRow][toCol];
        if (target && target.color === this.currentPlayer) return false;

        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;

        switch (piece.type) {
            case 'pawn':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
            case 'rook':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return this.isValidKnightMove(rowDiff, colDiff);
            case 'bishop':
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case 'king':
                return this.isValidKingMove(rowDiff, colDiff);
            default:
                return false;
        }
    },

    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);

        // Движение вперед
        if (colDiff === 0) {
            if (rowDiff === direction && !this.board[toRow][toCol]) return true;
            if (fromRow === startRow && rowDiff === 2 * direction && 
                !this.board[toRow][toCol] && !this.board[fromRow + direction][fromCol]) {
                return true;
            }
        }
        
        // Взятие по диагонали
        if (colDiff === 1 && rowDiff === direction && this.board[toRow][toCol]) {
            return true;
        }

        return false;
    },

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    },

    isValidKnightMove(rowDiff, colDiff) {
        return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
               (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
    },

    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    },

    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) ||
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    },

    isValidKingMove(rowDiff, colDiff) {
        return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
    },

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    },

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const captured = this.board[toRow][toCol];

        // Сохранить ход для отмены
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: captured
        });

        // Взятие фигуры
        if (captured) {
            if (this.currentPlayer === 'white') {
                this.capturedByWhite.push(captured.symbol);
            } else {
                this.capturedByBlack.push(captured.symbol);
            }
        }

        // Переместить фигуру
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Превращение пешки
        if (piece.type === 'pawn') {
            if ((piece.color === 'white' && toRow === 0) || 
                (piece.color === 'black' && toRow === 7)) {
                this.board[toRow][toCol] = {
                    type: 'queen',
                    color: piece.color,
                    symbol: piece.color === 'white' ? this.pieces.white.queen : this.pieces.black.queen
                };
            }
        }

        // Сменить игрока
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.selectedSquare = null;
    },

    getValidMoves(row, col) {
        const validMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    validMoves.push({ row: r, col: c });
                }
            }
        }
        return validMoves;
    },

    undoLastMove() {
        if (this.moveHistory.length === 0) return false;

        const lastMove = this.moveHistory.pop();
        
        // Вернуть фигуру
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;

        // Вернуть взятую фигуру
        if (lastMove.captured) {
            if (this.currentPlayer === 'black') {
                this.capturedByWhite.pop();
            } else {
                this.capturedByBlack.pop();
            }
        }

        // Сменить игрока обратно
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.selectedSquare = null;

        return true;
    },

    checkWinner() {
        let whiteKing = false;
        let blackKing = false;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.type === 'king') {
                    if (piece.color === 'white') whiteKing = true;
                    if (piece.color === 'black') blackKing = true;
                }
            }
        }

        if (!whiteKing) return 'black';
        if (!blackKing) return 'white';
        return null;
    }
};
