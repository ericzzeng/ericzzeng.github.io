// 游戏数据 - 从 data.js 加载
const elements = window.ELEMENTS;

// 定义元素分类
const elementTypes = {
    type1: ["Li", "Be", "Na", "Mg", "Al", "K", "Ca", "Cu", "Hg", "Au"],
    type2: ["H", "B", "C", "N", "O", "F", "Si", "P", "S", "Cl", "Ar", "Br"],
    type3: ["He", "Ne", "Kr", "Xe"]
};

// 转换谜题数据格式
const riddles = window.ELEMENT_RIDDLES.map(riddle => ({
    question: riddle.question,
    answer: riddle.answer.symbol,
    element: riddle.answer.name
}));

// DOM元素
const mainMenu = document.getElementById('mainMenu');
const singleGameSelection = document.getElementById('singleGameSelection');
const teamSetup = document.getElementById('teamSetup');
const gameContainer = document.getElementById('gameContainer');
const gameTitle = document.getElementById('gameTitle');
const gameTimer = document.getElementById('gameTimer');
const resultTime = document.getElementById('resultTime');
const gameResult = document.getElementById('gameResult');
const mistakesList = document.getElementById('mistakesList');
const snakeLength = document.getElementById('snakeLength');
const lengthDisplay = document.getElementById('lengthDisplay');
const resultTitle = document.getElementById('resultTitle');
const nextGameBtn = document.getElementById('nextGame');
const teamRanking = document.getElementById('teamRanking');
const rankingList = document.getElementById('rankingList');
const snakeRule = document.getElementById('snakeRule');
const gameProgress = document.getElementById('gameProgress');
const correctCount = document.getElementById('correctCount');
const gameRule = document.getElementById('gameRule');

// 游戏状态
let currentGame = null;
let startTime = null;
let timerInterval = null;
let selectedBubbles = [];
let matchedPairs = 0;
let currentRiddleIndex = 0;
let correctAnswers = 0;
let snakeDirection = 'right';
let snake = [];
let foods = [];
let ateFood = null;
let gameActive = false;
let gameLoopInterval = null;
let mistakes = []; // 存储错误记录
let totalTime = 0; // 累计时间
let teamGameMode = false; // 是否为小组游戏模式
let currentTeamGameIndex = 0; // 当前小组游戏关卡索引
const teamGameOrder = ['match', 'riddle', 'puzzle', 'snake']; // 小组游戏顺序
let snakeHeadElement = null; // 蛇头元素

// 小组数据存储
let teamData = JSON.parse(localStorage.getItem('teamData')) || [];

// 页面导航
document.getElementById('singlePlayerBtn').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    singleGameSelection.style.display = 'block';
    teamGameMode = false;
});

document.getElementById('teamGameBtn').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    teamSetup.style.display = 'block';
    teamGameMode = true;
});

document.getElementById('backToMain').addEventListener('click', backToMain);
document.getElementById('backToMain2').addEventListener('click', backToMain);
document.getElementById('backToSelection').addEventListener('click', backToSelection);
document.getElementById('playAgain').addEventListener('click', () => {
    gameResult.style.display = 'none';
    startGame(currentGame);
});

document.getElementById('nextGame').addEventListener('click', () => {
    gameResult.style.display = 'none';
    if (teamGameMode && currentTeamGameIndex < teamGameOrder.length - 1) {
        currentTeamGameIndex++;
        startGame(teamGameOrder[currentTeamGameIndex]);
    } else if (teamGameMode) {
        // 小组游戏完成
        endTeamGame();
    }
});

function backToMain() {
    singleGameSelection.style.display = 'none';
    teamSetup.style.display = 'none';
    gameContainer.style.display = 'none';
    mainMenu.style.display = 'block';
    resetGame();
}

function backToSelection() {
    gameResult.style.display = 'none';
    gameContainer.style.display = 'none';
    singleGameSelection.style.display = 'block';
    resetGame();
}

