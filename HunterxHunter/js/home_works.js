const gmailInput = document.querySelector("#gmail_input")
const gmailButton = document.querySelector("#gmail_button")
const gmailResult = document.querySelector("#gmail_result")

const regEx = /(?!\.)(?!.*\.\.)([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)@(gmail\.com)$/g

if (gmailButton && gmailInput && gmailResult) {
  gmailButton.addEventListener('click', () => {
    if (regEx.test(gmailInput.value)) {
      gmailResult.style.color = 'green';
      gmailResult.innerHTML = 'Gmail is valid';
    } else {
      gmailResult.style.color = 'red';
      gmailResult.innerHTML = 'Gmail is invalid';
    }
  });
}

// move block

const parentBlock = document.querySelector('.parent_block')
const childBlock = document.querySelector('.child_block')
const childBlockVideo = document.querySelector('.child_block__video')
const childBlockCanvas = document.querySelector('.child_block__canvas')

let positionX = 0
let positionY = 0

const offsetWidth = parentBlock.clientWidth - childBlock.clientWidth
const offsetHeight = parentBlock.clientHeight - childBlock.clientHeight

const initTransparentVideo = () => {
  if (!childBlockVideo || !childBlockCanvas) return

  const ctx = childBlockCanvas.getContext('2d', {willReadFrequently: true})
  if (!ctx) return

  const width = childBlockCanvas.width
  const height = childBlockCanvas.height
  const totalPixels = width * height
  const visited = new Uint8Array(totalPixels)
  const queue = new Uint32Array(totalPixels)

  const isBackgroundPixel = (r, g, b) => {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max - min
    const luma = 0.299 * r + 0.587 * g + 0.114 * b

    // Удаляем нейтральный (серый/белый/черный) фон, связанный с краями кадра.
    // Так исчезает шахматка/белый фон, а персонаж внутри кадра сохраняется.
    return saturation < 22 && (luma > 210 || luma < 40)
  }

  const draw = () => {
    if (childBlockVideo.readyState >= 2) {
      ctx.drawImage(childBlockVideo, 0, 0, width, height)
      const frame = ctx.getImageData(0, 0, width, height)
      const pixels = frame.data
      visited.fill(0)

      let head = 0
      let tail = 0

      const enqueueIfBackground = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return
        const idx = y * width + x
        if (visited[idx]) return

        const p = idx * 4
        const r = pixels[p]
        const g = pixels[p + 1]
        const b = pixels[p + 2]

        if (!isBackgroundPixel(r, g, b)) return
        visited[idx] = 1
        queue[tail++] = idx
      }

      for (let x = 0; x < width; x++) {
        enqueueIfBackground(x, 0)
        enqueueIfBackground(x, height - 1)
      }

      for (let y = 1; y < height - 1; y++) {
        enqueueIfBackground(0, y)
        enqueueIfBackground(width - 1, y)
      }

      while (head < tail) {
        const idx = queue[head++]
        const x = idx % width
        const y = (idx / width) | 0
        const p = idx * 4
        pixels[p + 3] = 0

        enqueueIfBackground(x + 1, y)
        enqueueIfBackground(x - 1, y)
        enqueueIfBackground(x, y + 1)
        enqueueIfBackground(x, y - 1)
      }

      ctx.putImageData(frame, 0, 0)
    }

    requestAnimationFrame(draw)
  }

  draw()
}

if (childBlockVideo) {
  if (childBlockVideo.readyState >= 2) {
    initTransparentVideo()
  } else {
    childBlockVideo.addEventListener('play', initTransparentVideo, {once: true})
  }
}

// Направление движения для поворота персонажа
let direction = 'right'

const move = () => {
  if (positionX < offsetWidth && positionY === 0) {
    positionX++
    direction = 'right'
  } else if (positionX >= offsetWidth && positionY < offsetHeight) {
    positionY++
    direction = 'down'
  } else if (positionY >= offsetHeight && positionX > 0) {
    positionX--
    direction = 'left'
  } else if (positionX <= 0 && positionY > 0) {
    positionY--
    direction = 'up'
  }

  childBlock.style.left = `${positionX}px`
  childBlock.style.top = `${positionY}px`
  const isOnCeiling = positionY === 0

  if (direction === 'right') {
    childBlock.style.transform = isOnCeiling ? 'scaleX(1) rotate(180deg)' : 'scaleX(-1) rotate(0deg)'
  } else if (direction === 'left') {
    childBlock.style.transform = 'scaleX(1) rotate(0deg)'
  } else if (direction === 'down') {
    childBlock.style.transform = 'rotate(-90deg)'
  } else if (direction === 'up') {
    childBlock.style.transform = 'rotate(90deg)'
  }

  requestAnimationFrame(move)
}

