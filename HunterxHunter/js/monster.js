const QUESTIONS = [
    {
        text: 'Как ты решаешь сложную задачу?',
        answers: [
            {text: 'Иду напролом и усиливаю то, что уже умею', type: 'enhancer'},
            {text: 'Меняю подход и подстраиваюсь под ситуацию', type: 'transmuter'},
            {text: 'Действую на дистанции и держу контроль пространства', type: 'emitter'},
            {text: 'Собираю план и управляю каждым шагом', type: 'manipulator'}
        ]
    },
    {
        text: 'Что тебе ближе в бою?',
        answers: [
            {text: 'Физическая мощь и прямой контакт', type: 'enhancer'},
            {text: 'Непредсказуемые приемы и хитрые эффекты', type: 'transmuter'},
            {text: 'Точные удары на расстоянии', type: 'emitter'},
            {text: 'Ловушки и контроль противника', type: 'manipulator'}
        ]
    },
    {
        text: 'Какой стиль силы тебе интереснее?',
        answers: [
            {text: 'Создавать собственные предметы из ауры', type: 'conjurer'},
            {text: 'Уникальная способность, не похожая ни на что', type: 'specialist'},
            {text: 'Усилить базовые параметры до предела', type: 'enhancer'},
            {text: 'Передавать ауру и запускать атаки далеко', type: 'emitter'}
        ]
    },
    {
        text: 'В команде ты обычно...',
        answers: [
            {text: 'Опора и таран команды', type: 'enhancer'},
            {text: 'Тактик, который контролирует темп', type: 'manipulator'},
            {text: 'Тот, кто придумывает нестандартные решения', type: 'specialist'},
            {text: 'Мастер инструментов и подготовленных ресурсов', type: 'conjurer'}
        ]
    },
    {
        text: 'Что важнее при развитии техники?',
        answers: [
            {text: 'Стабильность и постоянная тренировка', type: 'enhancer'},
            {text: 'Гибкость и смена свойств ауры', type: 'transmuter'},
            {text: 'Точность и дальность применения', type: 'emitter'},
            {text: 'Сложные правила, чтобы усилить эффект', type: 'conjurer'}
        ]
    },
    {
        text: 'Как действуешь в неожиданной опасности?',
        answers: [
            {text: 'Атакую первым и не даю шанса', type: 'enhancer'},
            {text: 'Резко меняю тактику на ходу', type: 'transmuter'},
            {text: 'Удерживаю дистанцию и бью издалека', type: 'emitter'},
            {text: 'Подчиняю ситуацию через расчет и контроль', type: 'manipulator'}
        ]
    },
    {
        text: 'Что тебя мотивирует сильнее всего?',
        answers: [
            {text: 'Победа через дисциплину и силу', type: 'enhancer'},
            {text: 'Свобода в выборе необычного пути', type: 'specialist'},
            {text: 'Создать идеальную технику с условиями', type: 'conjurer'},
            {text: 'Превратить простое в нечто нестандартное', type: 'transmuter'}
        ]
    },
    {
        text: 'Какой финальный стиль тебе ближе?',
        answers: [
            {text: 'Контроль противника и поля боя', type: 'manipulator'},
            {text: 'Редкая уникальность, которая ломает шаблон', type: 'specialist'},
            {text: 'Материализация оружия и инструментов', type: 'conjurer'},
            {text: 'Мощный выстрел ауры в ключевой момент', type: 'emitter'}
        ]
    }
]

const HATSU_TYPES = {
    enhancer: {
        title: 'Усиление',
        color: '#ffd076',
        description: 'Ты тип Усиления: прямолинейный, надежный и максимально эффективный в ближнем бою. Твоя сила растет через дисциплину и постоянные тренировки.'
    },
    transmuter: {
        title: 'Трансформация',
        color: '#7fd1ff',
        description: 'Ты тип Трансформации: гибкий и изобретательный. Ты умеешь менять свойства ауры и превращать обычные идеи в нестандартные техники.'
    },
    emitter: {
        title: 'Эмиссия',
        color: '#9fffc8',
        description: 'Ты тип Эмиссии: точный и быстрый на дистанции. Тебе подходит стиль с высоким темпом и сильным контролем пространства.'
    },
    manipulator: {
        title: 'Манипуляция',
        color: '#d3bbff',
        description: 'Ты тип Манипуляции: стратег и контролер. Ты выигрываешь за счет планирования, ловушек и правильного управления ситуацией.'
    },
    conjurer: {
        title: 'Материализация',
        color: '#ffc48c',
        description: 'Ты тип Материализации: структурный и методичный. Твои сильные стороны это правила, условия и точная механика способностей.'
    },
    specialist: {
        title: 'Специализация',
        color: '#ff9fb2',
        description: 'Ты тип Специализации: редкий и уникальный. Тебе близки необычные способности, которые невозможно просто повторить.'
    }
}