// 开始游戏
document.querySelectorAll('.game-option').forEach(option => {
    option.addEventListener('click', () => {
        const gameType = option.dataset.game;
        startGame(gameType);
    });
});

document.getElementById('startTeamGame').addEventListener('click', () => {
    const teamName = document.getElementById('teamName').value;
    const classSelect = document.getElementById('classSelect').value;
    const memberInputs = document.querySelectorAll('.member-input');
    const members = Array.from(memberInputs).map(input => input.value).filter(name => name.trim() !== '');
    
    if (!teamName || members.length !== 4) {
        alert('请填写完整的小组信息（小组名称和4位成员姓名）');
      return;
    }
    
    // 保存小组信息
    currentTeam = {
        name: teamName,
        class: classSelect,
        members: members,
        startTime: new Date(),
        gameTimes: [],
        totalTime: 0
    };
    
    // 开始小组游戏
    currentTeamGameIndex = 0;
    startGame(teamGameOrder[currentTeamGameIndex]);
});

function startGame(gameType) {
    singleGameSelection.style.display = 'none';
    teamSetup.style.display = 'none';
    gameContainer.style.display = 'block';
    gameResult.style.display = 'none';
    
    // 隐藏所有游戏
    document.getElementById('matchGame').style.display = 'none';
    document.getElementById('riddleGame').style.display = 'none';
    document.getElementById('puzzleGame').style.display = 'none';
    document.getElementById('snakeGame').style.display = 'none';
    snakeLength.style.display = 'none';
    snakeRule.style.display = 'none';
    gameProgress.style.display = 'none';
    gameRule.style.display = 'none';
    
    // 设置游戏标题
    const gameTitles = {
        'match': '元素消消乐',
        'riddle': '元素猜谜语',
        'puzzle': '元素拼拼乐',
        'snake': '元素贪吃蛇'
    };
    gameTitle.textContent = gameTitles[gameType];
    
    // 初始化游戏
    resetGame();
    currentGame = gameType;
    
    // 根据游戏类型显示对应的游戏并初始化
    switch(gameType) {
        case 'match':
            document.getElementById('matchGame').style.display = 'grid';
            initMatchGame();
            break;
        case 'riddle':
            document.getElementById('riddleGame').style.display = 'block';
            gameProgress.style.display = 'block';
            gameRule.style.display = 'block';
            initRiddleGame();
            break;
        case 'puzzle':
            document.getElementById('puzzleGame').style.display = 'block';
            initPuzzleGame();
            break;
        case 'snake':
            document.getElementById('snakeGame').style.display = 'block';
            snakeLength.style.display = 'block';
            snakeRule.style.display = 'block';
            initSnakeGame();
            break;
    }
    
    // 开始计时
    startTimer();
}

// 计时器
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(() => {
        const elapsed = new Date() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        const elapsed = new Date() - startTime;
        resultTime.textContent = gameTimer.textContent;
        return elapsed;
    }
    return 0;
}

// 重置游戏状态
function resetGame() {
    stopTimer();
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
    selectedBubbles = [];
    matchedPairs = 0;
    currentRiddleIndex = 0;
    correctAnswers = 0;
    snakeDirection = 'right';
    snake = [];
    foods = [];
    ateFood = null;
    gameActive = false;
    mistakes = []; // 重置错误记录
    nextGameBtn.style.display = 'none';
    teamRanking.style.display = 'none';
    snakeHeadElement = null;
    correctCount.textContent = "0";
}

