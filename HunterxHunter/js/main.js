// RANDOM COLOR GENERATOR

const buttonsColor = document.querySelectorAll('.btn-color')
const javaScript = document.querySelector('#js-color')

const generateRandomColor = () => {
    const hexCodes = '0123456789ABCDEF'
    let color = ''
    for (let i = 0; i < 6; i++) {
        color += hexCodes[Math.floor(Math.random() * hexCodes.length)]
    }
    return '#' + color
}

const setRandomColors = () => {
    if (!javaScript || buttonsColor.length === 0) return

    buttonsColor.forEach((buttonColor) => {
        buttonColor.innerHTML = generateRandomColor()
        buttonColor.onclick = (event) => {
            javaScript.style.color = event.target.innerHTML
        }
    })
}

window.addEventListener('load', setRandomColors)
window.addEventListener('keydown', (event) => {
    if (event.code.toLowerCase() === 'space') {
        event.preventDefault()
        setRandomColors()
    }
})

// CHARACTERS + SLIDER ON MAIN PAGE

const charactersGrid = document.querySelector('#characters-grid')
const slider = document.querySelector('#characters-slider')
const next = document.querySelector('#next')
const prev = document.querySelector('#prev')
let currentVoiceAudio = null
let currentVoiceButton = null

const resolveImagePath = (path = '') => {
    if (typeof path !== 'string') return ''
    return path.startsWith('../images/') ? path.replace('../', '') : path
}

const getCardImage = (character) => resolveImagePath(character.photo)
const getSliderImage = (character) => resolveImagePath(character.photoFull || character.photoSlider || character.photo)

const createGridCard = (character) => {
    return `
        <article class="character-mini-card">
            <img src="${getCardImage(character)}" alt="${character.name}" class="character-mini-image">
            <div class="character-mini-info">
                <h4 class="character-mini-name">${character.name}</h4>
                <p class="character-mini-age">Возраст: ${character.age}</p>
            </div>
        </article>
    `
}

const createCharacterSlide = (character) => {
    const voiceClip = typeof character.voiceClip === 'string' ? character.voiceClip.trim() : ''
    const hasVoice = voiceClip.length > 0
    const slide = document.createElement('div')
    slide.className = 'slide'
    if (hasVoice) {
        slide.dataset.voiceClip = voiceClip
    }
    slide.innerHTML = `
        <div class="slide_card character-slide-card">
            <div class="character-slide-media">
                <img src="${getSliderImage(character)}" alt="${character.name}" class="character-slide-image">
            </div>
            <div class="character-slide-content">
                <h4 class="character-slide-title">${character.name}</h4>
                <p class="character-slide-age">Возраст: ${character.age}</p>
                <p class="character-slide-bio">${character.bio}</p>
                <button class="character-voice-btn" type="button" data-voice-btn ${hasVoice ? '' : 'disabled'}>
                    ${hasVoice ? 'Слушать голос из аниме' : 'Нет оригинальной озвучки'}
                </button>
            </div>
        </div>
    `
    return slide
}

const stopCurrentVoice = () => {
    if (currentVoiceAudio) {
        currentVoiceAudio.pause()
        currentVoiceAudio.currentTime = 0
    }
    if (currentVoiceButton) {
        currentVoiceButton.classList.remove('is-playing')
    }
    currentVoiceAudio = null
    currentVoiceButton = null
}

const playCharacterVoice = (slide, voiceButton) => {
    const voiceClip = slide.dataset.voiceClip
    if (!voiceClip) return

    const isSameButton = currentVoiceButton === voiceButton
    if (isSameButton) {
        stopCurrentVoice()
        return
    }

    stopCurrentVoice()

    const audio = new Audio(voiceClip)
    audio.preload = 'auto'
    audio.addEventListener('ended', stopCurrentVoice, { once: true })
    audio.addEventListener(
        'error',
        () => {
            stopCurrentVoice()
            console.warn(`Voice file not found: ${voiceClip}`)
        },
        { once: true }
    )

    currentVoiceAudio = audio
    currentVoiceButton = voiceButton
    voiceButton.classList.add('is-playing')
    audio.play().catch(() => {
        stopCurrentVoice()
    })
}

const renderCharacters = (characters) => {
    if (charactersGrid) {
        charactersGrid.innerHTML = characters.map(createGridCard).join('')
    }

    if (!slider || !next) return []

    slider.querySelectorAll('.slide').forEach((slide) => slide.remove())

    const slidesFragment = document.createDocumentFragment()
    characters.forEach((character) => {
        slidesFragment.appendChild(createCharacterSlide(character))
    })
    slider.insertBefore(slidesFragment, next)

    return slider.querySelectorAll('.slide')
}

const initSlider = (slides) => {
    if (!slides.length || !next || !prev) return

    let index = 0
    let isAnimating = false

    const clearMotionClasses = (slide) => {
        slide.classList.remove(
            'slide-enter-right',
            'slide-enter-left',
            'slide-exit-left',
            'slide-exit-right'
        )
    }

    const switchSlide = (newIndex, direction = 1) => {
        if (newIndex === index || isAnimating) return

        stopCurrentVoice()

        const currentSlide = slides[index]
        const nextSlide = slides[newIndex]
        const enterClass = direction > 0 ? 'slide-enter-right' : 'slide-enter-left'
        const exitClass = direction > 0 ? 'slide-exit-left' : 'slide-exit-right'

        isAnimating = true
        clearMotionClasses(currentSlide)
        clearMotionClasses(nextSlide)

        nextSlide.classList.add('active_slide')
        // Force reflow so CSS animations restart consistently on repeated direction switches.
        void nextSlide.offsetWidth
        nextSlide.classList.add(enterClass)
        currentSlide.classList.add(exitClass)

        let isFinished = false
        let fallbackId = null

        const finishAnimation = () => {
            if (isFinished) return
            isFinished = true

            if (fallbackId) clearTimeout(fallbackId)
            currentSlide.classList.remove('active_slide')
            clearMotionClasses(currentSlide)
            clearMotionClasses(nextSlide)
            index = newIndex
            isAnimating = false
        }

        currentSlide.addEventListener('animationend', finishAnimation, { once: true })
        fallbackId = setTimeout(finishAnimation, 900)
    }

    slides.forEach((slide, slideIndex) => {
        slide.classList.remove('active_slide')
        clearMotionClasses(slide)
        if (slideIndex === index) slide.classList.add('active_slide')
    })

    next.onclick = () => {
        const nextIndex = index < slides.length - 1 ? index + 1 : 0
        switchSlide(nextIndex, 1)
    }

    prev.onclick = () => {
        const prevIndex = index > 0 ? index - 1 : slides.length - 1
        switchSlide(prevIndex, -1)
    }

    slider?.addEventListener('click', (event) => {
        const target = event.target
        if (!(target instanceof HTMLElement)) return

        const voiceButton = target.closest('[data-voice-btn]')
        if (!voiceButton) return
        if (voiceButton.hasAttribute('disabled')) return

        const activeSlide = slider.querySelector('.slide.active_slide')
        if (!activeSlide) return

        playCharacterVoice(activeSlide, voiceButton)
    })
}

const loadCharacters = async () => {
    if (!charactersGrid && !slider) return

    try {
        const response = await fetch('data/characters.json')
        if (!response.ok) throw new Error(`Status ${response.status}`)

        const characters = await response.json()
        if (!Array.isArray(characters) || !characters.length) return

        const slides = renderCharacters(characters)
        initSlider(slides)
    } catch (error) {
        console.error('Failed to load characters for main page:', error)
    }
}

loadCharacters()
