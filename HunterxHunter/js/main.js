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
    const slide = document.createElement('div')
    slide.className = 'slide'
    slide.innerHTML = `
        <div class="slide_card character-slide-card">
            <div class="character-slide-media">
                <img src="${getSliderImage(character)}" alt="${character.name}" class="character-slide-image">
            </div>
            <div class="character-slide-content">
                <h4 class="character-slide-title">${character.name}</h4>
                <p class="character-slide-age">Возраст: ${character.age}</p>
                <p class="character-slide-bio">${character.bio}</p>
            </div>
        </div>
    `
    return slide
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
    let autoSliderId = null
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

    const startAutoSlider = () => {
        if (autoSliderId) clearInterval(autoSliderId)

        autoSliderId = setInterval(() => {
            if (isAnimating) return
            const nextIndex = index < slides.length - 1 ? index + 1 : 0
            switchSlide(nextIndex, 1)
        }, 6500)
    }

    slides.forEach((slide, slideIndex) => {
        slide.classList.remove('active_slide')
        clearMotionClasses(slide)
        if (slideIndex === index) slide.classList.add('active_slide')
    })

    next.onclick = () => {
        const nextIndex = index < slides.length - 1 ? index + 1 : 0
        switchSlide(nextIndex, 1)
        startAutoSlider()
    }

    prev.onclick = () => {
        const prevIndex = index > 0 ? index - 1 : slides.length - 1
        switchSlide(prevIndex, -1)
        startAutoSlider()
    }

    startAutoSlider()
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