// 元素消消乐游戏
function initMatchGame() {
    const matchGame = document.getElementById('matchGame');
    matchGame.innerHTML = '';
    
    // 复制元素数组并打乱顺序
    const shuffledElements = [...elements];
    shuffleArray(shuffledElements);
    
    // 创建符号气泡
    const symbolBubbles = shuffledElements.map(element => {
        return {
            type: 'symbol',
            symbol: element.symbol,
            name: element.name,
            content: element.symbol
        };
    });
    
    // 创建名称气泡
    const nameBubbles = shuffledElements.map(element => {
        return {
            type: 'name',
            symbol: element.symbol,
            name: element.name,
            content: element.name
        };
    });
    
    // 合并并打乱所有气泡
    const allBubbles = [...symbolBubbles, ...nameBubbles];
    shuffleArray(allBubbles);
    
    // 确保每行都有符号和名称
    const rows = [];
    for (let i = 0; i < 6; i++) {
        const row = allBubbles.slice(i * 10, (i + 1) * 10);
        rows.push(row);
    }
    
    // 创建气泡元素
    rows.forEach(row => {
        row.forEach(bubbleData => {
            const bubble = document.createElement('div');
            bubble.className = `bubble ${bubbleData.type}`;
            bubble.innerHTML = `<div class="${bubbleData.type === 'symbol' ? 'symbol-text' : 'name-text'}">${bubbleData.content}</div>`;
            bubble.dataset.symbol = bubbleData.symbol;
            bubble.addEventListener('click', handleBubbleClick);
            matchGame.appendChild(bubble);
        });
    });
}

function handleBubbleClick(e) {
    const bubble = e.currentTarget;
    
    // 如果已经匹配或是当前选中的，则忽略
    if (bubble.classList.contains('matched') || bubble.classList.contains('selected')) {
        return;
    }
    
    // 选中气泡
    bubble.classList.add('selected');
    selectedBubbles.push(bubble);
    
    // 如果选中了两个气泡
    if (selectedBubbles.length === 2) {
        const bubble1 = selectedBubbles[0];
        const bubble2 = selectedBubbles[1];
        
        // 检查是否匹配
        if (bubble1.dataset.symbol === bubble2.dataset.symbol) {
            // 匹配成功
            setTimeout(() => {
                bubble1.classList.add('matched');
                bubble2.classList.add('matched');
                selectedBubbles = [];
                matchedPairs++;
                
                // 检查游戏是否结束
                if (matchedPairs === elements.length) {
                    setTimeout(endGame, 500);
                }
            }, 500);
        } else {
            // 不匹配 - 记录错误
            const element1 = elements.find(e => e.symbol === bubble1.dataset.symbol);
            const element2 = elements.find(e => e.symbol === bubble2.dataset.symbol);
            
            mistakes.push({
                type: 'match',
                content: `错误匹配: ${element1.symbol} (${element1.name}) 和 ${element2.symbol} (${element2.name})`
            });
            
            setTimeout(() => {
                bubble1.classList.remove('selected');
                bubble2.classList.remove('selected');
                selectedBubbles = [];
            }, 1000);
        }
    }
}

// 元素猜谜语游戏
function initRiddleGame() {
    document.getElementById('matchGame').style.display = 'none';
    document.getElementById('riddleGame').style.display = 'block';
    
    showNextRiddle();
}

function showNextRiddle() {
    if (correctAnswers >= 15) {
        endGame();
        return;
    }
    
    // 更新答对题目数量
    correctCount.textContent = correctAnswers;
    
    const riddle = riddles[currentRiddleIndex];
    const riddleQuestion = document.getElementById('riddleQuestion');
    const riddleOptions = document.getElementById('riddleOptions');
    
    riddleQuestion.textContent = riddle.question;
    riddleOptions.innerHTML = '';
    
    // 创建选项（包含正确答案和随机错误答案）
    const options = [riddle];
    while (options.length < 4) {
        const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
        if (!options.some(opt => opt.answer === randomRiddle.answer)) {
            options.push(randomRiddle);
        }
    }
    
    // 打乱选项顺序
    shuffleArray(options);
    
    // 添加选项到页面
    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'riddle-option';
        optionElement.textContent = `${option.answer} ${option.element}`;
        optionElement.dataset.answer = option.answer;
        optionElement.addEventListener('click', () => checkRiddleAnswer(optionElement, option.answer === riddle.answer));
        riddleOptions.appendChild(optionElement);
    });
}

