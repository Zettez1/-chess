// Переводы для сайта
const translations = {
    ru: {
        title: '♔ Премиум Шахматная Платформа',
        subtitle: 'Элитные Шахматы Online',
        selectMode: '🎮 Выберите режим игры',
        playerVsPlayer: 'Игрок vs Игрок',
        vsAI: 'Против ИИ',
        unbeatable: 'НЕПОБЕДИМЫЙ',
        chess: 'Шахматы',
        checkers: 'Шашки',
        white: 'Белые',
        black: 'Черные',
        turn: 'Ход',
        newGame: 'Новая игра',
        undo: 'Отменить ход',
        hint: 'Подсказка',
        capturedByWhite: 'Взятые белыми:',
        capturedByBlack: 'Взятые черными:',
        victory: 'ПОБЕДА!',
        whiteWon: 'Белые победили!',
        blackWon: 'Черные победили!',
        totalMoves: 'Всего ходов',
        gameTime: 'Время игры',
        capturedPieces: 'Взято фигур',
        gameMode: 'Режим',
        pvpMode: 'PVP',
        aiMode: 'VS ИИ',
        viewGame: 'Просмотр',
        aiThinking: '🤖 ИИ думает...',
        searchingBestMove: '💡 Ищу лучший ход...',
        tryThisMove: '💡 Попробуйте этот ход!',
        noMovesAvailable: 'Нет доступных ходов',
        noMovesToUndo: 'Нет ходов для отмены'
    },
    en: {
        title: '♔ Premium Chess Platform',
        subtitle: 'Elite Chess Online',
        selectMode: '🎮 Select game mode',
        playerVsPlayer: 'Player vs Player',
        vsAI: 'Vs AI',
        unbeatable: 'UNBEATABLE',
        chess: 'Chess',
        checkers: 'Checkers',
        white: 'White',
        black: 'Black',
        turn: 'Turn',
        newGame: 'New Game',
        undo: 'Undo Move',
        hint: 'Hint',
        capturedByWhite: 'Captured by White:',
        capturedByBlack: 'Captured by Black:',
        victory: 'VICTORY!',
        whiteWon: 'White wins!',
        blackWon: 'Black wins!',
        totalMoves: 'Total Moves',
        gameTime: 'Game Time',
        capturedPieces: 'Pieces Taken',
        gameMode: 'Mode',
        pvpMode: 'PVP',
        aiMode: 'VS AI',
        viewGame: 'View',
        aiThinking: '🤖 AI is thinking...',
        searchingBestMove: '💡 Finding best move...',
        tryThisMove: '💡 Try this move!',
        noMovesAvailable: 'No moves available',
        noMovesToUndo: 'No moves to undo'
    },
    ua: {
        title: '♔ Преміум Шахова Платформа',
        subtitle: 'Елітні Шахи Online',
        selectMode: '🎮 Оберіть режим гри',
        playerVsPlayer: 'Гравець vs Гравець',
        vsAI: 'Проти ШІ',
        unbeatable: 'НЕПЕРЕМОЖНИЙ',
        chess: 'Шахи',
        checkers: 'Шашки',
        white: 'Білі',
        black: 'Чорні',
        turn: 'Хід',
        newGame: 'Нова гра',
        undo: 'Скасувати хід',
        hint: 'Підказка',
        capturedByWhite: 'Взяті білими:',
        capturedByBlack: 'Взяті чорними:',
        victory: 'ПЕРЕМОГА!',
        whiteWon: 'Білі перемогли!',
        blackWon: 'Чорні перемогли!',
        totalMoves: 'Всього ходів',
        gameTime: 'Час гри',
        capturedPieces: 'Взято фігур',
        gameMode: 'Режим',
        pvpMode: 'PVP',
        aiMode: 'VS ШІ',
        viewGame: 'Перегляд',
        aiThinking: '🤖 ШІ думає...',
        searchingBestMove: '💡 Шукаю кращий хід...',
        tryThisMove: '💡 Спробуйте цей хід!',
        noMovesAvailable: 'Немає доступних ходів',
        noMovesToUndo: 'Немає ходів для скасування'
    }
};

let currentLang = 'ru';

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // Обновить все элементы с data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // Обновить активную кнопку языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Сохранить выбор языка
    localStorage.setItem('language', lang);
}

function translate(key) {
    return translations[currentLang][key] || key;
}

// Загрузить сохраненный язык при запуске
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'ru';
    setLanguage(savedLang);
});