const TYPE_PRIORITY = ['enhancer', 'transmuter', 'emitter', 'manipulator', 'conjurer', 'specialist']

const timerElement = document.querySelector('#game-timer')
const progressElement = document.querySelector('#game-progress')
const startButton = document.querySelector('#start-game')
const restartButton = document.querySelector('#restart-game')
const introScreen = document.querySelector('#intro-screen')
const questionScreen = document.querySelector('#question-screen')
const resultScreen = document.querySelector('#result-screen')
const questionTitle = document.querySelector('#question-title')
const questionText = document.querySelector('#question-text')
const answersContainer = document.querySelector('#answers')
const resultTitle = document.querySelector('#result-title')
const resultDescription = document.querySelector('#result-description')
const resultTime = document.querySelector('#result-time')

const initialScores = () => ({
    enhancer: 0,
    transmuter: 0,
    emitter: 0,
    manipulator: 0,
    conjurer: 0,
    specialist: 0
})

let scores = initialScores()
let currentQuestionIndex = 0
let startedAt = 0
let timerId = null
let isGameActive = false

const pad = (value) => String(value).padStart(2, '0')

const formatTime = (milliseconds) => {
    const total = Math.max(0, milliseconds)
    const minutes = Math.floor(total / 60000)
    const seconds = Math.floor((total % 60000) / 1000)
    const hundredths = Math.floor((total % 1000) / 10)

    return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`
}

const showScreen = (screen) => {
    ;[introScreen, questionScreen, resultScreen].forEach((item) => {
        item.classList.remove('screen_active')
    })

    screen.classList.add('screen_active')
}

const updateTimer = () => {
    if (!startedAt) {
        timerElement.textContent = '00:00.00'
        return
    }

    timerElement.textContent = formatTime(performance.now() - startedAt)
}

const startTimer = () => {
    clearInterval(timerId)
    startedAt = performance.now()
    updateTimer()
    timerId = setInterval(updateTimer, 10)
}

const stopTimer = () => {
    clearInterval(timerId)
    timerId = null

    if (!startedAt) return 0

    return performance.now() - startedAt
}

const updateProgress = () => {
    if (!isGameActive) {
        progressElement.textContent = `0/${QUESTIONS.length}`
        return
    }

    const visibleQuestion = Math.min(currentQuestionIndex + 1, QUESTIONS.length)
    progressElement.textContent = `${visibleQuestion}/${QUESTIONS.length}`
}

const getResultType = () => {
    const maxScore = Math.max(...Object.values(scores))
    const tied = TYPE_PRIORITY.filter((type) => scores[type] === maxScore)

    return tied[0]
}

const finishGame = () => {
    isGameActive = false
    const elapsedTime = stopTimer()
    const typeKey = getResultType()
    const result = HATSU_TYPES[typeKey]

    resultScreen.style.setProperty('--result-color', result.color)
    resultTitle.textContent = `Твой Хацу: ${result.title}`
    resultDescription.textContent = result.description
    resultTime.textContent = formatTime(elapsedTime)
    progressElement.textContent = `${QUESTIONS.length}/${QUESTIONS.length}`

    showScreen(resultScreen)
}

const handleAnswer = (type, button) => {
    if (!isGameActive) return

    scores[type] += 1

    const allButtons = answersContainer.querySelectorAll('.answer-btn')
    allButtons.forEach((item) => {
        item.disabled = true
    })

    button.classList.add('answer-btn_selected')

    setTimeout(() => {
        currentQuestionIndex += 1

        if (currentQuestionIndex >= QUESTIONS.length) {
            finishGame()
            return
        }

        renderQuestion()
    }, 180)
}

const renderQuestion = () => {
    const question = QUESTIONS[currentQuestionIndex]

    questionTitle.textContent = `Вопрос ${currentQuestionIndex + 1}`
    questionText.textContent = question.text
    answersContainer.innerHTML = ''

    question.answers.forEach((answer) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'answer-btn'
        button.textContent = answer.text

        button.addEventListener('click', () => {
            handleAnswer(answer.type, button)
        })

        answersContainer.append(button)
    })

    updateProgress()
}

const startGame = () => {
    scores = initialScores()
    currentQuestionIndex = 0
    isGameActive = true

    startTimer()
    renderQuestion()
    showScreen(questionScreen)
}

const initGame = () => {
    if (!startButton || !restartButton || !timerElement || !progressElement) return

    timerElement.textContent = '00:00.00'
    progressElement.textContent = `0/${QUESTIONS.length}`

    startButton.addEventListener('click', startGame)
    restartButton.addEventListener('click', startGame)
}

initGame()