function checkRiddleAnswer(optionElement, isCorrect) {
    const currentRiddle = riddles[currentRiddleIndex];
    
    if (isCorrect) {
        optionElement.classList.add('correct');
        correctAnswers++;
        
        // 更新答对题目数量
        correctCount.textContent = correctAnswers;
        
        // 答对后立即进入下一题
        setTimeout(() => {
            currentRiddleIndex++;
            if (currentRiddleIndex >= riddles.length) {
                currentRiddleIndex = 0; // 循环谜题库
            }
            showNextRiddle();
        }, 500);
    } else {
        optionElement.classList.add('incorrect');
        
        // 记录错误
        mistakes.push({
            type: 'riddle',
            content: `谜题: "${currentRiddle.question}" | 你的答案: ${optionElement.dataset.answer} | 正确答案: ${currentRiddle.answer}`
        });
        
        // 找到正确答案并标记
        const options = document.querySelectorAll('.riddle-option');
        options.forEach(opt => {
            if (opt.dataset.answer === currentRiddle.answer) {
                opt.classList.add('correct');
            }
        });
        
        // 答错后延迟进入下一题
        setTimeout(() => {
            currentRiddleIndex++;
            if (currentRiddleIndex >= riddles.length) {
                currentRiddleIndex = 0; // 循环谜题库
            }
            showNextRiddle();
        }, 1500);
    }
}

// 元素拼拼乐游戏
function initPuzzleGame() {
    document.getElementById('matchGame').style.display = 'none';
    document.getElementById('puzzleGame').style.display = 'block';
    
    const periodicTable = document.getElementById('periodicTable');
    const puzzlePieces = document.getElementById('puzzlePieces');
    
    periodicTable.innerHTML = '';
    puzzlePieces.innerHTML = '';
    
    // 创建周期表（只显示前20号元素）- 修复：只显示空单元格
    for (let i = 1; i <= 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'element-cell empty';
        cell.dataset.atomicNumber = i;
        cell.dataset.row = getRowForElement(i);
        cell.dataset.column = getColumnForElement(i);
        
        // 设置位置
        cell.style.gridRow = getRowForElement(i);
        cell.style.gridColumn = getColumnForElement(i);
        
        periodicTable.appendChild(cell);
    }
    
    // 创建拼图块
    const shuffledElements = [...elements].filter(e => e.atomicNumber <= 20);
    shuffleArray(shuffledElements);
    
    shuffledElements.forEach(element => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.draggable = true;
        piece.innerHTML = `
            <div class="puzzle-info">
                <div>${element.atomicNumber}</div>
                <div style="font-family: 'Times New Roman'; font-weight: bold;">${element.symbol}</div>
                <div>${element.name}</div>
            </div>
        `;
        piece.dataset.atomicNumber = element.atomicNumber;
        
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', element.atomicNumber);
            piece.classList.add('dragging');
        });
        
        piece.addEventListener('dragend', () => {
            piece.classList.remove('dragging');
        });
        
        puzzlePieces.appendChild(piece);
    });
    
    // 添加放置目标事件
    const emptyCells = document.querySelectorAll('.element-cell.empty');
    emptyCells.forEach(cell => {
        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            const atomicNumber = parseInt(e.dataTransfer.getData('text/plain'));
            const piece = document.querySelector(`.puzzle-piece[data-atomic-number="${atomicNumber}"]`);
            
            if (parseInt(cell.dataset.atomicNumber) === atomicNumber) {
                // 正确放置
                cell.classList.remove('empty');
                cell.classList.add('filled');
                cell.innerHTML = `
                    <div>${atomicNumber}</div>
                    <div style="font-family: 'Times New Roman'; font-weight: bold;">${elements.find(el => el.atomicNumber === atomicNumber).symbol}</div>
                    <div>${elements.find(el => el.atomicNumber === atomicNumber).name}</div>
                `;
                
                piece.classList.add('correct');
                
                // 检查游戏是否完成
                const remaining = document.querySelectorAll('.element-cell.empty').length;
                if (remaining === 0) {
                    setTimeout(endGame, 500);
                }
          } else {
                // 错误放置 - 记录错误
                const element = elements.find(e => e.atomicNumber === atomicNumber);
                const correctPosition = getPositionForElement(atomicNumber);
                const placedPosition = {
                    row: cell.dataset.row,
                    column: cell.dataset.column
                };
                
                mistakes.push({
                    type: 'puzzle',
                    content: `元素: ${element.symbol} (${element.name}) | 你放的位置: ${placedPosition.row}行${placedPosition.column}列 | 正确位置: ${correctPosition.row}行${correctPosition.column}列`
                });
            }
        });
    });
}