move()

// timer

const time = document.querySelector("#seconds")
const startBtn = document.querySelector("#start")
const stopBtn = document.querySelector("#stop")
const resetBtn = document.querySelector("#reset")

let timerId = 0
let running = false

const timer = () => {
  if (!running) {
    running = true

    timerId = setInterval(() => {
      time.innerHTML++
    }, 1000)
  }
}

if (time && startBtn && stopBtn && resetBtn) {
  startBtn.addEventListener("click", () => {
    timer()
  })

  stopBtn.addEventListener("click", () => {
    clearInterval(timerId)
    running = false
  })

  resetBtn.addEventListener("click", () => {
    clearInterval(timerId)
    time.innerHTML = 0
    running = false
  })
}

// CONVERTER

const somInput = document.querySelector('#som')
const usdInput = document.querySelector('#usd')
const eurInput = document.querySelector('#eur')
const jennyInput = document.querySelector('#jenny')

const JENNY_PER_USD = 34
let rates = null

const formatValue = (value) => {
  if (!Number.isFinite(value)) return ''
  return Number(value.toFixed(2)).toString()
}

const clearConverterInputs = () => {
  somInput.value = ''
  usdInput.value = ''
  eurInput.value = ''
  jennyInput.value = ''
}

const recalculate = (source) => {
  if (!rates) return

  const raw = source.value
  if (raw === '') {
    clearConverterInputs()
    return
  }

  const amount = parseFloat(raw)
  if (Number.isNaN(amount)) return

  let usdAmount = 0

  if (source.id === 'som') usdAmount = amount / rates.usd
  if (source.id === 'usd') usdAmount = amount
  if (source.id === 'eur') usdAmount = (amount * rates.eur) / rates.usd
  if (source.id === 'jenny') usdAmount = amount / JENNY_PER_USD

  const somAmount = usdAmount * rates.usd
  const eurAmount = somAmount / rates.eur
  const jennyAmount = usdAmount * JENNY_PER_USD

  somInput.value = source.id === 'som' ? raw : formatValue(somAmount)
  usdInput.value = source.id === 'usd' ? raw : formatValue(usdAmount)
  eurInput.value = source.id === 'eur' ? raw : formatValue(eurAmount)
  jennyInput.value = source.id === 'jenny' ? raw : formatValue(jennyAmount)
}

const initConverter = () => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '../data/converter.json')
  xhr.setRequestHeader('Content-type', 'application/json')
  xhr.send()

  xhr.onload = () => {
    rates = JSON.parse(xhr.response)
  }
}

if (somInput && usdInput && eurInput && jennyInput) {
  ;[somInput, usdInput, eurInput, jennyInput].forEach((input) => {
    input.addEventListener('input', () => recalculate(input))
  })

  initConverter()
}

// GREED ISLAND CARDS SLIDER

const giTrack = document.querySelector('#gi-track')
const giPrev = document.querySelector('#gi-prev')
const giNext = document.querySelector('#gi-next')
const giViewport = document.querySelector('#gi-viewport')
const giSubtitle = document.querySelector('#gi-subtitle')
const giRarityFilter = document.querySelector('#gi-rarity-filter')
const giFallbackImage = '../images/image.png'

const getGiCardsPerView = () => {
  if (window.innerWidth <= 640) return 1
  if (window.innerWidth <= 980) return 2
  return 3
}

const normalizeGiCard = (card) => {
  const normalizedRarity = typeof card.rarity === 'string'
    ? card.rarity.toUpperCase()
    : 'C'
  const rarity = ['SS', 'S', 'A', 'B', 'C'].includes(normalizedRarity)
    ? normalizedRarity
    : 'C'

  return {
    id: card.id || 'No. ---',
    name: card.name || 'Unknown card',
    rarity,
    type: card.type || 'Unknown',
    effect: card.effect || 'Нет описания.',
    illustration: card.illustration || giFallbackImage
  }
}