function getRowForElement(atomicNumber) {
    if (atomicNumber === 1 || atomicNumber === 2) return 1;
    if (atomicNumber >= 3 && atomicNumber <= 10) return 2;
    if (atomicNumber >= 11 && atomicNumber <= 18) return 3;
    return 4; // 19-20
}

function getColumnForElement(atomicNumber) {
    const positions = {
        1: 1, 2: 18,
        3: 1, 4: 2, 5: 13, 6: 14, 7: 15, 8: 16, 9: 17, 10: 18,
        11: 1, 12: 2, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18,
        19: 1, 20: 2
    };
    return positions[atomicNumber];
}

function getPositionForElement(atomicNumber) {
    return {
        row: getRowForElement(atomicNumber),
        column: getColumnForElement(atomicNumber)
    };
}

// 元素贪吃蛇游戏 - 根据新规则修改
function initSnakeGame() {
    document.getElementById('matchGame').style.display = 'none';
    document.getElementById('snakeGame').style.display = 'block';
    
    const snakeBoard = document.getElementById('snakeBoard');
    snakeBoard.innerHTML = '';
    
    // 初始化蛇 - 固定为三个绿色圆形格子，位置必须是30的倍数
    snake = [
        {x: 150, y: 180},  // 150 = 5*30, 180 = 6*30
        {x: 120, y: 180},  // 120 = 4*30, 180 = 6*30
        {x: 90, y: 180}    // 90 = 3*30, 180 = 6*30
    ];
    
    // 设置蛇头元素（随机选择一个元素）
    snakeHeadElement = elements[Math.floor(Math.random() * elements.length)];
    
    // 更新蛇身长度显示
    updateSnakeLengthDisplay();
    
    // 创建蛇
    snake.forEach((segment, index) => {
        const segmentElement = document.createElement('div');
        segmentElement.className = 'snake-segment';
        if (index === 0) {
            segmentElement.classList.add('snake-head');
            segmentElement.textContent = snakeHeadElement.symbol;
        }
        segmentElement.style.left = `${segment.x}px`;
        segmentElement.style.top = `${segment.y}px`;
        snakeBoard.appendChild(segmentElement);
    });
    
    // 创建两种食物
    createFood();
    
    // 添加键盘控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 开始游戏循环 - 固定中等速度
    gameActive = true;
    gameLoopInterval = setInterval(gameLoop, 150); // 中等速度
}

function updateSnakeLengthDisplay() {
    lengthDisplay.textContent = snake.length;
}

function handleKeyPress(e) {
    if (e.key === 'ArrowUp' && snakeDirection !== 'down') {
        snakeDirection = 'up';
    } else if (e.key === 'ArrowDown' && snakeDirection !== 'up') {
        snakeDirection = 'down';
    } else if (e.key === 'ArrowLeft' && snakeDirection !== 'right') {
        snakeDirection = 'left';
    } else if (e.key === 'ArrowRight' && snakeDirection !== 'left') {
        snakeDirection = 'right';
    }
}

function createFood() {
    const snakeBoard = document.getElementById('snakeBoard');
    
    console.log('创建食物 - 蛇头元素:', snakeHeadElement);
    
    // 移除旧食物
    foods.forEach(food => {
        if (food.parentNode === snakeBoard) {
            snakeBoard.removeChild(food);
        }
    });
    foods = [];
    
    // 创建两种食物：
    // 1. 与蛇头元素同类型的元素
    // 2. 与蛇头元素不同类型的元素
    
    // 获取与蛇头元素同类型的元素
    const sameTypeElements = elements.filter(e => e.type === snakeHeadElement.type && e.symbol !== snakeHeadElement.symbol);
    console.log('同类型元素:', sameTypeElements);
    
    // 获取与蛇头元素不同类型的元素
    const differentTypeElements = elements.filter(e => e.type !== snakeHeadElement.type);
    console.log('不同类型元素:', differentTypeElements);
    
    // 随机选择两种食物
    const sameTypeElement = sameTypeElements[Math.floor(Math.random() * sameTypeElements.length)];
    const differentTypeElement = differentTypeElements[Math.floor(Math.random() * differentTypeElements.length)];
    
    console.log('选择的同类型食物:', sameTypeElement);
    console.log('选择的不同类型食物:', differentTypeElement);
    
    // 创建同类型食物
    if (sameTypeElement) {
        const food = document.createElement('div');
        food.className = 'element-food';
        food.textContent = sameTypeElement.symbol;
        food.dataset.symbol = sameTypeElement.symbol;
        food.dataset.name = sameTypeElement.name;
        food.dataset.atomicNumber = sameTypeElement.atomicNumber;
        food.dataset.type = sameTypeElement.type;
        
        // 随机位置，确保在网格上 - 修复网格计算
        const x = Math.floor(Math.random() * 20) * 30;
        const y = Math.floor(Math.random() * 13) * 30;
        food.style.left = `${x}px`;
        food.style.top = `${y}px`;
        
        console.log('创建同类型食物位置:', x, y, '实际样式:', food.style.left, food.style.top);
        
        snakeBoard.appendChild(food);
        foods.push(food);
        
        // 验证食物位置
        setTimeout(() => {
            console.log('验证同类型食物位置:', {
                computedLeft: food.style.left,
                computedTop: food.style.top,
                parsedX: parseInt(food.style.left),
                parsedY: parseInt(food.style.top)
            });
        }, 100);
    }
    
    // 创建不同类型食物
    if (differentTypeElement) {
        const food = document.createElement('div');
        food.className = 'element-food';
        food.textContent = differentTypeElement.symbol;
        food.dataset.symbol = differentTypeElement.symbol;
        food.dataset.name = differentTypeElement.name;
        food.dataset.atomicNumber = differentTypeElement.atomicNumber;
        food.dataset.type = differentTypeElement.type;
        
        // 随机位置，确保在网格上 - 修复网格计算
        const x = Math.floor(Math.random() * 20) * 30;
        const y = Math.floor(Math.random() * 13) * 30;
        food.style.left = `${x}px`;
        food.style.top = `${y}px`;
        
        console.log('创建不同类型食物位置:', x, y, '实际样式:', food.style.left, food.style.top);
        
        snakeBoard.appendChild(food);
        foods.push(food);
        
        // 验证食物位置
        setTimeout(() => {
            console.log('验证不同类型食物位置:', {
                computedLeft: food.style.left,
                computedTop: food.style.top,
                parsedX: parseInt(food.style.left),
                parsedY: parseInt(food.style.top)
            });
        }, 100);
    }
    
    console.log('总食物数量:', foods.length);
}

function gameLoop() {
    if (!gameActive) return;
    
    moveSnake();
    checkCollision();
}