const loadGreedIslandCards = async () => {
  const response = await fetch('../data/greed_island_cards.json')
  if (!response.ok) throw new Error(`Status ${response.status}`)

  const payload = await response.json()
  if (!Array.isArray(payload)) return []

  return payload.map(normalizeGiCard)
}

const initGreedIslandSlider = async () => {
  if (!giTrack || !giPrev || !giNext || !giViewport) return

  let greedIslandCards = []

  try {
    greedIslandCards = await loadGreedIslandCards()
  } catch (error) {
    console.error('Failed to load Greed Island cards:', error)
    greedIslandCards = []
  }

  if (!greedIslandCards.length) {
    giTrack.innerHTML = '<article class="gi-card"><h4 class="gi-card__name">Карточки не загружены</h4><p class="gi-card__effect">Проверь data/greed_island_cards.json</p></article>'
    giPrev.disabled = true
    giNext.disabled = true
    return
  }

  const allCards = greedIslandCards
  let filteredCards = [...allCards]
  let selectedRarity = 'all'
  let index = 0
  let cardsPerView = getGiCardsPerView()

  const getMaxIndex = () => Math.max(filteredCards.length - cardsPerView, 0)

  const renderCards = () => {
    if (!filteredCards.length) {
      giTrack.innerHTML = '<article class="gi-card"><h4 class="gi-card__name">Нет карточек</h4><p class="gi-card__effect">Для выбранной редкости карточек данные не найдены.</p></article>'
      giPrev.disabled = true
      giNext.disabled = true
      return
    }

    giTrack.innerHTML = filteredCards.map((card) => {
      const rarityClass = `gi-card--rarity-${card.rarity.toLowerCase()}`
      return `
        <article class="gi-card ${rarityClass}">
          <div class="gi-card__head">
            <span class="gi-card__id">${card.id}</span>
            <span class="gi-card__rarity">${card.rarity}</span>
          </div>
          <span class="gi-card__type">${card.type}</span>
          <div class="gi-card__image-wrap">
            <img class="gi-card__image" src="${card.illustration}" alt="${card.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${giFallbackImage}'">
          </div>
          <h4 class="gi-card__name">${card.name}</h4>
          <div class="gi-card__line"></div>
          <p class="gi-card__effect">${card.effect}</p>
        </article>
      `
    }).join('')
  }

  const update = () => {
    const card = giTrack.querySelector('.gi-card')
    if (!card) return

    const cardWidth = card.getBoundingClientRect().width
    const trackStyles = window.getComputedStyle(giTrack)
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0
    const translateX = index * (cardWidth + gap)

    giTrack.style.transform = `translateX(-${translateX}px)`
    giPrev.disabled = index <= 0
    giNext.disabled = index >= getMaxIndex()
  }

  const updateSubtitle = () => {
    if (!giSubtitle) return
    const suffix = selectedRarity === 'all' ? 'Все редкости' : selectedRarity
    giSubtitle.textContent = `Показано карточек: ${filteredCards.length} · ${suffix}`
  }

  const applyRarityFilter = (rarityValue) => {
    selectedRarity = rarityValue
    filteredCards = rarityValue === 'all'
      ? [...allCards]
      : allCards.filter((card) => card.rarity === rarityValue)
    index = 0
    renderCards()
    updateSubtitle()
    update()
  }

  if (giRarityFilter) {
    const allRarities = ['SS', 'S', 'A', 'B', 'C']
    const availableRarities = allRarities.filter((rarity) => allCards.some((card) => card.rarity === rarity))

    giRarityFilter.innerHTML = '<option value="all">Все редкости</option>'
      + availableRarities.map((rarity) => `<option value="${rarity}">${rarity}</option>`).join('')

    giRarityFilter.addEventListener('change', () => {
      applyRarityFilter(giRarityFilter.value)
    })
  }

  giNext.addEventListener('click', () => {
    index = Math.min(index + 1, getMaxIndex())
    update()
  })

  giPrev.addEventListener('click', () => {
    index = Math.max(index - 1, 0)
    update()
  })

  window.addEventListener('resize', () => {
    cardsPerView = getGiCardsPerView()
    giViewport.style.setProperty('--cards-per-view', String(cardsPerView))
    index = Math.min(index, getMaxIndex())
    update()
  })

  giViewport.style.setProperty('--cards-per-view', String(cardsPerView))
  applyRarityFilter('all')
}

initGreedIslandSlider()