function moveSnake() {
    const head = {...snake[0]};
    console.log('移动蛇 - 当前方向:', snakeDirection, '蛇头位置:', head.x, head.y, '蛇长度:', snake.length);
    
    // 根据方向移动头部
    if (snakeDirection === 'up') head.y -= 30;
    else if (snakeDirection === 'down') head.y += 30;
    else if (snakeDirection === 'left') head.x -= 30;
    else if (snakeDirection === 'right') head.x += 30;
    
    console.log('移动后蛇头位置:', head.x, head.y);
    
    // 边界穿越 - 从一侧穿过从另一侧出现
    if (head.x < 0) head.x = 570;
    else if (head.x >= 600) head.x = 0;
    if (head.y < 0) head.y = 370;
    else if (head.y >= 400) head.y = 0;
    
    console.log('边界处理后蛇头位置:', head.x, head.y);
    
    // 添加新头部
    snake.unshift(head);
    
    // 根据吃到的食物类型决定蛇的长度变化
    if (ateFood === 'same') {
        // 吃到同种元素，增长一个格子（不移除尾部）
        console.log('蛇增长1格，当前长度:', snake.length);
        ateFood = null;
    } else if (ateFood === 'different') {
        // 吃到不同种元素，减少两个格子
        console.log('蛇缩短2格，当前长度:', snake.length);
        snake.pop(); // 正常移动移除一个尾部
        snake.pop(); // 额外移除一个尾部
        console.log('缩短后长度:', snake.length);
        
        // 如果蛇长度减少到0，重置为3个格子
        if (snake.length <= 0) {
            console.log('蛇长度归零，重置蛇');
            resetSnake();
        }
        ateFood = null;
    } else {
        // 没吃到食物，正常移除尾部
        snake.pop();
        console.log('正常移动，蛇长度:', snake.length);
    }
    
    // 更新蛇的显示
    const snakeSegments = document.querySelectorAll('.snake-segment');
    // 移除所有旧蛇段
    snakeSegments.forEach(seg => seg.remove());
    
    // 创建新蛇段
    snake.forEach((segment, index) => {
        const segmentElement = document.createElement('div');
        segmentElement.className = 'snake-segment';
        if (index === 0) {
            segmentElement.classList.add('snake-head');
            segmentElement.textContent = snakeHeadElement.symbol;
        }
        segmentElement.style.left = `${segment.x}px`;
        segmentElement.style.top = `${segment.y}px`;
        document.getElementById('snakeBoard').appendChild(segmentElement);
    });
    
    // 更新长度显示
    updateSnakeLengthDisplay();
    
    // 检查是否达到12节
    if (snake.length >= 12) {
        console.log('蛇达到12节，游戏胜利!');
        setTimeout(endGame, 500);
    }
}

function resetSnake() {
    // 重置蛇为三个格子，位置必须是30的倍数
    snake = [
        {x: 150, y: 180},  // 150 = 5*30, 180 = 6*30
        {x: 120, y: 180},  // 120 = 4*30, 180 = 6*30
        {x: 90, y: 180}    // 90 = 3*30, 180 = 6*30
    ];
    
    // 重新设置蛇头元素
    snakeHeadElement = elements[Math.floor(Math.random() * elements.length)];
    
    // 重置方向
    snakeDirection = 'right';
}

function checkCollision() {
    const head = snake[0];
    console.log('检查碰撞 - 蛇头位置:', head.x, head.y, '食物数量:', foods.length);
    
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        const foodX = parseInt(food.style.left) || 0;
        const foodY = parseInt(food.style.top) || 0;
        
        console.log(`食物${i}:`, {
            symbol: food.dataset.symbol,
            type: food.dataset.type,
            position: {x: foodX, y: foodY},
            snakeHead: {x: head.x, y: head.y},
            collision: head.x === foodX && head.y === foodY,
            foodStyleLeft: food.style.left,
            foodStyleTop: food.style.top
        });
        
        if (head.x === foodX && head.y === foodY) {
            console.log('碰撞检测成功! 吃到食物:', food.dataset.symbol);
            
            const elementInfo = document.getElementById('elementInfo');
            if (elementInfo) {
                elementInfo.innerHTML = `
                    <div>${food.dataset.atomicNumber}</div>
                    <div style="font-family: 'Times New Roman'; font-weight: bold;">${food.dataset.symbol}</div>
                    <div>${food.dataset.name}</div>
                `;
                elementInfo.style.display = 'block';
                setTimeout(() => {
                    const curElementInfo = document.getElementById('elementInfo');
                    if (curElementInfo) curElementInfo.style.display = 'none';
                }, 2000);
            }
            
            if (food.dataset.type === snakeHeadElement.type) {
                ateFood = 'same';
                console.log('吃到同类型食物，蛇将增长');
            } else {
                ateFood = 'different';
                console.log('吃到不同类型食物，蛇将缩短');
                mistakes.push({
                    type: 'snake',
                    content: `吃到错误元素: ${food.dataset.symbol} (${food.dataset.name}) | 蛇头元素: ${snakeHeadElement.symbol} (${snakeHeadElement.name})`
                });
            }
            
            if (food.parentNode) food.parentNode.removeChild(food);
            foods.splice(i, 1);
            createFood();
            return;
        }
    }
}

// 游戏结束
function endGame() {
    gameActive = false;
    const gameTime = stopTimer();
    
    // 显示错误回顾
    displayMistakes();
    
    // 设置结果标题
    if (currentGame === 'snake' && snake.length >= 12) {
        resultTitle.textContent = "恭喜你挑战成功!";
        resultTime.textContent = `游戏所用时长: ${gameTimer.textContent}`;
    } else if (currentGame === 'riddle') {
        resultTitle.textContent = "恭喜你挑战成功!";
        resultTime.textContent = `游戏所用时长: ${gameTimer.textContent}`;
    } else {
        resultTitle.textContent = "挑战成功!";
        resultTime.textContent = gameTimer.textContent;
    }
    
    // 如果是小组游戏模式，记录时间并显示下一关按钮
    if (teamGameMode) {
        // 记录当前游戏时间
        if (currentTeam) {
            currentTeam.gameTimes.push({
                game: currentGame,
                time: gameTime
            });
        }
        
        // 如果不是最后一关，显示下一关按钮
        if (currentTeamGameIndex < teamGameOrder.length - 1) {
            nextGameBtn.style.display = 'inline-block';
        } else {
            nextGameBtn.style.display = 'none';
        }
    }
    
    gameResult.style.display = 'block';
}

// 小组游戏结束
function endTeamGame() {
    // 计算总时间
    if (currentTeam) {
        currentTeam.totalTime = currentTeam.gameTimes.reduce((total, gameTime) => total + gameTime.time, 0);
        currentTeam.endTime = new Date();
        
        // 保存到本地存储
        teamData.push(currentTeam);
        localStorage.setItem('teamData', JSON.stringify(teamData));
        
        // 显示小组排名
        displayTeamRanking();
    }
    
    gameResult.style.display = 'block';
    resultTitle.textContent = "小组挑战完成!";
    nextGameBtn.style.display = 'none';
}

// 显示错误内容
function displayMistakes() {
    mistakesList.innerHTML = '';
    
    if (mistakes.length === 0) {
        mistakesList.innerHTML = '<p class="mistake-item">太棒了！本次挑战没有错误！</p>';
        return;
    }
    
    mistakes.forEach(mistake => {
        const item = document.createElement('div');
        item.className = 'mistake-item';
        item.textContent = mistake.content;
        mistakesList.appendChild(item);
    });
}

// 显示小组排名
function displayTeamRanking() {
    teamRanking.style.display = 'block';
    rankingList.innerHTML = '';
    
    // 按总时间排序
    const sortedTeams = [...teamData].sort((a, b) => a.totalTime - b.totalTime);
    
    sortedTeams.forEach((team, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        
        const minutes = Math.floor(team.totalTime / 60000);
        const seconds = Math.floor((team.totalTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        item.innerHTML = `
            <div>
                <strong>${index + 1}. ${team.name}</strong> (${team.class}班)
            </div>
            <div>${timeString}</div>
        `;
        
        rankingList.appendChild(item);
    });
}

// 工具函数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}